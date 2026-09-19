# extPlanner - Registro de Discussões de UX e Layout

Este documento registra discussões, análises e decisões sobre experiência do usuário (UX) e layout do extPlanner — tanto para telas desktop quanto mobile. Diferente do [`MANUAL_TECNICO.md`](MANUAL_TECNICO.md) (que documenta soluções técnicas já **implementadas**) e do [`docs/historico/`](historico/) (mudanças já **concluídas**, com plano de rollback), este arquivo existe para preservar o *raciocínio* por trás de decisões de design: o que foi considerado, quais trade-offs pesaram, e o que foi decidido — ou ainda está em aberto.

---

## Índice de Discussões

| Data | Tópico | Status |
| :--- | :--- | :--- |
| 2026-09-20 | Responsividade Desktop vs. Mobile: destaque para a Visão Semanal | 🟡 Em análise — aguardando decisão do usuário |

---

## 2026-09-20 — Responsividade Desktop vs. Mobile: destaque para a Visão Semanal

### Pedido do usuário
No uso em desktop, todas as funcionalidades devem estar presentes. No uso pelo celular, deve-se destacar o uso das atividades semanais (os dias da semana).

### Estado atual constatado (antes de qualquer mudança)
- **Sidebar off-canvas**: em telas `≤768px`, o menu lateral vira um overlay absoluto que desliza para fora (`#sidebar.closed { margin-left: -16rem }` em `css/styles.css`), acionado pelo ícone ☰ (`#btn-toggle-sidebar`), e fecha automaticamente após qualquer navegação em mobile (`if (window.innerWidth <= 768) sidebar.classList.add('closed')`, repetido em várias funções de `js/app.js`).
- **Grid semanal com 3 modos** configuráveis pelo usuário em Configurações — `grid`, `compact-grid`, `stacked` — com breakpoints Tailwind que já colapsam colunas (`grid-cols-1 md:grid-cols-2 lg:grid-cols-7` etc., na função de renderização da grade semanal em `js/app.js`).
- A tela inicial (Dashboard/"Visão Semanal") já é a mesma em desktop e mobile — o ponto de entrada já é a semana.
- Itens como o toggle de tema e o botão "Relatório" já usam `hidden sm:block`/`hidden md:flex` para sumir em telas pequenas.

### Lacunas identificadas em relação ao pedido
1. O menu lateral mobile mostra a mesma lista completa (Missão, Visão, Objetivos, Planos Anual/Mensal/Semanal, Contextos, Configurações, Meu Planner, Alarmes) que no desktop — nada tem prioridade visual, é preciso abrir o ☰ e escolher entre ~10 itens toda vez.
2. Os botões estáticos do cabeçalho `btn-nav-anual`/`btn-nav-mensal`/`btn-nav-semanal` (em `index.html`) não têm nenhuma função real (resquício de antes das páginas reais existirem no menu lateral) e ocupam espaço escasso no cabeçalho mobile.
3. O modo `stacked` (1 dia por card, mais adequado a telas estreitas) é hoje apenas uma preferência manual do usuário, não algo automático por tamanho de tela.
4. Não há atalho de navegação rápida (ex.: barra inferior) reforçando que a visão semanal é a função principal no mobile.

### Opções consideradas

| # | Opção | Trade-off |
| :---: | :--- | :--- |
| 1 | **Bottom Navigation Bar fixa no mobile** (Semana / Hoje / +Novo / Menu ☰) | Aditiva, baixo risco, não toca no desktop nem remove nada do menu completo (continua acessível via ☰). Padrão consolidado em apps/PWA mobile. |
| 2 | **Forçar layout `stacked` automaticamente em telas `<768px`** | Reaproveita o modo já existente; passa a ser automático por tamanho de tela em vez de depender só da preferência salva. Complementa a opção 1. |
| 3 | **Reorganizar o menu lateral por frequência de uso no mobile** (recolher Missão/Visão/Objetivos/Planos sob um grupo secundário; "Meu Planner" fixo e em destaque no topo) | Resolve na raiz do menu; exige mais julgamento sobre prioridades sem dados reais de uso. |
| 4 | **Navegação "um dia por vez" (abas/swipe) no mobile**, reaproveitando o seletor de dias que já existe no cabeçalho | É o que mais destaca a atividade do dia; maior esforço de implementação (gestos, estado de aba ativa). |

### Recomendação (ainda não implementada)
Combinar as opções **1 + 2** primeiro — baixo risco, aditivas, resolvem o pedido diretamente sem remover nada do desktop. Aproveitar para remover os botões órfãos `btn-nav-anual/mensal/semanal` do cabeçalho. Avaliar **3** e **4** depois, conforme o uso real do app no celular.

### Status
🟡 **Em análise.** O usuário pediu apenas a análise nesta rodada ("Por enquanto só analise, não gere código ainda"). Nenhuma mudança de código foi feita. Próximo passo: o usuário decide a combinação de opções antes da implementação.
