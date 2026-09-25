/**
 * planos.js — Views de Planos (Anual/Mensal/Semanal) e Atividades
 *
 * Exporta:
 *   - initPlanosViews(domRefs) — chamar uma vez no boot
 *   - switchToPlanosView(prazo, periodoForcado) — mostra página de Planos
 *   - switchToAtividadesView() — mostra página de Atividades
 *   - renderAtividadesTable() — renderiza tabela de atividades
 *
 * Extraído de js/app.js na Fase 6 do plano de refatoração (docs/plano_refatoracao_appjs.md).
 * Dados de teste devem ser inseridos manualmente via DevTools/Testes.
 */

let crudModal = null;
let hideAllViews = null;
let headerTitle = null;
let getPeriodoKey = null;
let getPeriodoLabel = null;
let getDataDaSemana = null;
let getWeekDates = null;
let getWeekNumber = null;
let renderPeriodoBreadcrumb = null;
let renderDiasNoSubheader = null;
let openViewModal = null;
let openTransferModal = null;
let switchToMissaoView = null;
let switchToVisaoView = null;
let switchToObjetivosView = null;
let currentStrategicSection = null;

let planosPeriodoSelecionado = {};
let currentPlanosTab = 'anual';
let atividadesPaginaAtual = 1;
const ATIVIDADES_POR_PAGINA = 8;

export function initPlanosViews(domRefs) {
    crudModal = domRefs.crudModal;
    hideAllViews = domRefs.hideAllViews;
    headerTitle = domRefs.headerTitle;
    getPeriodoKey = domRefs.getPeriodoKey;
    getPeriodoLabel = domRefs.getPeriodoLabel;
    getDataDaSemana = domRefs.getDataDaSemana;
    getWeekDates = domRefs.getWeekDates;
    getWeekNumber = domRefs.getWeekNumber;
    renderPeriodoBreadcrumb = domRefs.renderPeriodoBreadcrumb;
    renderDiasNoSubheader = domRefs.renderDiasNoSubheader;
    openViewModal = domRefs.openViewModal;
    openTransferModal = domRefs.openTransferModal;
    switchToMissaoView = domRefs.switchToMissaoView;
    switchToVisaoView = domRefs.switchToVisaoView;
    switchToObjetivosView = domRefs.switchToObjetivosView;
    currentStrategicSection = domRefs.currentStrategicSection;
}

export function getCurrentPlanosTab() {
    return currentPlanosTab;
}

export function getPlanosPerioodoSelecionado() {
    return planosPeriodoSelecionado;
}

