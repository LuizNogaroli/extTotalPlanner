# Pendências e Correções Necessárias

Este arquivo reúne **tudo o que precisa de correção** no projeto (bugs, problemas visuais, código morto, documentação desatualizada, validações e decisões em aberto) e as **ideias** ainda não implementadas.

**Última revisão:** 2026-09-24, junto com a v1.45 do `MANUAL_TECNICO.md`.

**Como ler cada item:**
- ✔ = comportamento **verificado no navegador**;
- 📖 = identificado por **leitura do código**, ainda não reproduzido na tela.

Sempre que possível, o item diz onde está o problema e sugere uma correção. Ao resolver um item, mova-o para a seção 8 ("Concluído") com a versão do manual.

---

## 1. Bugs funcionais (o app faz algo errado)

- [ ] **1.1. Chaves de dados divergentes: Contextos, Categorias de Atividade e Hábitos** 📖. É o mesmo tipo de bug já corrigido em Alarmes (§3.18) e Compras (§3.24): uma tela grava numa chave e outra lê de outra.
  - **Contextos/Papéis:** o gerenciador ("🎭 Contextos / Papeis") lista `planner_contexto` (`'planner_' + type` em `renderManagerList()`), mas o "+ Novo Item" grava em `planner_contextos` (`js/modules/crud/formMappers.js`). O que se cadastra ali **não aparece** na lista. O seletor de contexto do formulário de atividade lê `planner_contextos`. Já a tabela de Atividades e o "Carregar dados de exemplo" usam `planner_contexto`.
  - **Categorias de Atividade:** a mesma divergência, entre `planner_atividade-categoria` (tabela de Atividades, dados de exemplo, gerenciador) e `planner_atividade_categoria` (CRUD e seletor do formulário).
  - **Hábitos:** o widget da página do dia e a exportação leem `planner_habito`, com os campos `question`/`category`. O CRUD grava em `planner_habitos`, com `nome`/`descricao`/`frequencia`.
  - **Correção sugerida:** escolher uma chave e um formato por entidade, ajustar todos os leitores e escritores e migrar os dados das duas chaves na primeira leitura, como em `carregarDados()` da Lista de Compras. Depois, testar o ciclo completo: criar → listar → editar → excluir → criar um segundo (§3.18, "Regra para o futuro").
- [x] ~~1.2. No Plano Semanal, clicar num dia do sub-header não abre a Visão Diária~~ **Corrigido na v1.46.** `switchToDailyView()` agora checa se `#view-dashboard` está escondida e, só nesse caso, chama `hideAllViews()`, mostra `#view-dashboard` e repovoa o sub-header antes de `openDailyView()`. Verificado no navegador nos dois fluxos (a partir do Plano Semanal e a partir do Dashboard, sem regressão). Detalhes em `docs/sub-header.md` §8/§9 e `docs/historico/fix_dia_plano_semanal_invisivel_20260924_0300.md`.
- [ ] **1.3. Arrastar uma atividade para um dia: a tela não se atualiza** 📖. `_handleDrop` dispara `new CustomEvent('layoutChange')` em `document`, mas os listeners escutam `'layoutChanged'` em `window`. Além disso, no Plano Semanal os dias do sub-header têm `.day-dropzone`, mas não recebem listeners, porque `initDragAndDrop()` só roda em `renderWeeklyGrid()`.
- [ ] **1.4. "Gerar Relatório" do Diário não mostra nada** 📖. O botão `#btn-report-journal`, no widget Diário da página do dia, desenha o relatório em `#report-content-area`, que fica dentro de `#view-reports`. Essa view continua escondida, porque o handler não troca de tela.
- [ ] **1.5. Botões 🖨️ "Gerar Relatório A4 do Dia" dos cards de dia não fazem nada** 📖. O `onclick` é só `event.preventDefault()`, em `renderWeeklyGrid()`. Implementar a impressão, ou remover os botões, como foi feito com o "Relatório" do cabeçalho na v1.38.
- [ ] **1.6. As telas "Relatórios" e "Exportar Dados" são inalcançáveis** 📖. `#view-reports` e `#view-export` existem no HTML, e `app.js` tem `switchToReportsView`/`switchToExportView` e todo o código de exportação CSV. Mas não existe nenhum item de menu para essas telas (`#menu-reports`/`#menu-export` não estão no HTML), nem nenhum botão `.btn-export-csv-module`. Decidir: religar no menu (Recursos?) ou remover.
- [ ] **1.7. O breadcrumb do cabeçalho não alterna entre desktop e celular ao redimensionar** ✔. A escolha é feita só quando ele é desenhado. Ver `docs/header.md` §6 nº 5.
- [x] ~~1.8. "+ Novo Item" de Fatos Históricos (`historico`) nunca salva~~ **Corrigido na v1.48 (§3.27).** `fields`/`requires` de `crud/formMappers.js` reescritos para `['id','createdAt','date','fato']` / `['date','fato']`, alinhados aos IDs reais (`historico-date`/`historico-fato`); `validateHistorico` corrigida; link "📜 Histórico" adicionado ao menu Recursos. Ver `docs/historico/fix_historico_formmappers_20260924_1200.md`.
- [x] ~~1.9. Depois de "Omitir" um box de Citação/Devocional, não há como desfazer pela tela~~ **Corrigido na v1.52 (§3.26), opção (a).** Em Omitir, o box não some mais: vira uma faixa mínima com o título, a engrenagem e o aviso "Oculto desde DD/MM". Ver `docs/historico/citacao_omitir_faixa_minima_20260924_0645.md`.

