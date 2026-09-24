# Citação/Devocional: Botão + Modal, com Modo Aleatório/Fixada/Omitir Versionado por Data

**Data/Hora:** 2026-09-24_04:00
**Responsável:** Claude Code (Sonnet 5) & User

## O que foi feito

Os widgets "✨ Citação" (Motivacional) e "🙏 Devocional" da página do dia deixam de mostrar um texto sorteado direto na caixa. Cada um agora:

1. Mostra um **botão** ("Ver Citação do Dia" / "Ver Devocional do Dia") que abre um **modal** com o texto completo da mensagem em vigor.
2. Tem uma engrenagem ⚙️ própria que abre um modal de configuração com 3 modos:
   - **Aleatório** — sorteia uma mensagem diferente a cada carregamento do dia (comportamento antigo, agora atrás de um clique).
   - **Fixada** — o usuário informa o ID de uma mensagem específica (visível na lista de "Gerenciar"); a partir de hoje, o box sempre mostra essa mensagem.
   - **Omitir** — esconde o box.
3. O modo escolhido é uma **linha do tempo de marcos** por tipo (`planner_citacao_config`), não um valor único: trocar hoje não reescreve dias passados.

## Por que — como o pedido evoluiu

Pedido inicial do usuário: "podemos transformar o espaço 'Devocional' e 'Motivacional' em botões que abrirão um modal com a referida citação [...] ele pode anotar o ID dessa citação e inserir num lugar predeterminado na página do dia".

Ao confirmar a lógica antes de implementar, ficou claro que o modelo mudaria: não seria um ID por dia, e sim algo que "passa a valer para todos os dias a seguir" — perguntas de esclarecimento levaram a um modelo de **vigência por data** (cada troca cria um marco a partir de hoje; dias passados continuam com o marco antigo), confirmado pelo usuário.

Só então, ao dar mais um passo, o usuário revelou a necessidade real: cada box precisa de **3 opções de configuração** — Aleatório, Fixada (com "Trocar") e Omitir — e não apenas "fixar/retirar" como uma suposição inicial havia levantado. Perguntas adicionais confirmaram: (1) o modo também é versionado por data, igual ao ID; (2) o controle fica no próprio box (engrenagem), não em Configurações; (3) o checkbox antigo de mostrar/esconder em Configurações é substituído pelo modo Omitir.

## Estado Anterior

- Os boxes mostravam o texto da citação/devocional **diretamente**, sorteado a cada abertura do dia (`renderWidgetState('motivacional'/'devocional')`, dentro do `window.widgetState` genérico compartilhado com `historico`).
- Configurações (`#view-settings`) tinha checkboxes simples "Motivacional"/"Devocional" (mostrar/esconder), sem histórico e sem modo Fixada.
- Não havia como escolher uma mensagem específica, nem ver o ID de uma citação/devocional na tela.

## Estado Novo

### Modelo de dados
```js
// planner_citacao_config = { motivacional: [marco, ...], devocional: [marco, ...] }
{ modo: 'aleatorio' | 'fixada' | 'omitir', id: string | null, dataInicio: 'YYYY-MM-DD' }
```
`resolveCitacaoMarker(markers, dataStr)` (`js/app.js`) acha o marco de maior `dataInicio` que não seja no futuro relativo à data pedida. Trocar o modo hoje empilha um marco novo (`dataInicio = hoje`, sempre a data real, não a do dia visualizado); nenhum marco é apagado ou reescrito.

### Novos elementos de UI (`index.html`)
- Boxes ganham um cabeçalho com título + botão `.btn-citacao-gear` (engrenagem).
- `#global-citacao-modal`: mostra o texto completo da citação/devocional em vigor.
- `#global-citacao-config-modal`: 3 radios (Aleatório/Fixada/Omitir) + campo de ID (só visível em Fixada) + validação inline.
- Menu lateral (Recursos): dois links novos, "✨ Citações Motivacionais" e "🙏 Passagens Devocionais" (ver bug abaixo).

### Novo código (`js/app.js`, seção "CITAÇÃO / DEVOCIONAL")
`resolveCitacaoMarker()`, `addCitacaoMarker()`, `renderCitacaoWidget()`, `openCitacaoModal()`, `openCitacaoConfigModal()` e os listeners de clique (delegados para os botões recriados a cada render, diretos para a engrenagem e o modal de config, que são estáticos no HTML).

### `js/services/ContentService.js`
Novos `getMotivacionalById(id)` / `getDevocionalById(id)`, usados pelo modo Fixada e pela validação do ID no modal de configuração.

## Dois bugs pré-existentes achados e corrigidos no processo

