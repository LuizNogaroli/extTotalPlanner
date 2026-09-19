# Histórico de Interações - Data no Planejamento Estratégico

## Estado Anterior (Antes)
- O formulário de Planejamento Estratégico registrava apenas o ID, Tipo (Missão, Visão, etc) e Conteúdo.
- Ao visualizar os cards de estratégia no painel, não era possível saber quando aquela versão foi escrita ou estabelecida, perdendo-se o rastro de evolução da clareza mental do usuário.

## Estado Novo (Depois)
- Inserido um campo "Data da Escrita" (`<input type="date">`) no modal do Planejamento Estratégico.
- O campo data passa a ser salvo no array de `planner_strategies`.
- Na visão `Planejamento Estratégico`, agora as datas aparecem visíveis e em destaque embaixo do texto de cada card como "Definido em: AAAA-MM-DD".
- Atualizada também a exportação modular de CSV para que a coluna `DataDaEscrita` reflita essa nova variável.
- O Modal Gerenciador lista os cards antecedidos da data quando disponível.

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior:

1. **No arquivo `index.html`**:
   - Dentro da tag `<form id="form-estrategia">`, remova o contêiner `<div>` que comporta a "Data da Escrita" e o input `<input type="date" id="estrategia-date">`.
   - Remova a div embrulho `<div class="grid grid-cols-2 gap-4">` e preserve apenas o campo de "Tipo Estratégico" que existia lá dentro antes.

2. **No arquivo `js/app.js`**:
   - No mapa do listener `forms['estrategia']?.addEventListener`, delete o mapeamento `, date: 'estrategia-date'`.
   - Na função `openModal` do ramo `else if (type === 'estrategia')`, delete as linhas que atribuem valor ao `document.getElementById('estrategia-date').value`.
   - Na função `switchToStrategicView()`, remova a constante `dateStr` e remova-a também da concatenação do template literal (`${dateStr}`).
   - Na função `renderManagerList()`, ramificação `'estrategia'`, remova a constante `dt` de forma que o `titleText` volte a mostrar somente o tipo e o conteúdo.
   - Na rotina de exportação CSV, retire `DataDaEscrita` do cabeçalho e `item.date` da montagem das colunas de `planner_strategies`.
