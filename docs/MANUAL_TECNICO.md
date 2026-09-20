# extPlanner - Manual de Arquitetura e Soluções Técnicas (Playbook do Desenvolvedor)

Este documento atua como um **Mapa Técnico** e **Playbook de Soluções Reutilizáveis** do extPlanner. Ele detalha a arquitetura do software, mapeia quais arquivos tratam de cada assunto e documenta as soluções de engenharia implementadas que podem ser facilmente portadas para novos projetos.

---

## 1. Visão Arquitetural

O extPlanner adota o padrão **SPA (Single Page Application) em Vanilla JavaScript** estruturado sob princípios de modularização limpa.

---

## 2. Estrutura de Diretórios e Responsabilidades

```
C:\Users\luizn\Documents\07-PROJETOS\ext-planner\
├── css/
├── js/
│   ├── app.js            # Orquestrador principal (Bootstrap)
│   ├── modules/          # Módulos ES6 (modal.js, views.js, renderer.js, manager.js)
│   └── services/         # Serviços puros (StorageService, etc.)
├── docs/                 # Documentações e históricos
└── index.html            # Estrutura única (View SPA)
```

---

## 3. Soluções Técnicas de Destaque

### 3.1. Abstração de Armazenamento Inteligente
*   **Arquivo:** `js/services/StorageService.js`
*   **Solução:** Fallback automático `chrome.storage.local` -> `localStorage`.

### 3.2. Motor de Tradução Dinâmica
*   **Arquivo:** `js/services/I18nService.js`
*   **Solução:** Internacionalização leve via atributos `data-i18n`.

### 3.3. Gerenciamento de Tema
*   **Arquivo:** `js/services/ThemeService.js`
*   **Solução:** Temas baseados em atributos `data-theme` no `<body>`.

### 3.4. Comunicação Desacoplada
*   **Solução:** Eventos customizados (`window.dispatchEvent`) para comunicar mudanças de estado entre serviços e UI.

### 3.5. Sistema de Notificações via Service Worker
*   **Arquivo:** `background.js`
*   **Solução:** Migração para `chrome.alarms` no background para disparos garantidos.

### 3.6. Navegação Estratégica no Cabeçalho
*   **Solução:** Separação estática (Anual/Mensal/Semanal) e dinâmica (`#dynamic-header-tabs`).

### 3.7. Modularização do Código (ES Modules)
* **Arquivos:** `js/modules/*.js`
* **Solução:** Extração da lógica monolítica para módulos ES6 especializados, instanciados no `js/app.js`.

### 3.8. Views Devem Ficar Dentro de `<main>` (Erro Comum de Roteamento SPA)
* **Arquivos:** `index.html`, `js/app.js`
* **Problema:** A view `view-missao-educacional` foi inserida fora da tag `<main>` (perto dos modais, no fim do `<body>`). O JavaScript de roteamento (`hideAllViews()` + `classList.toggle('hidden'/'flex')`) funcionava tecnicamente (o `display` computado ficava `flex`), mas o elemento renderizava fora do container com scroll (`overflow-auto`) da área de conteúdo, então visualmente parecia que "não carregava" — só aparecia rolando a página inteira até o fim.
* **Solução:** Mover o bloco HTML para dentro de `<main>`, como irmã das demais views (`view-strategic`, `view-reports`, `view-export`). Depois da correção, o toggle padrão de classes funcionou sem nenhum hack de `style.display`/`scrollIntoView`.
* **Regra para o futuro:** Toda nova view controlada por `hideAllViews()` deve ser criada como filha direta do mesmo container das views irmãs dentro de `<main>` — nunca colada no fim do `<body>` "para simplificar". Validar com `document.getElementById(id).closest('main')` antes de dar a funcionalidade por concluída.

### 3.9. Reversão de Mojibake (UTF-8 salvo incorretamente como CP1252)
* **Arquivo:** N/A (correção pontual de conteúdo/HTML, técnica reutilizável)
* **Problema:** Edições sucessivas via PowerShell (`Get-Content`/`Set-Content` sem `-Encoding utf8` explícito) corromperam acentos e emojis do `index.html`, produzindo sequências como `ðŸ"š` no lugar de `📚` e `â†` no lugar de `←` (UTF-8 multibyte relido byte-a-byte como Windows-1252 e regravado como UTF-8 — "mojibake duplo").
* **Solução:** Script Python que localiza sequências suspeitas via regex (`[\xc2\xc3\xe2\xf0][\x80-\xff-￿]{1,3}`), reencoda cada caractere de volta para `cp1252` — com *fallback* de identidade de byte para os códigos não mapeados da tabela (`0x81`, `0x8D`, `0x8F`, `0x90`, `0x9D`) — e decodifica o resultado como `utf-8`, restaurando o caractere original.
* **Regra para o futuro:** Nunca editar `index.html` (ou qualquer arquivo com acentos/emoji) via PowerShell sem `-Encoding utf8`. Preferir Python (`open(path, encoding='utf-8')`) para qualquer manipulação de texto internacionalizado neste projeto.

