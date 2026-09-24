# Destaque do Dia Ativo no Sub-header Acumulava (vários dias cinza ao mesmo tempo)

**Data/Hora:** 2026-09-23_22:15
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Corrigido o destaque dos botões de dia da semana no sub-header (`#dynamic-header-tabs`). Ao clicar num dia e depois em outro, o dia anterior continuava cinza junto com o novo. Agora só o dia aberto na Visão Diária fica destacado.

## Por que

Relato do usuário: "quando clico em outro dia da semana, o botão clicado fica cinza (indicando que está ativo), mas o anterior também."

## Estado Anterior

Em `openDailyView()` (`js/app.js`, ~linha 1600), o laço que atualiza os botões fazia:

```javascript
btn.classList.remove('bg-[var(--primary-color)]', 'text-white', 'border-[var(--primary-color)]');
btn.classList.add('text-[var(--text-secondary)]', 'border-transparent');
if (btn.dataset.date === currentDailyDateStr) {
    btn.classList.add('border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'bg-[var(--bg-color)]');
    btn.classList.remove('text-[var(--text-secondary)]', 'border-transparent');
}
```

O dia ativo ganhava `bg-[var(--bg-color)]` (o fundo cinza) e `text-[var(--primary-color)]`. O reset dos outros botões não removia essas duas classes: removia `bg-[var(--primary-color)]`/`text-white`, que nunca eram adicionadas nesses botões (sobra de um estilo de destaque antigo). A cada clique, mais um dia ficava cinza.

## Estado Novo

```javascript
const activeClasses = ['border-[var(--primary-color)]', 'text-[var(--primary-color)]', 'bg-[var(--bg-color)]'];
const inactiveClasses = ['text-[var(--text-secondary)]', 'border-transparent'];
const isActive = btn.dataset.date === currentDailyDateStr;
btn.classList.remove(...(isActive ? inactiveClasses : activeClasses));
btn.classList.add(...(isActive ? activeClasses : inactiveClasses));
```

O destaque e o reset agora usam as mesmas duas listas de classes, então não sobra classe de estados anteriores. O ramo do botão `weekly` não mudou.

## Ficheiros Afetados

- `js/app.js`: laço de destaque em `openDailyView()`.
- `.claude/launch.json` (configuração local de preview, não versionada): o `python -m http.server` puro foi trocado por um servidor inline com `Cache-Control: no-store`, na porta 8030. Na primeira verificação, o navegador continuou executando o `app.js` antigo do cache (armadilha da §3.11 do `MANUAL_TECNICO.md`). Essa troca não afeta o app.

## Validação

- ✅ Sequência Seg → Qua → Sáb → Dom, clicando pela data: após cada clique, exatamente um botão tem `bg-[var(--bg-color)]`, e é o dia clicado.
- ✅ Cliques reais na tela (Dom → Ter → Sex): só "Sex" ficou cinza.

## Plano de Rollback / Desfazer

Restaurar o bloco anterior (ver "Estado Anterior") no laço `#dynamic-header-tabs button.tab-btn` de `openDailyView()` em `js/app.js`.
