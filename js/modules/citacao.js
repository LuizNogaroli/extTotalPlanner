/**
 * citacao.js — Boxes "✨ Citação" (motivacional) e "🙏 Devocional" da página do dia.
 *
 * Cada box é um botão que abre um modal com a mensagem em vigor, e tem uma engrenagem
 * com 3 modos: Aleatório, Fixada (ID escolhido pelo usuário) ou Omitir. Detalhes em
 * MANUAL_TECNICO.md §3.26. Extraído do js/app.js na Fase 2 do plano de refatoração
 * (docs/plano_refatoracao_appjs.md).
 *
 * Modelo de dados — `planner_citacao_config[tipo]` é uma LINHA DO TEMPO de marcos:
 *   [{ modo: 'aleatorio' | 'fixada' | 'omitir', id, dataInicio: 'AAAA-MM-DD' }, ...]
 * Trocar o modo ou o ID hoje cria um marco novo com dataInicio = hoje; dias passados
 * continuam mostrando o marco que estava vigente naquela data (não são reescritos).
 *
 * Uso (js/app.js):
 *   initCitacao({ getDataDoDiaAberto })  — uma vez, no boot: registra os listeners.
 *   renderCitacaoWidget(tipo, dataStr)   — a cada abertura da Visão Diária.
 */

import { esc } from './listaCompras.js';
import { toLocalDateStr } from './dateUtils.js';

const CONFIG_KEY = 'planner_citacao_config';

// Item que cada box está mostrando agora — é o que o botão "Ver" abre no modal.
const itemExibido = { motivacional: null, devocional: null };

let tipoEmConfiguracao = null;
let getDataDoDiaAberto = () => '';
let el = {};

// Acha o marco vigente numa data: o de maior dataInicio que não seja no futuro.
// Em empate de data, o último inserido no array vence (mesma data, trocado de novo).
export function resolveCitacaoMarker(markers, dateStr) {
    if (!markers || markers.length === 0) return { modo: 'aleatorio', id: null };
    let best = null;
    markers.forEach(m => {
        if (m.dataInicio <= dateStr && (!best || m.dataInicio >= best.dataInicio)) best = m;
    });
    return best || { modo: 'aleatorio', id: null };
}

async function addCitacaoMarker(tipo, modo, id = null) {
    const cfg = await StorageService.get(CONFIG_KEY) || {};
    if (!cfg[tipo]) cfg[tipo] = [];
    cfg[tipo].push({ modo, id, dataInicio: toLocalDateStr(new Date()) });
    await StorageService.set(CONFIG_KEY, cfg);
}

// Desenha o box (motivacional ou devocional) para a data da Visão Diária aberta.
export async function renderCitacaoWidget(tipo, dateStr) {
    const container = document.getElementById(`widget-container-${tipo}`);
    const contentEl = document.getElementById(`widget-${tipo}-content`);
    if (!container || !contentEl) return;

    const cfg = await StorageService.get(CONFIG_KEY) || {};
    const marker = resolveCitacaoMarker(cfg[tipo], dateStr);

    container.style.display = 'flex';

    // Omitir: o box não some — vira uma faixa mínima (título + engrenagem + aviso),
    // porque a engrenagem é o único caminho para desfazer (pendencias.md 1.9).
    container.classList.toggle('citacao-omitida', marker.modo === 'omitir');
    if (marker.modo === 'omitir') {
        const desde = marker.dataInicio.split('-').reverse().slice(0, 2).join('/');
        contentEl.innerHTML = `<span class="citacao-omitida-aviso">Oculto desde ${desde}</span>`;
        itemExibido[tipo] = null;
        return;
    }

    const list = tipo === 'motivacional'
        ? await window.ContentService.getMotivacionalList()
        : await window.ContentService.getDevocionalList();

    let item = null;
    if (marker.modo === 'fixada') {
        item = list.find(i => String(i.id) === String(marker.id)) || null;
        if (!item) {
            contentEl.innerHTML = `
                <p class="text-xs text-red-500 mb-2">⚠️ A mensagem fixada (ID ${esc(marker.id)}) não foi encontrada — pode ter sido excluída.</p>
                <button class="btn-citacao-gear-inline text-xs underline text-[var(--primary-color)]" data-tipo="${tipo}">⚙️ Escolher outra</button>
            `;
            itemExibido[tipo] = null;
            return;
        }
    } else {
        // Aleatório: sorteia uma mensagem a cada carregamento do dia.
        if (list.length === 0) {
            contentEl.innerHTML = "<span class='italic opacity-50'>Base de dados vazia ou buscando...</span>";
            itemExibido[tipo] = null;
            return;
        }
        item = list[Math.floor(Math.random() * list.length)];
    }
    itemExibido[tipo] = item;

    const label = tipo === 'motivacional' ? '✨ Ver Citação do Dia' : '🙏 Ver Devocional do Dia';
    const badge = marker.modo === 'fixada' ? '📌 Fixada' : '🎲 Aleatório';
    contentEl.innerHTML = `
        <button class="btn-citacao-ver w-full text-left border border-[var(--primary-color)] rounded px-3 py-2 text-sm font-semibold text-[var(--primary-color)] hover:bg-[var(--bg-panel)] transition" data-tipo="${tipo}">${label}</button>
        <div class="text-[10px] mt-1 opacity-50 text-center tracking-widest">${badge}</div>
    `;
}

