// js/modules/renderer.js

export class ViewRenderer {
    constructor(StorageService, appRouter) {
        this.StorageService = StorageService;
        this.appRouter = appRouter;
    }

    async renderMissao(contentArea, headerTitle, hideAllViews, viewStrategic) {
        headerTitle.textContent = "Declaração de Missão";
        hideAllViews();
        viewStrategic.classList.remove('hidden');
        viewStrategic.classList.add('flex');
        
        contentArea.innerHTML = '<span class="animate-pulse">Carregando missão...</span>';
        
        const strategies = await this.StorageService.get('planner_strategies') || [];
        const missaoRecords = strategies.filter(s => s.type === 'missao').sort((a,b) => b.timestamp - a.timestamp);
        
        if (missaoRecords.length === 0) {
            contentArea.innerHTML = '<div class="text-[var(--text-secondary)] italic">Nenhuma missão cadastrada ainda.</div>';
            return;
        }

        const latest = missaoRecords[0];
        
        contentArea.innerHTML = `
            <div class="bg-[var(--bg-panel)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm mb-8">
                <h2 class="text-xl font-bold mb-4 text-[var(--primary-color)]">Versão Atual</h2>
                <p class="text-lg italic text-[var(--text-primary)] mb-4">"${latest.content}"</p>
                <div class="text-xs text-[var(--text-secondary)]">Definida em: ${new Date(latest.timestamp).toLocaleString()}</div>
            </div>
            
            <div class="bg-[var(--bg-panel)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
                <h3 class="text-lg font-bold mb-4">Histórico de Versões</h3>
                <table class="w-full text-sm text-left">
                    <thead>
                        <tr class="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                            <th class="py-2">Data</th>
                            <th class="py-2">Conteúdo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${missaoRecords.map(m => `
                            <tr class="border-b border-[var(--border-color)] last:border-0">
                                <td class="py-3 text-[var(--text-secondary)]">${new Date(m.timestamp).toLocaleString()}</td>
                                <td class="py-3 text-[var(--text-primary)]">${m.content}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}
