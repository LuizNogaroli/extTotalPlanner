# Fix: Dia do Sub-header Invisível ao Clicar a Partir do Plano Semanal

**Data/Hora:** 2026-09-24_03:00
**Responsável:** Claude Code (Sonnet 5) & User

## O que foi feito

Corrigido `switchToDailyView()` (`js/app.js`) para que clicar num dia do sub-header, a partir do **Plano Semanal**, realmente abra a Visão Diária na área de conteúdo.

## Por que

Relato do usuário: "quando clique no dia da semana em subheader não carregou a página do dia na área de conteúdo".

Esse bug já estava documentado como pendência conhecida em `docs/pendencias.md` (item 1.2) e `docs/sub-header.md` (§8, nº 1), com a causa e a correção sugerida já registradas por uma sessão anterior — não precisou ser "descoberto" de novo, só confirmado no navegador e corrigido.

**Causa raiz:** a Visão Diária não é uma view própria. É o `#daily-view-wrapper`, que fica **dentro** de `#view-dashboard`, ao lado do `#weekly-view-wrapper` — `openDailyView()` só alterna entre os dois, sem nunca chamar `hideAllViews()` nem mostrar `#view-dashboard`. Isso funciona bem quando o usuário já está no Dashboard. Mas o Plano Semanal (`renderPlanoVersionado()`, ao processar `tipo === 'plano_semanal'`) também popula o mesmo sub-header com os dias daquela semana (via `renderDiasNoSubheader()`, função compartilhada). Ao clicar num desses dias estando no Plano Semanal, `#view-planos` é a tela ativa e `#view-dashboard` continua com `hidden` — o dia carrega (o HTML é montado corretamente dentro de `#daily-view-wrapper`), mas fica invisível atrás da tela de Plano Semanal.

## Estado Anterior

```javascript
function switchToDailyView(date) {
    // Como a visualização diária agora é um modal, apenas abrimos o modal correspondente
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    openDailyView(date);
}
```

**Verificado no navegador (antes da correção):** Plano Semanal → clicar em "Qua 23/09" → nenhuma mudança visível na tela; `#view-planos` continuava a única coisa visível.

## Estado Novo

```javascript
function switchToDailyView(date) {
    // A Visão Diária não é uma view própria: é o #daily-view-wrapper, que fica DENTRO
    // de #view-dashboard, ao lado do #weekly-view-wrapper (ver docs/sub-header.md §8
    // nº1). Se o clique veio de outra tela que também popula dias no sub-header (ex.:
    // Plano Semanal, via renderPlanoVersionado), #view-dashboard está escondida e o dia
    // carregaria invisível atrás dela. Nesse caso, trocamos para o Dashboard antes.
    // Vindo do próprio Dashboard, nada disso roda — mantém breadcrumb/menu como estavam.
    if (viewDashboard.classList.contains('hidden')) {
        hideAllViews();
        viewDashboard.classList.remove('hidden');
        btnMenuDashboard.classList.add('bg-[var(--border-color)]', 'font-bold');
        renderDiasNoSubheader(getWeekDates(date));
    }
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.add('closed');
    openDailyView(date);
}
```

A checagem `viewDashboard.classList.contains('hidden')` é o que evita a regressão: só entra no ramo de "trocar de tela" quando o Dashboard não é a tela ativa. Vindo do próprio Dashboard, o comportamento é idêntico ao de antes (nenhuma chamada extra a `hideAllViews()`, que limparia o breadcrumb de período sem necessidade).

**Verificado no navegador (`rodar.bat`/preview, depois da correção):**
- **A partir do Plano Semanal:** clicar em "Qua 23/09" agora abre a Visão Diária completa — título "Qua - 23/09", "+ Nova Atividade", "Sem tarefas", widget Diário, Fatos do Dia, Citação, Devocional. O menu lateral também mudou corretamente para "Meu Planner" (destacado), e o dia clicado ficou destacado no sub-header. Nenhum erro no console.
- **A partir do Dashboard** (fluxo que já funcionava): clicar em "Seg 21/09" continua abrindo a Visão Diária normalmente, sem nenhuma mudança de comportamento perceptível.

## Plano de Rollback

Reverter `switchToDailyView()` para a versão anterior (2 linhas: fechar sidebar mobile + `openDailyView(date)`), removendo o bloco condicional. Nenhuma outra função ou arquivo foi alterado.
