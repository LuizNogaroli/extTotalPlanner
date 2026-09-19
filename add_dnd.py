import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I will append initDragAndDrop to window.appRouter so it can be called from anywhere
dnd_code = """
    initDragAndDrop: () => {
        document.querySelectorAll('.task-card').forEach(card => {
            // Remove old listeners to avoid duplicates
            card.removeEventListener('dragstart', window.appRouter._handleDragStart);
            card.addEventListener('dragstart', window.appRouter._handleDragStart);
        });
        
        document.querySelectorAll('.day-dropzone').forEach(zone => {
            zone.removeEventListener('dragover', window.appRouter._handleDragOver);
            zone.removeEventListener('drop', window.appRouter._handleDrop);
            zone.removeEventListener('dragenter', window.appRouter._handleDragEnter);
            zone.removeEventListener('dragleave', window.appRouter._handleDragLeave);
            
            zone.addEventListener('dragover', window.appRouter._handleDragOver);
            zone.addEventListener('drop', window.appRouter._handleDrop);
            zone.addEventListener('dragenter', window.appRouter._handleDragEnter);
            zone.addEventListener('dragleave', window.appRouter._handleDragLeave);
        });
    },
    _handleDragStart: (e) => {
        const card = e.target.closest('.task-card');
        if(!card) return;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            id: card.dataset.taskId,
            sourceDate: card.dataset.currentDate
        }));
        card.style.opacity = '0.5';
        
        // Listen for dragend to restore opacity
        card.addEventListener('dragend', () => { card.style.opacity = '1'; }, {once: true});
    },
    _handleDragOver: (e) => {
        e.preventDefault(); // Necessary to allow dropping
    },
    _handleDragEnter: (e) => {
        e.preventDefault();
        const dropzone = e.target.closest('.day-dropzone');
        if(dropzone) {
            dropzone.classList.add('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
        }
    },
    _handleDragLeave: (e) => {
        const dropzone = e.target.closest('.day-dropzone');
        if(dropzone) {
            dropzone.classList.remove('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
        }
    },
    _handleDrop: async (e) => {
        e.preventDefault();
        const dropzone = e.target.closest('.day-dropzone');
        if(dropzone) {
            dropzone.classList.remove('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
            
            const targetDate = dropzone.dataset.date;
            if(!targetDate) return;
            
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (data.sourceDate === targetDate) return; // Same day, do nothing
                
                const acts = await window.StorageService.get('planner_activities') || [];
                const idx = acts.findIndex(a => a.id === data.id);
                if(idx !== -1) {
                    acts[idx].date = targetDate;
                    await window.StorageService.set('planner_activities', acts);
                    if(window.NotificationService) window.NotificationService.show(`Atividade movida!`);
                    
                    // Trigger re-render
                    document.dispatchEvent(new CustomEvent('layoutChange', { detail: window.currentLayout || 'grid' }));
                }
            } catch(err) {
                console.error("Drop error", err);
            }
        }
    },
"""

if "initDragAndDrop:" not in js:
    js = js.replace('transferActivity: (id) => {', dnd_code + '\n    transferActivity: (id) => {')


# Add initDragAndDrop call at the end of renderWeeklyGrid
if "window.appRouter.initDragAndDrop();" not in js:
    # We find the end of renderWeeklyGrid. Since it might be hard with regex, I'll just append it right after the grid.innerHTML is populated.
    # Wait, renderWeeklyGrid is async, and it populates DOM. So at the end of it:
    js = js.replace('container.innerHTML = \'<div class="text-center p-8 text-[var(--text-secondary)]">Sem tarefas para esta semana</div>\';', 
                    'container.innerHTML = \'<div class="text-center p-8 text-[var(--text-secondary)]">Sem tarefas para esta semana</div>\';\n        window.appRouter.initDragAndDrop();')
    
    js = js.replace('const borderClass = isToday ? \'border-[var(--primary-color)] border-2\' : \'border-[var(--border-color)]\';',
                    'const borderClass = isToday ? \'border-[var(--primary-color)] border-2\' : \'border-[var(--border-color)]\';\n        window.appRouter.initDragAndDrop();')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Drag and drop added to app.js")