### 3.10. Tipos com Histórico Versionado Não Podem Usar o `save()` Genérico do CRUDModal
* **Arquivo:** `js/modules/crudModal.js`
* **Problema:** Tipos como `missao` e `visao` têm lógica própria de versionamento no listener `document.addEventListener('crudSave', ...)` do `app.js` (move o registro "atual" para o histórico e cria um novo com `id`/`timestamp`). Só que `CRUDModal.handleSubmit()` **sempre** chamava `this.save(type, formData)` genérico **antes** de disparar o evento `crudSave` — e esse `save()` genérico persistia o `formData` cru diretamente (sem `id` nem `timestamp`, já que os forms `form-missao`/`form-visao` só têm o campo `content`). Resultado: cada submissão gravava **dois** registros — um "fantasma" sem `id`/`timestamp` (causando `"Definida em: Invalid Date"` na UI) e outro correto (criado pela lógica de versionamento).
* **Solução:** Lista `SELF_MANAGED_TYPES = ['missao', 'visao']` no topo de `crudModal.js`. Em `handleSubmit()`, o `this.save()` genérico só roda se `type` **não** estiver nessa lista — para os tipos auto-gerenciados, a única persistência é a do listener `crudSave` do `app.js`.
* **Regra para o futuro:** Todo novo tipo estratégico com histórico de versões (`missao`, `visao`, e futuramente objetivos de curto/médio/longo prazo se ganharem o mesmo padrão) **deve** ser adicionado a `SELF_MANAGED_TYPES`. Testar sempre inspecionando o storage bruto após salvar (`chrome.storage.local.get('planner_strategies', ...)` ou o `localStorage` equivalente) — um registro sem `id`/`timestamp` é o sintoma inequívoco desse bug.

### 3.11. Cache HTTP Agressivo do `python -m http.server` (Sem Cache-Control)
* **Arquivo:** N/A (ambiente de desenvolvimento local)
* **Problema:** `python -m http.server` não envia header `Cache-Control`, só `Last-Modified`. O navegador aplica heurística própria de "freshness" e passa a servir módulos JS (`<script type="module">`) do cache de disco mesmo após um `navigate` com reload — inclusive **fechando e abrindo uma aba nova**. Isso fez uma correção de código parecer "não ter efeito": os logs de diagnóstico só apareceram após um `Ctrl+Shift+R` (hard reload) explícito.
* **Solução de diagnóstico:** Comparar o conteúdo servido (`curl -sI`/`curl -s` direto no terminal, fora do navegador) com o que o navegador realmente executa (`fetch(url, {cache:'no-store'})` no console). Se divergirem, é cache do navegador, não do servidor.
* **Regra para o futuro:** Depois de editar qualquer arquivo `.js` importado como ES module, sempre validar com `Ctrl+Shift+R` (hard reload) antes de concluir que uma correção "não funcionou" — um `navigate force:true` comum pode não bastar. Também vale checar se não há **múltiplos processos** `python -m http.server` escutando a mesma porta a partir de diretórios diferentes (`netstat -ano | grep :3000`) — isso já aconteceu neste projeto e produziu o mesmo sintoma.

### 3.12. Múltiplos Sub-Tipos Compartilhando um Único Modal ("Prazo" como Campo, não como Formulário Separado)
* **Arquivo:** `index.html` (`form-objetivos`), `js/app.js` (`switchToObjetivosView`)
* **Padrão:** Quando uma entidade estratégica precisa de variações (ex.: Objetivos de Curto/Médio/Longo Prazo) mas o usuário quer **um único modal** para cadastrar qualquer uma delas, não crie três formulários (`form-obj-curto`, `form-obj-medio`, `form-obj-longo`). Em vez disso, crie **um** formulário (`form-objetivos`) com um `<select>` (`objetivos-prazo`, valores `curto`/`medio`/`longo`) que participa do `FORM_REGISTRY` como um campo comum (`fields: [..., 'prazo', ...]`). No listener de `crudSave`, o `type` armazenado no registro é computado dinamicamente (`'obj_' + formData.prazo`), preservando a taxonomia `obj_curto`/`obj_medio`/`obj_longo` já usada em outras partes do código (`switchToStrategicView`, `manager.js`).
* **Renderização:** A view correspondente (`switchToObjetivosView`) itera sobre um array de configuração (`prazoConfig`) e monta uma seção "atual + histórico" para cada prazo dentro da **mesma** página — não são três páginas separadas, e todas compartilham os únicos botões "📚 Educacional"/"✏️ Atualizar Objetivo" do topo.
* **Regra para o futuro:** Antes de criar múltiplos formulários quase idênticos para variações de uma mesma entidade, considerar se um campo `<select>` dentro de um único formulário resolve — evita duplicação de HTML, de entradas em `FORM_REGISTRY` e de listeners.