async function renderPlanoVersionado(contentArea, tipo, label, icone, granularidade = 'ano') {
    contentArea.innerHTML = `<span class="animate-pulse">Carregando ${label.toLowerCase()}...</span>`;

    const strategies = await window.StorageService.get('planner_strategies') || [];
    const registros = strategies.filter(s => s.type === tipo).sort((a, b) => b.timestamp - a.timestamp);

    // Agrupar registros por período
    const grupos = {};
    registros.forEach(r => {
        const key = getPeriodoKey(r.timestamp, granularidade);
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(r);
    });

    const periodoAtualKey = getPeriodoKey(Date.now(), granularidade);
    if (!grupos[periodoAtualKey]) grupos[periodoAtualKey] = [];

    const periodoSelecionado = planosPeriodoSelecionado[tipo] || periodoAtualKey;
    if (!grupos[periodoSelecionado]) grupos[periodoSelecionado] = [];
    const isPeriodoAtual = periodoSelecionado === periodoAtualKey;

    // Renderizar breadcrumb de navegação Ano › Mês › Semana no cabeçalho
    await renderPeriodoBreadcrumb(periodoSelecionado, granularidade, (key) => {
        if (key.includes('-w')) {
            window.appRouter.switchToPlanosView('semanal', key);
        } else if (key.includes('-')) {
            window.appRouter.switchToPlanosView('mensal', key);
        } else {
            window.appRouter.switchToPlanosView('anual', key);
        }
    });

    // Plano Semanal também mostra os dias daquela semana no sub-header
    if (tipo === 'plano_semanal') {
        const domingo = getDataDaSemana(periodoSelecionado);
        renderDiasNoSubheader(getWeekDates(domingo));
    }

    const registrosDoPeriodo = grupos[periodoSelecionado].sort((a, b) => b.timestamp - a.timestamp);

    const btnHtml = isPeriodoAtual ? `
        <div class="flex justify-end gap-3 mb-6">
            <button id="btn-new-${tipo}" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                ✏️ Atualizar ${label}
            </button>
        </div>
    ` : '';

    let bodyHtml;
    if (registrosDoPeriodo.length === 0) {
        bodyHtml = `<div class="text-[var(--text-secondary)] italic">Nenhum ${label.toLowerCase()} cadastrado ${isPeriodoAtual ? 'ainda' : `em ${getPeriodoLabel(periodoSelecionado, granularidade)}`}.</div>`;
    } else {
        const latest = registrosDoPeriodo[0];
        const anteriores = registrosDoPeriodo.slice(1);
        const tituloCard = isPeriodoAtual ? `${label} Atual` : `${label} — ${getPeriodoLabel(periodoSelecionado, granularidade)}`;

        // Carregar atividades vinculadas a este período
        const activities = await window.StorageService.get('planner_activities') || [];
        const periodoLabel = getPeriodoLabel(periodoSelecionado, granularidade);
        const atividadesDoPlano = activities.filter(a =>
            a.transferPeriodo &&
            typeof a.transferPeriodo === 'object' &&
            a.transferPeriodo.periodo === periodoSelecionado
        );

        const atividadesHtml = `
            <div class="mt-12 pt-8 border-t border-[var(--border-color)]">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-[var(--primary-color)] flex items-center">
                        <span class="mr-3">📌</span>
                        Atividades (${atividadesDoPlano.length})
                    </h3>
                    <button id="btn-add-atividade-plano" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all text-sm">
                        + Adicionar
                    </button>
                </div>
                <div class="grid grid-cols-1 gap-4">
                    ${atividadesDoPlano.length > 0 ? atividadesDoPlano.map(activity => {
                        const statusClass = activity.status === 'concluído' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
                        const priorityEmoji = { Q1: '🔴', Q2: '🟠', Q3: '🟡', Q4: '⚪' }[activity.eisenhower] || '⚪';
                        return `
                            <div class="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-all">
                                <div class="flex justify-between items-start gap-4 flex-wrap">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2 mb-2">
                                            <h4 class="text-lg font-semibold text-[var(--text-primary)] truncate">${activity.title}</h4>
                                            <span class="text-lg">${priorityEmoji}</span>
                                        </div>
                                        <p class="text-sm text-[var(--text-secondary)] mb-3">${activity.desc || 'Sem descrição'}</p>
                                        <div class="flex flex-wrap gap-3 text-xs">
                                            <span class="px-2 py-1 ${statusClass} rounded font-medium">${activity.status}</span>
                                            ${activity.category ? `<span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">${activity.category}</span>` : ''}
                                            ${activity.contexto ? `<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">${activity.contexto}</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="flex gap-2 flex-wrap">
                                        <button class="activity-view-btn px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition" data-id="${activity.id}">👁️ Ver</button>
                                        <button class="activity-edit-btn px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition" data-id="${activity.id}">✏️ Editar</button>
                                        <button class="activity-transfer-btn px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition" data-id="${activity.id}">🔄 Transferir</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="text-[var(--text-secondary)] italic">Nenhuma atividade neste período. Clique em "+ Adicionar" para criar uma.</p>'}
                </div>
            </div>
        `;

        bodyHtml = `
            <div class="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/90 to-[var(--primary-color)]/75 p-8 rounded-xl mb-8 shadow-lg border border-white/10">
                <div class="mb-6">
                    <p class="text-lg font-semibold text-white/95 capitalize" style="text-shadow: 0 2px 6px rgba(0,0,0,0.4);">${new Date(latest.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div class="bg-white p-6 rounded-lg border border-white/20 shadow-md">
                    <p class="text-lg text-[var(--text-primary)] mb-6 leading-relaxed italic font-semibold whitespace-pre-wrap">"${latest.content}"</p>
                    <div class="flex items-center text-sm text-[var(--text-secondary)]">
                        <span class="mr-2">📅</span>
                        <span>Definido em: ${new Date(latest.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                </div>

                ${atividadesHtml}
            </div>

            ${anteriores.length > 0 ? `
            <div class="bg-[var(--bg-panel)] p-8 rounded-xl border border-[var(--border-color)] shadow-md">
                <h3 class="text-2xl font-bold mb-8 text-[var(--primary-color)] flex items-center">
                    <span class="mr-3">📜</span>
                    ${label} (versões anteriores${!isPeriodoAtual ? ` de ${getPeriodoLabel(periodoSelecionado, granularidade)}` : ''})
                </h3>
                <div class="space-y-3">
                    ${anteriores.map((p) => {
                        const excerpt = p.content.substring(0, 80) + (p.content.length > 80 ? '...' : '');
                        const daysAgo = Math.floor((new Date() - new Date(p.timestamp)) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 p-5 rounded-lg border border-[var(--border-color)] transition-all cursor-pointer group" title="${p.content}">
                                <div class="flex justify-between items-start gap-4">
                                    <div class="flex-1">
                                        <div class="text-sm text-[var(--text-secondary)] font-medium mb-1">
                                            ${new Date(p.timestamp).toLocaleString('pt-BR')}
                                            <span class="text-xs text-[var(--text-secondary)]/70">(há ${daysAgo} dias)</span>
                                        </div>
                                        <p class="text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors italic">"${excerpt}"</p>
                                    </div>
                                    <span class="text-xl opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }

    contentArea.innerHTML = btnHtml + bodyHtml;

    const btnNewPlano = document.getElementById(`btn-new-${tipo}`);
    if (btnNewPlano) {
        btnNewPlano.addEventListener('click', () => {
            crudModal.open(tipo);
        });
    }

    // Listener para botão de adicionar atividade ao plano
    const btnAddAtividadePlano = document.getElementById('btn-add-atividade-plano');
    if (btnAddAtividadePlano) {
        btnAddAtividadePlano.addEventListener('click', () => {
            window.atividadePlanoContexto = {
                tipo: tipo,
                periodo: periodoSelecionado,
                granularidade: granularidade
            };
            crudModal.open('atividade');
        });
    }

    // Listeners para botões de atividades
    contentArea.querySelectorAll('.activity-view-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const activities = await window.StorageService.get('planner_activities') || [];
            const activity = activities.find(a => a.id === btn.dataset.id);
            if (activity) openViewModal(activity);
        });
    });

    contentArea.querySelectorAll('.activity-edit-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const activities = await window.StorageService.get('planner_activities') || [];
            const activity = activities.find(a => a.id === btn.dataset.id);
            if (activity) crudModal.open('atividade', activity);
        });
    });

    contentArea.querySelectorAll('.activity-transfer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const activities = await window.StorageService.get('planner_activities') || [];
            const activity = activities.find(a => a.id === btn.dataset.id);
            if (activity) openTransferModal(activity);
        });
    });
}

