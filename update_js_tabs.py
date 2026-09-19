import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace top-tabs-container rendering in renderWeeklyGrid
old_tabs_render_regex = r"const tabsContainer = document\.getElementById\('top-tabs-container'\);.*?tabsContainer\.querySelectorAll\('\.tab-btn'\)\.forEach\(btn => \{.*?\}\);\n\s+\}\n"

new_tabs_render = """const tabsContainer = document.getElementById('dynamic-header-tabs');
        if (tabsContainer) {
            const weekText = `w${String(weekNum).padStart(2, '0')}`;
            let tabsHTML = `<button data-date="weekly" class="tab-btn flex flex-col items-center justify-center px-3 py-1 rounded transition border border-transparent bg-[var(--primary-color)] text-white hover:opacity-90 group flex-shrink-0 mr-1" title="Visão Semanal">
                                <span class="text-sm font-black group-hover:scale-110 transition-transform">${weekText}</span>
                            </button>
                            <div class="w-px h-6 bg-[var(--border-color)] mx-1 flex-shrink-0"></div>`;
            
            dates.forEach(date => {
                const dayName = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][date.getDay()];
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const displayDay = String(date.getDate()).padStart(2, '0');
                const displayMonth = String(date.getMonth() + 1).padStart(2, '0');
                
                tabsHTML += `<button data-date="${dateStr}" class="tab-btn flex flex-col items-center justify-center min-w-[40px] px-2 py-0.5 rounded transition border border-transparent text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--primary-color)] day-dropzone tab-dropzone flex-shrink-0">
                                <span class="text-[9px] uppercase tracking-wider font-bold mb-[1px] opacity-70">${dayName}</span>
                                <span class="text-sm font-bold leading-none">${displayDay}/${displayMonth}</span>
                            </button>`;
            });
            
            tabsContainer.innerHTML = tabsHTML;
            tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.target.closest('button');
                    if (!targetBtn) return;
                    if (targetBtn.dataset.date === 'weekly') {
                        window.appRouter.goWeekly();
                    } else {
                        const [y, m, d] = targetBtn.dataset.date.split('-');
                        window.appRouter.goDaily(new Date(y, m-1, d));
                    }
                });
            });
        }
"""

js = re.sub(old_tabs_render_regex, new_tabs_render, js, flags=re.DOTALL)

# Update openDailyView to highlight tabs
old_highlight_regex = r"document\.querySelectorAll\('#top-tabs-container button'\)\.forEach.*?\}\);\n"

new_highlight = """document.querySelectorAll('#dynamic-header-tabs button.tab-btn').forEach(btn => {
            if (btn.dataset.date === 'weekly') {
                btn.classList.remove('bg-[var(--primary-color)]', 'text-white');
                btn.classList.add('text-[var(--primary-color)]', 'hover:bg-[var(--border-color)]');
            } else {
                btn.classList.remove('bg-[var(--primary-color)]', 'text-white', 'border-[var(--primary-color)]');
                btn.classList.add('text-[var(--text-secondary)]', 'border-transparent');
                
                if(btn.dataset.date === currentDailyDateStr) {
                    btn.classList.add('border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'bg-[var(--bg-color)]');
                    btn.classList.remove('text-[var(--text-secondary)]', 'border-transparent');
                }
            }
        });
"""

js = re.sub(old_highlight_regex, new_highlight, js, flags=re.DOTALL)

# We also need to restore the weekly tab state when returning to weekly view
# Inside renderWeeklyGrid, since it redraws the tabs, the weekly tab is highlighted by default (bg-[var(--primary-color)] text-white).
# That works perfectly!

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("app.js rewritten")
