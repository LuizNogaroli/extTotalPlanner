# Recursos: Pomodoro e Lista de Compras + Grupo "Outros Sistemas"

**Data/Hora:** 2026-09-24_01:30
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

1. **Lista de Compras interna:** cópia adaptada da solução do projeto `extListaDeCompras`, no novo módulo `js/modules/listaCompras.js`. O widget "Compras" da página do dia passou a apontar para ela.
2. **Pomodoro** funcional: novo módulo `js/modules/pomodoro.js`.
3. **Menu lateral:**
   - "🍅 Pomodoro" e "🛒 Lista de Compras" em **Recursos**, abaixo de "⏰ Alarmes";
   - novo grupo de 1º nível **Outros Sistemas**, vazio por enquanto.

## Por que

Pedido do usuário: "crie as seguintes opções abaixo 'Pomodoro' e 'Lista de Compras'. Também crie um botão de primeiro nível chamado 'Outros Sistemas'."

Como o pedido era ambíguo, as dúvidas foram perguntadas antes de implementar. As respostas:
- **Posição:** as duas opções ficam em Recursos, abaixo de Alarmes.
- **Lista de Compras:** "se inspire ou copie mesmo a solução que você criou em extListaDeCompras, e os links nas páginas dos dias devem linkar com a solução interna".
- **Pomodoro:** timer funcional.
- **Outros Sistemas:** vazio por enquanto.

## Estado Anterior

- **Compras quebradas**, com o mesmo tipo de bug do alarme (§3.18):
  - o widget da página do dia lia `planner_compras` (`{ item, detalhes, categoria }`);
  - o "+ adicionar item" abria o gerenciador genérico, cujo CRUD gravava em `planner_lista_compras` (`{ item, categoria, quantidade, preco, concluido, loja }`);
  - o que se cadastrava ali nunca aparecia no widget;
  - a caixa de marcar do widget não gravava nada.
- Não existia Pomodoro.
- Recursos tinha só "⏰ Alarmes". Não existia "Outros Sistemas".

## Estado Novo

### Lista de Compras (`js/modules/listaCompras.js`, CSS `lc-`)
- Página `#view-compras` com:
  - cabeçalho: permissão de notificações, "Categorias" e "+ Novo item";
  - busca por nome e filtro por categoria;
  - resumo "X de Y itens a comprar · estimativa pendente: R$ …";
  - itens agrupados por categoria.
- Cada item mostra:
  - caixa "comprado" (risca e esmaece o item);
  - preço estimado, descrição e fornecedores como chips com link;
  - Editar e Excluir;
  - a **cortina** "Pesquisa de Produtos/Preço/Descrição", com dados de exemplo de 10 marketplaces, ordenação, filtros frete grátis/cashback/entrega rápida e paginação 5/10/20;
  - estado "Pesquisando…" por 2,2 s depois de criado.
- Modais:
  - **item:** nome obrigatório, descrição, preço, categoria, fornecedores dinâmicos;
  - **categorias:** adicionar, renomear, excluir.
- **Avisos** (como `diffAndNotify` da referência), com o som de "moeda" de `sound.ts`: fornecedor novo, preço estimado alterado e preço de fornecedor alterado.
- **Migração** (uma vez) dos dois formatos antigos para o novo. Categorias em texto viram registros, juntando nomes iguais sem diferenciar maiúsculas; `loja` vira fornecedor; `quantidade` vai para a descrição.
- **Segurança:** textos escapados antes de ir para a tela; só links `http(s)` são clicáveis.

### Widget "Compras" (página do dia)
- Mostra até 8 itens **pendentes**. Marcar a caixa grava "comprado" e tira o item do widget.
- O nome do item e "Ver lista completa (N) →" abrem a Lista de Compras.
- "+ adicionar item" abre a Lista de Compras já com o formulário de novo item.

### Pomodoro (`js/modules/pomodoro.js`, CSS `pm-`)
- Página `#view-pomodoro` com:
  - abas Foco / Pausa curta / Pausa longa;
  - relógio grande com barra de progresso e horário de término;
  - botões Iniciar/Pausar, Zerar e Pular;
  - pontos do ciclo e contador de focos (com "zerar contagem");
  - configuração dos tempos;
  - faixa de permissão de notificações.
- Cada período tem sua cor: vermelho no foco, verde na pausa curta, azul na pausa longa.
- O timer continua rodando fora da página, e o tempo aparece no título da aba.
- **Robustez:**
  - término guardado como instante (`fimEm`) e detectado por `setTimeout` único;
  - estado compartilhado entre abas pelo `localStorage` (evento `storage`);
  - fim de período sob Web Lock, com aviso único e som.
