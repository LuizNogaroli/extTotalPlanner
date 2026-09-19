# Histórico de Interações - Categorias de Atividades

## Estado Anterior (Antes)
- O cadastro de Atividades (`form-atividade`) possuía apenas Título, Descrição, Data e Status. Não havia distinção ou categorização sobre os diferentes papéis da vida (ex: Trabalho, Faculdade).

## Estado Novo (Depois)
- Criado o cadastro (CRUD) de Categorias de Atividades.
- Adicionado um novo item no menu lateral "🏷️ Categorias de Atividades" que abre o gerenciador global.
- Atualizado o formulário de Nova Atividade para exibir um campo `<select id="atividade-category">` com as opções sendo carregadas dinamicamente do banco de dados (async).
- A visão diária (A4) e semanal (Dashboard Cards) passaram a exibir uma pequena "tag" visual indicando a categoria de cada tarefa, para facilitar a visualização dos compromissos daquele papel de vida.
- O exportador de dados para CSV em "Atividades" também foi ajustado para incluir a coluna Categoria.

## Plano de Rollback / Desfazer
Para reverter:
1. **No arquivo `index.html`**:
   - Retire a âncora `🏷️ Categorias de Atividades` do menu lateral `Módulos Diários`.
   - Delete a tag `<select id="atividade-category">` do `form-atividade`.
   - Delete todo o bloco `<form id="form-atividade-categoria">`.
2. **No arquivo `js/app.js`**:
   - Em `openModal('atividade')`, reverta a rotina de carregamento assíncrono do select, bem como o salvamento de `data.category`. Retorne a função de `async function` para apenas `function` se desejar.
   - Remova `'atividade-categoria'` de `forms`.
   - No mapa `handleFormSubmit` para `'atividade'`, remova `category: 'atividade-category'`. Remova o listener inteiro para `forms['atividade-categoria']`.
   - No `renderManagerList()` e `openManager()`, tire o type `atividade-categoria`.
   - Nas funções `renderWeeklyGrid` (linhas do grid semanal) remova a concatenação de `${catBadge}` no cartão da atividade.
   - Na rotina de exportar CSV de `planner_activities`, retorne a string base de colunas ignorando `Categoria`.
