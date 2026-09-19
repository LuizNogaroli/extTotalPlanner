# Botão "Carregar dados de exemplo" na tela de Atividades

**Data/Hora:** 2026-09-19_0230
**Responsável:** Claude Code & User

## O que foi feito
Adicionado na tela de Atividades (`switchToAtividadesView()` em `js/app.js`) um botão **"🎲 Carregar dados de exemplo"** que popula o app com dados de demonstração para testes:
- Categorias (`planner_atividade-categoria`): Trabalho, Saúde, Estudo, Casa.
- Contextos/Papeis (`planner_contexto`): Profissional, Pessoal, Família.
- Atividades (`planner_activities`): 6 exemplos com data, status, categoria, contexto e quadrante de Eisenhower variados.

A função `seedDemoAtividades()` evita duplicar itens pelo `title` e confirma antes de executar. Após semear, re-renderiza a view se ela estiver visível.

## Por que
O usuário reportou que as atividades "estavam populadas" e sumiram. Causa raiz: o app usa `chrome.storage.local` quando carregado como extensão (new tab) e cai no fallback `localStorage` quando aberto via `rodar.bat` (http://localhost) — são namespaces de storage distintos, então os dados de um não aparecem no outro. O botão de seed permite repovoar rapidamente para teste via servidor local.

## Estado Anterior
Tela de Atividades só tinha o botão "+ Cadastrar Atividade"; nenhum mecanismo de seed/demo data.

## Estado Novo
Além de "+ Cadastrar Atividade", há "🎲 Carregar dados de exemplo" que insere categorias, contextos e atividades demonstrativas (idempotente por título).

## Plano de Rollback
Remover o botão `btn-seed-atividades` do `innerHTML` em `switchToAtividadesView()` (linha ~661), remover o listener `document.getElementById('btn-seed-atividades').addEventListener('click', seedDemoAtividades);` e remover a função `seedDemoAtividades()`. Nenhuma outra view ou storage é afetada.
