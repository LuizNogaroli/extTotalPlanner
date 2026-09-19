class NotificationService {
    constructor() {
        this.hasPermission = false;
    }

    async init() {
        if (!("Notification" in window)) {
            console.warn("Este navegador não suporta notificações de desktop.");
            return;
        }

        // Verifica permissão (apenas para manter compatibilidade com o fluxo atual)
        if (Notification.permission === "granted") {
            this.hasPermission = true;
        }
    }

    async requestPermission() {
        if (!("Notification" in window)) {
            alert("Este navegador não suporta notificações.");
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            this.hasPermission = true;
            return true;
        } else {
            this.hasPermission = false;
            alert("Permissão para notificações negada.");
            return false;
        }
    }
}

window.NotificationService = new NotificationService();
window.NotificationService.init();
