# Header (Cabeçalho Principal) — Detalhes Técnicos de Implementação

> Estado documentado em **2026-09-23**, após a v1.38 do `MANUAL_TECNICO.md` (remoção dos botões "Relatório" e "+ Novo").
> Os números de linha são aproximados e mudam com o tempo. Para localizar o código, prefira buscar pelo `id` ou pelo nome da função.
> Documento irmão: [`sub-header.md`](sub-header.md), a faixa logo abaixo do header, com os dias da semana.

---

## 1. Visão geral

O header é a barra fixa no topo da área de conteúdo (`<main>`), à direita do menu lateral. Ele aparece em todas as telas e tem três zonas:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [☰]              │   2026 › Setembro › Semana 39    │                         [☀] │
│  esquerda        │   centro (breadcrumb de período)   │  direita (tema)             │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Esquerda:** botão hambúrguer, que abre e fecha o menu lateral.
- **Centro:** breadcrumb de período **Ano › Mês › Semana**. Só aparece no Dashboard ("Meu Planner") e nos três Planos.
- **Direita:** só o botão de alternar tema claro/escuro, encostado na borda direita. Os botões "Relatório" e "+ Novo" foram removidos na v1.38 (ver §7).

O header é **HTML estático** em `index.html`. Só o centro é montado por JavaScript, a cada troca de tela.

---

## 2. Estrutura HTML

Arquivo: `index.html`, dentro de `<main>`, logo no início (~linhas 99–138).

```html
<main class="flex-1 flex flex-col h-full bg-[var(--bg-color)] relative">
  <header class="border-b border-[var(--border-color)] px-4 bg-[var(--bg-panel)] flex-shrink-0 py-2">
    <div class="flex items-center justify-between w-full">

      <!-- Esquerda -->
      <div class="flex items-center flex-1">
        <button id="btn-toggle-sidebar" title="Menu">…svg ☰…</button>
        <span id="current-week-display" class="hidden"></span>   <!-- nunca visível, ver §6 -->
        <h2  id="main-view-title"      class="hidden"></h2>      <!-- nunca visível, ver §6 -->
      </div>

      <!-- Centro -->
      <div class="flex justify-center flex-[2] md:flex-[3] overflow-x-auto" style="scrollbar-width: none;">
        <div id="header-week-tabs"       class="flex items-center space-x-2"></div>  <!-- legado, sempre vazio -->
        <div id="header-periodo-buttons" class="flex items-center space-x-2"></div>  <!-- breadcrumb -->
      </div>

      <!-- Direita -->
      <div class="flex items-center justify-end flex-1 space-x-2">
        <button id="btn-theme-toggle" class="… hidden sm:block">…svg ☀…</button>
      </div>

    </div>
  </header>

  <!-- Sub-header logo em seguida (ver sub-header.md) -->
```

### 2.1. Layout das três zonas (Flexbox)

| Zona | Classes | Efeito |
| :--- | :--- | :--- |
| Esquerda | `flex-1` | 1 parte da largura |
| Centro | `flex-[2] md:flex-[3]` | 2 partes em telas pequenas, 3 a partir de 768px |
| Direita | `flex-1 justify-end` | 1 parte da largura, conteúdo alinhado à direita. Hoje só contém o ☀, que fica a 16px da borda: o `px-4` do `<header>`. |

Como esquerda e direita têm o mesmo peso (`flex-1`), o centro fica centralizado na tela mesmo quando os dois lados têm quantidades diferentes de botões. Essa centralização vem da refatoração de 2026-09-19 (`historico/layout_header_dnd_20260919_0054.md`).

O centro tem `overflow-x-auto` e `scrollbar-width: none`: se o conteúdo não couber, ele rola na horizontal sem mostrar barra de rolagem. **Esse `overflow-x-auto` é a razão de os dropdowns do breadcrumb viverem fora do header** (ver §4.4).

### 2.2. Cores e tema

