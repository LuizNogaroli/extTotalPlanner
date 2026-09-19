html_to_append = """
                <!-- Área de Configurações -->
                <div id="view-settings" class="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full hidden">
                    <h2 class="text-2xl font-bold mb-6 text-[var(--primary-color)] border-b border-[var(--border-color)] pb-3">Configurações do Sistema</h2>
                    <div class="space-y-8">
                        <div>
                            <h3 class="font-bold text-lg mb-2">Painéis Ativos</h3>
                            <div class="space-y-2">
                                <label><input type="checkbox" id="setting-widget-habitos"> Hábitos</label><br>
                                <label><input type="checkbox" id="setting-widget-historico"> Histórico</label><br>
                                <label><input type="checkbox" id="setting-widget-motivacional"> Motivacional</label><br>
                                <label><input type="checkbox" id="setting-widget-devocional"> Devocional</label><br>
                                <label><input type="checkbox" id="setting-widget-compras"> Compras</label><br>
                                <label><input type="checkbox" id="setting-widget-alarme"> Alarmes</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div> <!-- Close view-dashboard -->

            <!-- RODAPÉ DA TELA PRINCIPAL -->
        </main>
    </div>

    <!-- Modal Global de CRUD -->
    <div id="global-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="border border-[var(--border-color)] rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col max-h-[90vh]" style="background-color: var(--bg-panel);">
            <div class="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-3">
                <h3 id="modal-title" class="text-xl font-bold text-[var(--primary-color)]">Novo Item</h3>
                <button class="btn-cancel-modal text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xl">&times;</button>
            </div>
            <div class="flex-1 overflow-auto">
                <form id="form-atividade" class="space-y-4 hidden">
                    <input type="hidden" id="atividade-id">
                    <input type="hidden" id="atividade-created-at">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Título</label>
                        <input type="text" id="atividade-title" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Descrição</label>
                        <textarea id="atividade-desc" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Data</label>
                        <input type="date" id="atividade-date" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Status</label>
                        <select id="atividade-status" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                            <option value="livre">Livre</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Categoria</label>
                        <select id="atividade-category" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]"></select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Matriz Eisenhower</label>
                        <select id="atividade-eisenhower" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                            <option value="q1">Q1: Urgente e Importante (Resolva Urgente)</option>
                            <option value="q2">Q2: Importante, Não Urgente (Resolva Agora)</option>
                            <option value="q3">Q3: Urgente, Não Importante (Delegue a Atividade)</option>
                            <option value="q4">Q4: Não Urgente, Não Importante (Ignore, se possível)</option>
                        </select>
                    </div>
                    <div class="pt-4 border-t border-[var(--border-color)] flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border border-[var(--border-color)] rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-atividade-categoria" class="space-y-4 hidden">
                    <input type="hidden" id="atividade-categoria-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Nome</label>
                        <input type="text" id="atividade-categoria-nome" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border border-[var(--border-color)] rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-estrategia" class="space-y-4 hidden">
                    <input type="hidden" id="estrategia-id">
                    <input type="hidden" id="estrategia-date">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Tipo</label>
                        <select id="estrategia-type" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                            <option value="meta">Meta</option>
                            <option value="projeto">Projeto</option>
                            <option value="sonho">Sonho</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Conteúdo</label>
                        <input type="text" id="estrategia-content" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-habito" class="space-y-4 hidden">
                    <input type="hidden" id="habito-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Pergunta do Hábito</label>
                        <input type="text" id="habito-question" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Categoria</label>
                        <input type="text" id="habito-category" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-historico" class="space-y-4 hidden">
                    <input type="hidden" id="historico-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Data</label>
                        <input type="date" id="historico-date" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Fato</label>
                        <textarea id="historico-fato" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required></textarea>
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>
                
                <form id="form-alarme" class="space-y-4 hidden">
                    <input type="hidden" id="alarme-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Título</label>
                        <input type="text" id="alarme-title" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Hora</label>
                        <input type="time" id="alarme-time" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Recorrência</label>
                        <select id="alarme-recurrence" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                            <option value="diario">Diário</option>
                            <option value="unico">Único</option>
                        </select>
                    </div>
                    <div id="alarme-date-container">
                        <label class="block text-sm font-semibold mb-1">Data</label>
                        <input type="date" id="alarme-date" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                    </div>
                    <div id="alarme-weekdays-container" class="hidden"></div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-motivacional" class="space-y-4 hidden">
                    <input type="hidden" id="motivacional-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Citação</label>
                        <textarea id="motivacional-citacao" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Autor</label>
                        <input type="text" id="motivacional-autor" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-devocional" class="space-y-4 hidden">
                    <input type="hidden" id="devocional-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Passagem</label>
                        <input type="text" id="devocional-passagem" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Reflexão</label>
                        <textarea id="devocional-reflexao" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required></textarea>
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>

                <form id="form-compras" class="space-y-4 hidden">
                    <input type="hidden" id="compras-id">
                    <div>
                        <label class="block text-sm font-semibold mb-1">Item</label>
                        <input type="text" id="compras-item" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Detalhes</label>
                        <input type="text" id="compras-detalhes" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Categoria</label>
                        <input type="text" id="compras-categoria" class="w-full border border-[var(--border-color)] rounded p-2 bg-[var(--bg-color)]">
                    </div>
                    <div class="pt-4 flex justify-end space-x-2">
                        <button type="button" class="btn-cancel-modal px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" class="px-4 py-2 text-white bg-[var(--primary-color)] rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Global de Visualização -->
    <div id="global-view-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="border border-[var(--border-color)] rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col max-h-[90vh]" style="background-color: var(--bg-panel);">
            <div class="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-3">
                <h3 class="text-xl font-bold text-[var(--primary-color)]">Visualização</h3>
                <button class="btn-close-view text-[var(--text-secondary)] font-bold text-xl">&times;</button>
            </div>
            <div class="flex-1 overflow-auto space-y-4">
                <h4 id="view-title" class="font-bold text-lg"></h4>
                <div id="view-status" class="inline-block px-2 py-1 bg-gray-200 text-xs font-semibold rounded uppercase"></div>
                <div id="view-date" class="text-sm"></div>
                <div id="view-desc" class="text-sm whitespace-pre-wrap p-3 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"></div>
            </div>
        </div>
    </div>

    <!-- Modal Global de Gerenciamento -->
    <div id="global-manager-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="border border-[var(--border-color)] rounded-lg shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[85vh]" style="background-color: var(--bg-panel);">
            <div class="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-3">
                <h3 id="manager-modal-title" class="text-xl font-bold text-[var(--primary-color)]">Gerenciar</h3>
                <button class="btn-cancel-modal text-[var(--text-secondary)] font-bold text-xl">&times;</button>
            </div>
            <div class="mb-4">
                <button id="btn-manager-add" class="bg-[var(--primary-color)] text-white px-3 py-1.5 rounded">+ Novo Item</button>
            </div>
            <div id="manager-modal-list" class="flex-1 overflow-auto space-y-2"></div>
        </div>
    </div>
    
    <script src="js/storage.js"></script>
    <script src="js/dragAndDrop.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
"""

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove anything after the closing of #daily-view-wrapper. Wait, daily-view-wrapper was closed at line 133.
# The html ends with:
#                 <div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col">
#                 </div>
#
# We should append right there!

# Actually, my previous script had a bug where it lost `</body></html>` and `</main>`.
# This `html_to_append` contains the proper closing tags.

with open('index.html', 'a', encoding='utf-8') as f:
    f.write(html_to_append)

print("Recovered!")
