# Breadcrumb Estendido ao Dashboard + Dias no Sub-header + Semana Navega para Plano Semanal

**Data/Hora:** 2026-09-20_0100
**Responsável:** Claude Code (Sonnet 5) & User

## Contexto

Sequência de três ajustes solicitados pelo usuário logo após a primeira versão do breadcrumb de período (ver `breadcrumb_periodo_20260920_0000.md`), todos testados e commitados separadamente no mesmo bloco de trabalho.

## 1. Breadcrumb estendido para a tela inicial (Dashboard/"Meu Planner")

Até então o breadcrumb `Ano › Mês › Semana` só existia dentro de `renderPlanoVersionado()`, ou seja, apenas nas páginas de Plano — na tela inicial o cabeçalho mostrava só o número da semana isolado (`w38`) e os 7 dias. O usuário pediu que o breadcrumb aparecesse também na index.

**Decisão de comportamento** (perguntada explicitamente ao usuário antes de implementar): no Dashboard, escolher uma opção de **Ano** ou **Mês** no breadcrumb troca a semana exibida na própria tela (chama `window.appRouter.goWeekly(data)`), sem sair da tela — diferente do comportamento nas páginas de Plano, onde qualquer nível navega para o Plano correspondente. Isso exigiu generalizar `renderPeriodoBreadcrumb()`: ela deixou de hardcodar a chamada a `switchToPlanosView` e passou a receber um terceiro parâmetro, `onSelecionar(key)`, que cada chamador (Dashboard vs. Planos) implementa com o comportamento que faz sentido no seu contexto.

### Bug de escopo descoberto no processo

As funções auxiliares de período (`getPeriodoKey`, `getPeriodoLabel`, `getPeriodoPaiKeys`, `getSemanasDoMes`, `renderPeriodoBreadcrumb`, `getPeriodoDropdownRoot`) tinham sido criadas dentro do closure do `document.addEventListener('DOMContentLoaded', ...)`. Só que `renderWeeklyGrid()` — de onde precisavam ser chamadas para popular o breadcrumb do Dashboard — é uma `function` declarada no nível superior do módulo, **fora** desse closure. Uma function declaration de nível superior não enxerga variáveis/funções de um closure onde não foi definida, então a primeira tentativa gerou `ReferenceError` na carga do Dashboard.

**Solução:** todo o bloco de funções auxiliares de período foi movido para o nível superior do módulo (mesmo escopo de `getWeekNumber`/`getWeekDates`/`renderWeeklyGrid`), que já continha funções desse tipo. Funções dentro do closure (como `renderPlanoVersionado`) continuam enxergando essas funções normalmente — um closure interno sempre vê o escopo externo, só não o contrário.

Por esse mesmo motivo, o callback usado no Dashboard não pôde chamar `switchToWeeklyView()` (também dentro do closure) diretamente — usa `window.appRouter.goWeekly(alvo)` (o mesmo `switchToWeeklyView`, já exposto globalmente para outros usos).

### Ajuste de efeito de borda

Navegar para um mês clicado usava o dia 1 daquele mês como data-alvo. Como a granularidade de exibição do Dashboard é semanal, e a primeira semana de um mês às vezes "pertence" ao mês anterior (o domingo cai antes da virada do mês), isso fazia clicar em "Dez" cair numa semana cujo breadcrumb mostrava "Nov". Trocado para o dia 15 (meio do mês) — e, por analogia, 15 de junho para navegação por ano — reduzindo bastante a chance de cair numa semana de borda.

## 2. Dias da semana movidos para o sub-header

Com o breadcrumb ocupando espaço na mesma linha que os 7 botões de dia (`header-week-tabs`), sobrava pouco espaço em telas medianas, causando overflow horizontal. O usuário sugeriu mover os dias para o sub-header já existente (`dynamic-header-tabs`, uma div logo abaixo do cabeçalho principal, até então mantida vazia "por compatibilidade").

**Efeito colateral positivo:** havia código pré-existente em `openDailyView()`/`renderDailyView()` (linha ~1571) que já tentava atualizar o destaque visual do dia selecionado fazendo `querySelectorAll('#dynamic-header-tabs button.tab-btn')` — só que, como os dias viviam em `header-week-tabs`, esse seletor nunca encontrava nada, e o destaque nunca funcionava. Ao mover os dias para `dynamic-header-tabs`, esse código voltou a funcionar sem nenhuma alteração adicional.

`header-week-tabs` deixou de receber conteúdo (mantido limpo por segurança, caso algo ainda o referencie). `hideAllViews()` foi atualizada para limpar `dynamic-header-tabs` em vez de `header-week-tabs`.

## 3. Clicar em "Semana" navega para o Plano Semanal (com dias no sub-header)

Ajuste final pedido: em qualquer lugar do app (Dashboard, Plano Anual, Plano Mensal), clicar na opção de **Semana** do breadcrumb deve levar para o **Plano Semanal** daquele período — e essa tela deve, por sua vez, mostrar os dias daquela semana específica no sub-header (não só quando vindo do Dashboard).

**Implementação:**
- Extraída `renderDiasNoSubheader(dates)` a partir do código que já populava `dynamic-header-tabs` em `renderWeeklyGrid()` — função de nível superior do módulo, reaproveitável.
- No callback do Dashboard: quando a chave selecionada é uma semana (`key.includes('-w')`), em vez de chamar `goWeekly`, chama `window.appRouter.switchToPlanosView('semanal', key)` e retorna cedo (Ano/Mês continuam trocando a semana do próprio Dashboard).
- Em `renderPlanoVersionado()`: quando `tipo === 'plano_semanal'`, calcula o domingo da semana selecionada (`getDataDaSemana(periodoSelecionado)`) e os 7 dias a partir dele (`getWeekDates(...)`), chamando `renderDiasNoSubheader(...)`. Planos Anual/Mensal não chamam essa função — o sub-header permanece limpo para eles (`hideAllViews()` já cuida disso ao trocar de view).

## Validação

- ✅ Breadcrumb aparece na tela inicial (Dashboard), com Ano/Mês trocando a semana exibida sem navegar
- ✅ Clicar em qualquer Semana (a partir do Dashboard, Plano Anual ou Plano Mensal) navega para Plano Semanal daquele período
- ✅ Sub-header mostra os 7 dias corretos da semana visualizada, tanto no Dashboard quanto no Plano Semanal
- ✅ Clicar num dia do sub-header abre a Visão Diária corretamente em ambos os contextos
- ✅ Destaque visual do dia selecionado na Visão Diária voltou a funcionar (bug pré-existente corrigido como efeito colateral)
- ✅ Plano Anual/Mensal permanecem sem dias no sub-header
- ✅ Nenhum erro de console em nenhum fluxo testado

## Arquivos Afetados

- `js/app.js`: funções de período movidas para o nível superior do módulo; `renderPeriodoBreadcrumb` generalizada com callback `onSelecionar`; `renderWeeklyGrid` chama `renderDiasNoSubheader` e passa callback contextual ao breadcrumb; `renderPlanoVersionado` chama `renderDiasNoSubheader` quando `plano_semanal`; `hideAllViews` limpa `dynamic-header-tabs` em vez de `header-week-tabs`

## Plano de Rollback

Três commits sequenciais no repositório `https://github.com/LuizNogaroli/extTotalPlanner`: `1d7600e` (breadcrumb no dashboard + fix de escopo), `3bf544f` (dias no sub-header), `fac431b` (semana navega para Plano Semanal). `git revert` de qualquer um deles isoladamente é seguro, já que cada commit reescreveu uma responsabilidade distinta sem tocar as anteriores.
