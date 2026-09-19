import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js)
ids = list(set(matches))

missing = [i for i in ids if f'id="{i}"' not in html and f"id='{i}'" not in html]
print("Missing IDs:", missing)
