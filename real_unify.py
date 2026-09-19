import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We want to remove top-tabs-container from view-dashboard
html = re.sub(r'<!-- TAB BAR DE NAVEGAÇÃO -->\s*<div id="top-tabs-container"[^>]*>.*?</div>', '', html, flags=re.DOTALL)

# And rewrite the <header> to include the tabs.
old_header_regex = r'<header class="h-16 border-b border-\[var\(--border-color\)\] flex items-center justify-between px-6 bg-\[var\(--bg-panel\)\] flex-shrink-0">.*?</header>'

new_header = """<header class="border-b border-[var(--border-color)] px-6 bg-[var(--bg-panel)] flex-shrink-0 pt-3">
            <div class="flex items-center justify-between pb-2">
                <div class="flex items-center space-x-3">
                    <button id="btn-toggle-sidebar" class="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition focus:outline-none p-1 -ml-2" title="Menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <h2 class="text-xl font-bold truncate hidden sm:block" id="main-view-title">Visão Semanal</h2>
                    <span id="current-week-display" class="text-[var(--text-secondary)] text-sm hidden md:block"></span>
                </div>
                <div class="flex items-center space-x-3">
                    <button id="btn-theme-toggle" title="Alternar Tema" class="p-2 rounded text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--primary-color)] transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    </button>
                    <button class="text-sm border border-[var(--border-color)] text-[var(--text-secondary)] px-3 py-2 rounded hover:bg-[var(--border-color)] transition shadow-sm flex items-center space-x-1" title="Gerar Relatório A4 da Semana">
                        <span>🖨️</span> <span class="hidden md:inline">Relatório</span>
                    </button>
                    <button id="btn-new-activity" class="bg-[var(--primary-color)] text-white px-4 py-2 rounded hover:bg-[var(--primary-hover)] transition shadow-sm" data-i18n="newActivity">+ Nova Atividade</button>
                </div>
            </div>
            <!-- ABAS HORIZONTAIS -->
            <div id="top-tabs-container" class="flex space-x-2 overflow-x-auto pt-2" style="scrollbar-width: none;"></div>
        </header>"""

html = re.sub(old_header_regex, new_header, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Header actually unified")
