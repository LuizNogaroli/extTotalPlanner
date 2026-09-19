/**
 * Abstração de Serviço de Conteúdo (Cloud/Community)
 * No futuro, os métodos daqui trocarão chamadas ao StorageService por chamadas de rede API (ex: Supabase, Firebase).
 */
class ContentService {
    
    static formatDayMonth(dateObj) {
        // Retorna algo como '18/09' para comparar com entradas do usuário
        const d = String(dateObj.getDate()).padStart(2, '0');
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        return d + '/' + m;
    }

    static async getHistoryList(dateObj) {
        const items = await StorageService.get('planner_historico') || [];
        if (items.length === 0) return [];
        const dayStr = String(dateObj.getDate());
        const exactMatch = items.filter(i => i.date.includes(dayStr));
        if (exactMatch.length > 0) return exactMatch;
        return items; // Fallback
    }

    static async getMotivacionalList() {
        return await StorageService.get('planner_motivacional') || [];
    }

    static async getDevocionalList() {
        return await StorageService.get('planner_devocional') || [];
    }
    
    static async getShoppingList() {
        return await StorageService.get('planner_compras') || [];
    }
}

window.ContentService = ContentService;