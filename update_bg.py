import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old = '<div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col">'
new = '<div id="daily-view-wrapper" class="hidden flex-1 h-full flex-col bg-[var(--bg-panel)] p-6 rounded-lg shadow-sm border border-[var(--border-color)] overflow-auto">'

html = html.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Background updated')
