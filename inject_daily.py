daily_content = """
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 h-full min-h-full">
                        <!-- COLUNA PRINCIPAL: PENDÊNCIAS/ATIVIDADES -->
                        <div class="md:col-span-3 flex flex-col space-y-4">
                            <div class="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                                <h4 class="font-bold text-lg text-[var(--text-primary)] flex items-center space-x-2">
                                    <span>📅 Pendências do Dia</span>
                                </h4>
                                <button id="btn-day-modal-new" class="print-hide text-xs bg-[var(--primary-color)] text-white px-3 py-1.5 rounded hover:bg-[var(--primary-hover)] transition shadow-sm font-bold">+ Nova Atividade</button>
                            </div>
                            <div id="day-modal-content" class="flex-1 space-y-3 mb-6">
                                <!-- Atividades injetadas aqui via JS -->
                            </div>
                        </div>

                        <!-- COLUNA LATERAL: WIDGETS E MÓDULOS -->
                        <div class="md:col-span-2 space-y-6 flex flex-col">
                            
                            <!-- WIDGET: HÁBITOS -->
                            <div id="widget-habitos-container" class="border border-[var(--border-color)] rounded p-4 bg-[var(--bg-color)] hidden">
                                <div class="flex justify-between items-center mb-3 border-b border-[var(--border-color)] pb-2">
                                    <h4 class="font-bold text-[var(--primary-color)] flex items-center space-x-2">
                                        <span>✔️ Hábitos</span>
                                    </h4>
                                    <button id="btn-save-all-habits" class="text-xs bg-[var(--primary-color)] text-white px-2 py-1 rounded">Salvar Todos</button>
                                </div>
                                <div id="habitos-form-area" class="space-y-3"></div>
                            </div>

                            <!-- WIDGET: DIÁRIO -->
                            <div id="widget-journal-container" class="border border-[var(--border-color)] rounded p-4 bg-[var(--bg-color)] flex flex-col h-64">
                                <div class="flex justify-between items-center mb-2">
                                    <h4 class="font-bold text-[var(--primary-color)] flex items-center space-x-2">
                                        <span>📖 Diário</span>
                                    </h4>
                                    <button id="btn-report-journal" class="text-xs text-[var(--text-secondary)]">Gerar Relatório</button>
                                </div>
                                <span id="journal-save-status" class="text-xs text-green-500 mb-2 block h-4"></span>
                                <textarea id="daily-journal-input" class="w-full flex-1 border border-[var(--border-color)] rounded p-2 bg-[var(--bg-panel)] text-sm resize-none" placeholder="Escreva como foi seu dia..."></textarea>
                            </div>

                            <!-- WIDGET: HISTÓRICO -->
                            <div id="widget-container-historico" class="border border-[var(--border-color)] rounded p-4 bg-[var(--bg-color)] hidden">
                                <h4 class="font-bold text-sm text-[var(--primary-color)] mb-2 uppercase tracking-wider">📜 Fatos do Dia</h4>
                                <ul id="widget-historico-content" class="text-sm space-y-2"></ul>
                            </div>

                            <!-- WIDGET: MOTIVACIONAL -->
                            <div id="widget-container-motivacional" class="border border-[var(--border-color)] rounded p-4 bg-[var(--bg-color)] hidden">
                                <h4 class="font-bold text-sm text-[var(--primary-color)] mb-2 uppercase tracking-wider">✨ Citação</h4>
                                <div id="widget-motivacional-content" class="text-sm italic border-l-4 border-[var(--primary-color)] pl-3 py-1"></div>
                            </div>

                            <!-- WIDGET: DEVOCIONAL -->
                            <div id="widget-container-devocional" class="border border-[var(--border-color)] rounded p-4 bg-[var(--bg-color)] hidden">
                                <h4 class="font-bold text-sm text-[var(--primary-color)] mb-2 uppercase tracking-wider">🙏 Devocional</h4>
                                <div id="widget-devocional-content" class="text-sm"></div>
                            </div>

                            <!-- WIDGET: COMPRAS -->
                            <div id="widget-container-compras" class="border border-[var(--border-color)] rounded p-4 bg-[var(--bg-color)] hidden">
                                <h4 class="font-bold text-sm text-[var(--primary-color)] mb-2 uppercase tracking-wider">🛒 Compras</h4>
                                <ul id="widget-compras-content" class="text-sm space-y-2"></ul>
                            </div>

                        </div>
                    </div>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace empty <div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col"> \n </div>
# with the content.

import re
pattern = r'<div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col">\s*</div>'
replacement = f'<div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col">\n{daily_content}\n</div>'

new_html = re.sub(pattern, replacement, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Daily view injected!")
