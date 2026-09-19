# Substituição do Ícone de Compartilhamento
**Data:** 18 de Setembro de 2026

## O que foi feito
O ícone de compartilhamento presente no rodapé de vários cards do modal diário (Neste dia na História, Motivacional, Devocional e Itens para Comprar) era representado pelo emoji genérico de caixa de saída (`📤`).
A pedido do usuário, substituímos este emoji por uma "seta curva" mais moderna, usando um ícone SVG (padrão forward/share) que combina com a interface clean do Tailwind.

## 1. Estado Anterior (Antes)
No arquivo `index.html`:
```html
<button title="Compartilhar" class="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition transform hover:scale-110">📤</button>
```

## 2. Estado Novo (Depois)
Foram feitas substituições globais nesses botões:
```html
<button title="Compartilhar" class="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition transform hover:scale-110"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/></svg></button>
```

## 3. Plano de Rollback / Desfazer
1. Acesse o arquivo `index.html`.
2. Busque pelo trecho `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/></svg>`.
3. Substitua todas as 4 ocorrências (aproximadamente nas linhas 677, 709, 728 e 747) novamente pelo emoji de caixa de saída `📤`.