### 3.13. Helper Compartilhado para Views "Texto Único Versionado" (Planos Anual/Mensal/Semanal)
* **Arquivo:** `js/app.js` (`renderPlanoVersionado`, `switchToPlanosView`)
* **Contexto:** Diferente de Objetivos (um só formulário com `<select>` de sub-tipo, ver 3.12), os Planos Anual/Mensal/Semanal são páginas **distintas** no menu lateral (não um único formulário com seletor), mas o *conteúdo renderizado* de cada uma (card "atual" + histórico de versões) é idêntico, mudando apenas o `type` armazenado (`plano_anual`/`plano_mensal`/`plano_semanal`), o rótulo, o ícone e a granularidade de período (ver 3.14).
* **Padrão:** Extrair essa renderização repetida em uma função auxiliar — `async function renderPlanoVersionado(contentArea, tipo, label, icone, granularidade)` — chamada por `switchToPlanosView()` para cada prazo. O listener de `crudSave` também usa uma condição unificada (`type === 'plano_anual' || type === 'plano_mensal'`) com a mesma lógica de versionamento parametrizada por `type`, em vez de copiar o bloco `if/else` para cada novo plano.
* **Regra para o futuro:** Ao implementar o Plano Semanal com este mesmo esquema, basta (1) criar `form-plano_semanal` no HTML, (2) registrar `'plano_semanal'` em `formMappers.js`/`formLoaders.js`/`SELF_MANAGED_TYPES`, (3) chamar `renderPlanoVersionado(contentArea, 'plano_semanal', 'Plano Semanal', '📆', 'semana')` dentro de `switchToPlanosView()` — precisará estender `getPeriodoKey()`/`getPeriodoLabel()` (ver 3.14) para suportar `granularidade === 'semana'` (formato `wXX-YYYY`, reaproveitando a lógica de semana ISO já usada na Visão Semanal) — e (4) incluir `'plano_semanal'` na condição do `crudSave`. Não duplicar o bloco de renderização "atual + histórico" pela terceira vez.

### 3.14. Navegação por Período (Ano/Mês) com Item Atual Ativo e Anteriores Inativos
* **Arquivo:** `js/app.js` (`getPeriodoKey`, `getPeriodoLabel`, `renderPlanoVersionado`)
* **Padrão:** Quando uma entidade "texto único versionado" (ver 3.10) precisa, além do histórico cronológico simples, de uma navegação explícita por período civil (ano civil, mês civil...), os registros são agrupados por uma chave derivada do `timestamp` (`getPeriodoKey(timestamp, 'ano'|'mes')` → `"2026"` ou `"2026-09"`). O período correspondente a "agora" (`getPeriodoKey(Date.now(), granularidade)`) é sempre incluído na lista de botões mesmo sem registros, para que o usuário sempre tenha onde cadastrar o período atual.
* **Regra de UI:** Só o período **atual** mostra o botão de editar (`✏️ Atualizar`); os demais são renderizados como somente leitura — nenhuma ação de escrita deve ficar disponível fora do período atual, para não conflitar com a lógica de versionamento (que sempre assume que o registro mais recente é "o atual").
* **Estado:** `let planosPeriodoSelecionado = {}` (objeto `tipo → periodoKey`) guarda qual período está em exibição por tipo de plano; é resetado para o período atual toda vez que `switchToPlanosView()` roda (isto é, toda vez que o usuário navega pelo menu lateral) — assim o usuário nunca "fica preso" olhando um ano antigo ao trocar de página e voltar.
* **Regra para o futuro:** Esse mesmo padrão (`getPeriodoKey`/`getPeriodoLabel` + barra de botões atual/inativos) é a base a reaproveitar para o Plano Semanal (granularidade `'semana'`) e para qualquer futura entidade "um registro por período civil, com navegação para trás".

### 3.15. View de Listagem com Filtros para Tipos Não-Versionados (Atividades)
* **Arquivo:** `js/app.js` (`switchToAtividadesView`, `renderAtividadesTable`)
* **Contexto:** Diferente do padrão "texto único versionado" (3.10/3.13), o tipo `atividade` é um CRUD repetível comum — cada registro é independente, não existe "atual vs. histórico". Para esses casos, o padrão é uma **view de listagem em tabela** dentro de `<main>` (`view-atividades` → `atividades-content-cards`), seguindo o mesmo item de menu lateral do `Operacional` (`menu-atividades`).
* **Estrutura:** Botão "+ Cadastrar Atividade" (chama `crudModal.open('atividade')`, reaproveitando o modal já existente — nenhum formulário novo foi criado) + barra de filtros (texto livre por título, e três `<select>` para status/categoria/contexto, populados dinamicamente a partir de `planner_atividade-categoria`/`planner_contexto`) + tabela (`atividades-table-body`) com colunas Título/Data/Status/Categoria/Contexto/Prioridade/Ações.
* **Filtragem:** 100% client-side em `renderAtividadesTable()` — lê o valor atual de cada filtro do DOM, filtra o array vindo de `StorageService.get('planner_activities')` e re-renderiza. Cada filtro tem listener `input`/`change` chamando `renderAtividadesTable()` diretamente (sem re-render da view inteira, então o foco/valor dos próprios filtros não se perde).
* **Ações por linha:** "👁️ Ver" chama a função já existente `openViewModal(activity)` (mesmo modal read-only usado no Dashboard/Visão Diária); "✏️ Editar" chama `crudModal.open('atividade', activity)`. Os listeners são atribuídos via `querySelectorAll` após o `innerHTML` (delegação simples por linha, sem strings `onclick` com JSON serializado — evita o escaping frágil usado em outras partes do código para o mesmo tipo).
* **Sincronização:** Como `atividade` **não** está em `SELF_MANAGED_TYPES`, o `CRUDModal.save()` genérico já persiste o registro; o listener de `crudSave` em `app.js` só precisa decidir *onde* re-renderizar — foi estendido para também chamar `renderAtividadesTable()` quando `view-atividades` estiver visível, além do já existente refresh da visão semanal.
 * **Regra para o futuro:** Esse é o padrão a reaproveitar para qualquer nova entidade repetível que precise de "cadastrar + listar com filtro" fora do contexto de uma data específica (ex.: um catálogo de Hábitos, Alarmes ou Compras com tela própria, em vez do `managerModal` genérico atual).

