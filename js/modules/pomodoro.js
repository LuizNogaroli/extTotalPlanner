/**
 * pomodoro.js — Timer Pomodoro (menu Recursos → Pomodoro).
 *
 * Ciclo clássico: Foco (25 min) → Pausa curta (5 min), e a cada 4 focos uma Pausa longa (15 min).
 * Os tempos são configuráveis. O próximo período não começa sozinho: o usuário clica em Iniciar.
 *
 * Decisões de robustez (mesmas lições do motor de alarmes, MANUAL_TECNICO §3.23):
 *  - O tempo é guardado como o instante de término (`fimEm`), não como um contador decrementado.
 *    Assim o relógio continua certo mesmo com timers atrasados em aba de segundo plano.
 *  - O fim do período é detectado por um setTimeout único, agendado para o instante exato. Timers
 *    avulsos sofrem só o throttling leve (~1 s); cadeias de timers sofreriam o intensivo (~1 min).
 *  - O estado fica no localStorage, compartilhado entre abas. Todas mostram o mesmo timer
 *    (evento 'storage'), e o aviso de fim sai uma vez só (Web Lock + `ultimoFimProcessado`).
 */

const ESTADO_KEY = 'planner_pomodoro_estado';
const CONFIG_KEY = 'planner_pomodoro_config';
const LOCK = 'planner-pomodoro-fim';
const CONFIG_PADRAO = { foco: 25, pausaCurta: 5, pausaLonga: 15, ciclos: 4 };
const MODOS = {
    foco: { nome: 'Foco', icone: '🍅' },
    pausaCurta: { nome: 'Pausa curta', icone: '☕' },
    pausaLonga: { nome: 'Pausa longa', icone: '🌿' }
};

