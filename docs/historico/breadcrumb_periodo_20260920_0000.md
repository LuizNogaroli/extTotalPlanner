# Breadcrumb de Navegação Ano › Mês › Semana no Cabeçalho dos Planos

**Data/Hora:** 2026-09-20_0000
**Responsável:** Claude Code (Sonnet 5) & User

## Contexto

O usuário precisava navegar entre ano atual/anteriores, mês atual/anteriores e semanas dentro do mês, para os Planos Anual/Mensal/Semanal. Uma tentativa anterior (timeline no menu lateral, `sidebar-timeline`) não agradou. Pediu uma solução no cabeçalho, cogitando breadcrumbs "Ano > Mês > Semana", com atenção a layout responsivo.

Antes de implementar, foi apresentado um mockup interativo (Artifact) comparando desktop (breadcrumb com dropdowns por segmento) vs. mobile (botão único colapsado abrindo um painel com os 3 níveis empilhados). O usuário aprovou essa direção.

## Bug pré-existente descoberto e corrigido

`getPeriodoKey()`/`getPeriodoLabel()` (introduzidas para o esquema "texto único versionado" de Missão/Visão/Planos) nunca tratavam `granularidade === 'semana'` — caíam no `return String(d.getFullYear())` do fim da função. Na prática, o Plano Semanal sempre agrupava por **ano**, não por semana. Corrigido reaproveitando o mesmo cálculo de semana (domingo-sábado) já usado por `getWeekNumber()`/`getWeekDates()` em `header-week-tabs`, para não introduzir uma segunda numeração de semana divergente no app. Chave gerada: `"2026-w38"`.

## O que foi feito

1. **`getPeriodoPaiKeys(semanaKey)`**: deriva as chaves de ano e mês "pai" de uma chave de semana, para o breadcrumb saber a que ano/mês uma semana pertence.
2. **`getSemanasDoMes(mesKey)`**: lista todas as chaves de semana que tocam um mês civil, calculadas matematicamente (não dependem de haver registros).
3. **`renderPeriodoBreadcrumb(tipoAtivo, periodoSelecionado, granularidadeAtiva)`**: substitui a antiga barra plana de botões (`.plano-periodo-btn`, um nível por vez) por um breadcrumb `2026 › Set › Sem. 38` sempre com os 3 níveis simultâneos. Cada segmento abre um dropdown com as opções irmãs (outros anos com dados; os 12 meses do ano; as semanas do mês). Clicar numa opção navega direto para o Plano correspondente (anual/mensal/semanal) já naquele período — não é preciso primeiro ir ao menu lateral trocar de Plano.
4. **Responsivo**: abaixo do breakpoint `md` (768px) os 3 segmentos colapsam num botão único (`Set 2026 · Sem. 38 ▾`) que abre um painel com os três níveis empilhados (mesma lista de opções, layout vertical).
5. **Fix de posicionamento (overflow)**: a div central do cabeçalho tem `overflow-x-auto`. Pela spec do CSS, definir `overflow-x` diferente de `visible` sem definir `overflow-y` explicitamente faz o navegador computar `overflow-y: auto` também — isso cortava silenciosamente qualquer dropdown `position: absolute` filho, mesmo com o dropdown corretamente populado e sem classe `hidden` (confirmado via `getBoundingClientRect()`, que retornava coordenadas válidas para um elemento invisível na tela). Solução: os dropdowns e o painel mobile são anexados a um container `#periodo-dropdown-root` direto no `<body>` (criado sob demanda por `getPeriodoDropdownRoot()`), com `position: fixed` e posição calculada via `getBoundingClientRect()` do gatilho clicado — escapando do overflow do ancestral. Inclui clamp para não deixar o painel cortado nas bordas em telas estreitas.
6. **Fix real em `switchToPlanosView(prazo, periodoForcado)`**: a função sempre resetava `planosPeriodoSelecionado[tipo]` para o período atual, ignorando qualquer seleção explícita. Isso fazia clicar em qualquer opção do dropdown do breadcrumb sempre voltar para o período atual, silenciosamente. Adicionado parâmetro opcional `periodoForcado` — quando informado (uso do breadcrumb), é usado em vez do período atual.
7. **Fix de crash em `renderPlanoVersionado()`**: `grupos[periodoSelecionado].sort(...)` quebrava com `TypeError: Cannot read properties of undefined (reading 'sort')` sempre que o breadcrumb apontava para um período sem nenhum registro (ex.: uma semana futura vazia). Só o período *atual* tinha essa proteção (`if (!grupos[periodoAtualKey]) grupos[periodoAtualKey] = []`); estendido para `periodoSelecionado` também.
8. **`hideAllViews()`** agora limpa três coisas antes de cada troca de view: `header-periodo-buttons`, `header-week-tabs` (que competiam pelo mesmo espaço central do cabeçalho e ficavam "grudados" um no outro) e o novo `#periodo-dropdown-root`.