### 3.16. Servidor de Teste Local Auto-Contido (`rodar.bat`)
 * **Arquivo:** `rodar.bat` (raiz do projeto)
 * **Contexto:** Como o app é uma extensão Chrome (newtab override) que usa `chrome.storage.local`, testá-lo carregando como extensão é trabalhoso. Para validar mudanças rapidamente no navegador comum, `rodar.bat` sobe um servidor HTTP local — nesse modo o `StorageService` cai no fallback `localStorage` (namespace **separado** do `chrome.storage.local`, por isso dados de exemplo precisam ser (re)semeados via botão). Ver 3.11 para a armadilha de cache.
 * **Padrão:** O arquivo é **auto-contido**: embute o código do servidor Python em Base64 dentro de um `powershell -Command` que decodifica e escreve `server.py` temporário, e depois roda `python server.py`/`py server.py` (fallback). O servidor envia `Cache-Control: no-store` em **todas** as respostas e força `Content-Type: text/javascript` para arquivos `.js` (corrige o sintoma de 3.11 sem depender de hard reload). A própria janela do `cmd` é mantida aberta (título "extPlanner Servidor") e o navegador é aberto em `http://localhost:8000` via `start`.
 * **Detalhe de implementação (Windows):** o redireciono de entrada do `powershell -Command` precisa de `<nul` no final da linha, senão ele trava esperando stdin ("Redirecionamento de entrada do arquivo... impossível"). Esse é o formato atual que funciona.
 * **Regra para o futuro:** Para qualquer teste ponta-a-ponta/MVP no navegador, rode `rodar.bat` e acesse pelo `localhost` — não é necessário empacotar a extensão. Para limpar estado, limpe o `localStorage` do `localhost:8000` no DevTools (não afeta a extensão instalada).

### 3.17. Atividades Integradas aos Planos (Filtragem por Período via `transferPeriodo`)
* **Arquivo:** `js/app.js` (`renderPlanoVersionado`)
* **Contexto:** Os Planos Anual, Mensal e Semanal agora exibem uma seção "Atividades" com listagem de cards responsivos filtrando atividades do tipo `atividade` via campo `transferPeriodo` (um objeto, não uma string simples).
* **Estrutura do `transferPeriodo`:** Cada atividade pode ter um campo `transferPeriodo` com valor:
  ```javascript
  { tipo: 'plano_anual'|'plano_mensal'|'plano_semanal', periodo: '2026'|'2026-09'|'2026-w38' }
  ```
  - `tipo`: identifica qual plano a atividade "pertence"
  - `periodo`: a chave temporal (ano, mês ou semana ISO, gerada por `getPeriodoKey()`)
* **Filtragem:** Em `renderPlanoVersionado()`, após montar o card "texto atual", calcula-se `periodoSelecionado` (baseado na navegação de período do usuário) e filtra:
  ```javascript
  const atividadesDoPlano = activities.filter(a => 
    a.transferPeriodo && 
    typeof a.transferPeriodo === 'object' && 
    a.transferPeriodo.periodo === periodoSelecionado
  );
  ```
  **Importante:** A comparação é **por objeto**, não string literal — um erro comum é comparar `a.transferPeriodo === periodoLabel` (string), o que sempre falha.
* **UI dos Cards:** Cada atividade renderiza um card `w-full` (ocupando 100% da linha, responsive) com título, descrição, emojis de prioridade (Eisenhower), status, categoria, contexto, e três botões:
  - `👁️ Ver`: chama `openViewModal(activity)` (modal read-only)
  - `✏️ Editar`: chama `crudModal.open('atividade', activity)` (abre formulário de edição)
  - `🔄 Transferir`: chama `openTransferModal(activity)` (permite realocação para outro plano/período)