const ler = (key, padrao) => {
    try { return { ...padrao, ...(JSON.parse(localStorage.getItem(key)) || {}) }; }
    catch (e) { return { ...padrao }; }
};
const gravar = (key, valor) => {
    try { localStorage.setItem(key, JSON.stringify(valor)); } catch (e) { /* segue só em memória */ }
};
const mmss = (ms) => {
    const total = Math.ceil(ms / 1000);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const hhmm = (ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export class Pomodoro {
    constructor({ hideAllViews }) {
        this.hideAllViews = hideAllViews;
        this.tituloOriginal = document.title;
        this.config = ler(CONFIG_KEY, CONFIG_PADRAO);
        this.estado = ler(ESTADO_KEY, this._estadoInicial());
        this._timeoutFim = null;
        this.view = null;
        this.montado = false;
    }

    _estadoInicial() {
        return { modo: 'foco', rodando: false, fimEm: null, restanteMs: this.config.foco * 60000, focos: 0, ultimoFimProcessado: null };
    }

    // Chamado uma vez no boot do app.js: o timer continua rodando mesmo fora da página do Pomodoro.
    iniciarMotor() {
        this._agendarFim();
        this.verificarFim();
        setInterval(() => this._tick(), 250);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) this.verificarFim(); });
        window.addEventListener('storage', (e) => {
            if (e.key === ESTADO_KEY || e.key === CONFIG_KEY) {
                this.config = ler(CONFIG_KEY, CONFIG_PADRAO);
                this.estado = ler(ESTADO_KEY, this._estadoInicial());
                this._agendarFim();
                this._render();
            }
        });
    }

    abrir() {
        this.hideAllViews();
        this.view = document.getElementById('view-pomodoro');
        this.view.classList.remove('hidden');
        this.view.classList.add('flex');
        if (!this.montado) this._montar();
        this._render();
        if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.add('closed');
    }

    // ---------- Regras do timer ----------

    duracaoMs(modo) { return this.config[modo] * 60000; }

    restanteMs() {
        return this.estado.rodando ? Math.max(0, this.estado.fimEm - Date.now()) : this.estado.restanteMs;
    }

    _persistir() {
        gravar(ESTADO_KEY, this.estado);
        this._agendarFim();
        this._render();
    }

    iniciar() {
        if (this.estado.rodando) return;
        this.estado.fimEm = Date.now() + this.estado.restanteMs;
        this.estado.rodando = true;
        this._persistir();
    }

    pausar() {
        if (!this.estado.rodando) return;
        this.estado.restanteMs = this.restanteMs();
        this.estado.rodando = false;
        this.estado.fimEm = null;
        this._persistir();
    }

    zerar() {
        this.estado.rodando = false;
        this.estado.fimEm = null;
        this.estado.restanteMs = this.duracaoMs(this.estado.modo);
        this._persistir();
    }

    trocarModo(modo) {
        this.estado.modo = modo;
        this.zerar();
    }

    // Pular não conta o foco como concluído: só avança para o próximo período.
    pular() {
        this.trocarModo(this._proximoModo(false));
    }

    zerarContagem() {
        this.estado.focos = 0;
        this._persistir();
    }

    _proximoModo(focoConcluido) {
        if (this.estado.modo !== 'foco') return 'foco';
        const focos = this.estado.focos + (focoConcluido ? 1 : 0);
        return focoConcluido && focos % this.config.ciclos === 0 ? 'pausaLonga' : 'pausaCurta';
    }

    _agendarFim() {
        clearTimeout(this._timeoutFim);
        if (!this.estado.rodando) return;
        this._timeoutFim = setTimeout(() => this.verificarFim(), Math.max(0, this.estado.fimEm - Date.now()) + 100);
    }

    async verificarFim() {
        if (!this.estado.rodando || Date.now() < this.estado.fimEm) return;
        const processar = () => this._processarFim();
        if (navigator.locks) await navigator.locks.request(LOCK, processar);
        else processar();
    }

    _processarFim() {
        // Relê do storage dentro da trava: outra aba pode já ter tratado este mesmo fim
        const atual = ler(ESTADO_KEY, this._estadoInicial());
        if (!atual.rodando || atual.ultimoFimProcessado === atual.fimEm || Date.now() < atual.fimEm) {
            this.estado = atual;
            this._agendarFim();
            this._render();
            return;
        }

        this.estado = atual;
        const fim = atual.fimEm;
        const eraFoco = atual.modo === 'foco';
        const proximo = this._proximoModo(eraFoco);
        this.estado = {
            modo: proximo,
            rodando: false,
            fimEm: null,
            restanteMs: this.duracaoMs(proximo),
            focos: atual.focos + (eraFoco ? 1 : 0),
            ultimoFimProcessado: fim
        };
        gravar(ESTADO_KEY, this.estado);
        this._agendarFim();
        this._render();
        this._avisar(eraFoco, proximo, fim);
    }

    _avisar(eraFoco, proximo, fim) {
        const ns = window.NotificationService;
        if (!ns) return;
        const atraso = Date.now() - fim > 60000 ? ` (terminou às ${hhmm(fim)})` : '';
        const titulo = eraFoco ? '🍅 Foco concluído!' : '⏰ Pausa encerrada';
        const corpo = eraFoco
            ? `Hora da ${MODOS[proximo].nome.toLowerCase()} de ${this.config[proximo]} min. Focos concluídos: ${this.estado.focos}.${atraso}`
            : `Hora de voltar ao foco (${this.config.foco} min).${atraso}`;
        if (ns.notify(titulo, corpo, { tag: `planner-pomodoro-${fim}` })) ns.playAlarmSound();
    }

    // ---------- Interface ----------

    _montar() {
        this.view.innerHTML = `
            <div class="pm-app">
                <h2>🍅 Pomodoro</h2>
                <div class="pm-modos" role="tablist">
                    ${Object.entries(MODOS).map(([k, m]) => `<button type="button" class="pm-modo" data-modo="${k}">${m.icone} ${m.nome}</button>`).join('')}
                </div>
                <div class="pm-relogio">
                    <div class="pm-tempo" id="pm-tempo">25:00</div>
                    <div class="pm-barra"><div class="pm-progresso" id="pm-progresso"></div></div>
                    <p class="pm-legenda" id="pm-legenda"></p>
                </div>
                <div class="pm-controles">
                    <button type="button" class="pm-btn primario" data-acao="iniciar-pausar" id="pm-btn-principal">Iniciar</button>
                    <button type="button" class="pm-btn" data-acao="zerar">Zerar</button>
                    <button type="button" class="pm-btn" data-acao="pular">Pular ⏭</button>
                </div>
                <div class="pm-ciclos">
                    <div class="pm-pontos" id="pm-pontos"></div>
                    <span id="pm-contagem"></span>
                    <button type="button" class="pm-link" data-acao="zerar-contagem">zerar contagem</button>
                </div>
                <details class="pm-config">
                    <summary>⚙️ Configurar tempos</summary>
                    <form id="pm-form-config" class="pm-config-form">
                        <label>Foco (min)<input type="number" name="foco" min="1" max="180" required></label>
                        <label>Pausa curta (min)<input type="number" name="pausaCurta" min="1" max="60" required></label>
                        <label>Pausa longa (min)<input type="number" name="pausaLonga" min="1" max="90" required></label>
                        <label>Focos até a pausa longa<input type="number" name="ciclos" min="2" max="8" required></label>
                        <button type="submit" class="pm-btn primario">Salvar tempos</button>
                    </form>
                </details>
                <div class="pm-aviso" id="pm-aviso">
                    <span id="pm-aviso-texto"></span>
                    <button type="button" class="pm-btn" data-acao="permissao" id="pm-btn-permissao"></button>
                </div>
            </div>`;

        this.view.addEventListener('click', async (e) => {
            // '.pm-modo' e não '[data-modo]': o contêiner .pm-app também tem data-modo (usado pela cor do período)
            const modo = e.target.closest('.pm-modo');
            if (modo) return this.trocarModo(modo.dataset.modo);
            const acao = e.target.closest('[data-acao]')?.dataset.acao;
            if (acao === 'iniciar-pausar') return this.estado.rodando ? this.pausar() : this.iniciar();
            if (acao === 'zerar') return this.zerar();
            if (acao === 'pular') return this.pular();
            if (acao === 'zerar-contagem') { if (confirm('Zerar a contagem de focos concluídos?')) this.zerarContagem(); return; }
            if (acao === 'permissao') { await window.NotificationService.requestPermission(); this._render(); }
        });

        const form = this.view.querySelector('#pm-form-config');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const n = (nome, min, max) => Math.min(max, Math.max(min, Math.round(Number(form.elements.namedItem(nome).value) || CONFIG_PADRAO[nome])));
            this.config = { foco: n('foco', 1, 180), pausaCurta: n('pausaCurta', 1, 60), pausaLonga: n('pausaLonga', 1, 90), ciclos: n('ciclos', 2, 8) };
            gravar(CONFIG_KEY, this.config);
            // Com o timer parado, o período atual passa a usar o novo tempo. Rodando, vale do próximo em diante.
            if (!this.estado.rodando) this.zerar(); else this._render();
            form.closest('details').open = false;
        });
        this.montado = true;
    }

    _tick() {
        const rodando = this.estado.rodando;
        const restante = this.restanteMs();
        document.title = rodando ? `${mmss(restante)} ${MODOS[this.estado.modo].icone} · ${this.tituloOriginal}` : this.tituloOriginal;
        if (this.view && !this.view.classList.contains('hidden')) this._renderTempo();
    }

    _renderTempo() {
        const restante = this.restanteMs();
        const total = this.duracaoMs(this.estado.modo);
        this.view.querySelector('#pm-tempo').textContent = mmss(restante);
        this.view.querySelector('#pm-progresso').style.width = `${Math.min(100, Math.max(0, (1 - restante / total) * 100))}%`;
    }

    _render() {
        if (!this.view || !this.montado) return;
        const { modo, rodando, focos } = this.estado;
        const v = this.view;

        v.querySelectorAll('.pm-modo').forEach(b => b.classList.toggle('ativo', b.dataset.modo === modo));
        v.querySelector('.pm-app').dataset.modo = modo;
        v.querySelector('#pm-btn-principal').textContent = rodando ? '⏸ Pausar' : '▶ Iniciar';

        const restante = this.restanteMs();
        const cheio = restante >= this.duracaoMs(modo);
        v.querySelector('#pm-legenda').textContent = rodando
            ? `${MODOS[modo].nome} em andamento · termina às ${hhmm(this.estado.fimEm)}`
            : cheio ? `${MODOS[modo].nome} · pronto para começar` : `${MODOS[modo].nome} · pausado`;
        this._renderTempo();

        const noCiclo = focos % this.config.ciclos;
        const preenchidos = noCiclo === 0 && focos > 0 && modo === 'pausaLonga' ? this.config.ciclos : noCiclo;
        v.querySelector('#pm-pontos').innerHTML = Array.from({ length: this.config.ciclos }, (_, i) =>
            `<span class="pm-ponto${i < preenchidos ? ' cheio' : ''}"></span>`).join('');
        v.querySelector('#pm-contagem').textContent = `${focos} ${focos === 1 ? 'foco concluído' : 'focos concluídos'}`;

        const form = v.querySelector('#pm-form-config');
        for (const k of Object.keys(CONFIG_PADRAO)) form.elements.namedItem(k).value = this.config[k];

        const ns = window.NotificationService;
        const aviso = v.querySelector('#pm-aviso');
        const status = ns ? ns.getPermission() : 'unsupported';
        aviso.hidden = status === 'granted';
        if (status !== 'granted') {
            const info = ns ? ns.describePermission(status) : { label: '', disabled: true, title: '' };
            v.querySelector('#pm-aviso-texto').textContent = status === 'denied'
                ? 'As notificações estão bloqueadas: o fim de cada período só vai aparecer nesta tela.'
                : 'Ative as notificações para ser avisado quando cada período terminar, mesmo em outra aba.';
            const btn = v.querySelector('#pm-btn-permissao');
            btn.textContent = info.label;
            btn.title = info.title || '';
            btn.disabled = info.disabled;
        }
    }
}
