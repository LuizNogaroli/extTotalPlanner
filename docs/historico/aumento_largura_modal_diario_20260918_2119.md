# Aumento de Largura do Modal Diário
**Data:** 18 de Setembro de 2026

## O que foi feito
A pedido do usuário, o modal do Dashboard Diário ("Agenda Diária" / "Atividades do Dia") teve sua largura máxima aumentada em aproximadamente 33% para acomodar melhor a proporção 3/5 da lista de atividades contra os 2/5 dos cards laterais.

## 1. Estado Anterior (Antes)
No arquivo `index.html`, o `<div id="global-day-modal">` possuía uma configuração de estilo inline com o tamanho padrão de papel A4 vertical:
```html
style="background-color: var(--bg-panel); max-width: 210mm; height: 95vh; max-height: 297mm;"
```

## 2. Estado Novo (Depois)
No arquivo `index.html`, o `<div id="global-day-modal">` teve o limite horizontal de crescimento alterado:
```html
style="background-color: var(--bg-panel); max-width: 280mm; height: 95vh; max-height: 297mm;"
```

## 3. Plano de Rollback / Desfazer
1. Abra o arquivo `index.html`.
2. Busque pela linha contendo a identificação `id="global-day-modal"` (aproximadamente linha 605).
3. Na `div` filha logo abaixo, localize a propriedade inline `max-width: 280mm;` dentro do atributo `style`.
4. Altere o valor de volta para `210mm`.
