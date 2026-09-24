/**
 * listLabels.js - Formatadores de rótulo para cada tipo no gerenciador de listas
 *
 * Cada função recebe um item e retorna o texto a exibir na lista.
 * Extraído de `renderManagerList()` (js/app.js, Fase 3 da refatoração).
 */

function formatHistorico(item) {
    return `[${item.date}] ${item.fato.substring(0, 40)}...`;
}

function formatMotivacional(item) {
    return `"${item.citacao.substring(0, 40)}..." - ${item.autor}`;
}

function formatDevocional(item) {
    return `${item.passagem}: ${item.reflexao.substring(0, 30)}...`;
}

function formatCompras(item) {
    const cat = item.categoria ? `[${item.categoria}] ` : '';
    return `${cat}${item.item} (${item.detalhes || 'Sem detalhes'})`;
}

function formatEstrategia(item) {
    const mapType = {
        'missao': 'Missão',
        'visao': 'Visão',
        'valores': 'Valores',
        'obj_curto': 'Curto Prazo',
        'obj_medio': 'Médio Prazo',
        'obj_longo': 'Longo Prazo'
    };
    const dt = item.date ? `[${item.date}] ` : '';
    return `${dt}[${mapType[item.type] || item.type}] ${item.content.substring(0, 40)}...`;
}

function formatHabito(item) {
    const cat = item.category ? `[${item.category}] ` : '';
    return `${cat}${item.question}`;
}

function formatAtividadeCategoria(item) {
    return item.nome;
}

function formatAlarme(item) {
    let recStr = 'Diário';
    if (item.recurrence === 'unico') recStr = `Dia ${item.date}`;
    else if (item.recurrence === 'semanal') {
        const daysMap = { '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb' };
        recStr = (item.weekdays || []).map(d => daysMap[d]).join(', ');
    }
    return `⏰ ${item.time} (${recStr}) - ${item.title}`;
}

export const listLabelFormatters = {
    historico: formatHistorico,
    motivacional: formatMotivacional,
    devocional: formatDevocional,
    compras: formatCompras,
    estrategia: formatEstrategia,
    habito: formatHabito,
    'atividade-categoria': formatAtividadeCategoria,
    alarme: formatAlarme
};

export function getListLabel(type, item) {
    const formatter = listLabelFormatters[type];
    return formatter ? formatter(item) : '';
}
