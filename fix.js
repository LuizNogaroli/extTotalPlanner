const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace(/const dates = getWeekDates\(baseDate\);\s+grid\.innerHTML = '';/, `const dates = getWeekDates(baseDate);
    grid.innerHTML = '';
    const weekNum = getWeekNumber(dates[0]);`);

js = js.replace(/const weekNum = getWeekNumber\(dates\[0\]\);\s*const firstDay/, 'const firstDay');

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('Fixed ReferenceError');
