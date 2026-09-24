# Revisão do `rodar.bat` (Servidor de Teste Local)

**Data/Hora:** 2026-09-24_02:00
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

O `rodar.bat` foi verificado a pedido do usuário ("verifique se temos o arquivo rodar.bat e se o seu conteúdo está adequado"). O arquivo existia, mas tinha dois defeitos reais, comprovados em teste, e alguns riscos menores. O servidor embutido foi reescrito, e o `.bat` foi regravado mantendo o desenho de arquivo único da §3.16.

## Estado Anterior (verificação)

| # | Ponto | Como foi verificado | Resultado |
| :---: | :--- | :--- | :--- |
| 1 | Servidor `socketserver.TCPServer`, que atende **uma conexão por vez** | O servidor original decodificado do Base64 foi rodado e a página carregada no navegador | ❌ **Travou:** parou em 3 requisições (`/`, `HEAD /`, `tailwind.css`) por mais de 10 s; nenhum JS carregou. O Chrome abre conexões "de reserva" ociosas, e o servidor fica preso esperando por elas. |
| 2 | `allow_reuse_address = True` no Windows | Dois sockets com `SO_REUSEADDR` na mesma porta | ❌ **O 2º servidor também escutou a porta, sem erro.** Com outro projeto na 8000 (já aconteceu nesta máquina), o `rodar.bat` "subia" e o navegador podia mostrar o site errado. |
| 3 | Quebras de linha só LF | Leitura dos bytes do arquivo | ⚠️ O `cmd.exe` espera CRLF em `.bat`. Sem sintoma hoje, mas é uma fonte conhecida de erros de parse. |
| 4 | `where python` | `where python` / `where py` | ⚠️ Nesta máquina acha o Python real. Em outras, pode achar o atalho da Microsoft Store. |
| 5 | Navegador aberto após `timeout /t 2` fixo | Leitura | ⚠️ Condição de corrida: se o servidor demorar mais de 2 s, o navegador abre antes dele. |
| 6 | Escuta em `0.0.0.0` | Leitura | ⚠️ Deixa os arquivos visíveis na rede local e aciona o aviso do firewall do Windows. Desnecessário para teste local. |
| — | `Cache-Control: no-store`, MIME `text/javascript`, `<nul` no PowerShell, só ASCII | Leitura e decodificação | ✅ Corretos. Mantidos. |

## Estado Novo

- **Servidor:**
  - `ThreadingHTTPServer`, com uma thread por conexão (`daemon_threads`);
  - começa na porta 8000 (ou na passada como argumento) e, se estiver ocupada, tenta até 20 portas seguintes;
  - antes de ocupar, **sonda** se alguém já atende a porta em 127.0.0.1 e ::1. Só o erro do `bind` não basta no Windows: se o outro servidor usou `SO_REUSEADDR`, o bind num endereço mais específico é aceito;
  - sem `SO_REUSEADDR` e com `SO_EXCLUSIVEADDRUSE`;
  - escuta só em `127.0.0.1`;
  - abre o navegador (`webbrowser.open`) depois de estar pronto;
  - se a porta mudou, avisa que os dados de teste da 8000 não aparecem na porta nova, porque o `localStorage` é por porta.
- **`.bat`:**
  - Python pelo lançador `py -3`, com fallback para `python` testado com `--version`, o que descarta o atalho da Store;
  - mensagem clara se não houver Python;
  - servidor iniciado com `cmd /k`, para a janela continuar aberta se der erro;
  - comentários explicando cada decisão;
  - gravado com **CRLF** e só **ASCII** (§3.9).
- **Mantido:** o arquivo continua único, com o servidor em Base64 decodificado pelo PowerShell, conforme o desenho da §3.16.

## Código-fonte do servidor embutido

É o conteúdo que o `rodar.bat` grava em `%TEMP%\extplanner_server.py`. Para alterar o servidor:
1. edite este código;
2. gere o Base64 (`base64.b64encode(fonte.encode('ascii'))`);
3. substitua a string dentro de `FromBase64String('...')` no `.bat`.

Mantenha tudo em ASCII, porque o PowerShell decodifica como ASCII.

