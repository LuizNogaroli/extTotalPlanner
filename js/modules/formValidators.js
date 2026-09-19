// js/modules/formValidators.js
// Validações de formulários com regras mínimas extensíveis

import { FormMappers } from './formMappers.js';

export class FormValidators {
  static validate(type, formData) {
    if (!FormMappers.isValidType(type)) {
      return { valid: false, errors: { general: `Tipo de formulário desconhecido: ${type}` } };
    }

    const errors = {};
    const required = FormMappers.getRequired(type);

    // Validações gerais: campos obrigatórios
    required.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${this.formatFieldName(field)} é obrigatório`;
      }
    });

    // Validações específicas por tipo
    const typeValidators = {
      'atividade': this.validateAtividade.bind(this),
      'atividade-categoria': () => ({}),
      'contexto': () => ({}),
      'estrategia': this.validateEstrategia.bind(this),
      'habito': () => ({}),
      'historico': this.validateHistorico.bind(this),
      'motivacional': () => ({}),
      'devocional': () => ({}),
      'compras': () => ({}),
      'alarme': this.validateAlarme.bind(this)
    };

    const typeErrors = typeValidators[type] ? typeValidators[type](formData) : {};
    Object.assign(errors, typeErrors);

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateAtividade(formData) {
    const errors = {};

    if (formData.title && formData.title.trim().length < 3) {
      errors.title = 'Título deve ter no mínimo 3 caracteres';
    }

    if (formData.date && !this.isValidDate(formData.date)) {
      errors.date = 'Data em formato inválido (use YYYY-MM-DD)';
    }

    return errors;
  }

  static validateEstrategia(formData) {
    const errors = {};

    if (formData.content && formData.content.trim().length < 3) {
      errors.content = 'Conteúdo deve ter no mínimo 3 caracteres';
    }

    return errors;
  }

  static validateHistorico(formData) {
    const errors = {};

    if (formData.date && !this.isValidDate(formData.date)) {
      errors.date = 'Data em formato inválido (use YYYY-MM-DD)';
    }

    if (formData.fato && formData.fato.trim().length < 3) {
      errors.fato = 'Fato deve ter no mínimo 3 caracteres';
    }

    return errors;
  }

  static validateAlarme(formData) {
    const errors = {};

    if (formData.time && !this.isValidTime(formData.time)) {
      errors.time = 'Hora em formato inválido (use HH:mm)';
    }

    if (formData.title && formData.title.trim().length < 3) {
      errors.title = 'Título do alarme deve ter no mínimo 3 caracteres';
    }

    if (formData.recurrence === 'unico' && formData.date && !this.isValidDate(formData.date)) {
      errors.date = 'Data em formato inválido (use YYYY-MM-DD)';
    }

    return errors;
  }

  // Utilitários de validação

  static isValidDate(dateStr) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  }

  static isValidTime(timeStr) {
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeStr);
  }

  static formatFieldName(fieldName) {
    return fieldName
      .replace(/-/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Exibir erros no formulário

  static displayErrors(type, errors) {
    // Limpar erros anteriores
    document.querySelectorAll('.form-error:not(.hidden)').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });

    // Exibir novos erros
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(`${type}-${field}-error`);
      if (errorElement) {
        errorElement.textContent = errors[field];
        errorElement.classList.remove('hidden');
      }
    });
  }

  static clearErrors(type) {
    document.querySelectorAll(`.form-error[id^="${type}-"]`).forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
  }
}
