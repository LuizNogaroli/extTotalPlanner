# Menu Lateral: Estratégico e Tático colapsados por padrão

**Data/Hora:** 2026-09-19_0200
**Responsável:** Claude Code & User

## O que foi feito
No menu lateral da sidebar (`index.html`), alterado o estado inicial de abertura dos grupos `<details>`:
- **Estratégico:** removido o atributo `open` → passa a vir **colapsado**.
- **Tático:** já estava sem `open` → permanece **colapsado**.
- **Operacional:** adicionado o atributo `open` → passa a vir **expandido**.

## Estado Anterior
- Estratégico: `<details class="group" open>` (expandido)
- Tático: `<details class="group">` (colapsado)
- Operacional: `<details class="group">` (colapsado)

## Estado Novo
- Estratégico: `<details class="group">` (colapsado)
- Tático: `<details class="group">` (colapsado)
- Operacional: `<details class="group" open>` (expandido)

## Plano de Rollback
Reverter os atributos `open` nas três tags `<details>` para o estado anterior:
- Estratégico volta a ter `open`;
- Operacional volta a não ter `open`.
Nenhuma lógica de JS foi tocada (o estado é puramente atributo HTML do `<details>`), então o rollback é seguro e isolado.
