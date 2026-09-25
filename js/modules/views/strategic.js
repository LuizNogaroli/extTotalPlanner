/**
 * strategic.js — Views do nível estratégico: Missão, Visão, Valores, Objetivos
 *
 * Exporta:
 *   - initStrategicViews(domRefs) — chamar uma vez no boot; registra menu listeners
 *   - switchToMissaoView() — mostra página da Missão
 *   - switchToVisaoView() — mostra página da Visão
 *   - switchToValoresView() — mostra página de Valores
 *   - switchToObjetivosView() — mostra página de Objetivos
 *
 * Acessa window.StorageService (definido em js/services/StorageService.js).
 *
 * Extraído de js/app.js na Fase 5 do plano de refatoração (docs/plano_refatoracao_appjs.md).
 */

let crudModal = null;
let hideAllViews = null;
let viewStrategic = null;
let headerTitle = null;
let currentStrategicSection = null;
let seedDemoEstrategicos = null;

let btnVoltarMissaoListenersAttached = false;
let btnVoltarVisaoListenersAttached = false;
let btnVoltarValoresListenersAttached = false;
let btnVoltarObjetivosListenersAttached = false;

export function initStrategicViews(domRefs) {
    crudModal = domRefs.crudModal;
    hideAllViews = domRefs.hideAllViews;
    viewStrategic = domRefs.viewStrategic;
    headerTitle = domRefs.headerTitle;
    seedDemoEstrategicos = domRefs.seedDemoEstrategicos;

    // Menu listeners
    document.getElementById('menu-missao').addEventListener('click', switchToMissaoView);
    document.getElementById('menu-visao').addEventListener('click', switchToVisaoView);
    document.getElementById('menu-valores').addEventListener('click', switchToValoresView);
    document.getElementById('menu-objetivos').addEventListener('click', switchToObjetivosView);
}

