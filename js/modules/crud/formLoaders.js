/**
 * formLoaders.js - Carregar e preencher formulários com dados
 * Responsável por: popular selects dinâmicas, preencher campos com dados existentes, etc.
 */

import { getFormConfig, getDynamicSelects, getFormDefaults } from './formMappers.js';

export class FormLoaders {
  /**
   * Carregar e preencher um formulário com dados
   * Se data é nulo, preenche com defaults (modo criar)
   * Se data existe, preenche com os dados (modo editar)
   */
  static async loadForm(type, data = null, storageService) {
    const config = getFormConfig(type);
    if (!config) throw new Error(`Tipo desconhecido: ${type}`);

    const form = document.getElementById(config.formId);
    if (!form) throw new Error(`Form não encontrado: ${config.formId}`);

    // Limpar o formulário
    form.reset();

    // Preencher campos com dados ou defaults
    const dataToUse = data || getFormDefaults(type);
    this.fillFormFields(type, form, dataToUse);

    // Preencher selects dinâmicas
    const dynamicSelects = getDynamicSelects(type);
    for (const selectField of dynamicSelects) {
      await this.populateSelect(type, selectField, form, storageService);
    }

    // Casos especiais por tipo
    if (type === 'alarme') {
      this.handleAlarmeConditionals(form, dataToUse);
    }

    return form;
  }

  /**
   * Preencher campos de um formulário com dados
   */
  static fillFormFields(type, form, data) {
    const config = getFormConfig(type);

    for (const field of config.fields) {
      const inputId = `${type}-${field}`;
      const input = form.querySelector(`#${inputId}`);

      if (!input) continue;

      const value = data[field];

      if (input.type === 'checkbox') {
        input.checked = value === true || value === 'true';
      } else if (input.type === 'date' || input.type === 'time') {
        input.value = value || '';
      } else if (input.tagName === 'SELECT') {
        input.value = value || '';
      } else if (input.tagName === 'TEXTAREA') {
        input.value = value || '';
      } else {
        input.value = value || '';
      }
    }
  }

  /**
   * Popular uma select dinâmica baseado no tipo e campo
   */
  static async populateSelect(type, selectField, form, storageService) {
    const selectId = `${type}-${selectField}`;
    const select = form.querySelector(`#${selectId}`);
    if (!select) return;

    select.innerHTML = '<option value="">-- Selecione --</option>';

    // Mapeamento de selectField para storageKey
    let storageKey = null;
    let labelField = null;

    if (selectField === 'category' && type === 'atividade') {
      storageKey = 'planner_atividade_categoria';
      labelField = 'nome';
    } else if (selectField === 'contexto' && type === 'atividade') {
      storageKey = 'planner_contextos';
      labelField = 'nome';
    }

    if (!storageKey) return;

    try {
      const items = await storageService.get(storageKey) || [];
      for (const item of items) {
        const option = document.createElement('option');
        option.value = item.id || item[labelField];
        option.textContent = item[labelField];
        select.appendChild(option);
      }
    } catch (err) {
      console.error(`Erro ao carregar ${selectField}:`, err);
    }
  }

  /**
   * Lidar com campos condicionais do tipo Alarme
   * Mostrar/esconder campos baseado na recorrência selecionada
   */
  static handleAlarmeConditionals(form, data) {
    const recurrenceSelect = form.querySelector('#alarme-recurrence');
    const dateContainer = form.querySelector('#alarme-date-container');
    const weekdaysContainer = form.querySelector('#alarme-weekdays-container');

    if (!recurrenceSelect) return;

    const updateVisibility = () => {
      const value = recurrenceSelect.value;

      // Mostrar/esconder Data
      if (dateContainer) {
        dateContainer.classList.toggle('hidden', value !== 'unico');
      }

      // Mostrar/esconder Dias da semana
      if (weekdaysContainer) {
        weekdaysContainer.classList.toggle('hidden', value !== 'semanal');
      }
    };

    // Executar ao carregar
    updateVisibility();

    // Executar ao mudar
    recurrenceSelect.addEventListener('change', updateVisibility);

    // Marcar checkboxes de dias da semana (modo edição)
    const selectedWeekdays = (data && data.weekdays) || [];
    form.querySelectorAll('.alarme-weekday-checkbox').forEach(cb => {
      cb.checked = selectedWeekdays.includes(cb.value);
    });
  }

  /**
   * Carregar todos os dados de uma tabela para exibição
   * Útil para listagens (ex: Atividades)
   */
  static async loadTableData(storageKey, storageService, filters = {}) {
    try {
      let items = await storageService.get(storageKey) || [];

      // Aplicar filtros
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(item =>
          item.title?.toLowerCase().includes(search) ||
          item.nome?.toLowerCase().includes(search) ||
          item.descricao?.toLowerCase().includes(search)
        );
      }

      return items;
    } catch (err) {
      console.error(`Erro ao carregar ${storageKey}:`, err);
      return [];
    }
  }

  /**
   * Extrair dados de um formulário (form → objeto)
   */
  static extractFormData(type, form) {
    const config = getFormConfig(type);
    const data = {};

    for (const field of config.fields) {
      // Caso especial: grupo de checkboxes de dias da semana do Alarme
      if (type === 'alarme' && field === 'weekdays') {
        data.weekdays = Array.from(form.querySelectorAll('.alarme-weekday-checkbox:checked')).map(cb => cb.value);
        continue;
      }

      const inputId = `${type}-${field}`;
      const input = form.querySelector(`#${inputId}`);

      if (!input) continue;

      if (input.type === 'checkbox') {
        data[field] = input.checked;
      } else if (input.type === 'number') {
        data[field] = input.value ? parseFloat(input.value) : null;
      } else {
        data[field] = input.value || null;
      }
    }

    return data;
  }

  /**
   * Limpar um formulário
   */
  static clearForm(type) {
    const config = getFormConfig(type);
    const form = document.getElementById(config.formId);
    if (form) form.reset();
  }

  /**
   * Exibir erros de validação em um formulário
   */
  static displayErrors(type, errors) {
    const config = getFormConfig(type);
    const form = document.getElementById(config.formId);
    if (!form) return;

    // Limpar erros anteriores
    form.querySelectorAll('.form-error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });

    // Exibir novos erros
    for (const [field, message] of Object.entries(errors)) {
      if (field === '_form') {
        // Erro geral (exibir em alert)
        console.error('Erro geral:', message);
        continue;
      }

      const errorId = `${type}-${field}-error`;
      const errorEl = form.querySelector(`#${errorId}`);

      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }
    }
  }

  /**
   * Limpar erros de um formulário
   */
  static clearErrors(type) {
    const config = getFormConfig(type);
    const form = document.getElementById(config.formId);
    if (!form) return;

    form.querySelectorAll('.form-error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
  }
}

export default FormLoaders;
