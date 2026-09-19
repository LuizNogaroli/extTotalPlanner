# Atualização de Layout, Cards e Drag & Drop
**Data:** 19/09/2026
**Objetivo:** Refatoração visual do Cabeçalho e Cards de Atividades, implementação de Drag & Drop para o cabeçalho e fallback nativo de transferência de datas.

## 1. Refatoração Visual do Cabeçalho (`index.html`)

**Estado Anterior (Antes):**
```html
<header class="h-16 border-b ...">
    <!-- Header antigo com current-week-display solto à esquerda -->
</header>
<div id="view-dashboard">
    <div id="top-tabs-container" class="flex space-x-2 ..."></div>
</div>
```

**Estado Novo (Depois):**
```html
<header class="border-b border-[var(--border-color)] px-4 bg-[var(--bg-panel)] flex-shrink-0 py-2">
    <div class="flex items-center justify-between w-full">
        <div class="flex items-center flex-1">
            <!-- Hamburguer -->
        </div>
        <div class="flex justify-center flex-[2] md:flex-[3] overflow-x-auto" style="scrollbar-width: none;">
            <!-- TABS CENTRALIZADAS AQUI -->
            <div id="dynamic-header-tabs" class="flex items-center space-x-2"></div>
        </div>
        <div class="flex items-center justify-end flex-1 space-x-2">
            <!-- Botões -->
        </div>
    </div>
</header>
```
*(As abas e a navegação "wXX" foram centralizadas matematicamente utilizando Flexbox)*

---

## 2. Implementação do Drag & Drop e Transferência (`js/app.js`)

**Estado Anterior (Antes):**
- Os cards tinham `draggable="true"` mas não possuíam listeners de `dragstart` e `drop`.
- Apenas existiam botões `Ver` e `Editar` nos cartões.
- As abas de navegação possuíam formatação engessada `['DOM', 'SEG']` e classe `uppercase`.

**Estado Novo (Depois):**
- As abas agora utilizam a classe `.day-dropzone` com formato limpo e leve (`['Dom', 'Seg']` e classe `capitalize`).
- Nova função **`initDragAndDrop()`** e eventos `dragover`, `drop` injetados dinamicamente ao renderizar o *Weekly Grid*.
- **Plano B:** Botão `➡️ Transferir` inserido no layout renovado dos cartões (Cabeçalho, Conteúdo Clamped, Rodapé). Abre uma interface nativa (`input.showPicker()`) permitindo remanejar a tarefa em caso de touch screen mobile sem Drag&Drop.

**Código de Drag and Drop Aplicado:**
```javascript
_handleDrop: async (e) => {
    e.preventDefault();
    const dropzone = e.target.closest('.day-dropzone');
    if(dropzone) {
        dropzone.classList.remove('bg-[var(--border-color)]', 'bg-opacity-50', 'ring-2', 'ring-[var(--primary-color)]');
        const targetDate = dropzone.dataset.date;
        if(!targetDate) return;
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.sourceDate === targetDate) return; 
            if (targetDate === 'weekly') {
                if (window.NotificationService) window.NotificationService.show("Transferência para a Semana (Foco) em desenvolvimento!");
                return;
            }
            const acts = await StorageService.get('planner_activities') || [];
            const idx = acts.findIndex(a => a.id === data.id);
            if(idx !== -1) {
                acts[idx].date = targetDate;
                await StorageService.set('planner_activities', acts);
                if(window.NotificationService) window.NotificationService.show(`Atividade movida!`);
                document.dispatchEvent(new CustomEvent('layoutChange', { detail: window.currentLayout || 'grid' }));
            }
        } catch(err) {
            console.error("Drop error", err);
        }
    }
}
```

---

## 3. Plano de Rollback / Desfazer

Caso seja necessário reverter essas alterações de layout:

1. **Restaurar `index.html`:**
   Remova a `<div class="flex justify-center flex-[2] md:flex-[3] ...` e a mova de volta para dentro de `<div id="view-dashboard">`, retirando o sistema de centralização flex (Flex-1, Flex-3, Flex-1).
2. **Reverter Maiúsculas em `app.js`:**
   Encontrar a função de renderização das abas e alterar a classe `capitalize` de volta para `uppercase`, restaurando o Array `['DOM', 'SEG', ...]`.
3. **Remover Drag and Drop:**
   Remover a injeção global de `window.appRouter.initDragAndDrop()` ao final de `renderWeeklyGrid` e deletar os eventos `_handleDrop` do objeto `appRouter`.
