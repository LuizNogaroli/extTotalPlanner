import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix ReferenceErrors
js = js.replace('openDayModal: openDayModal', 'openDailyView: openDailyView')
js = js.replace('window.appRouter.openDayModal', 'window.appRouter.openDailyView')

# Also fix `switchToDailyView` which might call `openDayModal`
js = js.replace('openDayModal(dateObj);', 'openDailyView(dateObj);')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed app.js references")
