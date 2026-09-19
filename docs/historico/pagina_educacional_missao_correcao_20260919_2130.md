# Página Educacional da Missão: Correção Estrutural e de Encoding
**Data:** 19 de Setembro de 2026

## O que foi feito
Foi adicionado um hint/página educacional ao lado do título da Missão, explicando academicamente o que é uma declaração de missão (definição, características, diferenças em relação a Visão/Metas, exemplos práticos e dicas). A primeira versão exibia o conteúdo fora da área de conteúdo do sistema — o usuário reportou que ao clicar em "📚 Educacional" a página não carregava dentro do espaço correto, e que o botão "Voltar para Missão" não funcionava.

A investigação revelou que o problema não era de CSS, e sim **estrutural**: a `<div id="view-missao-educacional">` tinha sido inserida no HTML fora da tag `<main>`, junto aos modais no fim do `<body>`. O JavaScript de roteamento (`classList.toggle('hidden'/'flex')`) até funcionava (o elemento ficava com `display:flex`), mas ele renderizava fora do container com scroll da área de conteúdo — só aparecia se o usuário rolasse a página inteira até o fim. As primeiras tentativas de correção usaram hacks (`style.display` forçado + `scrollIntoView`) que mascaravam o sintoma, mas deixavam o scroll da página em posição inconsistente, o que por sua vez fazia o botão "Voltar" parecer quebrado (a view de destino renderizava corretamente, mas fora da área visível).

## 1. Estado Anterior (Antes)
- `view-missao-educacional` estava posicionada no `index.html` depois do modal `global-manager-modal`, fora da tag `<main>` (que fecha bem antes, junto com `view-dashboard`).
- O bloco carregava com um artefato de corrupção literal `` `n`n `` no comentário HTML anterior (resquício de uma edição via PowerShell malsucedida).
- Vários emojis e acentos dentro do bloco estavam corrompidos em mojibake (ex.: `ðŸ"š` em vez de `📚`, `â†` em vez de `←`, `AutÃªntica` em vez de `Autêntica`).
- Em `js/app.js`, o clique em "📚 Educacional" precisava de `view.style.display='flex'`, `visibility`, `opacity` e `view.scrollIntoView()` forçados via JS para o conteúdo aparecer — um sintoma de que a estrutura HTML estava errada, não a lógica.
- Os listeners dos botões "Voltar para Missão" (topo e rodapé) eram re-registrados a cada visita à página de Missão (já que `switchToMissaoView()` roda no clique do menu), acumulando múltiplos listeners nos mesmos elementos estáticos ao longo da sessão.

## 2. Estado Novo (Depois)
1. Um script Python (baseado em contagem de profundidade de `<div>`/`</div>`) localizou o bloco completo `view-missao-educacional` (da abertura até o `</div>` de fechamento correspondente) e o moveu para **dentro** de `<main>`, como irmã de `view-strategic` (logo após seu fechamento, em `index.html`), a mesma área onde vivem `view-reports` e `view-export`.
2. O comentário HTML corrompido (`` </div>`n`n <!-- View - Educacional Missão --> ``) foi limpo durante a movimentação.
3. Um script Python de reversão de mojibake (regex `[\xc2\xc3\xe2\xf0][\x80-\xff-￿]{1,3}`, reencode para `cp1252` com fallback de identidade para bytes não mapeados como `0x90`, decode como `utf-8`) corrigiu todos os emojis e acentos remanescentes no bloco (`📚`, `✨`, `🔄`, `💼`, `📌`, `💻`, `🏢`, `💡`, `←`, `Autêntica`, `você`, `excelência`).
4. Em `js/app.js`, os hacks (`style.display`, `style.visibility`, `style.opacity`, `scrollIntoView`) foram removidos do listener de `btn-educacional-missao`. Agora apenas `classList.remove('hidden')` + `classList.add('flex')` + `view.scrollTop = 0` (reset de scroll interno do próprio container, não da página).
5. Os listeners de `btn-voltar-missao` e `btn-voltar-missao-bottom` foram movidos para fora do fluxo de re-registro repetido: uma flag booleana (`btnVoltarMissaoListenersAttached`, declarada no escopo do `DOMContentLoaded`) garante que os `addEventListener` só rodem uma única vez, evitando acúmulo de handlers duplicados a cada navegação para a Missão.

## 3. Plano de Rollback / Desfazer
1. Em `index.html`, localizar o bloco `<div id="view-missao-educacional" ...> ... </div>` (atualmente logo após o fechamento de `<div id="view-strategic">`, dentro de `<main>`) e movê-lo de volta para depois do `global-manager-modal` (fora de `<main>`) — não recomendado, pois reintroduz o bug original.
2. Em `js/app.js`, dentro do listener de `btn-educacional-missao`, restaurar (se necessário) as linhas `view.style.display='flex'; view.style.visibility='visible'; view.style.opacity='1'; view.scrollIntoView(...)` — só seria necessário se o bloco voltasse a ficar fora do container correto.
3. Para reverter a correção dos listeners duplicados, remover a variável `btnVoltarMissaoListenersAttached` e o `if (!btnVoltarMissaoListenersAttached) { ... }` que envolve o registro dos botões "Voltar", voltando a registrá-los incondicionalmente a cada chamada de `switchToMissaoView()`.
