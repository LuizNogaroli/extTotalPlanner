import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

missing_views = """
                <!-- Tela de Estatísticas -->
                <div id="view-reports" class="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full hidden flex-col h-full">
                    <h2 class="text-2xl font-bold mb-6 text-[var(--primary-color)] border-b border-[var(--border-color)] pb-3">Relatórios</h2>
                    <div id="report-content-area"></div>
                    <div id="report-content-body"></div>
                    <h3 id="report-content-title"></h3>
                </div>

                <!-- Tela de Estratégias -->
                <div id="view-strategic" class="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full hidden flex-col h-full">
                    <div id="strategic-content-cards"></div>
                </div>

                <!-- Tela de Exportação -->
                <div id="view-export" class="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full hidden flex-col h-full">
                </div>
"""

# Insert right after view-settings
html = html.replace('</div> <!-- Close view-dashboard -->', '</div>\n' + missing_views + '\n</div> <!-- Close view-dashboard -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Missing views injected!")
