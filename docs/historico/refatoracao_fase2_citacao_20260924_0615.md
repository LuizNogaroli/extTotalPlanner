# Refatoração do `app.js` — Fase 2: módulo `citacao.js`

**Data/Hora:** 2026-09-24_06:15
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Fase 2 do plano em `docs/plano_refatoracao_appjs.md`: todo o código dos boxes "✨ Citação" e "🙏 Devocional" da página do dia (criado na v1.47, `MANUAL_TECNICO.md` §3.26) saiu de `js/app.js` para o novo `js/modules/citacao.js`.

O módulo exporta:
- `initCitacao({ getDataDoDiaAberto })` — chamado uma vez no boot; pega as referências do DOM e registra os listeners dos boxes, do modal da mensagem e do modal de configuração.
- `renderCitacaoWidget(tipo, dataStr)` — chamado por `openDailyView()` para os dois boxes, como antes.
- `resolveCitacaoMarker(markers, dataStr)` — função pura, exportada para poder ser testada isoladamente.

## Por que

Seguir o plano de dividir o `app.js` (que passou de 3.000 linhas) em módulos, começando pelas partes mais isoladas. O código de Citação já nasceu num bloco próprio, com poucas dependências, então era o candidato natural logo depois dos utilitários puros de data (Fase 1).

## Estado Anterior

- Seção "CITAÇÃO / DEVOCIONAL" dentro da closure `DOMContentLoaded` de `app.js` (~185 linhas): referências ao DOM, `citacaoConfigTipoAtual`, `toLocalDateStr`, `resolveCitacaoMarker`, `addCitacaoMarker`, `renderCitacaoWidget`, `openCitacaoModal`, `openCitacaoConfigModal` e os listeners.
- O item exibido em cada box ficava em `window.widgetState[tipo]` (`{ list, index }`) — um objeto global dividido com o widget de Histórico. O clique em "Ver" lia de lá.
- O handler de "Salvar" da configuração lia `currentDailyDateStr` direto da closure.
- `app.js`: **3.277 linhas**.

## Estado Novo

- `js/modules/citacao.js` (212 linhas). Mesma lógica; as mudanças são só de estrutura:
  1. **Estado interno:** o item exibido em cada box fica em `itemExibido[tipo]` (o próprio item, não `{ list, index }`), dentro do módulo. O `window.widgetState` passou a ter só a entrada `historico`, que é quem ainda o usa.
  2. **DOM:** as referências são obtidas dentro de `initCitacao()`, não quando o arquivo é carregado.
  3. **Data do dia aberto:** continua morando em `app.js` (`currentDailyDateStr`) até a Fase 7; o módulo a lê pelo getter recebido em `initCitacao({ getDataDoDiaAberto: () => currentDailyDateStr })`.
  4. **Escape de HTML:** importa `esc` de `listaCompras.js` direto (em `app.js` ele era importado com o apelido `escCompras`).
- `toLocalDateStr` foi para `js/modules/dateUtils.js`, e não para `citacao.js` como a tabela do plano previa: é uma função pura de data, então mora com as outras.
- Em `app.js`, a seção virou um comentário e uma linha — `initCitacao({ getDataDoDiaAberto: () => currentDailyDateStr })` —, e ganhou o `import` no topo. A chamada em `openDailyView()` não mudou.
- `app.js`: **3.100 linhas** (−177).
- `index.html`: sem mudança.

A troca do bloco em `app.js` foi feita por faixa de linhas, com um script em Node que confere as bordas esperadas antes de gravar, para preservar o BOM e as quebras CRLF do arquivo e não depender de casar um texto longo cheio de emojis (onde o `Edit` já falhou por bytes invisíveis no `index.html`).

## Verificação

Antes de mexer no código, foi tirado um retrato do comportamento no navegador: o que cada box mostrava nos dias 20/09 e 24/09 com a configuração salva. Depois da mudança, no preview local:

- Dias 20/09 e 24/09: **idênticos ao retrato** (20/09: os dois em "🎲 Aleatório"; 24/09: Citação omitida, Devocional em "🎲 Aleatório").
- "Ver" nos dois boxes abre a mensagem certa ("A persistência é o caminho do êxito." — Chaplin; Salmos 23:1), agora a partir do estado interno do módulo; o modal fecha no ×.
- Engrenagem do Devocional: abre com "Configurar Devocional", o texto de vigência de hoje e o modo vigente marcado.
- Fixada: mostra o campo de ID; recusa ID vazio ("Informe o ID da mensagem.") e inexistente ("Nenhuma mensagem encontrada com o ID …") sem fechar o modal; com ID válido, salva, fecha e **redesenha na hora o dia aberto** com "📌 Fixada" — o que confirma o getter da data. Reabrir a engrenagem mostra Fixada marcada e o ID preenchido.
- Omitir: esconde o campo de ID e, ao salvar, esconde o box.
- Dia anterior (20/09): continua em "🎲 Aleatório".
- Mensagem fixada que não existe mais: aparece o aviso, não aparece o botão "Ver", e "⚙️ Escolher outra" abre a configuração.
- `citacao.js` carregado (200), nenhum erro no console. A configuração usada nos testes foi restaurada ao valor exato de antes.

## Achado durante o trabalho

**Depois de "Omitir", não há como desfazer pela tela** (`pendencias.md` 1.9). O Omitir esconde o box inteiro, inclusive a engrenagem, que é o único lugar onde o modo é configurado. O único caminho é abrir um dia anterior ao marco, onde o box ainda aparece. É uma falha de desenho da v1.47, e não da refatoração. Não foi corrigida aqui porque esta fase só pode mover código, sem mudar comportamento. As correções sugeridas estão no item.

## Plano de Rollback

Reverter o commit desta mudança. Manualmente: colar de volta em `app.js` a seção "CITAÇÃO / DEVOCIONAL" que existia antes (disponível no commit anterior, `git show HEAD~1:js/app.js`), tirar o `import` de `citacao.js`, devolver os stubs `motivacional`/`devocional` ao `window.widgetState` e apagar `js/modules/citacao.js`. `toLocalDateStr` pode ficar em `dateUtils.js`, sem prejuízo.
