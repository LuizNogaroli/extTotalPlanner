# Histórico de Interações - Simplificação de Tipos de Hábitos

## Estado Anterior (Antes)
- Ao cadastrar um novo hábito, o usuário possuía um select que definia o Tipo de Resposta (Texto Curto, Hora, Sim/Não, Nota), e no formulário diário o input mudava dinamicamente dependendo da escolha (ex: `<select>`, `<input type="time">`, etc).

## Estado Novo (Depois)
- Para simplificar e encorajar o uso inicial mais fluído, limitou-se as respostas estritamente a "texto livre".
- O campo "Tipo de Resposta" foi removido do `form-habito` em `index.html`.
- O mapeamento em `app.js` (tanto em `openModal`, `handleFormSubmit` quanto `renderManagerList`) foi limpo, não mais exibindo o prefixo de tipo (ex: `[Texto]`).
- A renderização do `openDayModal` agora injeta incondicionalmente uma tag `<input type="text">` livre para qualquer pergunta de hábito cadastrada.

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior (permitir tipos diversificados novamente):

1. **No arquivo `index.html`**:
   - Insira uma `div` com `<label>` e o `<select id="habito-type">` preenchido com as tags `<option>` de (text, time, boolean, rating) ao lado da div de Categoria do Hábito.

2. **No arquivo `js/app.js`**:
   - Em `openModal('habito')`, adicione novamente `document.getElementById('habito-type').value = data.type;`.
   - Em `handleFormSubmit('habito')`, volte a adicionar a chave `type: 'habito-type'` no objeto do mapeamento.
   - Na listagem `renderManagerList()` para `'habito'`, recrie a constante `const typeLabels = ...` e reinsira-a na interpolação do `titleText`.
   - No `openDayModal()`, substitua a linha do `const inputHtml` por um bloco de condicional (`if (h.type === 'text') ... else if (h.type === 'time') ...`) devolvendo o `inputHtml` adequado para cada tipo de layout.
