class I18nService {
    constructor(defaultLang = 'pt-BR') {
        this.lang = defaultLang;
        this.dictionary = {};
    }

    async loadLanguage() {
        try {
            // Tenta usar API do Chrome Extensions
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                const url = chrome.runtime.getURL(`locales/${this.lang}.json`);
                const response = await fetch(url);
                this.dictionary = await response.json();
            } else {
                // Fallback de dev
                const response = await fetch(`locales/${this.lang}.json`);
                this.dictionary = await response.json();
            }
        } catch (error) {
            console.error('Erro ao carregar idioma:', error);
        }
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.dictionary[key]) {
                el.textContent = this.dictionary[key];
            }
        });
    }

    get(key) {
        return this.dictionary[key] || key;
    }
}
