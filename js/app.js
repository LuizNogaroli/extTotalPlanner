// Ponto de entrada (Bootstrap) do aplicativo

// Importar módulos de CRUD
import { CRUDModal } from './modules/crudModal.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar Tema e Acessibilidade
    const themeService = new ThemeService();
    const settings = await themeService.applySavedSettings();

    // 2. Inicializar Sistema de Idioma
    const i18n = new I18nService('pt-BR');
    await i18n.loadLanguage();
    i18n.translatePage();

    // 3. Inicializar Modal CRUD
    const crudModal = new CRUDModal(
        document.getElementById('global-crud-modal'),
        document.getElementById('modal-title'),
        StorageService
    );

    // O roteamento inicial é feito no final deste bloco.

    // Listener para quando o usuário trocar o layout no ThemeService
    window.addEventListener('layoutChanged', (e) => {
        renderWeeklyGrid(e.detail);
    });

    // Navegação entre Views (SPA Routing Simples)
    const viewDashboard = document.getElementById('view-dashboard');
    const viewSettings = document.getElementById('view-settings');
    const viewReports = document.getElementById('view-reports');
    const viewStrategic = document.getElementById('view-strategic');
    const viewExport = document.getElementById('view-export');
    const viewWeekly = document.getElementById('weekly-view-wrapper');
    const viewDaily = document.getElementById('daily-view-wrapper');
    const headerTitle = document.getElementById('current-week-display');

    const btnMenuDashboard = document.getElementById('menu-dashboard');
    const btnMenuSettings = document.getElementById('menu-settings');

    const themeServiceInstance = window.ThemeService;

    // Remove transições na carga inicial
    document.body.classList.remove('transition-colors');
    setTimeout(() => document.body.classList.add('transition-colors'), 100);

    // Carrega layout
    let currentLayout = settings.layout || 'grid';

    // Listener para quando o usuário trocar o layout
    window.addEventListener('layoutChanged', (e) => {
        currentLayout = e.detail;
        switchToWeeklyView(new Date(), currentLayout);
    });

    // Roteamento
    let savedWeekTitle = "";
    let btnVoltarMissaoListenersAttached = false;
    let btnVoltarVisaoListenersAttached = false;
    let btnVoltarObjetivosListenersAttached = false;
    let currentStrategicSection = null; // 'missao' | 'visao' | 'objetivos'
    let currentPlanosTab = 'anual'; // 'anual' | 'mensal' | 'semanal'
    let planosPeriodoSelecionado = {}; // { plano_anual: '2026', plano_mensal: '2026-09' } período em exibição por tipo

    document.getElementById('menu-missao').addEventListener('click', switchToMissaoView);
    document.getElementById('menu-visao').addEventListener('click', switchToVisaoView);
    document.getElementById('menu-objetivos').addEventListener('click', switchToObjetivosView);
    document.getElementById('menu-plano-anual').addEventListener('click', () => switchToPlanosView('anual'));
    document.getElementById('menu-plano-mensal').addEventListener('click', () => switchToPlanosView('mensal'));
    document.getElementById('menu-plano-semanal').addEventListener('click', () => switchToPlanosView('semanal'));
    document.getElementById('menu-atividades').addEventListener('click', () => switchToAtividadesView());

    async function switchToMissaoView() {
        currentStrategicSection = 'missao';
        headerTitle.textContent = "Declaração de Missão";
        hideAllViews();
        viewStrategic.classList.remove('hidden');
        viewStrategic.classList.add('flex');
        
        const contentArea = document.getElementById('strategic-content-cards');
        contentArea.innerHTML = '<span class="animate-pulse">Carregando missão...</span>';
        
        const strategies = await StorageService.get('planner_strategies') || [];
        const missaoRecords = strategies.filter(s => s.type === 'missao').sort((a,b) => b.timestamp - a.timestamp);
        
        if (missaoRecords.length === 0) {
            contentArea.innerHTML = '<div class="text-[var(--text-secondary)] italic">Nenhuma missão cadastrada ainda.</div>';
            return;
        }

        const latest = missaoRecords[0];
        const today = new Date();
        const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const anteriores = missaoRecords.slice(1);

        contentArea.innerHTML = `
            <div class="flex justify-end gap-3 mb-6">
                <button id="btn-educacional-missao" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                    📚 Educacional
                </button>
                <button id="btn-new-missao" class="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--primary-color)]/90 transition-all">
                    ✏️ Atualizar Missão
                </button>
            </div>

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
            </div>
        `;

        // Adicionar listener para o botão de nova missão
        const btnNewMissao = document.getElementById('btn-new-missao');
        if (btnNewMissao) {
            btnNewMissao.addEventListener('click', () => {
                crudModal.open('missao');
            });
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

        // Botões de voltar da página educacional (elementos estáticos: listener registrado uma única vez)
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

    async function switchToVisaoView() {
        currentStrategicSection = 'visao';
        headerTitle.textContent = "Declaração de Visão";
        hideAllViews();
        viewStrategic.classList.remove('hidden');
        viewStrategic.classList.add('flex');

        const contentArea = document.getElementById('strategic-content-cards');
        contentArea.innerHTML = '<span class="animate-pulse">Carregando visão...</span>';

        const strategies = await StorageService.get('planner_strategies') || [];
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

        // Adicionar listener para o botão de nova visão
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

        // Botões de voltar da página educacional (elementos estáticos: listener registrado uma única vez)
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

    async function switchToObjetivosView() {
        currentStrategicSection = 'objetivos';
        headerTitle.textContent = "Objetivos Estratégicos";
        hideAllViews();
        viewStrategic.classList.remove('hidden');
        viewStrategic.classList.add('flex');

        const contentArea = document.getElementById('strategic-content-cards');
        contentArea.innerHTML = '<span class="animate-pulse">Carregando objetivos...</span>';

        const strategies = await StorageService.get('planner_strategies') || [];
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

        // Adicionar listener para o botão de novo objetivo
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

        // Botões de voltar da página educacional (elementos estáticos: listener registrado uma única vez)
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

    // Renderiza o esquema "texto único versionado" (atual + histórico) compartilhado
    // entre todos os Planos (Anual, Mensal e, futuramente, Semanal).
    // Deriva a chave do período (ano ou mês) a partir de um timestamp.
    function getPeriodoKey(timestamp, granularidade) {
        const d = new Date(timestamp);
        if (granularidade === 'mes') {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
        return String(d.getFullYear());
    }

    // Rótulo legível do período, ex.: "2026" ou "Setembro de 2026".
    function getPeriodoLabel(key, granularidade) {
        if (granularidade === 'mes') {
            const [ano, mes] = key.split('-');
            const nome = new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            return nome.charAt(0).toUpperCase() + nome.slice(1);
        }
        return key;
    }

    // Renderiza o esquema "texto único versionado" com navegação por período (ano/mês):
    // o período atual fica ativo/editável; períodos anteriores aparecem como botões
    // cinza/inativos numa barra superior e são somente leitura.
    async function renderPlanoVersionado(contentArea, tipo, label, icone, granularidade = 'ano') {
        contentArea.innerHTML = `<span class="animate-pulse">Carregando ${label.toLowerCase()}...</span>`;

        const strategies = await StorageService.get('planner_strategies') || [];
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

        const periodosOrdenados = Object.keys(grupos).sort().reverse();
        const periodoSelecionado = planosPeriodoSelecionado[tipo] || periodoAtualKey;
        const isPeriodoAtual = periodoSelecionado === periodoAtualKey;

        // Renderizar botões de período no cabeçalho
        const headerPeriodoBtn = document.getElementById('header-periodo-buttons');
        if (periodosOrdenados.length > 1) {
            headerPeriodoBtn.innerHTML = periodosOrdenados.map(key => {
                const ativo = key === periodoSelecionado;
                return `
                    <button class="plano-periodo-btn px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        ativo
                            ? 'bg-[var(--primary-color)] text-white'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
                    }" data-tipo="${tipo}" data-periodo="${key}">
                        ${getPeriodoLabel(key, granularidade)}${key === periodoAtualKey ? ' (atual)' : ''}
                    </button>
                `;
            }).join('');
        } else {
            headerPeriodoBtn.innerHTML = '';
        }

        const barraHtml = '';

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
            const activities = await StorageService.get('planner_activities') || [];
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

        contentArea.innerHTML = barraHtml + btnHtml + bodyHtml;

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
                // Armazenar contexto do plano atual para usar ao salvar
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
                const activities = await StorageService.get('planner_activities') || [];
                const activity = activities.find(a => a.id === btn.dataset.id);
                if (activity) openViewModal(activity);
            });
        });

        contentArea.querySelectorAll('.activity-edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const activities = await StorageService.get('planner_activities') || [];
                const activity = activities.find(a => a.id === btn.dataset.id);
                if (activity) crudModal.open('atividade', activity);
            });
        });

        contentArea.querySelectorAll('.activity-transfer-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const activities = await StorageService.get('planner_activities') || [];
                const activity = activities.find(a => a.id === btn.dataset.id);
                if (activity) openTransferModal(activity);
            });
        });

        contentArea.querySelectorAll('.plano-periodo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                planosPeriodoSelecionado[btn.dataset.tipo] = btn.dataset.periodo;
                renderPlanoVersionado(contentArea, tipo, label, icone, granularidade);
            });
        });
    }

    async function switchToPlanosView(prazo = 'anual') {
        currentPlanosTab = prazo;
        headerTitle.textContent = '';
        hideAllViews();

        const viewPlanos = document.getElementById('view-planos');
        viewPlanos.classList.remove('hidden');
        viewPlanos.classList.add('flex');

        const contentArea = document.getElementById('planos-content-cards');

        if (prazo === 'anual') {
            planosPeriodoSelecionado['plano_anual'] = getPeriodoKey(Date.now(), 'ano');
            await renderPlanoVersionado(contentArea, 'plano_anual', 'Plano Anual', '📅', 'ano');
        } else if (prazo === 'mensal') {
            planosPeriodoSelecionado['plano_mensal'] = getPeriodoKey(Date.now(), 'mes');
            await renderPlanoVersionado(contentArea, 'plano_mensal', 'Plano Mensal', '🗓️', 'mes');
        } else if (prazo === 'semanal') {
            planosPeriodoSelecionado['plano_semanal'] = getPeriodoKey(Date.now(), 'semana');
            await renderPlanoVersionado(contentArea, 'plano_semanal', 'Plano Semanal', '📋', 'semana');
        }
    }

    let atividadesPaginaAtual = 1;
    const ATIVIDADES_POR_PAGINA = 8;

    async function switchToAtividadesView() {
        atividadesPaginaAtual = 1;
        headerTitle.textContent = 'Atividades';
        document.getElementById('header-periodo-buttons').innerHTML = '';
        hideAllViews();

        const viewAtividades = document.getElementById('view-atividades');
        viewAtividades.classList.remove('hidden');
        viewAtividades.classList.add('flex');

        const contentArea = document.getElementById('atividades-content-cards');
        const categorias = await StorageService.get('planner_atividade-categoria') || [];
        const contextos = await StorageService.get('planner_contexto') || [];

        contentArea.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-[var(--text-primary)]">📋 Atividades</h2>
                <div class="flex gap-2">
                    <button id="btn-seed-atividades" class="px-4 py-2 border border-[var(--border-color)] rounded-lg font-semibold text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-all">🎲 Carregar dados de exemplo</button>
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
        document.getElementById('btn-seed-atividades').addEventListener('click', seedDemoAtividades);

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
            const activities = await StorageService.get('planner_activities') || [];
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

    async function seedDemoEstrategicos() {
        if (!confirm('Recuperar dados de Missão, Visão e Objetivos? Registros existentes serão preservados.')) return;

        const now = Date.now();

        // Missões
        const missoes = await StorageService.get('planner_strategies') || [];
        const demoMissoes = [
            {
                type: 'missao',
                content: 'Criar soluções digitais inovadoras que empoderem indivíduos e organizações a alcançar seus objetivos estratégicos com clareza, eficiência e segurança, mantendo excelência técnica e satisfação do usuário como prioridades.',
                timestamp: now - 86400000 * 7
            },
            {
                type: 'missao',
                content: 'Desenvolver produtos que simplifiquem a gestão estratégica e operacional, tornando o planejamento acessível a todos os níveis organizacionais.',
                timestamp: now - 86400000 * 3
            }
        ];

        for (const missao of demoMissoes) {
            if (!missoes.some(m => m.type === 'missao' && m.content === missao.content)) {
                missoes.push({ id: 'm_' + now + '_' + Math.random().toString(36).slice(2, 7), ...missao });
            }
        }

        // Visões
        const demoVisoes = [
            {
                type: 'visao',
                content: 'Ser reconhecida globalmente como a plataforma líder em planejamento estratégico integrado, onde profissionais, executivos e organizações realizam seu potencial máximo através de ferramentas intuitivas e confiáveis que conectam sonhos a ações concretas.',
                timestamp: now - 86400000 * 5
            },
            {
                type: 'visao',
                content: 'Um mundo onde cada pessoa e organização tem acesso a ferramentas que tornam a estratégia clara, o planejamento simples e o sucesso tangível.',
                timestamp: now - 86400000 * 1
            }
        ];

        for (const visao of demoVisoes) {
            if (!missoes.some(v => v.type === 'visao' && v.content === visao.content)) {
                missoes.push({ id: 'v_' + now + '_' + Math.random().toString(36).slice(2, 7), ...visao });
            }
        }

        await StorageService.set('planner_strategies', missoes);

        // Objetivos
        const objetivos = await StorageService.get('planner_objectives') || [];
        const demoObjetivos = [
            {
                prazo: 'longo',
                content: 'Dominar completamente a arquitetura de software de produção, sendo capaz de desenhar soluções escaláveis para problemas complexos.',
                timestamp: now - 86400000 * 60
            },
            {
                prazo: 'longo',
                content: 'Estabelecer reputação como especialista em desenvolvimento de aplicações estratégicas.',
                timestamp: now - 86400000 * 50
            },
            {
                prazo: 'medio',
                content: 'Implementar completamente o extPlanner como ferramenta de gestão estratégica 100% funcional.',
                timestamp: now - 86400000 * 30
            },
            {
                prazo: 'medio',
                content: 'Dominar os frameworks modernos de frontend (React/Vue) e backend (Node.js/Python).',
                timestamp: now - 86400000 * 20
            },
            {
                prazo: 'curto',
                content: 'Finalizar a seção operacional do extPlanner com listagem de atividades, filtros e relatórios.',
                timestamp: now - 86400000 * 5
            },
            {
                prazo: 'curto',
                content: 'Revisar e otimizar o código da sprint atual, reduzindo débito técnico.',
                timestamp: now - 86400000 * 2
            }
        ];

        let addedObj = 0;
        for (const obj of demoObjetivos) {
            if (!objetivos.some(o => o.content === obj.content)) {
                objetivos.push({ id: 'obj_' + now + '_' + Math.random().toString(36).slice(2, 7), ...obj });
                addedObj++;
            }
        }

        if (addedObj > 0) await StorageService.set('planner_objectives', objetivos);

        alert(`Dados de Missão/Visão/Objetivos recuperados (ou já estavam presentes).`);

        // Re-render se alguma dessas views estiver ativa
        if (currentStrategicSection === 'missao') await switchToMissaoView();
        else if (currentStrategicSection === 'visao') await switchToVisaoView();
        else if (!document.getElementById('view-objetivos-educacional').classList.contains('hidden')) await switchToObjetivosView();
    }

    async function seedDemoAtividades() {
        if (!confirm('Carregar dados de exemplo (categorias, contextos e atividades de demonstração)? Atividades com o mesmo título não serão duplicadas.')) return;

        const now = Date.now();
        const iso = new Date().toISOString();
        const uid = () => Math.random().toString(36).slice(2, 7);

        const cats = await StorageService.get('planner_atividade-categoria') || [];
        const demoCats = ['Trabalho', 'Saúde', 'Estudo', 'Casa'];
        for (const nome of demoCats) {
            if (!cats.some(c => c.nome === nome)) cats.push({ id: 'cat_' + now + '_' + uid(), nome });
        }
        await StorageService.set('planner_atividade-categoria', cats);

        const ctx = await StorageService.get('planner_contexto') || [];
        const demoCtx = ['Profissional', 'Pessoal', 'Família'];
        for (const nome of demoCtx) {
            if (!ctx.some(c => c.nome === nome)) ctx.push({ id: 'ctx_' + now + '_' + uid(), nome });
        }
        await StorageService.set('planner_contexto', ctx);

        const fmt = (offset) => {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        const demoActs = [
            { title: 'Revisar relatório mensal', desc: 'Consolidar números do mês e enviar para a diretoria.', date: fmt(0), status: 'livre', category: 'Trabalho', contexto: 'Profissional', eisenhower: 'q1' },
            { title: 'Corrida matinal 5km', desc: 'Manter rotina de saúde.', date: fmt(1), status: 'livre', category: 'Saúde', contexto: 'Pessoal', eisenhower: 'q2' },
            { title: 'Estudar capítulo de JavaScript', desc: 'Módulos ES6 e promises.', date: fmt(2), status: 'livre', category: 'Estudo', contexto: 'Pessoal', eisenhower: 'q2' },
            { title: 'Pagar contas do mês', desc: 'Água, luz e internet.', date: fmt(0), status: 'livre', category: 'Casa', contexto: 'Família', eisenhower: 'q3' },
            { title: 'Planejar jantar em família', desc: 'Organizar fim de semana.', date: fmt(3), status: 'livre', category: 'Casa', contexto: 'Família', eisenhower: 'q4' },
            { title: 'Enviar proposta comercial', desc: 'Ajustar escopo com o cliente.', date: fmt(-1), status: 'concluido', category: 'Trabalho', contexto: 'Profissional', eisenhower: 'q1' }
        ];

        const acts = await StorageService.get('planner_activities') || [];
        let added = 0;
        for (const d of demoActs) {
            if (!acts.some(a => a.title === d.title)) {
                acts.push({ id: 'act_' + now + '_' + uid(), createdAt: iso, ...d });
                added++;
            }
        }
        await StorageService.set('planner_activities', acts);

        if (!document.getElementById('view-atividades').classList.contains('hidden')) {
            await switchToAtividadesView();
        }
        alert(added > 0 ? `Dados de exemplo carregados: ${added} atividade(s) adicionada(s).` : 'Os dados de exemplo já estavam carregados.');
    }

    async function renderAtividadesTable() {
        const tbody = document.getElementById('atividades-table-body');
        if (!tbody) return;

        const activities = await StorageService.get('planner_activities') || [];

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

    function hideAllViews() {
        const viewIds = ['view-dashboard', 'view-settings', 'view-reports', 'view-strategic', 'view-export', 'view-missao-educacional', 'view-visao-educacional', 'view-objetivos-educacional', 'view-planos', 'view-atividades', 'weekly-view-wrapper', 'daily-view-wrapper'];
        viewIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.classList.remove('flex');
            }
        });

        const menuIds = ['menu-dashboard', 'menu-settings', 'menu-reports', 'menu-strategic', 'menu-export'];
        menuIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove('bg-[var(--border-color)]', 'font-bold');
        });
    }

    function switchToSettings() {
        savedWeekTitle = headerTitle.textContent;
        headerTitle.textContent = "Configurações";
        hideAllViews();
        viewSettings.classList.remove('hidden');
        btnMenuSettings.classList.add('bg-[var(--border-color)]', 'font-bold');
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    function switchToReportsView() {
        headerTitle.textContent = "Relatórios e Dados";
        hideAllViews();
        viewReports.classList.remove('hidden');
        viewReports.classList.add('flex');
        btnMenuReports.classList.add('bg-[var(--border-color)]', 'font-bold');
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    function switchToExportView() {
        headerTitle.textContent = "Exportar Dados";
        hideAllViews();
        viewExport.classList.remove('hidden');
        viewExport.classList.add('flex');
        if (btnMenuExport) btnMenuExport.classList.add('bg-[var(--border-color)]', 'font-bold');
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    async function switchToStrategicView() {
        headerTitle.textContent = "Planejamento Estratégico";
        hideAllViews();
        viewStrategic.classList.remove('hidden');
        viewStrategic.classList.add('flex');
        if (btnMenuStrategic) btnMenuStrategic.classList.add('bg-[var(--border-color)]', 'font-bold');
        
        const contentArea = document.getElementById('strategic-content-cards');
        contentArea.innerHTML = '<span class="animate-pulse">Carregando plano...</span>';
        
        const strategies = await StorageService.get('planner_strategies') || [];
        
        const typesConfig = [
            { key: 'missao', label: 'Missão', icon: '🚀' },
            { key: 'visao', label: 'Visão', icon: '🔭' },
            { key: 'obj_longo', label: 'Objetivos de Longo Prazo', icon: '🏆' },
            { key: 'obj_medio', label: 'Objetivos de Médio Prazo', icon: '📈' },
            { key: 'obj_curto', label: 'Objetivos de Curto Prazo', icon: '🎯' }
        ];

        contentArea.innerHTML = typesConfig.map(tc => {
            const item = strategies.find(s => s.type === tc.key) || { content: 'Não definido.', date: null };
            const enc = encodeURIComponent(JSON.stringify(item.id ? item : { type: tc.key }));
            const dateStr = item.date ? `<div class="text-xs text-[var(--text-secondary)] mt-3 italic">Definido em: ${item.date}</div>` : '';
            return `
                <div class="bg-[var(--bg-panel)] p-5 rounded-lg border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-bold mb-2 text-[var(--primary-color)] flex items-center space-x-2"><span>${tc.icon}</span> <span>${tc.label}</span></h3>
                        <p class="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">${item.content}</p>
                        ${dateStr}
                    </div>
                    <div class="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-end">
                        <button class="text-xs text-[var(--text-secondary)] border border-[var(--border-color)] px-3 py-1 rounded hover:bg-[var(--border-color)] hover:text-[var(--primary-color)] transition" onclick="window.appRouter.openModal('estrategia', JSON.parse(decodeURIComponent('${enc}')))">
                            ✏️ Editar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    function switchToWeeklyView(baseDate = new Date(), layout = currentLayout) {
        const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = "Visão Semanal";
        hideAllViews();
        viewDashboard.classList.remove('hidden');
        viewWeekly.classList.remove('hidden');
        btnMenuDashboard.classList.add('bg-[var(--border-color)]', 'font-bold');
        
        renderWeeklyGrid(baseDate, layout);
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    function switchToDailyView(date) {
        // Como a visualização diária agora é um modal, apenas abrimos o modal correspondente
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
        openDailyView(date);
    }

    if (btnMenuSettings) btnMenuSettings.addEventListener('click', switchToSettings);
    if (btnMenuDashboard) btnMenuDashboard.addEventListener('click', () => switchToWeeklyView(new Date()));

    // Outros botões - com proteção contra elementos nulos
    try {
        document.querySelectorAll('#btn-theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-theme');
                themeService.setTheme(currentTheme === 'light' ? 'dark' : 'light');
            });
        });
    } catch (e) { console.warn('Theme toggle:', e); }

    ['btn-layout-grid', 'btn-layout-stacked', 'btn-layout-compact-grid', 'btn-layout-compact-stacked'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const layout = id.replace('btn-layout-', '');
            el.addEventListener('click', () => themeService.setLayout(layout));
        }
    });

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) sidebar.classList.add('closed');
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => sidebar.classList.toggle('closed'));
    
    // ==========================================
    // CONFIGURAR LISTENERS DO MODAL CRUD
    // ==========================================
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnsCancelModal = document.querySelectorAll('.btn-cancel-modal');
    const btnNewActivity = document.getElementById('btn-new-activity');

    // Registrar listeners dos botões de fechar o modal
    btnCloseModal.addEventListener('click', () => crudModal.close());
    btnsCancelModal.forEach(btn => btn.addEventListener('click', () => crudModal.close()));

    if (btnNewActivity) {
        btnNewActivity.addEventListener('click', () => crudModal.open('atividade'));
    }

    // Listener para evento de salvamento do CRUDModal
    document.addEventListener('crudSave', async (e) => {
        const { type, formData } = e.detail;

        // Callback específico por tipo após salvar
        if (type === 'atividade') {
            // Se atividade foi criada no contexto de um plano, aplicar transferPeriodo automaticamente
            if (window.atividadePlanoContexto) {
                const activities = await StorageService.get('planner_activities') || [];
                const novaAtividade = activities.find(a => a.id === formData.id);
                if (novaAtividade) {
                    novaAtividade.transferPeriodo = {
                        tipo: window.atividadePlanoContexto.tipo,
                        periodo: window.atividadePlanoContexto.periodo
                    };
                    await StorageService.set('planner_activities', activities);
                }
                window.atividadePlanoContexto = null; // Limpar contexto após usar

                // Re-renderizar o plano para mostrar a nova atividade
                const viewPlanosEl = document.getElementById('view-planos');
                if (viewPlanosEl && !viewPlanosEl.classList.contains('hidden')) {
                    const contentArea = document.getElementById('planos-content-cards');
                    const tipo = window.atividadePlanoContexto?.tipo || currentPlanosTab.replace('anual', 'plano_anual').replace('mensal', 'plano_mensal');
                    const granularidade = currentPlanosTab === 'anual' ? 'ano' : currentPlanosTab === 'mensal' ? 'mes' : 'semana';
                    const label = currentPlanosTab === 'anual' ? 'Plano Anual' : currentPlanosTab === 'mensal' ? 'Plano Mensal' : 'Plano Semanal';
                    const icone = currentPlanosTab === 'anual' ? '📅' : currentPlanosTab === 'mensal' ? '🗓️' : '📋';
                    await renderPlanoVersionado(contentArea, tipo, label, icone, granularidade);
                }
            }

            if (!viewWeekly.classList.contains('hidden')) {
                switchToWeeklyView(new Date(), currentLayout);
            }
            const viewAtividadesEl = document.getElementById('view-atividades');
            if (viewAtividadesEl && !viewAtividadesEl.classList.contains('hidden')) {
                renderAtividadesTable();
            }
        } else if (type === 'atividade-categoria' && currentManagerType === 'atividade-categoria') {
            renderManagerList();
        } else if (type === 'contexto' && currentManagerType === 'contexto') {
            renderManagerList();
        } else if (type === 'estrategia') {
            if (!viewStrategic.classList.contains('hidden')) switchToStrategicView();
            else if (currentManagerType === 'estrategia') renderManagerList();
        } else if (['historico', 'motivacional', 'devocional', 'compras'].includes(type) && currentManagerType === type) {
            renderManagerList();
        } else if (type === 'alarme' && currentManagerType === 'alarme') {
            renderManagerList();
        } else if (type === 'missao') {
            // Processar nova missão: mover atual para histórico
            const strategies = await StorageService.get('planner_strategies') || [];
            const missoes = strategies.filter(s => s.type === 'missao').sort((a, b) => b.timestamp - a.timestamp);

            // Adicionar a missão atual ao histórico e criar a nova
            if (missoes.length > 0) {
                strategies.push(missoes[0]); // Mover atual para histórico
            }

            // Adicionar a nova missão
            strategies.push({
                id: Date.now().toString(),
                type: 'missao',
                content: formData.content,
                timestamp: new Date().getTime()
            });

            // Remover a missão antiga que era atual
            const updatedStrategies = strategies.filter((s, idx) =>
                !(s.type === 'missao' && idx < strategies.length - 2 && s === missoes[0])
            );

            await StorageService.set('planner_strategies',
                updatedStrategies.filter(s => s.type === 'missao' || s.type !== 'missao')
            );

            // Recarregar página de missão se estiver visível
            if (!viewStrategic.classList.contains('hidden') && currentStrategicSection === 'missao') {
                switchToMissaoView();
            }
        } else if (type === 'visao') {
            // Processar nova visão: mover atual para histórico (mesmo padrão da missão)
            const strategies = await StorageService.get('planner_strategies') || [];
            const visoes = strategies.filter(s => s.type === 'visao').sort((a, b) => b.timestamp - a.timestamp);

            // Adicionar a visão atual ao histórico e criar a nova
            if (visoes.length > 0) {
                strategies.push(visoes[0]); // Mover atual para histórico
            }

            // Adicionar a nova visão
            strategies.push({
                id: Date.now().toString(),
                type: 'visao',
                content: formData.content,
                timestamp: new Date().getTime()
            });

            // Remover a visão antiga que era atual
            const updatedStrategies = strategies.filter((s, idx) =>
                !(s.type === 'visao' && idx < strategies.length - 2 && s === visoes[0])
            );

            await StorageService.set('planner_strategies', updatedStrategies);

            // Recarregar página de visão se estiver visível
            if (!viewStrategic.classList.contains('hidden') && currentStrategicSection === 'visao') {
                switchToVisaoView();
            }
        } else if (type === 'objetivos') {
            // Processar novo objetivo: mover atual (do mesmo prazo) para histórico
            const objType = 'obj_' + formData.prazo; // prazo: 'curto' | 'medio' | 'longo'
            const strategies = await StorageService.get('planner_strategies') || [];
            const registros = strategies.filter(s => s.type === objType).sort((a, b) => b.timestamp - a.timestamp);

            // Adicionar o objetivo atual (deste prazo) ao histórico e criar o novo
            if (registros.length > 0) {
                strategies.push(registros[0]); // Mover atual para histórico
            }

            // Adicionar o novo objetivo
            strategies.push({
                id: Date.now().toString(),
                type: objType,
                content: formData.content,
                timestamp: new Date().getTime()
            });

            // Remover o objetivo antigo (deste prazo) que era atual
            const updatedStrategies = strategies.filter((s, idx) =>
                !(s.type === objType && idx < strategies.length - 2 && s === registros[0])
            );

            await StorageService.set('planner_strategies', updatedStrategies);

            // Recarregar página de objetivos se estiver visível
            if (!viewStrategic.classList.contains('hidden') && currentStrategicSection === 'objetivos') {
                switchToObjetivosView();
            }
        } else if (type === 'plano_anual' || type === 'plano_mensal') {
            // Processar novo plano (Anual ou Mensal): mover atual para histórico (mesmo padrão da missão/visão)
            const strategies = await StorageService.get('planner_strategies') || [];
            const registros = strategies.filter(s => s.type === type).sort((a, b) => b.timestamp - a.timestamp);

            if (registros.length > 0) {
                strategies.push(registros[0]); // Mover atual para histórico
            }

            strategies.push({
                id: Date.now().toString(),
                type: type,
                content: formData.content,
                timestamp: new Date().getTime()
            });

            const updatedStrategies = strategies.filter((s, idx) =>
                !(s.type === type && idx < strategies.length - 2 && s === registros[0])
            );

            await StorageService.set('planner_strategies', updatedStrategies);

            // Recarregar página de planos se estiver visível na aba correspondente
            const prazoDoTipo = type === 'plano_anual' ? 'anual' : 'mensal';
            const viewPlanosEl = document.getElementById('view-planos');
            if (viewPlanosEl && !viewPlanosEl.classList.contains('hidden') && currentPlanosTab === prazoDoTipo) {
                switchToPlanosView(prazoDoTipo);
            }
        }
    });

    // ==========================================
    // MODAL GERENCIADOR GERAL (LISTAGENS)
    // ==========================================
    const managerModal = document.getElementById('global-manager-modal');
    const managerTitle = document.getElementById('manager-modal-title');
    const managerList = document.getElementById('manager-modal-list');
    const btnManagerAdd = document.getElementById('btn-manager-add');
    const btnsCloseManager = document.querySelectorAll('.btn-close-manager');
    
    let currentManagerType = '';

    async function openManager(type) {
        currentManagerType = type;
        const titles = {
            'historico': 'Fatos Históricos Cadastrados',
            'motivacional': 'Citações Motivacionais',
            'devocional': 'Passagens Devocionais',
            'compras': 'Itens para Comprar',
            'estrategia': 'Cadastros Estratégicos',
            'habito': 'Hábitos / Questionário Diário',
            'atividade-categoria': 'Categorias de Atividades',
            'alarme': 'Lembretes e Alarmes'
        };
        managerTitle.textContent = titles[type] || 'Gerenciar';
        managerModal.classList.remove('hidden');
        
        await renderManagerList();
    }

    async function renderManagerList() {
        const type = currentManagerType;
        const storageKey = 'planner_' + (type === 'estrategia' ? 'strategies' : type);
        const items = await StorageService.get(storageKey) || [];
        
        managerList.innerHTML = '';
        if (items.length === 0) {
            managerList.innerHTML = `<li class="text-[var(--text-secondary)] italic text-sm p-4 text-center">Nenhum item cadastrado.</li>`;
            return;
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-3 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-sm hover:shadow-md transition";
            
            let titleText = '';
            if (type === 'historico') titleText = `[${item.date}] ${item.fato.substring(0,40)}...`;
            else if (type === 'motivacional') titleText = `"${item.citacao.substring(0,40)}..." - ${item.autor}`;
            else if (type === 'devocional') titleText = `${item.passagem}: ${item.reflexao.substring(0,30)}...`;
            else if (type === 'compras') {
                const cat = item.categoria ? `[${item.categoria}] ` : '';
                titleText = `${cat}${item.item} (${item.detalhes || 'Sem detalhes'})`;
            } else if (type === 'estrategia') {
                const mapType = { 'missao': 'Missão', 'visao': 'Visão', 'obj_curto': 'Curto Prazo', 'obj_medio': 'Médio Prazo', 'obj_longo': 'Longo Prazo' };
                const dt = item.date ? `[${item.date}] ` : '';
                titleText = `${dt}[${mapType[item.type] || item.type}] ${item.content.substring(0,40)}...`;
            } else if (type === 'habito') {
                const cat = item.category ? `[${item.category}] ` : '';
                titleText = `${cat}${item.question}`;
            } else if (type === 'atividade-categoria') {
                titleText = item.nome;
            } else if (type === 'alarme') {
                let recStr = 'Diário';
                if (item.recurrence === 'unico') recStr = `Dia ${item.date}`;
                else if (item.recurrence === 'semanal') {
                    const daysMap = {'0':'Dom','1':'Seg','2':'Ter','3':'Qua','4':'Qui','5':'Sex','6':'Sáb'};
                    recStr = (item.weekdays || []).map(d => daysMap[d]).join(', ');
                }
                titleText = `⏰ ${item.time} (${recStr}) - ${item.title}`;
            }

            li.innerHTML = `
                <span class="text-sm font-semibold truncate flex-1 text-[var(--text-primary)] mr-4">${titleText}</span>
                <div class="flex space-x-2">
                    <button class="text-xs border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition px-2 py-1 rounded btn-edit" title="Editar">✏️ Editar</button>
                    <button class="text-xs border border-red-300 text-red-500 hover:bg-red-50 transition px-2 py-1 rounded btn-delete" title="Excluir">🗑️</button>
                </div>
            `;
            
            li.querySelector('.btn-edit').addEventListener('click', () => {
                managerModal.classList.add('hidden'); // Opcional, ou deixa aberto atrás
                openModal(type, item);
            });
            
            li.querySelector('.btn-delete').addEventListener('click', async () => {
                if(confirm('Tem certeza que deseja excluir?')) {
                    const filtered = items.filter(i => i.id !== item.id);
                    await StorageService.set(storageKey, filtered);
                    renderManagerList(); // Recarrega lista
                }
            });

            managerList.appendChild(li);
        });
    }

    btnsCloseManager.forEach(btn => btn.addEventListener('click', () => managerModal.classList.add('hidden')));

    btnManagerAdd.addEventListener('click', () => {
        managerModal.classList.add('hidden');
        openModal(currentManagerType);
    });

    // ==========================================
    // MODAL DE VISUALIZAÇÃO (READ-ONLY)
    // ==========================================
    const viewModal = document.getElementById('global-view-modal');
    const btnsCloseView = document.querySelectorAll('.btn-close-view');
    
    function openViewModal(data) {
        document.getElementById('view-title').textContent = data.title || 'Sem título';
        document.getElementById('view-status').textContent = (data.status || 'Desconhecido').replace('_', ' ');
        
        let dateStr = 'Sem data definida';
        if (data.date) {
            const parts = data.date.split('-');
            if(parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        document.getElementById('view-date').textContent = dateStr;
        document.getElementById('view-desc').textContent = data.desc || 'Nenhuma descrição fornecida.';
        
        viewModal.classList.remove('hidden');
    }

    btnsCloseView.forEach(btn => btn.addEventListener('click', () => viewModal.classList.add('hidden')));

    // ==========================================
    // MODAL DE RESUMO DO DIA (LAYOUT COMPACTO)
    // ==========================================
    const dayModal = document.getElementById('global-day-modal');
    const btnsCloseDayModal = document.querySelectorAll('.btn-close-day-modal');
    const dayModalContent = document.getElementById('day-modal-content');
    const dayModalTitle = document.getElementById('day-modal-title');
    const btnDayModalNew = document.getElementById('btn-day-modal-new');
    
    let currentDailyDateStr = '';

    async function openDailyView(dateObj, htmlContent) {
        const daysOfWeekFull = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth()+1).toString().padStart(2, '0')}`;
        currentDailyDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        
        const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = `${daysOfWeekFull[dateObj.getDay()]} (${dayStr})`; document.getElementById("daily-view-title").classList.add("hidden");
        
        if (!htmlContent) {
            const activities = await StorageService.get('planner_activities') || [];
            const dayActivities = activities.filter(a => a.date === currentDailyDateStr);
            if (dayActivities.length > 0) {
                htmlContent = dayActivities.map(a => {
                    const enc = encodeURIComponent(JSON.stringify(a));
                    const catBadge = a.category ? `<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] opacity-70 border border-[var(--primary-color)] px-1 rounded-sm">${a.category}</span>` : '';
                    let eisBadge = '';
                    if (a.eisenhower === 'q1') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 border border-red-300 px-1 rounded-sm ml-1" title="Urgente e Importante">🔴 Resolva Urgente</span>`;
                    else if (a.eisenhower === 'q2') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 border border-orange-300 px-1 rounded-sm ml-1" title="Não Urgente e Importante">🟠 Resolva Agora</span>`;
                    else if (a.eisenhower === 'q3') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 border border-yellow-300 px-1 rounded-sm ml-1" title="Urgente e Não Importante">🟡 Delegue a Atividade</span>`;
                    else if (a.eisenhower === 'q4') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 border border-gray-300 px-1 rounded-sm ml-1" title="Não Urgente e Não Importante">⚪ Ignore, se possível</span>`;
                    return `
                    <div draggable="true" data-task-id="${a.id}" data-current-date="${a.date}" class="task-card flex flex-col bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-sm hover:shadow-md transition cursor-move mb-3 relative overflow-hidden group">
                        <!-- Drag Handle Area -->
                        <div class="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center text-[var(--text-secondary)] opacity-30 group-hover:opacity-100 transition-opacity hover:bg-[var(--border-color)] cursor-move border-r border-[var(--border-color)]">
                            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                <circle cx="2" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/>
                                <circle cx="2" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/>
                                <circle cx="2" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/>
                            </svg>
                        </div>
                        
                        <!-- Content Wrapper -->
                        <div class="pl-6 flex flex-col h-full">
                            <!-- Cabeçalho -->
                            <div class="p-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]">
                                <span class="font-bold text-[var(--primary-color)] text-sm truncate pr-2">${a.title}</span>
                                <span class="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider flex-shrink-0">${a.status.replace('_', ' ')}</span>
                            </div>
                            
                            <!-- Área de Conteúdo -->
                            <div class="p-2 flex-1 text-xs text-[var(--text-secondary)]">
                                <div class="flex flex-wrap items-center gap-1 mb-1">${catBadge}${eisBadge}</div>
                                <div class="line-clamp-2 mt-1">${a.desc ? a.desc : '<span class="italic opacity-50">Sem descrição...</span>'}</div>
                            </div>
                            
                            <!-- Rodapé -->
                            <div class="p-1.5 border-t border-[var(--border-color)] flex justify-end space-x-2 bg-[var(--bg-color)]">
                                <button title="Visualizar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openViewModal(JSON.parse(decodeURIComponent('${enc}')))">👁️ Ver</button>
                                <button title="Editar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openModal('atividade', JSON.parse(decodeURIComponent('${enc}')))">✏️ Editar</button>
                                <button title="Transferir" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.transferActivity('${a.id}'); event.stopPropagation();">➡️ Transferir</button>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                htmlContent = `<div class="text-xs text-[var(--text-secondary)] text-center mt-4 italic">Sem tarefas</div>`;
            }
        }
        
        dayModalContent.innerHTML = htmlContent;
        dayModalContent.classList.add('day-dropzone');
        dayModalContent.dataset.date = currentDailyDateStr;
        
        document.getElementById('weekly-view-wrapper').classList.add('hidden');
        document.getElementById('daily-view-wrapper').classList.remove('hidden');
        
        document.querySelectorAll('#dynamic-header-tabs button.tab-btn').forEach(btn => {
            if (btn.dataset.date === 'weekly') {
                btn.classList.remove('bg-[var(--primary-color)]', 'text-white');
                btn.classList.add('text-[var(--primary-color)]', 'hover:bg-[var(--border-color)]');
            } else {
                btn.classList.remove('bg-[var(--primary-color)]', 'text-white', 'border-[var(--primary-color)]');
                btn.classList.add('text-[var(--text-secondary)]', 'border-transparent');
                
                if(btn.dataset.date === currentDailyDateStr) {
                    btn.classList.add('border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'bg-[var(--bg-color)]');
                    btn.classList.remove('text-[var(--text-secondary)]', 'border-transparent');
                }
            }
        });

        // ==== CARREGAMENTO DO DIÁRIO ====
        const journalInput = document.getElementById('daily-journal-input');
        const journalData = await StorageService.get('planner_journal') || {};
        journalInput.value = journalData[currentDailyDateStr] || '';
        document.getElementById('journal-save-status').textContent = '';

        // ==== CARREGAMENTO ASSÍNCRONO DOS WIDGETS ====
        
        // Puxar configurações para decidir o que mostrar
        const settings = await StorageService.get('planner_settings') || {
            habitos: true, historico: true, motivacional: true, devocional: true, compras: true
        };

        if (!window.widgetState) {
            window.widgetState = {
                historico: { list: [], index: 0 },
                motivacional: { list: [], index: 0 },
                devocional: { list: [], index: 0 }
            };

            window.renderWidgetState = function(type) {
                const state = window.widgetState[type];
                const container = document.getElementById(`widget-${type}-content`);
                if (!container) return;
                
                if (!state.list || state.list.length === 0) {
                    container.innerHTML = "<span class='italic opacity-50'>Base de dados vazia ou buscando...</span>";
                    return;
                }
                
                if (state.index >= state.list.length) state.index = 0;
                if (state.index < 0) state.index = state.list.length - 1;
                
                const item = state.list[state.index];
                let contentHtml = '';
                if (type === 'historico') {
                    contentHtml = `<strong>${item.date}:</strong> ${item.fato}`;
                } else if (type === 'motivacional') {
                    contentHtml = `<span class="italic">"${item.citacao}"</span><br><span class="block mt-2 text-right font-semibold">- ${item.autor}</span>`;
                } else if (type === 'devocional') {
                    contentHtml = `<span class="italic">"${item.reflexao}"</span><br><span class="block mt-2 text-right font-semibold">- ${item.passagem}</span>`;
                }
                
                container.innerHTML = `${contentHtml} <div class="text-[10px] mt-3 pt-2 border-t border-[var(--border-color)] text-center opacity-50 font-bold tracking-widest">${state.index + 1} / ${state.list.length}</div>`;
            };

            window.cycleWidget = function(type, direction) {
                if (!window.widgetState[type]) return;
                window.widgetState[type].index += direction;
                window.renderWidgetState(type);
            };
        }

        // 1. Histórico
        const histContainer = document.getElementById('widget-container-historico');
        if (settings.historico) {
            histContainer.style.display = 'flex';
            window.widgetState.historico.list = await window.ContentService.getHistoryList(dateObj);
            window.widgetState.historico.index = window.widgetState.historico.list.length > 0 ? Math.floor(Math.random() * window.widgetState.historico.list.length) : 0;
            window.renderWidgetState('historico');
        } else {
            histContainer.style.display = 'none';
        }

        // 2. Motivacional
        const motContainer = document.getElementById('widget-container-motivacional');
        if (settings.motivacional) {
            motContainer.style.display = 'flex';
            window.widgetState.motivacional.list = await window.ContentService.getMotivacionalList();
            window.widgetState.motivacional.index = window.widgetState.motivacional.list.length > 0 ? Math.floor(Math.random() * window.widgetState.motivacional.list.length) : 0;
            window.renderWidgetState('motivacional');
        } else {
            motContainer.style.display = 'none';
        }

        // 3. Devocional
        const devContainer = document.getElementById('widget-container-devocional');
        if (settings.devocional) {
            devContainer.style.display = 'flex';
            window.widgetState.devocional.list = await window.ContentService.getDevocionalList();
            window.widgetState.devocional.index = window.widgetState.devocional.list.length > 0 ? Math.floor(Math.random() * window.widgetState.devocional.list.length) : 0;
            window.renderWidgetState('devocional');
        } else {
            devContainer.style.display = 'none';
        }

        // 4. Compras
        const compContainer = document.getElementById('widget-container-compras');
        if (settings.compras) {
            compContainer.style.display = 'flex';
            const compWidget = document.getElementById('widget-compras-content');
            compWidget.innerHTML = '<li class="animate-pulse italic opacity-50">Carregando itens...</li>';
            const compData = await window.ContentService.getShoppingList();
            if (compData && compData.length > 0) {
                compWidget.innerHTML = compData.map(c => `
                    <li class="flex justify-between items-center space-x-3 p-1 hover:bg-[var(--bg-color)] rounded border-b border-[var(--border-color)] border-opacity-50 last:border-0">
                        <div class="flex items-center space-x-3">
                            <input type="checkbox" class="rounded w-4 h-4 border-[var(--border-color)]"> 
                            <span class="${c.detalhes ? 'font-semibold' : ''}">${c.item}</span>
                            ${c.categoria ? `<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] opacity-70 border border-[var(--primary-color)] px-1 rounded-sm">${c.categoria}</span>` : ''}
                        </div>
                        ${c.detalhes ? `<span class="text-xs text-[var(--text-secondary)] bg-[var(--bg-panel)] px-2 py-0.5 rounded border border-[var(--border-color)]">${c.detalhes}</span>` : ''}
                    </li>
                `).join('');
                compWidget.innerHTML += `
                    <li class="flex items-center space-x-3 p-1 mt-2 hover:bg-[var(--bg-color)] rounded text-[var(--text-secondary)] italic opacity-80 cursor-pointer" onclick="window.appRouter.openManager('compras')">
                        <span class="text-[var(--primary-color)] font-bold text-lg leading-none">+</span> <span>adicionar item</span>
                    </li>`;
            } else {
                compWidget.innerHTML = `
                    <li class="italic text-[var(--text-secondary)]">Sua lista está vazia.</li>
                    <li class="flex items-center space-x-3 p-1 mt-2 hover:bg-[var(--bg-color)] rounded text-[var(--text-secondary)] cursor-pointer text-sm font-semibold" onclick="window.appRouter.openManager('compras')">
                        <span class="text-[var(--primary-color)] font-bold text-lg leading-none">+</span> <span>adicionar item</span>
                    </li>`;
            }
        } else {
            compContainer.style.display = 'none';
        }

        // 5. Hábitos / Questionário
        const habContainer = document.getElementById('widget-habitos-container');
        if (settings.habitos) {
            const habFormArea = document.getElementById('habitos-form-area');
            const habitSchema = await StorageService.get('planner_habito') || [];
            
            if (habitSchema.length > 0) {
                habContainer.classList.remove('hidden');
                habContainer.style.display = 'block';
                const habitLogs = await StorageService.get('planner_habits_log') || {};
                const todayLog = habitLogs[currentDailyDateStr] || {};
                
                habFormArea.innerHTML = habitSchema.map(h => {
                    const val = todayLog[h.id] !== undefined ? todayLog[h.id] : '';
                    const isFilled = val.trim() !== '';
                    const inputState = isFilled ? 'readonly' : '';
                    const inputHtml = `<input type="text" class="habit-input w-full md:w-48 border border-[var(--border-color)] rounded p-1.5 text-sm bg-[var(--bg-color)] text-[var(--text-primary)]" data-habit-id="${h.id}" value="${val}" ${inputState}>`;
                    
                    const saveBtnHtml = `<button class="btn-habit-save bg-[var(--primary-color)] text-white px-2 py-1.5 rounded text-xs ml-2 hover:opacity-80 transition ${isFilled ? 'hidden' : ''}" data-habit-id="${h.id}">Salvar</button>`;
                    const editBtnHtml = `<button class="btn-habit-edit border border-[var(--border-color)] text-[var(--text-primary)] px-2 py-1.5 rounded text-xs ml-2 hover:bg-[var(--border-color)] transition ${!isFilled ? 'hidden' : ''}" data-habit-id="${h.id}">Editar</button>`;
                    
                    const badgeHtml = h.category ? `<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] opacity-70 border border-[var(--primary-color)] px-1 rounded-sm mr-2">${h.category}</span>` : '';
                    return `
                        <div class="flex flex-col md:flex-row md:justify-between md:items-center py-1 border-b border-[var(--border-color)] border-opacity-30 last:border-0 gap-2">
                            <span class="text-sm font-semibold text-[var(--text-primary)] flex items-center">${badgeHtml}${h.question}</span>
                            <div class="w-full md:w-auto flex items-center justify-end">
                                ${inputHtml}
                                ${saveBtnHtml}
                                ${editBtnHtml}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                habContainer.classList.add('hidden');
                habContainer.style.display = 'none';
            }
        } else {
            habContainer.classList.add('hidden');
            habContainer.style.display = 'none';
        }
    }

    btnsCloseDayModal.forEach(btn => btn.addEventListener('click', () => dayModal.classList.add('hidden')));
    
    btnDayModalNew.addEventListener('click', () => {
        dayModal.classList.add('hidden');
        openModal('atividade');
    });

    // ==== AUTOSAVE DO DIÁRIO ====
    const journalInput = document.getElementById('daily-journal-input');
    const journalStatus = document.getElementById('journal-save-status');
    let journalTimeout;
    
    if (journalInput) {
        journalInput.addEventListener('input', () => {
            if (!currentDailyDateStr) return;
            journalStatus.textContent = 'Salvando...';
            clearTimeout(journalTimeout);
            journalTimeout = setTimeout(async () => {
                const data = await StorageService.get('planner_journal') || {};
                data[currentDailyDateStr] = journalInput.value;
                await StorageService.set('planner_journal', data);
                journalStatus.textContent = 'Salvo';
                setTimeout(() => { if (journalStatus.textContent === 'Salvo') journalStatus.textContent = ''; }, 2000);
            }, 800);
        });
    }

    // ==== AÇÕES DOS HÁBITOS (SALVAR/EDITAR) ====
    const habFormArea = document.getElementById('habitos-form-area');
    const btnSaveAllHabits = document.getElementById('btn-save-all-habits');
    
    if (btnSaveAllHabits) {
        btnSaveAllHabits.addEventListener('click', async () => {
            if (!currentDailyDateStr) return;
            const logs = await StorageService.get('planner_habits_log') || {};
            if (!logs[currentDailyDateStr]) logs[currentDailyDateStr] = {};
            
            const inputs = habFormArea.querySelectorAll('.habit-input');
            inputs.forEach(input => {
                const habitId = input.getAttribute('data-habit-id');
                logs[currentDailyDateStr][habitId] = input.value;
                input.setAttribute('readonly', 'true');
                
                // Toggle botões individuais
                const btnSave = habFormArea.querySelector(`.btn-habit-save[data-habit-id="${habitId}"]`);
                const btnEdit = habFormArea.querySelector(`.btn-habit-edit[data-habit-id="${habitId}"]`);
                if (btnSave) btnSave.classList.add('hidden');
                if (btnEdit) btnEdit.classList.remove('hidden');
            });
            
            await StorageService.set('planner_habits_log', logs);
            
            // Feedback visual
            const statusSpan = document.getElementById('journal-save-status');
            if (statusSpan) {
                statusSpan.textContent = 'Todos os hábitos salvos!';
                setTimeout(() => { if (statusSpan.textContent === 'Todos os hábitos salvos!') statusSpan.textContent = ''; }, 2000);
            }
        });
    }

    if (habFormArea) {
        habFormArea.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-habit-save')) {
                const habitId = e.target.getAttribute('data-habit-id');
                const input = habFormArea.querySelector(`.habit-input[data-habit-id="${habitId}"]`);
                if (!input || !currentDailyDateStr) return;
                
                const val = input.value;
                const logs = await StorageService.get('planner_habits_log') || {};
                if (!logs[currentDailyDateStr]) logs[currentDailyDateStr] = {};
                logs[currentDailyDateStr][habitId] = val;
                
                await StorageService.set('planner_habits_log', logs);
                
                // Trava o input e altera os botões
                input.setAttribute('readonly', 'true');
                e.target.classList.add('hidden');
                const btnEdit = habFormArea.querySelector(`.btn-habit-edit[data-habit-id="${habitId}"]`);
                if (btnEdit) btnEdit.classList.remove('hidden');
                
                // Feedback visual
                const statusSpan = document.getElementById('journal-save-status');
                if (statusSpan) {
                    statusSpan.textContent = 'Hábito salvo!';
                    setTimeout(() => { if (statusSpan.textContent === 'Hábito salvo!') statusSpan.textContent = ''; }, 2000);
                }
            } else if (e.target.classList.contains('btn-habit-edit')) {
                const habitId = e.target.getAttribute('data-habit-id');
                const input = habFormArea.querySelector(`.habit-input[data-habit-id="${habitId}"]`);
                if (!input) return;
                
                // Destrava o input
                input.removeAttribute('readonly');
                input.focus();
                
                // Esconde Editar, mostra Salvar
                e.target.classList.add('hidden');
                const btnSave = habFormArea.querySelector(`.btn-habit-save[data-habit-id="${habitId}"]`);
                if (btnSave) btnSave.classList.remove('hidden');
            }
        });
    }

    // ==========================================
    // EXPORTAÇÃO E RELATÓRIOS
    // ==========================================
    const exportButtons = document.querySelectorAll('.btn-export-csv-module');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const moduleKey = e.currentTarget.getAttribute('data-module');
            if (!moduleKey) return;
            
            let items = [];
            if (moduleKey === 'planner_journal') {
                const journalData = await StorageService.get('planner_journal') || {};
                items = Object.keys(journalData).map(date => ({ date, content: journalData[date] }));
            } else if (moduleKey === 'planner_habits_log') {
                const habitsData = await StorageService.get('planner_habits_log') || {};
                items = Object.keys(habitsData).map(date => ({ date, answers: habitsData[date] }));
            } else {
                items = await StorageService.get(moduleKey) || [];
            }

            if (items.length === 0) {
                alert("Não há dados cadastrados neste módulo para exportar.");
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            
            // Define cabeçalhos baseados no módulo
            if (moduleKey === 'planner_activities') {
                csvContent += "ID,DataAgendamento,Categoria,Prioridade,Titulo,Descricao,Status\n";
                items.forEach(item => {
                    const row = [item.id, item.date || "", `"${(item.category || "").replace(/"/g, '""')}"`, `"${(item.eisenhower || "Nenhuma")}"`, `"${(item.title || "").replace(/"/g, '""')}"`, `"${(item.desc || "").replace(/"/g, '""')}"`, item.status || "livre"];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_strategies') {
                csvContent += "ID,DataDaEscrita,Tipo,Conteudo\n";
                items.forEach(item => {
                    const row = [item.id || "", item.date || "", item.type || "", `"${(item.content || "").replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_historico') {
                csvContent += "ID,Data_Referencia,Fato_Historico\n";
                items.forEach(item => {
                    const row = [item.id || "", item.date || "", `"${(item.fato || "").replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_motivacional') {
                csvContent += "ID,Autor,Citacao\n";
                items.forEach(item => {
                    const row = [item.id || "", `"${(item.autor || "").replace(/"/g, '""')}"`, `"${(item.citacao || "").replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_devocional') {
                csvContent += "ID,Passagem_Tema,Reflexao\n";
                items.forEach(item => {
                    const row = [item.id || "", `"${(item.passagem || "").replace(/"/g, '""')}"`, `"${(item.reflexao || "").replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_compras') {
                csvContent += "ID,Categoria,Item,Detalhes\n";
                items.forEach(item => {
                    const row = [item.id || "", `"${(item.categoria || "").replace(/"/g, '""')}"`, `"${(item.item || "").replace(/"/g, '""')}"`, `"${(item.detalhes || "").replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_journal') {
                csvContent += "Data,Anotacao\n";
                items.forEach(item => {
                    const row = [item.date, `"${(item.content || "").replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
            } else if (moduleKey === 'planner_habits_log') {
                const schema = await StorageService.get('planner_habito') || [];
                const headers = ["Data", ...schema.map(h => `"[${h.category || 'Outros'}] ${h.question.replace(/"/g, '""')}"`)];
                csvContent += headers.join(",") + "\n";
                
                items.forEach(item => {
                    const row = [item.date];
                    schema.forEach(h => {
                        const val = item.answers[h.id] || "";
                        row.push(`"${val.replace(/"/g, '""')}"`);
                    });
                    csvContent += row.join(",") + "\n";
                });
            }
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${moduleKey}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    const btnReportJournal = document.getElementById('btn-report-journal');
    if (btnReportJournal) {
        btnReportJournal.addEventListener('click', async () => {
            const reportArea = document.getElementById('report-content-area');
            const reportBody = document.getElementById('report-content-body');
            document.getElementById('report-content-title').textContent = 'Todas as Anotações';
            
            reportArea.classList.remove('hidden');
            reportBody.innerHTML = '<span class="animate-pulse">Gerando relatório...</span>';
            
            const journalData = await StorageService.get('planner_journal') || {};
            const dates = Object.keys(journalData).sort(); // YYYY-MM-DD
            
            if (dates.length === 0) {
                reportBody.innerHTML = '<p class="text-[var(--text-secondary)] italic">Você ainda não possui anotações salvas.</p>';
                return;
            }
            
            let html = '<div class="space-y-8 max-w-3xl mx-auto font-serif">';
            let hasContent = false;
            
            dates.forEach(date => {
                if (!journalData[date] || journalData[date].trim() === '') return;
                hasContent = true;
                const parts = date.split('-');
                const dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
                html += `
                    <div class="border-b border-[var(--border-color)] border-opacity-50 pb-8 last:border-0" style="page-break-inside: avoid;">
                        <h4 class="font-bold text-xl text-[var(--primary-color)] mb-4">${dateStr}</h4>
                        <p class="whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed text-justify text-lg">${journalData[date]}</p>
                    </div>
                `;
            });
            
            html += '</div>';
            
            if (!hasContent) {
                reportBody.innerHTML = '<p class="text-[var(--text-secondary)] italic">Você ainda não possui anotações salvas.</p>';
            } else {
                reportBody.innerHTML = html;
            }
        });
    }

    // ==========================================
    // CONFIGURAÇÕES DA VISÃO DIÁRIA
    // ==========================================
    const settingsCheckboxes = ['habitos', 'historico', 'motivacional', 'devocional', 'compras'];
    
    // Carregar
    StorageService.get('planner_settings').then(settings => {
        if (!settings) {
            settings = { habitos: true, historico: true, motivacional: true, devocional: true, compras: true };
            StorageService.set('planner_settings', settings);
            }
            settingsCheckboxes.forEach(key => {
            const cb = document.getElementById('setting-widget-' + key);
            if (cb) {
                cb.checked = settings[key] !== false;

                // Salvar ao alterar
                cb.addEventListener('change', async () => {
                    const currentSettings = await StorageService.get('planner_settings') || {};
                    currentSettings[key] = cb.checked;
                    await StorageService.set('planner_settings', currentSettings);
                });
            }
            });
    });

    // ==========================================
    // EXPORTAÇÃO DAS FUNÇÕES GLOBAIS DE ROTA
    // ==========================================
    // ==========================================
    // FUNÇÕES DE TRANSFERÊNCIA DE ATIVIDADES
    // ==========================================
    const transferModal = document.getElementById('global-transfer-modal');
    let currentActivityToTransfer = null;

    function openTransferModal(activity) {
        currentActivityToTransfer = activity;
        document.getElementById('transfer-destino').value = '';
        document.getElementById('transfer-options').innerHTML = '';
        transferModal.classList.remove('hidden');
    }

    document.getElementById('transfer-destino').addEventListener('change', updateTransferOptions);

    async function updateTransferOptions(e) {
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

    document.getElementById('btn-transfer-confirm').addEventListener('click', async () => {
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

            console.log('✓ Atividade transferida com sucesso!');
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
    });

    document.getElementById('btn-transfer-cancel').addEventListener('click', () => {
        transferModal.classList.add('hidden');
        currentActivityToTransfer = null;
    });

    document.querySelector('.btn-close-transfer').addEventListener('click', () => {
        transferModal.classList.add('hidden');
        currentActivityToTransfer = null;
    });

    window.appRouter = {
        goWeekly: switchToWeeklyView,
        goDaily: switchToDailyView,
        openModal: (type, data = null) => crudModal.open(type, data),
        openViewModal: openViewModal,
        openDailyView: openDailyView,
        openManager: openManager,
        switchToPlanosView: (prazo) => switchToPlanosView(prazo),
        transferActivity: (id) => {
            const activities = StorageService.get('planner_activities').then(acts => {
                const activity = acts?.find(a => a.id === id);
                if (activity) openTransferModal(activity);
            });
        },
        initDragAndDrop: () => {
            document.querySelectorAll('.task-card').forEach(card => {
                // Remove old listeners to avoid duplicates
                card.removeEventListener('dragstart', window.appRouter._handleDragStart);
                card.addEventListener('dragstart', window.appRouter._handleDragStart);
            });

            document.querySelectorAll('.day-dropzone').forEach(zone => {
                zone.removeEventListener('dragover', window.appRouter._handleDragOver);
                zone.removeEventListener('drop', window.appRouter._handleDrop);
                zone.removeEventListener('dragenter', window.appRouter._handleDragEnter);
                zone.removeEventListener('dragleave', window.appRouter._handleDragLeave);

                zone.addEventListener('dragover', window.appRouter._handleDragOver);
                zone.addEventListener('drop', window.appRouter._handleDrop);
                zone.addEventListener('dragenter', window.appRouter._handleDragEnter);
                zone.addEventListener('dragleave', window.appRouter._handleDragLeave);
            });
        },
    _handleDragStart: (e) => {
        const card = e.target.closest('.task-card');
        if(!card) return;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            id: card.dataset.taskId,
            sourceDate: card.dataset.currentDate
        }));
        card.style.opacity = '0.5';
        
        // Listen for dragend to restore opacity
        card.addEventListener('dragend', () => { card.style.opacity = '1'; }, {once: true});
    },
    _handleDragOver: (e) => {
        e.preventDefault(); // Necessary to allow dropping
    },
    _handleDragEnter: (e) => {
        e.preventDefault();
        const dropzone = e.target.closest('.day-dropzone');
        if(dropzone) {
            dropzone.classList.add('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
        }
    },
    _handleDragLeave: (e) => {
        const dropzone = e.target.closest('.day-dropzone');
        if(dropzone) {
            dropzone.classList.remove('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
        }
    },
    _handleDrop: async (e) => {
        e.preventDefault();
        const dropzone = e.target.closest('.day-dropzone');
        if(dropzone) {
            dropzone.classList.remove('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
            
            const targetDate = dropzone.dataset.date;
            if(!targetDate) return;
            
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (data.sourceDate === targetDate) return; // Same day, do nothing
                if (targetDate === 'weekly') {
                    console.log("ℹ️ Transferência para a Semana (Foco) em desenvolvimento!");
                    return;
                }
                
                const acts = await StorageService.get('planner_activities') || [];
                const idx = acts.findIndex(a => a.id === data.id);
                if(idx !== -1) {
                    acts[idx].date = targetDate;
                    await StorageService.set('planner_activities', acts);
                    console.log('✓ Atividade movida!');
                    
                    // Trigger re-render
                    document.dispatchEvent(new CustomEvent('layoutChange', { detail: window.currentLayout || 'grid' }));
                }
            } catch(err) {
                console.error("Drop error", err);
            }
        }
    },



    share: (data) => {
        const text = data.title + '\n' + (data.desc || '');
        navigator.clipboard.writeText(text);
        console.log('✓ Copiado para a área de transferência!');
    },

    };

    window.seedDemo = {
        estrategicos: seedDemoEstrategicos,
        atividades: seedDemoAtividades
    };

    // Inicializa
    switchToWeeklyView(new Date(), currentLayout);
    renderSidebarTimeline(new Date().getFullYear());
});

// Lógica de Datas
function getWeekNumber(targetDate) {
    const date = new Date(targetDate.valueOf());
    const jan1 = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - jan1) / 86400000;
    const jan1Day = jan1.getDay();
    return Math.ceil((pastDaysOfYear + jan1Day + 1) / 7);
}

function getWeekDates(date = new Date()) {
    const dayOfWeek = date.getDay(); // 0 é Domingo
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    const dates = [];
    for(let i = 0; i < 7; i++) {
        const current = new Date(sunday);
        current.setDate(sunday.getDate() + i);
        dates.push(current);
    }
    return dates;
}

// ==========================================
// RENDERIZAÇÃO SEMANAL E DIÁRIA
// ==========================================

function renderDailyView(date) {
    const daysOfWeekFull = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const monthsNamesFull = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Atualiza o Cabeçalho Global (Header)
    document.getElementById('current-week-display').textContent = `Agenda Diária`;
    
    // Atualiza o Título Interno da Agenda
    const titleStr = `${date.getDate()} de ${monthsNamesFull[date.getMonth()]} de ${date.getFullYear()}, ${daysOfWeekFull[date.getDay()]}`;
    document.getElementById('daily-view-title').textContent = titleStr;
}

async function renderWeeklyGrid(baseDate, layoutType) {
    const container = document.getElementById('view-dashboard');
    const grid = document.getElementById('weekly-grid');
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    // Buscar itens salvos no banco
    const activities = await StorageService.get('planner_activities') || [];
    
    const dates = getWeekDates(baseDate);
    grid.innerHTML = '';
    const weekNum = getWeekNumber(dates[0]);
        
        // Renderizar tabs no cabeçalho principal (header-week-tabs)
        const headerTabsContainer = document.getElementById('header-week-tabs');
        if (headerTabsContainer) {
            const weekText = `w${String(weekNum).padStart(2, '0')}`;
            let tabsHTML = `<button data-date="weekly" class="tab-btn flex items-center justify-center px-4 py-2 rounded text-xs font-semibold transition border border-transparent bg-[var(--primary-color)] text-white hover:opacity-90" title="Visão Semanal">
                                ${weekText}
                            </button>
                            <div class="w-px h-6 bg-[var(--border-color)] mx-3 flex-shrink-0"></div>`;

            dates.forEach(date => {
                const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const displayDay = String(date.getDate()).padStart(2, '0');
                const displayMonth = String(date.getMonth() + 1).padStart(2, '0');

                tabsHTML += `<button data-date="${dateStr}" class="tab-btn flex flex-col items-center justify-center px-3 py-2 rounded text-xs font-medium transition border border-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--primary-color)] day-dropzone tab-dropzone flex-shrink-0">
                                <span class="font-bold">${dayName}</span>
                                <span class="text-[10px] opacity-70">${displayDay}/${displayMonth}</span>
                            </button>`;
            });

            headerTabsContainer.innerHTML = tabsHTML;

            // Adicionar listeners aos botões de semana no header
            headerTabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.target.closest('button');
                    if (!targetBtn) return;
                    if (targetBtn.dataset.date === 'weekly') {
                        window.appRouter.switchToPlanosView('semanal');
                    } else {
                        const [y, m, d] = targetBtn.dataset.date.split('-');
                        window.appRouter.goDaily(new Date(y, m-1, d));
                    }
                });
            });
        }

        // Manter dynamic-header-tabs vazio (compatibilidade com listeners antigos)
        const tabsContainer = document.getElementById('dynamic-header-tabs');
        if (tabsContainer) {
            tabsContainer.innerHTML = '';
        }

    
    const firstDay = `${String(dates[0].getDate()).padStart(2, '0')}/${String(dates[0].getMonth() + 1).padStart(2, '0')}`;
    const lastDay = `${String(dates[6].getDate()).padStart(2, '0')}/${String(dates[6].getMonth() + 1).padStart(2, '0')}`;
    const currentYear = dates[0].getFullYear();
    document.getElementById('current-week-display').textContent = `w${String(weekNum).padStart(2, '0')} (${firstDay} a ${lastDay}) - ${currentYear}`;
    
    if (layoutType === 'grid') {
        container.classList.remove('max-w-4xl', 'mx-auto');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 h-full mt-4';
    } else if (layoutType === 'compact-grid') {
        container.classList.remove('max-w-4xl', 'mx-auto');
        grid.className = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 h-full mt-4';
    } else {
        container.classList.add('max-w-4xl', 'mx-auto');
        grid.className = 'flex flex-col space-y-4 mt-4';
    }
    
    dates.forEach((date, index) => {
        const dayName = daysOfWeek[index];
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const displayDate = `${dd}/${mm}`;
        
        // Formato salvo no input date é YYYY-MM-DD
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayActivities = activities.filter(a => a.date === dateStr);
        let activitiesHTML = '';
        
        if (dayActivities.length > 0) {
            activitiesHTML = dayActivities.map(a => {
                const enc = encodeURIComponent(JSON.stringify(a));
                const catBadge = a.category ? `<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] opacity-70 border border-[var(--primary-color)] px-1 rounded-sm">${a.category}</span>` : '';
                
                let eisBadge = '';
                if (a.eisenhower === 'q1') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 border border-red-300 px-1 rounded-sm ml-1" title="Urgente e Importante">🔴 Resolva Urgente</span>`;
                else if (a.eisenhower === 'q2') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 border border-orange-300 px-1 rounded-sm ml-1" title="Não Urgente e Importante">🟠 Resolva Agora</span>`;
                else if (a.eisenhower === 'q3') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-yellow-700 bg-yellow-100 border border-yellow-300 px-1 rounded-sm ml-1" title="Urgente e Não Importante">🟡 Delegue a Atividade</span>`;
                else if (a.eisenhower === 'q4') eisBadge = `<span class="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 border border-gray-300 px-1 rounded-sm ml-1" title="Não Urgente e Não Importante">⚪ Ignore, se possível</span>`;

                return `
                <div draggable="true" data-task-id="${a.id}" data-current-date="${a.date}" class="task-card flex flex-col bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-sm hover:shadow-md transition cursor-move mb-3 relative overflow-hidden group">
                        <!-- Drag Handle Area -->
                        <div class="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center text-[var(--text-secondary)] opacity-30 group-hover:opacity-100 transition-opacity hover:bg-[var(--border-color)] cursor-move border-r border-[var(--border-color)]">
                            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                <circle cx="2" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/>
                                <circle cx="2" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/>
                                <circle cx="2" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/>
                            </svg>
                        </div>
                        
                        <!-- Content Wrapper -->
                        <div class="pl-6 flex flex-col h-full">
                            <!-- Cabeçalho -->
                            <div class="p-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]">
                                <span class="font-bold text-[var(--primary-color)] text-sm truncate pr-2">${a.title}</span>
                                <span class="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider flex-shrink-0">${a.status.replace('_', ' ')}</span>
                            </div>
                            
                            <!-- Área de Conteúdo -->
                            <div class="p-2 flex-1 text-xs text-[var(--text-secondary)]">
                                <div class="flex flex-wrap items-center gap-1 mb-1">${catBadge}${eisBadge}</div>
                                <div class="line-clamp-2 mt-1">${a.desc ? a.desc : '<span class="italic opacity-50">Sem descrição...</span>'}</div>
                            </div>
                            
                            <!-- Rodapé -->
                            <div class="p-1.5 border-t border-[var(--border-color)] flex justify-end space-x-2 bg-[var(--bg-color)]">
                                <button title="Visualizar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openViewModal(JSON.parse(decodeURIComponent('${enc}')))">👁️ Ver</button>
                                <button title="Editar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openModal('atividade', JSON.parse(decodeURIComponent('${enc}')))">✏️ Editar</button>
                                <button title="Transferir" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.transferActivity('${a.id}'); event.stopPropagation();">➡️ Transferir</button>
                            </div>
                        </div>
                    </div>`;
            });
        } else {
            activitiesHTML = '<div class="text-xs text-[var(--text-secondary)] text-center mt-4 italic">Sem tarefas</div>';
        }
        
        // Destaque visual
        const isToday = new Date().toDateString() === date.toDateString();
        const borderClass = isToday ? 'border-[var(--primary-color)] border-2' : 'border-[var(--border-color)]';
        window.appRouter.initDragAndDrop();
        
        if (layoutType === 'grid') {
            const row = document.createElement('div');
            row.className = `bg-[var(--bg-panel)] border ${borderClass} rounded-lg flex flex-col shadow-sm min-h-[300px] overflow-hidden transition-colors`;
            row.innerHTML = `
                <div class="p-3 border-b border-[var(--border-color)] bg-[var(--bg-color)] flex justify-between items-center cursor-pointer hover:text-[var(--primary-color)] transition" title="Abrir Agenda">
                    <span class="font-bold truncate">${dayName}</span>
                    <span class="text-xs text-[var(--text-secondary)] bg-[var(--border-color)] px-2 py-1 rounded-full">${displayDate}</span>
                </div>
                <div class="p-3 flex-1 overflow-auto space-y-2 day-dropzone" data-date="${dateStr}">
                    ${activitiesHTML}
                </div>
                <button class="w-full p-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition border-t border-[var(--border-color)] text-left" onclick="window.appRouter.openModal('atividade')">
                    + Nova Atividade
                </button>
            `;
            // Clicar no título do dia também abre a visão diária
            row.querySelector('.cursor-pointer').addEventListener('click', () => window.appRouter.goDaily(date));
            grid.appendChild(row);
        } else if (layoutType === 'compact-grid') {
            const row = document.createElement('div');
            const count = dayActivities.length;
            const countLabel = count === 1 ? '1 Tarefa' : `${count} Tarefas`;
            const countClass = count > 0 ? 'bg-[var(--primary-color)] text-white' : 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)]';
            
            row.className = `bg-[var(--bg-panel)] border ${borderClass} rounded-lg flex flex-col justify-center items-center shadow-sm min-h-[120px] cursor-pointer hover:border-[var(--primary-color)] transition-colors p-4 text-center`;
            
            row.innerHTML = `
                <span class="font-bold text-lg mb-1 text-[var(--primary-color)]">${dayName.split('-')[0]}</span>
                <span class="text-xs text-[var(--text-secondary)] mb-3">${displayDate}</span>
                <span class="text-xs px-3 py-1 rounded-full ${countClass} font-semibold inline-block">${countLabel}</span>
            `;
            
            row.addEventListener('click', () => {
                window.appRouter.openDailyView(date, activitiesHTML);
            });
            grid.appendChild(row);
        } else if (layoutType === 'compact-stacked') {
            const row = document.createElement('div');
            const count = dayActivities.length;
            const countLabel = count === 1 ? '1 Tarefa' : `${count} Tarefas`;
            const countClass = count > 0 ? 'bg-[var(--primary-color)] text-white' : 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)]';
            
            row.className = `bg-[var(--bg-panel)] border ${borderClass} rounded-lg flex justify-between items-center shadow-sm cursor-pointer hover:border-[var(--primary-color)] transition-colors p-4 relative`;
            
            row.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="font-bold text-lg text-[var(--primary-color)]">${dayName}</span>
                    <span class="text-sm text-[var(--text-secondary)]">${displayDate}</span>
                </div>
                <span class="text-xs px-4 py-2 rounded-full ${countClass} font-semibold inline-block">${countLabel}</span>
            `;
            
            row.addEventListener('click', () => {
                window.appRouter.openDailyView(date, activitiesHTML);
            });
            grid.appendChild(row);
        } else {
            const details = document.createElement('details');
            details.className = `bg-[var(--bg-panel)] border ${borderClass} rounded-lg shadow-sm group transition-colors`;
            if (isToday) details.setAttribute('open', '');
            
            details.innerHTML = `
                <summary class="p-4 bg-[var(--bg-color)] flex justify-between items-center cursor-pointer hover:bg-[var(--bg-panel)] transition list-none outline-none">
                    <div class="flex items-center space-x-3">
                        <span class="cursor-pointer day-title-open">
                            <span class="transform group-open:rotate-90 transition-transform text-[var(--text-secondary)] text-xs">▶</span>
                            <span class="font-bold text-lg ${isToday ? 'text-[var(--primary-color)]' : ''}">${dayName}</span>
                        </span>
                        <span class="text-sm text-[var(--text-secondary)] bg-[var(--border-color)] px-2 py-1 rounded-full hover:bg-[var(--primary-color)] hover:text-white transition" title="Abrir Visão Diária em Modal">${displayDate}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button class="text-xs text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition" title="Gerar Relatório A4 do Dia" onclick="event.preventDefault()">🖨️</button>
                        <button class="text-sm text-[var(--primary-color)] hover:underline" onclick="event.preventDefault(); window.appRouter.openModal('atividade')">+ Nova Atividade</button>
                        <div class="text-xs border border-[var(--border-color)] px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition" title="Expandir/Recolher Lista de Atividades" onclick="event.preventDefault(); this.closest('details').open = !this.closest('details').open;">
                            ↕️ Expandir
                        </div>
                    </div>
                </summary>
                <div class="p-4 border-t border-[var(--border-color)] min-h-[80px] flex flex-col justify-center mt-1 day-dropzone" data-date="${dateStr}">
                    ${activitiesHTML}
                </div>
            `;
            // Clicar na badge de data abre a visão diária
            details.querySelector('.rounded-full').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.appRouter.goDaily(date);
            });
            // Clicar no nome do dia (caret + título) também abre a visão diária
            const dayTitle = details.querySelector('.day-title-open');
            if (dayTitle) {
                dayTitle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.appRouter.goDaily(date);
                });
            }
            grid.appendChild(details);
        }
    });
}

// ==========================================
// GERADOR DA LINHA DO TEMPO (SIDEBAR)
// ==========================================
function renderSidebarTimeline(year) {
    const navContainer = document.getElementById('sidebar-timeline');
    if (!navContainer) return;
    
    const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const daysNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const data = {};
    let d = new Date(year, 0, 1);
    while (d.getDay() !== 0) d.setDate(d.getDate() - 1); 
    let endDate = new Date(year, 11, 31);
    while (endDate.getDay() !== 6) endDate.setDate(endDate.getDate() + 1);
    
    let current = new Date(d);
    while (current <= endDate) {
        const thurs = new Date(current);
        thurs.setDate(thurs.getDate() + 4 - thurs.getDay());
        const targetMonth = thurs.getMonth();
        const targetYear = thurs.getFullYear();
        
        if (targetYear === year) {
            if (!data[targetMonth]) data[targetMonth] = {};
            const w = getWeekNumber(current);
            if (!data[targetMonth][w]) data[targetMonth][w] = [];
            data[targetMonth][w].push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }

    navContainer.innerHTML = '';
    
    const yearDetails = document.createElement('details');
    yearDetails.className = 'group mb-1';
    yearDetails.open = true;
    yearDetails.innerHTML = `
        <summary class="flex items-center cursor-pointer py-1.5 px-2 hover:bg-[var(--border-color)] rounded transition list-none font-bold text-[var(--text-primary)] select-none outline-none">
            <span class="transform group-open:rotate-90 transition-transform text-[10px] mr-2 text-[var(--text-secondary)]">▶</span>
            ${year}
        </summary>
        <div class="pl-2 mt-1 ml-2 space-y-1" id="timeline-months"></div>
    `;
    navContainer.appendChild(yearDetails);
    
    const monthsContainer = yearDetails.querySelector('#timeline-months');
    const currentMonth = new Date().getMonth();
    const currentWeekNum = getWeekNumber(new Date());
    
    Object.keys(data).forEach(m => {
        const monthData = data[m];
        const monthDetails = document.createElement('details');
        monthDetails.className = 'group border-l border-[var(--border-color)]';
        if (parseInt(m) === currentMonth) monthDetails.open = true;
        
        monthDetails.innerHTML = `
            <summary class="flex items-center cursor-pointer py-1 px-2 hover:bg-[var(--border-color)] rounded transition list-none text-[var(--text-primary)] select-none outline-none">
                <span class="transform group-open:rotate-90 transition-transform text-[10px] mr-2 text-[var(--text-secondary)]">▶</span>
                ${monthsNames[m]}
            </summary>
            <div class="pl-2 mt-1 ml-1 space-y-1" id="timeline-weeks-${m}"></div>
        `;
        monthsContainer.appendChild(monthDetails);
        
        const weeksContainer = monthDetails.querySelector(`#timeline-weeks-${m}`);
        
        Object.keys(monthData).forEach(w => {
            const weekDays = monthData[w];
            const weekDetails = document.createElement('details');
            weekDetails.className = 'group border-l border-[var(--border-color)]';
            if (parseInt(w) === currentWeekNum && parseInt(m) === currentMonth) weekDetails.open = true;
            
            const first = weekDays[0];
            const last = weekDays[weekDays.length - 1];
            const range = `${String(first.getDate()).padStart(2,'0')}/${String(first.getMonth()+1).padStart(2,'0')} a ${String(last.getDate()).padStart(2,'0')}/${String(last.getMonth()+1).padStart(2,'0')}`;
            
            // Renderiza o título da Semana
            const summaryWeek = document.createElement('summary');
            summaryWeek.className = "flex items-center cursor-pointer py-1 px-2 hover:bg-[var(--border-color)] rounded transition list-none text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none outline-none";
            summaryWeek.innerHTML = `
                <span class="transform group-open:rotate-90 transition-transform text-[8px] mr-2">▶</span>
                w${String(w).padStart(2,'0')} (${range})
            `;
            // Clicar no título da Semana direciona para aquela semana no Planner
            summaryWeek.addEventListener('click', (e) => {
                // Previne o comportamento padrão de abrir/fechar se clicar bem no texto? Nao, deixa abrir/fechar, mas também navega
                window.appRouter.goWeekly(first);
            });
            weekDetails.appendChild(summaryWeek);
            
            // Renderiza os Dias da Semana
            const daysContainer = document.createElement('div');
            daysContainer.className = "pl-3 mt-1 ml-1 space-y-1 pb-1";
            
            weekDays.forEach(day => {
                const dayLink = document.createElement('a');
                dayLink.href = "#";
                const dateStrForDrop = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
                dayLink.className = "block py-0.5 px-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--primary-color)] rounded transition day-dropzone sidebar-dropzone";
                dayLink.dataset.date = dateStrForDrop;
                dayLink.title = day.toISOString().split('T')[0];
                dayLink.textContent = `${String(day.getDate()).padStart(2,'0')} - ${daysNames[day.getDay()]}`;
                
                // Clicar num dia específico abre a Agenda Diária
                dayLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.appRouter.goDaily(day);
                });
                
                daysContainer.appendChild(dayLink);
            });
            
            weekDetails.appendChild(daysContainer);
            weeksContainer.appendChild(weekDetails);
        });
    });
}
