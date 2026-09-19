const fs = require('fs');

let js = fs.readFileSync('js/app.js', 'utf8');
const lines = js.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Destaque visual') && i > 1200) {
        // Line i is '// Destaque visual'
        // Line i-1 is '        '
        // Line i-2 is '        }'
        // Line i-3 is '                    </div>`;'
        
        // We need to replace lines[i-2] with:
        //             });
        //         } else {
        //             activitiesHTML = '<div class="text-xs text-[var(--text-secondary)] text-center mt-4 italic">Sem tarefas</div>';
        //         }
        lines[i-2] = `            });
        } else {
            activitiesHTML = '<div class="text-xs text-[var(--text-secondary)] text-center mt-4 italic">Sem tarefas</div>';
        }`;
        break;
    }
}

fs.writeFileSync('js/app.js', lines.join('\n'), 'utf8');
console.log('Fixed missing blocks');
