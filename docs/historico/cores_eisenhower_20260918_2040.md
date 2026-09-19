# Atualização de Cores da Matriz de Eisenhower
**Data:** 18 de Setembro de 2026

## O que foi feito
As cores visuais usadas nas badges (etiquetas) das atividades para a Matriz de Eisenhower foram invertidas/atualizadas para corresponder às seguintes especificações solicitadas pelo usuário:
- Q1 (Vermelho): Mantido como vermelho.
- Q2 (Laranja): Passou de amarelo para laranja.
- Q3 (Amarelo): Passou de laranja para amarelo.
- Q4 (Cinza): Mantido como cinza.

Isso ajuda a dar um tom de urgência decrescente e gradativo visualmente.

## 1. Estado Anterior (Antes)
Em `js/app.js`:
- Q2: Usava classes Tailwind `text-yellow-700 bg-yellow-100 border-yellow-300` e emoji `🟡`.
- Q3: Usava classes Tailwind `text-orange-600 bg-orange-100 border-orange-300` e emoji `🟠`.

## 2. Estado Novo (Depois)
Em `js/app.js`:
- Q2: Agora usa as antigas classes e emoji laranja (`text-orange-600 bg-orange-100 border-orange-300` e `🟠`).
- Q3: Agora usa as antigas classes e emoji amarelo (`text-yellow-700 bg-yellow-100 border-yellow-300` e `🟡`).

## 3. Plano de Rollback / Desfazer
1. Abra `js/app.js` próximo à linha 1090.
2. Na variável de criação de `eisBadge`, inverta as classes de cor (orange <-> yellow) e também o emoji (🟠 <-> 🟡) nas opções `q2` e `q3`.