- **Bug encontrado e corrigido durante o teste:** o "Iniciar" zerava o timer, porque o contêiner `.pm-app` tem `data-modo` e o handler de clique usava `closest('[data-modo]')`.

### Menu (`index.html`)
- Recursos: ⏰ Alarmes · 🍅 Pomodoro (`#menu-pomodoro`) · 🛒 Lista de Compras (`#menu-compras`).
- Outros Sistemas: `<details>` de 1º nível com o texto "Nenhum sistema vinculado ainda." (classe `nav-vazio`).

## Ficheiros Afetados

- **Novos:** `js/modules/listaCompras.js`, `js/modules/pomodoro.js`.
- `js/app.js`:
  - imports e instâncias;
  - `pomodoro.iniciarMotor()` no boot;
  - listeners do menu;
  - `view-compras` e `view-pomodoro` em `hideAllViews()`;
  - `renderWidgetCompras()`, que substitui o bloco antigo do widget;
  - `abrirListaCompras`/`abrirPomodoro` no `window.appRouter`;
  - CSV de `planner_compras` no formato novo.
- `js/services/NotificationService.js`: `playCoinSound()`.
- `index.html`: itens do menu, grupo "Outros Sistemas", `#view-compras` e `#view-pomodoro` dentro de `<main>`.
- `css/styles.css`: blocos "LISTA DE COMPRAS" (`lc-`) e "POMODORO" (`pm-`), `.nav-vazio`, ajustes para o tema escuro.

## Validação (navegador, fallback `localStorage`)

- ✅ Menu:
  - Recursos = Alarmes, Pomodoro, Lista de Compras;
  - Outros Sistemas com o texto de vazio;
  - as duas views são filhas diretas de `<main>`.
- ✅ Migração: 2 itens do formato do widget e 1 do formato do CRUD foram convertidos. "Mercado"/"mercado" viraram uma categoria só; preço, fornecedor ("KaBuM!") e quantidade foram preservados.
- ✅ Formulário de item:
  - nome obrigatório;
  - fornecedores dinâmicos;
  - "Pesquisando…" depois de criar;
  - `javascript:alert(1)` não vira link;
  - a edição preserva o `id`.
- ✅ Avisos: ao criar, 1 por fornecedor. Ao editar, "Preço atualizado", "Preço de fornecedor atualizado" e "Novo fornecedor", exatamente.
- ✅ Lista:
  - marcar comprado atualiza o resumo;
  - busca e filtro funcionam;
  - cortina: 10 ofertas, 5 por página; o menor preço é o AliExpress (R$ 140,32 = 179,90 × 0,78); o filtro de frete grátis deixa 4 ofertas;
  - categorias: criar, renomear e excluir (os itens ficam sem categoria);
  - excluir item funciona.
- ✅ Widget do dia:
  - mostra só os pendentes;
  - marcar grava na lista e some do widget;
  - "+ adicionar item" abre a lista com o formulário.
- ✅ Pomodoro:
  - iniciar, pausar (congela), zerar e pular;
  - continua rodando fora da página, com o tempo no título;
  - a sequência Foco→Curta ×4→**Pausa longa**→Foco está correta, com 1 aviso por período;
  - 2 instâncias simultâneas → **1** aviso;
  - aviso com "(terminou às …)" quando percebido com atraso;
  - a configuração é salva e aplicada.
- ✅ Tema escuro conferido. Nenhum erro no console.
- ❌ **Não verificado:** toast e som reais (o sandbox bloqueia notificações), e o comportamento dentro da extensão instalada.

## Plano de Rollback / Desfazer

1. Remover `js/modules/listaCompras.js` e `js/modules/pomodoro.js`, os blocos `lc-`/`pm-`/`.nav-vazio` de `css/styles.css`, `#view-compras`/`#view-pomodoro` e os itens de menu novos do `index.html`.
2. Em `js/app.js`, reverter imports, instâncias, listeners, `hideAllViews`, `appRouter` e o CSV, e restaurar o bloco antigo do widget "Compras" pelo Git.
3. **Dados:** a migração reescreveu `planner_compras` no formato novo. Para voltar ao formato antigo seria preciso converter de volta (`name→item`, `description→detalhes`, categoria pelo nome). `planner_lista_compras` continua intacto.

## Notas Importantes

- **Ficou código morto do fluxo antigo de compras:** `form-compras`, as entradas `compras` nos `formMappers`, `ContentService.getShoppingList()` e o ramo `compras` de `renderManagerList()`. A limpeza está listada em `pendencias.md` §7.
- **Onde ficam os dados:** as compras usam o `StorageService` (`chrome.storage.local` na extensão). O Pomodoro usa o `localStorage` de propósito, porque ele é síncrono e compartilhado entre as abas.