## Armadilha de cache do módulo JS (retrospecto de debugging)

Durante a implementação, um `console.error` de debug inserido no código não aparecia no console mesmo após `Ctrl+Shift+R`. Confirmado via `fetch('/js/app.js', {cache: 'no-store'})` que o servidor já tinha o arquivo atualizado — o problema era especificamente o cache do `<script type="module">` no navegador, que sobrevive a um hard reload comum. Solução: fechar a aba e abrir uma nova (reforça o padrão já documentado na seção 3.11 do manual, mas evidencia que hard reload nem sempre é suficiente — módulos ES6 têm cache próprio mais agressivo que scripts comuns).

## Validação

- ✅ Bug de agrupamento por ano→semana corrigido; `getPeriodoKey(ts, 'semana')` retorna `"2026-w38"` consistente com `header-week-tabs`
- ✅ Breadcrumb aparece em Plano Anual/Mensal/Semanal com os 3 segmentos corretos
- ✅ Dropdown de Ano mostra anos com dados + ano atual, com destaque "(atual)"
- ✅ Dropdown de Mês mostra os 12 meses do ano ativo, esmaecendo os sem dados
- ✅ Dropdown de Semana mostra as semanas do mês ativo, esmaecendo as sem dados
- ✅ Clicar numa opção de qualquer nível navega para o Plano certo, no período certo (testado Ano→Mensal→Semanal cruzados)
- ✅ Botão "Atualizar" só aparece no período atual; períodos passados/futuros ficam somente leitura
- ✅ Mobile (375px): breadcrumb colapsa em botão único; painel abre sem cortar nas bordas
- ✅ Trocar para Missão/Dashboard/Atividades limpa corretamente os containers do cabeçalho, sem sobreposição
- ✅ Nenhum erro no console em nenhum dos fluxos testados

## Arquivos Afetados

- `js/app.js`: `getPeriodoKey`/`getPeriodoLabel` (fix semana), `getPeriodoPaiKeys`, `getSemanasDoMes`, `getPeriodoDropdownRoot`, `renderPeriodoBreadcrumb` (nova), `renderPlanoVersionado` (troca da barra antiga pelo breadcrumb + fix do sort), `switchToPlanosView` (parâmetro `periodoForcado`), `hideAllViews` (limpeza dos 3 containers), `window.appRouter.switchToPlanosView` (repassa `periodoForcado`)

## Plano de Rollback

`git revert 2ebd037` no repositório `https://github.com/LuizNogaroli/extTotalPlanner` restaura a barra de botões de período antiga (um nível só, sem breadcrumb). Os bugs de `getPeriodoKey`/`switchToPlanosView`/`sort()` descritos acima voltariam a existir — não são bugs introduzidos por esta mudança, mas pré-existentes que só se tornaram visíveis ao tentar navegar pela semana.

## Próximas Melhorias Opcionais

- `sidebar-timeline` (mencionada pelo usuário como tentativa anterior que não agradou) continua com código morto em `app.js` (função com guarda de segurança, nunca quebra, mas nunca renderiza nada porque o elemento não existe no HTML). Pode ser removida em uma limpeza futura se não houver intenção de retomar essa abordagem.
- O breadcrumb sempre mostra os 12 meses do ano e todas as semanas do mês, mesmo sem dados — é o comportamento de um seletor de data normal, mas se a lista de anos crescer muito (vários anos de uso), pode valer paginar ou agrupar por década.
