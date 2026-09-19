# Navegação por Período nos Planos Anual e Mensal
**Data:** 20 de Setembro de 2026

## O que foi feito
O usuário pediu que o Plano Anual passasse a distinguir o **ano corrente** (ativo, editável) dos **anos anteriores** (inativos, somente leitura), exibidos como botões cinza numa barra no topo da página — e que o mesmo conceito fosse aplicado ao Plano Mensal, trocando "ano" por "mês".

Até então, `renderPlanoVersionado()` tratava todos os registros de um tipo (`plano_anual`/`plano_mensal`) como uma lista cronológica única: "o mais recente é o atual, o resto é histórico", sem qualquer noção de a qual ano ou mês civil cada versão pertencia. Isso significava que, ao virar o ano (ou o mês), o "atual" continuaria sendo simplesmente o último editado, mesmo que fosse de dezembro do ano passado — não havia como "olhar para trás" um ano específico de forma explícita, nem indicação visual de que um conteúdo era de um período encerrado.

## 1. Estado Anterior (Antes)
- `renderPlanoVersionado(contentArea, tipo, label, icone)` renderizava sempre: card "{label} Atual" com o registro de maior `timestamp`, e uma lista simples "(versões anteriores)" com todo o resto, sem agrupamento por período.
- Não havia diferenciação entre "uma versão editada há 2 dias dentro do mesmo ano" e "uma versão de um ano civil completamente anterior" — tudo ficava misturado na mesma lista de histórico.

## 2. Estado Novo (Depois)
1. **`js/app.js`** — duas novas funções utilitárias:
   - `getPeriodoKey(timestamp, granularidade)`: retorna `"2026"` (`granularidade === 'ano'`) ou `"2026-09"` (`granularidade === 'mes'`) a partir de um timestamp.
   - `getPeriodoLabel(key, granularidade)`: formata a chave para exibição — `"2026"` permanece como está; `"2026-09"` vira `"Setembro de 2026"` (via `toLocaleDateString('pt-BR', {month:'long', year:'numeric'})`, com a primeira letra maiúscula).
2. **`renderPlanoVersionado()` reescrita** — agora recebe um 5º parâmetro `granularidade` (`'ano'` para Plano Anual, `'mes'` para Plano Mensal):
   - Agrupa todos os registros do tipo em um objeto `grupos` (chave = período, valor = array de registros daquele período).
   - Garante que o período **atual** (`getPeriodoKey(Date.now(), granularidade)`) sempre exista na lista de períodos, mesmo sem nenhum registro ainda.
   - Renderiza uma barra de botões (`.plano-periodo-btn`) — um por período, ordenados do mais recente para o mais antigo — com o período **selecionado** destacado (`bg-[var(--primary-color)]`) e os demais em cinza (`bg-gray-300`/`bg-gray-700` conforme tema). A barra só aparece quando há mais de um período (evita ruído visual em instalações novas).
   - O botão "✏️ Atualizar {label}" só é renderizado quando o período **selecionado é o atual** — visualizar um período passado é estritamente somente leitura.
   - Dentro do período selecionado, mantém a mesma lógica de "mais recente = card em destaque, resto = histórico colapsável" já existente — agora escopada a esse período (ex.: se o usuário editou o Plano Anual de 2025 três vezes, as duas versões antigas aparecem como "(versões anteriores) de 2025" ao navegar até lá).
3. **Novo estado** `let planosPeriodoSelecionado = {}` (mapa `tipo → periodoKey`), resetado para o período atual sempre que `switchToPlanosView()` roda (navegação pelo menu lateral).
4. **`switchToPlanosView()`** passou a chamar `renderPlanoVersionado(contentArea, 'plano_anual', 'Plano Anual', '📅', 'ano')` e `renderPlanoVersionado(contentArea, 'plano_mensal', 'Plano Mensal', '🗓️', 'mes')`.
5. Testado via injeção manual de registros com `timestamp` de anos/meses anteriores (2025 para o Plano Anual, Agosto/2026 para o Plano Mensal), confirmando: (a) a barra aparece só quando há mais de um período; (b) o período atual vem destacado e os demais em cinza; (c) clicar num período anterior troca o conteúdo exibido (título "{label} — {período}", data do próprio registro) e **esconde** o botão de editar; (d) voltar ao período atual restaura o botão de editar. Dados de teste removidos ao final, mantendo os registros reais do usuário.

## 3. Plano de Rollback / Desfazer
1. Em `js/app.js`: reverter `renderPlanoVersionado()` para a assinatura `(contentArea, tipo, label, icone)` sem agrupamento por período — renderizar sempre "o mais recente = atual, resto = histórico plano", como estava antes desta mudança (ver `docs/historico/plano_mensal_20260920_0020.md` para o código anterior).
2. Remover as funções `getPeriodoKey()` e `getPeriodoLabel()`.
3. Remover a variável de estado `planosPeriodoSelecionado`.
4. Em `switchToPlanosView()`, reverter as chamadas para `renderPlanoVersionado(contentArea, 'plano_anual', 'Plano Anual', '📅')` e `renderPlanoVersionado(contentArea, 'plano_mensal', 'Plano Mensal', '🗓️')`, sem o parâmetro de granularidade.
