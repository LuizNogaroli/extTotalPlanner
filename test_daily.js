const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost/', pretendToBeVisual: true });
const { window } = dom;

const erros = [];
window.addEventListener('error', e => erros.push('window.error: ' + (e.error ? e.error.stack : e.message)));
process.on('unhandledRejection', (r) => erros.push('unhandledRejection: ' + r));
window.confirm = () => true;
window.alert = (m) => { window.__lastAlert = m; };

function read(p){ return fs.readFileSync(p, 'utf8'); }
function strip(code){
  return code
    .replace(/^\s*import\s+.*?;\s*$/gm, '')
    .replace(/\bexport\s+(class|const|function|let|async|default)\s+/g, '$1 ');
}
const files = [
  'js/services/StorageService.js','js/services/ThemeService.js','js/services/I18nService.js',
  'js/services/NotificationService.js','js/services/ContentService.js','js/dragAndDrop.js',
  'js/modules/formMappers.js','js/modules/formValidators.js','js/modules/formLoaders.js',
  'js/modules/crudModal.js','js/app.js',
];
let combined = files.map(f => '/* === ' + f + ' === */\n' + strip(read(f))).join('\n;\n');
window.eval(combined);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

setTimeout(async () => {
  try {
    const doc = window.document;
    const daily = doc.getElementById('daily-view-wrapper');
    const weekly = doc.getElementById('weekly-view-wrapper');

    // 1) SEMEAR atividades (usa datas UTC via toISOString)
    if (window.seedDemoAtividades) await window.seedDemoAtividades();

    // descobrir layout atual
    const grid = doc.getElementById('weekly-grid');
    const layoutUsado = grid.className.includes('grid-cols-7') ? 'grid'
      : grid.className.includes('flex flex-col') ? 'stacked'
      : (grid.className.includes('grid-cols-2') || grid.className.includes('grid-cols-4') ? 'compact' : '?');
    console.log('Layout renderizado:', layoutUsado);

    // data de hoje (local) no formato YYYY-MM-DD
    const hoje = new Date();
    const ds = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
    console.log('dataStr de hoje (local):', ds);

    // 2) SIMULAR CLIQUE real no NOME do dia (layout acordeao - era o bug)
    const _orig = window.appRouter.goDaily;
    let _chamou = 0;
    window.appRouter.goDaily = (...a) => { _chamou++; console.log('>>> goDaily chamado (vez', _chamou, ')'); return _orig(...a); };
    const diaName = doc.querySelector('#weekly-grid details .day-title-open');
    console.log('Nome do dia (.day-title-open) encontrado?', !!diaName, '| tag:', diaName && diaName.tagName);
    if (diaName) diaName.addEventListener('click', () => console.log('PROBE: clique chegou no span'));
    if (diaName) diaName.click();
    console.log('goDaily foi chamado pelo clique?', _chamou > 0);
    await new Promise(r => setTimeout(r, 150));
    console.log('APOS CLIQUE NOME -> weekly hidden:', weekly.classList.contains('hidden'), '| daily hidden:', daily.classList.contains('hidden'));

    // 3) CHAMADA DIRETA goDaily para comparar
    if (window.appRouter && window.appRouter.goDaily) window.appRouter.goDaily(new Date());
    await new Promise(r => setTimeout(r, 150));
    console.log('APOS goDaily DIRETO -> weekly hidden:', weekly.classList.contains('hidden'), '| daily hidden:', daily.classList.contains('hidden'));
    const content = doc.getElementById('day-modal-content');
    console.log('day-modal-content length:', content ? content.innerHTML.length : 'NULL');
    console.log('contem atividade semeada?', content ? /Revisar relat/.test(content.innerHTML) : false);
    console.log('contem "Sem tarefas"?', content ? /Sem tarefas/.test(content.innerHTML) : false);
    console.log('ERROS:', erros.length); erros.slice(0,5).forEach(e=>console.log('  -',e));
  } catch (e) { console.log('RUNTIME:', e.stack); }
}, 600);
