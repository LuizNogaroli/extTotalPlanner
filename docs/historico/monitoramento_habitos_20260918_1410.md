# Histórico de Interações - Monitoramento de Hábitos

## Estado Anterior (Antes)
- O usuário não possuía forma de criar formulários diários personalizados para acompanhamento da rotina. O único espaço subjetivo do dia era o campo de texto livre do Diário.

## Estado Novo (Depois)
- Criada a funcionalidade "Monitoramento de Hábitos / Questionário Diário".
- Adicionado no Menu Principal (Módulos Diários) um botão "✅ Monitorar Hábitos".
- Criado um formulário de cadastro dinâmico de perguntas no modal CRUD global, permitindo tipos variados de resposta: "Texto Curto", "Hora", "Sim/Não" e "Nota". As definições são salvas em `planner_habito`.
- Na visão de Impressão Diária (A4), adicionado um novo painel expansível e automático de formulário que lê as perguntas cadastradas e renderiza inputs HTML correspondentes acima do Diário.
- Implementado um Auto-Save no evento `change` dos inputs dinâmicos, salvando o estado das respostas diárias no `planner_habits_log`.
- Inserido o botão "✅ Hábitos" na tela "Exportar Dados".
- Implementado o motor de exportação no Javascript que faz o *merge* das perguntas (headers) com as respostas salvas diariamente.

## Plano de Rollback / Desfazer
Para reverter as mudanças inseridas e voltar ao estado anterior:

1. **No arquivo `index.html`**:
   - Remova a tag de link `✅ Monitorar Hábitos` da barra lateral `<nav>`.
   - Delete a tag `<form id="form-habito" ...> ... </form>` do Modal Global.
   - Na View Diária (`#global-day-modal`), delete a div `#widget-habitos-container`.
   - Na tela `#view-export`, delete o botão `data-module="planner_habits_log"`.

2. **No arquivo `js/app.js`**:
   - Remova a entrada `'habito': document.getElementById('form-habito')` no objeto `forms`.
   - No `openModal`, remova `'habito'` de `titles` e delete o bloco `else if (type === 'habito')`.
   - Remova o bloco `forms['habito']?.addEventListener...`.
   - Na função `openManager`, remova a tradução de `'habito'` do bloco de títulos.
   - Na função `renderManagerList`, remova o `else if (type === 'habito')`.
   - Na função `openDayModal`, apague o bloco de código inteiro classificado como `// 4. Hábitos / Questionário`.
   - Apague o escutador de eventos delegado ao formulário em `// ==== AUTOSAVE DOS HÁBITOS ====`.
   - Na função do botão de exportação, delete o bloco `else if (moduleKey === 'planner_habits_log')` e a rotina condicional para parsear o `Object.keys()` de `habitsData`.
