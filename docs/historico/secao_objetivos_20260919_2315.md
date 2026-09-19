# Seção de Objetivos (Curto/Médio/Longo Prazo em um Único Modal)
**Data:** 19 de Setembro de 2026

## O que foi feito
Foi criada a seção de "Objetivos" no menu Estratégico, nos mesmos moldes de Missão e Visão (view + página educacional + histórico versionado), com uma diferença combinada explicitamente com o usuário: os objetivos existem em três horizontes de tempo — Curto, Médio e Longo Prazo — e todos são cadastrados/atualizados por meio de **um único modal**, com um campo "Prazo" (select) que decide qual dos três é afetado.

Antes de implementar, foi perguntado ao usuário se "Objetivos" deveria ser uma lista de metas concretas (múltiplas por prazo, com conclusão/exclusão) ou um texto único versionado por prazo (igual Missão/Visão). A resposta escolhida foi **texto único versionado**, então a página de Objetivos segue exatamente o padrão "atual + histórico" já usado em Missão/Visão, só que triplicado (uma seção por prazo) dentro da mesma tela, com os botões "📚 Educacional"/"✏️ Atualizar Objetivo" compartilhados no topo.

## 1. Estado Anterior (Antes)
- O link "Objetivos" no menu lateral (`#menu-objetivos`) existia no HTML, mas não tinha listener de clique.
- Os tipos `obj_curto`/`obj_medio`/`obj_longo` já eram referenciados em `switchToStrategicView()` (visão geral genérica de todos os tipos estratégicos) e em `js/modules/manager.js` (rótulos do modal gerenciador), mas não havia formulário, view dedicada nem função de roteamento específica para eles.
- Não havia registro `objetivos` em `FORM_REGISTRY` (`formMappers.js`), nem loader em `formLoaders.js`, nem entrada em `SELF_MANAGED_TYPES` (`crudModal.js`).

## 2. Estado Novo (Depois)
1. **`index.html`**: adicionado `<div id="view-objetivos-educacional">` como irmã de `view-strategic`/`view-missao-educacional`/`view-visao-educacional`/`view-export`, dentro de `<main>`. Conteúdo: o que são objetivos estratégicos, os três horizontes de tempo (curto/médio/longo), características SMART, diferenças (Objetivos vs Visão, Objetivos vs Metas do dia a dia), exemplos por prazo, por que revisar, dica prática. Também adicionado `<form id="form-objetivos">` no modal CRUD (após `form-visao`), com:
   - `<select id="objetivos-prazo">` com opções `curto` (🎯), `medio` (📈), `longo` (🏆) — valor padrão `curto`.
   - `<textarea id="objetivos-content">` para o texto do objetivo.
2. **`js/modules/formMappers.js`**: novo registro `'objetivos'` em `FORM_REGISTRY` — `fields: ['id','type','prazo','content','timestamp']`, `defaults: {type:'objetivos', prazo:'curto'}`, `required: ['content']`. O campo `type` aqui é só o "tipo de formulário" (para lookup de elementos `objetivos-*`); o `type` real gravado no registro é derivado do `prazo` no momento do save (ver item 4).
3. **`js/modules/formLoaders.js`**: adicionado `'objetivos': this.loadBasicForm.bind(this)`.
4. **`js/app.js`**:
   - `document.getElementById('menu-objetivos').addEventListener('click', switchToObjetivosView)`.
   - Nova função `async function switchToObjetivosView()`: monta a página iterando sobre um array `prazoConfig` (`obj_curto`/`obj_medio`/`obj_longo`, cada um com label e ícone), renderizando para cada prazo o card "atual" (ou "Nenhum objetivo cadastrado ainda.") e, se houver histórico, um `<details>` recolhível "(versões anteriores)" — evita que a página fique excessivamente longa com três históricos abertos ao mesmo tempo. Os botões "📚 Educacional"/"✏️ Atualizar Objetivo" aparecem uma única vez no topo, compartilhados pelos três prazos.
   - `currentStrategicSection` passou a aceitar também `'objetivos'`.
   - Novo bloco `else if (type === 'objetivos')` no listener de `crudSave`: computa `const objType = 'obj_' + formData.prazo` e aplica a mesma lógica de versionamento de Missão/Visão (move o registro atual **daquele prazo específico** para o histórico, cria um novo com `id`/`timestamp` frescos e `type: objType`) — assim, atualizar um prazo nunca afeta o histórico dos outros dois.
   - `hideAllViews()` passou a incluir `'view-objetivos-educacional'`.
   - Botões "← Voltar para Objetivos" (topo e rodapé) registrados uma única vez via flag `btnVoltarObjetivosListenersAttached` (mesmo padrão de Missão/Visão).
5. **`js/modules/crudModal.js`**: `'objetivos'` adicionado a `SELF_MANAGED_TYPES` (junto com `'missao'`/`'visao'`), evitando o mesmo bug de duplicação de registro (`"Invalid Date"`) documentado na seção 3.10 do `MANUAL_TECNICO.md` — desta vez prevenido desde a primeira implementação, sem necessidade de depuração.
6. Testado: cadastro de um objetivo de Médio Prazo e outro de Curto Prazo confirmando que (a) cada prazo é independente — atualizar um não mexe nos outros dois — e (b) nenhum registro "fantasma" (sem `id`/`timestamp`) foi criado. Dados de teste removidos do storage ao final; o storage do usuário ficou com as três seções vazias ("Nenhum objetivo cadastrado ainda."), prontas para uso real.

## 3. Plano de Rollback / Desfazer
1. Em `index.html`: remover o bloco `<div id="view-objetivos-educacional">...</div>` (logo após o fechamento de `view-visao-educacional`, dentro de `<main>`) e o `<form id="form-objetivos">...</form>` (logo após `form-visao`, dentro de `#global-crud-modal`).
2. Em `js/modules/formMappers.js`: remover a entrada `'objetivos'` de `FORM_REGISTRY`.
3. Em `js/modules/formLoaders.js`: remover a linha `'objetivos': this.loadBasicForm.bind(this)`.
4. Em `js/modules/crudModal.js`: remover `'objetivos'` do array `SELF_MANAGED_TYPES`.
5. Em `js/app.js`: remover a linha `document.getElementById('menu-objetivos').addEventListener(...)`, a função `switchToObjetivosView()` inteira, o bloco `else if (type === 'objetivos')` do listener `crudSave`, a entrada `'view-objetivos-educacional'` do array de `hideAllViews()`, e a variável `btnVoltarObjetivosListenersAttached` (e remover `'objetivos'` do comentário de tipos de `currentStrategicSection`, se ainda existir).
