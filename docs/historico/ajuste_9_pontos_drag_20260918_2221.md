# Ajuste de Estilo do Ícone de Arraste (Drag Handle)
**Data:** 18 de Setembro de 2026

## O que foi feito
A pedido do usuário, o ícone recém-adicionado de arrastar ("drag handle") nos cards de atividades sofreu refinamentos visuais:
1. O padrão de pontos mudou de 6 pontos (2x3) para 9 pontos (3x3).
2. O espaçamento interno (padding) à esquerda do texto do card foi aumentado para distanciar melhor os pontos do texto da tarefa.
3. O comportamento do ponteiro do mouse (cursor) ao passar pelos pontos ou pelo card foi alterado para mostrar uma "cruz estilizada" com setas para as quatro direções, deixando ainda mais claro que o elemento pode ser movido para qualquer lado.

## 1. Estado Anterior (Antes)
No arquivo `js/app.js`, os blocos HTML em `openDayModal` e `renderWeeklyGrid` possuíam:
- A classe base do card e do ícone de drag utilizavam `cursor-grab` (mãozinha aberta).
- A classe do card utilizava padding `pl-7`.
- O SVG do handle usava um `viewBox="0 0 10 16"` contendo apenas duas colunas e três linhas (6 círculos).

## 2. Estado Novo (Depois)
- Substituído `cursor-grab` por `cursor-move` para engatilhar a cruz direcional do sistema operacional.
- Substituído `pl-7` por `pl-9`, aumentando o vão horizontal interno.
- Substituído o SVG por uma matriz simétrica de 3x3 círculos (9 no total) em um canvas de 14x14px.

## 3. Plano de Rollback / Desfazer
Para reverter aos 6 pontos antigos:
1. Abra `js/app.js` e busque pelas duas ocorrências da string `<div draggable="true"`.
2. Troque `cursor-move` por `cursor-grab` no card inteiro e no handle dele.
3. Volte `pl-9` para `pl-7`.
4. Restaure o SVG para o padrão original:
```html
<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
    <circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
    <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
    <circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/>
</svg>
```