## 2. Problemas visuais e de tema

- [ ] **2.1. O Tailwind local é a v2.2.19 completa, sem JIT: nenhuma classe com valor arbitrário funciona** ✔. O `css/tailwind.css` (2,9 MB, cabeçalho "tailwindcss v2.2.19") é o build padrão, que **não gera** `text-[…]`, `bg-[…]`, `border-[…]`, `hover:…-[…]`, `group-open:`, `line-clamp-*`, as cores `amber`/`orange`, nem as variantes `dark:` (dark mode não configurado). Uma auditoria achou **66 classes usadas em `index.html`/`app.js` que não existem no build**. Consequências verificadas:
  - `text-[var(--text-secondary)]`, usada no app inteiro, **não se aplica**: os textos "secundários" saem na cor principal (#333, e não #666);
  - no tema escuro, as bordas `border-[var(--border-color)]` continuam **cinza-claro** (#e5e7eb, e não #374151);
  - os cards "Atual" de Missão/Visão/Valores/Planos ficam sem fundo (item 2.2);
  - a seta dos grupos do menu só gira por causa do CSS próprio da v1.40.

  Só funcionam as poucas classes que têm "utilitário de emergência" em `css/styles.css` (`bg-[var(--bg-panel)]`, `bg-[var(--bg-color)]`, `bg-[var(--primary-color)]`, `hover:bg-[var(--primary-hover)]`). **Opções:**
  - (a) recompilar o Tailwind com JIT (v3), com `content` apontando para `index.html` e `js/**/*.js`. Exige um passo de build com Node;
  - (b) criar em `styles.css` utilitários equivalentes para as classes usadas, ampliando os "de emergência";
  - (c) migrar os componentes para classes próprias, como `lc-`/`pm-`/`nav-`.

  É uma **decisão sua**. Para listar as classes ausentes, basta reexecutar a auditoria descrita em `MANUAL_TECNICO.md` §3.21.
- [ ] **2.2. Card "Atual" sem fundo nas páginas de Missão, Visão, Valores e Planos** ✔. É um caso do 2.1 (`from-[var(--primary-color)] via-… to-…`): o título branco ("Visão Atual", "Valores Atuais"…) fica quase invisível. Correção rápida possível: uma classe própria com `background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 75%, transparent))`.
- [ ] **2.3. No celular, o cabeçalho fica sem o botão de tema** ✔. O ☀ tem `hidden sm:block` e, depois da v1.38, é o único item da direita. Decidir se aparece também no mobile (`UX_LAYOUT.md`, 2026-09-23).
- [ ] **2.4. Nome do app inconsistente** 📖. O `manifest.json` e o título da aba dizem "Planner Estratégico"; o menu lateral diz "Total Planner"; os documentos dizem "extPlanner". Definir o nome oficial.

## 3. Código morto e sujeira no repositório

- [ ] **3.1. Módulos órfãos (ninguém importa):**
  - `js/modules/modal.js`, `views.js`, `renderer.js`, `manager.js`;
  - `js/modules/crud/index.js`;
  - `js/modules/formLoaders.js`, `formMappers.js` e `formValidators.js`, os que ficam **fora** de `crud/`.

  Foram superados pela refatoração do CRUD (v1.26–1.28). As versões em uso são as de `js/modules/crud/`.
- [ ] **3.2. Trechos mortos dentro do `js/app.js`:**
  - ~~`renderDailyView()`, que nunca é chamada~~ — removida na v1.50 (Fase 0 de `docs/plano_refatoracao_appjs.md`);
  - `renderSidebarTimeline()` e a chamada dela no boot: o `#sidebar-timeline` não existe no HTML, então a função sai no primeiro `if` e nunca desenha nada ✔ (verificado na v1.50). A "timeline na sidebar" foi uma abordagem que o usuário descartou (`historico/breadcrumb_periodo_20260920_0000.md`). Remover — prevista na Fase 8 do plano, como remoção e não migração;
  - a limpeza de `#header-week-tabs` (legado);
  - a variável `tituloCard` em `renderPlanoVersionado()`;
  - os ramos `data-date === 'weekly'` em `openDailyView()` e `_handleDrop`;
  - mais de 10 escritas em `#current-week-display`/`#main-view-title`, elementos com `hidden` fixo que nunca aparecem (`docs/header.md` §6).
- [ ] **3.3. Fluxo antigo de compras**, sem uso desde a v1.43:
  - `form-compras` (index.html);
  - as entradas `compras` nos `formMappers`;
  - `ContentService.getShoppingList()`;
  - o ramo `compras` de `renderManagerList()`, que lê os campos antigos `item`/`detalhes`;
  - a chave `planner_lista_compras`, já migrada mas não apagada.
- [ ] **3.4. 44 scripts avulsos versionados na raiz:**
  - `add_*.py`, `fix_*.py`/`fix_*.js`, `inject_*.py`, `patch_app*.py`, `update_*.py`, `refactor*.py`, `recover.py`, `real_unify.py`, `unify_header.py`, `center_tabs.py`, `check_ids.py`, `dynamic_title.py`, `test_*.js`;
  - mais `index.html.bak`, `temp_contexto_form.html` e `modelo-de-prompt-padrao.txt`.

  São ferramentas pontuais de sessões anteriores. Sugestão: mover para `tools/legado/`, ou apagar depois de conferir. O `package.json`/`node_modules` (só `jsdom`) parece servir apenas aos `test_*.js`.
- [ ] **3.5. Arquivo com nome inválido na raiz: `C:tempserver.log`** (0 bytes, fora do Git). É resto de um redirecionamento mal feito. Pode ser apagado.
- [ ] **3.6. `index.html` tem um `</div>` a mais que `<div>` no total** 📖. O desbalanceamento é antigo e não está relacionado ao bug corrigido na v1.33 (§3.20). Localizar com o script de contagem descrito na §3.20.
- [ ] **3.7. `id="btn-theme-toggle"` duplicado** (cabeçalho e Configurações). Funciona hoje porque o JS usa `querySelectorAll`. Dar ids distintos.

## 4. Documentação desatualizada

- [ ] **4.1. `extDocumentacao/02-service-worker-mv3.md`** (outro repositório) cita o `background.js` e o `chrome.alarms` deste projeto como exemplo. Os dois foram removidos na v1.33; hoje o motor é client-side (§3.19/§3.23).
- [ ] **4.2. `docs/ANALISE_MANUTENIBILIDADE.md`** é uma foto de 2026-09-19 (app.js com 2.673 linhas; hoje tem 3.388). Recebeu um aviso no topo na v1.45, mas as métricas não foram refeitas. O próprio documento já sugeria dividir a renderização em módulos se o arquivo passasse de 3.000 linhas — já passou. Plano de extração completo, em fases, registrado em `docs/plano_refatoracao_appjs.md` (v1.49); execução ainda não iniciada.
- [ ] **4.3. `docs/planejamento_extensao_20260917_2351.md`** é o planejamento original. Vale só como histórico e não reflete o app atual.

## 5. Validações pendentes na máquina real

O navegador das sessões de IA bloqueia notificações e não instala extensões. Falta conferir na sua máquina:

- [ ] **5.1. Toast e som dos avisos:** em Recursos → Alarmes, ativar as notificações e usar o **"🔊 Testar aviso"**. Se nada aparecer, seguir o roteiro do Windows em `extListaDeCompras/docs/notifications-and-sound.md` §6 (Assistente de Foco, notificações do Chrome no Windows, Central de Ações `Win+N`).
- [ ] **5.2. Extensão instalada:**
  - recarregar em `chrome://extensions`, porque o manifest mudou;
  - com `"notifications"` no manifest, o botão deve aparecer como "Notificações ativas" sem prompt;
  - conferir que Alarmes, Pomodoro e Lista de Compras funcionam com `chrome.storage.local`.
- [ ] **5.3. `rodar.bat` de ponta a ponta:** dar dois cliques e conferir a janela do servidor e o navegador abrindo em `localhost:8000` (v1.44).

## 6. Decisões pendentes (suas)

- [ ] **6.1.** O que fazer com a pasta `ext-planner/`, que não é versionada no Git (você pediu para não mexer por enquanto).
- [ ] **6.2.** Plano Semanal: o `Sobre_extPlanner.md` o classifica como Tático, e o menu o mostra em Operacional. Qual dos dois vale?
- [ ] **6.3.** O que entra em "Outros Sistemas". Para linkar uma extensão instalada, é preciso o endereço `chrome-extension://<id>/...` de cada uma.
- [ ] **6.4.** Alarmes: aceitar que só disparam com uma aba do Planner aberta? A tolerância de 10 min (`ALARME_GRACE_MS`) está boa?
- [ ] **6.5.** Estratégia para o Tailwind (item 2.1).
- [ ] **6.6.** Botão de tema no celular (item 2.3) e nome oficial do app (item 2.4).

## 7. Ideias e funcionalidades futuras

### 7.1. Integração com Google Calendar
- [ ] Pesquisar e implementar o fluxo OAuth2 (via `chrome.identity`) para sincronizar os eventos da agenda do usuário com o planejador diário.

### 7.2. Contextualização Hierárquica de Missão, Visão, Valores, Objetivos e Planos
- **Conceito:** Hoje Missão, Visão, Valores, Objetivos e os Planos (Anual/Mensal/Semanal) são únicos e globais (um texto "atual" por tipo, sem separação por área da vida). A ideia é criar um nível hierárquico **acima** de todos eles: o **Contexto** (ex.: Profissional, Familiar, Espiritual, e outros que o usuário queira criar).
- **Dinâmica:**
  - Cada Contexto passa a ter sua **própria** Missão, Visão, Valores, Objetivos (Curto/Médio/Longo Prazo) **e também seus próprios Planos** (Anual/Mensal/Semanal) — não um conjunto único compartilhado como é hoje.
  - Exemplo: Contexto "Profissional" → Missão, Visão, Objetivos e Planos (Anual/Mensal/Semanal) profissionais. Contexto "Familiar" → seu próprio conjunto completo. Contexto "Espiritual" → idem.
  - O usuário poderia alternar entre contextos (ex.: abas ou seletor no topo das seções Estratégico e Tático) para ver/editar cada conjunto separadamente.
- **Impacto técnico esperado (a avaliar quando for implementar):**
  - Muda o modelo de dados de `planner_strategies`: os registros de `missao`/`visao`/`valores`/`obj_curto`/`obj_medio`/`obj_longo`/`plano_anual`/`plano_mensal`/`plano_semanal` precisariam ganhar uma dimensão `contexto` (ex.: `profissional`/`familiar`/`espiritual`), e as consultas por tipo (`s.type === 'missao'`) passam a precisar filtrar também por `s.contexto === '...'`.
  - Precisa de uma tela/fluxo para o usuário **cadastrar seus próprios contextos** (não só os três exemplos citados — Profissional, Familiar, Espiritual — mas permitir adicionar outros). *Antes, corrigir o item 1.1 (chaves divergentes de Contextos).*
  - `switchToMissaoView`, `switchToVisaoView`, `switchToValoresView`, `switchToObjetivosView`, `switchToPlanosView`/`renderPlanoVersionado` e os respectivos formulários precisariam saber "em qual contexto estou agora" para filtrar e salvar corretamente.

### 7.3. Alinhamento de Atividades por Assunto/Projeto dentro dos Planos
- **Conceito:** Dentro dos Planos Anual, Mensal e Semanal, as atividades/marcos devem poder ser organizadas e alinhadas por **assunto** ou **projeto** — um agrupamento temático transversal, diferente do Contexto (área da vida). Exemplo: dentro do Plano Anual do Contexto Profissional, agrupar itens pelo projeto "Lançamento do Produto X" ou pelo assunto "Certificações".
- **Dinâmica (a definir em sessão futura):**
  - Avaliar se "Assunto/Projeto" vira uma entidade cadastrável própria (CRUD dedicado, no mesmo espírito de "Contextos/Papeis" já existente), atribuível a cada atividade/marco dos Planos.
  - Permitiria depois filtrar ou visualizar um Plano agrupado por projeto/assunto (ex.: ver tudo relacionado a "Produto X" espalhado entre o Plano Anual, Mensal e Semanal).
- **Observação:** Não confundir com Contexto. Contexto = área da vida (Profissional/Familiar/Espiritual). Assunto/Projeto = agrupamento temático **dentro** de um Contexto (ex.: dentro de "Profissional", os projetos "Produto X", "Certificação Y", etc.).

### 7.4. Motor de Tráfego Orgânico e Conteúdo (Growth/Marketing)
As seguintes ideias visam transformar o planner de uma ferramenta isolada para um vetor de compartilhamento em redes sociais, gerando tráfego orgânico para aquisição de novos usuários.

- **Repositório de Citações e Frases (O "Refrigério da Alma")**
  - **Conceito:** Um banco de dados colaborativo de frases motivacionais, referências bíblicas, citações de famosos, trechos de filmes e poemas.
  - **Dinâmica:** Os usuários podem *cadastrar* novas frases no repositório geral e *consumir* frases de outras pessoas para inserir em seus próprios dias.
  - **Motor de Viralização:** Cada frase ou citação será formatada visualmente de forma agradável (como um "card" ou "quote") e terá um botão nativo de "Compartilhar nas Redes Sociais" (Instagram Stories, Twitter, WhatsApp). Esse compartilhamento sempre levará uma marca d'água ou link sutil (`via Total Planner Extension`), atuando como marketing orgânico.
- **Curadoria Diária: "Neste dia na História"**
  - **Conceito:** Na tela de **Agenda Diária**, haverá um espaço dedicado a curiosidades e conhecimento inútil agradável (ou reflexivo).
  - **Conteúdo:** Fatos históricos relevantes, aniversários de lançamentos de filmes clássicos, marcos científicos, artes ou devocionais ligados especificamente àquele dia e mês (ex: "Em 18 de Setembro de 1950...").
  - **Dinâmica de Viralização:** Assim como as citações, o objetivo é que essas pílulas de conhecimento se tornem alvo de posts em redes sociais. O usuário vê uma curiosidade legal logo de manhã e quer compartilhar com a rede dele, carregando consigo o link da extensão.

### 7.5. Recursos
- [ ] **Lista de Compras:** busca real nos marketplaces. Hoje a cortina usa dados de exemplo, como na referência (ver `extListaDeCompras/docs/roadmap.md` e `ai-marketplace-search.md`).
- [ ] **Pomodoro:** registrar os focos concluídos por dia (histórico/estatística) e, talvez, vincular um foco a uma Atividade do dia.

## 8. Concluído (referência rápida)

Itens que constavam como pendentes e foram resolvidos. O detalhe está na seção 6 do `MANUAL_TECNICO.md` e em `docs/historico/`.

- [x] Modal Global de CRUD (v1.26–1.28) e a ligação da interface ao `StorageService` (desde a v1.0).
- [x] Alarmes: cadeia de 7 bugs (v1.32), migração para a API `Notification` (v1.33) e motor robusto entre abas, com som e "Testar aviso" (v1.42).
- [x] `#view-dashboard` sem fechamento, que deixava Configurações invisível (v1.33, §3.20).
- [x] Destaque acumulado dos dias no sub-header (v1.35) e título "Aaa - DD/MM" na página do dia (v1.37).
- [x] Botões "Relatório" e "+ Novo" do cabeçalho removidos (v1.38).
- [x] Valores no nível Estratégico (v1.39), hierarquia visual do menu (v1.40) e grupo Recursos (v1.41).
- [x] Lista de Compras interna, com migração dos dois formatos antigos, Pomodoro e grupo "Outros Sistemas" (v1.43).
- [x] `rodar.bat`: servidor que travava e porta compartilhada (v1.44).
- [x] No Plano Semanal, clicar num dia do sub-header não abria a Visão Diária (v1.46).
- [x] Citação/Devocional: boxes viram botão + modal, com modo Aleatório/Fixada/Omitir versionado por data; "+ Novo Item" de Motivacional/Devocional (que nunca salvava) corrigido; gerenciadores religados no menu Recursos (v1.47).
- [x] "+ Novo Item" de Fatos Históricos não salvava nada (mesmo schema divergente do HTML) e gerenciador inalcançável pelo menu (v1.48).
- [x] Omitir em Citação/Devocional escondia a engrenagem junto com o box, sem caminho para desfazer (v1.52).

---
**Próximos Passos (sugestão de prioridade):**
1. **Item 1.1:** chaves divergentes de Contextos, Categorias e Hábitos. Dados cadastrados "somem" da lista.
2. **Itens 1.3–1.6:** navegação e botões que não fazem nada.
3. **Decisão 2.1 (Tailwind):** define como o tema claro/escuro vai funcionar de verdade no app inteiro.
4. **Seção 3:** limpeza do código morto e dos scripts avulsos, para reduzir a confusão em sessões futuras.
5. **Seção 5:** validações na máquina real.
6. **`docs/plano_refatoracao_appjs.md`:** dividir o `app.js` (3.388 linhas) em módulos, começando pelas fases de baixo risco (0–4). Não bloqueia o resto, mas reduz o atrito entre sessões paralelas trabalhando no mesmo arquivo (ver o episódio que motivou o plano).