Todas as cores vêm de variáveis CSS (`--bg-panel`, `--border-color`, `--text-secondary`, `--primary-color`, `--primary-hover`), definidas em `css/themes.css` e trocadas pelo atributo `data-theme` no `<body>`. O header não tem CSS próprio em `css/styles.css`, só classes Tailwind do arquivo local `css/tailwind.css`. O arquivo é local por causa da CSP do Manifest V3.

> ⚠️ **Descoberto na v1.45:** o `tailwind.css` é o v2.2.19 **sem JIT**, e nele **nenhuma classe com valor arbitrário existe** (`MANUAL_TECNICO.md` §3.21). No header, isso quer dizer:
> - `bg-[var(--bg-panel)]` funciona, porque tem um "utilitário de emergência" em `styles.css`;
> - `border-[var(--border-color)]`, `text-[var(--text-secondary)]`, `hover:bg-[var(--border-color)]` e `hover:text-[var(--primary-color)]` **não se aplicam**. As bordas ficam no cinza padrão do Tailwind (claro também no tema escuro), e os ícones e hovers ficam sem essas cores.
> - No breadcrumb, as classes dos segmentos e dropdowns (`bg-[var(--primary-color)]`, `text-white`) funcionam, mas `border-[var(--border-color)]` e `hover:bg-[var(--border-color)]` não.
>
> A estratégia para corrigir está em `pendencias.md` 2.1.

Na impressão (`@media print` em `css/styles.css`), o `header` recebe `display: none !important`.

---

## 3. Elementos, um a um

| Elemento | Visibilidade | Quem controla (JS) | O que faz |
| :--- | :--- | :--- | :--- |
| `#btn-toggle-sidebar` | Sempre | `js/app.js`, logo após a configuração dos botões de layout (~l. 1212) | `sidebar.classList.toggle('closed')`. A classe `.closed` aplica `margin-left: -16rem` com transição de 0,3s (`css/styles.css`). Abaixo de 768px o menu vira overlay (`position: absolute; z-index: 50`) e já começa fechado (`if (window.innerWidth <= 768) sidebar.classList.add('closed')`). |
| `#current-week-display` | **Nunca** (`hidden` fixo) | Várias funções escrevem nele, via a variável `headerTitle` (`app.js` ~l. 41) | Recebe o título da tela ("Configurações", "Atividades", `w39 (20/09 a 26/09) - 2026` etc.), mas nada disso aparece na tela. Ver §6. |
| `#main-view-title` | **Nunca** (`hidden` fixo) | `switchToWeeklyView()` ("Visão Semanal"), `openDailyView()` ("Quarta-feira (23/09)") | Mesmo caso do anterior. |
| `#header-week-tabs` | Sempre vazio | `renderWeeklyGrid()` só o esvazia | Legado. Os botões de dia saíram daqui na v1.31 e hoje ficam no sub-header. |
| `#header-periodo-buttons` | Dashboard e Planos | `renderPeriodoBreadcrumb()` preenche, `hideAllViews()` esvazia | Breadcrumb Ano › Mês › Semana. Ver §4. |
| `#btn-theme-toggle` (header) | ≥ 640px (`hidden sm:block`) | `app.js` ~l. 1176, `document.querySelectorAll('#btn-theme-toggle')` | Alterna o atributo `data-theme` do `<body>` entre `light` e `dark` via `themeService.setTheme()`. A escolha fica salva em `planner_settings_theme`. |

---

## 4. Breadcrumb de período (centro do header)

### 4.1. Onde aparece e o que cada clique faz

`renderPeriodoBreadcrumb(periodoSelecionado, granularidadeAtiva, onSelecionar)` (`app.js`, função de nível superior do módulo, ~l. 2433) é chamada por duas telas. Cada uma passa seu próprio callback `onSelecionar(key)`:

