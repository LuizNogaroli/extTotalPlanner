import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<span>📅 Pendências do Dia</span>', '<span id="daily-view-title">📅 Pendências do Dia</span>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
