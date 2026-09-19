# Fase 2: Refatoração CRUD - crudModal.js Implementado

**Data/Hora:** 2026-09-19_12:30
**Responsável:** Claude Code & User
**Fase:** 2 - Refatoração do orquestrador CRUDModal

## O que foi feito

### Refatoração Completa de `js/modules/crudModal.js` (~190 linhas)

Reescrita completa do crudModal.js para usar corretamente os 3 módulos criados na Fase 1 (formMappers, formValidators, formLoaders) e consolidar a lógica do Modal CRUD que estava dispersa.

**Problemas Resolvidos:**
- ❌ Anterior: Tentava importar de paths incorretos (`'./formMappers.js'` ao invés de `'./crud/formMappers.js'`)
- ❌ Anterior: Tentava instanciar FormLoaders que é estática (`new FormLoaders(StorageService)`)
- ❌ Anterior: Chamava métodos que não existiam (`FormMappers.isValidType()`, `getAllTypes()`, `getFormElement()`)
- ❌ Anterior: Confundia nomes de métodos (`getTitle` ao invés de `getFormTitle`, `collectFormData` ao invés de `extractFormData`)
- ❌ Anterior: Colocava métodos de validação/UI em FormValidators quando deveriam estar em FormLoaders

### Arquitetura Implementada

```
CRUDModal (orquestrador)
├── open(type, data)
│   ├── Validar tipo usando FORM_REGISTRY
│   ├── Mostrar/esconder forms
│   ├── Atualizar título
│   ├── Carregar dados com FormLoaders.loadForm()
│   └── Registrar listener de submit
├── handleSubmit(e, type)
│   ├── Extrair dados: FormLoaders.extractFormData()
│   ├── Validar: FormValidators.validate()
│   ├── Se válido: this.save() ou dispatchSaveEvent() (self-managed)
│   └── Fechar modal
├── save(type, formData)
│   ├── Buscar items do storage
│   ├── Encontrar índice (se edição)
│   ├── Adicionar ou atualizar
│   └── Salvar ao storage
├── close()
│   ├── Esconder modal
│   └── Limpar erros de todos os formulários
└── dispatchSaveEvent(type, formData)
    └── Disparar 'crudSave' para app.js reagir
```

### Métodos Implementados

**Públicos:**
- `open(type, data = null)` - Abrir modal com formulário específico
  - Validação de tipo
  - Esconde todos, mostra o correto
  - Carrega dados (create/edit)
  - Registra listener de submit

- `close()` - Fechar modal e limpar erros

- `getCurrentType()` - Retorna tipo atual aberto

- `isOpen()` - Verifica se modal está aberto (novo helper)

**Privados (internos):**
- `registerFormSubmit(type, form)` - Registra listener com cache para limpar antigos
- `handleSubmit(e, type)` - Processa submit: extrai → valida → salva/dispara
- `save(type, formData)` - Salva genéricamente ao storage
- `dispatchSaveEvent(type, formData)` - Dispara evento customizado

### Tipos Auto-Gerenciados

Tipos cujas lógica é customizada no app.js:

```javascript
const SELF_MANAGED_TYPES = [
  'missao', 'visao', 'objetivos', 
  'plano_anual', 'plano_mensal', 'plano_semanal'
];
```

**Por quê:** Possuem versionamento/período/histórico customizado que roda de forma atômica com o evento `crudSave` em app.js. Exemplo:
- Antes de gravar novo `missao`, move valor anterior para histórico
- Planos precisam de lógica de período (ano, mês, semana)

### Integração com Módulos

**formMappers:**
- Usa `FORM_REGISTRY` para iterar tipos
- Usa helpers: `getFormConfig()`, `getFormTitle()`, `getStorageKey()`

**formValidators:**
- Usa `FormValidators.validate(type, data)` retorna `{ valid, errors }`

**formLoaders:**
- Usa métodos estáticos:
  - `FormLoaders.loadForm(type, data, StorageService)` - Carrega formulário
  - `FormLoaders.extractFormData(type, form)` - Extrai dados
  - `FormLoaders.displayErrors()` - Exibe erros inline
  - `FormLoaders.clearErrors()` - Limpa erros

### Compatibilidade

