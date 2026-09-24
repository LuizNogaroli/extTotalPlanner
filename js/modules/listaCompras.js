/**
 * listaCompras.js — Lista de Compras interna (menu Recursos → Lista de Compras).
 *
 * Inspirada em extListaDeCompras (extension/src/newtab: App.tsx, ProductList, ProductForm,
 * CategoryManager, MarketplaceSearchPanel, mock/marketplaceSuggestions). Diferenças:
 *  - Lá os dados vêm de um backend (Express + Prisma). Aqui ficam no StorageService,
 *    como o resto do Planner (chrome.storage.local ou localStorage no rodar.bat).
 *  - Lá é React. Aqui é Vanilla JS: o módulo desenha a view inteira e usa delegação de
 *    eventos com atributos data-action.
 *  - Todo texto do usuário passa por esc() antes do innerHTML, e só links http(s) viram <a>.
 */

export const COMPRAS_KEY = 'planner_compras';
export const CATEGORIAS_KEY = 'planner_compras_categorias';
const MIGRACAO_KEY = 'planner_compras_migrado_v2';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatCurrency = (value) => brl.format(value);

export function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const safeUrl = (url) => (/^https?:\/\//i.test(url || '') ? url : null);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const parsePreco = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));

// ==================== Dados ====================

/**
 * Lê produtos e categorias. Na primeira execução converte os dois formatos antigos:
 *  - planner_compras antigo: { id, item, detalhes, categoria }, usado pelo widget da página do dia
 *  - planner_lista_compras: { item, categoria, quantidade, preco, concluido, loja }, gravado pelo
 *    CRUD genérico (que nunca aparecia no widget, porque a chave era outra)
 */
export async function carregarDados(StorageService) {
    let produtos = (await StorageService.get(COMPRAS_KEY)) || [];
    let categorias = (await StorageService.get(CATEGORIAS_KEY)) || [];

    if (!(await StorageService.get(MIGRACAO_KEY))) {
        const agora = new Date().toISOString();
        const porNome = new Map(categorias.map(c => [c.name.toLowerCase(), c]));
        const categoriaId = (nome) => {
            if (!nome || !String(nome).trim()) return null;
            const chave = String(nome).trim().toLowerCase();
            if (!porNome.has(chave)) porNome.set(chave, { id: uid(), name: String(nome).trim(), createdAt: agora });
            return porNome.get(chave).id;
        };

        produtos = produtos.map(p => (p.name !== undefined ? p : {
            id: p.id || uid(),
            name: p.item || 'Item sem nome',
            description: p.detalhes || null,
            estimatedPrice: null,
            purchased: false,
            categoryId: categoriaId(p.categoria),
            suppliers: [],
            createdAt: agora,
            updatedAt: agora
        }));

        const legadoCrud = (await StorageService.get('planner_lista_compras')) || [];
        for (const p of legadoCrud) {
            if (!p || !p.item) continue;
            produtos.push({
                id: p.id || uid(),
                name: p.item,
                description: p.quantidade ? `Quantidade: ${p.quantidade}` : null,
                estimatedPrice: parsePreco(p.preco),
                purchased: !!p.concluido,
                categoryId: categoriaId(p.categoria),
                suppliers: p.loja ? [{ id: uid(), name: p.loja, url: null, price: null, notes: null }] : [],
                createdAt: agora,
                updatedAt: agora
            });
        }

        categorias = [...porNome.values()];
        await StorageService.set(COMPRAS_KEY, produtos);
        await StorageService.set(CATEGORIAS_KEY, categorias);
        await StorageService.set(MIGRACAO_KEY, true);
    }

    return { produtos, categorias };
}

export async function alternarComprado(StorageService, id) {
    const { produtos } = await carregarDados(StorageService);
    const p = produtos.find(x => x.id === id);
    if (!p) return;
    p.purchased = !p.purchased;
    p.updatedAt = new Date().toISOString();
    await StorageService.set(COMPRAS_KEY, produtos);
}

// ==================== Cortina (dados de exemplo) ====================
// Cópia de mock/marketplaceSuggestions.ts: preços proporcionais ao preço estimado do item,
// sem aleatoriedade (o mesmo item sempre gera os mesmos números).

const MARKETPLACES = [
    { name: 'Mercado Livre', priceFactor: 0.95, rating: 4.6, reviews: 812, color: '#fde68a', freeShipping: true, fastDelivery: true, cashbackPercent: 3 },
    { name: 'Amazon', priceFactor: 1.05, rating: 4.4, reviews: 1523, color: '#fdba74', freeShipping: true, fastDelivery: true, cashbackPercent: null },
    { name: 'Magalu', priceFactor: 0.9, rating: 4.2, reviews: 356, color: '#93c5fd', freeShipping: false, fastDelivery: false, cashbackPercent: 5 },
    { name: 'Shopee', priceFactor: 0.85, rating: 4.0, reviews: 97, color: '#f9a8d4', freeShipping: false, fastDelivery: false, cashbackPercent: null },
    { name: 'Americanas', priceFactor: 0.98, rating: 4.1, reviews: 640, color: '#a7f3d0', freeShipping: true, fastDelivery: false, cashbackPercent: 2 },
    { name: 'Casas Bahia', priceFactor: 1.02, rating: 3.9, reviews: 210, color: '#c4b5fd', freeShipping: false, fastDelivery: false, cashbackPercent: 4 },
    { name: 'AliExpress', priceFactor: 0.78, rating: 4.3, reviews: 2431, color: '#fca5a5', freeShipping: false, fastDelivery: false, cashbackPercent: null },
    { name: 'KaBuM!', priceFactor: 1.08, rating: 4.7, reviews: 980, color: '#67e8f9', freeShipping: true, fastDelivery: true, cashbackPercent: null },
    { name: 'Submarino', priceFactor: 1.0, rating: 4.0, reviews: 145, color: '#d9f99d', freeShipping: false, fastDelivery: false, cashbackPercent: 6 },
    { name: 'Carrefour', priceFactor: 0.88, rating: 3.8, reviews: 88, color: '#fed7aa', freeShipping: false, fastDelivery: false, cashbackPercent: null }
];

function gerarSugestoes(produto) {
    const base = produto.estimatedPrice ?? 50;
    return MARKETPLACES.map((m, i) => ({
        id: `${produto.id}-${i}`,
        marketplace: m.name,
        title: `${produto.name} — oferta em ${m.name}`,
        description: produto.description || 'Sem descrição informada para este item.',
        price: Number((base * m.priceFactor).toFixed(2)),
        rating: m.rating,
        reviews: m.reviews,
        color: m.color,
        freeShipping: m.freeShipping,
        fastDelivery: m.fastDelivery,
        cashbackPercent: m.cashbackPercent
    }));
}

const CORTINA_PADRAO = () => ({ open: false, sort: 'relevancia', filtros: { freeShipping: false, cashback: false, fastDelivery: false }, page: 1, pageSize: 5 });

// ==================== Módulo ====================

export class ListaCompras {
    /**
     * @param {object} deps
     * @param {object} deps.StorageService
     * @param {Function} deps.hideAllViews  esconde as outras views (vem do app.js)
     * @param {Function} [deps.onChange]    chamado depois de qualquer alteração (ex.: atualizar o widget do dia)
     */
    constructor({ StorageService, hideAllViews, onChange }) {
        this.storage = StorageService;
        this.hideAllViews = hideAllViews;
        this.onChange = onChange || (() => {});
        this.produtos = [];
        this.categorias = [];
        this.busca = '';
        this.filtroCategoria = '';
        this.cortinas = new Map();   // id do produto → estado da "cortina"
        this.pesquisando = new Set(); // itens recém-criados na "pesquisa" simulada (2,2 s)
        this.view = null;
        this.montado = false;
    }

    async abrir({ novoItem = false } = {}) {
        this.hideAllViews();
        this.view = document.getElementById('view-compras');
        this.view.classList.remove('hidden');
        this.view.classList.add('flex');
        if (!this.montado) this._montar();
        await this.recarregar();
        if (novoItem) this.abrirFormulario(null);
        if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.add('closed');
    }

    async recarregar() {
        const { produtos, categorias } = await carregarDados(this.storage);
        this.produtos = produtos;
        this.categorias = categorias;
        this._render();
    }

    async _salvar() {
        await this.storage.set(COMPRAS_KEY, this.produtos);
        await this.storage.set(CATEGORIAS_KEY, this.categorias);
        this.onChange();
    }

    // ---------- Estrutura fixa da view (desenhada uma vez) ----------

    _montar() {
        this.view.innerHTML = `
            <div class="lc-app">
                <header class="lc-header">
                    <h2>🛒 Lista de Compras</h2>
                    <div class="lc-header-actions">
                        <button class="lc-btn secondary" data-action="permissao" id="lc-btn-permissao"></button>
                        <button class="lc-btn secondary" data-action="categorias">Categorias</button>
                        <button class="lc-btn" data-action="novo">+ Novo item</button>
                    </div>
                </header>
                <div class="lc-toolbar">
                    <input type="search" id="lc-busca" placeholder="Buscar por nome...">
                    <select id="lc-filtro-categoria"></select>
                </div>
                <div id="lc-resumo" class="lc-resumo"></div>
                <div id="lc-lista"></div>
            </div>
            <div id="lc-modal-root"></div>
        `;

        this.view.addEventListener('click', (e) => this._onClick(e));
        this.view.addEventListener('change', (e) => this._onChange(e));
        this.view.querySelector('#lc-busca').addEventListener('input', (e) => { this.busca = e.target.value; this._renderLista(); });
        this.view.querySelector('#lc-filtro-categoria').addEventListener('change', (e) => { this.filtroCategoria = e.target.value; this._renderLista(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.view && !this.view.classList.contains('hidden')) this._fecharModal();
        });
        this.montado = true;
    }

    _render() {
        this._renderPermissao();
        const sel = this.view.querySelector('#lc-filtro-categoria');
        if (this.filtroCategoria && !this.categorias.some(c => c.id === this.filtroCategoria)) this.filtroCategoria = '';
        sel.innerHTML = `<option value="">Todas as categorias</option>` +
            this._categoriasOrdenadas().map(c => `<option value="${esc(c.id)}"${c.id === this.filtroCategoria ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
        this._renderLista();
    }

    _renderPermissao() {
        const btn = this.view.querySelector('#lc-btn-permissao');
        const ns = window.NotificationService;
        if (!ns || ns.getPermission() === 'unsupported') { btn.classList.add('lc-oculto'); return; }
        const info = ns.describePermission();
        btn.textContent = info.label;
        btn.title = info.title || 'Avisos quando o preço de um item ou de um fornecedor mudar, ou quando um fornecedor for adicionado';
        btn.disabled = info.disabled;
    }

    _categoriasOrdenadas() {
        return [...this.categorias].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }

    _nomeCategoria(id) {
        return this.categorias.find(c => c.id === id)?.name || null;
    }

    // ---------- Lista (ProductList.tsx) ----------

    _renderLista() {
        const alvo = this.view.querySelector('#lc-lista');
        const termo = this.busca.trim().toLowerCase();
        const visiveis = this.produtos.filter(p =>
            p.name.toLowerCase().includes(termo) && (!this.filtroCategoria || p.categoryId === this.filtroCategoria));

        const pendentes = this.produtos.filter(p => !p.purchased);
        const totalPendente = pendentes.reduce((s, p) => s + (p.estimatedPrice || 0), 0);
        this.view.querySelector('#lc-resumo').textContent = this.produtos.length
            ? `${pendentes.length} de ${this.produtos.length} itens a comprar · estimativa pendente: ${formatCurrency(totalPendente)}`
            : '';

        if (visiveis.length === 0) {
            alvo.innerHTML = `<p class="lc-empty">${this.produtos.length ? 'Nenhum item encontrado com esses filtros.' : 'Nenhum item encontrado. Adicione o primeiro item da sua lista.'}</p>`;
            return;
        }

        const grupos = new Map();
        for (const p of visiveis) {
            const nome = this._nomeCategoria(p.categoryId) || 'Sem categoria';
            if (!grupos.has(nome)) grupos.set(nome, []);
            grupos.get(nome).push(p);
        }
        const nomes = [...grupos.keys()].sort((a, b) =>
            a === 'Sem categoria' ? 1 : b === 'Sem categoria' ? -1 : a.localeCompare(b, 'pt-BR'));

        alvo.innerHTML = `<div class="lc-groups">${nomes.map(nome => `
            <section class="lc-group">
                <h3>${esc(nome)}</h3>
                <ul class="lc-list">${grupos.get(nome).map(p => this._htmlItem(p)).join('')}</ul>
            </section>`).join('')}</div>`;
    }

    _htmlItem(p) {
        const fornecedores = (p.suppliers || []).map(s => {
            const url = safeUrl(s.url);
            const nome = url ? `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(s.name)}</a>` : esc(s.name);
            return `<li>${nome}${s.price != null ? `<span> · ${formatCurrency(s.price)}</span>` : ''}</li>`;
        }).join('');

        return `
            <li class="lc-item${p.purchased ? ' purchased' : ''}" data-id="${esc(p.id)}">
                <div class="lc-row">
                    <div class="lc-main">
                        <input type="checkbox" class="lc-check" data-action="comprado" data-id="${esc(p.id)}"${p.purchased ? ' checked' : ''} title="Marcar como comprado">
                        <div class="lc-info">
                            <div class="lc-title-row">
                                <span class="lc-name">${esc(p.name)}</span>
                                ${p.estimatedPrice != null ? `<span class="lc-price">${formatCurrency(p.estimatedPrice)}</span>` : ''}
                            </div>
                            ${p.description ? `<p class="lc-desc">${esc(p.description)}</p>` : ''}
                            ${fornecedores ? `<ul class="lc-chips">${fornecedores}</ul>` : ''}
                        </div>
                    </div>
                    <div class="lc-actions">
                        <button class="lc-btn ghost" data-action="editar" data-id="${esc(p.id)}">Editar</button>
                        <button class="lc-btn ghost danger" data-action="excluir" data-id="${esc(p.id)}">Excluir</button>
                    </div>
                </div>
                ${this._htmlCortina(p)}
            </li>`;
    }

    // ---------- Cortina (MarketplaceSearchPanel.tsx) ----------

    _estadoCortina(id) {
        if (!this.cortinas.has(id)) this.cortinas.set(id, CORTINA_PADRAO());
        return this.cortinas.get(id);
    }

    _htmlCortina(p) {
        if (this.pesquisando.has(p.id)) {
            return `<div class="lc-panel"><div class="lc-panel-toggle lc-panel-loading">
                <span class="lc-spinner" aria-hidden="true"></span>
                <span class="lc-panel-title">Pesquisando produtos/preços/descrições...</span></div></div>`;
        }

        const st = this._estadoCortina(p.id);
        const todas = gerarSugestoes(p);
        let lista = todas.filter(s =>
            (!st.filtros.freeShipping || s.freeShipping) &&
            (!st.filtros.cashback || s.cashbackPercent != null) &&
            (!st.filtros.fastDelivery || s.fastDelivery));
        if (st.sort === 'menor-preco') lista = [...lista].sort((a, b) => a.price - b.price);
        else if (st.sort === 'maior-preco') lista = [...lista].sort((a, b) => b.price - a.price);
        else if (st.sort === 'avaliacao') lista = [...lista].sort((a, b) => b.rating - a.rating);

        const totalPaginas = Math.max(1, Math.ceil(lista.length / st.pageSize));
        const pagina = Math.min(st.page, totalPaginas);
        const itens = lista.slice((pagina - 1) * st.pageSize, pagina * st.pageSize);
        const id = esc(p.id);
        const pill = (chave, rotulo) => `<label class="lc-pill${st.filtros[chave] ? ' on' : ''}">
            <input type="checkbox" data-action="cortina-filtro" data-id="${id}" data-filtro="${chave}"${st.filtros[chave] ? ' checked' : ''}> ${rotulo}</label>`;

        return `
            <div class="lc-panel">
                <button type="button" class="lc-panel-toggle" data-action="cortina" data-id="${id}" aria-expanded="${st.open}">
                    <span>🔍</span>
                    <span class="lc-panel-title">Pesquisa de Produtos/Preço/Descrição<span class="lc-panel-count"> · ${todas.length} encontrados</span></span>
                    <span class="lc-chevron${st.open ? ' open' : ''}">▾</span>
                </button>
                ${!st.open ? '' : `
                <div class="lc-panel-body">
                    <p class="lc-disclaimer">Prévia com dados de exemplo — a busca real nos marketplaces ainda não está implementada.</p>
                    <div class="lc-filters">
                        <label class="lc-field">Ordenar por
                            <select data-action="cortina-sort" data-id="${id}">
                                ${[['relevancia', 'Relevância'], ['menor-preco', 'Menor preço'], ['maior-preco', 'Maior preço'], ['avaliacao', 'Melhor avaliação']]
                                    .map(([v, t]) => `<option value="${v}"${st.sort === v ? ' selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </label>
                        <div class="lc-pills">${pill('freeShipping', 'Frete grátis')}${pill('cashback', 'Cashback')}${pill('fastDelivery', 'Entrega rápida')}</div>
                    </div>
                    ${lista.length === 0 ? '<p class="lc-empty">Nenhuma oferta encontrada com esses filtros.</p>' : `
                    <ul class="lc-results">${itens.map(s => `
                        <li class="lc-result">
                            <div class="lc-thumb" style="background:${s.color}">${esc(s.marketplace.charAt(0))}</div>
                            <div class="lc-result-info">
                                <div class="lc-result-top"><span class="lc-market">${esc(s.marketplace)}</span><span class="lc-rating">★ ${s.rating.toFixed(1)} (${s.reviews})</span></div>
                                <p class="lc-result-title">${esc(s.title)}</p>
                                <p class="lc-result-desc">${esc(s.description)}</p>
                                ${(s.freeShipping || s.fastDelivery || s.cashbackPercent != null) ? `<div class="lc-badges">
                                    ${s.freeShipping ? '<span class="lc-badge">🚚 Frete grátis</span>' : ''}
                                    ${s.fastDelivery ? '<span class="lc-badge">⚡ Entrega rápida</span>' : ''}
                                    ${s.cashbackPercent != null ? `<span class="lc-badge cashback">💰 ${s.cashbackPercent}% cashback</span>` : ''}
                                </div>` : ''}
                            </div>
                            <div class="lc-result-price">
                                <span>${formatCurrency(s.price)}</span>
                                <button type="button" class="lc-btn ghost" disabled title="Disponível quando a busca real for implementada">Ver oferta</button>
                            </div>
                        </li>`).join('')}
                    </ul>
                    <div class="lc-pagination">
                        <label class="lc-field inline">Itens por página
                            <select data-action="cortina-pagesize" data-id="${id}">
                                ${[5, 10, 20].map(n => `<option value="${n}"${st.pageSize === n ? ' selected' : ''}>${n}</option>`).join('')}
                            </select>
                        </label>
                        <div class="lc-page-controls">
                            <button type="button" class="lc-btn ghost" data-action="cortina-pagina" data-id="${id}" data-pagina="${pagina - 1}"${pagina <= 1 ? ' disabled' : ''}>‹ Anterior</button>
                            <span>Página ${pagina} de ${totalPaginas}</span>
                            <button type="button" class="lc-btn ghost" data-action="cortina-pagina" data-id="${id}" data-pagina="${pagina + 1}"${pagina >= totalPaginas ? ' disabled' : ''}>Próxima ›</button>
                        </div>
                    </div>`}
                </div>`}
            </div>`;
    }

    // ---------- Eventos (delegação) ----------

    async _onClick(e) {
        const el = e.target.closest('[data-action]');
        if (!el || el.tagName === 'SELECT' || el.type === 'checkbox') return;
        const id = el.dataset.id;
        switch (el.dataset.action) {
            case 'novo': return this.abrirFormulario(null);
            case 'editar': return this.abrirFormulario(this.produtos.find(p => p.id === id) || null);
            case 'excluir': return this._excluir(id);
            case 'categorias': return this._abrirCategorias();
            case 'permissao':
                await window.NotificationService.requestPermission();
                return this._renderPermissao();
            case 'cortina': {
                const st = this._estadoCortina(id);
                st.open = !st.open;
                return this._renderLista();
            }
            case 'cortina-pagina': {
                this._estadoCortina(id).page = Number(el.dataset.pagina);
                return this._renderLista();
            }
        }
    }

    async _onChange(e) {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        const id = el.dataset.id;
        switch (el.dataset.action) {
            case 'comprado': {
                const p = this.produtos.find(x => x.id === id);
                if (!p) return;
                p.purchased = el.checked;
                p.updatedAt = new Date().toISOString();
                await this._salvar();
                return this._renderLista();
            }
            case 'cortina-sort': {
                this._estadoCortina(id).sort = el.value;
                return this._renderLista();
            }
            case 'cortina-filtro': {
                const st = this._estadoCortina(id);
                st.filtros[el.dataset.filtro] = el.checked;
                st.page = 1;
                return this._renderLista();
            }
            case 'cortina-pagesize': {
                const st = this._estadoCortina(id);
                st.pageSize = Number(el.value);
                st.page = 1;
                return this._renderLista();
            }
        }
    }

    async _excluir(id) {
        const p = this.produtos.find(x => x.id === id);
        if (!p || !confirm(`Excluir "${p.name}" da lista?`)) return;
        this.produtos = this.produtos.filter(x => x.id !== id);
        this.cortinas.delete(id);
        await this._salvar();
        this._renderLista();
    }

    // ---------- Modais (estrutura modal-backdrop + modal da referência) ----------

    _abrirModal(html, aoMontar) {
        const root = this.view.querySelector('#lc-modal-root');
        root.innerHTML = `<div class="lc-backdrop">${html}</div>`;
        const backdrop = root.firstElementChild;
        // Fecha só se o clique foi no próprio fundo (evita o bug do clique que "borbulha" do card)
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this._fecharModal(); });
        aoMontar(backdrop.firstElementChild);
    }

    _fecharModal() {
        const root = this.view && this.view.querySelector('#lc-modal-root');
        if (root) root.innerHTML = '';
    }

    // ProductForm.tsx
    abrirFormulario(produto) {
        const linhaFornecedor = (s = {}) => `
            <div class="lc-supplier-row">
                <input data-f="name" placeholder="Nome" value="${esc(s.name || '')}">
                <input data-f="url" placeholder="Link (opcional)" value="${esc(s.url || '')}">
                <input data-f="price" placeholder="Preço" type="number" step="0.01" min="0" value="${s.price ?? ''}">
                <button type="button" class="lc-btn ghost danger" data-remover>Remover</button>
            </div>`;

        const cats = this._categoriasOrdenadas().map(c =>
            `<option value="${esc(c.id)}"${produto?.categoryId === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('');

        this._abrirModal(`
            <form class="lc-modal" novalidate>
                <h2>${produto ? 'Editar item' : 'Novo item'}</h2>
                <label class="lc-field">Nome *<input name="name" required value="${esc(produto?.name || '')}"></label>
                <label class="lc-field">Descrição<textarea name="description" rows="2">${esc(produto?.description || '')}</textarea></label>
                <div class="lc-form-row">
                    <label class="lc-field">Preço estimado (R$)<input name="estimatedPrice" type="number" step="0.01" min="0" value="${produto?.estimatedPrice ?? ''}"></label>
                    <label class="lc-field">Categoria<select name="categoryId"><option value="">Sem categoria</option>${cats}</select></label>
                </div>
                <div class="lc-suppliers">
                    <div class="lc-suppliers-header"><span>Fornecedores possíveis</span><button type="button" class="lc-btn ghost" data-add>+ Adicionar</button></div>
                    <div data-rows>${(produto?.suppliers || []).map(s => linhaFornecedor(s)).join('')}</div>
                    <p class="lc-empty small" data-vazio${produto?.suppliers?.length ? ' hidden' : ''}>Nenhum fornecedor adicionado ainda.</p>
                </div>
                <p class="lc-erro" data-erro hidden>Informe o nome do item.</p>
                <div class="lc-form-actions">
                    <button type="button" class="lc-btn secondary" data-cancelar>Cancelar</button>
                    <button type="submit" class="lc-btn">Salvar</button>
                </div>
            </form>`, (form) => {
            // form.name seria o atributo "name" do próprio <form>, não o campo: por isso namedItem()
            const campo = (n) => form.elements.namedItem(n);
            const rows = form.querySelector('[data-rows]');
            const vazio = form.querySelector('[data-vazio]');
            const atualizarVazio = () => { vazio.hidden = rows.children.length > 0; };

            form.querySelector('[data-add]').addEventListener('click', () => {
                rows.insertAdjacentHTML('beforeend', linhaFornecedor());
                atualizarVazio();
                rows.lastElementChild.querySelector('input').focus();
            });
            rows.addEventListener('click', (e) => {
                if (e.target.matches('[data-remover]')) { e.target.closest('.lc-supplier-row').remove(); atualizarVazio(); }
            });
            form.querySelector('[data-cancelar]').addEventListener('click', () => this._fecharModal());
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const nome = campo('name').value.trim();
                if (!nome) { form.querySelector('[data-erro]').hidden = false; campo('name').focus(); return; }
                const input = {
                    name: nome,
                    description: campo('description').value.trim() || null,
                    estimatedPrice: parsePreco(campo('estimatedPrice').value),
                    categoryId: campo('categoryId').value || null,
                    suppliers: [...rows.querySelectorAll('.lc-supplier-row')].map(r => ({
                        name: r.querySelector('[data-f="name"]').value.trim(),
                        url: r.querySelector('[data-f="url"]').value.trim() || null,
                        price: parsePreco(r.querySelector('[data-f="price"]').value),
                        notes: null
                    })).filter(s => s.name)
                };
                // Como na referência: avisa ANTES de qualquer await, ainda dentro do gesto do
                // usuário (o som só é liberado pelo navegador nessa janela).
                this._diffAndNotify(produto, input);
                this._salvarProduto(produto, input);
            });
            campo('name').focus();
        });
    }

    async _salvarProduto(anterior, input) {
        const agora = new Date().toISOString();
        const suppliers = input.suppliers.map(s => ({ id: uid(), ...s }));
        if (anterior) {
            const p = this.produtos.find(x => x.id === anterior.id);
            Object.assign(p, { ...input, suppliers, updatedAt: agora });
        } else {
            const novo = { id: uid(), ...input, suppliers, purchased: false, createdAt: agora, updatedAt: agora };
            this.produtos.push(novo);
            // "Pesquisa" simulada, como em App.tsx (markAsSearching)
            this.pesquisando.add(novo.id);
            setTimeout(() => { this.pesquisando.delete(novo.id); if (this.view && !this.view.classList.contains('hidden')) this._renderLista(); }, 2200);
        }
        await this._salvar();
        this._fecharModal();
        this._renderLista();
    }

    // diffAndNotify() de App.tsx: compara o "antes" (item na tela) com o "depois" (formulário)
    _diffAndNotify(anterior, input) {
        const ns = window.NotificationService;
        if (!ns) return;
        const avisar = (titulo, corpo) => { if (ns.notify(titulo, corpo)) ns.playCoinSound(); };
        const nome = input.name;

        if (!anterior) {
            for (const s of input.suppliers) avisar('Novo fornecedor', `${nome}: fornecedor "${s.name}" foi cadastrado.`);
            return;
        }
        if (input.estimatedPrice != null && anterior.estimatedPrice != null && input.estimatedPrice !== anterior.estimatedPrice) {
            avisar('Preço atualizado', `${nome}: preço estimado mudou de ${formatCurrency(anterior.estimatedPrice)} para ${formatCurrency(input.estimatedPrice)}.`);
        }
        // fornecedores são comparados por nome (o formulário não carrega ids de fornecedor)
        const antes = new Map((anterior.suppliers || []).map(s => [s.name, s]));
        for (const s of input.suppliers) {
            const b = antes.get(s.name);
            if (!b) avisar('Novo fornecedor', `${nome}: fornecedor "${s.name}" foi adicionado.`);
            else if (s.price != null && b.price != null && s.price !== b.price) {
                avisar('Preço de fornecedor atualizado', `${nome} — ${s.name}: preço mudou de ${formatCurrency(b.price)} para ${formatCurrency(s.price)}.`);
            }
        }
    }

    // CategoryManager.tsx
    _abrirCategorias() {
        const htmlLista = () => this._categoriasOrdenadas().map(c => `
            <li data-id="${esc(c.id)}">
                <span>${esc(c.name)}</span>
                <button type="button" class="lc-btn ghost" data-renomear>Renomear</button>
                <button type="button" class="lc-btn ghost danger" data-excluir>Excluir</button>
            </li>`).join('') || '<li class="lc-empty small">Nenhuma categoria cadastrada.</li>';

        this._abrirModal(`
            <div class="lc-modal">
                <h2>Categorias</h2>
                <form class="lc-inline-form" data-nova>
                    <input type="text" placeholder="Nova categoria">
                    <button type="submit" class="lc-btn">Adicionar</button>
                </form>
                <ul class="lc-category-list" data-lista>${htmlLista()}</ul>
                <button type="button" class="lc-btn secondary" data-fechar>Fechar</button>
            </div>`, (modal) => {
            const lista = modal.querySelector('[data-lista]');
            const redesenhar = () => { lista.innerHTML = htmlLista(); this._render(); };

            modal.querySelector('[data-fechar]').addEventListener('click', () => this._fecharModal());
            modal.querySelector('[data-nova]').addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = e.target.querySelector('input');
                const nome = input.value.trim();
                if (!nome) return;
                this.categorias.push({ id: uid(), name: nome, createdAt: new Date().toISOString() });
                await this._salvar();
                input.value = '';
                redesenhar();
            });
            lista.addEventListener('click', async (e) => {
                const li = e.target.closest('li[data-id]');
                if (!li) return;
                const cat = this.categorias.find(c => c.id === li.dataset.id);
                if (!cat) return;

                if (e.target.matches('[data-renomear]')) {
                    li.innerHTML = `<input type="text" value="${esc(cat.name)}">
                        <button type="button" class="lc-btn" data-confirmar>Salvar</button>
                        <button type="button" class="lc-btn ghost" data-cancelar-edicao>Cancelar</button>`;
                    li.querySelector('input').focus();
                } else if (e.target.matches('[data-confirmar]')) {
                    const nome = li.querySelector('input').value.trim();
                    if (nome) { cat.name = nome; await this._salvar(); }
                    redesenhar();
                } else if (e.target.matches('[data-cancelar-edicao]')) {
                    redesenhar();
                } else if (e.target.matches('[data-excluir]')) {
                    if (!confirm('Excluir esta categoria? Os itens ficarão sem categoria.')) return;
                    this.categorias = this.categorias.filter(c => c.id !== cat.id);
                    this.produtos.forEach(p => { if (p.categoryId === cat.id) p.categoryId = null; });
                    await this._salvar();
                    redesenhar();
                }
            });
            modal.querySelector('[data-nova] input').focus();
        });
    }
}
