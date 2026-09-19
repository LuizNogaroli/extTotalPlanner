# Servidor de Teste Local (rodar.bat)

**Data/Hora:** 2026-09-19_01:30
**Responsável:** User & Claude Code

## O que foi feito
Criado `rodar.bat` na raiz do projeto: um servidor HTTP local auto-contido para testar o app extPlanner no navegador comum (sem precisar carregar como extensão Chrome). Características:
- Sobe em `http://localhost:8000` e abre o navegador automaticamente (`start`).
- Embute o código do servidor Python em **Base64** dentro de um `powershell -Command` que decodifica e grava `server.py` temporário, depois roda `python server.py` (com fallback `py`).
- O servidor envia `Cache-Control: no-store` em todas as respostas e força `Content-Type: text/javascript` para arquivos `.js` (evita a armadilha de cache do `http.server` — ver MANUAL_TECNICO 3.11/3.16).
- A janela do `cmd` fica aberta com título "extPlanner Servidor" (para parar, Ctrl+C).

## Por quê
O app é extensão Chrome (newtab override) que usa `chrome.storage.local`. Validar mudanças no navegador comum exige um servidor HTTP, e o `python -m http.server` padrão tem cache agressivo que esconde correções de JS. O `rodar.bat` resolve isso num clique.

## Estado Anterior
Não havia forma trivial de testar ponta-a-ponta no navegador; era preciso carregar a pasta como extensão ou rodar `python -m http.server` manualmente (com os problemas de cache de 3.11).

## Estado Novo
`rodar.bat` sobe o app em `localhost:8000` com cache desativado, pronto para validação visual. Neste modo o `StorageService` usa `localStorage` (fallback), namespace separado do `chrome.storage.local` da extensão.

## Plano de Rollback
Remover `rodar.bat` (e o `server.py` que ele cria em `%TEMP%`) da raiz. Para voltar ao teste manual, basta `python -m http.server` no diretório (ciente da armadilha de cache 3.11) ou carregar a pasta como extensão no `chrome://extensions`.
