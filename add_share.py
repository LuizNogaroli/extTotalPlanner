import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add a share button and share function
# Wait, I can just use a global function or an inline onclick
share_func = """<button title="Compartilhar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="navigator.clipboard.writeText('${a.title}\\n${a.desc || \\'\\'}'); window.NotificationService && window.NotificationService.show('Copiado para a área de transferência!'); event.stopPropagation();">🔗 Compartilhar</button>"""

old_buttons = """<button title="Visualizar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openViewModal(JSON.parse(decodeURIComponent('${enc}')))">👁️ Ver</button>
                                <button title="Editar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openModal('atividade', JSON.parse(decodeURIComponent('${enc}')))">✏️ Editar</button>"""

new_buttons = old_buttons + "\n                                " + share_func

js = js.replace(old_buttons, new_buttons)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Added share button")
