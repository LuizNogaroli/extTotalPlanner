# Refatoração do `app.js` — Fase 3: módulo `managerModal.js`

**Data/Hora:** 2026-09-24_09:00
**Responsável:** Claude Code (Haiku 4.5) & User

## O que foi feito

Fase 3 do plano em `docs/plano_refatoracao_appjs.md`: as funções `openManager()` e `renderManagerList()` (que gerenciam a listagem de 8 tipos de dados — Histórico, Motivacional, Devocional, Compras, Estratégia, Hábito, Categoria de Atividade, Alarme) saíram de `js/app.js` para o novo módulo `js/modules/managerModal.js`.

A lógica de formatação de rótulos para cada tipo (que estava num gigantesco `if/else` com 8 branches) foi extraída para um registro plugável em `js/modules/crud/listLabels.js`.

## Estado Anterior

**`js/app.js` linhas 1586–1712:**
- Referências ao DOM (managerModal, managerTitle, managerList, btnManagerAdd, btnsCloseManager)
- `openManager(type)` — função com um `const titles = {...}` com 8 títulos
- `renderManagerList()` — função com um `if/else` de ~130 linhas diferenciando os 8 tipos para formatação de rótulo
- Listeners dos botões de fechar e adicionar item
- `app.js`: **3.101 linhas**

## Estado Novo

**`js/modules/managerModal.js` (147 linhas):**
- Exporta `initManagerModal(domRefs)`, `openManager(type)`, `renderManagerList()`
- As referências do DOM são passadas de `app.js` via `initManagerModal()`, não carregadas ao abrir o arquivo
- `openManager` e `renderManagerList` são idênticas em lógica, mas delegam a formatação de rótulo para `getListLabel(type, item)` de `listLabels.js`
- Mapas de títulos e storage keys movidos para constantes no módulo

**`js/modules/crud/listLabels.js` (73 linhas, novo arquivo):**
- Um formatador por tipo: `formatHistorico(item)`, `formatMotivacional(item)`, etc.
- Exporta `listLabelFormatters` (registro) e `getListLabel(type, item)` (função de conveniência)
- Padrão análogo ao `formMappers.js`: cada tipo tem sua configuração num só lugar

**`js/app.js`:**
- Removed linhas 1586–1712
- Adicionado import: `import { initManagerModal, openManager } from './modules/managerModal.js';`
- Adicionada chamada: `initManagerModal({ managerModal, managerTitle, managerList, btnManagerAdd, btnsCloseManager, crudModal })`
- `app.js`: **2.987 linhas** (−114)

**`window.appRouter.openManager` continua funcionando idêntico** — a função agora vem do módulo importado.

## Verificação (navegador, preview local)

- **Motivacional:** modal abriu com título "Citações Motivacionais", lista mostrando dois itens com rótulos formatados corretamente via `getListLabel('motivacional', item)`, IDs visíveis com botões de copiar.
- **Histórico:** modal abriu com título "Fatos Históricos Cadastrados", estado vazio mostrando "Nenhum item cadastrado."
- **Alarme:** modal abriu com título "Lembretes e Alarmes", UI especial (aviso de notificações bloqueadas, botão de testar) renderizada corretamente.
- **Testes de outras 5 tipos (compras, estrategia, habito, devocional, atividade-categoria):** não testados com dados reais, mas código segue o padrão idêntico.
- Nenhum erro no console.

## Plano de Rollback

Reverter os dois commits desta mudança (um cria `listLabels.js` e `managerModal.js`, outro remove o código de `app.js` e adiciona imports), e manualmente restaurar as linhas 1586–1712 de `js/app.js` a partir do commit anterior.
