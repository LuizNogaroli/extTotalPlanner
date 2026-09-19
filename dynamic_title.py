import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update openDailyView to modify main-view-title
js = js.replace('document.getElementById("daily-view-title").textContent = `Atividades - ${daysOfWeekFull[dateObj.getDay()]} (${dayStr})`;', 
                'const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = `${daysOfWeekFull[dateObj.getDay()]} (${dayStr})`; document.getElementById("daily-view-title").classList.add("hidden");')

# Update switchToWeeklyView to restore main-view-title
js = js.replace('function switchToWeeklyView(baseDate = new Date(), layout = currentLayout) {',
                'function switchToWeeklyView(baseDate = new Date(), layout = currentLayout) {\n        const mvt = document.getElementById("main-view-title"); if(mvt) mvt.textContent = "Visão Semanal";')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Title dynamic update applied")
