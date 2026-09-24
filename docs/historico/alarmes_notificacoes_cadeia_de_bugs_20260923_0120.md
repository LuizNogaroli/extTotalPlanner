# Correção da Funcionalidade de Alarmes/Notificações Push

**Data/Hora:** 2026-09-23_01:20
**Responsável:** Claude Code (Sonnet 5) & User

## O que foi feito

O usuário reportou que "a funcionalidade de push no desktop... ainda não funciona". Investigação revelou uma cadeia de **7 quebras independentes** (qualquer uma delas sozinha já inviabilizaria o recurso) originadas na Fase 1 da refatoração CRUD (v1.26): o registro `alarme` criado em `js/modules/crud/formMappers.js` usava um schema em português (`titulo`/`hora`/`recorrencia`/`diasemana`, storage key `planner_alarmes` plural) que nunca foi conectado ao HTML real (`index.html`) nem ao motor de notificações (`background.js`), que continuavam usando o schema original em inglês (`title`/`time`/`recurrence`/`weekdays`, storage key `planner_alarme` singular).

## Por que

Refactors que introduzem um "registry" novo para um tipo que já existe informalmente no projeto (HTML/JS escritos antes da refatoração) precisam ser conferidos contra os consumidores reais (IDs do HTML, listeners, storage). Isso não aconteceu aqui — o novo schema foi escrito isoladamente, sem grep pelos IDs reais nem pelos leitores existentes do storage, resultando num recurso "existente no código" mas 100% inoperante desde então.

## Estado Anterior (as 7 quebras)

1. **IDs de campo não batiam:** `crud/formMappers.js` esperava `#alarme-titulo`/`#alarme-tipo`/`#alarme-hora`/`#alarme-recorrencia`; o HTML real usa `#alarme-title`/`#alarme-time`/`#alarme-recurrence`. `extractFormData` nunca encontrava nenhum campo.
2. **Validação falhava sempre, silenciosamente:** `titulo`/`tipo` (sempre `undefined`) eram obrigatórios; a mensagem de erro tentava aparecer em `#alarme-titulo-error`, que também não existe no HTML — erro engolido, "Salvar" não fazia nada visível.
3. **Chave de storage divergente:** CRUD gravava em `planner_alarmes` (plural); `background.js` e a listagem "Lembretes e Alarmes" liam `planner_alarme` (singular).
4. **`background.js` ignorava recorrência:** todo alarme (inclusive "único") era agendado com `periodInMinutes: 1440` (repete para sempre); "semanal" nem existia como opção no `<select>`.
5. **Checkboxes de dias da semana nunca foram recriados** após a reconstrução da v1.29 — `#alarme-weekdays-container` era um `<div>` vazio permanentemente oculto.
6. **Link "Alarmes" do menu lateral sem `onclick`** — diferente dos irmãos (`Contextos/Papeis`), não tinha handler nenhum; clicar não fazia nada.
7. **Botão "+ Novo Item" do gerenciador genérico chamava função inexistente:** `openModal(currentManagerType)` em `js/app.js` — nunca existiu uma função local `openModal` no arquivo; o correto é `crudModal.open(...)`. Mesmo bug em mais 2 pontos (botão "Editar" da listagem, "+ Nova Atividade" do modal do dia). **Afetava todos os tipos do gerenciador genérico** (Compras, Histórico, Motivacional, Devocional, Categorias, Hábitos), não só Alarmes.
8. *(bônus, achado ao testar ponta-a-ponta)* **`CRUDModal.save()` nunca gerava `id`** para registro novo — `formData.id` chegava `null`, e como `save()` faz `findIndex(i => i.id === formData.id)`, o segundo registro (também `id: null`) **sobrescrevia** o primeiro.

## Estado Novo

