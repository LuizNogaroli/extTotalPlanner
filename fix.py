import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('id="global-modal"', 'id="global-crud-modal"')
html = html.replace('class="btn-cancel-modal text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xl">&times;</button>', 'id="btn-close-modal" class="btn-cancel-modal text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xl">&times;</button>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed!")
