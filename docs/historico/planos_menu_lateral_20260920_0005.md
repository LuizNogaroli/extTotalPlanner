# Plano Anual/Mensal/Semanal como Links Diretos no Menu Lateral
**Data:** 20 de Setembro de 2026

## O que foi feito
O usuário pediu que "Plano Anual" e "Plano Mensal" (e, por extensão, "Plano Semanal") aparecessem como itens diretos do menu lateral, abaixo de "Tático" — no mesmo padrão de "Estratégico" (Missão/Visão/Objetivos como links separados), em vez de ficarem como sub-abas dentro de uma única página "Planos".

## 1. Estado Anterior (Antes)
- O menu `Tático` tinha um único link "Planos" (`#menu-planos`), que abria `view-planos` com uma barra de abas internas (`.planos-tab-btn`, `data-prazo="anual"|"mensal"|"semanal"`) para alternar entre os três horizontes de tempo.

## 2. Estado Novo (Depois)
1. **`index.html`**: o link único "Planos" foi substituído por três links — `#menu-plano-anual`, `#menu-plano-mensal`, `#menu-plano-semanal` — diretamente sob `Tático`. A barra de abas (`.planos-tab-btn`) foi removida de dentro de `view-planos`, que agora contém só o container `#planos-content-cards`.
2. **`js/app.js`**:
   - O listener único de `menu-planos` foi substituído por três listeners, cada um chamando `switchToPlanosView('anual'|'mensal'|'semanal')` diretamente.
   - `switchToPlanosView()` simplificada: removida a lógica de toggle visual das abas e o registro de seus listeners (a flag `btnPlanosTabsListenersAttached` foi removida, já que não há mais abas internas).
   - `headerTitle` agora mostra o nome específico do plano ativo ("Plano Anual", "Plano Mensal" ou "Plano Semanal"), em vez do genérico "Planos Táticos".
3. Testado: os três links aparecem corretamente expandindo o menu "Tático", cada um navega para o conteúdo correto (Plano Anual mostra o card versionado já existente; Mensal/Semanal mostram o placeholder "🚧 em construção").

## 3. Plano de Rollback / Desfazer
1. Em `index.html`: reverter os três links (`#menu-plano-anual`/`#menu-plano-mensal`/`#menu-plano-semanal`) para um único `<a id="menu-planos">Planos</a>`, e reintroduzir a barra `.planos-tab-btn` dentro de `view-planos` (ver versão anterior deste arquivo em `docs/historico/plano_anual_20260919_2350.md` para o HTML original das abas).
2. Em `js/app.js`: reverter os três listeners para o único `document.getElementById('menu-planos').addEventListener('click', () => switchToPlanosView('anual'))`, e restaurar em `switchToPlanosView()` a lógica de toggle visual das abas e o registro de seus listeners (variável `btnPlanosTabsListenersAttached`).
