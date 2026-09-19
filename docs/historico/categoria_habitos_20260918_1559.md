# Histórico de Interações - Categorias em Hábitos

## Estado Anterior (Antes)
- Os questionários de Hábito possuíam apenas Pergunta e Tipo de Resposta, não oferecendo formas de organização para o usuário.

## Estado Novo (Depois)
- Criada a funcionalidade de "Categoria" para os Hábitos.
- Adicionado o seletor de Categoria ao `form-habito` com opções padronizadas (Saúde, Produtividade, Bem-estar, Relacionamentos, Espiritualidade, Finanças, Outros).
- O backend (`app.js`) salva e recupera a propriedade `.category`.
- O renderizador do Dia (A4) passa a imprimir uma pequena *badge* visual ao lado da pergunta (ex: `[SAÚDE] Como foi seu sono?`).
- O Gerenciador de Hábitos na listagem em tempo real exibe a categoria da pergunta.
- A ferramenta de Exportação de Dados em CSV foi atualizada para encabeçar cada coluna com a respectiva categoria, criando colunas fáceis de filtrar em planilhas: `[SAÚDE] Como foi seu sono?`.

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior:

1. **No arquivo `index.html`**:
   - Delete a div de Categoria `<select id="habito-category">` de dentro do `form-habito`.

2. **No arquivo `js/app.js`**:
   - No `openModal`, delete a linha: `document.getElementById('habito-category').value = data.category || 'Outros';`
   - Na rotina de cadastro (`handleFormSubmit`), tire `'category': 'habito-category'` da lista de chaves monitoradas.
   - Na listagem de gerenciador (`renderManagerList`), na condicional `type === 'habito'`, retire a linha que processa o prefixo de categoria `const cat = ...`.
   - Na visão do Dia A4 (`openDayModal`), retire o `badgeHtml` na construção das perguntas.
   - Na rotina de Exportação `moduleKey === 'planner_habits_log'`, reverta a construção da *string* de cabeçalho para somente `"${h.question}"`.
