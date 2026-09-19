# Histórico e Rollback: Implementação do Modal CRUD Global
**Data:** 18 de Setembro de 2026

## Descrição da Mudança
O botão principal do Header de `index.html` foi alterado de "Nova Ação" para "Nova Atividade". Foi inserido um Modal Global de CRUD oculto por padrão. No `js/app.js`, foi inserida a lógica de alternância para o formulário de Atividade vs Estratégia (Missão/Visão/Objetivos) e o salvamento em `StorageService` (`planner_activities` e `planner_strategies`).

---

## 1. Estado Anterior (Antes)

**`index.html` (Header)**
```html
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded hover:bg-[var(--primary-hover)] transition shadow-sm" data-i18n="newAction">+ Nova Ação</button>
```

**`index.html` (Fim do arquivo)**
```html
        </main>
    </div>

    <script src="js/services/StorageService.js"></script>
```

**`js/app.js` (Exportações Globais)**
```javascript
    // ==========================================
    // EXPORTAÇÃO DAS FUNÇÕES GLOBAIS DE ROTA
    // ==========================================
    window.appRouter = {
        goWeekly: switchToWeeklyView,
        goDaily: switchToDailyView
    };
```

---

## 2. Estado Novo (Depois)

**`index.html` (Header)**
```html
<button id="btn-new-activity" class="bg-[var(--primary-color)] text-white px-4 py-2 rounded hover:bg-[var(--primary-hover)] transition shadow-sm" data-i18n="newActivity">+ Nova Atividade</button>
```

**`index.html` (Fim do arquivo)**
Foram adicionadas cerca de 80 linhas compondo o `<!-- Modal Global de CRUD -->` contendo dois forms (`#form-atividade` e `#form-estrategia`).

**`js/app.js` (Bloco do Modal)**
Adicionado bloco de ~100 linhas (`// MODAL DE CRUD GLOBAL`) manipulando a abertura do modal (`openModal('atividade' | 'estrategia')`), escuta de envios de form (`submit`) e salvamentos via `StorageService.set()`. O `window.appRouter` agora também exporta o `openModal`.

---

## 3. Plano de Rollback / Desfazer

Se for necessário reverter as alterações e remover o modal de CRUD, siga os passos estritos abaixo:

1. **Reverter `index.html` (Botão):**
   - Substitua `<button id="btn-new-activity" ...>+ Nova Atividade</button>` de volta para `<button class="..." data-i18n="newAction">+ Nova Ação</button>`.
   
2. **Reverter `index.html` (Modal HTML):**
   - Apague todo o bloco de código que inicia em `<!-- Modal Global de CRUD -->` e termina na div correspondente, logo acima de `<script src="js/services/StorageService.js">`.
   
3. **Reverter `js/app.js` (Lógica e Router):**
   - Remova o grande bloco de comentários `// MODAL DE CRUD GLOBAL` e todas as constantes de DOM do modal, `openModal`, `closeModal`, e eventos `.addEventListener('submit')`.
   - Na seção `window.appRouter`, remova a chave `openModal: openModal`.

Dessa forma, a extensão voltará a ter uma view puramente estática.
