/**
 * formValidators.js - Validações mínimas para dados de formulários
 * Validações básicas: não-vazio, formato, tipo
 * Extensível para validações mais complexas por tipo
 */

import { getFormConfig, getRequiredFields } from './formMappers.js';

export class FormValidators {
  /**
   * Validar dados genéricos baseado no tipo
   * Retorna: { valid: boolean, errors: { fieldName: 'mensagem' } }
   */
  static validate(type, data) {
    const config = getFormConfig(type);
    if (!config) {
      return { valid: false, errors: { _form: `Tipo desconhecido: ${type}` } };
    }

    const errors = {};

    // Validar campos obrigatórios
    const required = getRequiredFields(type);
    for (const field of required) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors[field] = `${field} é obrigatório`;
      }
    }

    // Validações específicas por tipo
    const typeValidator = this[`validate${type.charAt(0).toUpperCase() + type.slice(1)}`];
    if (typeValidator) {
      const typeErrors = typeValidator.call(this, data);
      Object.assign(errors, typeErrors);
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // ==================== VALIDADORES ESPECÍFICOS ====================

  static validateAtividade(data) {
    const errors = {};

    // Título não-vazio
    if (data.title && data.title.trim().length === 0) {
      errors.title = 'Título não pode estar vazio';
    }

    // Data válida (se fornecida)
    if (data.date && !this.isValidDate(data.date)) {
      errors.date = 'Data inválida (use formato YYYY-MM-DD)';
    }

    // Status válido
    if (data.status && !['livre', 'concluido', 'cancelado'].includes(data.status)) {
      errors.status = 'Status inválido';
    }

    // Eisenhower válido
    if (data.eisenhower && !['q1', 'q2', 'q3', 'q4'].includes(data.eisenhower)) {
      errors.eisenhower = 'Quadrante Eisenhower inválido';
    }

    return errors;
  }

  static validateAtividadeCategoria(data) {
    const errors = {};
    if (data.nome && data.nome.trim().length === 0) {
      errors.nome = 'Nome não pode estar vazio';
    }
    return errors;
  }

  static validateContexto(data) {
    const errors = {};
    if (data.nome && data.nome.trim().length === 0) {
      errors.nome = 'Nome não pode estar vazio';
    }
    return errors;
  }

  static validateEstrategia(data) {
    const errors = {};

    if (!['meta', 'projeto', 'sonho'].includes(data.tipo)) {
      errors.tipo = 'Tipo de estratégia inválido';
    }

    if (data.title && data.title.trim().length === 0) {
      errors.title = 'Título não pode estar vazio';
    }

    return errors;
  }

  static validateHabito(data) {
    const errors = {};

    if (data.nome && data.nome.trim().length === 0) {
      errors.nome = 'Nome não pode estar vazio';
    }

    if (data.frequencia && !['diario', 'semanal', 'mensal', 'anual'].includes(data.frequencia)) {
      errors.frequencia = 'Frequência inválida';
    }

    return errors;
  }

  static validateHistorico(data) {
    const errors = {};

    if (data.data && !this.isValidDate(data.data)) {
      errors.data = 'Data inválida';
    }

    if (data.titulo && data.titulo.trim().length === 0) {
      errors.titulo = 'Título não pode estar vazio';
    }

    return errors;
  }

  static validateAlarme(data) {
    const errors = {};

    // Validar hora (obrigatória, formato HH:mm)
    if (data.time && !this.isValidTime(data.time)) {
      errors.time = 'Hora inválida (use formato HH:mm)';
    }

    // Recorrência 'único' exige uma data válida
    if (data.recurrence === 'unico') {
      if (!data.date) {
        errors.date = 'Data é obrigatória para alarme único';
      } else if (!this.isValidDate(data.date)) {
        errors.date = 'Data inválida';
      }
    }

    // Recorrência 'semanal' exige ao menos um dia da semana selecionado
    if (data.recurrence === 'semanal') {
      const dias = Array.isArray(data.weekdays) ? data.weekdays : [];
      const validDays = ['0', '1', '2', '3', '4', '5', '6'];
      if (dias.length === 0) {
        errors.weekdays = 'Selecione ao menos um dia da semana';
      } else if (dias.some(d => !validDays.includes(d))) {
        errors.weekdays = 'Dia da semana inválido';
      }
    }

    return errors;
  }

  static validateMotivacional(data) {
    const errors = {};

    if (data.titulo && data.titulo.trim().length === 0) {
      errors.titulo = 'Título não pode estar vazio';
    }

    if (data.data && !this.isValidDate(data.data)) {
      errors.data = 'Data inválida';
    }

    return errors;
  }

  static validateDevocional(data) {
    const errors = {};

    if (data.data && !this.isValidDate(data.data)) {
      errors.data = 'Data inválida';
    }

    if (data.passagem && data.passagem.trim().length === 0) {
      errors.passagem = 'Passagem não pode estar vazia';
    }

    return errors;
  }

  static validateCompras(data) {
    const errors = {};

    if (data.item && data.item.trim().length === 0) {
      errors.item = 'Item não pode estar vazio';
    }

    if (data.quantidade && (isNaN(data.quantidade) || data.quantidade <= 0)) {
      errors.quantidade = 'Quantidade deve ser um número positivo';
    }

    if (data.preco && (isNaN(data.preco) || data.preco < 0)) {
      errors.preco = 'Preço deve ser um número não-negativo';
    }

    return errors;
  }

  static validateMissao(data) {
    const errors = {};

    if (data.conteudo && data.conteudo.trim().length === 0) {
      errors.conteudo = 'Conteúdo não pode estar vazio';
    }

    return errors;
  }

  static validateVisao(data) {
    const errors = {};

    if (data.conteudo && data.conteudo.trim().length === 0) {
      errors.conteudo = 'Conteúdo não pode estar vazio';
    }

    return errors;
  }

  static validateObjetivos(data) {
    const errors = {};

    if (!['curto', 'medio', 'longo'].includes(data.prazo)) {
      errors.prazo = 'Prazo inválido (curto, médio ou longo)';
    }

    if (data.titulo && data.titulo.trim().length === 0) {
      errors.titulo = 'Título não pode estar vazio';
    }

    return errors;
  }

  static validatePlanoAnual(data) {
    const errors = {};

    if (data.conteudo && data.conteudo.trim().length === 0) {
      errors.conteudo = 'Conteúdo não pode estar vazio';
    }

    return errors;
  }

  static validatePlanoMensal(data) {
    const errors = {};

    if (data.conteudo && data.conteudo.trim().length === 0) {
      errors.conteudo = 'Conteúdo não pode estar vazio';
    }

    return errors;
  }

  static validatePlanoSemanal(data) {
    const errors = {};

    if (data.conteudo && data.conteudo.trim().length === 0) {
      errors.conteudo = 'Conteúdo não pode estar vazio';
    }

    return errors;
  }

  // ==================== HELPERS ====================

  /**
   * Validar formato de data YYYY-MM-DD
   */
  static isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Validar formato de hora HH:mm
   */
  static isValidTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return false;
    const regex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    return regex.test(timeStr);
  }

  /**
   * Validar email
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export default FormValidators;
