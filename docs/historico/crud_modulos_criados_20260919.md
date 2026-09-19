# Implementação: Módulos CRUD em Arquitetura ES6

**Data/Hora:** 2026-09-19_12:00
**Responsável:** Claude Code & User
**Fase:** 1 - Criação dos módulos menores (formMappers, formValidators, formLoaders)

## O que foi feito

Iniciada a refatoração do Modal CRUD monolítico em `app.js` (~280 linhas) em módulos ES6 limpos e reutilizáveis. Fase 1 criou os três módulos menores:

### 1. `js/modules/crud/formMappers.js` (~280 linhas)
**Responsabilidade:** Registry centralizado de configuração de formulários

**Conteúdo:**
- `FORM_REGISTRY`: Objeto com metadados de 15 tipos de formulários:
  - Operacional: atividade, atividade-categoria, contexto, habito, historico, alarme, motivacional, devocional, compras
  - Estratégico: estrategia, missao, visao, objetivos
  - Tático: plano_anual, plano_mensal, plano_semanal

- Para cada tipo, mapeia:
  - `storageKey`: Chave do localStorage/storage onde salva
  - `formId`: ID do formulário HTML
  - `fields`: Lista de campos
  - `titles`: Títulos para create/edit
  - `requires`: Campos obrigatórios
  - `dynamicSelects`: Selects carregadas de storage (ex: categories)
  - `conditionalFields`: Campos que aparecem/desaparecem (ex: Alarme)
  - `defaults`: Valores padrão ao criar
  - `selfManaged`: Flag se é gerenciado manualmente em app.js

- Helper functions:
  - `getStorageKey(type)` - Retorna chave de armazenamento
  - `getFormConfig(type)` - Retorna config completa
  - `getFormTitle(type, action)` - Retorna título
  - `getFormFields(type)` - Retorna lista de campos
  - `getRequiredFields(type)` - Retorna campos obrigatórios
  - `getFormDefaults(type)` - Retorna valores padrão
  - `isSelfManaged(type)` - Verifica se é auto-gerenciado
  - `getDynamicSelects(type)` - Retorna selects dinâmicas
  - `getConditionalFields(type)` - Retorna campos condicionais

### 2. `js/modules/crud/formValidators.js` (~300 linhas)
**Responsabilidade:** Validações mínimas de dados por tipo

**Conteúdo:**
- `FormValidators.validate(type, data)` - Valida dados genéricos
  - Retorna: `{ valid: boolean, errors: { fieldName: 'mensagem' } }`
  - Valida campos obrigatórios automaticamente
  - Chama validador específico por tipo se existir

- Validadores específicos por tipo:
  - `validateAtividade`: Título não-vazio, data válida, status válido, Eisenhower válido
  - `validateAlarme`: Tipo válido, hora válida (HH:mm), data válida, dias semana válidos
  - `validateHistorico`: Data válida, título não-vazio
  - `validateCompras`: Quantidade positiva, preço não-negativo
  - `validateEstrategia`, `validateHabito`, `validateMissao`, `validateVisao`, `validateObjetivos`, `validatePlanoAnual`, `validatePlanoMensal`, `validatePlanoSemanal`

- Helper methods para validação:
  - `isValidDate(dateStr)` - Valida YYYY-MM-DD
  - `isValidTime(timeStr)` - Valida HH:mm
  - `isValidEmail(email)` - Valida email
  - `isValidUrl(url)` - Valida URL

### 3. `js/modules/crud/formLoaders.js` (~350 linhas)
**Responsabilidade:** Carregar e preencher formulários com dados

**Conteúdo:**
- `FormLoaders.loadForm(type, data, storageService)` - Carrega e preenche um formulário
  - Se `data` é nulo: preenche com defaults (modo criar)
  - Se `data` existe: preenche com dados (modo editar)
  - Popula selects dinâmicas
  - Lida com campos condicionais

- `fillFormFields(type, form, data)` - Preenche campos HTML
  - Trata diferentes tipos de input (text, checkbox, date, select, textarea, etc.)

- `populateSelect(type, selectField, form, storageService)` - Popula select dinâmica
  - Para "category" em atividade → busca de `planner_atividade_categoria`
  - Para "contexto" em atividade → busca de `planner_contextos`

- `handleAlarmeConditionals(form, data)` - Mostra/esconde campos baseado em seleção
  - Alarme: mostra data se recorrência=única, mostra dias se recorrência=semanal

