// js/modules/formMappers.js
// Registry centralizado de tipos de formulários com configuração

export const FORM_REGISTRY = {
  'atividade': {
    storageKey: 'planner_activities',
    fields: ['id', 'createdAt', 'title', 'desc', 'date', 'status', 'category', 'contexto', 'eisenhower'],
    titles: { create: 'Nova Atividade', edit: 'Editar Atividade' },
    defaults: { status: 'livre', eisenhower: '' },
    required: ['title'],
    dependencies: ['atividade-categoria', 'contexto'],
    conditionalFields: []
  },

  'atividade-categoria': {
    storageKey: 'planner_atividade-categoria',
    fields: ['id', 'nome'],
    titles: { create: 'Nova Categoria', edit: 'Editar Categoria' },
    defaults: {},
    required: ['nome'],
    dependencies: [],
    conditionalFields: []
  },

  'contexto': {
    storageKey: 'planner_contexto',
    fields: ['id', 'nome'],
    titles: { create: 'Novo Contexto', edit: 'Editar Contexto' },
    defaults: {},
    required: ['nome'],
    dependencies: [],
    conditionalFields: []
  },

  'estrategia': {
    storageKey: 'planner_strategies',
    fields: ['id', 'type', 'content', 'date'],
    titles: { create: 'Nova Estratégia', edit: 'Editar Estratégia' },
    defaults: { type: 'missao' },
    required: ['content'],
    dependencies: [],
    conditionalFields: []
  },

  'missao': {
    storageKey: 'planner_strategies',
    fields: ['id', 'type', 'content', 'timestamp'],
    titles: { create: 'Atualizar Missão', edit: 'Editar Missão' },
    defaults: { type: 'missao' },
    required: ['content'],
    dependencies: [],
    conditionalFields: []
  },

  'visao': {
    storageKey: 'planner_strategies',
    fields: ['id', 'type', 'content', 'timestamp'],
    titles: { create: 'Atualizar Visão', edit: 'Editar Visão' },
    defaults: { type: 'visao' },
    required: ['content'],
    dependencies: [],
    conditionalFields: []
  },

  'objetivos': {
    storageKey: 'planner_strategies',
    fields: ['id', 'type', 'prazo', 'content', 'timestamp'],
    titles: { create: 'Atualizar Objetivo', edit: 'Editar Objetivo' },
    defaults: { type: 'objetivos', prazo: 'longo' },
    required: ['content'],
    dependencies: [],
    conditionalFields: []
  },

  'plano_anual': {
    storageKey: 'planner_strategies',
    fields: ['id', 'type', 'content', 'timestamp'],
    titles: { create: 'Atualizar Plano Anual', edit: 'Editar Plano Anual' },
    defaults: { type: 'plano_anual' },
    required: ['content'],
    dependencies: [],
    conditionalFields: []
  },

  'plano_mensal': {
    storageKey: 'planner_strategies',
    fields: ['id', 'type', 'content', 'timestamp'],
    titles: { create: 'Atualizar Plano Mensal', edit: 'Editar Plano Mensal' },
    defaults: { type: 'plano_mensal' },
    required: ['content'],
    dependencies: [],
    conditionalFields: []
  },

  'habito': {
    storageKey: 'planner_habito',
    fields: ['id', 'question', 'category'],
    titles: { create: 'Configurar Hábito', edit: 'Editar Hábito' },
    defaults: { category: 'Outros' },
    required: ['question'],
    dependencies: [],
    conditionalFields: []
  },

  'historico': {
    storageKey: 'planner_historico',
    fields: ['id', 'date', 'fato'],
    titles: { create: 'Inserir Fato Histórico', edit: 'Editar Fato Histórico' },
    defaults: {},
    required: ['date', 'fato'],
    dependencies: [],
    conditionalFields: []
  },

  'motivacional': {
    storageKey: 'planner_motivacional',
    fields: ['id', 'citacao', 'autor'],
    titles: { create: 'Inserir Motivacional', edit: 'Editar Mensagem' },
    defaults: {},
    required: ['citacao'],
    dependencies: [],
    conditionalFields: []
  },

  'devocional': {
    storageKey: 'planner_devocional',
    fields: ['id', 'passagem', 'reflexao'],
    titles: { create: 'Inserir Devocional', edit: 'Editar Devocional' },
    defaults: {},
    required: ['reflexao'],
    dependencies: [],
    conditionalFields: []
  },

  'compras': {
    storageKey: 'planner_compras',
    fields: ['id', 'item', 'detalhes', 'categoria'],
    titles: { create: 'Inserir Item de Compra', edit: 'Editar Item' },
    defaults: { categoria: 'Outros' },
    required: ['item'],
    dependencies: [],
    conditionalFields: []
  },

  'alarme': {
    storageKey: 'planner_alarme',
    fields: ['id', 'title', 'time', 'recurrence', 'date', 'weekdays'],
    titles: { create: 'Novo Alarme', edit: 'Editar Alarme' },
    defaults: { recurrence: 'diario', time: '20:00' },
    required: ['title', 'time'],
    dependencies: [],
    conditionalFields: ['alarme-date-container', 'alarme-weekdays-container']
  }
};

// Helpers para acessar configurações

export class FormMappers {
  static getStorageKey(type) {
    const config = FORM_REGISTRY[type];
    return config ? config.storageKey : null;
  }

  static getFields(type) {
    const config = FORM_REGISTRY[type];
    return config ? config.fields : [];
  }

  static getTitle(type, action = 'create') {
    const config = FORM_REGISTRY[type];
    return config ? config.titles[action] : 'Editar';
  }

  static getDefaults(type) {
    const config = FORM_REGISTRY[type];
    return config ? config.defaults : {};
  }

  static getRequired(type) {
    const config = FORM_REGISTRY[type];
    return config ? config.required : [];
  }

  static getDependencies(type) {
    const config = FORM_REGISTRY[type];
    return config ? config.dependencies : [];
  }

  static getConditionalFields(type) {
    const config = FORM_REGISTRY[type];
    return config ? config.conditionalFields : [];
  }

  static getFormElement(type) {
    return document.getElementById(`form-${type}`);
  }

  static getFieldElement(type, field) {
    return document.getElementById(`${type}-${field}`);
  }

  static getAllTypes() {
    return Object.keys(FORM_REGISTRY);
  }

  static isValidType(type) {
    return type in FORM_REGISTRY;
  }
}
