import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update Header Structure to center the tabs
old_header_regex = r'<header class="border-b border-\[var\(--border-color\)\] px-4 bg-\[var\(--bg-panel\)\] flex-shrink-0 py-2">.*?</header>'

new_header = """<header class="border-b border-[var(--border-color)] px-4 bg-[var(--bg-panel)] flex-shrink-0 py-2">
            <div class="flex items-center justify-between w-full">
                <!-- Esquerda (Menu) -->
                <div class="flex items-center flex-1">
                    <button id="btn-toggle-sidebar" class="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition focus:outline-none p-1 mr-2 flex-shrink-0" title="Menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <span id="current-week-display" class="hidden"></span>
                    <h2 id="main-view-title" class="hidden"></h2>
                </div>
                
                <!-- Centro (TABS) -->
                <div class="flex justify-center flex-[2] md:flex-[3] overflow-x-auto" style="scrollbar-width: none;">
                    <div id="dynamic-header-tabs" class="flex items-center space-x-2"></div>
                </div>
                
                <!-- Direita (Ações) -->
                <div class="flex items-center justify-end flex-1 space-x-2">
                    <button id="btn-theme-toggle" title="Alternar Tema" class="p-2 rounded text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--primary-color)] transition hidden sm:block">
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
                    <button class="text-sm border border-[var(--border-color)] text-[var(--text-secondary)] px-3 py-1.5 rounded hover:bg-[var(--border-color)] transition shadow-sm items-center space-x-1 hidden md:flex" title="Gerar Relatório A4 da Semana">
                        <span>🖨️</span> <span>Relatório</span>
                    </button>
                    <button id="btn-new-activity" class="bg-[var(--primary-color)] text-white px-3 py-1.5 rounded hover:bg-[var(--primary-hover)] transition shadow-sm text-sm font-bold whitespace-nowrap">+ Novo</button>
                </div>
            </div>
        </header>"""

html = re.sub(old_header_regex, new_header, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# Update app.js for uppercase -> capitalized
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace uppercase with capitalize, and increase text-[9px] to text-[10px]
js = js.replace('<span class="text-[9px] uppercase tracking-wider', '<span class="text-[11px] capitalize font-medium tracking-wide')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Header centered and uppercase removed")
