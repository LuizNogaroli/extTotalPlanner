/**
 * dateUtils.js — Utilitários de data e de período (ano / mês / semana).
 *
 * Funções puras: não tocam no DOM nem em estado compartilhado. Extraídas do js/app.js
 * na Fase 1 do plano de refatoração (docs/plano_refatoracao_appjs.md), sem mudança de
 * lógica.
 *
 * Convenções usadas no app inteiro:
 *  - A semana vai de DOMINGO a sábado (getWeekDates, getWeekNumber, chave "AAAA-wSS").
 *  - Chaves de período: ano "2026", mês "2026-09", semana "2026-w39".
 */

// Número da semana no ano, contando a partir da semana que contém o 1º de janeiro.
export function getWeekNumber(targetDate) {
    const date = new Date(targetDate.valueOf());
    const jan1 = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - jan1) / 86400000;
    const jan1Day = jan1.getDay();
    return Math.ceil((pastDaysOfYear + jan1Day + 1) / 7);
}

// Os 7 dias (domingo a sábado) da semana que contém `date`.
export function getWeekDates(date = new Date()) {
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

// Deriva a chave do período (ano, mês ou semana) a partir de um timestamp.
// Semana usa o mesmo cálculo (domingo-sábado) de getWeekNumber()/getWeekDates(),
// para não ter duas numerações de semana no app.
export function getPeriodoKey(timestamp, granularidade) {
    const d = new Date(timestamp);
    if (granularidade === 'mes') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (granularidade === 'semana') {
        const sunday = getWeekDates(d)[0];
        const weekNum = getWeekNumber(sunday);
        return `${sunday.getFullYear()}-w${String(weekNum).padStart(2, '0')}`;
    }
    return String(d.getFullYear());
}

// Rótulo legível do período, ex.: "2026", "Setembro de 2026" ou "Semana 38 de 2026".
export function getPeriodoLabel(key, granularidade) {
    if (granularidade === 'mes') {
        const [ano, mes] = key.split('-');
        const nome = new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return nome.charAt(0).toUpperCase() + nome.slice(1);
    }
    if (granularidade === 'semana') {
        const [ano, wpart] = key.split('-w');
        return `Semana ${Number(wpart)} de ${ano}`;
    }
    return key;
}

// Domingo (início) da semana representada por uma chave "2026-w38", aproximado a
// partir do 1º de janeiro — mesmo esquema de contagem de getWeekNumber().
export function getDataDaSemana(semanaKey) {
    const [anoStr, wpart] = semanaKey.split('-w');
    const weekNum = Number(wpart);
    const jan1 = new Date(Number(anoStr), 0, 1);
    const sunday = new Date(jan1);
    sunday.setDate(jan1.getDate() + (weekNum - 1) * 7 - jan1.getDay());
    return sunday;
}

// Deriva a chave de ano e de mês a partir de uma chave de semana (ex.: "2026-w38"),
// usada pelo breadcrumb de período para saber a que ano/mês uma semana pertence.
export function getPeriodoPaiKeys(semanaKey) {
    const sunday = getDataDaSemana(semanaKey);
    return {
        ano: getPeriodoKey(sunday.getTime(), 'ano'),
        mes: getPeriodoKey(sunday.getTime(), 'mes')
    };
}

// Todas as chaves de semana (domingo-sábado) que tocam um mês, na ordem em que ocorrem.
export function getSemanasDoMes(mesKey) {
    const [ano, mes] = mesKey.split('-').map(Number);
    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);
    const semanas = [];
    const vistos = new Set();
    const d = new Date(primeiroDia);
    while (d <= ultimoDia) {
        const key = getPeriodoKey(d.getTime(), 'semana');
        if (!vistos.has(key)) {
            vistos.add(key);
            semanas.push(key);
        }
        d.setDate(d.getDate() + 1);
    }
    return semanas;
}

// Rótulo curto de semana para o mobile-trigger do breadcrumb, onde o espaço é
// realmente apertado: "Sem. 38" (sem o ano, que já aparece no primeiro segmento).
export function semanaLabelCompacto(semanaKey) {
    return `Sem. ${Number(semanaKey.split('-w')[1])}`;
}

// Rótulo completo sem o ano (que já aparece no primeiro segmento do breadcrumb) —
// usado no crumb principal e nos dropdowns do desktop, onde há espaço de sobra.
export function semanaLabelSemAno(semanaKey) {
    return `Semana ${Number(semanaKey.split('-w')[1])}`;
}
