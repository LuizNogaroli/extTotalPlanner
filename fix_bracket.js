const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');
const lines = js.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Destaque visual')) {
        // We know around here is where the problem is.
        // Let's check 3 lines above.
        if (lines[i-3].trim() === '}' && lines[i-4].includes('</div>`;')) {
            // We need to insert '});' before '}'
            lines.splice(i-3, 0, '            });');
            break;
        }
    }
}

fs.writeFileSync('js/app.js', lines.join('\n'), 'utf8');
console.log('Fixed missing });');
