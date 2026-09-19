import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

manager_idx = html.find('id="global-manager-modal"')
if manager_idx != -1:
    before = html[:manager_idx]
    after = html[manager_idx:]
    after = after.replace('btn-cancel-modal', 'btn-close-manager', 1)
    html = before + after

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Fixed manager close button")
