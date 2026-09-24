# Plano de Refatoração do `js/app.js`

**Criado em:** 2026-09-24
**Responsável:** Claude Code (Sonnet 5) & User
**Status:** 📋 Planejado, execução ainda não iniciada.

---

## 1. Por que este documento existe

`docs/ANALISE_MANUTENIBILIDADE.md` (2026-09-19) analisou o `app.js` logo depois da extração do CRUD genérico (`js/modules/crud/*`) e concluiu "🟢 EXCELENTE PARA MANUTENÇÃO", com uma ressalva:

> "Se o projeto crescer além de 3000 linhas, considere dividir renderização em módulos."

O arquivo só cresceu desde então — 2.673 linhas (19/09) → 3.188 (v1.45, 24/09) → **3.388 linhas agora** (depois de Citação/Devocional na v1.47) — e já passou esse limiar sem que a divisão tivesse sido feita. Ver `pendencias.md` item 4.2.

**Motivo para agir agora, além do tamanho:** o projeto passou a ser trabalhado por **várias sessões de IA em paralelo**. Isso já causou uma colisão real (duas sessões corrigindo a mesma classe de bug de schema quase ao mesmo tempo, uma delas sem saber que a outra já tinha enviado mudanças ao `main` — ver `docs/historico/fix_historico_formmappers_20260924_1200.md`). Um `app.js` monolítico de 3.388 linhas, com quase tudo dentro de uma única closure `DOMContentLoaded`, é onde esse tipo de atrito entre sessões paralelas é maior. Módulos menores e mais focados reduzem a área de colisão.

**O que este documento NÃO é:** uma urgência que bloqueia outras entregas. Itens de `pendencias.md` §1 (bugs funcionais reais, como o 1.1 de chaves divergentes) continuam tendo prioridade sobre isso — este refactor é dívida técnica importante, não uma emergência.

---

## 2. Estrutura real do `app.js` hoje (3.388 linhas)

Levantada por leitura direta do código em 2026-09-24 (não confiar na tabela de linhas do `ANALISE_MANUTENIBILIDADE.md`, que é uma foto de 19/09).

```
linhas 1–2692    dentro de document.addEventListener('DOMContentLoaded', async () => { ... })
                 → quase todas as views, modais e o window.appRouter
                 → compartilham estado via variáveis de closure (let/const soltos):
                   currentDailyDateStr, currentManagerType, currentStrategicSection,
                   currentPlanosTab, currentLayout, citacaoConfigTipoAtual,
                   currentActivityToTransfer, entre outras

linhas 2693–3388 fora da closure, no nível do módulo ES
                 → utilitários de data/período (funções puras) + renderização da
                   grade semanal + breadcrumb + sub-header
```

Isso é o motivo real da dificuldade: **quase tudo relevante mora dentro de uma única closure**, então "dividir em módulos" não é só copiar funções para outro arquivo — é decidir, para cada variável de estado compartilhado, qual módulo passa a ser "dono" dela, e como os outros módulos a leem (getter exportado) quando precisam.

---

## 3. Fases de extração

Ordem: do mais isolado/seguro para o mais acoplado/arriscado. **Cada fase é independente** — o app fica sempre funcional entre uma fase e outra, então não é preciso completar o plano inteiro de uma vez.

| # | Fase | O que sai | Linhas ~ | Destino | Risco |
|:-:|------|-----------|:--------:|---------|:-----:|
| 0 | Limpeza | Remover `renderDailyView()` (código morto confirmado — nunca chamada; `pendencias.md` 3.2) | -17 | *(deletar)* | Nenhum |
| 1 | Utilitários de data/período | `getWeekNumber`, `getWeekDates`, `getPeriodoKey`, `getPeriodoLabel`, `getDataDaSemana`, `getPeriodoPaiKeys`, `getSemanasDoMes`, `semanaLabelCompacto`, `semanaLabelSemAno` | ~130 | `js/modules/dateUtils.js` | **Mínimo** — funções puras, sem DOM, sem estado compartilhado |
| 2 | Citação/Devocional | `resolveCitacaoMarker`, `addCitacaoMarker`, `renderCitacaoWidget`, `openCitacaoModal`, `openCitacaoConfigModal` + listeners (tudo criado na v1.47, `MANUAL_TECNICO.md` §3.26) | ~195 | `js/modules/citacao.js` | Baixo — já nasceu isolado; depende só de `ContentService`, `StorageService`, `escCompras` e um getter para a data do dia aberto |
| 3 | Gerenciador genérico de listagens | `openManager`, `renderManagerList` | ~125 | `js/modules/managerModal.js` | Médio — hoje tem um `if/else` só de formatação por tipo (historico/motivacional/devocional/compras/estrategia/habito/atividade-categoria/alarme); extrair exige formalizar isso como registro plugável (ver §4 abaixo), não só mover o bloco |
| 4 | Transferência de Atividades | `openTransferModal`, `updateTransferOptions` + wiring do modal | ~125 | `js/modules/transferModal.js` | Baixo — já é bem isolado |
| 5 | Nível Estratégico | `switchToMissaoView`, `switchToVisaoView`, `switchToValoresView`, `switchToObjetivosView` | ~520 | `js/modules/views/strategic.js` | Médio — 4 funções bem paralelas (quase cópias); dá para extrair e, depois, generalizar |
| 6 | Tático/Operacional | `renderPlanoVersionado`, `switchToPlanosView`, `switchToAtividadesView`, `renderAtividadesTable`, `seedDemoEstrategicos`, `seedDemoAtividades` | ~570 | `js/modules/views/planos.js` | Médio-alto — `renderPlanoVersionado` é reaproveitada por 3 tipos de plano (anual/mensal/semanal), com bastante lógica de período embutida |
| 7 | Visão Diária | `openDailyView`, orquestração dos widgets (Compras/Hábitos/Diário), `renderWidgetCompras` | ~350 | `js/modules/dailyView.js` | **Alto** — coração do app, mais acoplado; já depende do módulo de Citação (fase 2) |
| 8 | Grade Semanal + cabeçalho | `renderWeeklyGrid` (a maior função do arquivo, ~230 linhas), `renderPeriodoBreadcrumb`, `renderDiasNoSubheader`, `getPeriodoDropdownRoot`, `renderSidebarTimeline` | ~440 | `js/modules/weeklyView.js` | **Alto** — muita integração com `docs/header.md`/`docs/sub-header.md` |

