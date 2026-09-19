import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Modify openDayModal -> openDailyView
# Old code:
# async function openDayModal(dateObj, htmlContent) {
#    ...
#    dayModalTitle.textContent = ...
#    dayModal.classList.remove('hidden');
#    ...
# }

# We will just replace 'dayModalTitle.textContent' with 'document.getElementById("daily-view-title").textContent' and replace 'dayModal.classList.remove("hidden")' with logic to toggle containers.
# Wait, I need to make sure I add `document.getElementById('weekly-view-wrapper').classList.add('hidden')`
# and `document.getElementById('daily-view-wrapper').classList.remove('hidden')`
# and add logic for top tabs.

js = js.replace('async function openDayModal', 'async function openDailyView')
js = js.replace('window.appRouter.openDayModal', 'window.appRouter.openDailyView')

# Now, we need to hide the weekly-view-wrapper and show daily-view-wrapper in openDailyView
# Let's find: `dayModalContent.innerHTML = htmlContent;`
# and inject the toggle there.
inject_toggle = """
          dayModalContent.innerHTML = htmlContent;
          document.getElementById('weekly-view-wrapper').classList.add('hidden');
          document.getElementById('daily-view-wrapper').classList.remove('hidden');
          
          // Update tabs active state
          document.querySelectorAll('#top-tabs-container button').forEach(btn => {
              btn.classList.remove('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
              btn.classList.add('text-[var(--text-secondary)]');
              if(btn.dataset.date === currentDailyDateStr) {
                  btn.classList.add('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
                  btn.classList.remove('text-[var(--text-secondary)]');
              }
          });
"""
js = re.sub(r'dayModalContent\.innerHTML = htmlContent;[ \t\r\n]*dayModal\.classList\.remove\(\'hidden\'\);', inject_toggle, js)

# 2. Add openWeeklyView() function to window.appRouter
open_weekly_view = """
      goWeekly: () => {
          document.getElementById('daily-view-wrapper').classList.add('hidden');
          document.getElementById('weekly-view-wrapper').classList.remove('hidden');
          
          // Update tabs active state
          document.querySelectorAll('#top-tabs-container button').forEach(btn => {
              btn.classList.remove('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
              btn.classList.add('text-[var(--text-secondary)]');
              if(btn.dataset.date === 'weekly') {
                  btn.classList.add('border-b-2', 'border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'font-bold');
                  btn.classList.remove('text-[var(--text-secondary)]');
              }
          });
      },
"""
js = js.replace('goDaily: (dateObj) => openDailyView(dateObj),', 'goDaily: (dateObj) => openDailyView(dateObj),\n' + open_weekly_view)

# 3. Add tabs generation to renderWeeklyGrid
tabs_logic = """
      const tabsContainer = document.getElementById('top-tabs-container');
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
                  // Reconstruct date obj
                  const [y, m, d] = e.target.dataset.date.split('-');
                  window.appRouter.goDaily(new Date(y, m-1, d));
              }
          });
      });
"""
# Find where grid.innerHTML = '' is
js = js.replace('grid.innerHTML = \'\';', 'grid.innerHTML = \'\';\n' + tabs_logic)

# Replace 'dayModalTitle' with 'document.getElementById("daily-view-title")'
js = js.replace('dayModalTitle.textContent', 'document.getElementById("daily-view-title").textContent')


with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print('app.js patched for tabs!')
