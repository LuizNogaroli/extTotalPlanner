import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# The code has:
# const dates = getWeekDates(baseDate);
# grid.innerHTML = '';
# const tabsContainer = ...
# if (tabsContainer) { const weekText = `w${String(weekNum)...`; ... }
#
# ... lower down ...
# const weekNum = getWeekNumber(dates[0]);

# I'll just change `const weekNum = getWeekNumber(dates[0]);` to `weekNum_delete` below
# and add it above `const tabsContainer = ...`

js = js.replace('const tabsContainer = document.getElementById(\'dynamic-header-tabs\');',
                'const weekNum = getWeekNumber(dates[0]);\n        const tabsContainer = document.getElementById(\'dynamic-header-tabs\');')

js = js.replace('const weekNum = getWeekNumber(dates[0]);', '', 1) # wait, the first one is the one I just added.
# So I should use regex to replace the exact one.

# Let's just do it directly.
