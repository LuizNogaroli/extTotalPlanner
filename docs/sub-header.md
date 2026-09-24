# Sub-header (Faixa dos Dias da Semana) — Detalhes Técnicos de Implementação

> Estado documentado em **2026-09-23**, após a v1.35 do `MANUAL_TECNICO.md`.
> Os números de linha são aproximados e mudam com o tempo. Para localizar o código, prefira buscar pelo `id` ou pelo nome da função.
> Documento irmão: [`header.md`](header.md), o cabeçalho principal logo acima, com o breadcrumb Ano › Mês › Semana.

---

## 1. Visão geral

O sub-header é a faixa fina logo abaixo do header. Ela mostra os **7 dias da semana exibida** como botões. Clicar num dia abre a **Visão Diária** daquele dia, e o dia aberto fica destacado.

```
┌──────────────────────────────────────────────────────────────┐
│        Dom    Seg    Ter   [Qua]   Qui    Sex    Sáb          │
│       20/09  21/09  22/09  23/09  24/09  25/09  26/09         │
└──────────────────────────────────────────────────────────────┘
                              ▲ dia aberto na Visão Diária (fundo cinza + borda na cor primária)
```

Os dias aparecem em duas telas:

| Tela | Semana mostrada |
| :--- | :--- |
| Dashboard ("Meu Planner") | A semana exibida no Dashboard (a atual, ou a escolhida no breadcrumb) |
| Plano Semanal | A semana do plano aberto (`planosPeriodoSelecionado.plano_semanal`) |

Em todas as outras telas, o sub-header fica **vazio**, mas a faixa continua ocupando espaço. Ver §6.

---

## 2. Estrutura HTML

Arquivo: `index.html`, logo depois do `</header>` e antes de `#view-dashboard` (~linhas 140–143).

```html
<!-- Sub Header (Navegação Dinâmica) -->
<div class="bg-[var(--bg-panel)] border-b border-[var(--border-color)] px-4 py-1 flex justify-center">
    <div id="dynamic-header-tabs" class="flex items-center space-x-2"></div>
</div>
```

- O contêiner externo é estático e sempre existe: mesmo fundo do header (`--bg-panel`), borda inferior e conteúdo centralizado.
- `#dynamic-header-tabs` começa vazio. O conteúdo é sempre montado por JavaScript.
- Assim como o header, o sub-header é filho direto de `<main>` e fica **fora** das views. Por isso ele não some quando `hideAllViews()` esconde uma view: ele só é **esvaziado**.

---

## 3. Montagem dos botões — `renderDiasNoSubheader(dates)`

Arquivo: `js/app.js`, função de nível superior do módulo (~l. 2607), perto de `renderPeriodoBreadcrumb()`.

**Entrada:** um array de 7 objetos `Date`, de domingo a sábado, normalmente vindo de `getWeekDates(dataBase)`.

**Para cada dia, gera um botão assim:**

```html
<button data-date="2026-09-23"
        class="tab-btn flex flex-col items-center justify-center px-3 py-2 rounded text-xs font-medium transition
               border border-transparent text-[var(--text-secondary)]
               hover:bg-[var(--border-color)] hover:text-[var(--primary-color)]
               day-dropzone tab-dropzone flex-shrink-0">
    <span class="font-bold">Qua</span>
    <span class="text-[10px] opacity-70">23/09</span>
</button>
```

| Parte | Detalhe |
| :--- | :--- |
| `data-date` | Data local no formato `YYYY-MM-DD`, montada com `getFullYear/getMonth/getDate`. **Nunca** com `toISOString()`, que usa UTC e pode deslocar um dia em fuso negativo (ver v1.20). |
| Rótulo | Abreviação fixa `['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][getDay()]` e a data `DD/MM`. |
| `.tab-btn` | Classe usada para achar os botões na hora de destacar o dia ativo (§5). |
| `.day-dropzone` / `.tab-dropzone` | Tornam o botão um alvo de *drag & drop* de atividades (§7). |
| `flex-shrink-0` | Impede que os botões se espremam em telas estreitas. |

