# Suporte a Movimentação de Tarefas para a Timeline Lateral
**Data:** 18 de Setembro de 2026

## O que foi feito
A capacidade de drag and drop foi significativamente expandida para resolver a frustração do usuário ao tentar mover tarefas entre datas que não estavam simultaneamente visíveis na tela. 
Agora, além de mover as tarefas entre as colunas do layout semanal, o usuário pode **arrastar uma tarefa do centro da tela e soltá-la em cima de qualquer dia listado no menu lateral (Sidebar Timeline)**. Isso possibilita mover tarefas para a próxima semana ou para qualquer dia do ano com facilidade, sem precisar abrir o formulário de edição de data.

## 1. Estado Anterior (Antes)
- Apenas as colunas do centro da grade (que possuíam a classe `.day-dropzone`) aceitavam a "soltura" do card.
- A linha do tempo lateral (`id="sidebar-timeline"`) consistia em simples links (`<a>`) para navegar, mas ignorava completamente o arrastar e soltar.

## 2. Estado Novo (Depois)
1. No arquivo `js/app.js` (linha ~1380, durante a renderização da timeline), as tags de navegação receberam a classe `.day-dropzone` e uma classe exclusiva `.sidebar-dropzone`. Também foi injetado o atributo de dados obrigatório (`data-date="YYYY-MM-DD"`).
2. No motor de drag and drop em `js/dragAndDrop.js`, foi introduzida uma trava `isSidebar`. Se o usuário soltar a tarefa num item da sidebar, o sistema não tenta injetar o HTML massivo do card dentro do pequeno link da lateral. Ao invés disso:
   - A tarefa simplesmente desaparece da coluna de origem na tela.
   - Sua data é atualizada instantaneamente no banco de dados (`StorageService`).
   - Um feedback visual rápido (texto "✅ Movido!") pisca na sidebar para confirmar a operação.

## 3. Plano de Rollback / Desfazer
1. No arquivo `js/app.js`, localize a linha `dayLink.className = "... day-dropzone sidebar-dropzone";` na geração do `sidebar-timeline`. Remova as duas últimas classes. Em seguida, exclua a linha `dayLink.dataset.date = dateStrForDrop;`.
2. No arquivo `js/dragAndDrop.js`, remova a checagem booleana `const isSidebar` e seus condicionais visuais correspondentes, revertendo para o loop tradicional que só insere a div caso contrário.