Sem eles, a funcionalidade não teria como ser usada de ponta a ponta — por isso entraram no escopo desta mudança.

### 1. `crud/formMappers.js`: Motivacional/Devocional nunca salvavam nada

`fields`/`requires` de `motivacional` citavam `titulo`/`descricao`/`tipo`/`data`; os de `devocional` citavam `data`/`oracoes`. Nenhum desses campos existe em `form-motivacional`/`form-devocional` (`index.html`), cujos campos reais são `citacao`/`autor` e `passagem`/`reflexao`. `FormLoaders.extractFormData()` pula silenciosamente (`if (!input) continue`) qualquer campo do registro que não exista no DOM, então o `formData` extraído nunca tinha o campo exigido por `requires` — a validação falhava e `handleSubmit` retornava sem salvar. Como os dois formulários também não têm `<span class="form-error">` com os nomes certos, nada aparecia na tela: o "Salvar" simplesmente não fazia nada, sem erro visível.

**Verificado no navegador:** antes da correção, preencher e clicar "Salvar" no modal de "Novo Item Motivacional" não alterava `localStorage.planner_motivacional`, e o modal continuava aberto sem nenhum aviso.

Corrigido alinhando `fields`/`requires` aos IDs reais do HTML (ver `formMappers.js`). O mesmo padrão de bug existe em `historico` (`data`/`titulo`/`descricao`/`tipo` vs. os reais `date`/`fato`) — **não corrigido agora**, por estar fora do escopo desta mudança; anotado em `docs/pendencias.md` item 1.8.

### 2. Gerenciadores de Motivacional/Devocional eram inalcançáveis

`window.appRouter.openManager('motivacional'/'devocional')` já existia e sempre funcionou, mas **nenhum item de menu chamava essas funções** — não havia como abrir a lista, cadastrar um item ou ver o ID de nada. Adicionados dois links no grupo Recursos do menu lateral, no mesmo padrão de "⏰ Alarmes". Sem isso, o modo Fixada não teria como ser usado (impossível descobrir um ID).

## Outras mudanças

- `renderManagerList()` (`js/app.js`) agora mostra o `id` de cada item de Motivacional/Devocional, com um botão "📋 copiar" (`navigator.clipboard.writeText`, com `alert()` de fallback).
- Checkboxes "Motivacional"/"Devocional" removidas de `#view-settings`; texto explicativo adicionado no lugar. `planner_settings` só guarda mais `habitos`/`historico`/`compras`.
- `window.renderWidgetState`/`window.cycleWidget` (infraestrutura genérica antiga) simplificados para só cuidar de `historico`, que continua usando o sorteio inline sem botão/modal (fora do escopo desta mudança).

## Testado no navegador (`rodar.bat` / preview local)

1. Criada uma citação motivacional e um devocional de teste via os novos links do menu (confirma a correção do bug nº 1).
2. Dia sem configuração prévia → modo Aleatório, botão abre modal com o texto sorteado correto.
3. Engrenagem → Fixada → ID inexistente → erro inline "Nenhuma mensagem encontrada com o ID [...]", não salva.
4. Fixada com ID correto → salva, aplica imediatamente (sem reload) e mostra badge "📌 Fixada"; botão abre modal com a mensagem certa.
5. Reabrir um dia **anterior** à data da troca → mostra "🎲 Aleatório" (o marco novo não afeta o passado).
6. Omitir no box Motivacional → box some da tela; box Devocional continua normal (configuração independente por tipo).
7. Nenhum erro no console em nenhum dos passos.

## Plano de Rollback

1. Em `index.html`: reverter os dois boxes para a versão com `<div id="widget-*-content">` simples (sem engrenagem), remover os dois modais novos (`global-citacao-modal`, `global-citacao-config-modal`), remover os 2 links de menu em Recursos, e devolver as checkboxes de Motivacional/Devocional em `#view-settings`.
2. Em `js/app.js`: remover a seção "CITAÇÃO / DEVOCIONAL" inteira; restaurar o bloco `if (settings.motivacional) {...} / if (settings.devocional) {...}` usando `window.renderWidgetState`, e devolver `motivacional`/`devocional` a `window.widgetState`/`settingsCheckboxes`/aos defaults de `planner_settings`.
3. Em `js/services/ContentService.js`: remover `getMotivacionalById`/`getDevocionalById`.
4. Em `js/modules/crud/formMappers.js`: **não reverter** o schema de `motivacional`/`devocional` — a correção desses campos é um bug fix independente, útil mesmo sem esta funcionalidade (sem ela, o "+ Novo Item" desses dois tipos volta a não salvar nada).
5. Apagar a chave `planner_citacao_config` do storage, se existir.
