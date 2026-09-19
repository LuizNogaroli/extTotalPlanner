const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');

// We need to move weekNum, firstDay, lastDay, currentYear calculation to right after dates = getWeekDates(baseDate);
const moveRegex = r"const weekNum = getWeekNumber\(dates\[0\]\);\s*const firstDay = [^\n]*\n\s*const lastDay = [^\n]*\n\s*const currentYear = dates\[0\]\.getFullYear\(\);\s*document\.getElementById\('current-week-display'\)\.textContent = `w\$\{String\(weekNum\)\.padStart\(2, '0'\)\} \(\$\{firstDay\} a \$\{lastDay\}\) - \$\{currentYear\}`;"

// Oh, I will just manually fix the JS script using Python regex.