| Tela | Chamada em | Granularidade ativa | Clique numa opção de **Ano** / **Mês** | Clique numa opção de **Semana** |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard ("Meu Planner") | `renderWeeklyGrid()` | `'semana'` (a semana exibida) | Continua no Dashboard e troca a semana exibida (`goWeekly(alvo)`). No mês ou ano atual, o alvo é hoje. Nos outros, o alvo é o dia 15 do mês, ou 15/jun do ano. | Vai para o **Plano Semanal** daquela semana |
| Plano Anual | `renderPlanoVersionado()` | `'ano'` | Ano → Plano Anual daquele ano · Mês → Plano Mensal daquele mês | Vai para o Plano Semanal daquela semana |
| Plano Mensal | `renderPlanoVersionado()` | `'mes'` | idem | idem |
| Plano Semanal | `renderPlanoVersionado()` | `'semana'` | idem | idem |

No Dashboard, o alvo de um mês que não é o atual é o **dia 15**, e não o dia 1. A primeira semana de um mês pode começar num domingo do mês anterior, e aí clicar em "Dez" cairia numa semana rotulada "Nov". O comentário no código explica isso.

Em todas as outras telas (Atividades, Configurações, Missão, Visão, Objetivos etc.), o breadcrumb fica vazio: `hideAllViews()` limpa `#header-periodo-buttons` e `#periodo-dropdown-root`. `switchToAtividadesView()` também limpa `#header-periodo-buttons` explicitamente.

### 4.2. Chaves de período

Todas as navegações usam chaves em texto:

| Granularidade | Formato | Exemplo | Gerada por |
| :--- | :--- | :--- | :--- |
| Ano | `YYYY` | `2026` | `getPeriodoKey(ts, 'ano')` |
| Mês | `YYYY-MM` | `2026-09` | `getPeriodoKey(ts, 'mes')` |
| Semana | `YYYY-wWW` | `2026-w39` | `getPeriodoKey(ts, 'semana')` |

A **semana vai de domingo a sábado** e usa a mesma conta de `getWeekDates()` e `getWeekNumber()`. É a mesma numeração do Dashboard e do sub-header, então não existem duas contagens de semana no app. Funções auxiliares, todas em `js/modules/dateUtils.js` (funções puras, importadas no topo de `app.js` — v1.50; antes ficavam no nível superior de `app.js`):

- `getPeriodoLabel(key, gran)`: "2026", "Setembro de 2026", "Semana 39 de 2026".
- `getDataDaSemana('2026-w39')`: devolve o domingo daquela semana.
- `getPeriodoPaiKeys(semanaKey)`: devolve `{ ano, mes }` da semana, pelo domingo.
- `getSemanasDoMes('2026-09')`: todas as semanas que tocam aquele mês, em ordem.
- `semanaLabelSemAno(k)` → "Semana 39" (desktop); `semanaLabelCompacto(k)` → "Sem. 39" (mobile).

> **Armadilha de escopo (v1.31):** essas funções precisam ficar **fora** do `DOMContentLoaded`. `renderWeeklyGrid()` é uma function declaration de nível superior e não enxerga o que está dentro do closure. Quando elas estavam lá dentro, o Dashboard quebrava com `ReferenceError` ao carregar.

### 4.3. Montagem dos três segmentos

1. **Ano, mês e semana exibidos:** dependem da granularidade ativa.
   - Ano ativo: o ano é o selecionado; mês e semana são os atuais.
   - Mês ativo: ano e mês vêm do mês selecionado; a semana é a atual.
   - Semana ativa: ano e mês são deduzidos da semana com `getPeriodoPaiKeys()`.
2. **Quais períodos têm dados:** a função lê `planner_strategies` e junta os períodos de todo registro `plano_anual`, `plano_mensal` ou `plano_semanal`. Opções de mês e semana sem nenhum registro aparecem com `opacity-50`.
3. **Opções de cada dropdown:**
   - Anos: os anos com dados, mais o ano atual e o selecionado, em ordem decrescente.
   - Meses: sempre os 12 do ano exibido.
   - Semanas: `getSemanasDoMes(mesExibido)`.
   - O período atual ganha o sufixo "(atual)". O selecionado ganha fundo `--primary-color`.
4. **Visual dos segmentos:** cada nível é um **botão com borda** (`.crumb-btn`, `data-nivel="ano|mes|semana"`), não um link de texto. Isso veio de feedback do usuário. O segmento da granularidade ativa fica preenchido com `--primary-color`. Os segmentos são separados por `›`.

