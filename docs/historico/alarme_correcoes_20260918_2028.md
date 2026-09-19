# Correção de Bugs - Motor de Alarmes e Notificações
**Data:** 18 de Setembro de 2026

## O que foi feito
O recurso de alarmes não estava funcionando pois o navegador nunca solicitava a permissão ao usuário para emitir as notificações. Além disso, havia um *bug* silencioso de fuso horário na validação de dias únicos, que usava UTC em vez do fuso local do computador.

## 1. Estado Anterior (Antes)
- O `NotificationService` até possuía o método `requestPermission()`, mas ele não era chamado em nenhum gatilho de interface (botão). Como o Chrome exige ação do usuário, o status ficava como `default` (negado implicitamente).
- O dia atual (`todayStr`) era calculado usando `.toISOString()`, gerando bugs de fuso horário.

```javascript
// Antes em NotificationService.js
const todayStr = now.toISOString().split('T')[0];
```

```javascript
// Antes em app.js (Submit de Alarme)
await StorageService.set('planner_alarme', items);
closeModal();
openManager('alarme');
```

## 2. Estado Novo (Depois)
- Inserido o gatilho de permissão de notificação no instante exato em que o usuário clica em "Salvar Alarme". Se a permissão não foi concedida antes, ela "pula" na tela ali mesmo.
- Corrigida a aritmética de datas no serviço de notificação para considerar as horas locais do relógio do sistema.

```javascript
// Depois em NotificationService.js
const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
```

```javascript
// Depois em app.js (Submit de Alarme)
await StorageService.set('planner_alarme', items);

// Pede permissão de notificação se o usuário ainda não tiver dado
if (window.NotificationService && window.Notification.permission !== "granted") {
    await window.NotificationService.requestPermission();
}

closeModal();
openManager('alarme');
```

## 3. Limitações Técnicas Atuais
Como o app ainda é uma Extensão de Nova Aba (apenas HTML, sem Background Service Worker real no `manifest.json`), **o alarme não tocará se a aba for fechada**. O motor de intervalo precisa que a tela da extensão fique aberta (mesmo que minimizada).

## Plano de Rollback / Desfazer
1. Retorne ao `.toISOString()` no arquivo `js/services/NotificationService.js`.
2. Remova o bloco do `if (window.NotificationService && window.Notification.permission !== "granted")` dentro da função de *submit* do formulário de Alarmes em `js/app.js`.
