// js/modules/manager.js

export class Manager {
    constructor(modal, title, list, StorageService, openModalCallback) {
        this.modal = modal;
        this.title = title;
        this.list = list;
        this.StorageService = StorageService;
        this.openModalCallback = openModalCallback;
        this.currentManagerType = '';
    }

    async open(type) {
        this.currentManagerType = type;
        const titles = {
            'historico': 'Fatos Históricos Cadastrados',
            'motivacional': 'Citações Motivacionais',
            'devocional': 'Passagens Devocionais',
            'compras': 'Itens para Comprar',
            'estrategia': 'Cadastros Estratégicos',
            'habito': 'Hábitos / Questionário Diário',
            'atividade-categoria': 'Categorias de Atividades',
            'alarme': 'Lembretes e Alarmes',
            'contexto': 'Contextos / Papeis'
        };
        this.title.textContent = titles[type] || 'Gerenciar';
        this.modal.classList.remove('hidden');
        
        await this.renderList();
    }

    async renderList() {
        const type = this.currentManagerType;
        const storageKey = 'planner_' + (type === 'estrategia' ? 'strategies' : type);
        const items = await this.StorageService.get(storageKey) || [];
        
        this.list.innerHTML = '';
        if (items.length === 0) {
            this.list.innerHTML = `<li class="text-[var(--text-secondary)] italic text-sm p-4 text-center">Nenhum item cadastrado.</li>`;
            return;
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-3 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-sm hover:shadow-md transition";
            
            let titleText = this.formatTitle(type, item);

            li.innerHTML = `
                <span class="text-sm font-semibold truncate flex-1 text-[var(--text-primary)] mr-4">${titleText}</span>
                <div class="flex space-x-2">
                    <button class="text-xs border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition px-2 py-1 rounded btn-edit" title="Editar">✏️ Editar</button>
                    <button class="text-xs border border-red-300 text-red-500 hover:bg-red-50 transition px-2 py-1 rounded btn-delete" title="Excluir">🗑️</button>
                </div>
            `;
            
            li.querySelector('.btn-edit').addEventListener('click', () => {
                this.modal.classList.add('hidden');
                this.openModalCallback(type, item);
            });
            
            li.querySelector('.btn-delete').addEventListener('click', async () => {
                if(confirm('Tem certeza que deseja excluir?')) {
                    const filtered = items.filter(i => i.id !== item.id);
                    await this.StorageService.set(storageKey, filtered);
                    this.renderList();
                }
            });

            this.list.appendChild(li);
        });
    }

    formatTitle(type, item) {
        if (type === 'historico') return `[${item.date}] ${item.fato.substring(0,40)}...`;
        if (type === 'motivacional') return `"${item.citacao.substring(0,40)}..." - ${item.autor}`;
        if (type === 'devocional') return `${item.passagem}: ${item.reflexao.substring(0,30)}...`;
        if (type === 'compras') return `${item.categoria ? `[${item.categoria}] ` : ''}${item.item} (${item.detalhes || 'Sem detalhes'})`;
        if (type === 'estrategia') {
            const mapType = { 'missao': 'Missão', 'visao': 'Visão', 'obj_curto': 'Curto Prazo', 'obj_medio': 'Médio Prazo', 'obj_longo': 'Longo Prazo' };
            const dt = item.date ? `[${item.date}] ` : '';
            return `${dt}[${mapType[item.type] || item.type}] ${item.content.substring(0,40)}...`;
        }
        if (type === 'habito') return `${item.category ? `[${item.category}] ` : ''}${item.question}`;
        if (type === 'atividade-categoria' || type === 'contexto') return item.nome;
        if (type === 'alarme') {
            let recStr = 'Diário';
            if (item.recurrence === 'unico') recStr = `Dia ${item.date}`;
            else if (item.recurrence === 'semanal') {
                const daysMap = {'0':'Dom','1':'Seg','2':'Ter','3':'Qua','4':'Qui','5':'Sex','6':'Sáb'};
                recStr = (item.weekdays || []).map(d => daysMap[d]).join(', ');
            }
            return `⏰ ${item.time} (${recStr}) - ${item.title}`;
        }
        return '';
    }
}
