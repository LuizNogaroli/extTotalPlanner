# Título "Aaa - DD/MM" na Página do Dia (Visão Diária)

**Data/Hora:** 2026-09-23_23:00
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

A página do dia (Visão Diária, aberta ao clicar num dia do sub-header) passou a mostrar um título com o dia da semana abreviado e a data, no formato `Aaa - DD/MM` (ex.: "Qua - 23/09"). O título fica à esquerda, na mesma linha do botão "+ Nova Atividade".

## Por que

Pedido do usuário: "na página do dia da semana, carregada na área de conteúdo, traga no título da página o dia da semana e o dia do mês no formato Aaa - DD/MM na mesma linha do botão '+ nova Atividade'".

## Estado Anterior

O `index.html` já tinha o espaço certo: uma linha `flex justify-between` com `<span id="daily-view-title">📅 Pendências do Dia</span>` à esquerda e o botão `#btn-day-modal-new` à direita. Mas `openDailyView()` (`js/app.js`) escondia esse título toda vez que abria um dia:

```javascript
const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = `${daysOfWeekFull[dateObj.getDay()]} (${dayStr})`; document.getElementById("daily-view-title").classList.add("hidden");
```

Resultado: o botão aparecia sozinho na linha, sem nenhuma indicação de qual dia estava aberto além do destaque no sub-header.

## Estado Novo

```javascript
const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = `${daysOfWeekFull[dateObj.getDay()]} (${dayStr})`;

// Título da página do dia, na mesma linha do "+ Nova Atividade": "Qua - 23/09"
const dailyTitle = document.getElementById('daily-view-title');
dailyTitle.textContent = `${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dateObj.getDay()]} - ${dayStr}`;
dailyTitle.classList.remove('hidden');
```

- A abreviação é a mesma dos botões do sub-header (`Dom`, `Seg`, … `Sáb`).
- `dayStr` (`DD/MM`) já era calculado no início de `openDailyView()`.
- Nenhuma mudança de HTML ou CSS.

## Ficheiros Afetados

- `js/app.js`: `openDailyView()`.
- `docs/sub-header.md`: fluxo do clique (§4) atualizado com o passo do título.

## Validação

- ✅ Dom (20/09), Qua (23/09) e Sáb (26/09): o título mostra "Dom - 20/09", "Qua - 23/09" e "Sáb - 26/09", com o acento correto.
- ✅ O título fica visível e alinhado verticalmente com o botão "+ Nova Atividade" (centros a menos de 6px de diferença).
- ✅ Conferido visualmente no navegador.

## Plano de Rollback / Desfazer

Em `openDailyView()`, substituir o bloco novo pela linha original, que volta a esconder o título:
`document.getElementById("daily-view-title").classList.add("hidden");`

## Notas Importantes

- `renderDailyView()`, no fim de `app.js`, também escreve em `#daily-view-title` (um título longo, "23 de Setembro de 2026, Quarta-feira"), mas **não é chamada em lugar nenhum**. É código morto e pode ser removida numa limpeza futura. Se algum dia voltar a ser chamada, vai sobrescrever o título novo.
- Limitação herdada, sem relação com esta mudança: a Visão Diária só aparece quando aberta a partir do Dashboard. A partir do Plano Semanal ela não abre (ver `docs/sub-header.md` §8 nº 1).