- `extractFormData(type, form)` - Extrai dados de um formulário (form → objeto)
  - Trata tipos especiais (checkbox, number)

- `clearForm(type)` - Limpa um formulário

- `displayErrors(type, errors)` - Exibe erros de validação inline
  - Procura por spans `.form-error` com ID `{type}-{field}-error`
  - Mostra/esconde elementos de erro

- `clearErrors(type)` - Limpa erros de um formulário

- `loadTableData(storageKey, storageService, filters)` - Carrega dados para listagem
  - Suporta filtros: status, category, search

### 4. `js/modules/crud/index.js` (~10 linhas)
**Responsabilidade:** Exportar todos os módulos centralizadamente

## Próximas Fases (Não Implementadas Ainda)

### Fase 2: Refatoração de crudModal.js
- Refatorar `js/modules/crudModal.js` para orquestrador usando os 3 módulos criados
- Implementar: open(), submit(), close()
- Remover duplicação de openModal() do app.js

### Fase 3: Integração com app.js
- Remover Modal CRUD monolítico (linhas 230-510)
- Importar e instanciar CRUDModal
- Atualizar window.appRouter.openModal()
- Manter compatibilidade com listeners existentes

## Benefícios da Refatoração

✅ **Separação de Responsabilidades:**
- formMappers: Configuração
- formValidators: Validação
- formLoaders: IO e preenchimento
- crudModal: Orquestração

✅ **Reutilização:**
- Validadores podem ser usados em exports/relatórios
- Loaders podem ser usados em migrações
- Registry centralizado evita duplicação

✅ **Testabilidade:**
- Cada módulo pode ser testado isoladamente
- Validadores não dependem de DOM

✅ **Manutenibilidade:**
- Adicionar novo tipo: 1 entrada em formMappers
- Mudar armazenamento: 1 linha em formMappers
- Adicionar validação: 1 função em formValidators

## Estrutura de Diretórios

```
js/modules/
├── crud/                        # NOVO: organizado em subpasta
│   ├── formMappers.js           # Registry & config (~280 linhas)
│   ├── formValidators.js        # Validações (~300 linhas)
│   ├── formLoaders.js           # Carregamento & preenchimento (~350 linhas)
│   ├── crudModal.js             # TODO: Orquestrador (~200 linhas)
│   └── index.js                 # Exportações centralizadas
├── modal.js                     # Será consolidado com crudModal.js
├── views.js
├── renderer.js
├── manager.js
└── ...
```

## Padrão HTML Confirmado

Todos os formulários seguem este padrão:

```html
<form id="form-{tipo}" class="space-y-4 hidden">
  <input type="hidden" id="{tipo}-id">
  <input type="hidden" id="{tipo}-created-at">
  <div>
    <label>Campo</label>
    <input/select/textarea id="{tipo}-{campo}" />
    <span class="form-error hidden" id="{tipo}-{campo}-error"></span>
  </div>
  ...
  <div class="pt-4 flex justify-end space-x-2">
    <button type="button" class="btn-cancel-modal">Cancelar</button>
    <button type="submit">Salvar</button>
  </div>
</form>
```

## Checklist para Próximas Fases

- [ ] Refatorar `crudModal.js` usando os 3 módulos
- [ ] Remover Modal CRUD monolítico de `app.js`
- [ ] Instanciar CRUDModal no bootstrap
- [ ] Atualizar `window.appRouter.openModal()`
- [ ] Testar todos os 15 tipos de formulário (create/edit/delete)
- [ ] Documentar API em `MANUAL_TECNICO.md`
- [ ] Considerar: pré-gerar spans `.form-error` no HTML (acessibilidade)
- [ ] Considerar: padronizar storage keys (`planner_activities` → `planner_atividades`)

## Notas

1. **Validação Mínima:** Implementada apenas validação básica (obrigatório, formato, tipo). Pode evoluir conforme necessidade.

2. **Campos Condicionais:** Alarme é o único tipo com campos condicionais implementados. Padrão pode ser reutilizado para outros tipos se necessário.

3. **Auto-Managed:** Tipos como missao, visao, objetivos, plano_* têm `selfManaged: true` porque possuem lógica customizada em app.js (versionamento, período, etc.).

4. **Storage Service:** Todos os módulos aceitam `storageService` como parâmetro para manter flexibilidade (localStorage ou chrome.storage.local).

5. **Próxima Iteração:** Após crudModal.js, considerar padronizar storage keys globalmente e criar script de migração.