✅ **API Global Mantida:**
- `window.appRouter.openModal(type, data)` continua funcionando
- Listeners de `crudSave` no app.js continuam ouvindo
- Formulários HTML estrutura mantida

✅ **Eventos:**
- Dispara `crudSave` para tipos não-auto-gerenciados
- app.js re-renderiza views/tabelas ao receber evento

### Mudança no app.js (Já Implementada)

O app.js já estava pronto para usar CRUDModal:
```javascript
import { CRUDModal } from './modules/crudModal.js';
// ...
const crudModal = new CRUDModal(
  document.getElementById('global-crud-modal'),
  document.getElementById('modal-title'),
  StorageService
);

window.appRouter.openModal = (type, data = null) => crudModal.open(type, data);
```

## Melhorias Implementadas

✅ **Remoção de Duplicação:**
- Antes: Modal CRUD monolítico em app.js (linhas 230-510)
- Depois: Orquestrador limpo em crudModal.js usando módulos especializados

✅ **Separação de Responsabilidades:**
- formMappers: O QUE (configuração)
- formValidators: VALIDAÇÕES (regras de negócio)
- formLoaders: CARREGAMENTO (IO, preenchimento)
- crudModal: ORQUESTRAÇÃO (fluxo open → submit → save → close)

✅ **Testabilidade:**
- Cada módulo pode ser testado independentemente
- Sem dependências de DOM (exceto FormLoaders que precisa)
- Validadores podem ser reutilizados em exports/relatórios

✅ **Manutenibilidade:**
- Adicionar novo tipo: 1 entrada em formMappers
- Adicionar validação: 1 função em formValidators
- Mudar storage key: 1 linha em formMappers

## Próximas Fases

### Fase 3: Limpeza do app.js (Pendente)
- Remover Modal CRUD monolítico (linhas 230-510) que não será mais usado
- Verificar se app.js compila sem erros
- Testar todos os 15 tipos de formulário
- Validar que eventos `crudSave` funcionam para self-managed types

### Fase 3.1: Consolidação de modal.js (Opcional)
- modal.js ainda existe como ModalManager (arquivo antigo)
- Pode ser removido se não estiver em uso

### Fase 4: Documentação (Pendente)
- Atualizar MANUAL_TECNICO.md com nova arquitetura
- Adicionar guia "Como Adicionar Novo Tipo de Formulário"
- Documentar o padrão HTML esperado para novos forms

## Arquivos Criados/Modificados

### Criados
- ✅ `js/modules/crud/formMappers.js` (Fase 1)
- ✅ `js/modules/crud/formValidators.js` (Fase 1)
- ✅ `js/modules/crud/formLoaders.js` (Fase 1)
- ✅ `js/modules/crud/index.js` (Fase 1)
- ✅ `js/modules/crudModal.js` (Fase 2 - reescrito)

### Modificados
- ⏳ app.js (já usa CRUDModal, aguarda limpeza do monolítico em Fase 3)

### Não Alterados
- js/modules/modal.js (ModalManager antigo, pode ser removido em Fase 3.1)

## Checklist de Validação

- [ ] Compilar app.js sem erros
- [ ] Abrir um formulário (ex: Nova Atividade)
- [ ] Preencher dados
- [ ] Salvar e verificar se aparece na lista
- [ ] Editar um registro existente
- [ ] Validar erros de campos obrigatórios
- [ ] Testar todos os 15 tipos
- [ ] Testar tipos auto-gerenciados (missao, visao)
- [ ] Verificar que evento `crudSave` dispara
- [ ] Verificar que re-renderização funciona (tabelas, views)

## Notas Técnicas

1. **Cache de Handlers:** Cada form armazena seu handler de submit em `this.formSubmitHandlers[formId]` para permitir limpeza ao abrir outro formulário.

2. **Binding em Arrow Function:** `handleSubmit = async (e, type)` usa arrow function para manter `this` bound corretamente.

3. **Self-Managed Dispatch:** Tipos auto-gerenciados ainda disparam `crudSave`, mas sua persistência é feita pelo listener em app.js (versionamento customizado).

4. **Iteração sobre FORM_REGISTRY:** Usa `Object.keys(FORM_REGISTRY)` para iterar sobre tipos, mantendo flexibilidade sem um método separado `getAllTypes()`.

## Próximo Passo

**Fase 3:** Validar funcionamento e limpar o monolítico de app.js.
