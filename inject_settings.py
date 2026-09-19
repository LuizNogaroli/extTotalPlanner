import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

settings_html = """
                        <div>
                            <h3 class="font-bold text-lg mb-2">Aparência e Layout</h3>
                            <div class="space-y-2">
                                <button id="btn-theme-toggle" class="px-4 py-2 bg-[var(--border-color)] rounded">Alternar Tema</button>
                            </div>
                            <div class="space-y-2 mt-4">
                                <button id="btn-layout-grid" class="px-4 py-2 bg-[var(--border-color)] rounded">Grade Normal</button>
                                <button id="btn-layout-stacked" class="px-4 py-2 bg-[var(--border-color)] rounded">Lista Acordeão</button>
                                <button id="btn-layout-compact-grid" class="px-4 py-2 bg-[var(--border-color)] rounded">Grade Compacta</button>
                                <button id="btn-layout-compact-stacked" class="px-4 py-2 bg-[var(--border-color)] rounded">Lista Compacta</button>
                            </div>
                        </div>
                        <div id="global-day-modal" class="hidden"></div>
                        <div id="day-modal-title" class="hidden"></div>
"""

# Insert inside view-settings, just before "Painéis Ativos"
html = html.replace('<h3 class="font-bold text-lg mb-2">Painéis Ativos</h3>', settings_html + '\n<h3 class="font-bold text-lg mb-2">Painéis Ativos</h3>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Settings injected")
