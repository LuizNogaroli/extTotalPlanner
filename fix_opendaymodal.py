import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('openDayModal(date);', 'openDailyView(date);')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed openDayModal(date)")
