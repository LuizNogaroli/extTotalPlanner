# Histórico de Interações - Configurações e Modificadores do Layout Diário

## Estado Anterior (Antes)
- O modal diário (A4) continha 4 widgets fixos (Curiosidades, Refrigério da Alma (Misto de motivacional e devocional), Compras e Hábitos). O usuário não tinha como esconder ou desativar os painéis que não utilizava.
- A página "Configurações" (`view-settings`) apenas tinha botões visuais para modo escuro/claro e layouts. Não havia seção para "Painéis da Visão Diária".
- A impressão padrão do modal não estava devidamente formatada e podia misturar CSS.

## Estado Novo (Depois)
- Adicionada a subseção "Painéis da Visão Diária (A4)" dentro de Configurações, com checkboxes individuais.
- As marcações de checkbox interagem em tempo real com `StorageService.save('planner_settings', ...)` persistindo a preferência de tela do usuário.
- Ao abrir o `#global-day-modal`, o `js/app.js` lê essas preferências e aplica um `style.display = 'none'` caso o painel esteja inativo.
- O bloco único "Refrigério da Alma" foi cindido em **"✨ Motivacional"** e **"🙏 Devocional"**, ganhando requisições assíncronas separadas.
- Inserido tag `<style> @media print { ... } </style>` dentro do `<head>` que limpa o canvas (escondendo botões, scrollbars e o site em si), tornando a box `#global-day-modal` isolada na folha A4 em tela cheia para preservar cores, tamanhos e disposição de grid.
- Adicionado botão "🖨️ Imprimir Dia" diretamente no cabeçalho do Modal Diário, com `onclick="window.print()"`.

## Plano de Rollback / Desfazer
Para reverter ao estado original:
1. **Em `index.html`**:
   - Delete a tag estrita `<style> @media print...` inserida no `<head>`.
   - Remova o botão `🖨️ Imprimir Dia`.
   - No bloco `#view-settings`, apague a inteira `<section>` "Painéis da Visão Diária (A4)".
   - No layout Diário (`#global-day-modal`), unifique as duas *divs* `widget-container-motivacional` e `widget-container-devocional` numa só, chamando novamente "Refrigério da Alma" e remova a id extra delas.
2. **Em `js/app.js`**:
   - Remova o bloco de inicialização das `settingsCheckboxes`.
   - Na rotina `openDayModal()`, retorne ao código linear anterior, apagando as tratativas condicionais `if (settings.historico)` e voltando `getRandomReflexion()`.
3. **Em `js/services/ContentService.js`**:
   - Exclua `getRandomMotivacional()` e `getRandomDevocional()` e recrie a genérica `getRandomReflexion()` que embaralhava ambos numa lista só.
