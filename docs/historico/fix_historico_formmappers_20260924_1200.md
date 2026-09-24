# Correção do Schema de Fatos Históricos em `crud/formMappers.js`

**Data/Hora:** 2026-09-24_12:00
**Responsável:** Claude Code (Sonnet 5) & User

> **Nota de integração:** esta mudança foi feita numa sessão paralela, disparada a partir de uma tarefa sinalizada durante a v1.47 (o mesmo bug de schema divergente foi notado de passagem em `historico` enquanto se corrigia Motivacional/Devocional). A sessão paralela partiu de um checkout anterior ao commit da v1.47 e por isso não sabia que ela já existia; o texto abaixo foi ajustado na integração para corrigir essa referência e renumerado de "v1.46" (já ocupada pelo fix do sub-header) para **v1.48**, com a nova seção como **§3.27** (não §3.26, já ocupada pela mudança de Citação/Devocional). O código em si não teve nenhuma mudança na integração.

## O que foi feito

A entrada `historico` em `js/modules/crud/formMappers.js` declarava campos (`data`, `titulo`, `descricao`, `tipo`) que não existem no formulário real `form-historico` em `index.html` (que só tem `historico-date` e `historico-fato`). Corrigido o schema para bater com os IDs reais do HTML e com o que `renderManagerList()` em `js/app.js` já lê (`item.date`, `item.fato`). Também corrigida a função `validateHistorico` em `crud/formValidators.js`, que ainda checava os nomes de campo antigos (`data`/`titulo`), e adicionado um link "📜 Histórico" ao grupo "Recursos" do menu lateral, já que o gerenciador só era alcançável via `window.appRouter.openManager('historico')` no console.

## Por que

Mesma classe de bug já documentada na §3.18 do `MANUAL_TECNICO.md` (Alarmes) e na §3.26 (Motivacional/Devocional, v1.47): um schema em `crud/formMappers.js` escrito sem conferir contra os IDs reais do `<form>` no HTML. `FormLoaders.extractFormData()` monta o seletor do input como `#${type}-${field}` e **pula silenciosamente** (`if (!input) continue;`) qualquer campo que não existe no DOM. Como a validação de `requires` roda sobre o objeto já extraído, um campo obrigatório que nunca é encontrado nunca é preenchido, e a validação falha sempre — sem lançar exceção, sem mensagem de erro visível, sem log. O resultado observável era "+ Novo Item" não fazer nada ao clicar "Salvar".

## Estado Anterior

- `js/modules/crud/formMappers.js` (entrada `historico`):
  ```js
  fields: ['id', 'createdAt', 'data', 'titulo', 'descricao', 'tipo'],
  requires: ['data', 'titulo'],
  ```
- `form-historico` em `index.html` só tem os inputs `historico-date` (tipo `date`) e `historico-fato` (textarea) — nenhum deles bate com `historico-data`/`historico-titulo`/`historico-descricao`/`historico-tipo`, que `extractFormData` procurava.
- `validateHistorico` em `crud/formValidators.js` verificava `data.data`/`data.titulo` (nomes que nunca chegavam preenchidos).
- Nenhum item do menu lateral abria o gerenciador de Histórico — só alcançável via `window.appRouter.openManager('historico')` no console.
- Resultado: criar um Fato Histórico não gravava nada em `localStorage.planner_historico`, sem nenhum erro visível na tela.

## Estado Novo

- `js/modules/crud/formMappers.js`:
  ```js
  fields: ['id', 'createdAt', 'date', 'fato'],
  requires: ['date', 'fato'],
  ```
- `crud/formValidators.js`: `validateHistorico` agora valida `data.date` (formato de data) e `data.fato` (não vazio).
- `index.html`: novo link `<a href="#" class="nav-subitem" onclick="window.appRouter.openManager('historico')">📜 Histórico</a>` no grupo "Recursos" do menu lateral, logo após "⏰ Alarmes".

## Ficheiros Afetados

- `js/modules/crud/formMappers.js` — schema `historico`
- `js/modules/crud/formValidators.js` — `validateHistorico`
- `index.html` — link "📜 Histórico" no menu lateral (grupo Recursos)
- `docs/MANUAL_TECNICO.md` — nova §3.27, linha v1.48 na §6
- `docs/pendencias.md` — item 1.8 marcado como corrigido (v1.48) e movido para a seção 8 (Concluído)

## Validação

Testado ponta-a-ponta via servidor HTTP local (`.claude/launch.json`, equivalente ao `rodar.bat`):
- ✅ Menu lateral → Recursos → "📜 Histórico" abre o gerenciador ("Fatos Históricos Cadastrados")
- ✅ "+ Novo Item" → preencher Data (`2026-09-24`) e Fato → "Salvar" fecha o modal sem erro
- ✅ `localStorage.planner_historico` passa a conter `[{"id":"...","date":"2026-09-24","fato":"..."}]`
- ✅ O item criado aparece na listagem do gerenciador, formatado como `[2026-09-24] <fato>`
- Dado de teste removido do `localStorage` ao final da verificação (não é dado real do usuário)

## Plano de Rollback / Desfazer

Reverter as 3 mudanças de código (`formMappers.js`, `formValidators.js`, `index.html`) para o commit anterior a esta mudança. Como o recurso estava inoperante antes (não gravava nenhum dado válido em `planner_historico`), não há risco de perda de dados de usuário ao reverter.

## Notas Importantes

1. `motivacional` e `devocional` tinham exatamente o mesmo problema de schema divergente e também não tinham link de menu — **já corrigidos em paralelo, na v1.47 (§3.26)**, por outra sessão trabalhando no recurso de Citação/Devocional. A sessão que fez esta mudança (`historico`) partiu de um checkout anterior a esse commit e por isso registrou nas suas notas originais que "não existe (ainda) nenhuma v1.47" — isso foi corrigido nesta nota durante a integração dos dois trabalhos.
2. Ver §3.18 (`MANUAL_TECNICO.md`) para o precedente completo desta classe de bug (Alarmes, 7 quebras encadeadas) e a regra geral: sempre conferir `fields`/`requires` de `crud/formMappers.js` contra os IDs reais do `<form>` e contra os leitores de listagem antes de considerar um tipo "implementado".
