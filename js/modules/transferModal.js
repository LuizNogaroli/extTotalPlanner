/**
 * transferModal.js — Modal de transferência de atividades entre dias/planos
 *
 * Exporta:
 *   - initTransferModal(domRefs) — chamar uma vez no boot com referencias ao DOM
 *   - openTransferModal(activity) — abre o modal para transferir uma atividade
 *   - updateTransferOptions(e) — atualiza opções baseado no destino selecionado
 *
 * Extraído de js/app.js na Fase 4 do plano de refatoração (docs/plano_refatoracao_appjs.md).
 */

let transferModal = null;
let renderAtividadesTable = null;
let switchToPlanosView = null;
let getPeriodoKey = null;
let getPeriodoLabel = null;
let StorageService = null;

let currentActivityToTransfer = null;
let currentPlanosTab = null;

export function initTransferModal(domRefs) {
    transferModal = domRefs.transferModal;
    renderAtividadesTable = domRefs.renderAtividadesTable;
    switchToPlanosView = domRefs.switchToPlanosView;
    getPeriodoKey = domRefs.getPeriodoKey;
    getPeriodoLabel = domRefs.getPeriodoLabel;
    StorageService = window.StorageService;
    currentPlanosTab = domRefs.currentPlanosTab;

    document.getElementById('transfer-destino').addEventListener('change', updateTransferOptions);
    document.getElementById('btn-transfer-confirm').addEventListener('click', handleConfirm);
    document.getElementById('btn-transfer-cancel').addEventListener('click', handleCancel);
    document.querySelector('.btn-close-transfer').addEventListener('click', handleCancel);
}

export function openTransferModal(activity) {
    currentActivityToTransfer = activity;
    document.getElementById('transfer-destino').value = '';
    document.getElementById('transfer-options').innerHTML = '';
    transferModal.classList.remove('hidden');
}

export async function updateTransferOptions(e) {
    const destino = e.target.value;
    const optionsDiv = document.getElementById('transfer-options');
    optionsDiv.innerHTML = '';

    if (!destino) return;

    if (destino === 'dia') {
        optionsDiv.innerHTML = `
            <div>
                <label class="block text-sm font-semibold text-[var(--text-primary)] mb-2">Selecione a data:</label>
                <input type="date" id="transfer-date-input" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)] text-sm">
            </div>
        `;
    } else if (destino === 'plano-semanal') {
        optionsDiv.innerHTML = `<div class="text-sm text-[var(--text-secondary)] italic">🚧 Plano Semanal em desenvolvimento - selecione uma data específica</div>`;
    } else {
        const tipo = destino === 'plano-anual' ? 'plano_anual' : 'plano_mensal';
        const granularidade = destino === 'plano-anual' ? 'ano' : 'mes';
        const strategies = await StorageService.get('planner_strategies') || [];
        const periodos = {};

        strategies.filter(s => s.type === tipo).forEach(s => {
            const key = getPeriodoKey(s.timestamp, granularidade);
            if (!periodos[key]) periodos[key] = [];
            periodos[key].push(s);
        });

        const periodosOrdenados = Object.keys(periodos).sort().reverse();

        if (periodosOrdenados.length === 0) {
            optionsDiv.innerHTML = `<div class="text-sm text-red-600">Nenhum ${destino === 'plano-anual' ? 'plano anual' : 'plano mensal'} encontrado</div>`;
        } else {
            optionsDiv.innerHTML = `
                <div>
                    <label class="block text-sm font-semibold text-[var(--text-primary)] mb-2">Selecione o ${destino === 'plano-anual' ? 'ano' : 'mês'}:</label>
                    <select id="transfer-periodo-select" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)] text-sm">
                        <option value="">-- Selecione --</option>
                        ${periodosOrdenados.map(key => `<option value="${key}">${getPeriodoLabel(key, granularidade)}</option>`).join('')}
                    </select>
                </div>
            `;
        }
    }
}

async function handleConfirm() {
    if (!currentActivityToTransfer) return;

    const destino = document.getElementById('transfer-destino').value;
    if (!destino) {
        alert('Por favor, selecione um destino');
        return;
    }

    const activities = await StorageService.get('planner_activities') || [];
    const idx = activities.findIndex(a => a.id === currentActivityToTransfer.id);

    if (idx === -1) return;

    try {
        if (destino === 'dia') {
            const date = document.getElementById('transfer-date-input').value;
            if (!date) {
                alert('Por favor, selecione uma data');
                return;
            }
            activities[idx].date = date;
        } else {
            const periodo = document.getElementById('transfer-periodo-select').value;
            if (!periodo) {
                alert('Por favor, selecione um período');
                return;
            }
            const tipo = destino === 'plano-anual' ? 'plano_anual' : destino === 'plano-mensal' ? 'plano_mensal' : 'plano_semanal';
            activities[idx].transferPeriodo = { tipo, periodo };
            activities[idx].date = null;
        }

        await StorageService.set('planner_activities', activities);

        transferModal.classList.add('hidden');
        currentActivityToTransfer = null;

        alert('✓ Atividade transferida com sucesso!');

        // Re-render current view
        if (!document.getElementById('view-atividades').classList.contains('hidden')) {
            renderAtividadesTable();
        }
        // Re-render plano if visible
        if (!document.getElementById('view-planos').classList.contains('hidden')) {
            switchToPlanosView(currentPlanosTab);
        }
    } catch (err) {
        console.error('Erro ao transferir', err);
        alert('Erro ao transferir atividade');
    }
}

function handleCancel() {
    transferModal.classList.add('hidden');
    currentActivityToTransfer = null;
}