**O que fica em `app.js` no final:** bootstrap (instanciar `ThemeService`/`I18nService`/`CRUDModal`/`ListaCompras`/`Pomodoro`), `hideAllViews()`/roteamento central (`switchToSettings`, `switchToWeeklyView`, `switchToDailyView`, `switchToReportsView`, `switchToExportView`, `switchToStrategicView`), a listener de `crudSave` (que passa a chamar funções importadas dos módulos em vez de definidas ali), e o `window.appRouter` — continua existindo do mesmo jeito, só que reexportando funções importadas.

**`index.html` não muda em nenhuma fase.** Todo `onclick="window.appRouter.xxx()"` continua funcionando idêntico — a extração é só sobre onde `xxx` é *definida*, não sobre como é *chamada*.

---

## 4. Decisões de design a tomar durante a execução

1. **Variáveis de estado compartilhado:** cada uma migra para o módulo que a "dono" logicamente. Se outro módulo precisar ler, o dono exporta um getter (ex.: `dailyView.js` exporta `getCurrentDailyDateStr()`, usado pelo módulo de Citação na fase 2 — nesse caso, a fase 2 roda **antes** da fase 7, então na fase 2 esse getter ainda mora em `app.js`; só migra para dentro de `dailyView.js` na fase 7, e a fase 2 precisa ser ajustada para importar de lá).
2. **`renderManagerList` acopla 8 tipos num só `if/else`** (fase 3): em vez de mover o bloco inteiro, criar um `listLabel(type, item)` por tipo — pode viver ao lado de `formMappers.js`, em `js/modules/crud/`, já que é o mesmo tipo de registro que `formMappers.js` já mantém (schema, requires, agora também rótulo de exibição).
3. **`renderPlanoVersionado` (fase 6)** é a função mais longa fora da grade semanal — ao extrair, avaliar se vale dividir em sub-funções (`renderPlanoCard`, `renderPlanoHistorico`, `renderPlanoAtividades`), como o próprio `ANALISE_MANUTENIBILIDADE.md` já sugeria, ou manter unificada por coesão alta.

---

## 5. Riscos e mitigação

- **Não existe suíte de testes automatizados** (projeto sem build, sem framework). Cada fase termina com **verificação manual no navegador**: subir o preview (`rodar.bat` ou `.claude/launch.json`), clicar em toda tela afetada pela fase, conferir console sem erros — o mesmo processo usado nas correções desta sessão (sub-header, Citação/Devocional, Histórico).
- **Regressão silenciosa é o risco principal**, não erro de sintaxe (que apareceria na hora). Por isso a ordem vai do mais isolado pro mais acoplado: erros nas fases 0–4 são fáceis de isolar; um erro na fase 7 ou 8 pode se manifestar em várias telas ao mesmo tempo.
- **Cada fase = 1 commit próprio + 1 entrada em `docs/historico/` + atualização do `MANUAL_TECNICO.md`** (protocolo do `CLAUDE.md`/`GEMINI.md`) — nunca acumular várias fases num commit só, pelo mesmo motivo que a v1.46/v1.47 desta sessão foram separadas em commits distintos apesar de terem sido feitas na mesma sessão.
- **Sessões paralelas:** se outra sessão estiver mexendo em `app.js` ao mesmo tempo, prefira coordenar por aqui (marcar a fase como "🔄 Em andamento" na tabela abaixo) antes de começar, para reduzir a chance de colisão que motivou este documento.

---

## 6. Acompanhamento de progresso

Marcar aqui conforme cada fase for concluída (não é para editar a tabela da seção 3, que é a referência do plano original).

- [ ] Fase 0 — Remover `renderDailyView()` morta
- [ ] Fase 1 — `js/modules/dateUtils.js`
- [ ] Fase 2 — `js/modules/citacao.js`
- [ ] Fase 3 — `js/modules/managerModal.js` (+ registro de rótulos em `crud/`)
- [ ] Fase 4 — `js/modules/transferModal.js`
- [ ] Fase 5 — `js/modules/views/strategic.js`
- [ ] Fase 6 — `js/modules/views/planos.js`
- [ ] Fase 7 — `js/modules/dailyView.js`
- [ ] Fase 8 — `js/modules/weeklyView.js`

---

## 7. Referências

- `docs/ANALISE_MANUTENIBILIDADE.md` — análise original que primeiro sugeriu dividir a renderização, e o "gatilho" das 3.000 linhas.
- `docs/pendencias.md` item 4.2 — aponta para este documento.
- `docs/MANUAL_TECNICO.md` §2 e §4 — estrutura de diretórios e mapa de funcionalidades atuais, para saber onde cada coisa está hoje antes de mover.
- `docs/historico/fix_historico_formmappers_20260924_1200.md` — o episódio de colisão entre sessões paralelas que motivou priorizar este plano.
