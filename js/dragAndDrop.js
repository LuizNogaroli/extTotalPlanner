document.addEventListener('DOMContentLoaded', () => {
    // Usaremos Delegação de Eventos no body para capturar dinamicamente tanto a visão semanal quanto a diária
    const gridContainer = document.body;

    let draggedCard = null;

    gridContainer.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.task-card');
        if (card) {
            draggedCard = card;
            e.dataTransfer.effectAllowed = 'move';
            // Necessário para Firefox
            e.dataTransfer.setData('text/plain', card.dataset.taskId);
            
            setTimeout(() => {
                card.classList.add('opacity-50', 'scale-95');
            }, 0);
        }
    });

    gridContainer.addEventListener('dragend', (e) => {
        if (draggedCard) {
            draggedCard.classList.remove('opacity-50', 'scale-95');
            draggedCard = null;
        }
        
        // Remove destaques de dropzones ativas
        document.querySelectorAll('.day-dropzone').forEach(dropzone => {
            dropzone.classList.remove('bg-[var(--border-color)]', 'border-dashed', 'border-2', 'border-[var(--primary-color)]');
        });
    });

    gridContainer.addEventListener('dragover', (e) => {
        const dropzone = e.target.closest('.day-dropzone');
        if (dropzone) {
            e.preventDefault(); // Necessário para permitir o drop
            e.dataTransfer.dropEffect = 'move';
        }
    });

    gridContainer.addEventListener('dragenter', (e) => {
        const dropzone = e.target.closest('.day-dropzone');
        if (dropzone) {
            e.preventDefault();
            dropzone.classList.add('bg-[var(--border-color)]', 'border-dashed', 'border-2', 'border-[var(--primary-color)]');
        }
    });

    gridContainer.addEventListener('dragleave', (e) => {
        const dropzone = e.target.closest('.day-dropzone');
        if (dropzone) {
            // Verifica se realmente saiu do dropzone (e não para um elemento filho)
            if (!dropzone.contains(e.relatedTarget)) {
                dropzone.classList.remove('bg-[var(--border-color)]', 'border-dashed', 'border-2', 'border-[var(--primary-color)]');
            }
        }
    });

    gridContainer.addEventListener('drop', async (e) => {
        const dropzone = e.target.closest('.day-dropzone');
        if (dropzone && draggedCard) {
            e.preventDefault();
            
            const newDate = dropzone.dataset.date;
            const taskId = draggedCard.dataset.taskId;

            dropzone.classList.remove('bg-[var(--border-color)]', 'border-dashed', 'border-2', 'border-[var(--primary-color)]');

            if (newDate) {
                const isSidebar = dropzone.classList.contains('sidebar-dropzone');
                
                // Atualiza visualmente
                if (!isSidebar) {
                    const afterElement = getDragAfterElement(dropzone, e.clientY);
                    const emptyMsg = dropzone.querySelector('.italic');
                    if (emptyMsg) emptyMsg.remove();
                    
                    if (afterElement == null) {
                        dropzone.appendChild(draggedCard);
                    } else {
                        dropzone.insertBefore(draggedCard, afterElement);
                    }
                    draggedCard.dataset.currentDate = newDate;
                } else {
                    // Se soltou no menu lateral (sidebar), apenas remova o card visualmente da origem
                    draggedCard.remove();
                }

                // Salva a alteração e a nova ordem no Storage
                try {
                    const activities = await StorageService.get('planner_activities') || [];
                    const taskIndex = activities.findIndex(a => String(a.id) === String(taskId));
                    
                    if (taskIndex > -1) {
                        const task = activities.splice(taskIndex, 1)[0];
                        task.date = newDate; // Atualiza a data se mudou
                        
                        // Pegar tarefas apenas do dia de destino
                        let dayTasks = activities.filter(a => a.date === newDate);
                        dayTasks.push(task);
                        
                        // Obter a nova ordem baseada no DOM (apenas se não for sidebar)
                        if (!isSidebar) {
                            const domCards = Array.from(dropzone.querySelectorAll('.task-card'));
                            const orderedIds = domCards.map(c => String(c.dataset.taskId));
                            dayTasks.sort((a, b) => orderedIds.indexOf(String(a.id)) - orderedIds.indexOf(String(b.id)));
                        }
                        
                        // Remonta a array mantendo tarefas de outros dias intactas
                        const otherTasks = activities.filter(a => a.date !== newDate);
                        const finalActivities = [...otherTasks, ...dayTasks];
                        
                        await StorageService.set('planner_activities', finalActivities);

                        // Feedback se for sidebar
                        if (isSidebar) {
                            const originalText = dropzone.textContent;
                            dropzone.textContent = "✅ Movido!";
                            setTimeout(() => dropzone.textContent = originalText, 1500);
                        }
                    }
                } catch (err) {
                    console.error("Erro ao salvar mudança de ordem ou data:", err);
                }
            }
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.opacity-50)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // Pega o meio do card
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