```python
import http.server, socket, sys, webbrowser

# Porta inicial (padrao 8000; pode ser passada como argumento). Se estiver ocupada, tenta as seguintes.
PORTA_INICIAL = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
TENTATIVAS = 20
ABRIR_NAVEGADOR = '--sem-navegador' not in sys.argv


class Handler(http.server.SimpleHTTPRequestHandler):
    # no-store: o navegador nunca reaproveita JS/CSS antigo (MANUAL_TECNICO 3.11)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    # <script type="module"> exige MIME de JavaScript
    def guess_type(self, path):
        if path.endswith(('.js', '.mjs')):
            return 'text/javascript'
        return super().guess_type(path)


class Servidor(http.server.ThreadingHTTPServer):
    # Uma thread por conexao: o Chrome abre conexoes "de reserva" que ficam ociosas,
    # e um servidor de thread unica trava esperando por elas (pagina fica sem JS).
    daemon_threads = True
    # No Windows, SO_REUSEADDR deixa DOIS servidores escutarem a mesma porta sem erro.
    allow_reuse_address = False

    def server_bind(self):
        # E SO_EXCLUSIVEADDRUSE impede que outro servidor se instale depois em cima deste.
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def porta_em_uso(porta):
    # Testa se ALGUEM ja atende a porta. So o erro do bind nao basta: no Windows, se o
    # outro servidor usou SO_REUSEADDR, o bind num endereco mais especifico e aceito.
    # Testa tambem ::1 porque "localhost" pode resolver para IPv6.
    for host in ('127.0.0.1', '::1'):
        try:
            with socket.create_connection((host, porta), timeout=0.3):
                return True
        except OSError:
            pass
    return False


servidor = None
for porta in range(PORTA_INICIAL, PORTA_INICIAL + TENTATIVAS):
    if porta_em_uso(porta):
        print('Porta %d ocupada, tentando a proxima...' % porta)
        continue
    try:
        # So o proprio computador acessa (nao expoe os arquivos na rede nem aciona o firewall)
        servidor = Servidor(('127.0.0.1', porta), Handler)
        break
    except OSError:
        print('Porta %d ocupada, tentando a proxima...' % porta)

if servidor is None:
    print('ERRO: nenhuma porta livre entre %d e %d.' % (PORTA_INICIAL, PORTA_INICIAL + TENTATIVAS - 1))
    sys.exit(1)

url = 'http://localhost:%d/' % porta
print('')
print('extPlanner rodando em %s' % url)
if porta != PORTA_INICIAL:
    print('ATENCAO: a porta %d estava ocupada. Os dados de teste (localStorage) sao por porta,' % PORTA_INICIAL)
    print('         entao os itens salvos em localhost:%d nao aparecem nesta porta.' % PORTA_INICIAL)
print('Para parar: feche esta janela ou pressione Ctrl+C.')
print('')

if ABRIR_NAVEGADOR:
    webbrowser.open(url)
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    print('Servidor encerrado.')
```

## Ficheiros Afetados

- `rodar.bat`, reescrito.

## Validação

- ✅ **Carregamento:** com o novo servidor, a página carregou completa: 13 arquivos JS, `window.appRouter` presente, 7 dias no sub-header e o breadcrumb.
- ✅ **Porta ocupada:** com um servidor intruso (`SO_REUSEADDR`) na 8050, o novo servidor detectou, avisou e subiu na 8051.
- ✅ **Cabeçalhos:** `Content-Type: text/javascript` e `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
- ✅ **Rede:** não acessível pelo IP da rede local (192.168.15.9).
- ✅ **Intruso posterior:** com um intruso instalado **depois** em `0.0.0.0` na mesma porta, quem responde em 127.0.0.1 é sempre o nosso servidor (3 de 3). O endereço mais específico ganha.
- ✅ **`cmd.exe` real:** a cópia de teste do `.bat`, trocando só o `start` por verificações, detectou `py -3`, decodificou o servidor, e o resultado é **idêntico byte a byte** ao testado.
- ✅ **Arquivo:** CRLF em todas as 51 linhas; só ASCII.
- ⚠️ **Não executado de ponta a ponta nesta sessão:** o `rodar.bat` completo, porque ele abriria uma janela e o navegador padrão na área de trabalho do usuário. Para conferir, basta dar dois cliques nele.

## Plano de Rollback / Desfazer

`git checkout HEAD -- rodar.bat` restaura a versão anterior, com servidor de thread única e porta fixa 8000.

## Notas Importantes

- Existe outro `rodar.bat` dentro de `ext-planner/`, a pasta paralela não versionada que o usuário pediu para não mexer. Ele não foi alterado.
- A mensagem final do `.bat` agora diz para recarregar com **F5**, e não mais Ctrl+Shift+R. Com `Cache-Control: no-store`, o navegador não reaproveita JS antigo, então a recarga normal basta.