- `js/modules/crud/formMappers.js`: schema `alarme` reescrito (`storageKey: 'planner_alarme'`, campos `title/time/recurrence/date/weekdays`, `requires: ['title','time']`).
- `js/modules/crud/formLoaders.js`: `handleAlarmeConditionals` corrigida para os IDs reais + suporte a `'semanal'`; `extractFormData`/`fillFormFields` tratam os checkboxes de dias como caso especial.
- `js/modules/crud/formValidators.js`: `validateAlarme` reescrita para os campos corretos (exige `date` se `unico`, ao menos 1 dia se `semanal`).
- `index.html`: select de recorrência ganhou opção "Semanal"; adicionados 7 checkboxes de dias da semana (valores `'0'`-`'6'`, convenção de `Date.getDay()`) com spans de erro; link "Alarmes" ganhou `onclick="window.appRouter.openManager('alarme')"` e ícone ⏰.
- `background.js`: `scheduleAlarms()` trata `'unico'` como alarme de disparo único (`when` sem `periodInMinutes`, ignorado se já passou); `'diario'`/`'semanal'` continuam com alarme diário recorrente, mas o `onAlarm` listener agora filtra `'semanal'` pelo dia da semana atual antes de notificar.
- `js/app.js`: as 3 chamadas a `openModal(...)` inexistente trocadas por `crudModal.open(...)` (linhas ~1458, ~1477, ~1760).
- `js/modules/crudModal.js`: `handleSubmit` gera `formData.id = Date.now().toString()` quando o id chega vazio.

## Ficheiros Afetados

- `index.html` — form-alarme (select + checkboxes + spans de erro) e link do menu lateral
- `js/modules/crud/formMappers.js` — schema `alarme`
- `js/modules/crud/formLoaders.js` — `handleAlarmeConditionals`, `extractFormData`
- `js/modules/crud/formValidators.js` — `validateAlarme`
- `js/modules/crudModal.js` — geração de `id` em `handleSubmit`
- `js/app.js` — 3 chamadas `openModal` → `crudModal.open`
- `background.js` — `scheduleAlarms()` e `onAlarm` listener
- `.claude/launch.json` (novo, nesta pasta e em `07-PROJETOS/.claude/launch.json`) — config de preview para testes locais

## Validação

Testado ponta-a-ponta via servidor HTTP local com `Cache-Control: no-store` (equivalente ao `rodar.bat`, fallback `localStorage`):
- ✅ Criar alarme diário, único (com data) e semanal (com dias marcados) — todos persistem em `planner_alarme` com o schema correto (`title`, `time`, `recurrence`, `date`, `weekdays`)
- ✅ Listagem "Lembretes e Alarmes" formata corretamente cada tipo de recorrência
- ✅ Editar um alarme pré-preenche todos os campos, incluindo os checkboxes de dias
- ✅ Excluir remove só o item certo
- ✅ Criar um segundo alarme não sobrescreve mais o primeiro (bug do `id: null` corrigido)

**Limitação conhecida:** o disparo real da notificação de desktop (`chrome.alarms.onAlarm` → `chrome.notifications.create` em `background.js`) só roda dentro de uma extensão Chrome **instalada de fato** (`chrome://extensions` → "Carregar sem compactação"). Não é possível verificar esse último elo via servidor local, pois `chrome.alarms`/`chrome.notifications` não existem no contexto de uma aba comum. Para validar 100%: carregar a pasta como extensão, criar um alarme "único" para 1-2 minutos no futuro, e aguardar a notificação do Windows.

## Plano de Rollback / Desfazer

Reverter os 7 arquivos listados em "Ficheiros Afetados" para o commit anterior a esta mudança. Como o recurso estava inoperante antes (não gerava nenhum dado válido em `planner_alarme`), não há risco de perda de dados de usuário ao reverter.

## Notas Importantes

1. Ver seção **3.18** do `MANUAL_TECNICO.md` para o detalhamento técnico completo de cada uma das 7 quebras e a regra geral para evitar recorrência (sempre grep IDs reais + consumidores de storage antes de "modernizar" um schema em `crud/formMappers.js`).
2. O bug #7 (`openModal` inexistente) e o bug #8 (`id: null` sobrescrevendo registros) **também afetavam** Compras, Histórico, Motivacional, Devocional, Categorias de Atividade e Hábitos — a correção desses dois pontos beneficia todos esses tipos, não só Alarmes.