### 4.4. Dropdowns fora do header (`#periodo-dropdown-root`)

**Problema:** o centro do header tem `overflow-x-auto`. Pela especificação do CSS, quando `overflow-x` é diferente de `visible`, o navegador também trata `overflow-y` como `auto`. Com isso, qualquer dropdown `position: absolute` dentro do header é cortado e não aparece.

**Solução** (v1.30):
- `getPeriodoDropdownRoot()` cria, uma única vez, um `<div id="periodo-dropdown-root">` anexado direto ao `<body>`.
- Os três dropdowns (`.periodo-dropdown[data-dropdown="ano|mes|semana"]`) e o painel mobile (`#breadcrumb-mobile-panel`) são desenhados ali dentro, com `position: fixed` e `z-50`.
- **Posicionamento** (`posicionarSobre(el, anchorRect)`): o dropdown fica 4px abaixo do botão clicado (`getBoundingClientRect()`). Ele é medido **depois** de sair do `hidden`, para o `offsetWidth` ser real. Se passar da borda direita, a posição é ajustada para manter **8px de margem** dentro da tela.
- **Fechamento:**
  - Clicar num segmento fecha todos os dropdowns e alterna o dele (clicar de novo fecha).
  - Clicar em qualquer lugar do documento ou redimensionar a janela fecha todos.
  - Esses dois listeners globais são registrados **uma só vez**, controlados pela flag `window.__breadcrumbOutsideClickAttached`. Sem ela, cada novo render acumularia mais um par de listeners.
  - Os cliques internos chamam `e.stopPropagation()` para não disparar o fechamento global.

### 4.5. Responsivo (breakpoint 768px)

- `window.innerWidth >= 768`: mostra os três segmentos (`#breadcrumb-desktop`).
- Abaixo disso: mostra um único botão, `#breadcrumb-mobile-trigger`, com texto compacto como `Set 2026 · Sem. 39 ▾`. Ele abre o `#breadcrumb-mobile-panel`, que empilha os três níveis como "chips" arredondados e é limitado à largura da tela (verificado a 375px: painel de 288px, a 8px da borda).
- ⚠️ A decisão desktop/mobile é tomada **uma vez, quando o breadcrumb é desenhado**. Redimensionar a janela sem trocar de tela **não** alterna o modo; o resize só fecha os dropdowns. Ver §6.

Na mesma faixa de tela, o botão de tema some abaixo de 640px, só com Tailwind (`hidden sm:block`). Com isso, **abaixo de 640px a zona direita fica vazia** e o tema só pode ser trocado em Configurações.

---

## 5. Ciclo de vida

```
troca de tela (menu, breadcrumb, sub-header…)
  └─ switchToXxx()
       ├─ hideAllViews()
       │    ├─ esconde todas as views
       │    ├─ esvazia #header-periodo-buttons
       │    ├─ esvazia #dynamic-header-tabs (sub-header)
       │    └─ esvazia #periodo-dropdown-root
       └─ a tela nova repovoa o que precisa:
            • Dashboard     → renderWeeklyGrid() → renderDiasNoSubheader() + renderPeriodoBreadcrumb()
            • Plano Anual/Mensal → renderPlanoVersionado() → renderPeriodoBreadcrumb()
            • Plano Semanal → renderPlanoVersionado() → renderPeriodoBreadcrumb() + renderDiasNoSubheader()
            • demais telas  → nada (header fica só com ☰ e as ações da direita)
```

A regra é: **quem precisa do centro do header ou do sub-header repopula logo depois de `hideAllViews()`**. Nenhuma tela limpa o que a anterior deixou; `hideAllViews()` é quem limpa.

---

## 6. Pontos de atenção conhecidos

