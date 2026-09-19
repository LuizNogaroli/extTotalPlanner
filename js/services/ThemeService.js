class ThemeService {
    constructor() {
        this.storageKey = 'planner_settings_theme';
        this.defaultSettings = {
            theme: 'light',
            fontSize: 'normal',
            layout: 'stacked' // 'stacked' ou 'grid'
        };
    }

    async applySavedSettings() {
        const settings = await StorageService.get(this.storageKey) || this.defaultSettings;
        this.setTheme(settings.theme, false);
        this.setFontSize(settings.fontSize, false);
        this.setLayout(settings.layout || 'stacked', false);
        return settings;
    }

    setTheme(themeName, save = true) {
        document.body.setAttribute('data-theme', themeName);
        if (save) this._saveSettings({ theme: themeName });
    }

    setFontSize(size, save = true) {
        document.body.setAttribute('data-font-size', size);
        if (save) this._saveSettings({ fontSize: size });
    }

    setLayout(layoutType, save = true) {
        document.body.setAttribute('data-layout', layoutType);
        if (save) {
            this._saveSettings({ layout: layoutType });
            // Dispara evento global para o app.js saber que deve re-renderizar os componentes
            window.dispatchEvent(new CustomEvent('layoutChanged', { detail: layoutType }));
        }
    }

    async _saveSettings(newSettings) {
        const currentSettings = await StorageService.get(this.storageKey) || this.defaultSettings;
        const mergedSettings = { ...currentSettings, ...newSettings };
        await StorageService.set(this.storageKey, mergedSettings);
    }
    
    async getSettings() {
        return await StorageService.get(this.storageKey) || this.defaultSettings;
    }
}
