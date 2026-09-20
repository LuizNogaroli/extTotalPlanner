/**
 * formMappers.js - Registry centralizado de tipos de formulários
 * Define configuração, campos, storage keys e metadados para cada tipo de formulário
 */

export const FORM_REGISTRY = {
  // ==================== OPERACIONAL ====================
  atividade: {
    storageKey: 'planner_activities',
    formId: 'form-atividade',
    fields: ['id', 'createdAt', 'title', 'desc', 'date', 'status', 'category', 'contexto', 'eisenhower'],
    titles: { create: 'Nova Atividade', edit: 'Editar Atividade' },
    requires: ['title'],
    dynamicSelects: ['category', 'contexto'], // Carregados de storage
    defaults: { status: 'livre', eisenhower: 'q2' }
  },

  'atividade-categoria': {
    storageKey: 'planner_atividade_categoria',
    formId: 'form-atividade-categoria',
    fields: ['id', 'createdAt', 'nome'],
    titles: { create: 'Nova Categoria', edit: 'Editar Categoria' },
    requires: ['nome'],
    defaults: {}
  },

  contexto: {
    storageKey: 'planner_contextos',
    formId: 'form-contexto',
    fields: ['id', 'createdAt', 'nome'],
    titles: { create: 'Novo Contexto', edit: 'Editar Contexto' },
    requires: ['nome'],
    defaults: {}
  },

  // ==================== ESTRATÉGICO ====================
  estrategia: {
    storageKey: 'planner_strategies',
    formId: 'form-estrategia',
    fields: ['id', 'createdAt', 'tipo', 'title', 'desc', 'periodo', 'status'],
    titles: { create: 'Nova Estratégia', edit: 'Editar Estratégia' },
    requires: ['tipo', 'title'],
    defaults: { status: 'ativo' }
  },

  habito: {
    storageKey: 'planner_habitos',
    formId: 'form-habito',
    fields: ['id', 'createdAt', 'nome', 'descricao', 'frequencia', 'status'],
    titles: { create: 'Novo Hábito', edit: 'Editar Hábito' },
    requires: ['nome'],
    defaults: { frequencia: 'diario', status: 'ativo' }
  },

  // ==================== HISTÓRICO E REFERÊNCIA ====================
  historico: {
    storageKey: 'planner_historico',
    formId: 'form-historico',
    fields: ['id', 'createdAt', 'data', 'titulo', 'descricao', 'tipo'],
    titles: { create: 'Novo Registro de Histórico', edit: 'Editar Histórico' },
    requires: ['data', 'titulo'],
    defaults: {}
  },

  // ==================== NOTIFICAÇÕES E LEMBRETES ====================
  alarme: {
    storageKey: 'planner_alarmes',
    formId: 'form-alarme',
    fields: ['id', 'createdAt', 'titulo', 'descricao', 'tipo', 'data', 'hora', 'recorrencia', 'diasemana', 'ativo'],
    titles: { create: 'Novo Alarme', edit: 'Editar Alarme' },
    requires: ['titulo', 'tipo'],
    conditionalFields: {
      recorrencia: {
        'unica': ['data', 'hora'],
        'diaria': ['hora'],
        'semanal': ['hora', 'diasemana'],
        'mensal': ['hora']
      }
    },
    defaults: { recorrencia: 'unica', ativo: true }
  },

  // ==================== MOTIVACIONAL ====================
  motivacional: {
    storageKey: 'planner_motivacional',
    formId: 'form-motivacional',
    fields: ['id', 'createdAt', 'titulo', 'descricao', 'tipo', 'data'],
    titles: { create: 'Novo Item Motivacional', edit: 'Editar Motivacional' },
    requires: ['titulo'],
    defaults: {}
  },

  // ==================== DEVOCIONAL ====================
  devocional: {
    storageKey: 'planner_devocional',
    formId: 'form-devocional',
    fields: ['id', 'createdAt', 'data', 'passagem', 'reflexao', 'oracoes'],
    titles: { create: 'Novo Devocional', edit: 'Editar Devocional' },
    requires: ['data', 'passagem'],
    defaults: {}
  },

  // ==================== LISTA DE COMPRAS ====================
  compras: {
    storageKey: 'planner_lista_compras',
    formId: 'form-compras',
    fields: ['id', 'createdAt', 'item', 'categoria', 'quantidade', 'preco', 'concluido', 'loja'],
    titles: { create: 'Novo Item', edit: 'Editar Item' },
    requires: ['item'],
    defaults: { concluido: false }
  },

  // ==================== NÍVEL ESTRATÉGICO ====================
  missao: {
    storageKey: 'planner_strategies',
    formId: 'form-missao',
    fields: ['id', 'createdAt', 'content'],
    titles: { create: 'Definir Missão', edit: 'Editar Missão' },
    requires: ['content'],
    defaults: { type: 'missao' },
    selfManaged: true // Gerenciado manualmente em app.js
  },

  visao: {
    storageKey: 'planner_strategies',
    formId: 'form-visao',
    fields: ['id', 'createdAt', 'content'],
    titles: { create: 'Definir Visão', edit: 'Editar Visão' },
    requires: ['content'],
    defaults: { type: 'visao' },
    selfManaged: true // Gerenciado manualmente em app.js
  },

  objetivos: {
    storageKey: 'planner_strategies',
    formId: 'form-objetivos',
    fields: ['id', 'createdAt', 'prazo', 'content'],
    titles: { create: 'Novo Objetivo', edit: 'Editar Objetivo' },
    requires: ['prazo', 'content'],
    defaults: {},
    selfManaged: true // Gerenciado manualmente em app.js
  },

  // ==================== NÍVEL TÁTICO ====================
  plano_anual: {
    storageKey: 'planner_strategies',
    formId: 'form-plano_anual',
    fields: ['id', 'createdAt', 'content'],
    titles: { create: 'Definir Plano Anual', edit: 'Editar Plano Anual' },
    requires: ['content'],
    defaults: { type: 'plano_anual' },
    selfManaged: true // Gerenciado manualmente em app.js
  },

  plano_mensal: {
    storageKey: 'planner_strategies',
    formId: 'form-plano_mensal',
    fields: ['id', 'createdAt', 'content'],
    titles: { create: 'Definir Plano Mensal', edit: 'Editar Plano Mensal' },
    requires: ['content'],
    defaults: { type: 'plano_mensal' },
    selfManaged: true // Gerenciado manualmente em app.js
  },

  plano_semanal: {
    storageKey: 'planner_strategies',
    formId: 'form-plano_semanal',
    fields: ['id', 'createdAt', 'content'],
    titles: { create: 'Definir Plano Semanal', edit: 'Editar Plano Semanal' },
    requires: ['content'],
    defaults: { type: 'plano_semanal' },
    selfManaged: true // Gerenciado manualmente em app.js
  }
};