export async function switchToMissaoView() {
    currentStrategicSection = 'missao';
    headerTitle.textContent = "Declaração de Missão";
    hideAllViews();
    viewStrategic.classList.remove('hidden');
    viewStrategic.classList.add('flex');

    const contentArea = document.getElementById('strategic-content-cards');
    contentArea.innerHTML = '<span class="animate-pulse">Carregando missão...</span>';

    const strategies = await window.StorageService.get('planner_strategies') || [];
    const missaoRecords = strategies.filter(s => s.type === 'missao').sort((a,b) => b.timestamp - a.timestamp);

    const botoesMissao = `
        <div class="flex justify-end gap-3 mb-6">
            <button id="btn-seed-estrategicos" class="px-4 py-2 border border-[var(--border-color)] rounded-lg font-semibold text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-all" title="Popula Missão, Visão, Objetivos e Planos com dados de exemplo">
                🎲 Carregar dados de exemplo
            </button>
            <button id="btn-educacional-missao" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                📚 Educacional
            </button>
            <button id="btn-new-missao" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                ✏️ Atualizar Missão
            </button>
        </div>
    `;

    if (missaoRecords.length === 0) {
        contentArea.innerHTML = `
            ${botoesMissao}
            <div class="text-[var(--text-secondary)] italic">Nenhuma missão cadastrada ainda.</div>
        `;
    } else {
        const latest = missaoRecords[0];
        const today = new Date();
        const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const anteriores = missaoRecords.slice(1);

        contentArea.innerHTML = `
            ${botoesMissao}

            <div class="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/90 to-[var(--primary-color)]/75 p-8 rounded-xl mb-8 shadow-lg border border-white/10">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-white mb-1" style="text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);">Missão Atual</h2>
                    <p class="text-lg font-semibold text-white/95 capitalize" style="text-shadow: 0 2px 6px rgba(0,0,0,0.4);">${dateStr}</p>
                </div>

                <div class="bg-white p-6 rounded-lg border border-white/20 shadow-md">
                    <p class="text-lg text-[var(--text-primary)] mb-6 leading-relaxed italic font-semibold">"${latest.content}"</p>
                    <div class="flex items-center text-sm text-[var(--text-secondary)]">
                        <span class="mr-2">📅</span>
                        <span>Definida em: ${new Date(latest.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>

            ${anteriores.length > 0 ? `
            <div class="bg-[var(--bg-panel)] p-8 rounded-xl border border-[var(--border-color)] shadow-md">
                <h3 class="text-2xl font-bold mb-8 text-[var(--primary-color)] flex items-center">
                    <span class="mr-3">📜</span>
                    Missão (versões anteriores)
                </h3>
                <div class="space-y-3">
                    ${anteriores.map((m, idx) => {
                        const excerpt = m.content.substring(0, 80) + (m.content.length > 80 ? '...' : '');
                        const daysAgo = Math.floor((new Date() - new Date(m.timestamp)) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 p-5 rounded-lg border border-[var(--border-color)] transition-all cursor-pointer group" title="${m.content}">
                                <div class="flex justify-between items-start gap-4">
                                    <div class="flex-1">
                                        <div class="text-sm text-[var(--text-secondary)] font-medium mb-1">
                                            ${new Date(m.timestamp).toLocaleString('pt-BR')}
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

    const btnNewMissao = document.getElementById('btn-new-missao');
    if (btnNewMissao) {
        btnNewMissao.addEventListener('click', () => {
            crudModal.open('missao');
        });
    }

    const btnSeedEstrategicos = document.getElementById('btn-seed-estrategicos');
    if (btnSeedEstrategicos) {
        btnSeedEstrategicos.addEventListener('click', seedDemoEstrategicos);
    }

    const btnEducacionalMissao = document.getElementById('btn-educacional-missao');
    if (btnEducacionalMissao) {
        btnEducacionalMissao.addEventListener('click', () => {
            hideAllViews();
            const view = document.getElementById('view-missao-educacional');
            if (view) {
                view.classList.remove('hidden');
                view.classList.add('flex');
                view.scrollTop = 0;
            }
        });
    }

    if (!btnVoltarMissaoListenersAttached) {
        const btnVoltarMissao = document.getElementById('btn-voltar-missao');
        const btnVoltarMissaoBottom = document.getElementById('btn-voltar-missao-bottom');

        const voltarParaMissao = () => {
            hideAllViews();
            viewStrategic.classList.remove('hidden');
            viewStrategic.classList.add('flex');
        };

        if (btnVoltarMissao) {
            btnVoltarMissao.addEventListener('click', voltarParaMissao);
        }
        if (btnVoltarMissaoBottom) {
            btnVoltarMissaoBottom.addEventListener('click', voltarParaMissao);
        }
        btnVoltarMissaoListenersAttached = true;
    }
}

export async function switchToVisaoView() {
    currentStrategicSection = 'visao';
    headerTitle.textContent = "Declaração de Visão";
    hideAllViews();
    viewStrategic.classList.remove('hidden');
    viewStrategic.classList.add('flex');

    const contentArea = document.getElementById('strategic-content-cards');
    contentArea.innerHTML = '<span class="animate-pulse">Carregando visão...</span>';

    const strategies = await window.StorageService.get('planner_strategies') || [];
    const visaoRecords = strategies.filter(s => s.type === 'visao').sort((a,b) => b.timestamp - a.timestamp);

    if (visaoRecords.length === 0) {
        contentArea.innerHTML = `
            <div class="flex justify-end gap-3 mb-6">
                <button id="btn-educacional-visao" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                    📚 Educacional
                </button>
                <button id="btn-new-visao" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                    ✏️ Atualizar Visão
                </button>
            </div>
            <div class="text-[var(--text-secondary)] italic">Nenhuma visão cadastrada ainda.</div>
        `;
    } else {
        const latest = visaoRecords[0];
        const today = new Date();
        const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const anteriores = visaoRecords.slice(1);

        contentArea.innerHTML = `
            <div class="flex justify-end gap-3 mb-6">
                <button id="btn-educacional-visao" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                    📚 Educacional
                </button>
                <button id="btn-new-visao" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                    ✏️ Atualizar Visão
                </button>
            </div>

            <div class="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/90 to-[var(--primary-color)]/75 p-8 rounded-xl mb-8 shadow-lg border border-white/10">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-white mb-1" style="text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);">Visão Atual</h2>
                    <p class="text-lg font-semibold text-white/95 capitalize" style="text-shadow: 0 2px 6px rgba(0,0,0,0.4);">${dateStr}</p>
                </div>

                <div class="bg-white p-6 rounded-lg border border-white/20 shadow-md">
                    <p class="text-lg text-[var(--text-primary)] mb-6 leading-relaxed italic font-semibold">"${latest.content}"</p>
                    <div class="flex items-center text-sm text-[var(--text-secondary)]">
                        <span class="mr-2">📅</span>
                        <span>Definida em: ${new Date(latest.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>

            ${anteriores.length > 0 ? `
            <div class="bg-[var(--bg-panel)] p-8 rounded-xl border border-[var(--border-color)] shadow-md">
                <h3 class="text-2xl font-bold mb-8 text-[var(--primary-color)] flex items-center">
                    <span class="mr-3">📜</span>
                    Visão (versões anteriores)
                </h3>
                <div class="space-y-3">
                    ${anteriores.map((v, idx) => {
                        const excerpt = v.content.substring(0, 80) + (v.content.length > 80 ? '...' : '');
                        const daysAgo = Math.floor((new Date() - new Date(v.timestamp)) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 p-5 rounded-lg border border-[var(--border-color)] transition-all cursor-pointer group" title="${v.content}">
                                <div class="flex justify-between items-start gap-4">
                                    <div class="flex-1">
                                        <div class="text-sm text-[var(--text-secondary)] font-medium mb-1">
                                            ${new Date(v.timestamp).toLocaleString('pt-BR')}
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

    const btnNewVisao = document.getElementById('btn-new-visao');
    if (btnNewVisao) {
        btnNewVisao.addEventListener('click', () => {
            crudModal.open('visao');
        });
    }

    const btnEducacionalVisao = document.getElementById('btn-educacional-visao');
    if (btnEducacionalVisao) {
        btnEducacionalVisao.addEventListener('click', () => {
            hideAllViews();
            const view = document.getElementById('view-visao-educacional');
            if (view) {
                view.classList.remove('hidden');
                view.classList.add('flex');
                view.scrollTop = 0;
            }
        });
    }

    if (!btnVoltarVisaoListenersAttached) {
        const btnVoltarVisao = document.getElementById('btn-voltar-visao');
        const btnVoltarVisaoBottom = document.getElementById('btn-voltar-visao-bottom');

        const voltarParaVisao = () => {
            hideAllViews();
            viewStrategic.classList.remove('hidden');
            viewStrategic.classList.add('flex');
        };

        if (btnVoltarVisao) {
            btnVoltarVisao.addEventListener('click', voltarParaVisao);
        }
        if (btnVoltarVisaoBottom) {
            btnVoltarVisaoBottom.addEventListener('click', voltarParaVisao);
        }
        btnVoltarVisaoListenersAttached = true;
    }
}

export async function switchToValoresView() {
    currentStrategicSection = 'valores';
    headerTitle.textContent = "Declaração de Valores";
    hideAllViews();
    viewStrategic.classList.remove('hidden');
    viewStrategic.classList.add('flex');

    const contentArea = document.getElementById('strategic-content-cards');
    contentArea.innerHTML = '<span class="animate-pulse">Carregando valores...</span>';

    const esc = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const strategies = await window.StorageService.get('planner_strategies') || [];
    const valoresRecords = strategies.filter(s => s.type === 'valores').sort((a, b) => b.timestamp - a.timestamp);

    const botoesHtml = `
        <div class="flex justify-end gap-3 mb-6">
            <button id="btn-educacional-valores" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                📚 Educacional
            </button>
            <button id="btn-new-valores" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                ✏️ Atualizar Valores
            </button>
        </div>
    `;

    if (valoresRecords.length === 0) {
        contentArea.innerHTML = `
            ${botoesHtml}
            <div class="text-[var(--text-secondary)] italic">Nenhuma declaração de valores cadastrada ainda.</div>
        `;
    } else {
        const latest = valoresRecords[0];
        const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const anteriores = valoresRecords.slice(1);

        contentArea.innerHTML = `
            ${botoesHtml}

            <div class="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/90 to-[var(--primary-color)]/75 p-8 rounded-xl mb-8 shadow-lg border border-white/10">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-white mb-1" style="text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);">Valores Atuais</h2>
                    <p class="text-lg font-semibold text-white/95 capitalize" style="text-shadow: 0 2px 6px rgba(0,0,0,0.4);">${dateStr}</p>
                </div>

                <div class="bg-white p-6 rounded-lg border border-white/20 shadow-md">
                    <p class="text-lg text-[var(--text-primary)] mb-6 leading-relaxed font-semibold whitespace-pre-line">${esc(latest.content)}</p>
                    <div class="flex items-center text-sm text-[var(--text-secondary)]">
                        <span class="mr-2">📅</span>
                        <span>Definidos em: ${new Date(latest.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>

            ${anteriores.length > 0 ? `
            <div class="bg-[var(--bg-panel)] p-8 rounded-xl border border-[var(--border-color)] shadow-md">
                <h3 class="text-2xl font-bold mb-8 text-[var(--primary-color)] flex items-center">
                    <span class="mr-3">📜</span>
                    Valores (versões anteriores)
                </h3>
                <div class="space-y-3">
                    ${anteriores.map(v => {
                        const excerpt = v.content.substring(0, 80) + (v.content.length > 80 ? '...' : '');
                        const daysAgo = Math.floor((new Date() - new Date(v.timestamp)) / (1000 * 60 * 60 * 24));
                        return `
                            <div class="bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 p-5 rounded-lg border border-[var(--border-color)] transition-all cursor-pointer group" title="${esc(v.content)}">
                                <div class="flex justify-between items-start gap-4">
                                    <div class="flex-1">
                                        <div class="text-sm text-[var(--text-secondary)] font-medium mb-1">
                                            ${new Date(v.timestamp).toLocaleString('pt-BR')}
                                            <span class="text-xs text-[var(--text-secondary)]/70">(há ${daysAgo} dias)</span>
                                        </div>
                                        <p class="text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors whitespace-pre-line">${esc(excerpt)}</p>
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

    document.getElementById('btn-new-valores').addEventListener('click', () => {
        crudModal.open('valores');
    });

    document.getElementById('btn-educacional-valores').addEventListener('click', () => {
        hideAllViews();
        const view = document.getElementById('view-valores-educacional');
        view.classList.remove('hidden');
        view.classList.add('flex');
        view.scrollTop = 0;
    });

    if (!btnVoltarValoresListenersAttached) {
        const voltarParaValores = () => {
            hideAllViews();
            viewStrategic.classList.remove('hidden');
            viewStrategic.classList.add('flex');
        };
        document.getElementById('btn-voltar-valores').addEventListener('click', voltarParaValores);
        document.getElementById('btn-voltar-valores-bottom').addEventListener('click', voltarParaValores);
        btnVoltarValoresListenersAttached = true;
    }
}

export async function switchToObjetivosView() {
    currentStrategicSection = 'objetivos';
    headerTitle.textContent = "Objetivos Estratégicos";
    hideAllViews();
    viewStrategic.classList.remove('hidden');
    viewStrategic.classList.add('flex');

    const contentArea = document.getElementById('strategic-content-cards');
    contentArea.innerHTML = '<span class="animate-pulse">Carregando objetivos...</span>';

    const strategies = await window.StorageService.get('planner_strategies') || [];
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const prazoConfig = [
        { key: 'obj_longo', label: 'Objetivos de Longo Prazo', icon: '🏆' },
        { key: 'obj_medio', label: 'Objetivos de Médio Prazo', icon: '📈' },
        { key: 'obj_curto', label: 'Objetivos de Curto Prazo', icon: '🎯' }
    ];

    const sectionsHtml = prazoConfig.map(pc => {
        const registros = strategies.filter(s => s.type === pc.key).sort((a, b) => b.timestamp - a.timestamp);

        if (registros.length === 0) {
            return `
                <div class="mb-10">
                    <h3 class="text-xl font-bold mb-3 text-[var(--primary-color)] flex items-center gap-2">
                        <span>${pc.icon}</span><span>${pc.label}</span>
                    </h3>
                    <div class="text-[var(--text-secondary)] italic">Nenhum objetivo cadastrado ainda.</div>
                </div>
            `;
        }

        const latest = registros[0];
        const anteriores = registros.slice(1);

        return `
            <div class="mb-10">
                <div class="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/90 to-[var(--primary-color)]/75 p-8 rounded-xl mb-4 shadow-lg border border-white/10">
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-white mb-1 flex items-center gap-2" style="text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);">
                            <span>${pc.icon}</span><span>${pc.label}</span>
                        </h2>
                        <p class="text-lg font-semibold text-white/95 capitalize" style="text-shadow: 0 2px 6px rgba(0,0,0,0.4);">${dateStr}</p>
                    </div>

                    <div class="bg-white p-6 rounded-lg border border-white/20 shadow-md">
                        <p class="text-lg text-[var(--text-primary)] mb-6 leading-relaxed italic font-semibold">"${latest.content}"</p>
                        <div class="flex items-center text-sm text-[var(--text-secondary)]">
                            <span class="mr-2">📅</span>
                            <span>Definido em: ${new Date(latest.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                </div>

                ${anteriores.length > 0 ? `
                <details class="bg-[var(--bg-panel)] p-5 rounded-xl border border-[var(--border-color)]">
                    <summary class="cursor-pointer font-bold text-[var(--primary-color)] flex items-center gap-2">
                        <span>📜</span><span>${pc.label} (versões anteriores)</span>
                    </summary>
                    <div class="space-y-3 mt-4">
                        ${anteriores.map((o, idx) => {
                            const excerpt = o.content.substring(0, 80) + (o.content.length > 80 ? '...' : '');
                            const daysAgo = Math.floor((new Date() - new Date(o.timestamp)) / (1000 * 60 * 60 * 24));
                            return `
                                <div class="bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 p-5 rounded-lg border border-[var(--border-color)] transition-all cursor-pointer group" title="${o.content}">
                                    <div class="flex justify-between items-start gap-4">
                                        <div class="flex-1">
                                            <div class="text-sm text-[var(--text-secondary)] font-medium mb-1">
                                                ${new Date(o.timestamp).toLocaleString('pt-BR')}
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
                </details>
                ` : ''}
            </div>
        `;
    }).join('');

    contentArea.innerHTML = `
        <div class="flex justify-end gap-3 mb-6">
            <button id="btn-educacional-objetivos" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                📚 Educacional
            </button>
            <button id="btn-new-objetivos" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                ✏️ Atualizar Objetivo
            </button>
        </div>
        ${sectionsHtml}
    `;

    const btnNewObjetivos = document.getElementById('btn-new-objetivos');
    if (btnNewObjetivos) {
        btnNewObjetivos.addEventListener('click', () => {
            crudModal.open('objetivos');
        });
    }

    const btnEducacionalObjetivos = document.getElementById('btn-educacional-objetivos');
    if (btnEducacionalObjetivos) {
        btnEducacionalObjetivos.addEventListener('click', () => {
            hideAllViews();
            const view = document.getElementById('view-objetivos-educacional');
            if (view) {
                view.classList.remove('hidden');
                view.classList.add('flex');
                view.scrollTop = 0;
            }
        });
    }

    if (!btnVoltarObjetivosListenersAttached) {
        const btnVoltarObjetivos = document.getElementById('btn-voltar-objetivos');
        const btnVoltarObjetivosBottom = document.getElementById('btn-voltar-objetivos-bottom');

        const voltarParaObjetivos = () => {
            hideAllViews();
            viewStrategic.classList.remove('hidden');
            viewStrategic.classList.add('flex');
        };

        if (btnVoltarObjetivos) {
            btnVoltarObjetivos.addEventListener('click', voltarParaObjetivos);
        }
        if (btnVoltarObjetivosBottom) {
            btnVoltarObjetivosBottom.addEventListener('click', voltarParaObjetivos);
        }
        btnVoltarObjetivosListenersAttached = true;
    }
}
