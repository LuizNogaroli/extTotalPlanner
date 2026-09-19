import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Substitute 'async function openDayModal' to 'openDailyView'
js = js.replace('async function openDayModal', 'async function openDailyView')
js = js.replace('window.appRouter.openDayModal', 'window.appRouter.openDailyView')

# 2. Modify container toggle
old_toggle = r"dayModalContent\.innerHTML = htmlContent;\s*dayModalContent\.classList\.add\('day-dropzone'\);\s*dayModalContent\.dataset\.date = currentDailyDateStr;\s*dayModal\.classList\.remove\('hidden'\);"

new_toggle = """dayModalContent.innerHTML = htmlContent;
        dayModalContent.classList.add('day-dropzone');
        dayModalContent.dataset.date = currentDailyDateStr;
        
        document.getElementById('weekly-view-wrapper').classList.add('hidden');
        document.getElementById('daily-view-wrapper').classList.remove('hidden');
        
        document.querySelectorAll('#top-tabs-container button').forEach(btn => {
            btn.classList.remove('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
            btn.classList.add('text-[var(--text-secondary)]');
            if(btn.dataset.date === currentDailyDateStr) {
                btn.classList.add('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
                btn.classList.remove('text-[var(--text-secondary)]');
            }
        });"""

js = re.sub(old_toggle, new_toggle, js)

# 3. Add openWeeklyView
open_weekly_view = """
    goWeekly: () => {
        document.getElementById('daily-view-wrapper').classList.add('hidden');
        document.getElementById('weekly-view-wrapper').classList.remove('hidden');
        
        document.querySelectorAll('#top-tabs-container button').forEach(btn => {
            btn.classList.remove('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
            btn.classList.add('text-[var(--text-secondary)]');
            if(btn.dataset.date === 'weekly') {
                btn.classList.add('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
                btn.classList.remove('text-[var(--text-secondary)]');
            }
        });
    },"""

js = js.replace('goDaily: (dateObj) => openDailyView(dateObj),', 'goDaily: (dateObj) => openDailyView(dateObj),\n' + open_weekly_view)


# 4. Generate tabs in renderWeeklyGrid
# Let's find: `grid.innerHTML = '';`
tabs_logic = """
        grid.innerHTML = '';
        
        const tabsContainer = document.getElementById('top-tabs-container');
        if (tabsContainer) {
            let tabsHTML = `<button data-date="weekly" class="tab-btn pb-2 px-4 whitespace-nowrap text-sm border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] font-bold transition">Visão Semanal</button>`;
            
            weekDays.forEach(date => {
                const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const displayDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                tabsHTML += `<button data-date="${dateStr}" class="tab-btn pb-2 px-4 whitespace-nowrap text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition day-dropzone tab-dropzone">${dayName} ${displayDate}</button>`;
            });
            
            tabsContainer.innerHTML = tabsHTML;
            tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (e.target.dataset.date === 'weekly') {
                        window.appRouter.goWeekly();
                    } else {
                        const [y, m, d] = e.target.dataset.date.split('-');
                        window.appRouter.goDaily(new Date(y, m-1, d));
                    }
                });
            });
        }
"""
js = js.replace("grid.innerHTML = '';", tabs_logic)

# 5. Fix dayModalTitle.textContent
js = js.replace('dayModalTitle.textContent', 'document.getElementById("daily-view-title").textContent')


with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print('app.js patched for tabs!')
