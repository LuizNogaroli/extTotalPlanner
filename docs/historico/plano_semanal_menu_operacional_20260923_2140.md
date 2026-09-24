# "Plano Semanal" Movido de Volta para o Menu Operacional

**Data/Hora:** 2026-09-23_21:40
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

No menu lateral, o link "Plano Semanal" saiu do grupo `Tático` e voltou para o grupo `Operacional`, como primeiro item (antes de "Meu Planner").

## Por que

Pedido do usuário. É a mesma decisão da v1.12 (2026-09-20_00-30), que a essa altura já tinha se perdido: o link estava de novo sob `Tático`. A causa mais provável é a restauração do `index.html` a partir de um `.bak` antigo, descrita na v1.29 (`reconstrucao_views_formularios_20260919_2130.md`), que trouxe de volta várias partes antigas do HTML.

## Estado Anterior

```
Tático:       Plano Anual | Plano Mensal | Plano Semanal
Operacional:  Meu Planner | Atividade | ⏰ Alarmes
```

## Estado Novo

```
Tático:       Plano Anual | Plano Mensal
Operacional:  Plano Semanal | Meu Planner | Atividade | ⏰ Alarmes
```

## Ficheiros Afetados

- `index.html`: a linha `<a id="menu-plano-semanal">` foi movida do `<details>` Tático para o `<details>` Operacional. O `id` continua o mesmo, então o listener em `js/app.js` (`switchToPlanosView('semanal')`) segue funcionando sem nenhuma alteração.

## Validação

- ✅ O link aparece uma única vez, como primeiro item do grupo `Operacional`.
- ✅ Ao clicar, a tela do Plano Semanal abre (`#view-planos` fica visível).

## Plano de Rollback / Desfazer

Mover a linha `<a href="#" id="menu-plano-semanal" ...>Plano Semanal</a>` de volta para o fim do `<div class="space-y-1">` do grupo `Tático`, logo depois de "Plano Mensal".

## Notas Importantes

A mesma mudança já tinha sido feita uma vez e se perdeu. Isso é mais um sinal de que ainda podem existir outras decisões antigas (v1.6–v1.28) desfeitas pela restauração a partir do `.bak`. Vale conferir a seção 6 do `MANUAL_TECNICO.md` contra o HTML atual quando algo "voltar a ficar como antes".
