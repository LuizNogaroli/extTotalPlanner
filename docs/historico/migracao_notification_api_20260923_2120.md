# Migração de Push para `Notification` Padrão (inspirado em extListaDeCompras)

**Data/Hora:** 2026-09-23_21:20
**Responsável:** Claude Code (Sonnet 5) & User

## O que foi feito

Substituído o motor de notificações baseado em `chrome.alarms`/`chrome.notifications` (`background.js`, um Service Worker MV3) pela Web API `Notification` padrão, rodando no cliente (`js/services/NotificationService.js`). O usuário pediu para consultar a documentação de referência do projeto irmão `extListaDeCompras` (`docs/notifications-and-sound.md`) e usar o mesmo padrão já validado lá.

## Por que

A sessão anterior (v1.32, ver `alarmes_notificacoes_cadeia_de_bugs_20260923_0120.md`) corrigiu a lógica de agendamento em `background.js`, mas deixou registrada uma limitação: o disparo real só podia ser confirmado instalando a extensão de verdade em `chrome://extensions`, já que `chrome.alarms`/`chrome.notifications` não existem fora de uma extensão instalada — impossível de testar via `rodar.bat`. `extListaDeCompras` já havia resolvido exatamente esse dilema optando pela `Notification` API padrão (funciona igual instalada ou como página comum), documentando o trade-off e as armadilhas (fluxo de permissão, autoplay de áudio, debug de "notificação criada mas não aparece").

## Estado Anterior

- `background.js`: Service Worker com `chrome.alarms.onAlarm` + `chrome.notifications.create()`.
- `manifest.json`: `permissions: ["storage", "alarms", "notifications"]`, `background: { service_worker: "background.js" }`.
- `js/services/NotificationService.js`: só tinha `init()`/`requestPermission()` (usava `Notification` só para o *fluxo de permissão*, mas quem de fato disparava a notificação era `background.js` via `chrome.notifications`, não `NotificationService`). Nenhuma UI chamava esse serviço.
- Limitação documentada: disparo real só verificável instalando a extensão.

## Estado Novo

- **`js/services/NotificationService.js`** reescrito por completo:
  - `getPermission()` / `requestPermission()`: espelham a API padrão.
  - `notify(title, body)`: cria `new Notification(...)` se `Notification.permission === "granted"`.
  - `start()`: liga um `setInterval` de 20s chamando `checkAlarms()` — chamado uma vez em `js/app.js` no boot (idempotente).
  - `checkAlarms()`: lê `planner_alarme`, compara `HH:mm` com o relógio atual, filtra por `recurrence`/`date`/`weekdays` (mesma regra de negócio de `renderManagerList()`), com debounce por minuto (`lastFiredKey`).
- **`js/app.js`**: `window.NotificationService.start()` chamado no `DOMContentLoaded`, logo após inicializar o `CRUDModal`. Botão de permissão de 3 estados adicionado (`btn-notifications-permission`), com a mesma lógica documentada em `notifications-and-sound.md` (desabilita ao ficar `granted`/`denied`, nunca tenta repetir o prompt depois de negado).
- **`index.html`**: nova subseção "Notificações" em `view-settings`, com o botão e um texto explicando a dependência de ter uma aba aberta.
- **`manifest.json`**: `permissions` reduzido a `["storage"]`; chave `"background"` removida.
- **`background.js`**: arquivo deletado (`git rm`).

## Ficheiros Afetados

- `js/services/NotificationService.js` (reescrito)
- `js/app.js` (start do motor + botão de permissão)
- `index.html` (subseção "Notificações" em Configurações)
- `manifest.json` (permissões e `background` removidos)
- `background.js` (removido)

## Validação

Testado via servidor local (fallback `localStorage`), já que o ambiente de automação bloqueia `Notification.permission` como `"denied"` por padrão (comportamento documentado e esperado, não é bug):
- ✅ Botão de permissão mostra corretamente os 3 estados (`default`/`granted`/`denied`) e desabilita fora de `default`.
- ✅ Lógica de disparo verificada substituindo `window.Notification` por uma classe espiã (técnica documentada em `notifications-and-sound.md` §5): alarmes `diario`, `unico` (com data de hoje) e `semanal` (com o dia da semana atual) disparam; `unico` com data errada, `semanal` com dia errado e horário errado corretamente **não** disparam.
- ✅ Debounce confirmado: rodar `checkAlarms()` duas vezes seguidas no mesmo minuto não duplica a notificação.
- **Não verificado nesta sessão** (requer navegador real, fora de sandbox): o toast do Windows realmente aparecendo na tela. Ver `notifications-and-sound.md` §6 para o roteiro de debug caso isso não aconteça (Foco/Assistente de Foco do Windows, lista de apps notificáveis, Central de Ações).

## Plano de Rollback / Desfazer

1. Restaurar `background.js` do histórico do Git (`git show <commit-anterior>:background.js`).
2. Restaurar `permissions`/`background` em `manifest.json`.
3. Reverter `NotificationService.js` para a versão anterior (só `init()`/`requestPermission()`).
4. Remover a chamada `window.NotificationService.start()` de `js/app.js` e o botão/subseção de `index.html`.

## Notas Importantes

1. **Trade-off aceito conscientemente:** o alarme só dispara enquanto alguma aba do Total Planner estiver aberta. Como é uma extensão de New Tab override, isso cobre bem o uso típico, mas não é garantido como um Service Worker seria. Ver seção 3.19 do `MANUAL_TECNICO.md` para a análise completa e quando reconsiderar.
2. Durante a verificação desta mudança, foi encontrado e corrigido um bug **pré-existente e não relacionado**: `#view-dashboard` nunca fechava sua `<div>` corretamente, deixando `#view-settings` (e views seguintes) invisíveis. Documentado separadamente em `fix_view_dashboard_div_nao_fechada_20260923_2120.md` e seção 3.20 — sem essa correção, o novo botão de notificações nunca apareceria na tela de verdade.
