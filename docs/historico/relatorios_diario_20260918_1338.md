# Histórico de Interações - Relatórios e Diário Diário

## Estado Anterior (Antes)
- O `index.html` não possuía menu de "Relatórios e Dados" e nem a div `view-reports`.
- O `index.html` não possuía o `<textarea id="daily-journal-input">` dentro do modal A4 diário (`#global-day-modal`).
- O `app.js` não continha lógica para alternar a view de relatórios, gerar CSV e nem o event listener de salvamento automático do diário no localStorage.
- O campo "Diário" era ausente da estrutura de layout de impressão.

## Estado Novo (Depois)
- Adicionado o link `#menu-reports` no sidebar.
- Adicionada a div `#view-reports` com os botões "Gerar Planilha CSV" e "Abrir Diário Completo", além do contêiner oculto para o relatório a ser impresso.
- Inserido o widget de Diário (`#daily-journal-input`) na coluna principal do modal diário (`#global-day-modal`), na parte inferior do grid.
- Implementada a função de roteamento `switchToReportsView()` no `app.js`.
- Adicionado listener de `input` no textarea do diário com um debounce de 800ms (`setTimeout`) para salvar o conteúdo automaticamente no `localStorage` sob a chave `planner_journal`, mapeado por data (ex: `2026-09-18`).
- Adicionado um exportador manual em CSV nativo (Javascript Blob) de todas as collections (`planner_activities`, `planner_historico`, etc.).

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior:

1. **No arquivo `index.html`**:
   - Localize e exclua a tag `<a href="#" id="menu-reports">...</a>` na `<nav id="sidebar">`.
   - Exclua o bloco completo correspondente ao `<!-- Área de Relatórios -->` (`<div id="view-reports">...</div>`).
   - Dentro do `<div id="global-day-modal">`, localize a seção `<!-- WIDGET: DIÁRIO -->` e exclua o seu conteúdo inteiro (`textarea` e a div de título/status associada).
   
2. **No arquivo `js/app.js`**:
   - Exclua as constantes `viewReports` e `btnMenuReports`.
   - Exclua a função `switchToReportsView()`.
   - Nos outros roteadores (`switchToWeeklyView`, `switchToSettings`, `switchToDailyView`), remova as linhas que ocultam e manipulam o botão e a view de relatórios (ex: `viewReports.classList.add('hidden')` e `viewReports.classList.remove('flex')`).
   - No método `openDayModal`, exclua o bloco correspondente ao "CARREGAMENTO DO DIÁRIO" (carregamento de `journalData` e `currentDailyDateStr`).
   - Exclua o bloco do "AUTOSAVE DO DIÁRIO" (`journalInput.addEventListener('input', ...)`).
   - Exclua o bloco de "EXPORTAÇÃO E RELATÓRIOS" (o `btnExportCsv.addEventListener` e o `btnReportJournal.addEventListener`).
