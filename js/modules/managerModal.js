/**
 * managerModal.js — Gerenciador de listas genérico (Histórico, Motivacional, Devocional, etc.)
 *
 * Exporta:
 *   - initManagerModal(domRefs) — chamar uma vez no boot com referencias ao DOM
 *   - openManager(type) — abre o modal para um tipo específico
 *   - renderManagerList() — renderiza a lista do tipo aberto
 *
 * Extraído de js/app.js na Fase 3 do plano de refatoração (docs/plano_refatoracao_appjs.md).
 */

import { getListLabel } from './crud/listLabels.js';
import { esc } from './listaCompras.js';

let managerModal = null;
let managerTitle = null;
let managerList = null;
let btnsCloseManager = [];
let btnManagerAdd = null;
let crudModal = null;
let StorageService = null;

let currentManagerType = '';

const MANAGER_TITLES = {
    'historico': 'Fatos Históricos Cadastrados',
    'motivacional': 'Citações Motivacionais',
    'devocional': 'Passagens Devocionais',
    'compras': 'Itens para Comprar',
    'estrategia': 'Cadastros Estratégicos',
    'habito': 'Hábitos / Questionário Diário',
    'atividade-categoria': 'Categorias de Atividades',
    'alarme': 'Lembretes e Alarmes'
};

const STORAGE_KEYS = {
    'historico': 'planner_historico',
    'motivacional': 'planner_motivacional',
    'devocional': 'planner_devocional',
    'compras': 'planner_lista_compras',
    'estrategia': 'planner_strategies',
    'habito': 'planner_habitos',
    'atividade-categoria': 'planner_atividade_categoria',
    'alarme': 'planner_alarme'
};

export function initManagerModal(domRefs) {
    managerModal = domRefs.managerModal;
    managerTitle = domRefs.managerTitle;
    managerList = domRefs.managerList;
    btnsCloseManager = domRefs.btnsCloseManager || [];
    btnManagerAdd = domRefs.btnManagerAdd;
    crudModal = domRefs.crudModal;
    StorageService = window.StorageService;

    btnsCloseManager.forEach(btn => btn.addEventListener('click', () => managerModal.classList.add('hidden')));

    btnManagerAdd.addEventListener('click', () => {
        managerModal.classList.add('hidden');
        crudModal.open(currentManagerType);
    });
}

export async function openManager(type) {
    currentManagerType = type;
    managerTitle.textContent = MANAGER_TITLES[type] || 'Gerenciar';
    document.getElementById('manager-notificacoes').classList.toggle('hidden', type !== 'alarme');
    if (type === 'alarme') renderNotificacoesUI(); // permissão pode ter mudado fora do app
    managerModal.classList.remove('hidden');

    await renderManagerList();
}

export async function renderManagerList() {
    const type = currentManagerType;
    const storageKey = STORAGE_KEYS[type];
    const items = await StorageService.get(storageKey) || [];

    managerList.innerHTML = '';
    if (items.length === 0) {
        managerList.innerHTML = `<li class="text-[var(--text-secondary)] italic text-sm p-4 text-center">Nenhum item cadastrado.</li>`;
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = "flex justify-between items-center p-3 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-sm hover:shadow-md transition";

        const titleText = getListLabel(type, item);

        // Motivacional/Devocional: mostra o ID (usado para "fixar" no box da página do dia)
        const idBadge = (type === 'motivacional' || type === 'devocional')
            ? `<div class="text-[10px] text-[var(--text-secondary)] mt-1 flex items-center gap-1">ID: <code class="bg-[var(--bg-color)] px-1 rounded">${item.id}</code>
                   <button class="btn-copy-id text-[var(--primary-color)] hover:underline" title="Copiar ID">📋 copiar</button></div>`
            : '';

        li.innerHTML = `
            <div class="flex-1 min-w-0 mr-4">
                <span class="text-sm font-semibold truncate block text-[var(--text-primary)]">${titleText}</span>
                ${idBadge}
            </div>
            <div class="flex space-x-2 flex-shrink-0">
                <button class="text-xs border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition px-2 py-1 rounded btn-edit" title="Editar">✏️ Editar</button>
                <button class="text-xs border border-red-300 text-red-500 hover:bg-red-50 transition px-2 py-1 rounded btn-delete" title="Excluir">🗑️</button>
            </div>
        `;

        li.querySelector('.btn-edit').addEventListener('click', () => {
            managerModal.classList.add('hidden');
            crudModal.open(type, item);
        });

        const btnCopyId = li.querySelector('.btn-copy-id');
        if (btnCopyId) {
            btnCopyId.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(String(item.id));
                    btnCopyId.textContent = '✅ copiado';
                    setTimeout(() => { btnCopyId.textContent = '📋 copiar'; }, 1500);
                } catch (e) {
                    alert(`ID: ${item.id}`);
                }
            });
        }

        li.querySelector('.btn-delete').addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja excluir?')) {
                const filtered = items.filter(i => i.id !== item.id);
                await StorageService.set(storageKey, filtered);
                renderManagerList();
            }
        });

        managerList.appendChild(li);
    });
}

function renderNotificacoesUI() {
    // Implementação delegada (já existe em app.js)
    // Este é um placeholder — a função renderNotificacoesUI continua em app.js
    if (typeof window.renderNotificacoesUI === 'function') {
        window.renderNotificacoesUI();
    }
}
