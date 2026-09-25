class StorageService {
    /**
     * Recupera um dado do chrome.storage.local
     */
    static async get(key) {
        return new Promise((resolve) => {
            // Verifica se está rodando dentro da extensão
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get([key], (result) => {
                    resolve(result[key] || null);
                });
            } else {
                // Fallback para desenvolvimento em navegador comum (sem ser extensão ainda)
                const data = localStorage.getItem(key);
                try {
                    resolve(data ? JSON.parse(data) : null);
                } catch {
                    resolve(data);
                }
            }
        });
    }

    /**
     * Salva um dado no chrome.storage.local
     */
    static async set(key, value) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ [key]: value }, () => {
                    resolve(true);
                });
            } else {
                localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
                resolve(true);
            }
        });
    }
}

// Expor globalmente para uso em módulos ES6
window.StorageService = StorageService;
