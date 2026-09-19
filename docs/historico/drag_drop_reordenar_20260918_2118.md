# Reordenação Drag and Drop de Atividades
**Data:** 18 de Setembro de 2026

## O que foi feito
O recurso de "Arrastar e Soltar" das atividades (Drag and Drop) não estava permitindo que os cards fossem reordenados no mesmo dia (tanto na Visão Semanal quanto na nova Visão Diária em modal). O código limitava a ação de Drop apenas a datas diferentes e não calculava o índice de destino (`insertBefore`). 

O sistema foi refatorado para permitir a reordenação local e a sincronização do índice de posição exato com o banco de dados `StorageService`, mantendo as tarefas preservadas na ordem em que o usuário as solta. Além disso, o listener foi expandido para o `body` inteiro, permitindo arrastar os cards na janela modal de Visualização Diária.

## 1. Estado Anterior (Antes)
- O `js/dragAndDrop.js` atrelava os eventos estritamente ao elemento `#view-dashboard` (limitando o modal global flutuante).
- O evento `drop` tinha uma condicional `if (newDate && newDate !== oldDate)` que impedia qualquer movimento no mesmo dia.
- Nenhuma ordem (índice DOM) era calculada; as tarefas caíam no final do array local.

## 2. Estado Novo (Depois)
- O container de eventos principal passou a ser `document.body`, abraçando o `#global-day-modal`.
- No arquivo `js/app.js`, injetamos a classe `.day-dropzone` com o data-date dinâmico diretamente na renderização do layout de *Visão Diária* (dentro de `openDayModal`).
- Foi adicionada a função matemática auxiliar `getDragAfterElement` no `dragAndDrop.js` que verifica as coordenadas e a altura dos cards na tela para detectar onde inserir o nó antes do fechamento do loop (sincronizando isso com o `Array.sort` que repassa o id ordenado para o array final no `chrome.storage`).

## 3. Plano de Rollback / Desfazer
1. No arquivo `js/dragAndDrop.js`, retorne o bloco do listener para usar `document.getElementById('view-dashboard')` em vez de `document.body`.
2. Remova a função `getDragAfterElement` ao final do arquivo.
3. No arquivo `js/app.js` (linha ~615), dentro de `openDayModal`, apague as linhas:
```javascript
dayModalContent.classList.add('day-dropzone');
dayModalContent.dataset.date = currentDailyDateStr;
```
