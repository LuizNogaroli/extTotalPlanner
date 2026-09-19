# Alteração na UX de Hábitos - Botões Salvar e Editar Explícitos
**Data:** 18 de Setembro de 2026

## O que foi feito
A pedido do usuário, o sistema de preenchimento dos Hábitos Diários foi alterado para ter uma iteração explícita. Anteriormente, o campo de input salvava os dados silenciosamente assim que o usuário tirava o foco do campo (evento `change`). Agora, cada hábito apresenta os botões **Salvar** e **Editar**.

Quando o hábito já está preenchido, o campo fica bloqueado (`readonly`) e apenas o botão de Editar fica disponível. Clicar em Editar destrava o campo e habilita o botão Salvar.

## 1. Estado Anterior (Antes) - app.js

```javascript
// Renderização do HTML de Habito (Sem botões e sem validação readonly)
const inputHtml = `<input type="text" class="habit-input w-full border border-[var(--border-color)] rounded p-1.5 text-sm bg-[var(--bg-color)] text-[var(--text-primary)]" data-habit-id="\${h.id}" value="\${val}">`;

// Lógica de Autosave
habFormArea.addEventListener('change', async (e) => {
    if (e.target.classList.contains('habit-input')) {
        // salvamento automático ao perder o foco (blur/change)
    }
});
```

## 2. Estado Novo (Depois) - app.js
Incluídas as variáveis `saveBtnHtml` e `editBtnHtml`, além do atributo `readonly` se a variável possuir texto (`isFilled`).

```javascript
// Nova renderização de HTML
const isFilled = val.trim() !== '';
const inputState = isFilled ? 'readonly' : '';
const inputHtml = `<input type="text" class="habit-input w-full md:w-48 border border-[var(--border-color)] rounded p-1.5 text-sm bg-[var(--bg-color)] text-[var(--text-primary)]" data-habit-id="\${h.id}" value="\${val}" \${inputState}>`;

const saveBtnHtml = `<button class="btn-habit-save bg-[var(--primary-color)] text-white px-2 py-1.5 rounded text-xs ml-2 hover:opacity-80 transition \${isFilled ? 'hidden' : ''}" data-habit-id="\${h.id}">Salvar</button>`;
const editBtnHtml = `<button class="btn-habit-edit border border-[var(--border-color)] text-[var(--text-primary)] px-2 py-1.5 rounded text-xs ml-2 hover:bg-[var(--border-color)] transition \${!isFilled ? 'hidden' : ''}" data-habit-id="\${h.id}">Editar</button>`;

// Lógica nova alterada de 'change' para 'click' (Delegação de Eventos)
habFormArea.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-habit-save')) {
        // Remove readonly, salva no banco e inverte visibilidade dos botões
    } else if (e.target.classList.contains('btn-habit-edit')) {
        // Remove readonly e inverte botões para permitir edição
    }
});
```

## 3. Plano de Rollback / Desfazer
Para reverter ao padrão de autosave silencioso:
1. Vá até a linha aprox. 700 do arquivo `js/app.js` e volte o `inputHtml` para remover o `readonly`. Remova as variáveis `saveBtnHtml` e `editBtnHtml` do `.join()`.
2. Delete o trecho que escuta cliques no `habFormArea` (`btn-habit-save` e `btn-habit-edit`) e reinstaure o escutador do evento `change` que validava a presença da classe `habit-input`.
