import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the broken string
broken_btn = """<button title="Compartilhar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="navigator.clipboard.writeText('${a.title}\\n${a.desc || \\'\\'}'); window.NotificationService && window.NotificationService.show('Copiado para a área de transferência!'); event.stopPropagation();">🔗 Compartilhar</button>"""

fixed_btn = """<button title="Compartilhar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="navigator.clipboard.writeText(decodeURIComponent('${enc}').replace(/.*\\"title\\":\\"([^\\"]+)\\".*/, '$1')); window.NotificationService && window.NotificationService.show('Copiado!'); event.stopPropagation();">🔗 Compartilhar</button>"""

# Actually, I can just use a function inside window.appRouter.share
share_logic = """
    share: (data) => {
        const text = data.title + '\\n' + (data.desc || '');
        navigator.clipboard.writeText(text);
        if(window.NotificationService) window.NotificationService.show('Copiado para a área de transferência!');
    },
"""
# inject share_logic into window.appRouter
if "share: (data)" not in js:
    js = js.replace('openManager: openManager', 'openManager: openManager,\n' + share_logic)

fixed_btn2 = """<button title="Compartilhar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.share(JSON.parse(decodeURIComponent('${enc}'))); event.stopPropagation();">🔗 Compartilhar</button>"""

js = js.replace(broken_btn, fixed_btn2)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Syntax fixed")