Depois de montar o HTML (`innerHTML`), a função adiciona um listener de clique em cada botão. Os botões são recriados a cada chamada, então não há listeners antigos acumulados.

### 3.1. Definição de semana

`getWeekDates(date)` (`js/modules/dateUtils.js`, desde a v1.50) volta até o **domingo** e devolve os 7 dias a partir dele. A semana vai de **domingo a sábado**, igual ao Dashboard, ao número da semana (`getWeekNumber`) e à chave `YYYY-wWW` do breadcrumb do header.

### 3.2. Quem chama

| Chamador | Quando | Datas passadas |
| :--- | :--- | :--- |
| `renderWeeklyGrid(baseDate, layout)` | Toda vez que o Dashboard é desenhado. Isso acontece ao entrar na tela, trocar a semana pelo breadcrumb ou mudar o layout. | `getWeekDates(baseDate)` |
| `renderPlanoVersionado(...)`, só quando `tipo === 'plano_semanal'` | Ao abrir o Plano Semanal, inclusive vindo do breadcrumb | `getWeekDates(getDataDaSemana(periodoSelecionado))` |

Os Planos Anual e Mensal **não** chamam essa função, então o sub-header fica vazio neles.

---

## 4. Clique num dia → Visão Diária

```
clique no botão
  └─ listener (renderDiasNoSubheader)
       └─ window.appRouter.goDaily(new Date(y, m - 1, d))      // y, m, d vindos de data-date
            └─ switchToDailyView(date)
                 ├─ fecha o menu lateral se a tela tiver ≤ 768px
                 └─ openDailyView(date)
                      ├─ currentDailyDateStr = 'YYYY-MM-DD'
                      ├─ título da página (#daily-view-title) = "Qua - 23/09" (v1.37)
                      ├─ monta as atividades do dia
                      ├─ esconde #weekly-view-wrapper e mostra #daily-view-wrapper
                      ├─ atualiza o destaque dos botões (§5)
                      └─ carrega o Diário (planner_journal) daquele dia
```

- O listener usa `e.target.closest('button')`, porque o clique pode cair num dos `<span>` internos.
- A Visão Diária **não** é uma view separada. É o `#daily-view-wrapper`, que fica **dentro** de `#view-dashboard`, ao lado do `#weekly-view-wrapper`. `openDailyView()` só alterna entre esses dois; ela não chama `hideAllViews()` nem mostra `#view-dashboard`. Por isso `switchToDailyView()` (v1.46) checa se `#view-dashboard` está escondida antes de chamar `openDailyView()`: só nesse caso ela troca de tela (`hideAllViews()` + mostra `#view-dashboard` + repovoa o sub-header daquela semana) — ver §8 nº 1 (corrigido) e §9.
- Voltar para a semana (menu "Meu Planner" ou breadcrumb) chama `renderWeeklyGrid()`, que recria os botões sem nenhum destaque.

---

## 5. Destaque do dia ativo

Fica em `openDailyView()` (`app.js` ~l. 1600). Depois de mostrar o dia, o código percorre `#dynamic-header-tabs button.tab-btn`:

```javascript
const activeClasses   = ['border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'bg-[var(--bg-color)]'];
const inactiveClasses = ['text-[var(--text-secondary)]', 'border-transparent'];
const isActive = btn.dataset.date === currentDailyDateStr;
btn.classList.remove(...(isActive ? inactiveClasses : activeClasses));
btn.classList.add(...(isActive ? activeClasses : inactiveClasses));
```

