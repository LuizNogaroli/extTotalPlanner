# extPlanner - Registro de Discussões de UX e Layout

Este documento registra discussões, análises e decisões sobre experiência do usuário (UX) e layout do extPlanner — tanto para telas desktop quanto mobile. Diferente do [`MANUAL_TECNICO.md`](MANUAL_TECNICO.md) (que documenta soluções técnicas já **implementadas**) e do [`docs/historico/`](historico/) (mudanças já **concluídas**, com plano de rollback), este arquivo existe para preservar o *raciocínio* por trás de decisões de design: o que foi considerado, quais trade-offs pesaram, e o que foi decidido — ou ainda está em aberto.

---

## Índice de Discussões

| Data | Tópico | Status |
| :--- | :--- | :--- |
| 2026-09-20 | Responsividade Desktop vs. Mobile: destaque para a Visão Semanal | 🟡 Em análise — aguardando decisão do usuário |
| 2026-09-23 | Posição do "Plano Semanal" no menu lateral (Tático → Operacional) | 🟢 Decidido e implementado |
| 2026-09-23 | Header enxuto: sem "Relatório" e "+ Novo", só o tema à direita | 🟢 Decidido e implementado (ponto em aberto: tema no mobile) |
| 2026-09-23 | Menu lateral: hierarquia visual entre níveis + grupo "Recursos" | 🟢 Decidido e implementado |
| 2026-09-24 | Recursos ganha Pomodoro e Lista de Compras; novo grupo "Outros Sistemas" | 🟢 Implementado (conteúdo de Outros Sistemas em aberto) |
| 2026-09-24 | Boxes Citação/Devocional: botão + modal, modos na engrenagem, e o Omitir como faixa mínima | 🟢 Decidido e implementado |

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

### Atualização (2026-09-24): o que mudou desde esta análise
- **Lacuna 2 resolvida:** os botões órfãos `btn-nav-anual/mensal/semanal` saíram do cabeçalho na v1.24. O "Relatório" e o "+ Novo" também saíram, na v1.38. No celular, o cabeçalho ficou só com ☰ e o breadcrumb, porque o ☀ some abaixo de 640px (`pendencias.md` 2.3).
- **Lacuna 1 menor:** o menu ganhou hierarquia visual (v1.40). O Plano Semanal foi para "Operacional", que já abre expandido. Surgiram os grupos Recursos e Outros Sistemas.
- **Continuam em aberto:** as opções 1 a 4 (barra inferior, `stacked` automático, reorganizar o menu no mobile, um dia por vez).
- **Achado que afeta esta análise:** parte das cores de tema do HTML (bordas e textos secundários) nunca foi aplicada, porque o Tailwind local é o v2 sem JIT (`MANUAL_TECNICO.md` §3.21). Qualquer ajuste visual para mobile deve considerar isso.

---

## 2026-09-23 — Posição do "Plano Semanal" no menu lateral (Tático → Operacional)

### Pedido do usuário
"No menu sidebar, retire o plano semanal debaixo do nível tático e coloque debaixo do nível operacional."

### Decisão
"Plano Semanal" passa a ser o **primeiro item do grupo `Operacional`**, antes de "Meu Planner". O grupo `Tático` fica só com Plano Anual e Plano Mensal.

### Raciocínio
Na prática, o Plano Semanal fica mais perto de "Meu Planner" (a semana com as atividades de cada dia) e de "Atividade" do que dos horizontes de ano e mês. O próprio `Sobre_extPlanner.md` o descreve como "o coração do planejamento operacional" (§2.3). `Operacional` também é o único grupo que abre expandido por padrão (v1.18), então o Plano Semanal fica visível sem precisar de um clique extra.

### ⚠️ Divergência com o documento conceitual
No `Sobre_extPlanner.md`, a Pirâmide do Planejamento continua classificando o Plano Semanal **formalmente no Nível 3 (Tático)**, junto com os Planos Anual e Mensal (§2.3 e o diagrama da §2). O menu agora não segue mais essa classificação à risca. Isso não é um problema técnico, mas fica a decisão: atualizar o `Sobre_extPlanner.md` para refletir a nova posição, ou manter o documento como está e tratar o menu como organização por frequência de uso, não pela hierarquia conceitual. A decisão é do usuário e ainda não foi tomada.

