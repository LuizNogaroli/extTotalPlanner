// Notificações de Alarme — Web API `Notification` + som sintetizado (Web Audio API).
// Base inspirada em extListaDeCompras (docs/notifications-and-sound.md, notifications.ts, sound.ts).
//
// Diferença essencial em relação à referência: lá a notificação dispara no submit do formulário,
// dentro do gesto do usuário. Aqui o alarme é AGENDADO, então um motor verifica periodicamente o
// relógio. Por isso este arquivo tem proteções que a referência não precisa:
//   1. Várias abas (New Tab override): cada aba roda o motor. Um registro de "já disparado",
//      compartilhado no localStorage e protegido por Web Locks, garante um aviso só por alarme.
//   2. Aba em segundo plano / PC suspenso: o Chrome reduz os timers a ~1x por minuto, e o minuto
//      exato pode ser perdido. O motor dispara o que venceu nos últimos GRACE_MS, não só o minuto exato.
//   3. Som: navegadores só liberam áudio depois de um gesto do usuário na página. O AudioContext é
//      criado no primeiro clique/tecla da aba, para já estar liberado quando o alarme disparar.

const ALARME_GRACE_MS = 10 * 60 * 1000;               // tolerância de atraso: 10 min
const ALARME_DISPAROS_KEY = 'planner_alarme_disparos'; // { [alarmId]: 'YYYY-MM-DDTHH:mm' }
const ALARME_LOCK = 'planner-alarme-check';

class NotificationService {
    constructor() {
        this.checkIntervalMs = 20000;
        this._intervalHandle = null;
        this._audioCtx = null;
    }

    // ==================== Permissão (igual à referência) ====================

    getPermission() {
        if (!("Notification" in window)) return "unsupported";
        return Notification.permission; // "default" | "granted" | "denied"
    }

    async requestPermission() {
        if (!("Notification" in window)) return "unsupported";
        return Notification.requestPermission();
    }

    // Texto/estado do botão de permissão, compartilhado por Configurações e pelo gerenciador de Alarmes.
    // Depois de "denied", o navegador nunca mostra o prompt de novo, por isso o botão fica desabilitado.
    describePermission(status = this.getPermission()) {
        switch (status) {
            case 'granted': return { label: '🔔 Notificações ativas', disabled: true, title: '' };
            case 'denied': return { label: '🔕 Notificações bloqueadas', disabled: true, title: 'Bloqueado nas permissões do navegador: clique no ícone à esquerda da barra de endereço → Notificações → Permitir, e recarregue a página.' };
            case 'unsupported': return { label: '🔕 Não suportado neste navegador', disabled: true, title: '' };
            default: return { label: '🔔 Ativar notificações', disabled: false, title: '' };
        }
    }

    // ==================== Aviso + som ====================

    notify(title, body, extra = {}) {
        if (this.getPermission() !== 'granted') return false;
        const notification = new Notification(title, { body, ...extra });
        notification.onclick = () => {
            window.focus();
            if (notification.close) notification.close();
        };
        return true;
    }

    // Disparo manual para o usuário conferir, na própria máquina, se o aviso e o som aparecem.
    // Chamado a partir de um clique, então também libera o áudio.
    test() {
        const ok = this.notify('🔔 Teste do Total Planner', 'Se você está vendo este aviso, os alarmes vão aparecer assim.', { tag: 'planner-teste' });
        if (ok) this.playAlarmSound();
        return ok;
    }

