// js/modules/modal.js

export class ModalManager {
    constructor(forms, modal, modalTitle, StorageService) {
        this.forms = forms;
        this.modal = modal;
        this.modalTitle = modalTitle;
        this.StorageService = StorageService;
    }

    async open(type = 'atividade', data = null) {
        this.modal.classList.remove('hidden');
        
        // Esconder todos os forms
        Object.values(this.forms).forEach(f => { if(f) f.classList.add('hidden'); });
        
        const form = this.forms[type];
        if (!form) return;
        
        form.classList.remove('hidden');
        form.reset();
        
        const titles = {
            'atividade': data ? 'Editar Atividade' : 'Nova Atividade',
            'atividade-categoria': data ? 'Editar Categoria' : 'Nova Categoria',
            'contexto': data ? 'Editar Contexto' : 'Novo Contexto',
            'estrategia': data ? 'Editar Estratégia' : 'Nova Estratégia',
            'habito': data ? 'Editar Hábito' : 'Configurar Hábito',
            'historico': data ? 'Editar Fato Histórico' : 'Inserir Fato Histórico',
            'motivacional': data ? 'Editar Mensagem' : 'Inserir Motivacional',
            'devocional': data ? 'Editar Devocional' : 'Inserir Devocional',
            'compras': data ? 'Editar Item' : 'Inserir Item de Compra',
            'alarme': data ? 'Editar Alarme' : 'Novo Alarme'
        };
        this.modalTitle.textContent = titles[type] || 'Editar';

        // Preencher dados se existir
        if (type === 'atividade') {
            const catSelect = document.getElementById('atividade-category');
            const cats = await this.StorageService.get('planner_atividade-categoria') || [];
            catSelect.innerHTML = '<option value="">Nenhuma</option>' + cats.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');

            const contSelect = document.getElementById('atividade-contexto');
            const conts = await this.StorageService.get('planner_contexto') || [];
            contSelect.innerHTML = '<option value="">Nenhum</option>' + conts.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');

            if (data) {
                document.getElementById('atividade-id').value = data.id;
                document.getElementById('atividade-title').value = data.title;
                document.getElementById('atividade-desc').value = data.desc || '';
                document.getElementById('atividade-date').value = data.date || '';
                document.getElementById('atividade-status').value = data.status || 'livre';
                document.getElementById('atividade-category').value = data.category || '';
                document.getElementById('atividade-contexto').value = data.contexto || '';
                document.getElementById('atividade-eisenhower').value = data.eisenhower || '';
                document.getElementById('atividade-created-at').value = data.createdAt || new Date().toISOString();
            } else {
                document.getElementById('atividade-id').value = Date.now().toString();
                document.getElementById('atividade-created-at').value = new Date().toISOString();
            }
        } else if (type === 'atividade-categoria') {
            if (data) {
                document.getElementById('atividade-categoria-id').value = data.id;
                document.getElementById('atividade-categoria-nome').value = data.nome;
            } else {
                document.getElementById('atividade-categoria-id').value = Date.now().toString();
            }
        } else if (type === 'contexto') {
            if (data) {
                document.getElementById('contexto-id').value = data.id;
                document.getElementById('contexto-nome').value = data.nome;
            } else {
                document.getElementById('contexto-id').value = Date.now().toString();
            }
        } else if (type === 'estrategia') {
            if (data) {
                document.getElementById('estrategia-id').value = data.id;
                document.getElementById('estrategia-type').value = data.type;
                document.getElementById('estrategia-content').value = data.content;
                document.getElementById('estrategia-date').value = data.date || '';
            } else {
                document.getElementById('estrategia-id').value = Date.now().toString();
                document.getElementById('estrategia-date').value = new Date().toISOString().split('T')[0];
            }
        } else if (type === 'habito') {
            if (data) {
                document.getElementById('habito-id').value = data.id;
                document.getElementById('habito-question').value = data.question;
                document.getElementById('habito-category').value = data.category || 'Outros';
            } else {
                document.getElementById('habito-id').value = Date.now().toString();
            }
        } else if (type === 'historico') {
            if (data) {
                document.getElementById('historico-id').value = data.id;
                document.getElementById('historico-date').value = data.date;
                document.getElementById('historico-fato').value = data.fato;
            } else {
                document.getElementById('historico-id').value = Date.now().toString();
            }
        } else if (type === 'motivacional') {
            if (data) {
                document.getElementById('motivacional-id').value = data.id;
                document.getElementById('motivacional-citacao').value = data.citacao;
                document.getElementById('motivacional-autor').value = data.autor;
            } else {
                document.getElementById('motivacional-id').value = Date.now().toString();
            }
        } else if (type === 'devocional') {
            if (data) {
                document.getElementById('devocional-id').value = data.id;
                document.getElementById('devocional-passagem').value = data.passagem;
                document.getElementById('devocional-reflexao').value = data.reflexao;
            } else {
                document.getElementById('devocional-id').value = Date.now().toString();
            }
        } else if (type === 'compras') {
            if (data) {
                document.getElementById('compras-id').value = data.id;
                document.getElementById('compras-item').value = data.item;
                document.getElementById('compras-detalhes').value = data.detalhes || '';
                document.getElementById('compras-categoria').value = data.categoria || 'Outros';
            } else {
                document.getElementById('compras-id').value = Date.now().toString();
            }
        } else if (type === 'alarme') {
            if (data) {
                document.getElementById('alarme-id').value = data.id;
                document.getElementById('alarme-title').value = data.title;
                document.getElementById('alarme-time').value = data.time;
                document.getElementById('alarme-recurrence').value = data.recurrence || 'diario';
                document.getElementById('alarme-date').value = data.date || '';
                
                // Clear all first
                document.querySelectorAll('input[name="alarme-wd"]').forEach(cb => cb.checked = false);
                if (data.weekdays && data.weekdays.length > 0) {
                    data.weekdays.forEach(wd => {
                        const cb = document.querySelector(`input[name="alarme-wd"][value="${wd}"]`);
                        if(cb) cb.checked = true;
                    });
                }
            } else {
                document.getElementById('alarme-id').value = Date.now().toString();
                document.getElementById('alarme-time').value = '20:00';
                document.getElementById('alarme-recurrence').value = 'diario';
                document.getElementById('alarme-date').value = new Date().toISOString().split('T')[0];
                document.querySelectorAll('input[name="alarme-wd"]').forEach(cb => cb.checked = false);
            }
            window.toggleAlarmFields();
        }
    }

    async handleFormSubmit(e, type, fieldsMapping, afterSaveCallback) {
        e.preventDefault();
        const item = { type };
        Object.keys(fieldsMapping).forEach(key => {
            item[key] = document.getElementById(fieldsMapping[key]).value;
        });
        
        const storageKey = 'planner_' + (type === 'atividade' ? 'activities' : (type === 'estrategia' ? 'strategies' : type));
        const items = await this.StorageService.get(storageKey) || [];
        const index = items.findIndex(i => i.id === item.id);
        if (index > -1) items[index] = item;
        else items.push(item);
        
        await this.StorageService.set(storageKey, items);
        this.close();
        if (afterSaveCallback) afterSaveCallback();
    }

    close() {
        this.modal.classList.add('hidden');
    }
}
