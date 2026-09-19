# Ajuste do Acordeão de Dias para Drag & Drop e Ícone de Expansão
**Data:** 18 de Setembro de 2026

## O que foi feito
1. Foi adicionado um ícone/botão explícito "↕️ Expandir" na barra do dia da visão semanal (layout padrão em lista/acordeão). O objetivo é deixar cristalino que o container pode ser aberto ali mesmo na tela sem acionar o modal global.
2. Havia um bug severo no layout de acordeões: a `div` que continha as atividades não possuía as propriedades necessárias do Drag and Drop (`class="day-dropzone"` e `data-date="..."`), tornando impossível arrastar tarefas de um dia para o outro neste modo de visualização. As propriedades foram injetadas.

## 1. Estado Anterior (Antes)
No arquivo `js/app.js` (geração do HTML na linha ~1240), a área de ações lateral continha apenas os botões de relatório e nova atividade:
```html
<button class="text-sm text-[var(--primary-color)] hover:underline" onclick="event.preventDefault(); window.appRouter.openModal('atividade')">+ Nova Atividade</button>
```
E a `div` que envolvia as atividades não tinha a identificação do drag & drop:
```html
<div class="p-4 border-t border-[var(--border-color)] min-h-[80px] flex flex-col justify-center mt-1">
```

## 2. Estado Novo (Depois)
Foi inserido um controle claro de expansão:
```html
<div class="text-xs border border-[var(--border-color)] px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition" title="Expandir/Recolher Lista de Atividades" onclick="event.preventDefault(); this.closest('details').open = !this.closest('details').open;">
    ↕️ Expandir
</div>
```
E a área de atividades agora é uma zona de drop válida, com as referências necessárias para o motor do drag and drop:
```html
<div class="p-4 border-t border-[var(--border-color)] min-h-[80px] flex flex-col justify-center mt-1 day-dropzone" data-date="${dateStr}">
```

## 3. Plano de Rollback / Desfazer
1. No arquivo `js/app.js`, localize a string de template na criação do `layoutType === 'stacked'` (aproximadamente linha 1251).
2. Remova a `div` inteira que contém o texto `↕️ Expandir`.
3. Logo abaixo, na `div` de conteúdo, remova a classe `day-dropzone` e o atributo `data-date="${dateStr}"`.
