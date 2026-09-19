# Histórico de Interações - Visão de Exportação de Dados

## Estado Anterior (Antes)
- Havia apenas a seção "Relatórios e Dados" no menu lateral.
- A exportação em CSV consistia de um único botão que agrupava forçadamente diversos módulos do Planner (`planner_activities`, `planner_historico`, etc) no mesmo arquivo, ocasionando um layout misturado e colunas em branco no CSV final para acomodar os diferentes padrões.
- O diário (journal) e o planejamento estratégico (strategies) não podiam ser exportados para CSV de forma estruturada.

## Estado Novo (Depois)
- O menu foi reestruturado. "Relatórios e Dados" foi renomeado para apenas "Relatórios".
- Foi criado o link exclusivo no menu principal para "💾 Exportar Dados".
- Uma nova área `view-export` foi adicionada contendo 7 botões modulares. Cada botão foca na exportação individual do seu respectivo banco de dados (Atividades, Estratégia, Histórico, Motivacional, Devocional, Compras, Diário).
- A lógica de exportação em JavaScript (`app.js`) foi reescrita. Agora o código monta cabeçalhos precisos (Headers) para o tipo de dado selecionado e extrai apenas as colunas relevantes àquele módulo, garantindo CSVs perfeitamente integráveis com Google Sheets.
- O Diário (`planner_journal`) foi suportado na exportação, gerando 2 colunas: Data e Anotação.

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior:

1. **No arquivo `index.html`**:
   - Renomear `<a href="#" id="menu-reports" ...>📊 Relatórios</a>` de volta para `📊 Relatórios e Dados`.
   - Excluir o botão `<a href="#" id="menu-export" ...>💾 Exportar Dados</a>`.
   - Dentro de `<div id="view-reports" ...>`, adicionar novamente o card de HTML responsável pela antiga exportação de CSV acima de "O Seu Livro (Diário)":
     ```html
     <div class="bg-[var(--bg-panel)] p-5 rounded-lg border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
        <div>
            <h3 class="text-lg font-bold mb-2 text-[var(--text-primary)]">Exportar Dados (CSV)</h3>
            <p class="text-sm text-[var(--text-secondary)] mb-4">Gere um arquivo CSV contendo todos os seus dados cadastrados para backup ou para abrir no Google Sheets/Excel.</p>
        </div>
        <button id="btn-export-csv" class="w-full py-2 text-white font-bold transition rounded shadow-sm" style="background-color: var(--primary-color);">Gerar Planilha CSV</button>
     </div>
     ```
   - Excluir o bloco inteiro `<div id="view-export" ...> ... </div>` que criamos.

2. **No arquivo `js/app.js`**:
   - Excluir referências de `viewExport` e `btnMenuExport` do topo do arquivo e da função `hideAllViews()`.
   - Excluir a declaração de função `switchToExportView()`.
   - Remover o `addEventListener` do `btnMenuExport`.
   - Na seção "EXPORTAÇÃO E RELATÓRIOS", remover o script de `exportButtons.forEach...` e reinserir a lógica antiga do `btnExportCsv`, que utiliza um `for (const key of keys)` concatenando todas as chaves em um único CSV.
