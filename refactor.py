import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Insert Tabs
dashboard_start = '<div id="view-dashboard" class="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full transition-all flex flex-col">'
tabs_html = '''
                <!-- TAB BAR DE NAVEGAÇÃO -->
                <div id="top-tabs-container" class="flex space-x-2 overflow-x-auto pb-3 mb-4 border-b border-[var(--border-color)]" style="scrollbar-width: none;">
                    <!-- Abas geradas via JS -->
                </div>'''
html = html.replace(dashboard_start, dashboard_start + tabs_html)

# 2. Extract grid-cols-5 from global-day-modal
grid_start = html.find('<div class="grid grid-cols-1 md:grid-cols-5')
if grid_start == -1: print('grid_start not found'); exit(1)

# Find the end of global-day-modal
modal_start = html.find('<!-- Modal Global de Resumo do Dia (Layout Compacto) -->')
next_modal = html.find('<!-- Modal de Hábitos (Opcional - caso queira manter o botão antigo) -->')

if modal_start == -1 or next_modal == -1:
    print('Modal boundaries not found')
    exit(1)

modal_content = html[grid_start:next_modal]

# Cleanup the closing divs (there are closing divs for the modal wrapper that we don't want)
# Let's find the closing div of grid-cols-5 exactly
# We can just count the divs, or since we know it ends right before `next_modal`, we can split it.
modal_content = modal_content.rsplit('</div>', 3)[0] + '</div>\n'

# 3. Replace daily-view-wrapper with the new one
daily_view_start = html.find('<!-- VISÃO DIÁRIA (Agenda) -->')
daily_view_end = html.find('<!-- Tela de Estatísticas -->')

if daily_view_start == -1 or daily_view_end == -1:
    print('Daily view boundaries not found')
    exit(1)

new_daily_view = '''<!-- VISÃO DIÁRIA (Agenda) -->
                <div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col">
                    ''' + modal_content + '''
                </div>
                '''

html = html[:daily_view_start] + new_daily_view + html[daily_view_end:]

# 4. Remove global-day-modal completely
# We need to re-find it because indices changed
modal_start = html.find('<!-- Modal Global de Resumo do Dia (Layout Compacto) -->')
next_modal = html.find('<!-- Modal de Hábitos (Opcional - caso queira manter o botão antigo) -->')
html = html[:modal_start] + html[next_modal:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Refactor done!')
