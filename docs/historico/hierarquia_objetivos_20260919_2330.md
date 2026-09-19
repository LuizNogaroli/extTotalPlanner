# Hierarquia dos Objetivos: Longo → Médio → Curto Prazo
**Data:** 19 de Setembro de 2026

## O que foi feito
O usuário pediu que a hierarquia dos objetivos fosse respeitada na exibição: primeiro os de Longo Prazo, depois Médio Prazo, e por fim Curto Prazo — refletindo a lógica natural de planejamento (a visão de longo prazo se desdobra em objetivos de médio prazo, que por sua vez se desdobram em ações de curto prazo).

## 1. Estado Anterior (Antes)
- Na página de Objetivos (`switchToObjetivosView`), as seções apareciam na ordem Curto → Médio → Longo Prazo.
- No `<select id="objetivos-prazo">` do modal "Atualizar Objetivo", as opções seguiam a mesma ordem (Curto → Médio → Longo), com "Curto Prazo" pré-selecionado por padrão.
- Na visão geral genérica mais antiga (`switchToStrategicView`, que lista Missão/Visão/Objetivos em cards), os objetivos também seguiam Curto → Médio → Longo.

## 2. Estado Novo (Depois)
1. **`js/app.js`** — `switchToObjetivosView()`: array `prazoConfig` reordenado para `['obj_longo', 'obj_medio', 'obj_curto']`, determinando tanto a ordem das seções na página quanto do `<details>` de histórico de cada uma.
2. **`js/app.js`** — `switchToStrategicView()`: array `typesConfig` reordenado da mesma forma, mantendo consistência entre as duas telas que listam objetivos.
3. **`index.html`** — `<select id="objetivos-prazo">`: opções reordenadas para `longo`/`medio`/`curto` (a primeira `<option>` no HTML é a que aparece selecionada por padrão ao abrir o formulário sem dados prévios).
4. **`js/modules/formMappers.js`** — `defaults.prazo` do tipo `'objetivos'` alterado de `'curto'` para `'longo'`, para que o modal abra já pré-selecionado com o topo da hierarquia (consistente com a nova ordem de exibição).
5. Validado no navegador: a página de Objetivos agora mostra Longo → Médio → Curto Prazo, e o modal "Atualizar Objetivo" abre com "🏆 Longo Prazo" selecionado por padrão.

## 3. Plano de Rollback / Desfazer
1. Em `js/app.js`, em `switchToObjetivosView()`, reverter `prazoConfig` para `['obj_curto', 'obj_medio', 'obj_longo']`.
2. Em `js/app.js`, em `switchToStrategicView()`, reverter `typesConfig` para a mesma ordem original (`obj_curto`, `obj_medio`, `obj_longo` depois de missão/visão).
3. Em `index.html`, reordenar as `<option>` de `#objetivos-prazo` de volta para `curto`/`medio`/`longo`.
4. Em `js/modules/formMappers.js`, reverter `defaults.prazo` do tipo `'objetivos'` de `'longo'` para `'curto'`.