### Histórico
Essa mesma decisão já tinha sido tomada e implementada na v1.12 (2026-09-20), mas se perdeu depois, provavelmente com a restauração do `index.html` a partir de um `.bak` (v1.29). Ela foi reaplicada nesta data. Detalhes em `docs/historico/plano_semanal_menu_operacional_20260923_2140.md`.

### Impacto na análise de responsividade (item anterior)
A lacuna 1 daquela análise ("nada tem prioridade visual no menu mobile") fica um pouco menor. Com o Plano Semanal em `Operacional`, que já vem aberto, os dois itens mais ligados à semana ficam juntos no topo do menu. A análise de mobile continua em aberto.

### Status
🟢 **Implementado.**

---

## 2026-09-23 — Header enxuto: sem "Relatório" e "+ Novo", só o tema à direita

### Pedido do usuário
"No header, retirar os botões 'Relatório' e '+ Novo' e alinhar o ícone da view claro/escuro alinhado à direita."

### Decisão
A zona direita do header fica só com o botão de tema claro/escuro (☀), encostado na borda direita. O header passa a ter três elementos: ☰ à esquerda, breadcrumb Ano › Mês › Semana no centro e ☀ à direita.

### Raciocínio
O usuário não detalhou o motivo. Os pontos abaixo são contexto observado na implementação, não justificativa dada por ele:
- O "🖨️ Relatório" não tinha nenhuma ação ligada; era ruído visual.
- O "+ Novo" duplicava caminhos que já existem mais perto do contexto: "+ Nova Atividade" em cada dia e na página do dia, "Cadastrar Atividade" em Atividades e "+ Adicionar" nos Planos.
- Com menos itens na direita, sobra mais espaço para o breadcrumb, que é o elemento central de navegação do header.

### Ponto em aberto
O ☀ continua com `hidden sm:block` e some abaixo de 640px. No celular, a zona direita do header fica vazia e o tema só pode ser trocado em Configurações. Falta decidir se o ☀ deve aparecer também no mobile.

### Registro técnico
`docs/historico/header_remocao_relatorio_novo_20260923_2320.md` e `docs/header.md`.

### Status
🟢 **Implementado.** Ponto do mobile em aberto.

---

## 2026-09-23 — Menu lateral: hierarquia visual entre níveis + grupo "Recursos"

### Pedido do usuário
1. "O layout do sidebar precisa ser melhorado, uma ideia é usar no primeiro nível os botões com bordas arredondadas e num segundo nível, aplicar uma cor diferente suavizada e recuar um pouco para ilustrar os diferentes níveis."
2. Depois de ver o resultado ("ficou muitíssimo melhor"): "crie um novo botão de primeiro nível chamado 'RECURSOS' e passe a opção 'Alarmes' para dentro de 'RECURSOS'."

### Decisão
- **1º nível** (Estratégico, Tático, Operacional, Recursos, e também Contextos/Papeis e Configurações no rodapé): botões com borda e cantos arredondados. O grupo aberto fica levemente tingido na cor primária.
- **2º nível** (itens): recuado, sobre um fundo suavizado (a cor primária bem diluída), com um fio guia à esquerda e texto secundário. O hover e o item ativo usam a cor primária.
- Os atalhos do rodapé ganharam o estilo de 1º nível porque também são itens de topo, não filhos de um grupo.
- **"Recursos"** reúne ferramentas de apoio que não são níveis da Pirâmide do Planejamento. Por enquanto contém só "⏰ Alarmes".

### Ponto em aberto
Outros itens que também são "recursos", como Hábitos, Compras e Contextos/Papeis, poderiam migrar para esse grupo. Isso fica a critério do usuário.

### Registro técnico
`docs/historico/sidebar_hierarquia_visual_20260923_2355.md` e `MANUAL_TECNICO.md` §3.22.

### Status
🟢 **Implementado.**

---

## 2026-09-24 — Recursos ganha Pomodoro e Lista de Compras; novo grupo "Outros Sistemas"

### Pedido do usuário
"Crie as seguintes opções abaixo: 'Pomodoro' e 'Lista de Compras'. Também crie um botão de primeiro nível chamado 'Outros Sistemas'." As dúvidas foram esclarecidas com perguntas antes da implementação:
- as duas opções ficam em **Recursos**, abaixo de Alarmes;
- a Lista de Compras deve **copiar a solução do extListaDeCompras**, e os links das páginas dos dias devem levar a ela;
- o Pomodoro deve ser um **timer funcional**;
- "Outros Sistemas" fica **vazio por enquanto**.

