# Histórico de Interações - Visão de Planejamento Estratégico

## Estado Anterior (Antes)
- A "Missão" era exibida de forma fixa/estática na barra lateral (sidebar) abaixo da logo.
- Não existia opção "Planejamento Estratégico" no menu principal.
- Não existia uma visão consolidada de conteúdo para acompanhar o Plano Estratégico (Missão, Visão e Objetivos). Os dados só podiam ser vistos ou alterados via console ou se o modal de edição fosse aberto manualmente.

## Estado Novo (Depois)
- Removido o bloco estático da "Missão" da barra lateral.
- Adicionado o link `🎯 Planejamento Estratégico` no menu principal (`#menu-strategic`).
- Criado o painel de conteúdo `#view-strategic` que carrega todos os cadastros da coleção `planner_strategies` dinamicamente em 5 cards: Missão, Visão, Objetivos de Curto, Médio e Longo Prazo.
- Adicionado botões "Editar" dentro de cada card que acionam o formulário correspondente, e a interface se auto-atualiza (`switchToStrategicView()`) quando o formulário é salvo.
- Adicionado suporte completo à coleção `estrategia` no Gerenciador Global em lista (`openManager('estrategia')`).

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior:

1. **No arquivo `index.html`**:
   - Dentro da tag `<aside id="sidebar">`, reponha o código HTML estático da missão (`<div class="mb-6"><h2 class="text-sm ...">Missão</h2><p ...>"Organizar a vida e o futuro."</p></div>`) logo abaixo do `<h1>`.
   - Exclua o link `<a href="#" id="menu-strategic">...</a>` de dentro da tag `<nav>`.
   - Exclua a `div` completa do Planejamento Estratégico (`<div id="view-strategic">...</div>`) localizada logo antes da `<!-- Área de Relatórios -->`.

2. **No arquivo `js/app.js`**:
   - Exclua a constante `viewStrategic`, `btnMenuStrategic` e referências delas em `hideAllViews()` e `addEventListener`.
   - Exclua a função `switchToStrategicView()`.
   - Na função `openManager`, remova a entrada `'estrategia': 'Cadastros Estratégicos'` do objeto `titles`.
   - Em `renderManagerList`, remova a checagem no `storageKey`: deixe `const storageKey = 'planner_' + type;`, e apague o bloco `else if (type === 'estrategia') { ... }`.
   - Reverter o listener do `forms['estrategia']` no submit para não receber a callback (`() => { if (!viewStrategic.classList... }`).
