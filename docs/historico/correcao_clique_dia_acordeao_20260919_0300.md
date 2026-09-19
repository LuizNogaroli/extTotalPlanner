# Correção: clique no dia (layout acordeão) não abria a Visão Diária

**Data/Hora:** 2026-09-19_0300
**Responsável:** Claude Code & User

## O que foi feito
No layout **"stacked" (Lista Acordeão)** da Visão Semanal, o nome do dia (caret + título) só expandia/recolhia o `<details>` nativo — a Visão Diária só abria ao clicar no pequeno *badge* de data. Agora o nome do dia também abre a Visão Diária no conteúdo:

- Em `renderWeeklyGrid()` (branch `else`/stacked, `js/app.js`), o wrapper do caret+título ganhou a classe `day-title-open` e um `addEventListener('click')` que chama `window.appRouter.goDaily(date)` (com `preventDefault`/`stopPropagation` para não conflitar com o toggle do acordeão).
- Os layouts `grid` e `compact-*` já abriam a diária corretamente (handlers pré-existentes), então só o acordeão precisava do ajuste.

## Estado Anterior
Layout padrão do app = `stacked` (settings.layout cai em 'stacked'). Clicar no dia (nome) apenas alternava o acordeão; a área de conteúdo da Visão Diária não carregava a menos que o usuário acertasse o *badge* de data.

## Estado Novo
Clicar no nome do dia (ou no badge de data) abre a Visão Diária (`daily-view-wrapper` visível, `weekly-view-wrapper` oculto). Verificado via harness jsdom: clique no `.day-title-open` → `weekly hidden: true | daily hidden: false`, 0 erros de runtime.

## Plano de Rollback
Remover o `addEventListener` de `.day-title-open` e a classe `day-title-open` no branch `else` de `renderWeeklyGrid()` (volta a depender só do *badge* de data).

## Bônus (mesmo commit)
`seedDemoAtividades()` agora gera datas no formato local `YYYY-MM-DD` (antes usava `toISOString()`, UTC — o que podia deslocar um dia em fusos negativos e fazer atividades não aparecerem no dia clicado).