### Decisão
- Recursos: ⏰ Alarmes · 🍅 Pomodoro · 🛒 Lista de Compras.
- "Outros Sistemas": grupo de 1º nível, fechado, com o texto "Nenhum sistema vinculado ainda." (classe `nav-vazio`), para o grupo não abrir uma caixa em branco.
- A Lista de Compras e o Pomodoro são páginas inteiras na área de conteúdo, e não modais, porque têm muito conteúdo e o Pomodoro precisa ficar visível enquanto roda.
- O widget "Compras" da página do dia mostra só os **pendentes**. Marcar a caixa conta como "comprado", e o item sai do widget.

### Ponto em aberto
Quais sistemas entram em "Outros Sistemas". Há vários irmãos na pasta de projetos (Gestor de Investimentos, Orçamento, Atividades, Favoritos, Lista de Compras…). Para linkar extensões instaladas, é preciso o endereço `chrome-extension://<id>/...` de cada uma.

### Registro técnico
`docs/historico/recursos_pomodoro_compras_outros_sistemas_20260924_0130.md`, `MANUAL_TECNICO.md` §3.24 e §3.25.

### Status
🟢 **Implementado.** O conteúdo de "Outros Sistemas" continua em aberto.

---

## 2026-09-24 — Boxes Citação/Devocional: botão + modal, modos na engrenagem, e o Omitir como faixa mínima

### Pedido do usuário
Em duas etapas. Primeiro: "transformar o espaço 'Devocional' e 'Motivacional' em botões que abrirão um modal com a referida citação", com a possibilidade de fixar uma citação pelo ID. Depois, ao refinar a lógica: cada box precisa de três opções — **aleatório** (uma mensagem diferente a cada dia), **fixada** (o usuário escolhe o ID, e a mensagem permanece a partir daquela data, com opção de trocar) e **omitir** (esconder o box).

### Decisões (v1.47), confirmadas com o usuário antes da implementação
- O texto sai do box: o box mostra só um botão ("✨ Ver Citação do Dia" / "🙏 Ver Devocional do Dia") e um selo discreto com o modo ("🎲 Aleatório" / "📌 Fixada"); o texto completo abre num modal.
- O modo é versionado **por data**: trocar hoje vale de hoje em diante, e dias anteriores continuam mostrando o que valia na época.
- A troca vale **a partir de hoje (data real)**, e não do dia aberto na tela.
- O controle fica **no próprio box**, numa engrenagem ⚙️, e não em Configurações. As caixas antigas "Motivacional"/"Devocional" de Configurações saíram (o Omitir as substitui).
- Para o usuário descobrir o ID de uma mensagem, a lista em "Gerenciar" mostra o ID de cada item com um botão "📋 copiar".

### Problema encontrado depois (v1.51)
O Omitir escondia o box inteiro, e a engrenagem ia junto. A partir da data do marco, o box sumia junto com o único controle capaz de trazê-lo de volta. O aviso em Configurações ("use a engrenagem no próprio box") apontava para um box que já não aparecia. O único caminho era abrir um dia anterior ao marco — correto pelo modelo, mas ninguém descobre sozinho.

### Opções consideradas
- **(a) Faixa mínima:** em Omitir, o box encolhe para uma faixa com o título, a engrenagem e o aviso "Oculto desde DD/MM".
- **(b) "Mostrar de novo" em Configurações:** o box continua sumindo, e Configurações ganha um controle para reexibir os boxes omitidos.

A (a) mantém o controle onde o usuário já aprendeu que ele fica e diz na própria tela o que aconteceu e desde quando. A (b) esconde de verdade, mas separa o "desfazer" do lugar do "fazer" e obriga o usuário a lembrar que existe um segundo caminho.

### Decisão (v1.52)
**Opção (a)**, escolhida pelo usuário. A faixa fica esmaecida (opacidade 0,7, volta a 1 ao passar o mouse) e com menos altura, para ocupar pouco espaço, mas continua clicável.

### Regra que fica
Um controle que desfaz um estado não pode ficar dentro do elemento que esse estado esconde.

### Registro técnico
`MANUAL_TECNICO.md` §3.26; `docs/historico/citacao_devocional_modo_aleatorio_fixada_omitir_20260924_0400.md` (v1.47) e `docs/historico/citacao_omitir_faixa_minima_20260924_0645.md` (v1.52).

### Status
🟢 **Decidido e implementado.**