    _getAudioContext() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        if (!this._audioCtx) this._audioCtx = new Ctx();
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume().catch(() => {});
        return this._audioCtx;
    }

    _unlockAudioOnFirstGesture() {
        const unlock = () => {
            this._getAudioContext();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
    }

    _playTone(ctx, frequency, startTime, duration) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        // envelope: sobe rápido e decai suave, evitando o "clique" de ligar/desligar a onda
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.02);
    }

    // "Ding-dong" duas vezes (A5 → D6). Mais longo e suave que a "moeda" da referência:
    // é um lembrete, não um feedback de ação.
    playAlarmSound() {
        try {
            const ctx = this._getAudioContext();
            if (!ctx) return;
            const t = ctx.currentTime;
            [[880, 0], [1175, 0.18], [880, 0.55], [1175, 0.73]]
                .forEach(([freq, dt]) => this._playTone(ctx, freq, t + dt, 0.3));
        } catch (e) {
            // sem áudio disponível: o aviso visual continua funcionando
        }
    }

    // "Tilintar de moeda" (cópia de extListaDeCompras/sound.ts): duas notas curtas e ascendentes,
    // usado nos avisos da Lista de Compras (preço/fornecedor).
    playCoinSound() {
        try {
            const ctx = this._getAudioContext();
            if (!ctx) return;
            const t = ctx.currentTime;
            const tom = (freq, start, dur) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.15, start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + dur + 0.02);
            };
            tom(988, t, 0.09);          // B5
            tom(1319, t + 0.07, 0.16);  // E6
        } catch (e) {
            // sem áudio: o aviso visual continua
        }
    }

    // ==================== Motor de alarmes ====================

    // Chamar uma única vez (idempotente).
    start() {
        if (this._intervalHandle) return;
        this._unlockAudioOnFirstGesture();
        this.checkAlarms();
        this._intervalHandle = setInterval(() => this.checkAlarms(), this.checkIntervalMs);
        // Ao voltar para a aba, verifica na hora em vez de esperar o próximo tick (que pode estar atrasado).
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.checkAlarms();
        });
    }

    async checkAlarms() {
        if (this.getPermission() !== 'granted') return;
        if (typeof StorageService === 'undefined') return;

        const alarms = (await StorageService.get('planner_alarme')) || [];
        if (alarms.length === 0) return;

        const run = () => this._fireDue(alarms, new Date());
        // Web Locks serializa a verificação entre abas: sem isso, duas abas leem o registro
        // ao mesmo tempo, ambas concluem que o alarme ainda não disparou e ambas avisam.
        if (navigator.locks) await navigator.locks.request(ALARME_LOCK, run);
        else run();
    }

    // Chamado ao salvar/editar um alarme: marca como "já tratadas" as ocorrências que já passaram,
    // para um alarme criado às 20:05 com horário 20:00 não disparar na hora por causa da tolerância.
    markHandled(alarm) {
        if (!alarm || !alarm.id || !alarm.time) return;
        const now = new Date();
        const passadas = this._occurrences(alarm, now).filter(when => when <= now);
        if (passadas.length === 0) return;
        const maisRecente = passadas.reduce((a, b) => (a > b ? a : b));
        const fired = this._readFired();
        fired[alarm.id] = this._key(maisRecente);
        this._writeFired(fired);
    }

    _fireDue(alarms, now) {
        const fired = this._readFired();
        let changed = false;

        for (const alarm of alarms) {
            if (!alarm.id || !alarm.time) continue;
            for (const when of this._occurrences(alarm, now)) {
                const atraso = now - when;
                if (atraso < 0 || atraso > ALARME_GRACE_MS) continue;
                const key = this._key(when);
                if (fired[alarm.id] === key) continue;
                fired[alarm.id] = key;
                changed = true;
                this._fire(alarm, when, atraso);
            }
        }

        // Limpa entradas de alarmes que foram excluídos
        const ids = new Set(alarms.map(a => a.id));
        for (const id of Object.keys(fired)) {
            if (!ids.has(id)) { delete fired[id]; changed = true; }
        }

        if (changed) this._writeFired(fired);
    }

    _fire(alarm, when, atraso) {
        const minutos = Math.round(atraso / 60000);
        const sufixo = minutos >= 1 ? ` (aviso com ${minutos} min de atraso)` : '';
        const ok = this.notify(
            `⏰ ${alarm.title}`,
            `Lembrete das ${alarm.time}${sufixo}.`,
            { tag: `planner-alarme-${alarm.id}-${this._key(when)}`, requireInteraction: true }
        );
        if (ok) this.playAlarmSound();
    }

    // Ocorrências do alarme hoje e ontem (ontem cobre alarmes perto da meia-noite, ex.: 23:58
    // verificado às 00:03), já filtradas pela regra de recorrência.
    _occurrences(alarm, now) {
        const [h, m] = alarm.time.split(':').map(Number);
        const recurrence = alarm.recurrence || 'diario';
        const result = [];
        for (const offset of [0, -1]) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, m, 0, 0);
            if (recurrence === 'unico' && alarm.date !== this._ymd(d)) continue;
            if (recurrence === 'semanal' && !(alarm.weekdays || []).includes(String(d.getDay()))) continue;
            result.push(d);
        }
        return result;
    }

    _ymd(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    _key(d) {
        return `${this._ymd(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    // A cópia em memória (_memFired) é a reserva caso o localStorage falhe: sem ela, o mesmo alarme
    // dispararia de novo a cada verificação durante toda a janela de tolerância.
    _readFired() {
        let stored = {};
        try { stored = JSON.parse(localStorage.getItem(ALARME_DISPAROS_KEY)) || {}; }
        catch (e) { /* usa só a memória */ }
        return { ...(this._memFired || {}), ...stored };
    }

    _writeFired(fired) {
        this._memFired = { ...fired };
        try { localStorage.setItem(ALARME_DISPAROS_KEY, JSON.stringify(fired)); }
        catch (e) { /* storage indisponível: a memória ainda evita repetição nesta aba */ }
    }
}

window.NotificationService = new NotificationService();
