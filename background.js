// background.js

// Escuta a criação de alarmes ou a hora de disparar
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('planner_alarm_')) {
        const alarmData = JSON.parse(alarm.name.replace('planner_alarm_', ''));
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7inqQ8L3RleHQ+PC9zdmc+',
            title: `Lembrete: ${alarmData.title}`,
            message: "O Total Planner está chamando sua atenção para este compromisso ou hábito.",
            priority: 2
        });
    }
});

// Função para agendar alarmes baseada nos dados do storage
async function scheduleAlarms() {
    // 1. Limpa alarmes antigos
    await chrome.alarms.clearAll();

    // 2. Busca alarmes do storage
    chrome.storage.local.get(['planner_alarme'], (result) => {
        const alarms = result.planner_alarme || [];
        const now = new Date();

        alarms.forEach(alarm => {
            // Lógica simplificada: agenda para o próximo horário
            // (Note: Para recorrência complexa, precisaríamos de uma lógica de cron mais robusta)
            const [hours, minutes] = alarm.time.split(':');
            let alarmTime = new Date();
            alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (alarmTime <= now) {
                alarmTime.setDate(alarmTime.getDate() + 1);
            }

            chrome.alarms.create(`planner_alarm_${JSON.stringify(alarm)}`, {
                when: alarmTime.getTime(),
                periodInMinutes: 1440 // Diário (24h)
            });
        });
    });
}

// Escuta mudanças no storage para atualizar alarmes
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.planner_alarme) {
        scheduleAlarms();
    }
});

// Inicializa ao instalar ou atualizar a extensão
chrome.runtime.onInstalled.addListener(scheduleAlarms);