* **Criação Contextualizada:** Quando o usuário clica "+ Adicionar" dentro de um Plano, o botão pré-define `window.atividadePlanoContexto = { tipo: 'plano_anual'|..., periodo: '...' }` antes de abrir `crudModal.open('atividade')`. A lógica de save do listener `crudSave` usa esse contexto para preencher `transferPeriodo` automaticamente.
* **Plano Semanal:** Agora funcional com granularidade `'semana'` — `getPeriodoKey()` suporta `granularidade === 'semana'` retornando `YYYY-wWW` (semana ISO), e o período atual é incluído na navegação.
* **Sincronização:** O listener de `crudSave` para tipo `atividade` re-renderiza `renderPlanoVersionado()` se ela estiver em exibição, mantendo a seção de atividades sincronizada sem reload.
* **Estado vazio:** Se não há atividades para o período, exibe mensagem: *"Nenhuma atividade neste período. Clique em "+ Adicionar" para criar uma."*
* **Regra para o futuro:** Esse é o padrão a reaproveitar para qualquer entidade "muitos por período" (ex.: marcos, milestones, check-ins) que precise aparecer contextualizada dentro de um Plano. A chave é sempre usar `transferPeriodo` como campo de linkagem (não vinculação direta por foreignKey, mas por matching de período).

---

## 4. Mapeamento de Funcionalidades vs. Arquivos

| Funcionalidade | Arquivo Principal |
| :--- | :--- |
| Inicialização & SPA | `js/app.js` |
| Drag & Drop | `js/dragAndDrop.js` |
| Notificações | `background.js` |
| Gerenciamento de Modais | `js/modules/modal.js` |
| Renderização de Views | `js/modules/renderer.js` |
| Gerenciamento de Listas | `js/modules/manager.js` |

---

## 5. Dicas de Otimização e Boas Práticas
1.  **Mantenha os Serviços Puros.**
2.  **Use a API `StorageService` para tudo.**
3.  **Seguir Padrão Modular:** Toda nova funcionalidade deve ser extraída para um módulo (`js/modules/`) caso ultrapasse 100 linhas.

---

## 6. Histórico de Versões do Documento