/**
 * Helper: Obter storage key para um tipo
 */
export function getStorageKey(type) {
  return FORM_REGISTRY[type]?.storageKey;
}

/**
 * Helper: Obter configuração completa de um tipo
 */
export function getFormConfig(type) {
  return FORM_REGISTRY[type];
}

/**
 * Helper: Obter título (create ou edit) para um tipo
 */
export function getFormTitle(type, action = 'create') {
  const config = FORM_REGISTRY[type];
  return config?.titles?.[action] || `${action} ${type}`;
}

/**
 * Helper: Obter todos os campos para um tipo
 */
export function getFormFields(type) {
  return FORM_REGISTRY[type]?.fields || [];
}

/**
 * Helper: Obter campos obrigatórios para um tipo
 */
export function getRequiredFields(type) {
  return FORM_REGISTRY[type]?.requires || [];
}

/**
 * Helper: Obter valores padrão para um tipo
 */
export function getFormDefaults(type) {
  return FORM_REGISTRY[type]?.defaults || {};
}

/**
 * Helper: Verificar se um tipo é auto-gerenciado (customizado no app.js)
 */
export function isSelfManaged(type) {
  return FORM_REGISTRY[type]?.selfManaged || false;
}

/**
 * Helper: Obter selects dinâmicos (carregados de storage) para um tipo
 */
export function getDynamicSelects(type) {
  return FORM_REGISTRY[type]?.dynamicSelects || [];
}

/**
 * Helper: Obter campos condicionais para um tipo
 */
export function getConditionalFields(type) {
  return FORM_REGISTRY[type]?.conditionalFields || {};
}

export default FORM_REGISTRY;