| # | Ponto | Como foi constatado | Impacto |
| :---: | :--- | :--- | :--- |
| 1 | ~~O botão "🖨️ Relatório" do header não tinha `id` nem listener.~~ | — | **Resolvido na v1.38:** o botão foi removido. |
| 2 | `#current-week-display` e `#main-view-title` têm `hidden` fixo, mas mais de 10 pontos do `app.js` continuam escrevendo títulos neles. | HTML (`class="hidden"`). | O usuário nunca vê o título da tela no header. Os títulos redundantes foram retirados de propósito (v1.23 e v1.24), mas o código que os preenche ficou. |
| 3 | `#header-week-tabs` é legado. | `renderWeeklyGrid()` só o esvazia. | Nenhum; pode ser removido junto com a limpeza em `renderWeeklyGrid()`. |
| 4 | O `id="btn-theme-toggle"` está **duplicado** (header e tela de Configurações). | HTML. | Funciona porque o listener usa `querySelectorAll('#btn-theme-toggle')`. Um `getElementById` futuro pegaria só o do header. |
| 5 | O modo do breadcrumb (desktop ou mobile) não se atualiza ao redimensionar. | Verificado no navegador: 375px → desktop sem trocar de tela, e o botão compacto continuou aparecendo. | Só corrige ao trocar de tela ou recarregar. |
| 6 | A seção 3.6 do `MANUAL_TECNICO.md` ("Navegação Estratégica no Cabeçalho") descreve botões estáticos Anual/Mensal/Semanal. | Removidos na v1.24. | A seção 3.6 está desatualizada; este documento a substitui. |

---

## 7. Histórico das principais mudanças no header

| Versão / data | Mudança | Registro |
| :--- | :--- | :--- |
| 2026-09-19 | Três zonas com Flexbox (`flex-1 / flex-[2] md:flex-[3] / flex-1`) e abas centralizadas. | `historico/layout_header_dnd_20260919_0054.md` |
| v1.2 / v1.3 | Navegação estratégica no cabeçalho; criação do sub-header. | `MANUAL_TECNICO.md` §6 |
| v1.23 | Títulos redundantes "Plano X Atual" removidos. | `historico/header_reorganizacao_20260920_0415.md` |
| v1.24 | Botões estáticos "Plano Anual/Mensal/Semanal" removidos do centro do header. | `historico/botoes_planos_removidos_header_20260920_0530.md` |
| v1.30 | Breadcrumb Ano › Mês › Semana; dropdowns em `#periodo-dropdown-root`; versão mobile. | `historico/breadcrumb_periodo_20260920_0000.md` |
| v1.31 | Breadcrumb também no Dashboard; dias da semana vão do header para o sub-header; funções de período no nível superior. | `historico/breadcrumb_dashboard_subheader_20260920_0100.md` |
| v1.38 | Removidos os botões "🖨️ Relatório" (não fazia nada) e "+ Novo" (e o listener de `#btn-new-activity` em `app.js`). O ☀ passa a ser o único item da direita. | `historico/header_remocao_relatorio_novo_20260923_2320.md` |

---

## 8. Como testar

Suba o app com `rodar.bat` (cache desativado; ver §3.11 do `MANUAL_TECNICO.md`) e confira:

- [ ] ☰ abre e fecha o menu. Abaixo de 768px, o menu começa fechado e fecha sozinho depois de navegar.
- [ ] No Dashboard, o breadcrumb mostra a semana exibida com o segmento **Semana** preenchido. Ano e Mês trocam a semana sem sair da tela. Semana leva ao Plano Semanal.
- [ ] Nos Planos, o segmento ativo corresponde ao plano. Cada opção leva ao Plano certo, já no período escolhido.
- [ ] Dropdowns aparecem inteiros, sem corte, e fecham ao clicar fora ou redimensionar.
- [ ] Em Atividades e Configurações, o centro do header fica vazio.
- [ ] A 375px, aparece o botão compacto e o painel cabe na tela. O ☀ some, e a zona direita fica vazia.
- [ ] O ☀ fica encostado na direita, alterna o tema, e a escolha persiste depois de recarregar.

Para inspecionar pelo console: `document.getElementById('header-periodo-buttons').innerHTML` e `document.getElementById('periodo-dropdown-root').children.length`.
