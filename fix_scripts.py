import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the wrong script tags
wrong_scripts = """    <script src="js/storage.js"></script>
    <script src="js/dragAndDrop.js"></script>
    <script src="js/app.js"></script>"""

correct_scripts = """    <script src="js/services/StorageService.js"></script>
    <script src="js/services/ThemeService.js"></script>
    <script src="js/services/I18nService.js"></script>
    <script src="js/services/NotificationService.js"></script>
    <script src="js/services/ContentService.js"></script>
    <script src="js/dragAndDrop.js"></script>
    <script src="js/app.js"></script>"""

html = html.replace(wrong_scripts, correct_scripts)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Scripts fixed")