function openCitacaoModal(tipo, item) {
    const titleEl = document.getElementById('citacao-modal-title');
    const bodyEl = document.getElementById('citacao-modal-body');
    if (tipo === 'motivacional') {
        titleEl.textContent = '✨ Citação Motivacional';
        bodyEl.innerHTML = `<p class="italic text-base">"${esc(item.citacao)}"</p><p class="text-right font-semibold mt-3">- ${esc(item.autor)}</p>`;
    } else {
        titleEl.textContent = '🙏 Devocional';
        bodyEl.innerHTML = `<p class="font-semibold">${esc(item.passagem)}</p><p class="mt-2 whitespace-pre-wrap">${esc(item.reflexao)}</p>`;
    }
    el.citacaoModal.classList.remove('hidden');
}

// O modal de configuração sempre edita "a partir de hoje (data real)", seja qual for o
// dia aberto na tela — por isso usa new Date(), e não a data do dia visualizado.
async function openCitacaoConfigModal(tipo) {
    tipoEmConfiguracao = tipo;
    document.getElementById('citacao-config-title').textContent = tipo === 'motivacional' ? '⚙️ Configurar Citação' : '⚙️ Configurar Devocional';

    const hojeStr = toLocalDateStr(new Date());
    const hojeBr = hojeStr.split('-').reverse().join('/');
    el.vigencia.textContent = `A escolha abaixo vale a partir de hoje (${hojeBr}). Dias anteriores continuam como estavam.`;

    const cfg = await StorageService.get(CONFIG_KEY) || {};
    const markerHoje = resolveCitacaoMarker(cfg[tipo], hojeStr);

    el.configModal.querySelectorAll('input[name="citacao-config-modo"]').forEach(r => {
        r.checked = (r.value === markerHoje.modo);
    });
    el.idInput.value = markerHoje.modo === 'fixada' ? (markerHoje.id || '') : '';
    el.idWrap.classList.toggle('hidden', markerHoje.modo !== 'fixada');
    el.idError.classList.add('hidden');

    el.configModal.classList.remove('hidden');
}

async function salvarConfiguracao() {
    const tipo = tipoEmConfiguracao;
    const modoSelecionado = el.configModal.querySelector('input[name="citacao-config-modo"]:checked');
    if (!modoSelecionado) return;
    const modo = modoSelecionado.value;

    let id = null;
    if (modo === 'fixada') {
        id = el.idInput.value.trim();
        if (!id) {
            el.idError.textContent = 'Informe o ID da mensagem.';
            el.idError.classList.remove('hidden');
            return;
        }
        const item = tipo === 'motivacional'
            ? await window.ContentService.getMotivacionalById(id)
            : await window.ContentService.getDevocionalById(id);
        if (!item) {
            el.idError.textContent = `Nenhuma mensagem encontrada com o ID "${id}".`;
            el.idError.classList.remove('hidden');
            return;
        }
    }

    await addCitacaoMarker(tipo, modo, id);
    el.configModal.classList.add('hidden');
    const dataDoDia = getDataDoDiaAberto();
    if (dataDoDia) await renderCitacaoWidget(tipo, dataDoDia);
}

// Registra os listeners dos boxes e dos dois modais. Chamar uma vez, no boot.
// getDataDoDiaAberto: () => 'AAAA-MM-DD' do dia aberto na Visão Diária ('' se nenhum),
// usada para redesenhar o box depois de salvar a configuração.
export function initCitacao(opcoes = {}) {
    if (opcoes.getDataDoDiaAberto) getDataDoDiaAberto = opcoes.getDataDoDiaAberto;

    el = {
        citacaoModal: document.getElementById('global-citacao-modal'),
        configModal: document.getElementById('global-citacao-config-modal'),
        idWrap: document.getElementById('citacao-config-id-wrap'),
        idInput: document.getElementById('citacao-config-id-input'),
        idError: document.getElementById('citacao-config-id-error'),
        vigencia: document.getElementById('citacao-config-vigencia')
    };

    // Clique no botão do box (delegado, já que o botão é recriado a cada render)
    document.addEventListener('click', (e) => {
        const btnVer = e.target.closest('.btn-citacao-ver');
        if (btnVer) {
            const tipo = btnVer.dataset.tipo;
            if (itemExibido[tipo]) openCitacaoModal(tipo, itemExibido[tipo]);
            return;
        }
        const btnGearInline = e.target.closest('.btn-citacao-gear-inline');
        if (btnGearInline) {
            openCitacaoConfigModal(btnGearInline.dataset.tipo);
        }
    });

    document.querySelectorAll('.btn-citacao-gear').forEach(btn => {
        btn.addEventListener('click', () => openCitacaoConfigModal(btn.dataset.tipo));
    });

    document.querySelectorAll('.btn-close-citacao').forEach(btn => {
        btn.addEventListener('click', () => el.citacaoModal.classList.add('hidden'));
    });

    el.configModal.querySelectorAll('input[name="citacao-config-modo"]').forEach(r => {
        r.addEventListener('change', () => {
            el.idWrap.classList.toggle('hidden', r.value !== 'fixada' || !r.checked);
        });
    });

    document.querySelectorAll('.btn-close-citacao-config').forEach(btn => {
        btn.addEventListener('click', () => el.configModal.classList.add('hidden'));
    });

    document.getElementById('btn-citacao-config-save').addEventListener('click', salvarConfiguracao);
}
