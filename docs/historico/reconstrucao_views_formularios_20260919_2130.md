# Reconstrução de Views/Formulários Perdidos + Correção de Bug em formMappers.js

**Data/Hora:** 2026-09-19_2130
**Responsável:** Claude Code (Sonnet 5) & User

## Contexto: Como o problema surgiu

Durante uma sessão anterior de correção de encoding UTF-8 (`index.html` estava com mojibake generalizado — "EstratÃ©gico" no lugar de "Estratégico", etc.), o arquivo `index.html` acabou sendo restaurado a partir de um backup (`index.html.bak`) desatualizado, de um ponto anterior à versão 1.6 do manual técnico. O `js/app.js`, por outro lado, continuou sendo o arquivo mais recente (já na versão pós-refatoração CRUD, com suporte a Visão, Objetivos, Planos Anual/Mensal/Semanal, Atividades com listagem/filtro e transferência entre planos).

Resultado: os dois arquivos ficaram dessincronizados. O `app.js` referenciava dezenas de IDs de elementos HTML (views, formulários, containers) que simplesmente não existiam mais no `index.html`, fazendo com que o usuário visse páginas em branco ao navegar para Plano Anual/Mensal/Semanal, e o menu lateral aparentasse estar "com uma versão antiga".

## Diagnóstico

Comparação sistemática entre `getElementById(...)` em `app.js` e os `id="..."` existentes em `index.html` revelou **34 IDs ausentes**, agrupados em:

1. **5 formulários completos** no modal CRUD: `form-visao`, `form-objetivos`, `form-plano_anual`, `form-plano_mensal`, `form-plano_semanal`
2. **4 views inteiras** fora do `<main>` ou inexistentes: `view-planos`, `view-atividades`, `view-visao-educacional`, `view-objetivos-educacional`
3. **1 modal inteiro** inexistente: `global-transfer-modal` (transferência de atividades entre planos)
4. **Containers de cabeçalho**: `header-periodo-buttons`, `header-week-tabs`
5. **`view-missao-educacional` fora de `<main>`** — reincidência do bug já documentado na seção 3.8 do manual (view controlada por `hideAllViews()` mas colada no fim do `<body>`)

## Bug adicional descoberto: `formMappers.js` desalinhado com `app.js`

Durante a reconstrução, foi descoberto que **mesmo antes** da corrupção do HTML, o registro dos 6 tipos self-managed (`missao`, `visao`, `objetivos`, `plano_anual`, `plano_mensal`, `plano_semanal`) em `js/modules/crud/formMappers.js` usava nomes de campo em português (`conteudo`, `tipo`, `titulo`, `descricao`) que **nunca correspondiam** aos IDs reais dos `<textarea>`/`<select>` no HTML (`missao-content`, não `missao-conteudo`) nem ao que o listener `crudSave` em `app.js` lê do `formData` (`formData.content`, `formData.prazo`).

Como `FormLoaders.extractFormData()` monta o seletor esperado como `#{type}-{field}`, isso significa que **mesmo a Missão — a única view "funcional" antes desta sessão — nunca teve seu formulário de atualização testado ponta-a-ponta**: o campo seria sempre lido como `undefined`.

### Correção
Reescritos os 6 registros em `formMappers.js` para usar `fields: ['id', 'createdAt', 'content']` (mais `'prazo'` no caso de objetivos) e `storageKey: 'planner_strategies'` uniformemente, batendo com o que `app.js` de fato persiste.

## O que foi feito