export async function switchToPlanosView(prazo = 'anual', periodoForcado = null) {
    currentPlanosTab = prazo;
    headerTitle.textContent = '';
    hideAllViews();

    const viewPlanos = document.getElementById('view-planos');
    viewPlanos.classList.remove('hidden');
    viewPlanos.classList.add('flex');

    const contentArea = document.getElementById('planos-content-cards');

    if (prazo === 'anual') {
        planosPeriodoSelecionado['plano_anual'] = periodoForcado || getPeriodoKey(Date.now(), 'ano');
        await renderPlanoVersionado(contentArea, 'plano_anual', 'Plano Anual', '📅', 'ano');
    } else if (prazo === 'mensal') {
        planosPeriodoSelecionado['plano_mensal'] = periodoForcado || getPeriodoKey(Date.now(), 'mes');
        await renderPlanoVersionado(contentArea, 'plano_mensal', 'Plano Mensal', '🗓️', 'mes');
    } else if (prazo === 'semanal') {
        planosPeriodoSelecionado['plano_semanal'] = periodoForcado || getPeriodoKey(Date.now(), 'semana');
        await renderPlanoVersionado(contentArea, 'plano_semanal', 'Plano Semanal', '📋', 'semana');
    }
}

export async function switchToAtividadesView() {
    atividadesPaginaAtual = 1;
    headerTitle.textContent = 'Atividades';
    document.getElementById('header-periodo-buttons').innerHTML = '';
    hideAllViews();

    const viewAtividades = document.getElementById('view-atividades');
    viewAtividades.classList.remove('hidden');
    viewAtividades.classList.add('flex');

    const contentArea = document.getElementById('atividades-content-cards');
    const categorias = await window.StorageService.get('planner_atividade-categoria') || [];
    const contextos = await window.StorageService.get('planner_contexto') || [];

    contentArea.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-[var(--text-primary)]">📋 Atividades</h2>
            <div class="flex gap-2">
                <button id="btn-nova-atividade-lista" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                    + Cadastrar Atividade
                </button>
            </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-4 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
            <input type="text" id="atividades-filtro-texto" placeholder="Buscar por título..." class="flex-1 min-w-[160px] border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)] text-sm">
            <select id="atividades-filtro-status" class="border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)] text-sm">
                <option value="">Status: Todos</option>
                <option value="livre">Livre</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
            </select>
            <select id="atividades-filtro-categoria" class="border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)] text-sm">
                <option value="">Categoria: Todas</option>
                ${categorias.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('')}
            </select>
            <select id="atividades-filtro-contexto" class="border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)] text-sm">
                <option value="">Contexto: Todos</option>
                ${contextos.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('')}
            </select>
        </div>

        <div class="overflow-x-auto bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-[var(--border-color)] text-left text-[var(--text-secondary)] uppercase text-xs">
                        <th class="p-3">Título</th>
                        <th class="p-3">Data</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Categoria</th>
                        <th class="p-3">Contexto</th>
                        <th class="p-3">Prioridade</th>
                        <th class="p-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody id="atividades-table-body"></tbody>
            </table>
        </div>

        <div id="atividades-paginacao" class="mt-4 flex items-center justify-between bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
            <button id="btn-pag-anterior" class="px-3 py-1.5 border border-[var(--border-color)] rounded text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border-color)] transition">← Anterior</button>
            <span id="info-paginacao" class="text-sm text-[var(--text-secondary)] font-semibold">Página 1 de 1</span>
            <button id="btn-pag-proxima" class="px-3 py-1.5 border border-[var(--border-color)] rounded text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border-color)] transition">Próxima →</button>
        </div>
    `;

    document.getElementById('btn-nova-atividade-lista').addEventListener('click', () => crudModal.open('atividade'));

    ['atividades-filtro-texto', 'atividades-filtro-status', 'atividades-filtro-categoria', 'atividades-filtro-contexto'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => { atividadesPaginaAtual = 1; renderAtividadesTable(); });
        el.addEventListener('change', () => { atividadesPaginaAtual = 1; renderAtividadesTable(); });
    });

    document.getElementById('btn-pag-anterior').addEventListener('click', () => {
        if (atividadesPaginaAtual > 1) {
            atividadesPaginaAtual--;
            renderAtividadesTable();
        }
    });

    document.getElementById('btn-pag-proxima').addEventListener('click', async () => {
        const activities = await window.StorageService.get('planner_activities') || [];
        const filtroTexto = (document.getElementById('atividades-filtro-texto')?.value || '').toLowerCase().trim();
        const filtroStatus = document.getElementById('atividades-filtro-status')?.value || '';
        const filtroCategoria = document.getElementById('atividades-filtro-categoria')?.value || '';
        const filtroContexto = document.getElementById('atividades-filtro-contexto')?.value || '';

        const filtradas = activities.filter(a => {
            if (filtroTexto && !(a.title || '').toLowerCase().includes(filtroTexto)) return false;
            if (filtroStatus && a.status !== filtroStatus) return false;
            if (filtroCategoria && a.category !== filtroCategoria) return false;
            if (filtroContexto && a.contexto !== filtroContexto) return false;
            return true;
        });

        const totalPaginas = Math.ceil(filtradas.length / ATIVIDADES_POR_PAGINA);
        if (atividadesPaginaAtual < totalPaginas) {
            atividadesPaginaAtual++;
            renderAtividadesTable();
        }
    });

    await renderAtividadesTable();
}

export async function renderAtividadesTable() {
    const tbody = document.getElementById('atividades-table-body');
    if (!tbody) return;

    const activities = await window.StorageService.get('planner_activities') || [];

    const filtroTexto = (document.getElementById('atividades-filtro-texto')?.value || '').toLowerCase().trim();
    const filtroStatus = document.getElementById('atividades-filtro-status')?.value || '';
    const filtroCategoria = document.getElementById('atividades-filtro-categoria')?.value || '';
    const filtroContexto = document.getElementById('atividades-filtro-contexto')?.value || '';

    const filtradas = activities.filter(a => {
        if (filtroTexto && !(a.title || '').toLowerCase().includes(filtroTexto)) return false;
        if (filtroStatus && a.status !== filtroStatus) return false;
        if (filtroCategoria && a.category !== filtroCategoria) return false;
        if (filtroContexto && a.contexto !== filtroContexto) return false;
        return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalPaginas = Math.ceil(filtradas.length / ATIVIDADES_POR_PAGINA);
    if (atividadesPaginaAtual > totalPaginas) atividadesPaginaAtual = Math.max(1, totalPaginas);

    const inicio = (atividadesPaginaAtual - 1) * ATIVIDADES_POR_PAGINA;
    const fim = inicio + ATIVIDADES_POR_PAGINA;
    const paginada = filtradas.slice(inicio, fim);

    if (filtradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center italic text-[var(--text-secondary)] p-6">Nenhuma atividade encontrada.</td></tr>`;
        document.getElementById('info-paginacao').textContent = 'Página 1 de 1';
        document.getElementById('btn-pag-anterior').disabled = true;
        document.getElementById('btn-pag-proxima').disabled = true;
        return;
    }

    document.getElementById('info-paginacao').textContent = `Página ${atividadesPaginaAtual} de ${totalPaginas} (${filtradas.length} no total)`;
    document.getElementById('btn-pag-anterior').disabled = atividadesPaginaAtual === 1;
    document.getElementById('btn-pag-proxima').disabled = atividadesPaginaAtual === totalPaginas;

    const statusBadge = {
        livre: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
        concluido: 'bg-green-100 text-green-700 border-green-300',
        cancelado: 'bg-red-100 text-red-700 border-red-300'
    };
    const statusLabel = { livre: 'Livre', concluido: 'Concluído', cancelado: 'Cancelado' };
    const eisenhowerLabel = { q1: '🔴 Q1', q2: '🟠 Q2', q3: '🟡 Q3', q4: '⚪ Q4' };

    tbody.innerHTML = paginada.map(a => {
        let dateStr = '-';
        if (a.date) {
            const parts = a.date.split('-');
            if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return `
            <tr class="border-b border-[var(--border-color)] hover:bg-[var(--border-color)]/30 transition" data-id="${a.id}">
                <td class="p-3 font-semibold text-[var(--text-primary)]">${a.title}</td>
                <td class="p-3 text-[var(--text-secondary)]">${dateStr}</td>
                <td class="p-3"><span class="text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${statusBadge[a.status] || statusBadge.livre}">${statusLabel[a.status] || a.status}</span></td>
                <td class="p-3 text-[var(--text-secondary)]">${a.category || '-'}</td>
                <td class="p-3 text-[var(--text-secondary)]">${a.contexto || '-'}</td>
                <td class="p-3 text-[var(--text-secondary)]">${eisenhowerLabel[a.eisenhower] || '-'}</td>
                <td class="p-3 text-right whitespace-nowrap">
                    <button title="Visualizar" class="text-xs px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition mr-1 btn-ver-atividade">👁️ Ver</button>
                    <button title="Editar" class="text-xs px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition mr-1 btn-editar-atividade">✏️ Editar</button>
                    <button title="Transferir" class="text-xs px-2 py-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition btn-transferir-atividade">🔄 Transferir</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('tr').forEach(tr => {
        const id = tr.dataset.id;
        const activity = paginada.find(a => a.id === id);
        tr.querySelector('.btn-ver-atividade').addEventListener('click', () => openViewModal(activity));
        tr.querySelector('.btn-editar-atividade').addEventListener('click', () => crudModal.open('atividade', activity));
        tr.querySelector('.btn-transferir-atividade').addEventListener('click', () => openTransferModal(activity));
    });
}