- **Ativo:** fundo `--bg-color` (o cinza do fundo da página, que contrasta com o `--bg-panel` do sub-header), borda e texto na `--primary-color`.
  > ⚠️ **Na prática, só o fundo aparece.** `bg-[var(--bg-color)]` tem um utilitário de emergência em `styles.css`, mas `border-[var(--primary-color)]` e `text-[var(--primary-color)]` não existem no Tailwind local, que é o v2.2.19 sem JIT (`MANUAL_TECNICO.md` §3.21). O mesmo vale para `text-[var(--text-secondary)]` e `hover:…-[…]` dos botões. Se o destaque tiver que usar a cor primária, a regra precisa ir para `css/styles.css` (`pendencias.md` 2.1).
- **Inativo:** texto `--text-secondary` e borda transparente, o mesmo estado em que o botão é criado.
- **Regra:** o destaque e o reset usam **as mesmas duas listas**. Até a v1.34, o reset removia outras classes (`bg-[var(--primary-color)]`, `text-white`), que nunca eram adicionadas a esses botões. O cinza nunca saía e vários dias ficavam destacados ao mesmo tempo. Corrigido na v1.35 (`historico/destaque_dia_ativo_subheader_20260923_2215.md`).
- **Ao mudar o visual do destaque**, altere só essas duas listas. Não adicione classes no ramo "ativo" sem removê-las no ramo "inativo".

O mesmo laço tem um ramo para `btn.dataset.date === 'weekly'`, que é legado (§8).

---

## 6. Ciclo de vida

```
troca de tela
  └─ hideAllViews()  →  #dynamic-header-tabs.innerHTML = ''
       └─ a tela nova:
            • Dashboard     → renderWeeklyGrid()     → renderDiasNoSubheader(semana exibida)
            • Plano Semanal → renderPlanoVersionado() → renderDiasNoSubheader(semana do plano)
            • demais telas  → nada; os botões somem, mas a faixa continua na tela
```

- O contêiner tem `py-1` e borda, então nas telas sem dias sobra uma faixa fina vazia entre o header e o conteúdo. Não é erro, mas também não é intencional. Para escondê-la, seria preciso alternar `hidden` no contêiner externo, que hoje não tem `id`.
- A mesma chamada de `hideAllViews()` limpa o breadcrumb do header. Os dois são sempre repovoados juntos pelas mesmas telas (ver `header.md` §5).

---

## 7. Drag & drop de atividades para um dia

Os botões têm `.day-dropzone`, então arrastar um card de atividade (`.task-card`) e soltar sobre um dia **move a atividade para aquela data**.

- **Listeners:** `window.appRouter.initDragAndDrop()` percorre `.task-card` e `.day-dropzone` e registra `dragstart`, `dragenter`, `dragover`, `dragleave` e `drop`. Antes de registrar, remove o listener anterior para não duplicar. Essa função é chamada em `renderWeeklyGrid()`, **depois** de `renderDiasNoSubheader()`, então os botões do sub-header entram na varredura.
- **Realce durante o arraste:** `_handleDragEnter` adiciona `bg-[var(--border-color)] bg-opacity-50 ring-2 ring-[var(--primary-color)]`. `_handleDragLeave` e `_handleDrop` removem.
- **No drop (`_handleDrop`):**
  1. Lê `{ id, sourceDate }` do `dataTransfer`.
  2. Se a data de destino for igual à de origem, não faz nada.
  3. Senão, grava `activity.date = data-date do botão` em `planner_activities`.
- Alternativa sem arrastar (touch/mobile): o botão "➡️ Transferir" dos cards (`historico/layout_header_dnd_20260919_0054.md`).

Há dois problemas conhecidos neste fluxo (nºs 2 e 3 da §8).

---

## 8. Pontos de atenção conhecidos

