# Remoção dos Botões "Relatório" e "+ Novo" do Header

**Data/Hora:** 2026-09-23_23:20
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Removidos os botões "🖨️ Relatório" e "+ Novo" da zona direita do header. O botão de tema claro/escuro (☀, `#btn-theme-toggle`) passa a ser o único item dessa zona, alinhado à direita.

## Por que

Pedido do usuário: "no header, retirar os botões 'Relatório' e '+ Novo' e alinhar o ícone da view claro/escuro alinhado à direita."

## Estado Anterior

```
[☰]   │   2026 › Setembro › Semana 39   │   [☀] [🖨 Relatório] [+ Novo]
```

- "🖨️ Relatório": sem `id` e sem listener, clicar não fazia nada (`docs/header.md` §6 nº 1).
- "+ Novo" (`#btn-new-activity`): abria `crudModal.open('atividade')`, com listener em `js/app.js`.

## Estado Novo

```
[☰]   │   2026 › Setembro › Semana 39   │                              [☀]
```

- `index.html`: os dois `<button>` foram removidos. A `<div>` da zona direita (`flex items-center justify-end flex-1 space-x-2`) não mudou, e o `justify-end` que já existia encosta o ☀ na direita. A distância para a borda é de 16px, o `px-4` do `<header>`.
- `js/app.js`: removidos o `const btnNewActivity = document.getElementById('btn-new-activity')` e o `addEventListener` correspondente. O listener tinha um `if` de proteção e não quebraria sem o botão, mas foi removido para não deixar código sem uso.

## Ficheiros Afetados

- `index.html`: zona direita do `<header>`.
- `js/app.js`: bloco "CONFIGURAR LISTENERS DO MODAL CRUD".
- `docs/header.md`: diagrama, HTML, tabela de elementos, pontos de atenção, histórico e checklist atualizados.

## Validação

- ✅ Os botões do header agora são só: `btn-toggle-sidebar`, os segmentos do breadcrumb e `btn-theme-toggle`.
- ✅ O ☀ está a 16px da borda direita do header, igual ao `padding-right` do próprio header.
- ✅ Clicar no ☀ continua alternando `data-theme` no `<body>`.
- ✅ Conferido visualmente no navegador. Nenhum erro de sintaxe (`node --check js/app.js`).

## Plano de Rollback / Desfazer

1. Em `index.html`, logo depois do `</button>` do `#btn-theme-toggle` e antes do `</div>` da zona direita, reinserir:
   ```html
   <button class="text-sm border border-[var(--border-color)] text-[var(--text-secondary)] px-3 py-1.5 rounded hover:bg-[var(--border-color)] transition shadow-sm items-center space-x-1 hidden md:flex" title="Gerar Relatório A4 da Semana">
       <span>🖨️</span> <span>Relatório</span>
   </button>
   <button id="btn-new-activity" class="bg-[var(--primary-color)] text-white px-3 py-1.5 rounded hover:bg-[var(--primary-hover)] transition shadow-sm text-sm font-bold whitespace-nowrap">+ Novo</button>
   ```
2. Em `js/app.js`, no bloco "CONFIGURAR LISTENERS DO MODAL CRUD", reinserir:
   ```javascript
   const btnNewActivity = document.getElementById('btn-new-activity');
   if (btnNewActivity) {
       btnNewActivity.addEventListener('click', () => crudModal.open('atividade'));
   }
   ```

## Notas Importantes

1. **Criar atividade continua possível** por outros caminhos: "+ Nova Atividade" em cada card de dia da semana, "+ Nova Atividade" na página do dia, "Cadastrar Atividade" na tela Atividades e "+ Adicionar" dentro dos Planos.
2. **Mobile:** o ☀ tem `hidden sm:block` e some abaixo de 640px. Com os outros dois botões removidos, a zona direita do header fica **vazia** no celular; o tema só pode ser trocado em Configurações. Isso não foi mudado agora porque não fazia parte do pedido. Se o ☀ tiver que aparecer também no celular, basta trocar `hidden sm:block` por `block`.
