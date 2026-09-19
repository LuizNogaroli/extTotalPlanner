# Nova Tela "Atividade" — Listagem com Filtros no Menu Operacional
**Data:** 20 de Setembro de 2026

## O que foi feito
O usuário pediu que, abaixo do "Plano Semanal" no menu lateral, existisse uma opção "Atividade" que carrega na área de conteúdo um botão "Cadastrar Atividade" e, após o cadastro, as atividades passem a aparecer numa lista tipo tabela, com opções de filtro e de visualizar/editar cada uma.

O tipo `atividade` já existia no sistema (usado no widget "+ Nova Atividade" da Visão Semanal/Diária, com modal, storage `planner_activities` e categorias/contextos dinâmicos), mas não havia nenhuma tela dedicada a listar **todas** as atividades cadastradas, independente da data — só era possível vê-las navegando dia a dia na grade semanal.

## 1. Estado Anterior (Antes)
- Menu `Operacional`: Plano Semanal → Meu Planner → Alarmes.
- Atividades só eram visíveis agrupadas por dia (grade semanal / modal do dia), sem uma visão consolidada de todos os registros nem filtros.
- O modal de cadastro/edição de atividade (`form-atividade`) e o modal de visualização somente leitura (`openViewModal`) já existiam e funcionavam — reaproveitados integralmente nesta mudança.

## 2. Estado Novo (Depois)
1. **`index.html`**
   - Novo item de menu `<a id="menu-atividades">Atividade</a>` logo abaixo de `menu-plano-semanal`, dentro do grupo `Operacional`.
   - Nova view `<div id="view-atividades">` (dentro de `<main>`, irmã de `view-planos`/`view-export`) contendo apenas `<div id="atividades-content-cards"></div>` — o conteúdo real é montado via JS, seguindo o mesmo padrão de `view-strategic`/`view-planos`.
2. **`js/app.js`**
   - `document.getElementById('menu-atividades').addEventListener('click', () => switchToAtividadesView());`
   - `'view-atividades'` adicionada ao array `viewIds` de `hideAllViews()`.
   - Nova função `async function switchToAtividadesView()`: monta o cabeçalho, o botão "+ Cadastrar Atividade" (→ `crudModal.open('atividade')`), a barra de filtros (texto + selects de Status/Categoria/Contexto, estes dois últimos populados a partir de `planner_atividade-categoria`/`planner_contexto`) e a tabela vazia; registra os listeners `input`/`change` dos filtros chamando `renderAtividadesTable()`.
   - Nova função `async function renderAtividadesTable()`: lê `planner_activities`, aplica os filtros correntes (lidos do DOM), ordena por data decrescente, e desenha as linhas da tabela com badges de status e prioridade (Eisenhower). Cada linha ganha botões "👁️ Ver" (→ `openViewModal(activity)`, reaproveitando o modal read-only já existente) e "✏️ Editar" (→ `crudModal.open('atividade', activity)`).
   - Listener de `crudSave`: o bloco do tipo `'atividade'` foi estendido — além de atualizar a Visão Semanal quando visível (comportamento já existente), agora também chama `renderAtividadesTable()` quando `view-atividades` estiver visível, mantendo a lista sincronizada sem F5 após criar/editar.
3. Testado manualmente no navegador: cadastro de uma nova atividade (aparece na lista imediatamente, sem duplicar — `atividade` não está em `SELF_MANAGED_TYPES`, então o `CRUDModal.save()` genérico já cuida da persistência), filtro por texto, filtro por status (esconde corretamente os registros que não batem), "Ver" (abre o modal read-only com os dados corretos) e "Editar" (pré-preenche o formulário, salva sem duplicar e atualiza o badge de status na tabela). Registro de teste removido do `localStorage` ao final.

## 3. Plano de Rollback / Desfazer
1. Em `index.html`: remover o `<a id="menu-atividades">` do menu `Operacional` e a `<div id="view-atividades">` inteira.
2. Em `js/app.js`:
   - Remover o `addEventListener` de `menu-atividades`.
   - Remover `'view-atividades'` do array `viewIds` em `hideAllViews()`.
   - Remover as funções `switchToAtividadesView()` e `renderAtividadesTable()`.
   - Reverter o bloco `type === 'atividade'` do listener de `crudSave` para a condição original: `if (type === 'atividade' && !viewWeekly.classList.contains('hidden')) { switchToWeeklyView(new Date(), currentLayout); } else if (...`.
3. Nenhuma mudança foi feita em `formMappers.js`, `formLoaders.js`, `crudModal.js` ou no `form-atividade` do modal — o tipo `atividade` e seu modal continuam exatamente como estavam, então o rollback é isolado à nova tela.
