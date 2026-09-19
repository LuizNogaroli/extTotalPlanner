/**
 * crudModal.js - Orquestrador do Modal CRUD
 * Integra formMappers, formValidators e formLoaders para abrir, validar e salvar formulários
 * Mantém compatibilidade com API existente (window.appRouter.openModal)
 */

import FORM_REGISTRY, { getStorageKey, getFormConfig, getFormTitle, getFormFields } from './crud/formMappers.js';
import { FormValidators } from './crud/formValidators.js';
import { FormLoaders } from './crud/formLoaders.js';

// Tipos cuja persistência é feita externamente (listener de 'crudSave')
// Possuem lógica de versionamento/período customizada em app.js
const SELF_MANAGED_TYPES = ['missao', 'visao', 'objetivos', 'plano_anual', 'plano_mensal', 'plano_semanal'];

export class CRUDModal {
  constructor(modalElement, modalTitleElement, StorageService) {
    this.modal = modalElement;
    this.modalTitle = modalTitleElement;
    this.StorageService = StorageService;
    this.currentType = null;
    this.formSubmitHandlers = {}; // Cache para remover listeners antigos
  }

  /**
   * Abrir modal com um formulário específico
   * @param {string} type - Tipo do formulário (ex: 'atividade', 'missao')
   * @param {object} data - Dados para edição (null para criar novo)
   */
  async open(type = 'atividade', data = null) {
    // Validar tipo
    if (!FORM_REGISTRY[type]) {
      console.error(`Tipo desconhecido: ${type}`);
      return;
    }

    this.currentType = type;
    const isEdit = !!data;

    // Mostrar modal
    this.modal.classList.remove('hidden');

    // Esconder todos os formulários
    Object.keys(FORM_REGISTRY).forEach(t => {
      const config = getFormConfig(t);
      const form = document.getElementById(config.formId);
      if (form) form.classList.add('hidden');
    });

    // Mostrar formulário correto
    const config = getFormConfig(type);
    const form = document.getElementById(config.formId);
    if (!form) {
      console.error(`Formulário não encontrado: ${config.formId}`);
      return;
    }

    // Atualizar título do modal
    const actionTitle = getFormTitle(type, isEdit ? 'edit' : 'create');
    this.modalTitle.textContent = actionTitle;

    // Limpar erros anteriores
    FormLoaders.clearErrors(type);

    // Carregar e preencher formulário
    try {
      await FormLoaders.loadForm(type, data, this.StorageService);
    } catch (err) {
      console.error(`Erro ao carregar formulário ${type}:`, err);
    }

    // Mostrar formulário
    form.classList.remove('hidden');

    // Registrar listener de submit
    this.registerFormSubmit(type, form);
  }

  /**
   * Registrar listener de submit com limpeza de listeners antigos
   */
  registerFormSubmit(type, form) {
    const config = getFormConfig(type);
    const formId = config.formId;

    // Remover listener antigo se existir
    if (this.formSubmitHandlers[formId]) {
      form.removeEventListener('submit', this.formSubmitHandlers[formId]);
    }

    // Criar novo handler bound ao this
    const handleSubmit = async (e) => {
      e.preventDefault();
      await this.handleSubmit(e, type);
    };

    // Registrar novo listener
    form.addEventListener('submit', handleSubmit);
    this.formSubmitHandlers[formId] = handleSubmit;
  }

  /**
   * Lidar com submit de um formulário
   */
  async handleSubmit(e, type) {
    e.preventDefault();

    // Coletar dados do formulário
    const form = document.getElementById(getFormConfig(type).formId);
    const formData = FormLoaders.extractFormData(type, form);

    // Validar dados
    const validation = FormValidators.validate(type, formData);
    if (!validation.valid) {
      FormLoaders.displayErrors(type, validation.errors);
      return;
    }

    // Validação passou - limpar erros
    FormLoaders.clearErrors(type);

    try {
      // Tipos auto-gerenciados não usam save() genérico
      // Sua persistência (com versionamento) é feita pelo listener 'crudSave' em app.js
      if (!SELF_MANAGED_TYPES.includes(type)) {
        await this.save(type, formData);
      }

      // Fechar modal
      this.close();

      // Disparar evento para app.js reagir (ex: re-renderizar tabelas, atualizar views)
      this.dispatchSaveEvent(type, formData);
    } catch (err) {
      console.error(`Erro ao salvar ${type}:`, err);
      alert(`Erro ao salvar: ${err.message}`);
    }
  }

  /**
   * Salvar dados genéricamente (para tipos não-self-managed)
   */
  async save(type, formData) {
    const storageKey = getStorageKey(type);
    if (!storageKey) {
      throw new Error(`Storage key não configurada para tipo: ${type}`);
    }

    // Buscar items existentes
    const items = await this.StorageService.get(storageKey) || [];

    // Encontrar índice do item (se edição)
    const index = items.findIndex(i => i.id === formData.id);

    // Adicionar ou atualizar
    if (index > -1) {
      items[index] = formData;
    } else {
      items.push(formData);
    }

    // Salvar ao storage
    await this.StorageService.set(storageKey, items);
  }

  /**
   * Disparar evento customizado para app.js reagir
   */
  dispatchSaveEvent(type, formData) {
    const event = new CustomEvent('crudSave', {
      detail: { type, formData }
    });
    document.dispatchEvent(event);
  }

  /**
   * Fechar modal
   */
  close() {
    this.modal.classList.add('hidden');
    this.currentType = null;

    // Limpar todos os erros de todos os formulários
    Object.keys(FORM_REGISTRY).forEach(type => {
      FormLoaders.clearErrors(type);
    });
  }

  /**
   * Obter tipo atual aberto
   */
  getCurrentType() {
    return this.currentType;
  }

  /**
   * Verificar se modal está aberto
   */
  isOpen() {
    return !this.modal.classList.contains('hidden');
  }
}

export default CRUDModal;
