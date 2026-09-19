import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Change default layout from stacked to grid
js = js.replace("let currentLayout = settings.layout || 'stacked';", "let currentLayout = settings.layout || 'grid';")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Changed default layout to grid")
