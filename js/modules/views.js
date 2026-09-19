// js/modules/views.js

export class ViewManager {
    constructor(hideAllViews, headerTitle, views, buttons) {
        this.hideAllViews = hideAllViews;
        this.headerTitle = headerTitle;
        this.views = views; // { dashboard, settings, reports, strategic, export, weekly, daily }
        this.buttons = buttons; // { dashboard, settings, reports, strategic, export }
    }

    switchToSettings() {
        this.headerTitle.textContent = "Configurações";
        this.hideAllViews();
        this.views.settings.classList.remove('hidden');
        if (this.buttons.settings) this.buttons.settings.classList.add('bg-[var(--border-color)]', 'font-bold');
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    switchToReportsView() {
        this.headerTitle.textContent = "Relatórios e Dados";
        this.hideAllViews();
        this.views.reports.classList.remove('hidden');
        this.views.reports.classList.add('flex');
        if (this.buttons.reports) this.buttons.reports.classList.add('bg-[var(--border-color)]', 'font-bold');
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }

    switchToExportView() {
        this.headerTitle.textContent = "Exportar Dados";
        this.hideAllViews();
        this.views.export.classList.remove('hidden');
        this.views.export.classList.add('flex');
        if (this.buttons.export) this.buttons.export.classList.add('bg-[var(--border-color)]', 'font-bold');
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    }
}