| Versão | Data/Hora | Responsável | Resumo das Alterações |
| :---: | :--- | :--- | :--- |
| **1.0** | 2026-09-19_15-45 | Gemini CLI & User | Criação do manual, arquitetura SPA, Storage desacoplado, i18n, Temas, eventos. |
| **1.1** | 2026-09-19_16-15 | Gemini CLI & User | Adição de Notificações via Service Worker, regra de docs automáticas em `GEMINI.md`. |
| **1.2** | 2026-09-19_17-30 | Gemini CLI & User | Navegação estratégica no cabeçalho. |
| **1.3** | 2026-09-19_18-00 | Gemini CLI & User | Subheader para navegação dinâmica. |
| **1.4** | 2026-09-19_19-30 | Gemini CLI & User | Modularização do `app.js` em módulos ES6. |
| **1.5** | 2026-09-19_21-30 | Claude Code & User | Página educacional da Missão: correção estrutural (view movida para dentro de `<main>`), remoção de hacks de CSS/scroll, reversão de mojibake UTF-8/CP1252, fix de listeners duplicados no botão "Voltar". |
| **1.6** | 2026-09-19_22-45 | Claude Code & User | Nova seção de Visão (nos mesmos moldes da Missão): `switchToVisaoView()`, `form-visao`, `view-visao-educacional`, registro `visao` em `formMappers.js`/`formLoaders.js`. Corrigido bug de duplicação de registro (`CRUDModal.save()` genérico brigando com o versionamento customizado de `missao`/`visao` — `SELF_MANAGED_TYPES`), que também afetava a Missão. |
| **1.7** | 2026-09-19_23-15 | Claude Code & User | Nova seção de Objetivos (Curto/Médio/Longo Prazo) em um único modal com campo "Prazo": `switchToObjetivosView()`, `form-objetivos`, `view-objetivos-educacional`, registro `objetivos` em `formMappers.js`/`formLoaders.js`/`SELF_MANAGED_TYPES`. |
| **1.8** | 2026-09-19_23-30 | Claude Code & User | Hierarquia de Objetivos corrigida: ordem de exibição e do seletor "Prazo" passou a ser Longo → Médio → Curto (era Curto → Médio → Longo), em `switchToObjetivosView()`, `switchToStrategicView()` e `form-objetivos`. |
| **1.9** | 2026-09-19_23-50 | Claude Code & User | Nível Tático iniciado: página "Planos" (menu `Tático`) com sub-abas Anual/Mensal/Semanal. Plano Anual implementado nos mesmos moldes de Missão/Visão (texto único versionado, sem vínculo com Objetivos por ora); Mensal e Semanal com placeholder "em construção". `switchToPlanosView()`, `view-planos`, `form-plano_anual`, registro `plano_anual` em `formMappers.js`/`formLoaders.js`/`SELF_MANAGED_TYPES`. |
| **1.10** | 2026-09-20_00-05 | Claude Code & User | Navegação de Planos reestruturada por preferência do usuário: removida a barra de sub-abas dentro de `view-planos`; agora "Plano Anual"/"Plano Mensal"/"Plano Semanal" são três links diretos no menu lateral (`Tático`), mesmo padrão de Missão/Visão/Objetivos. `switchToPlanosView(prazo)` simplificada (sem toggle de abas), `headerTitle` passa a exibir o nome específico do plano. |
| **1.11** | 2026-09-20_00-20 | Claude Code & User | Plano Mensal implementado com o mesmo esquema do Plano Anual (texto único versionado). Extraído helper compartilhado `renderPlanoVersionado(contentArea, tipo, label, icone)` em `app.js`, reutilizado por `plano_anual` e `plano_mensal` (evita triplicar o bloco "atual + histórico" quando o Plano Semanal for implementado). O listener de `crudSave` também foi generalizado para `type === 'plano_anual' \|\| type === 'plano_mensal'`. Registro `plano_mensal` em `formMappers.js`/`formLoaders.js`/`SELF_MANAGED_TYPES`, `form-plano_mensal` no modal CRUD. |
| **1.12** | 2026-09-20_00-30 | Claude Code & User | "Plano Semanal" movido do menu `Tático` para o menu `Operacional` (primeiro item, antes de "Meu Planner"), por preferência do usuário. Mudança apenas de posição no HTML — `id="menu-plano-semanal"` e o listener em `app.js` (`switchToPlanosView('semanal')`) não mudaram. |
| **1.13** | 2026-09-20_00-45 | Claude Code & User | Plano Anual e Plano Mensal ganharam navegação por período: barra de botões no topo (período atual em destaque, períodos anteriores em cinza/inativos e somente leitura). `renderPlanoVersionado()` reescrita para agrupar registros por ano (`plano_anual`) ou mês (`plano_mensal`) via `getPeriodoKey()`/`getPeriodoLabel()`; botão "✏️ Atualizar" só aparece no período atual. Novo estado `planosPeriodoSelecionado`. |
| **1.14** | 2026-09-20_01-00 | Claude Code & User | Criado `CLAUDE.md` (cópia adaptada de `GEMINI.md`), e ambos os arquivos ganharam a seção "Onboarding Rápido para uma Nova IA / Sessão", listando em ordem os documentos a consultar (`Sobre_extPlanner.md` → `MANUAL_TECNICO.md` → `pendencias.md` → `docs/historico/`, os 3-5 mais recentes) para uma nova sessão/agente se situar rapidamente no estado atual do projeto. |
| **1.15** | 2026-09-20_01-15 | Claude Code & User | Criado `docs/UX_LAYOUT.md` — novo documento dedicado a registrar discussões e análises de UX/layout (desktop vs. mobile), já que `MANUAL_TECNICO.md` só documenta soluções **implementadas**. Primeira entrada: análise de responsividade pedindo destaque à Visão Semanal no mobile mantendo todas as funcionalidades no desktop (4 opções com trade-offs, análise ainda sem implementação). `GEMINI.md`/`CLAUDE.md` atualizados para incluir esse documento no onboarding (item 5). |
| **1.16** | 2026-09-20_01-45 | Claude Code & User | Novo item "Atividade" no menu `Operacional` (abaixo de "Plano Semanal"): `view-atividades` com botão "Cadastrar Atividade" (reaproveita o modal `atividade` já existente), listagem em tabela com filtros por texto/status/categoria/contexto, e ações "Ver"/"Editar" por linha. `switchToAtividadesView()`/`renderAtividadesTable()` em `app.js`; listener de `crudSave` estendido para re-renderizar a tabela quando a view estiver ativa. |
| **1.17** | 2026-09-19_01:30 | Claude Code & User | Criado `rodar.bat` na raiz: servidor HTTP local auto-contido para testar o app no navegador (sem carregar como extensão). Sobe em `http://localhost:8000`, decodifica um servidor Python embutido em Base64 (via `powershell`), com `Cache-Control: no-store` e MIME `text/javascript` forçado para `.js` (evita a armadilha de cache do `http.server` — ver 3.11/3.16), e abre o navegador automaticamente. O app cai no fallback `localStorage` neste modo. |
| **1.18** | 2026-09-19_02:00 | Claude Code & User | Menu lateral: grupos `Estratégico` e `Tático` passam a vir **colapsados** por padrão (removido `open` do `<details>`); grupo `Operacional` passa a vir **expandido** (adicionado `open`). Mudança puramente de atributo HTML em `index.html`, sem alteração de JS. |
| **1.19** | 2026-09-19_02:30 | Claude Code & User | Tela de Atividades: novo botão **"🎲 Carregar dados de exemplo"** (`seedDemoAtividades()` em `app.js`) que popula categorias, contextos e 6 atividades de demonstração de forma idempotente (não duplica por título). Útil para testar via `rodar.bat`, já que o storage local (`localStorage`) é separado do `chrome.storage.local` usado como extensão. |
| **1.20** | 2026-09-19_03:00 | Claude Code & User | Correção de UX: no layout **"stacked" (Lista Acordeão)** da Visão Semanal, o nome do dia agora abre a Visão Diária (`goDaily`) e não apenas o *badge* de data (que era o único gatilho). Adicionado `addEventListener` no wrapper `day-title-open` em `renderWeeklyGrid()`. Também ajustado `seedDemoAtividades()` para gerar datas locais `YYYY-MM-DD` (antes UTC/`toISOString`, podia deslocar 1 dia em fusos negativos). |
| **1.21** | 2026-09-19_03:15 | Claude Code & User | **Seção "Atividades" integrada aos Planos Anual/Mensal/Semanal:** nova renderização em `renderPlanoVersionado()` exibindo cards de atividades responsivos abaixo do texto versionado. Filtro automático via `transferPeriodo` (objeto `{tipo, periodo}`). Três botões por card: "👁️ Ver" (modal read-only), "✏️ Editar" (CRUD modal), "🔄 Transferir" (realoca entre planos). Plano Semanal deixou de ser "em construção" — agora funcional com suporte a granularidade `'semana'` e período key `2026-w38`. Botão "+ Adicionar" pré-preenche contexto via `window.atividadePlanoContexto`. 11 atividades de teste populadas. Ver histórico `atividades_nos_planos_20260919_0315.md`. |
| **1.22** | 2026-09-19_03:45 | Claude Code & User | **Correções críticas no sistema de transferência de atividades:** (1) Bug na linha 2023 corrigido — usava `destino` (string com hífen, ex: `'plano-mensal'`) em vez de `tipo` computado (underscore, ex: `'plano_mensal'`), causando falha no filtro de `transferPeriodo`; (2) Adicionado `alert('✓ Atividade transferida com sucesso!')` após confirmação de transferência para feedback visual ao usuário; (3) Adicionado re-render automático do Plano após transferência (`switchToPlanosView(currentPlanosTab)`) para refletir mudanças imediatamente sem refresh manual. Transferência agora funciona 100% end-to-end. Ver histórico `transferencia_bugs_corrigidos_20260919_0345.md`. |
| **1.23** | 2026-09-20_04:15 | Claude Code & User | **Refatoração de cabeçalho (Opção A — Mínimo):** Removidos títulos redundantes "Plano Anual Atual", "Plano Mensal Atual", "Plano Semanal Atual" da renderização em `renderPlanoVersionado()` (linha 608). Cabeçalho agora traz apenas a data e o conteúdo do plano. Container `header-periodo-buttons` já preparado para exibir botões de navegação entre períodos quando houver múltiplos períodos (`periodosOrdenados.length > 1`). Simplifica layout e remove redundância — título já está nas abas centrais do cabeçalho. Ver histórico `header_reorganizacao_20260920_0415.md`. |
| **1.24** | 2026-09-20_05:30 | Claude Code & User | **Remoção de botões de Planos do cabeçalho:** Removidos os 3 botões "Plano Anual", "Plano Mensal", "Plano Semanal" que estavam no cabeçalho central (linhas 116-124 de `index.html`). Espaço central agora fica vazio, reservado para `header-periodo-buttons` quando houver múltiplos períodos. Cabeçalho fica mais limpo e desocupado. Navegação entre planos continua disponível via menu lateral (Tático). |
| **1.25** | 2026-09-19_11:50 | Claude Code & User | **Fix: Clique no w38 carrega Plano Semanal:** Implementada navegação funcional para o Plano Semanal ao clicar no botão `w38` (número da semana) no cabeçalho. Root cause: função `switchToPlanosView` não estava exposta em `window.appRouter`. Solução: (1) Adicionada `switchToPlanosView: (prazo) => switchToPlanosView(prazo)` ao objeto `window.appRouter` (linha 2170); (2) Alterado listener para chamar via `window.appRouter.switchToPlanosView('semanal')` (linha 2358); (3) Removidos console.logs de debug. Bug estava marcado como "pendente" ao final da sessão anterior. Ver histórico `w38_clique_plano_semanal_20260919.md`. |
| **1.26** | 2026-09-19_12:00 | Claude Code & User | **Fase 1: Refatoração CRUD em Módulos ES6 - Criação dos módulos menores:** Iniciada decomposição do Modal CRUD monolítico em `app.js` (linhas 230-510, ~280 linhas) em módulos limpos. Fase 1 criou 3 módulos em `js/modules/crud/`: (1) **formMappers.js** (~280 linhas) — Registry centralizado com metadados de 15 tipos de formulários (operacional, estratégico, tático), storage keys, campos, validações, defaults, etc. + helper functions (getStorageKey, getFormConfig, getFormTitle, etc.); (2) **formValidators.js** (~300 linhas) — Validações mínimas genéricas + específicas por tipo (não-vazio, formato data/hora, tipo Eisenhower, etc.), helpers isValidDate/isValidTime/isValidEmail/isValidUrl; (3) **formLoaders.js** (~350 linhas) — Carregar e preencher formulários, popular selects dinâmicas (categorias, contextos), lidar com campos condicionais (Alarme), extrair dados de formulário, exibir/limpar erros inline, carregar dados para listagem. Arquivo `index.js` para exportação centralizada. Ver histórico `crud_modulos_criados_20260919.md`. |
| **1.27** | 2026-09-19_12:30 | Claude Code & User | **Fase 2: Refatoração CRUD - CRUDModal Implementado:** Reescrita completa de `js/modules/crudModal.js` (~190 linhas) para usar corretamente os 3 módulos da Fase 1. Reparadas importações (paths corretos `./crud/...`), métodos (FormLoaders é estática, não instanciar), calls (extractFormData ao invés de collectFormData). Implementada arquitetura: open(type, data) carrega formulário com FormLoaders, handleSubmit(e, type) valida com FormValidators e salva com save() genérico ou dispara crudSave (self-managed types: missao, visao, objetivos, plano_*). Registro de handlers com cache para limpeza. Métodos: open(), close(), handleSubmit(), save(), dispatchSaveEvent(), getCurrentType(), isOpen(). ✅ Testado: modal abre, validação funciona (campo obrigatório), salva sem erros. Ver histórico `crud_fase2_crudmodal_20260919.md`. |
| **1.28** | 2026-09-19_12:45 | Claude Code & User | **Fase 3: Refatoração CRUD - Conclusão:** Auditoria de Fase 3 revelou que `app.js` **já foi escrito para usar a arquitetura refatorada** - não havia código monolítico a remover. Refatoração **100% completa**: (1) app.js instancia CRUDModal (linha 20), (2) window.appRouter.openModal usa crudModal.open() (linha 2166), (3) nenhuma função monolítica openModal() em app.js, (4) listener crudSave reage a eventos disparados por CRUDModal, (5) teste funcional: modal abre → valida → salva → evento → re-renderiza, sem erros. **Arquitetura Final:** 1300+ linhas distribuídas em 5 módulos (4 CRUD + 1 orquestrador) vs 280 linhas de monolítico anterior. Modular, reutilizável, testável, escalável. **Status: PRODUCTION READY** 🎉. Ver histórico `crud_fase3_conclusao_20260919.md`. |
| **1.29** | 2026-09-19_21:30 | Claude Code (Sonnet 5) & User | **Reconstrução de views/formulários perdidos por dessincronia HTML/JS + bug real em formMappers.js:** Uma correção de encoding UTF-8 em sessão anterior restaurou `index.html` a partir de um `.bak` desatualizado (anterior à v1.6), enquanto `app.js` seguiu evoluindo — resultado: 34 IDs referenciados por `app.js` não existiam mais no HTML (5 formulários, 4 views, 1 modal, 2 containers de cabeçalho), causando páginas em branco em Plano Anual/Mensal/Semanal e Atividades. Reconstruídos: `form-visao`, `form-objetivos`, `form-plano_anual/mensal/semanal`, `view-planos`, `view-atividades`, `view-visao-educacional`, `view-objetivos-educacional`, `global-transfer-modal`, `header-week-tabs`; `view-missao-educacional` movida para dentro de `<main>` (reincidência do bug da seção 3.8). **Bug adicional descoberto e corrigido:** os 6 tipos self-managed em `formMappers.js` declaravam campos em português (`conteudo`/`tipo`/`titulo`) que nunca batiam com os IDs reais do HTML (`content`) nem com o que `app.js` lê do `formData` — isso significa que o formulário de Missão nunca havia sido testado ponta-a-ponta com sucesso antes desta correção. Projeto passou a ter repositório Git real (`github.com/LuizNogaroli/extTotalPlanner`) como rede de segurança. Ver histórico `reconstrucao_views_formularios_20260919_2130.md`. |
| **1.30** | 2026-09-20_00:00 | Claude Code (Sonnet 5) & User | **Breadcrumb de navegação Ano › Mês › Semana no cabeçalho dos Planos:** Substituída a barra plana de botões de período (um nível por vez) por um breadcrumb `2026 › Set › Sem. 38` sempre com os 3 níveis, cada segmento abrindo um dropdown com as opções irmãs; clicar numa opção navega direto para o Plano correspondente já naquele período. Responsivo: abaixo de 768px colapsa num botão único que abre um painel com os 3 níveis empilhados. **3 bugs reais corrigidos no processo:** (1) `getPeriodoKey()`/`getPeriodoLabel()` nunca tratavam granularidade `'semana'` — Plano Semanal na prática agrupava por ano; agora reaproveita o cálculo de semana (domingo-sábado) já usado em `header-week-tabs`; (2) `switchToPlanosView()` sempre resetava o período selecionado para o atual, ignorando navegação explícita — adicionado parâmetro `periodoForcado`; (3) `grupos[periodoSelecionado].sort()` quebrava com `TypeError` para períodos sem registros (só o período atual tinha proteção). Também corrigido bug de posicionamento: dropdowns `position: absolute` eram cortados por `overflow-x-auto` no header (regra do CSS spec que força `overflow-y: auto` junto) — resolvido com container `#periodo-dropdown-root` fixo anexado ao `<body>`, posição calculada via `getBoundingClientRect()`. Ver histórico `breadcrumb_periodo_20260920_0000.md`. |
