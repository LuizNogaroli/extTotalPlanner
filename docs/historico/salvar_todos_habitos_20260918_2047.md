# Botão Salvar Todos em Monitoramento de Hábitos
**Data:** 18 de Setembro de 2026

## O que foi feito
Embora as versões anteriores tivessem botões individuais "Salvar" ao lado de cada resposta de hábito, foi adicionado um botão mestre "Salvar Todos" no cabeçalho do painel "Monitoramento de Hábitos". Esse botão varre todos os inputs, salva-os no `chrome.storage.local` e automaticamente trava os campos e exibe os botões de "Editar" individualmente, facilitando quando a lista de hábitos é longa.

## 1. Estado Anterior (Antes)
No arquivo `index.html`, o cabeçalho possuía apenas o título `h4`:
```html
<h4 class="font-bold text-[var(--primary-color)] flex items-center space-x-2 mb-3">
    <span>✅ Monitoramento de Hábitos</span>
</h4>
```

No arquivo `js/app.js`, existiam apenas eventos de clique que escutavam pelos botões individuais `btn-habit-save`.

## 2. Estado Novo (Depois)
No arquivo `index.html`, um bloco `flex justify-between items-center` envolve o título e acomoda o novo botão:
```html
<div class="flex justify-between items-center mb-3">
    <h4 class="font-bold text-[var(--primary-color)] flex items-center space-x-2">
        <span>✅ Monitoramento de Hábitos</span>
    </h4>
    <button id="btn-save-all-habits" class="text-xs bg-[var(--primary-color)] text-white px-3 py-1.5 rounded hover:bg-[var(--primary-hover)] transition shadow-sm font-bold">Salvar Todos</button>
</div>
```

No arquivo `js/app.js`, foi criado o `btnSaveAllHabits.addEventListener('click')` que realiza um `querySelectorAll('.habit-input')` pegando todos os valores da tela.

## 3. Plano de Rollback / Desfazer
1. No arquivo `index.html` (linha ~635), remova o `<button id="btn-save-all-habits">...</button>` e também a `div` flex que o engloba junto com o `h4`.
2. No arquivo `js/app.js` (perto da linha ~780), apague o bloco `if (btnSaveAllHabits) { ... }` contendo o listener de iteração e salvamento em lote.
