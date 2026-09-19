import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I will replace the CABEÇALHO and the top-tabs-container with a unified block.
# Since it's multiline, I'll use regex to match from "<!-- CABEÇALHO -->" to the end of top-tabs-container.

regex = r'<!-- CABEÇALHO -->.*?<div id="top-tabs-container"[^>]*>.*?</div>'

unified_header = """<!-- CABEÇALHO UNIFICADO -->
                <div class="mb-4 border-b border-[var(--border-color)]">
                    <div class="flex flex-col md:flex-row md:justify-between md:items-end pb-3 space-y-4 md:space-y-0">
                        <div>
                            <h2 class="text-2xl md:text-3xl font-black text-[var(--primary-color)] tracking-tight" id="main-view-title">Visão Semanal</h2>
                            <p id="current-week-display" class="text-[var(--text-secondary)] mt-1 font-medium text-sm">Carregando...</p>
                        </div>
                        <div class="flex items-center space-x-2">
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
                            <button id="btn-new-activity" class="bg-[var(--primary-color)] text-white px-4 py-2 rounded font-bold shadow hover:opacity-90 transition flex items-center space-x-2">
                                <span class="text-lg leading-none">+</span>
                                <span class="hidden md:inline">Nova Atividade</span>
                            </button>
                        </div>
                    </div>
                    <!-- ABAS EMBUTIDAS NO CABEÇALHO -->
                    <div id="top-tabs-container" class="flex space-x-2 overflow-x-auto pt-1 pb-0.5" style="scrollbar-width: none;"></div>
                </div>"""

html = re.sub(regex, unified_header, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Header unified")
