import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I used weekDays.forEach but the variable in renderWeeklyGrid is 'dates'.
js = js.replace('weekDays.forEach(date => {', 'dates.forEach(date => {')

# Also wait, inside renderSidebarTimeline:
# There is a weekDays.forEach(day => {
# Let's check if weekDays exists in renderSidebarTimeline.
# I will only replace the one inside the tabs loop.
# Actually I can just do a very specific replacement:
tabs_bad = 'weekDays.forEach(date => {'
tabs_good = 'dates.forEach(date => {'
js = js.replace(tabs_bad, tabs_good)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Fixed weekDays to dates")