1. **Limpeza de mojibake residual**: aplicada a técnica documentada na seção 3.9 (reverter bytes CP1252 relidos como UTF-8) via script Python, cobrindo emojis multi-byte que escaparam de correções anteriores baseadas em `sed`/PowerShell (📅, 🙏, 🏢, 🖨️, RODAPÉ, ← etc.)
2. **Import morto removido** de `app.js`: `FormMappers`/`FormValidators`/`FormLoaders` eram importados de `./modules/*.js` (cópias antigas pré-refatoração, nunca usadas — confirmado via grep) em vez de `./modules/crud/*.js`. Como nada os referenciava, foram simplesmente removidos do import (o `CRUDModal` já importa a versão correta internamente).
3. **5 formulários criados** no `global-crud-modal`, seguindo o padrão de `form-missao` (textarea único `{tipo}-content`, exceto Objetivos que tem `objetivos-prazo` + `objetivos-content`).
4. **`formMappers.js` corrigido** (ver seção acima).
5. **Views reconstruídas dentro de `<main>`**:
   - `view-planos` (container `planos-content-cards`, preenchido por `renderPlanoVersionado()`)
   - `view-atividades` (container `atividades-content-cards`, preenchido por `switchToAtividadesView()`)
   - `view-visao-educacional` e `view-objetivos-educacional` (conteúdo educacional novo, escrito seguindo o tom e estrutura de `view-missao-educacional`, já que o conteúdo original desses dois nunca existiu neste HTML)
   - `view-missao-educacional` movida do fim do `<body>` para dentro de `<main>`, junto às demais views
6. **`global-transfer-modal` recriado** com `transfer-destino`, `transfer-options` (containers dinâmicos para data ou período) e botões `btn-transfer-confirm`/`btn-transfer-cancel`, seguindo exatamente a lógica já existente em `app.js` (`openTransferModal`, `updateTransferOptions`).
7. **`header-week-tabs`** adicionado ao centro do cabeçalho (ao lado de `header-periodo-buttons`) — container dos botões `wXX`/dias da semana que `renderWeeklyGrid()` já sabia preencher.
8. **Dados de exemplo restaurados** no `localStorage` (Missão, Visão, Objetivos, os 3 Planos, categorias/contextos/atividades) para permitir validação visual imediata.

## Não incluído nesta correção

- `sidebar-timeline`: elemento referenciado por `renderSidebarTimeline()`, mas essa função já tem guarda (`if (!navContainer) return;`), não gerando erro. Funcionalidade de navegação por timeline no sidebar fica pendente para uma sessão futura, se desejada.

## Validação (testada no navegador via `python -m http.server 3000`)

- ✅ Missão: exibição, histórico de versões, view educacional com botão voltar, **submissão do formulário testada ponta-a-ponta** (nova versão salva, anterior movida ao histórico, re-render automático)
- ✅ Visão: idem, incluindo view educacional
- ✅ Objetivos: os 3 prazos (longo/médio/curto) exibindo corretamente
- ✅ Plano Anual/Mensal/Semanal: conteúdo, seção de Atividades vinculadas por período
- ✅ Atividades: tabela com filtros, paginação, ações Ver/Editar/Transferir
- ✅ Transferência de atividade: modal abre, dropdown de destino dinâmico (mostra anos/meses cadastrados), transferência efetiva confirmada (atividade passou a aparecer dentro do Plano Anual)
- ✅ Nenhum erro no console do navegador em nenhuma das views testadas

## Arquivos Afetados

- `index.html`: mojibake residual corrigido, 5 formulários adicionados, 4 views + 1 modal reconstruídos, `view-missao-educacional` movida, 2 containers de cabeçalho adicionados
- `js/app.js`: import morto removido (linhas 3 originais)
- `js/modules/crud/formMappers.js`: 6 registros self-managed corrigidos (campos e storageKey)

## Plano de Rollback

O commit anterior a esta mudança está preservado no histórico do Git em `https://github.com/LuizNogaroli/extTotalPlanner` (commit `51714ef`, "Initial commit"). Para reverter: `git revert 7bb8b7b` ou `git checkout 51714ef -- index.html js/app.js js/modules/crud/formMappers.js`. Não recomendado, já que o commit anterior é justamente o estado quebrado que esta mudança corrige.

## Lição Aprendida

Um backup de arquivo único (`.bak`) sem controle de versão real não é suficiente para um projeto com múltiplos arquivos interdependentes (`index.html` + `app.js` + módulos) — um `.bak` desatualizado de apenas um dos arquivos causa dessincronia silenciosa que só aparece em runtime, como página em branco. A partir desta sessão, o projeto passa a ter um repositório Git real (`https://github.com/LuizNogaroli/extTotalPlanner`) como rede de segurança.
