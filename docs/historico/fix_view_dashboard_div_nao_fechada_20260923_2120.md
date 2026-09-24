# Fix: `#view-dashboard` Sem Fechamento — Views Seguintes Ficavam Invisíveis

**Data/Hora:** 2026-09-23_21:20
**Responsável:** Claude Code (Sonnet 5) & User

## O que foi feito

Corrigida uma `<div id="view-dashboard">` (linha 146 de `index.html`) que nunca era fechada no lugar certo, fazendo `#view-settings` — e por consequência `#view-reports` e tudo declarado depois no arquivo — ficarem aninhadas **dentro** de `#view-dashboard` em vez de serem irmãs dela dentro de `<main>`.

## Por que

Achado ao testar visualmente o botão de permissão de notificações adicionado em `view-settings` (ver `migracao_notification_api_20260923_2120.md`): a tela de Configurações aparecia completamente em branco ao clicar no menu, mesmo com o JavaScript de roteamento (`hideAllViews()`/`switchToSettings()`) aparentemente correto. Sem essa correção, a nova funcionalidade de notificações (e toda a tela de Configurações) permaneceria invisível na prática, apesar do código estar certo.

## Estado Anterior

`daily-view-wrapper` (linha 174) fechava corretamente na linha 243, mas a `<div id="view-dashboard">` que o envolve (aberta na linha 146) não tinha seu próprio `</div>` logo em seguida — o fechamento "sobrava" mais adiante, depois de todo o conteúdo de `#view-settings` já ter sido escrito. Contagem de tags confirmou: a partir da abertura de `view-dashboard`, a profundidade de aninhamento nunca voltava a 0 antes da abertura de `view-settings` (ficava em 1, ou seja, um nível de `<div>` ainda aberto). Confirmado no navegador: `document.getElementById('view-settings').parentElement.id === 'view-dashboard'` (deveria ser `<main>`).

Sintoma: `hideAllViews()` adiciona `hidden` a `#view-dashboard` ao navegar para Configurações — como `#view-settings` está *dentro* dela, fica escondida junto, mesmo sem ter a classe `hidden` nela mesma. Idêntico em efeito ao bug já catalogado na seção 3.8 do `MANUAL_TECNICO.md` (view fora de `<main>`), mas com causa raiz diferente (aqui é tag não fechada, lá era view solta no fim do `<body>`).

## Estado Novo

O `</div>` que fecha `#view-dashboard` foi movido para logo após o fechamento de `#daily-view-wrapper` (antes do comentário `<!-- Área de Configurações -->`), e o `</div>` extra que "sobrava" depois de `#view-settings` foi removido. Contagem total de `<div>`/`</div>` no arquivo não mudou (um inserido, um removido). Confirmado no navegador: `#view-settings` agora é filha direta de `<main>`, com `getBoundingClientRect()` reportando dimensões reais ao navegar para Configurações; Dashboard continua renderizando normalmente depois da mudança.

## Ficheiros Afetados

- `index.html` (linhas ~243 e ~289, ver diff)

## Validação

- ✅ `document.getElementById('view-settings').parentElement.tagName === 'MAIN'`
- ✅ Tela de Configurações renderiza visualmente (título, Aparência e Layout, Notificações, Painéis Ativos)
- ✅ Dashboard (`Meu Planner`) continua renderizando normalmente após a correção
- ✅ Nenhum erro novo no console

## Plano de Rollback / Desfazer

Reverter as duas edições em `index.html` (mover o `</div>` de volta para depois de `#view-settings`, remover o que foi inserido depois de `#daily-view-wrapper`) — mas isso reintroduz o bug de invisibilidade da tela de Configurações, não recomendado.

## Notas Importantes

1. O arquivo ainda tem um desbalanceamento de `-1` (`</div>` a mais que `<div>`) no total, que já existia antes desta sessão (confirmado comparando com `git show HEAD:index.html`) — não relacionado a este bug específico, não investigado por estar fora do escopo.
2. **Regra para o futuro** (registrada na seção 3.20 do `MANUAL_TECNICO.md`): se uma view "não aparece" mesmo com o toggle de `hidden` parecendo certo, checar `document.getElementById(viewId).parentElement` antes de mexer no JS — deveria sempre ser `<main>` diretamente.
