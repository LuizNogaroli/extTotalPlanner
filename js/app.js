// Ponto de entrada (Bootstrap) do aplicativo

// Importar módulos de CRUD
import { CRUDModal } from './modules/crudModal.js';
import { ListaCompras, carregarDados as carregarCompras, alternarComprado, esc as escCompras, formatCurrency } from './modules/listaCompras.js';
import { Pomodoro } from './modules/pomodoro.js';
import {
    getWeekNumber, getWeekDates, getPeriodoKey, getPeriodoLabel, getDataDaSemana,
    getPeriodoPaiKeys, getSemanasDoMes, semanaLabelCompacto, semanaLabelSemAno
} from './modules/dateUtils.js';
import { initCitacao, renderCitacaoWidget } from './modules/citacao.js';
import { initManagerModal, openManager } from './modules/managerModal.js';
import { initTransferModal, openTransferModal } from './modules/transferModal.js';
import { initStrategicViews, switchToMissaoView, switchToVisaoView, switchToValoresView, switchToObjetivosView } from './modules/views/strategic.js';
import { initPlanosViews, switchToPlanosView, switchToAtividadesView, renderAtividadesTable } from './modules/views/planos.js';

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

    // 4. Iniciar motor de verificação de Alarmes (Notification API padrão — ver docs/MANUAL_TECNICO.md §3.18/3.19)
    window.NotificationService.start();

    // 5. Recursos: Lista de Compras e Pomodoro (módulos próprios; o Pomodoro roda em segundo plano)
    const listaCompras = new ListaCompras({ StorageService, hideAllViews, onChange: () => renderWidgetCompras() });
    const pomodoro = new Pomodoro({ hideAllViews });
    pomodoro.iniciarMotor();

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
    let btnVoltarValoresListenersAttached = false;
    let currentStrategicSection = null; // 'missao' | 'visao' | 'objetivos' | 'valores'
    let currentPlanosTab = 'anual'; // 'anual' | 'mensal' | 'semanal'
    let planosPeriodoSelecionado = {}; // { plano_anual: '2026', plano_mensal: '2026-09' } período em exibição por tipo

    document.getElementById('menu-missao').addEventListener('click', switchToMissaoView);
    document.getElementById('menu-visao').addEventListener('click', switchToVisaoView);
    document.getElementById('menu-objetivos').addEventListener('click', switchToObjetivosView);
    document.getElementById('menu-valores').addEventListener('click', switchToValoresView);
    document.getElementById('menu-pomodoro').addEventListener('click', () => pomodoro.abrir());
    document.getElementById('menu-compras').addEventListener('click', () => listaCompras.abrir());
    document.getElementById('menu-plano-anual').addEventListener('click', () => switchToPlanosView('anual'));
    document.getElementById('menu-plano-mensal').addEventListener('click', () => switchToPlanosView('mensal'));
    document.getElementById('menu-plano-semanal').addEventListener('click', () => switchToPlanosView('semanal'));
    document.getElementById('menu-atividades').addEventListener('click', () => switchToAtividadesView());

    // Views Estratégicas (Missão, Visão, Valores, Objetivos) extraídas para js/modules/views/strategic.js
    // na Fase 5 da refatoração. Menu listeners registrados em initStrategicViews().
    initStrategicViews({
        crudModal,
        hideAllViews,
        viewStrategic,
        headerTitle
    });

    // Views de Planos (Anual/Mensal/Semanal) e Atividades extraídas para js/modules/views/planos.js
    // na Fase 6 da refatoração. Menu listeners registrados em initPlanosViews().
    initPlanosViews({
        crudModal,
        hideAllViews,
        headerTitle,
        getPeriodoKey,
        getPeriodoLabel,
        getDataDaSemana,
        getWeekDates,
        getWeekNumber,
        renderPeriodoBreadcrumb,
        renderDiasNoSubheader,
        openViewModal,
        openTransferModal,
        switchToMissaoView,
        switchToVisaoView,
        switchToObjetivosView,
        currentStrategicSection
    });


    function hideAllViews() {
        const viewIds = ['view-dashboard', 'view-settings', 'view-reports', 'view-strategic', 'view-export', 'view-missao-educacional', 'view-visao-educacional', 'view-objetivos-educacional', 'view-valores-educacional', 'view-planos', 'view-atividades', 'view-compras', 'view-pomodoro', 'weekly-view-wrapper', 'daily-view-wrapper'];
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

        // Breadcrumb de período (cabeçalho principal) e dias da semana (sub-header) só
        // existem no Dashboard e nos Planos — a view que precisa deles os repopula
        // logo depois de chamar hideAllViews().
        const headerPeriodoBtn = document.getElementById('header-periodo-buttons');
        if (headerPeriodoBtn) headerPeriodoBtn.innerHTML = '';
        const dynamicHeaderTabs = document.getElementById('dynamic-header-tabs');
        if (dynamicHeaderTabs) dynamicHeaderTabs.innerHTML = '';
        const dropdownRoot = document.getElementById('periodo-dropdown-root');
        if (dropdownRoot) dropdownRoot.innerHTML = '';
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
        // A Visão Diária não é uma view própria: é o #daily-view-wrapper, que fica DENTRO
        // de #view-dashboard, ao lado do #weekly-view-wrapper (ver docs/sub-header.md §8
        // nº1). Se o clique veio de outra tela que também popula dias no sub-header (ex.:
        // Plano Semanal, via renderPlanoVersionado), #view-dashboard está escondida e o dia
        // carregaria invisível atrás dela. Nesse caso, trocamos para o Dashboard antes.
        // Vindo do próprio Dashboard, nada disso roda — mantém breadcrumb/menu como estavam.
        if (viewDashboard.classList.contains('hidden')) {
            hideAllViews();
            viewDashboard.classList.remove('hidden');
            btnMenuDashboard.classList.add('bg-[var(--border-color)]', 'font-bold');
            renderDiasNoSubheader(getWeekDates(date));
        }
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

    // Permissão de Notificações (3 estados): o mesmo estado aparece em Configurações e no
    // gerenciador de Alarmes, que é onde o usuário lida com o recurso.
    const btnNotificationsPermission = document.getElementById('btn-notifications-permission');
    const btnAlarmePermissao = document.getElementById('btn-alarme-permissao');
    const btnAlarmeTestar = document.getElementById('btn-alarme-testar');
    const ajudaNotificacoes = document.getElementById('manager-notificacoes-ajuda');
    const AJUDA_NOTIFICACOES = {
        default: 'Ative as notificações para os alarmes aparecerem no horário programado.',
        granted: 'Os alarmes avisam no horário enquanto houver uma aba do Total Planner aberta. Com a aba em segundo plano ou o PC suspenso, o aviso sai com até 10 min de atraso. O som toca se você tiver clicado nesta aba antes.',
        denied: 'O navegador está bloqueando as notificações: clique no ícone à esquerda da barra de endereço → Notificações → Permitir, e recarregue a página.',
        unsupported: 'Este navegador não suporta notificações.'
    };

    // O build local do Tailwind não tem "disabled:opacity-50" (MANUAL_TECNICO §3.21)
    function setBotaoDesabilitado(btn, disabled) {
        btn.disabled = disabled;
        btn.classList.toggle('opacity-50', disabled);
        btn.classList.toggle('cursor-not-allowed', disabled);
    }

    function renderNotificacoesUI() {
        const status = window.NotificationService.getPermission();
        const info = window.NotificationService.describePermission(status);
        [btnNotificationsPermission, btnAlarmePermissao].forEach(btn => {
            if (!btn) return;
            btn.textContent = info.label;
            btn.title = info.title;
            setBotaoDesabilitado(btn, info.disabled);
        });
        if (btnAlarmeTestar) setBotaoDesabilitado(btnAlarmeTestar, status !== 'granted');
        if (ajudaNotificacoes) ajudaNotificacoes.textContent = AJUDA_NOTIFICACOES[status] || '';
    }

    async function pedirPermissaoNotificacoes() {
        await window.NotificationService.requestPermission();
        renderNotificacoesUI();
        window.NotificationService.checkAlarms();
    }

    renderNotificacoesUI();
    [btnNotificationsPermission, btnAlarmePermissao].forEach(btn => {
        if (btn) btn.addEventListener('click', pedirPermissaoNotificacoes);
    });
    if (btnAlarmeTestar) {
        btnAlarmeTestar.addEventListener('click', () => {
            if (!window.NotificationService.test()) renderNotificacoesUI();
        });
    }

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) sidebar.classList.add('closed');
    document.getElementById('btn-toggle-sidebar').addEventListener('click', () => sidebar.classList.toggle('closed'));
    
    // ==========================================
    // CONFIGURAR LISTENERS DO MODAL CRUD
    // ==========================================
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnsCancelModal = document.querySelectorAll('.btn-cancel-modal');

    // Registrar listeners dos botões de fechar o modal
    btnCloseModal.addEventListener('click', () => crudModal.close());
    btnsCancelModal.forEach(btn => btn.addEventListener('click', () => crudModal.close()));

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
        } else if (type === 'alarme') {
            // Horários que já passaram não devem disparar agora só por causa da tolerância de atraso
            window.NotificationService.markHandled(formData);
            // Salvar um alarme é um gesto do usuário: se a permissão ainda não foi decidida, pede agora
            if (window.NotificationService.getPermission() === 'default') await pedirPermissaoNotificacoes();
            // Volta para a lista de alarmes (o "+ Novo Item" fecha o gerenciador ao abrir o formulário)
            if (currentManagerType === 'alarme') openManager('alarme');
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
        } else if (type === 'valores') {
            // Cada envio cria uma nova versão; a "atual" é a de timestamp mais recente
            // (switchToValoresView ordena por timestamp), as demais viram histórico.
            const strategies = await StorageService.get('planner_strategies') || [];
            strategies.push({
                id: Date.now().toString(),
                type: 'valores',
                content: formData.content,
                timestamp: new Date().getTime()
            });
            await StorageService.set('planner_strategies', strategies);

            if (!viewStrategic.classList.contains('hidden') && currentStrategicSection === 'valores') {
                switchToValoresView();
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
    // Tudo extraído para js/modules/managerModal.js na Fase 3 da refatoração.
    initManagerModal({
        managerModal: document.getElementById('global-manager-modal'),
        managerTitle: document.getElementById('manager-modal-title'),
        managerList: document.getElementById('manager-modal-list'),
        btnManagerAdd: document.getElementById('btn-manager-add'),
        btnsCloseManager: document.querySelectorAll('.btn-close-manager'),
        crudModal
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
    // CITAÇÃO / DEVOCIONAL — MODO ALEATÓRIO / FIXADA / OMITIR (§3.26)
    // ==========================================
    // Tudo em js/modules/citacao.js desde a Fase 2 do plano de refatoração. A data do
    // dia aberto (currentDailyDateStr) ainda mora aqui; o módulo a lê por este getter
    // para redesenhar o box depois de salvar a configuração.
    initCitacao({ getDataDoDiaAberto: () => currentDailyDateStr });

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
        
        const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = `${daysOfWeekFull[dateObj.getDay()]} (${dayStr})`;

        // Título da página do dia, na mesma linha do "+ Nova Atividade": "Qua - 23/09"
        const dailyTitle = document.getElementById('daily-view-title');
        dailyTitle.textContent = `${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dateObj.getDay()]} - ${dayStr}`;
        dailyTitle.classList.remove('hidden');
        
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
                const activeClasses = ['border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'bg-[var(--bg-color)]'];
                const inactiveClasses = ['text-[var(--text-secondary)]', 'border-transparent'];
                const isActive = btn.dataset.date === currentDailyDateStr;
                btn.classList.remove(...(isActive ? inactiveClasses : activeClasses));
                btn.classList.add(...(isActive ? activeClasses : inactiveClasses));
            }
        });

        // ==== CARREGAMENTO DO DIÁRIO ====
        const journalInput = document.getElementById('daily-journal-input');
        const journalData = await StorageService.get('planner_journal') || {};
        journalInput.value = journalData[currentDailyDateStr] || '';
        document.getElementById('journal-save-status').textContent = '';

        // ==== CARREGAMENTO ASSÍNCRONO DOS WIDGETS ====
        
        // Puxar configurações para decidir o que mostrar. Motivacional/Devocional saíram
        // daqui na v1.47: cada um tem seu próprio modo (aleatório/fixada/omitir),
        // configurado na engrenagem do box — ver renderCitacaoWidget() em js/modules/citacao.js.
        const settings = await StorageService.get('planner_settings') || {
            habitos: true, historico: true, compras: true
        };

        // window.widgetState hoje só serve ao widget de Histórico (Citação/Devocional
        // guardam o próprio estado dentro de citacao.js desde a Fase 2 da refatoração).
        if (!window.widgetState) {
            window.widgetState = {
                historico: { list: [], index: 0 }
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
                const contentHtml = `<strong>${item.date}:</strong> ${item.fato}`;

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

        // 2. Motivacional e 3. Devocional (modo Aleatório/Fixada/Omitir por box, §3.26)
        await renderCitacaoWidget('motivacional', currentDailyDateStr);
        await renderCitacaoWidget('devocional', currentDailyDateStr);

        // 4. Compras
        const compContainer = document.getElementById('widget-container-compras');
        if (settings.compras) {
            compContainer.style.display = 'flex';
            await renderWidgetCompras();
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
        crudModal.open('atividade');
    });

    // ==== WIDGET "COMPRAS" DA PÁGINA DO DIA ====
    // Mostra só os itens ainda não comprados da Lista de Compras (js/modules/listaCompras.js).
    // Marcar a caixa grava "comprado" na própria lista; os links levam à página da lista.
    async function renderWidgetCompras() {
        const compWidget = document.getElementById('widget-compras-content');
        if (!compWidget) return;

        const { produtos, categorias } = await carregarCompras(StorageService);
        const pendentes = produtos.filter(p => !p.purchased);
        const nomeCategoria = (id) => categorias.find(c => c.id === id)?.name;
        const MAX_ITENS = 8;

        const linhas = pendentes.slice(0, MAX_ITENS).map(p => {
            const cat = nomeCategoria(p.categoryId);
            return `
            <li class="flex justify-between items-center space-x-3 p-1 hover:bg-[var(--bg-color)] rounded border-b border-[var(--border-color)] border-opacity-50 last:border-0">
                <div class="flex items-center space-x-3 min-w-0">
                    <input type="checkbox" class="rounded w-4 h-4 border-[var(--border-color)] cursor-pointer" title="Marcar como comprado" data-compra-comprado="${escCompras(p.id)}">
                    <span class="truncate cursor-pointer" data-compra-abrir>${escCompras(p.name)}</span>
                    ${cat ? `<span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-color)] opacity-70 border border-[var(--primary-color)] px-1 rounded-sm">${escCompras(cat)}</span>` : ''}
                </div>
                ${p.estimatedPrice != null ? `<span class="text-xs text-[var(--text-secondary)] whitespace-nowrap">${formatCurrency(p.estimatedPrice)}</span>` : ''}
            </li>`;
        }).join('');

        const vazio = produtos.length === 0 ? 'Sua lista está vazia.' : 'Tudo comprado! 🎉';
        const extra = pendentes.length > MAX_ITENS ? `<li class="text-xs text-[var(--text-secondary)] italic p-1">+ ${pendentes.length - MAX_ITENS} ${pendentes.length - MAX_ITENS === 1 ? 'item' : 'itens'} na lista</li>` : '';

        compWidget.innerHTML = `
            ${linhas || `<li class="italic text-[var(--text-secondary)]">${vazio}</li>`}
            ${extra}
            <li class="flex items-center space-x-3 p-1 mt-2 hover:bg-[var(--bg-color)] rounded text-[var(--text-secondary)] cursor-pointer text-sm font-semibold" data-compra-novo>
                <span class="text-[var(--primary-color)] font-bold text-lg leading-none">+</span> <span>adicionar item</span>
            </li>
            <li class="p-1 text-xs text-[var(--primary-color)] cursor-pointer hover:underline" data-compra-abrir>Ver lista completa (${produtos.length}) →</li>`;

        compWidget.querySelectorAll('[data-compra-comprado]').forEach(cb => {
            cb.addEventListener('change', async () => {
                await alternarComprado(StorageService, cb.dataset.compraComprado);
                renderWidgetCompras();
            });
        });
        compWidget.querySelectorAll('[data-compra-abrir]').forEach(el => el.addEventListener('click', () => listaCompras.abrir()));
        compWidget.querySelector('[data-compra-novo]').addEventListener('click', () => listaCompras.abrir({ novoItem: true }));
    }

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
            } else if (moduleKey === 'planner_compras') {
                // Passa pela migração, para exportar sempre no formato novo da Lista de Compras
                const { produtos, categorias } = await carregarCompras(StorageService);
                items = produtos.map(p => ({ ...p, categoria: categorias.find(c => c.id === p.categoryId)?.name || '' }));
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
                csvContent += "ID,Categoria,Item,Descricao,PrecoEstimado,Comprado,Fornecedores\n";
                const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
                items.forEach(item => {
                    const fornecedores = (item.suppliers || []).map(s => s.price != null ? `${s.name} (${s.price})` : s.name).join('; ');
                    const row = [item.id || "", q(item.categoria), q(item.name), q(item.description), item.estimatedPrice ?? "", item.purchased ? "sim" : "nao", q(fornecedores)];
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
    // Motivacional/Devocional não entram mais aqui — cada um tem seu próprio modo
    // (Aleatório/Fixada/Omitir), configurado na engrenagem do box (§3.26).
    const settingsCheckboxes = ['habitos', 'historico', 'compras'];

    // Carregar
    StorageService.get('planner_settings').then(settings => {
        if (!settings) {
            settings = { habitos: true, historico: true, compras: true };
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
    // MODAL DE TRANSFERÊNCIA DE ATIVIDADES
    // ==========================================
    // Tudo extraído para js/modules/transferModal.js na Fase 4 da refatoração.
    initTransferModal({
        transferModal: document.getElementById('global-transfer-modal'),
        renderAtividadesTable,
        switchToPlanosView,
        getPeriodoKey,
        getPeriodoLabel,
        currentPlanosTab
    });

    window.appRouter = {
        goWeekly: switchToWeeklyView,
        goDaily: switchToDailyView,
        openModal: (type, data = null) => crudModal.open(type, data),
        openViewModal: openViewModal,
        openDailyView: openDailyView,
        openManager: openManager,
        abrirListaCompras: (opcoes = {}) => listaCompras.abrir(opcoes),
        abrirPomodoro: () => pomodoro.abrir(),
        switchToPlanosView: (prazo, periodoForcado) => switchToPlanosView(prazo, periodoForcado),
        switchToAtividadesView: switchToAtividadesView,
        renderAtividadesTable: renderAtividadesTable,
        openTransferModal: openTransferModal,
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

    switchToMissaoView: switchToMissaoView,
    switchToVisaoView: switchToVisaoView,
    switchToValoresView: switchToValoresView,
    switchToObjetivosView: switchToObjetivosView,

    };

    // Inicializa
    switchToWeeklyView(new Date(), currentLayout);
    renderSidebarTimeline(new Date().getFullYear());
});

// Utilitários de data/período (getWeekNumber, getWeekDates, getPeriodoKey…) moram em
// js/modules/dateUtils.js desde a Fase 1 do plano de refatoração (import no topo).

// ==========================================
// RENDERIZAÇÃO SEMANAL E DIÁRIA
// ==========================================

// Breadcrumb de navegação Ano › Mês › Semana no cabeçalho, compartilhado pelos 3
// Planos. Cada segmento abre um dropdown com as opções irmãs daquele nível; clicar
// numa opção navega direto para o Plano correspondente (anual/mensal/semanal) já
// com aquele período selecionado. Em telas estreitas os 3 segmentos colapsam num
// único botão que abre os três níveis empilhados.

// Container fixo para os dropdowns do breadcrumb, anexado direto ao <body>.
// Necessário porque header-periodo-buttons vive dentro de uma div com
// overflow-x-auto no cabeçalho — overflow-x diferente de "visible" faz o
// navegador tratar overflow-y como "auto" também (regra do spec CSS), cortando
// qualquer <div class="absolute"> filha antes que ela consiga aparecer.
function getPeriodoDropdownRoot() {
    let root = document.getElementById('periodo-dropdown-root');
    if (!root) {
        root = document.createElement('div');
        root.id = 'periodo-dropdown-root';
        document.body.appendChild(root);
    }
    return root;
}

// onSelecionar(key) decide o que fazer quando uma opção do dropdown é clicada —
// nas páginas de Plano isso navega para o Plano correspondente naquele período;
// no Dashboard (Meu Planner) isso troca a semana exibida sem sair da tela.
async function renderPeriodoBreadcrumb(periodoSelecionado, granularidadeAtiva, onSelecionar) {
    const container = document.getElementById('header-periodo-buttons');
    if (!container) return;

    const now = Date.now();
    let anoKey, mesKey, semanaKey;
    if (granularidadeAtiva === 'ano') {
        anoKey = periodoSelecionado;
        mesKey = getPeriodoKey(now, 'mes');
        semanaKey = getPeriodoKey(now, 'semana');
    } else if (granularidadeAtiva === 'mes') {
        anoKey = periodoSelecionado.split('-')[0];
        mesKey = periodoSelecionado;
        semanaKey = getPeriodoKey(now, 'semana');
    } else {
        const pais = getPeriodoPaiKeys(periodoSelecionado);
        anoKey = pais.ano;
        mesKey = pais.mes;
        semanaKey = periodoSelecionado;
    }

    const strategies = await StorageService.get('planner_strategies') || [];
    const anosComDados = new Set([getPeriodoKey(now, 'ano')]);
    const mesesComDados = new Set();
    const semanasComDados = new Set();
    strategies.forEach(s => {
        if (!['plano_anual', 'plano_mensal', 'plano_semanal'].includes(s.type)) return;
        anosComDados.add(getPeriodoKey(s.timestamp, 'ano'));
        mesesComDados.add(getPeriodoKey(s.timestamp, 'mes'));
        semanasComDados.add(getPeriodoKey(s.timestamp, 'semana'));
    });
    anosComDados.add(anoKey);

    const anos = Array.from(anosComDados).sort().reverse();
    const meses = Array.from({ length: 12 }, (_, i) => `${anoKey}-${String(i + 1).padStart(2, '0')}`);
    const semanas = getSemanasDoMes(mesKey);

    const anoAtualKey = getPeriodoKey(now, 'ano');
    const mesAtualKey = getPeriodoKey(now, 'mes');
    const semanaAtualKey = getPeriodoKey(now, 'semana');

    const optHtml = (key, ativo, atual, texto, temDado) => `
        <button class="periodo-opt w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
            ativo ? 'bg-[var(--primary-color)] text-white font-semibold' : 'hover:bg-[var(--border-color)] text-[var(--text-primary)]'
        } ${!ativo && !temDado ? 'opacity-50' : ''}" data-periodo="${key}">
            ${texto}${atual ? ' <span class="text-xs opacity-75">(atual)</span>' : ''}
        </button>
    `;

    const anoOptions = anos.map(k => optHtml(k, k === anoKey, k === anoAtualKey, k, true)).join('');
    const mesOptions = meses.map(k => optHtml(k, k === mesKey, k === mesAtualKey, getPeriodoLabel(k, 'mes').split(' de ')[0], mesesComDados.has(k))).join('');
    const semanaOptions = semanas.map(k => optHtml(k, k === semanaKey, k === semanaAtualKey, semanaLabelSemAno(k), semanasComDados.has(k))).join('');

    // Cada nível é sempre um "botão" com borda visível (não só um link de texto),
    // conforme feedback do usuário — o ativo ganha preenchimento sólido.
    const crumb = (nivel, texto, ativo) => `
        <button class="crumb-btn px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
            ativo
                ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
        }" data-nivel="${nivel}">${texto}</button>
    `;

    container.innerHTML = `
        <div class="flex items-center gap-1.5" id="breadcrumb-desktop">
            ${crumb('ano', anoKey, granularidadeAtiva === 'ano')}
            <span class="text-[var(--text-secondary)] text-xs">›</span>
            ${crumb('mes', getPeriodoLabel(mesKey, 'mes').split(' de ')[0], granularidadeAtiva === 'mes')}
            <span class="text-[var(--text-secondary)] text-xs">›</span>
            ${crumb('semana', semanaLabelSemAno(semanaKey), granularidadeAtiva === 'semana')}
        </div>
        <button id="breadcrumb-mobile-trigger" class="hidden items-center gap-1 px-2 py-1 rounded text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--border-color)]">
            <span>${getPeriodoLabel(mesKey, 'mes').split(' de ')[0].slice(0, 3)} ${anoKey} · ${semanaLabelCompacto(semanaKey)}</span>
            <span class="text-xs">▾</span>
        </button>
    `;

    // Breakpoint md do Tailwind local (768px) — decide breadcrumb completo vs. botão colapsado.
    const isDesktop = window.innerWidth >= 768;
    container.querySelector('#breadcrumb-desktop').classList.toggle('hidden', !isDesktop);
    const mobileTrigger = container.querySelector('#breadcrumb-mobile-trigger');
    mobileTrigger.classList.toggle('hidden', isDesktop);
    mobileTrigger.classList.toggle('flex', !isDesktop);

    // Dropdowns/painel vivem fora do cabeçalho (ver getPeriodoDropdownRoot) para
    // escapar do overflow-x-auto do container central do header.
    const dropdownRoot = getPeriodoDropdownRoot();
    dropdownRoot.innerHTML = `
        <div class="periodo-dropdown hidden fixed bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 min-w-[160px] max-h-64 overflow-auto z-50" data-dropdown="ano">${anoOptions}</div>
        <div class="periodo-dropdown hidden fixed bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 min-w-[160px] max-h-64 overflow-auto z-50" data-dropdown="mes">${mesOptions}</div>
        <div class="periodo-dropdown hidden fixed bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 min-w-[160px] max-h-64 overflow-auto z-50" data-dropdown="semana">${semanaOptions}</div>
        <div id="breadcrumb-mobile-panel" class="hidden fixed bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-lg p-3 w-72 z-50 space-y-3">
            <div>
                <p class="text-xs text-[var(--text-secondary)] font-semibold mb-1 uppercase">Ano</p>
                <div class="flex flex-wrap gap-1">${anos.map(k => `<button class="periodo-opt px-3 py-1 rounded-full text-xs border border-[var(--border-color)] ${k === anoKey ? 'bg-[var(--primary-color)] text-white' : ''}" data-periodo="${k}">${k}</button>`).join('')}</div>
            </div>
            <div>
                <p class="text-xs text-[var(--text-secondary)] font-semibold mb-1 uppercase">Mês</p>
                <div class="flex flex-wrap gap-1">${meses.map(k => `<button class="periodo-opt px-3 py-1 rounded-full text-xs border border-[var(--border-color)] ${k === mesKey ? 'bg-[var(--primary-color)] text-white' : ''} ${!mesesComDados.has(k) && k !== mesAtualKey ? 'opacity-50' : ''}" data-periodo="${k}">${getPeriodoLabel(k, 'mes').split(' de ')[0].slice(0, 3)}</button>`).join('')}</div>
            </div>
            <div>
                <p class="text-xs text-[var(--text-secondary)] font-semibold mb-1 uppercase">Semana</p>
                <div class="flex flex-wrap gap-1">${semanas.map(k => `<button class="periodo-opt px-3 py-1 rounded-full text-xs border border-[var(--border-color)] ${k === semanaKey ? 'bg-[var(--primary-color)] text-white' : ''} ${!semanasComDados.has(k) && k !== semanaAtualKey ? 'opacity-50' : ''}" data-periodo="${k}">${semanaLabelCompacto(k)}</button>`).join('')}</div>
            </div>
        </div>
    `;

    const fecharDropdowns = () => {
        dropdownRoot.querySelectorAll('.periodo-dropdown, #breadcrumb-mobile-panel').forEach(d => d.classList.add('hidden'));
    };

    // Chamado com o elemento já visível (classe "hidden" removida) para poder medir
    // offsetWidth de verdade; clampa dentro da viewport com 8px de margem mínima
    // para não deixar o painel cortado em telas estreitas.
    const posicionarSobre = (el, anchorRect) => {
        el.style.top = `${anchorRect.bottom + 4}px`;
        el.style.left = `${anchorRect.left}px`;
        el.style.right = 'auto';
        const rect = el.getBoundingClientRect();
        const margem = 8;
        if (rect.right > window.innerWidth - margem) {
            el.style.left = `${Math.max(margem, window.innerWidth - margem - rect.width)}px`;
        }
    };

    container.querySelectorAll('.crumb-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const nivel = btn.dataset.nivel;
            const dropdown = dropdownRoot.querySelector(`.periodo-dropdown[data-dropdown="${nivel}"]`);
            const estavaAberto = !dropdown.classList.contains('hidden');
            fecharDropdowns();
            if (!estavaAberto) {
                const anchorRect = btn.getBoundingClientRect();
                dropdown.classList.remove('hidden');
                posicionarSobre(dropdown, anchorRect);
            }
        });
    });

    mobileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const panel = dropdownRoot.querySelector('#breadcrumb-mobile-panel');
        const estavaAberto = !panel.classList.contains('hidden');
        fecharDropdowns();
        if (!estavaAberto) {
            const anchorRect = mobileTrigger.getBoundingClientRect();
            panel.classList.remove('hidden');
            posicionarSobre(panel, anchorRect);
        }
    });

    dropdownRoot.querySelectorAll('.periodo-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelecionar(opt.dataset.periodo);
        });
    });

    if (!window.__breadcrumbOutsideClickAttached) {
        document.addEventListener('click', () => {
            document.querySelectorAll('.periodo-dropdown, #breadcrumb-mobile-panel').forEach(d => d.classList.add('hidden'));
        });
        window.addEventListener('resize', () => {
            document.querySelectorAll('.periodo-dropdown, #breadcrumb-mobile-panel').forEach(d => d.classList.add('hidden'));
        });
        window.__breadcrumbOutsideClickAttached = true;
    }
}

// Popula o sub-header (dynamic-header-tabs) com os 7 dias de uma semana, cada um
// clicável para abrir a Visão Diária. Reaproveitado pelo Dashboard (renderWeeklyGrid)
// e pelo Plano Semanal (renderPlanoVersionado), para que ver o plano de uma semana
// também dê acesso rápido a cada dia dela.
function renderDiasNoSubheader(dates) {
    const headerTabsContainer = document.getElementById('dynamic-header-tabs');
    if (!headerTabsContainer) return;

    let tabsHTML = '';
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

    headerTabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('button');
            if (!targetBtn) return;
            const [y, m, d] = targetBtn.dataset.date.split('-');
            window.appRouter.goDaily(new Date(y, m - 1, d));
        });
    });
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

        renderDiasNoSubheader(dates);

        // Breadcrumb de período (Ano › Mês › Semana): no dashboard, Ano e Mês trocam a
        // semana exibida na própria tela; Semana navega para o Plano Semanal daquele
        // período (que também popula o sub-header com os dias correspondentes).
        const semanaAtualDashboard = getPeriodoKey(dates[0].getTime(), 'semana');
        await renderPeriodoBreadcrumb(semanaAtualDashboard, 'semana', (key) => {
            if (key.includes('-w')) {
                window.appRouter.switchToPlanosView('semanal', key);
                return;
            }
            let alvo;
            if (key.includes('-')) {
                const [ano, mes] = key.split('-').map(Number);
                const hoje = new Date();
                // Dia 15 (meio do mês) em vez do dia 1: a primeira semana de um mês às
                // vezes "pertence" ao mês anterior (domingo cai antes da virada), o que
                // faria clicar em "Dez" cair numa semana rotulada "Nov" no breadcrumb.
                alvo = (key === getPeriodoKey(Date.now(), 'mes')) ? hoje : new Date(ano, mes - 1, 15);
            } else {
                const hoje = new Date();
                alvo = (key === getPeriodoKey(Date.now(), 'ano')) ? hoje : new Date(Number(key), 5, 15);
            }
            window.appRouter.goWeekly(alvo);
        });

        // header-week-tabs não é mais usado (dias foram para o sub-header acima) —
        // mantido limpo para não deixar conteúdo obsoleto se algo ainda o referenciar.
        const headerWeekTabsLegacy = document.getElementById('header-week-tabs');
        if (headerWeekTabsLegacy) headerWeekTabsLegacy.innerHTML = '';


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
