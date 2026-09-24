# Alarmes: Motor Robusto (Várias Abas, Minuto Perdido, Som) — Inspirado em extListaDeCompras

**Data/Hora:** 2026-09-24_00:30
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

O motor de alarmes (`js/services/NotificationService.js`) foi reescrito. A base continua sendo a da referência `extListaDeCompras`: a API `Notification` padrão, o botão de permissão de 3 estados e o som sintetizado. Por cima dela entraram proteções para um alarme **agendado** rodando numa extensão de **New Tab**.

## Por que

Pedido do usuário: "O recurso de 'Alarme' não está funcionando bem, olhe no projeto extListaDeCompras como foi feito o push lá e se inspire para consertar o funcionamento dessa funcionalidade".

O usuário não detalhou o sintoma. Por isso, antes de mudar qualquer coisa, os defeitos do motor anterior (v1.33) foram **reproduzidos no navegador**:

| Situação | Resultado antes |
| :--- | :--- |
| 2 abas New Tab abertas no minuto do alarme | 2 avisos para o mesmo alarme |
| Recarregar ou abrir outra aba no mesmo minuto | mais 1 aviso (3 no total) |
| A verificação pula o minuto exato (aba em segundo plano, PC suspenso) | o alarme **nunca** dispara |

Também faltavam duas coisas da referência: o **som** e o **botão de permissão visível** onde o usuário lida com o recurso. O botão ficava só em Configurações.

## Estado Anterior

- A comparação usava o minuto exato (`alarm.time === "HH:mm"`), com verificação a cada 20s.
- O "já disparei" (`lastFiredKey`) ficava **só na memória de cada aba**.
- Não havia som.
- A permissão ficava só em Configurações. Salvar um alarme não pedia permissão.
- Depois de salvar um alarme, o gerenciador ficava fechado.
- `manifest.json` só tinha `"storage"`.

## Estado Novo

- **Registro de disparos compartilhado** em `localStorage['planner_alarme_disparos']`, protegido por **Web Locks** (`navigator.locks`). Só uma aba avisa por ocorrência.
- **Janela de tolerância de 10 min:** dispara as ocorrências vencidas que ainda não estão no registro. O texto do aviso informa o atraso. As ocorrências de ontem também são verificadas, para cobrir alarmes perto da meia-noite.
- **Verificação imediata** quando a aba volta a ficar visível.
- **`markHandled()` ao salvar ou editar:** horários que já passaram não disparam por causa da tolerância.
- **Notificação** com `tag` única por ocorrência e `requireInteraction: true`. O clique foca a aba e fecha o aviso.
- **Som** "ding-dong" duplo (Web Audio, senoide A5 → D6). O áudio é liberado no primeiro clique ou tecla da aba e toca só na aba que disparou.
- **Faixa no gerenciador "Lembretes e Alarmes":** botão de 3 estados, "🔊 Testar aviso" e texto de ajuda por estado, inclusive como desbloquear quando está negado. Configurações reaproveita a mesma lógica (`renderNotificacoesUI()`).
- **Salvar um alarme** com a permissão ainda não decidida pede a permissão ali mesmo. Depois de salvar, a lista de alarmes reabre.
- **`manifest.json`:** `"notifications"` voltou. Numa extensão instalada, ela concede a API `Notification` sem depender de um prompt. Não traz de volta `chrome.notifications` nem o `background.js`.

## Ficheiros Afetados

- `js/services/NotificationService.js` (reescrito)
- `js/app.js`: UI de permissão compartilhada (`renderNotificacoesUI`, `pedirPermissaoNotificacoes`, `setBotaoDesabilitado`), `openManager()` mostra ou esconde a faixa, e o ramo `alarme` do `crudSave` chama `markHandled`, pede permissão e reabre a lista.
- `index.html`: faixa `#manager-notificacoes` no modal gerenciador. Só usa classes que já existem no Tailwind local (§3.21).
- `manifest.json`: `"notifications"` em `permissions`.

## Validação

Feita com um espião de `Notification` e de `AudioContext`, porque o sandbox bloqueia a permissão real (comportamento esperado; ver referência §5):

- ✅ **2 abas reais** verificando o mesmo alarme: **1** aviso no total.
- ✅ 2 instâncias verificando **ao mesmo tempo** (`Promise.all`): 1 aviso por alarme (trava funcionando).
- ✅ Recarregar no mesmo minuto: nenhum aviso a mais.
- ✅ Alarme de 3 min atrás: dispara com "Lembrete das 21:42 (aviso com 3 min de atraso)". De 20 min atrás: não dispara.
- ✅ Som: 4 notas por aviso, 8 notas para 2 avisos.
- ✅ Faixa de permissão:
  - aparece só no gerenciador de Alarmes;
  - estado bloqueado mostra o botão desabilitado, a dica e o "Testar" desabilitado;
  - `default` → "Ativar" → `granted` habilita o "Testar";
  - "Testar aviso" dispara um aviso.
- ✅ Alarme criado pela interface com horário 5 min no passado: a lista reabre com o item, e o alarme **não** dispara.
- ✅ Nenhum erro no console.
- ❌ **Não verificado:** toast e som reais na máquina do usuário, e o efeito da permissão `"notifications"` na extensão instalada. O navegador desta sessão bloqueia notificações e não instala extensões. Ver `pendencias.md` §5.

## Plano de Rollback / Desfazer

Restaurar do Git as versões anteriores de `js/services/NotificationService.js`, do trecho de permissão em `js/app.js` (bloco "Botão de permissão de Notificações (3 estados)"), do ramo `type === 'alarme' && currentManagerType === 'alarme'` do `crudSave` e de `openManager()`. Remover `#manager-notificacoes` do `index.html` e `"notifications"` do `manifest.json`. A chave `planner_alarme_disparos` pode ficar no `localStorage`; ela é ignorada pelo motor antigo.

## Notas Importantes

1. **Limitação que continua:** com todas as abas do Total Planner fechadas, nada dispara. Uma aba aberta até 10 min depois do horário ainda avisa, com atraso. Garantir disparo com tudo fechado exigiria voltar ao `chrome.alarms` num service worker (§3.19/§3.23).
2. O `extDocumentacao/02-service-worker-mv3.md` recomenda `chrome.alarms` e cita o antigo `background.js` deste projeto como exemplo. Essa referência está desatualizada em relação ao `extTotalPlanner` e não foi alterada, porque é outro repositório.
