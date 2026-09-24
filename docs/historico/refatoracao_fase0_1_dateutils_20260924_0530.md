# Refatoração do `app.js` — Fases 0 e 1: código morto + `dateUtils.js`

**Data/Hora:** 2026-09-24_05:30
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Primeiras duas fases do plano em `docs/plano_refatoracao_appjs.md`:

- **Fase 0:** removida `renderDailyView()` de `js/app.js` — definida, mas nunca chamada em lugar nenhum (código morto já registrado em `pendencias.md` 3.2 e em `historico/titulo_pagina_dia_20260923_2300.md`).
- **Fase 1:** os 9 utilitários puros de data/período saíram do nível superior de `app.js` para um módulo novo, `js/modules/dateUtils.js`, e passaram a ser importados no topo de `app.js`:
  `getWeekNumber`, `getWeekDates`, `getPeriodoKey`, `getPeriodoLabel`, `getDataDaSemana`, `getPeriodoPaiKeys`, `getSemanasDoMes`, `semanaLabelCompacto`, `semanaLabelSemAno`.

O corpo das funções foi copiado **sem nenhuma mudança de lógica** — só ganharam `export`. Os comentários originais foram mantidos junto de cada função.

## Por que

`app.js` passou de 3.000 linhas (o limiar que `ANALISE_MANUTENIBILIDADE.md` apontava para dividir em módulos) e várias sessões de IA passaram a trabalhar nele em paralelo. O plano começa pelo que é mais seguro de mover: funções puras, sem DOM e sem estado compartilhado.

## Estado Anterior

- As 9 funções e `renderDailyView()` ficavam no fim de `app.js`, fora da closure `DOMContentLoaded`, espalhadas entre outras funções e com alguns comentários fora do lugar (um que descrevia `renderPlanoVersionado` e o do breadcrumb, que estava grudado nas funções `semanaLabel*`).
- `app.js`: **3.388 linhas**.

## Estado Novo

- `js/modules/dateUtils.js` (116 linhas): as 9 funções, exportadas, com um cabeçalho explicando as convenções (semana de domingo a sábado; chaves `AAAA`, `AAAA-MM`, `AAAA-wSS`).
- `js/app.js`: `import { … } from './modules/dateUtils.js'` no topo, junto dos outros imports. Como `import` de módulo ES vale para o arquivo inteiro, ele atende tanto o código dentro da closure `DOMContentLoaded` quanto as funções de nível de módulo (`renderWeeklyGrid`, `renderPeriodoBreadcrumb`, `renderSidebarTimeline`) — nenhuma chamada precisou mudar.
- Comentário órfão de `renderPlanoVersionado` removido; o comentário do breadcrumb voltou a ficar junto de `getPeriodoDropdownRoot`/`renderPeriodoBreadcrumb`.
- `app.js`: **3.277 linhas** (−111).
- `index.html`: sem mudança.

## Verificação

1. **Sintaxe:** `node --check` em `app.js` e `dateUtils.js`.
2. **Equivalência (Node):** as funções antigas foram tiradas do commit anterior (`git show HEAD:js/app.js`) e comparadas com as novas para todos os dias de 2025-01-01 a 2027-12-31, em todas as granularidades, incluindo chaves de semana, rótulos, domingo da semana, chaves-pai, semanas do mês e o valor padrão de `getWeekDates()`. **14.236 comparações, 0 diferenças.**
3. **Navegador (preview local):**
   - Dashboard: grade com 7 dias, "w39 (20/09 a 26/09) - 2026", breadcrumb "Set 2026 · Sem. 39", sub-header Dom 20/09 … Sáb 26/09.
   - Planos Anual, Mensal e Semanal abrem, com breadcrumb; o Semanal popula o sub-header.
   - Dia aberto a partir do Plano Semanal (fix da v1.46, que usa `getWeekDates`): "Qua - 23/09", visível.
   - Painel do breadcrumb: meses Jan…Dez e semanas Sem. 36…Sem. 40 (as semanas de setembro, iguais ao teste em Node).
   - Modal de transferência → Plano Mensal, com um plano mensal de teste criado só para isso: opção "Setembro de 2026" (`2026-09`). O dado de teste foi removido e o storage conferido como idêntico ao anterior.
   - `dateUtils.js` carregado (200) e nenhum erro no console.

## Achado durante o trabalho

`renderSidebarTimeline()` (e a chamada dela no boot) também é código morto: o `#sidebar-timeline` não existe no `index.html` — nem hoje, nem no início desta sessão —, então a função sai no primeiro `if`. A "timeline na sidebar" foi uma abordagem que o usuário descartou (`historico/breadcrumb_periodo_20260920_0000.md`). Não foi removida agora (fora do escopo das Fases 0 e 1): anotada em `pendencias.md` 3.2, e o plano passou a prever **removê-la** na Fase 8, em vez de migrá-la.

## Plano de Rollback

Reverter o commit desta mudança. Manualmente: apagar `js/modules/dateUtils.js`, tirar o `import` do topo de `app.js` e colar de volta as 9 funções no nível superior de `app.js` (o conteúdo é idêntico ao do módulo, sem os `export`). `renderDailyView()` não precisa voltar — não era chamada por ninguém.
