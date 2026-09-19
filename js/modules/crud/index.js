/**
 * index.js - Exporta todos os módulos CRUD centralizadamente
 */

export { default as FORM_REGISTRY, getStorageKey, getFormConfig, getFormTitle, getFormFields, getRequiredFields, getFormDefaults, isSelfManaged, getDynamicSelects, getConditionalFields } from './formMappers.js';
export { FormValidators } from './formValidators.js';
export { FormLoaders } from './formLoaders.js';

// CRUDModal será exportado aqui após refatoração
// export { CRUDModal } from './crudModal.js';