| # | Ponto | Como foi constatado | Impacto |
| :---: | :--- | :--- | :--- |
| ~~1~~ | ~~No Plano Semanal, clicar num dia do sub-header não mostra a Visão Diária.~~ **Corrigido na v1.46** — ver §9. | — | — |
| 2 | **Drag & drop não funciona nos dias do sub-header dentro do Plano Semanal.** Os botões têm `.day-dropzone`, mas `initDragAndDrop()` só roda em `renderWeeklyGrid()`. | Leitura do código (não testado com arraste real). | No Plano Semanal, soltar uma atividade sobre um dia não faz nada. |
| 3 | **Depois de soltar uma atividade num dia, a tela não se atualiza.** `_handleDrop` dispara `new CustomEvent('layoutChange')` em `document`, mas os listeners de re-render escutam `'layoutChanged'` em `window`. O nome e o alvo são diferentes. | Leitura do código (não testado com arraste real). | A atividade é gravada na data nova, mas a grade só mostra a mudança depois de outra navegação ou de recarregar. |
| 4 | Ramo legado `data-date === 'weekly'`, em `openDailyView()` (destaque) e em `_handleDrop` (só faz `console.log` "em desenvolvimento"). | Leitura do código: `renderDiasNoSubheader()` nunca cria esse botão. | É código morto. Resto da antiga aba "Foco da Semana" no cabeçalho. |
| 5 | Faixa vazia do sub-header nas telas sem dias. | Visto no navegador. | Só visual (§6). |

---

## 9. Histórico das principais mudanças no sub-header

| Versão / data | Mudança | Registro |
| :--- | :--- | :--- |
| v1.3 | Contêiner do sub-header criado para "navegação dinâmica". Ficou vazio por um bom tempo. | `MANUAL_TECNICO.md` §6 |
| 2026-09-19 | Abas de dia viram `.day-dropzone` (drag & drop) e trocam `['DOM','SEG']` + `uppercase` por `['Dom','Seg']`. Na época ficavam no centro do header. | `historico/layout_header_dnd_20260919_0054.md` |
| v1.31 | Os 7 dias saem do centro do header e vão para `#dynamic-header-tabs`. Nasce `renderDiasNoSubheader(dates)`, também usada pelo Plano Semanal. Um destaque do dia que nunca funcionava passou a funcionar sem mudança adicional. | `historico/breadcrumb_dashboard_subheader_20260920_0100.md` |
| v1.35 | Destaque do dia ativo deixa de acumular: o reset agora remove as mesmas classes que o destaque adiciona. | `historico/destaque_dia_ativo_subheader_20260923_2215.md` |
| v1.46 | Clicar num dia a partir do Plano Semanal passa a abrir a Visão Diária de fato: `switchToDailyView()` troca para `#view-dashboard` antes de `openDailyView()` quando ela não é a tela ativa. | `historico/fix_dia_plano_semanal_invisivel_20260924_0300.md` |

---

## 10. Como testar

Suba o app com `rodar.bat` (cache desativado; ver §3.11 do `MANUAL_TECNICO.md`) e confira:

- [ ] No Dashboard, aparecem 7 dias de domingo a sábado, batendo com a semana do breadcrumb.
- [ ] Clicar num dia abre a Visão Diária e só aquele dia fica destacado. Clicar em outro dia move o destaque, sem acumular.
- [ ] Trocar a semana pelo breadcrumb (Ano ou Mês) atualiza os 7 dias.
- [ ] No Plano Semanal, os dias são os da semana do plano e clicar num deles abre a Visão Diária (troca para o Dashboard; v1.46, §9).
- [ ] Nos Planos Anual/Mensal, em Atividades e em Configurações, o sub-header fica vazio.
- [ ] Arrastar um card para um dia do sub-header realça o botão e move a atividade. *(Hoje a tela não se atualiza sozinha; ver §8 nº 3.)*

Para conferir o destaque pelo console:

```javascript
[...document.querySelectorAll('#dynamic-header-tabs .tab-btn')]
  .filter(b => b.classList.contains('bg-[var(--bg-color)]'))
  .map(b => b.dataset.date)   // deve ter no máximo 1 item
```
