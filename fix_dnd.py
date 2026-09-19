import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix StorageService reference and prevent 'weekly' drop from vanishing
js = js.replace("await window.StorageService.get", "await StorageService.get")
js = js.replace("await window.StorageService.set", "await StorageService.set")

# Also fix the weekly drop issue
old_drop_check = "if (data.sourceDate === targetDate) return; // Same day, do nothing"
new_drop_check = """if (data.sourceDate === targetDate) return; // Same day, do nothing
                if (targetDate === 'weekly') {
                    if (window.NotificationService) window.NotificationService.show("Transferência para a Semana (Foco) em desenvolvimento!");
                    return;
                }"""

js = js.replace(old_drop_check, new_drop_check)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Drag and drop fixed")
