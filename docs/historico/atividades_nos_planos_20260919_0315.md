# Seção "Atividades" Integrada aos Planos Anual, Mensal e Semanal

**Data/Hora:** 2026-09-19_0315
**Responsável:** Claude Code & User

## O que foi feito

Adicionada a seção **"Atividades"** em cada um dos três Planos (Anual, Mensal e Semanal), renderizando uma listagem de cards responsivos abaixo do texto versionado do plano. Cada card exibe título, descrição, prioridade (quadrante Eisenhower), status, categoria, contexto e três botões de ação: Ver, Editar e **Transferir** (realocação entre planos).

### Mudanças Técnicas

1. **`js/app.js` — Função `renderPlanoVersionado()` ampliada:**
   - Linhas 559-599: Nova seção HTML com título "Atividades" + contador + botão "+ Adicionar"
   - Filtragem automática: `activities.filter(a => a.transferPeriodo && typeof a.transferPeriodo === 'object' && a.transferPeriodo.periodo === periodoSelecionado)`
   - Cada card contém: `<div class="w-full bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">` (responsive, ocupando 100% da linha)
   - Botões com classes `.activity-view-btn`, `.activity-edit-btn`, `.activity-transfer-btn` + `data-id="${activity.id}"`

2. **`js/app.js` — Listeners de ação dos cards:**
   - Linhas 690-698: `.activity-view-btn` → `openViewModal(activity)`
   - Linhas 698-706: `.activity-edit-btn` → `crudModal.open('atividade', activity)`
   - Linhas 699-706: `.activity-transfer-btn` → `openTransferModal(activity)` (função já existente no projeto)

3. **`js/app.js` — Plano Semanal ativado:**
   - Linhas 716-718: Adicionado suporte para `prazo === 'semanal'` chamando `renderPlanoVersionado()` com granularidade `'semana'`
   - Period key gerado como `getPeriodoKey(Date.now(), 'semana')` (formato `2026-w38`)

4. **Dados de teste populados:**
   - Plano Anual: 4 atividades
   - Plano Mensal: 3 atividades
   - Plano Semanal: 4 atividades
   - Total: **11 atividades** com `transferPeriodo` preenchido corretamente

## Por que

O usuário solicitou adicionar uma seção de Atividades em cada Plano para permitir:
1. **Visualização consolidada**: Ver todas as atividades de um período específico (ano/mês/semana) sem navegar entre datas
2. **Gerenciamento contextualizado**: Criar, editar e transferir atividades diretamente no plano desejado
3. **Responsividade**: Cards que se adaptam a diferentes tamanhos de tela (mobile/desktop)

A mecânica de transferência (`transferPeriodo`) já existia no sistema; agora ganhou UI integrada nos planos.

## Estado Anterior

- Planos Anual/Mensal/Semanal mostravam apenas o texto versionado (sem seção de atividades)
- Plano Semanal era marcado como "🚧 em construção"
- Atividades só eram visíveis na tela dedicada "Atividade" (menu Operacional) ou na Visão Diária

## Estado Novo

- Cada Plano (Anual/Mensal/Semanal) agora exibe:
  1. **Card de texto versionado** (já existente)
  2. **Barra de navegação por período** (Anual/Mensal, já existente)
  3. **NEW: Seção "Atividades"** com:
     - Título + contador (`"Atividades (X)"`)
     - Botão "+ Adicionar" (chama `crudModal.open('atividade')` com `window.atividadePlanoContexto` pré-preenchido)
     - Listagem em cards (responsivos, ocupando linha inteira)
     - Cada card com: título, descrição, emojis de prioridade/status/categoria/contexto
     - Ações por card: "👁️ Ver" (modal read-only), "✏️ Editar" (abre formulário), "🔄 Transferir" (realoca entre planos)
     - Mensagem vazia quando não há atividades: "Nenhuma atividade neste período. Clique em "+ Adicionar" para criar uma."

## Padrão de Filtragem (Key Technical Point)

As atividades são filtradas automaticamente pelo campo `transferPeriodo`:
```javascript
const atividadesDoPlano = activities.filter(a => 
  a.transferPeriodo && 
  typeof a.transferPeriodo === 'object' && 
  a.transferPeriodo.periodo === periodoSelecionado
);
```

- `transferPeriodo` é um objeto: `{ tipo: 'plano_anual'|'plano_mensal'|'plano_semanal', periodo: '2026'|'2026-09'|'2026-w38' }`
- Comparação **não** é literal de string (erro anterior: `a.transferPeriodo === periodoLabel` comparava objeto com string)
- Cada atividade só aparece no plano para o qual foi **transferida explicitamente** (via botão "Transferir")

## Fluxo de Criação de Atividade (via "+ Adicionar")

1. Usuário clica "+ Adicionar" dentro de um Plano (Anual/Mensal/Semanal)
2. Modal CRUD de atividade abre com `window.atividadePlanoContexto` pré-preenchido:
   ```javascript
   window.atividadePlanoContexto = { tipo: 'plano_anual', periodo: '2026' };
   ```
3. Ao salvar, `transferPeriodo` é automaticamente definido com esse contexto
4. Atividade aparece imediatamente na seção do Plano correspondente

## Plano de Rollback / Desfazer

1. **Em `js/app.js`:**
   - Remover linhas 559-599 (seção HTML de Atividades em `renderPlanoVersionado()`)
   - Remover linhas 690-706 (listeners dos botões de ação)
   - Remover linhas 716-718 (suporte para `prazo === 'semanal'`)
   - Restaurar chamada `renderPlanoVersionado(contentArea, 'plano_semanal', 'Plano Semanal', '📋', 'semana')` para renderizar apenas o placeholder "🚧 em construção"

2. **Dados de teste:**
   - Limpar `localStorage` ou `chrome.storage.local` → chave `planner_activities` (via DevTools ou função JavaScript)

3. **Sem mudanças em:**
   - `index.html` (nenhuma view/form foi adicionada)
   - `formMappers.js`/`formLoaders.js` (tipo `atividade` já existe)
   - Função `openTransferModal()` (já existia antes)

## Validação

- ✅ 11 atividades renderizadas corretamente (4 Anual, 3 Mensal, 4 Semanal)
- ✅ Botões "Ver", "Editar", "Transferir" presentes em todos os cards
- ✅ Cards ocupam 100% da linha (responsivos)
- ✅ Filtragem por período funciona (atividades não vazam entre planos)
- ✅ Plano Semanal deixou de ser "em construção"
- ✅ Botão "+ Adicionar" abre modal CRUD com contexto pré-preenchido
