# Adição de Ícone de Arraste (Grip) nos Cards de Atividades
**Data:** 18 de Setembro de 2026

## O que foi feito
Os cards de atividades ganharam um pequeno ícone de "seis pontinhos" (drag handle/grip) na lateral esquerda. A função visual serve para indicar claramente ao usuário de que a atividade pode ser clicada e arrastada para ordenação ou mudança de dias. 

## 1. Estado Anterior (Antes)
No arquivo `js/app.js`, o HTML renderizado do `.task-card` tinha apenas um padding base `p-2` e nenhum elemento à esquerda, dependendo do usuário "adivinhar" que a área inteira servia para arrastar.

## 2. Estado Novo (Depois)
No arquivo `js/app.js`, o `.task-card` foi atualizado em dois lugares (`renderDailyView` e `renderWeeklyGrid`):
1. Alterou-se o padding esquerdo de `p-2` para `p-2 pl-7` abrindo espaço.
2. Injetou-se uma `div` posicionada em modo absoluto alinhada verticalmente à esquerda (`left-2 top-1/2 -translate-y-1/2`) contendo um SVG de 6 pontos desenhado manualmente com `circle` que fica opaco até que o mouse passe por cima (`group-hover:opacity-100`).

## 3. Plano de Rollback / Desfazer
Para reverter a visualização dos pontinhos:
1. Abra o arquivo `js/app.js`.
2. Busque pela declaração `<div draggable="true"` (ela aparece duas vezes no arquivo, uma para o Modal Diário em `openDayModal` e outra para a Grade Semanal em `renderWeeklyGrid`).
3. Nas duas ocorrências, remova a classe `pl-7` de dentro do container principal.
4. Logo abaixo dessa div, exclua o bloco inteiro de código que começa com `<div class="absolute left-2 top-1/2...` e termina no fechamento da `</div>` que envolve a tag `<svg>`.
