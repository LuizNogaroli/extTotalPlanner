# Hierarquia Visual do Menu Lateral + Grupo "Recursos"

**Data/Hora:** 2026-09-23_23:55 (grupo "Recursos": 2026-09-24_00:05)
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

1. **Hierarquia visual:** o menu lateral passou a diferenciar os dois níveis.
   - **1º nível** (grupos e atalhos do rodapé): botões com borda e cantos arredondados.
   - **2º nível** (itens de cada grupo): recuados, sobre um fundo suavizado, com um fio guia à esquerda.
2. **Grupo "Recursos":** novo grupo de 1º nível, depois de "Operacional". O link "⏰ Alarmes" saiu de "Operacional" e foi para dentro dele.

## Por que

Pedidos do usuário:
- "o layout do sidebar precisa ser melhorado, uma ideia é usar no primeiro nível os botões com bordas arredondadas e num segundo nível, aplicar uma cor diferente suavizada e recuar um pouco para ilustrar os diferentes níveis"
- Aprovou o resultado ("ficou muitíssimo melhor") e pediu: "crie um novo botão de primeiro nível chamado 'RECURSOS' e passe a opção 'Alarmes' para dentro de 'RECURSOS'"

## Estado Anterior

- Grupos: rótulo de texto pequeno em maiúsculas, sem borda nem fundo. Itens: links com o mesmo recuo e a mesma cor do texto geral. Visualmente, os dois níveis quase não se distinguiam.
- A seta ▶ nunca girava ao abrir um grupo: a classe `group-open:rotate-90` não existe no `css/tailwind.css` local.
- "⏰ Alarmes" ficava em "Operacional".

## Estado Novo

- Novo bloco "MENU LATERAL" em `css/styles.css`, com as classes `nav-group-btn`, `nav-top-btn`, `nav-sub` e `nav-subitem`. Detalhes de cores, tamanhos e tema escuro em `MANUAL_TECNICO.md` §3.22.
- No `<nav>` do `index.html`, as classes Tailwind antigas desses elementos foram trocadas pelas novas:
  - 4 `<summary>` → `nav-group-btn`
  - 4 contêineres `<div class="space-y-1">` → `nav-sub`
  - 10 links → `nav-subitem`
  - 2 links do rodapé → `nav-top-btn`

  Todos os `id` e `onclick` foram mantidos.
- A seta ▶ gira 90° ao abrir o grupo, via CSS próprio.
- Tema escuro: os destaques (grupo aberto, hover e item ativo) usam um tom clareado da cor primária, porque `#4f46e5` puro tinha pouco contraste sobre o painel escuro.
- Grupos: **Estratégico** (Missão, Visão, Objetivos, Valores) · **Tático** (Plano Anual, Plano Mensal) · **Operacional** (Plano Semanal, Meu Planner, Atividade) · **Recursos** (⏰ Alarmes). "Recursos" começa fechado, como Estratégico e Tático.

## Ficheiros Afetados

- `css/styles.css`: novo bloco "MENU LATERAL".
- `index.html`: `<nav>` do `#sidebar` (classes trocadas e grupo "Recursos").
- Nenhuma mudança de JS. O item ativo continua sinalizado pelo `app.js` com `bg-[var(--border-color)] font-bold`, e o CSS aproveita `.font-bold` para destacá-lo.

## Validação

- ✅ Estilos computados: grupo com `border-radius: 10px` e borda de 1px; sub-lista com recuo de 14px, fio guia de 2px e fundo tingido; itens em `--text-secondary`, 24px mais à direita que os grupos.
- ✅ "Meu Planner" continua destacado como ativo.
- ✅ Setas: giram nos grupos abertos e ficam retas no fechado.
- ✅ Tema escuro conferido visualmente (destaques em índigo claro, legíveis).
- ✅ "Recursos" aparece como 4º grupo, com "⏰ Alarmes" dentro, e o clique continua abrindo o gerenciador "Lembretes e Alarmes".

## Plano de Rollback / Desfazer

1. **Grupo Recursos:** mover a linha do "⏰ Alarmes" de volta para o fim do `nav-sub` de "Operacional" e apagar o `<details>` "Recursos".
2. **Visual:** no `<nav>` do `index.html`, voltar as classes antigas:
   - `nav-group-btn` → `text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2 px-2 cursor-pointer list-none flex items-center justify-between`
   - `nav-sub` → `space-y-1`
   - `nav-subitem` → `block py-1 px-3 rounded hover:bg-[var(--border-color)] transition text-sm`
   - `nav-top-btn` → `block py-1.5 px-3 rounded hover:bg-[var(--border-color)] transition text-sm text-[var(--text-primary)]`
   - Contêiner do rodapé: `space-y-2` → `space-y-1`

   Depois, remover o bloco "MENU LATERAL" de `css/styles.css`.

## Notas Importantes

- "Recursos" fica **fora** da Pirâmide do Planejamento de `Sobre_extPlanner.md` (Estratégico → Tático → Operacional): é um grupo de ferramentas de apoio, não um nível de planejamento. Candidatos naturais a entrar nele no futuro: Hábitos, Compras, Contextos/Papeis. Não foram movidos porque não foi pedido.
- Itens novos no menu devem usar só `class="nav-subitem"` (dentro de um grupo) ou `class="nav-top-btn"` (rodapé). Não copiar as classes Tailwind antigas.
