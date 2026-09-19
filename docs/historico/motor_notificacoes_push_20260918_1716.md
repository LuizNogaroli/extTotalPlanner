# Histórico de Interações - Criação de Serviço de Alarme e Push Notifications

## Estado Anterior (Antes)
- O planner era apenas passivo. Não havia como notificar ou chamar a atenção do usuário no Windows.
- O plano original era colocar as configurações de lembrete dentro da página de Settings.

## Estado Novo (Depois)
- Seguindo o pedido do usuário, a gestão de Alarmes foi alçada à funcionalidade de primeiro nível. Um botão "⏰ Lembretes e Alarmes" foi adicionado ao menu lateral principal (`#sidebar`).
- Ele reaproveita toda a infraestrutura ágil de CRUD (`openManager('alarme')`), possuindo listagem, botão de Editar e Excluir.
- Criado o arquivo `js/services/NotificationService.js` contendo a engine de notificações HTML5. Ele checa as horas locais a cada 30 segundos. Se bater com um horário gravado em `planner_alarme`, emite um `new Notification()`.
- Lógica inteligente de *debounce*: ele armazena o minuto que foi disparado em `this.lastTriggeredMinute` para impedir que a mesma notificação seja enviada duas vezes no mesmo minuto.
- Arquitetura isolada para futuramente trocar `setInterval` por `chrome.alarms` no Service Worker.

## Plano de Rollback / Desfazer
Para reverter ao estado original:
1. **Em `index.html`**:
   - Apague a tag `<a href="#"... onclick="window.appRouter.openManager('alarme')">⏰ Lembretes e Alarmes</a>` do menu lateral.
   - Apague o formulário `<form id="form-alarme">` dentro do modal de CRUD.
   - Remova a inclusão do `<script src="js/services/NotificationService.js"></script>`.
2. **Em `js/app.js`**:
   - Remova `'alarme': document.getElementById('form-alarme')` da variável `forms`.
   - Remova as definições de 'alarme' nas funções `openModal()`, `openManager()` e `renderManagerList()`.
   - Delete o `addEventListener` de *submit* do `form-alarme`.
3. **No sistema de arquivos**:
   - Exclua o arquivo `js/services/NotificationService.js`.
