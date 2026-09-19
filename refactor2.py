with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_daily_modal = False
daily_modal_content = []

i = 0
while i < len(lines):
    line = lines[i]
    
    # 1. Insert Tabs under view-dashboard
    if '<div id="view-dashboard"' in line:
        new_lines.append(line)
        new_lines.append('                <!-- TAB BAR DE NAVEGAÇÃO -->\n')
        new_lines.append('                <div id="top-tabs-container" class="flex space-x-2 overflow-x-auto pb-3 mb-4 border-b border-[var(--border-color)]" style="scrollbar-width: none;">\n')
        new_lines.append('                    <!-- Abas geradas via JS -->\n')
        new_lines.append('                </div>\n')
        i += 1
        continue
        
    # 2. Capture the content of the daily view wrapper
    if '<!-- VISÃO DIÁRIA (Agenda) -->' in line:
        new_lines.append(line)
        new_lines.append('                <div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col">\n')
        # We will inject the modal content here later. For now put a placeholder
        new_lines.append('                    __DAILY_VIEW_CONTENT__\n')
        new_lines.append('                </div>\n')
        # Skip the original daily-view-wrapper
        while i < len(lines) and '<!-- Tela de Estatísticas -->' not in lines[i]:
            i += 1
        continue
        
    # 3. Extract the actual Modal Content
    if '<!-- Modal Global de Resumo do Dia (Layout Compacto) -->' in line:
        in_daily_modal = True
        i += 1
        while i < len(lines) and '<!-- Modal Global de Gerenciamento' not in lines[i]:
            daily_modal_content.append(lines[i])
            i += 1
        in_daily_modal = False
        continue

    new_lines.append(line)
    i += 1

# Process daily_modal_content to get just the grid
modal_str = ''.join(daily_modal_content)
grid_start = modal_str.find('<div class="flex-1 overflow-auto p-6 bg-[var(--bg-color)]">')
grid_end = modal_str.find('<!-- RODAPÉ -->')

grid_html = modal_str[grid_start:grid_end]

final_html = ''.join(new_lines).replace('                    __DAILY_VIEW_CONTENT__\n', grid_html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

print('Done')
