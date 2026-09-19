# Atualização da Nomenclatura da Matriz de Eisenhower
**Data:** 18 de Setembro de 2026

## O que foi feito
As nomenclaturas de classificação de prioridade de tarefas (Matriz de Eisenhower) foram atualizadas para refletir exatamente as orientações dadas pelo usuário, substituindo termos mais genéricos por comandos diretos.

## 1. Estado Anterior (Antes)
- Q1: Faça Agora (Urgente/Importante)
- Q2: Planeje (Importante)
- Q3: Delegue (Urgente)
- Q4: Faça se sobrar tempo

## 2. Estado Novo (Depois)
- Q1: Urgente e Importante - Resolva Urgente
- Q2: Não Urgente e Importante - Resolva Agora
- Q3: Urgente e Não Importante - Delegue a Atividade
- Q4: Não Urgente e Não Importante - Ignore, se possível

Essa alteração foi feita em dois lugares:
1. No arquivo `index.html` (dentro das opções `<option>` do `<select id="atividade-eisenhower">`).
2. No arquivo `js/app.js` (na construção da variável `eisBadge` usada para exibir as pílulas de tag visuais nos cards do dashboard).

## 3. Plano de Rollback / Desfazer
Para voltar aos nomes antigos:
1. No `index.html` (linha ~365), troque os values de "q1", "q2", "q3", "q4" do `select` correspondente de volta para os originais listados acima.
2. Em `js/app.js` (linha ~1090 na função `renderWeeklyGrid`), retorne os textos dos spans de badge para: `🔴 Faça Agora`, `🟡 Planeje`, `🟠 Delegue` e `⚪ Sobrando tempo`.
