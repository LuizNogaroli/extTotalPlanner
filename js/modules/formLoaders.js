// js/modules/formLoaders.js
// Carregamento de dados, população de selects e preenchimento de formulários

import { FormMappers } from './formMappers.js';

export class FormLoaders {
  constructor(StorageService) {
    this.StorageService = StorageService;
  }

  async loadForm(type, data = null) {
    if (!FormMappers.isValidType(type)) {
      throw new Error(`Tipo de formulário desconhecido: ${type}`);
    }

    const loaders = {
      'atividade': this.loadAtividadeForm.bind(this),
      'atividade-categoria': this.loadBasicForm.bind(this),
      'contexto': this.loadBasicForm.bind(this),
      'estrategia': this.loadEstrategiaForm.bind(this),
      'habito': this.loadBasicForm.bind(this),
      'historico': this.loadBasicForm.bind(this),
      'motivacional': this.loadBasicForm.bind(this),
      'devocional': this.loadBasicForm.bind(this),
      'compras': this.loadBasicForm.bind(this),
      'alarme': this.loadAlarmeForm.bind(this),
      'missao': this.loadBasicForm.bind(this),
      'visao': this.loadBasicForm.bind(this),
      'objetivos': this.loadBasicForm.bind(this),
      'plano_anual': this.loadBasicForm.bind(this),
      'plano_mensal': this.loadBasicForm.bind(this)
    };

    const loader = loaders[type];
    if (loader) {
      await loader(type, data);
    }
  }

  // Formulário Básico (sem dependências)
  async loadBasicForm(type, data = null) {
    const form = FormMappers.getFormElement(type);
    if (!form) return;

    form.reset();
    this.setDefaultValues(type);

    if (data) {
      this.prefillForm(type, data);
    }
  }

  // Formulário de Atividade (com selects dinâmicos)
  async loadAtividadeForm(type, data = null) {
    const form = FormMappers.getFormElement(type);
    if (!form) return;

    form.reset();
    this.setDefaultValues(type);

    // Carregar categorias
    const categories = await this.StorageService.get('planner_atividade-categoria') || [];
    const categorySelect = FormMappers.getFieldElement(type, 'category');
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Nenhuma</option>' +
        categories.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    }

    // Carregar contextos
    const contexts = await this.StorageService.get('planner_contexto') || [];
    const contextSelect = FormMappers.getFieldElement(type, 'contexto');
    if (contextSelect) {
      contextSelect.innerHTML = '<option value="">Nenhum</option>' +
        contexts.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    }

    if (data) {
      this.prefillForm(type, data);
    }
  }

  // Formulário de Estratégia (com data automática)
  async loadEstrategiaForm(type, data = null) {
    const form = FormMappers.getFormElement(type);
    if (!form) return;

    form.reset();
    this.setDefaultValues(type);

    if (!data) {
      const dateField = FormMappers.getFieldElement(type, 'date');
      if (dateField) {
        dateField.value = new Date().toISOString().split('T')[0];
      }
    }

    if (data) {
      this.prefillForm(type, data);
    }
  }

  // Formulário de Alarme (com campos condicionais)
  async loadAlarmeForm(type, data = null) {
    const form = FormMappers.getFormElement(type);
    if (!form) return;

    form.reset();
    this.setDefaultValues(type);

    if (data) {
      this.prefillForm(type, data);
    }

    // Carregar campos condicionais
    this.handleConditionalFields(type);
  }

  // Preencher formulário com dados existentes
  prefillForm(type, data) {
    const fields = FormMappers.getFields(type);

    fields.forEach(field => {
      if (data[field] === undefined) return;

      const element = FormMappers.getFieldElement(type, field);
      if (!element) return;

      if (element.type === 'checkbox') {
        element.checked = data[field] === true;
      } else if (element.tagName === 'SELECT' && field === 'weekdays') {
        // Caso especial: weekdays é um array
        if (Array.isArray(data[field])) {
          document.querySelectorAll(`input[name="${type}-wd"]`).forEach(cb => {
            cb.checked = data[field].includes(cb.value);
          });
        }
      } else {
        element.value = data[field] || '';
      }
    });
  }

  // Definir valores padrão
  setDefaultValues(type) {
    const defaults = FormMappers.getDefaults(type);

    Object.keys(defaults).forEach(field => {
      const element = FormMappers.getFieldElement(type, field);
      if (element) {
        element.value = defaults[field];
      }
    });

    // Definir IDs padrão se novo
    const idField = FormMappers.getFieldElement(type, 'id');
    if (idField && !idField.value) {
      idField.value = Date.now().toString();
    }

    // Definir createdAt se for atividade
    if (type === 'atividade') {
      const createdAtField = FormMappers.getFieldElement(type, 'createdAt');
      if (createdAtField && !createdAtField.value) {
        createdAtField.value = new Date().toISOString();
      }
    }
  }

  // Gerenciar campos condicionais
  handleConditionalFields(type) {
    const conditionals = FormMappers.getConditionalFields(type);

    if (type === 'alarme') {
      const recurrenceField = FormMappers.getFieldElement(type, 'recurrence');
      if (recurrenceField) {
        recurrenceField.addEventListener('change', () => this.toggleAlarmeFields());
      }
      this.toggleAlarmeFields();
    }

    // Extender para outros tipos conforme necessário
  }

  toggleAlarmeFields() {
    const recurrenceField = FormMappers.getFieldElement('alarme', 'recurrence');
    const recurrence = recurrenceField ? recurrenceField.value : 'diario';

    const dateContainer = document.getElementById('alarme-date-container');
    const weekContainer = document.getElementById('alarme-weekdays-container');

    if (recurrence === 'unico') {
      dateContainer?.classList.remove('hidden');
      weekContainer?.classList.add('hidden');
    } else if (recurrence === 'semanal') {
      dateContainer?.classList.add('hidden');
      weekContainer?.classList.remove('hidden');
    } else {
      // diario
      dateContainer?.classList.add('hidden');
      weekContainer?.classList.add('hidden');
    }
  }

  // Coletar dados do formulário
  collectFormData(type) {
    const data = { type };
    const fields = FormMappers.getFields(type);

    fields.forEach(field => {
      const element = FormMappers.getFieldElement(type, field);
      if (!element) return;

      if (element.type === 'checkbox') {
        data[field] = element.checked;
      } else if (field === 'weekdays') {
        // Caso especial: weekdays é um array
        data[field] = Array.from(
          document.querySelectorAll(`input[name="${type}-wd"]:checked`)
        ).map(cb => cb.value);
      } else {
        data[field] = element.value || '';
      }
    });

    return data;
  }
}
