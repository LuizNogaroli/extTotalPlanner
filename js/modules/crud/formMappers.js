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
  // Schema alinhado aos IDs reais em index.html (form-historico: historico-date,
  // historico-fato) e ao que renderManagerList() em js/app.js já lê (item.date, item.fato).
  historico: {
    storageKey: 'planner_historico',
    formId: 'form-historico',
    fields: ['id', 'createdAt', 'date', 'fato'],
    titles: { create: 'Novo Registro de Histórico', edit: 'Editar Histórico' },
    requires: ['date', 'fato'],
    defaults: {}
  },

  // ==================== NOTIFICAÇÕES E LEMBRETES ====================
  // Schema alinhado aos IDs reais em index.html (form-alarme) e ao que
  // background.js/renderManagerList (js/app.js) já leem em `planner_alarme`.
  alarme: {
    storageKey: 'planner_alarme',
    formId: 'form-alarme',
    fields: ['id', 'title', 'time', 'recurrence', 'date', 'weekdays'],
    titles: { create: 'Novo Alarme', edit: 'Editar Alarme' },
    requires: ['title', 'time'],
    conditionalFields: {
      recurrence: {
        'diario': [],
        'unico': ['date'],
        'semanal': ['weekdays']
      }
    },
    defaults: { recurrence: 'diario', time: '20:00' }
  },

  // ==================== MOTIVACIONAL ====================
  // Corrigido na v1.47: os campos declarados aqui (titulo/descricao/tipo/data) não
  // existiam em form-motivacional (index.html), que só tem citacao/autor — o Salvar
  // sempre falhava a validação em silêncio (extractFormData pulava os campos
  // inexistentes, requires:['titulo'] nunca era satisfeito). Ver §3.26.
  motivacional: {
    storageKey: 'planner_motivacional',
    formId: 'form-motivacional',
    fields: ['id', 'createdAt', 'citacao', 'autor'],
    titles: { create: 'Novo Item Motivacional', edit: 'Editar Motivacional' },
    requires: ['citacao'],
    defaults: {}
  },

  // ==================== DEVOCIONAL ====================
  // Corrigido na v1.47: mesmo bug do Motivacional acima — os campos reais em
  // form-devocional são passagem/reflexao, não data/oracoes. Ver §3.26.
  devocional: {
    storageKey: 'planner_devocional',
    formId: 'form-devocional',
    fields: ['id', 'createdAt', 'passagem', 'reflexao'],
    titles: { create: 'Novo Devocional', edit: 'Editar Devocional' },
    requires: ['passagem', 'reflexao'],
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

  valores: {
    storageKey: 'planner_strategies',
    formId: 'form-valores',
    fields: ['id', 'createdAt', 'content'],
    titles: { create: 'Definir Valores', edit: 'Editar Valores' },
    requires: ['content'],
    defaults: { type: 'valores' },
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
