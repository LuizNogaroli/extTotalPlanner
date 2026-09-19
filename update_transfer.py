import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add transferActivity to appRouter
transfer_logic = """
    transferActivity: (id) => {
        const input = document.createElement('input');
        input.type = 'date';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        document.body.appendChild(input);
        
        input.addEventListener('change', async (e) => {
            const newDate = e.target.value;
            if(newDate) {
                const acts = await StorageService.get('planner_activities') || [];
                const idx = acts.findIndex(a => a.id === id);
                if(idx !== -1) {
                    acts[idx].date = newDate;
                    await StorageService.set('planner_activities', acts);
                    if(window.NotificationService) window.NotificationService.show("Atividade transferida com sucesso!");
                    setTimeout(() => window.location.reload(), 500);
                }
            }
            document.body.removeChild(input);
        });
        
        input.addEventListener('cancel', () => { document.body.removeChild(input); });
        
        try {
            input.showPicker();
        } catch (err) {
            // Fallback for older browsers
            const fallbackDate = prompt("Transferir para qual data? (YYYY-MM-DD)");
            if (fallbackDate && /^\\d{4}-\\d{2}-\\d{2}$/.test(fallbackDate)) {
                input.value = fallbackDate;
                input.dispatchEvent(new Event('change'));
            } else if (fallbackDate) {
                alert("Formato inválido.");
            }
            if (document.body.contains(input)) document.body.removeChild(input);
        }
    },
"""

if "transferActivity:" not in js:
    js = js.replace('openManager: openManager,', 'openManager: openManager,\n' + transfer_logic)

# Replace Compartilhar button with Transferir
# Button code: 
# <button title="Compartilhar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.share(JSON.parse(decodeURIComponent('${enc}'))); event.stopPropagation();">🔗 Compartilhar</button>

old_btn = """<button title="Compartilhar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.share(JSON.parse(decodeURIComponent('${enc}'))); event.stopPropagation();">🔗 Compartilhar</button>"""
new_btn = """<button title="Transferir" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.transferActivity('${a.id}'); event.stopPropagation();">➡️ Transferir</button>"""

js = js.replace(old_btn, new_btn)

# Wait, if there are two occurrences (in openDailyView and renderWeeklyGrid)
# Actually, the string replacement will replace ALL occurrences by default in python!

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Transfer button added")
