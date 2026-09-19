# Remoção de Botões de Planos do Cabeçalho do Sistema

**Data/Hora:** 2026-09-20_0530
**Responsável:** Claude Code & User

## O que foi feito

Removidos os 3 botões "Plano Anual", "Plano Mensal", "Plano Semanal" do cabeçalho principal do sistema. Esses botões estavam localizados no centro do header, logo após o `#main-view-title` (que mostra "Visão Semanal" ou similar).

## Por que

A solicitação do usuário (Opção A) era remover redundâncias do cabeçalho. Os botões "Plano Anual/Mensal/Semanal" no header duplicavam a funcionalidade do menu lateral (Tático > Plano Anual/Mensal/Semanal). Remover os botões do header deixa a navegação consistente e libera espaço para o `header-periodo-buttons` quando necessário.

## Estado Anterior

**Cabeçalho tinha:**
- Hamburguer | Título da View | [Plano Anual] [Plano Mensal] [Plano Semanal] | Tema | Relatório | +Novo

Linha 113-126 do `index.html`:
```html
<!-- Centro (TABS ESTRATÉGICAS) -->
<div class="flex justify-center flex-[2] md:flex-[3] overflow-x-auto" style="scrollbar-width: none;">
    <div class="flex items-center space-x-2">
        <!-- Static Tabs -->
        <button id="btn-nav-anual" ...>Plano Anual</button>
        <button id="btn-nav-mensal" ...>Plano Mensal</button>
        <button id="btn-nav-semanal" ...>Plano Semanal</button>
    </div>
</div>
```

## Estado Novo

**Cabeçalho agora tem:**
- Hamburguer | Título da View | (espaço vazio) | Tema | Relatório | +Novo

Linha 112-115 do `index.html`:
```html
<!-- Centro (Reservado para período buttons ou vazio) -->
<div class="flex justify-center flex-[2] md:flex-[3] overflow-x-auto" style="scrollbar-width: none;">
</div>
```

O espaço central fica vazio, preparado para o container `header-periodo-buttons` exibir botões de período quando houver múltiplos períodos.

## Ficheiros Afetados

- `index.html` (1 mudança):
  - Linhas 113-126: Removidos os 3 botões de navegação entre Planos
  - Comentário atualizado para indicar reserva para período buttons

- `docs/MANUAL_TECNICO.md` (1 adição):
  - Versão 1.24 adicionada ao histórico

## Impact

✅ **Cabeçalho mais limpo:** Sem redundância com o menu lateral
✅ **Espaço liberado:** Pronto para botões de período dinâmicos
✅ **Navegação intacta:** Menu lateral (Tático) continua oferecendo acesso aos Planos
✅ **Responsividade:** Cabeçalho fica menos congestionado em telas pequenas

## Validação

✅ **Página carrega corretamente** sem os botões
✅ **Menu lateral funciona** — clique em "Plano Anual/Mensal/Semanal" navega normalmente
✅ **Header-periodo-buttons** continua reservado e vazio (aparecerá quando necessário)
✅ **Responsividade** melhorada em mobile (menos elementos no header)

## Plano de Rollback / Desfazer

Para restaurar os 3 botões no cabeçalho:

1. **Restaurar `index.html` (linha 113-126):**
   ```html
   <!-- Centro (TABS ESTRATÉGICAS) -->
   <div class="flex justify-center flex-[2] md:flex-[3] overflow-x-auto" style="scrollbar-width: none;">
       <div class="flex items-center space-x-2">
           <!-- Static Tabs -->
           <button id="btn-nav-anual" class="text-sm px-3 py-1 rounded hover:bg-[var(--border-color)] transition text-[var(--text-secondary)] font-medium flex flex-col items-center leading-tight">
               <span class="text-[10px]">Plano</span><span>Anual</span>
           </button>
           <button id="btn-nav-mensal" class="text-sm px-3 py-1 rounded hover:bg-[var(--border-color)] transition text-[var(--text-secondary)] font-medium flex flex-col items-center leading-tight">
               <span class="text-[10px]">Plano</span><span>Mensal</span>
           </button>
           <button id="btn-nav-semanal" class="text-sm px-3 py-1 rounded bg-[var(--border-color)] transition text-[var(--primary-color)] font-bold flex flex-col items-center leading-tight">
               <span class="text-[10px]">Plano</span><span>Semanal</span>
           </button>
       </div>
   </div>
   ```

2. **Atualizar versão em `MANUAL_TECNICO.md`** se desejado

3. **Recarregar a página** (Ctrl+Shift+R)

## Notas Importantes

1. **IDs dos botões ainda existem no JS** — `btn-nav-anual`, `btn-nav-mensal`, `btn-nav-semanal` podem estar sendo referenciados em `app.js` ou listeners. Se recolocar os botões, eles funcionarão automaticamente.

2. **Menu lateral é a navegação primária** agora — mais consistente com outras views (Missão, Visão, Objetivos) que não têm duplicação no header.

3. **Espaço central fica vazio** — futuro: quando houver múltiplos períodos (ex: 2025 e 2026 para Plano Anual), o `header-periodo-buttons` preencherá esse espaço automaticamente.

## Próximos Passos (Sugestões)

- Documentar em `UX_LAYOUT.md` a decisão de consolidar navegação no menu lateral
- Validar em mobile que a remoção melhorou responsividade
- Considerar adicionar um breadcrumb ou indicador visual do contexto atual (qual Plano está ativo) se usuários reclamarem
