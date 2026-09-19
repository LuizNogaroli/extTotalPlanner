# Implementação do Layout Compacto e View Modal

## 1. Estado Anterior (Antes)
- O sistema continha apenas os botões de layout `Grid` e `Empilhado`.
- A renderização da grid distribuía os cards de atividades ocupando bastante espaço horizontal ou vertical no dashboard, resultando em um visual muito poluído se houvesse muitas tarefas.
- As atividades só podiam ser editadas no clique direto do card.

## 2. Estado Novo (Depois)
- Injetado no `index.html` o novo Modal de Visualização Somente Leitura (`#global-view-modal`) e o Modal de Resumo Diário (`#global-day-modal`).
- Criado o layout de `Compacto` através do novo botão no Header, adicionando o case `layoutType === 'compact'` no laço da `renderWeeklyGrid`.
- O layout compacto desenha blocos minimalistas (parecidos com as colunas de Trello recolhidas) mostrando apenas o dia e a contagem de tarefas. O clique nestes blocos dispara a abertura de um popup contendo a lista limpa das atividades.
- Introduzidos os ícones de ação `👁️` e `✏️` flutuantes dentro do markup dos cards no layout `app.js` (`activitiesHTML`).

## 3. Plano de Rollback / Desfazer
Para reverter estas mudanças e voltar ao estado original de dois layouts:

1. **index.html**: 
   - Remover a tag `<button id="btn-layout-compact"...>` do bloco de configurações do header.
   - Apagar os blocos de modal `<div id="global-day-modal">` e `<div id="global-view-modal">` logo acima da tag `<script>`.
2. **app.js**:
   - Deletar o handler de click do `btn-layout-compact`.
   - Na função `renderWeeklyGrid`, apagar o bloco `else if (layoutType === 'compact') { ... }`.
   - Na criação de `activitiesHTML`, voltar a div para o formato `cursor-pointer onclick=openModal...` em vez da div `.absolute` com os botões.
   - Remover as definições de função `openViewModal` e `openDayModal`, apagando as suas exportações correspondentes em `window.appRouter`.
