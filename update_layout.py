import re

# 1. Update app.js (Day casing & padding)
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Change 'DOM', 'SEG', etc. to 'Dom', 'Seg'
js = js.replace("['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']", "['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']")

# Add padding to top tabs: min-w-[40px] px-2 -> min-w-[48px] px-3
js = js.replace('min-w-[40px] px-2 py-0.5', 'min-w-[48px] px-3 py-1')

# Add spacing to space-x-1 -> space-x-2 in the dynamic-header-tabs
# Wait, this is in index.html!

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

# 2. Update index.html (Width & Header tabs spacing)
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change max-w-4xl to max-w-7xl
html = html.replace('max-w-4xl', 'max-w-7xl')

# Change space-x-1 to space-x-2 in header navigation
html = html.replace('id="dynamic-header-tabs" class="flex items-center space-x-1"', 'id="dynamic-header-tabs" class="flex items-center space-x-2"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Layout adjustments applied")
