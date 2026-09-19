import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# The old card HTML:
old_card_regex = r"<div draggable=\"true\" data-task-id=\"\$\{a\.id\}\" data-current-date=\"\$\{a\.date\}\" class=\"task-card p-2\s+pl-9 mb-2 bg-\[var\(--bg-color\)\] border border-\[var\(--border-color\)\] rounded shadow-sm flex flex-col group relative\s+hover:shadow-md transition cursor-move\">[\s\S]*?</div>`;"

new_card = """<div draggable="true" data-task-id="${a.id}" data-current-date="${a.date}" class="task-card flex flex-col bg-[var(--bg-panel)] border border-[var(--border-color)] rounded shadow-sm hover:shadow-md transition cursor-move mb-3 relative overflow-hidden group">
                        <!-- Drag Handle Area -->
                        <div class="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center text-[var(--text-secondary)] opacity-30 group-hover:opacity-100 transition-opacity hover:bg-[var(--border-color)] cursor-move border-r border-[var(--border-color)]">
                            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                <circle cx="2" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/>
                                <circle cx="2" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/>
                                <circle cx="2" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/>
                            </svg>
                        </div>
                        
                        <!-- Content Wrapper -->
                        <div class="pl-6 flex flex-col h-full">
                            <!-- Cabeçalho -->
                            <div class="p-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-color)]">
                                <span class="font-bold text-[var(--primary-color)] text-sm truncate pr-2">${a.title}</span>
                                <span class="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider flex-shrink-0">${a.status.replace('_', ' ')}</span>
                            </div>
                            
                            <!-- Área de Conteúdo -->
                            <div class="p-2 flex-1 text-xs text-[var(--text-secondary)]">
                                <div class="flex flex-wrap items-center gap-1 mb-1">${catBadge}${eisBadge}</div>
                                <div class="line-clamp-2 mt-1">${a.desc ? a.desc : '<span class="italic opacity-50">Sem descrição...</span>'}</div>
                            </div>
                            
                            <!-- Rodapé -->
                            <div class="p-1.5 border-t border-[var(--border-color)] flex justify-end space-x-2 bg-[var(--bg-color)]">
                                <button title="Visualizar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openViewModal(JSON.parse(decodeURIComponent('${enc}')))">👁️ Ver</button>
                                <button title="Editar" class="text-xs px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition flex items-center gap-1" onclick="window.appRouter.openModal('atividade', JSON.parse(decodeURIComponent('${enc}')))">✏️ Editar</button>
                            </div>
                        </div>
                    </div>`;"""

# Substitute all occurrences
js = re.sub(old_card_regex, new_card, js)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated cards")
