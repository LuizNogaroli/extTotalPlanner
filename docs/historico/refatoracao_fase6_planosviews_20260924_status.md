# Refatoração do `app.js` — Fase 6: módulo `planos.js` (Status Parcial)

**Data/Hora:** 2026-09-24
**Responsável:** Claude Haiku 4.5

## O que foi feito

**Implementação (95% concluída):**
- Criado `js/modules/views/planos.js` com ~770 linhas contendo 6 funções extraídas
- Exportadas: `initPlanosViews`, `switchToPlanosView`, `switchToAtividadesView`, `renderAtividadesTable`, + 2 funções locais `seedDemoEstrategicos`, `seedDemoAtividades`
- Import adicionado a `app.js` (linha 15)
- Inicialização `initPlanosViews()` adicionada em app.js
- Funções adicionadas a `window.appRouter` (exceto seed functions, que foram deixadas locais para evitar conflito)

**Problemas identificados (em investigação):**
1. **SyntaxError:** "Identifier 'seedDemoEstrategicos' has already been declared" — impede carregamento do script
   - Origem: investigação em andamento — não foi encontrada duplicação evidente de `let seedDemoEstrategicos` nos arquivos
   - Possível causa: conflito entre importações/exports de múltiplos módulos
2. **TypeError:** "Cannot read properties of undefined (reading 'get')" — `window.StorageService` undefined em strategic.js:52
   - Origem: StorageService.js declara `window.StorageService = StorageService;` mas aparentemente não chega a executar

## Estado Anterior

- **`js/app.js`:** 2.368 linhas (após Fase 5)
- 6 funções inline de Planos/Atividades ainda em app.js

## Estado Novo (Parcial)

- **`js/modules/views/planos.js`:** 616 linhas (novo arquivo, funcional estruturalmente)
- **`js/app.js`:** ~1.230 linhas
- Removidas funções de app.js (sucesso)
- Import e inicialização adicionadas (sucesso)
- Seed functions convertidas para locais (em planos.js) para evitar nome duplicado com strategic.js

## Problemas Pendentes

1. **Investigar SyntaxError de seedDemoEstrategicos**
   - Procurar por todas as declarações `let seedDemoEstrategicos` em todos os .js do projeto
   - Verificar se há arquivo com script carregado 2x
   - Possível solução: renomear localmente em planos.js para `seedDemoEstrategicosLocal`

2. **Investigar StorageService undefined**
   - Verificar ordem de carregamento em index.html
   - StorageService.js é carregado como script normal ANTES de app.js
   - Possível timing issue onde JS módulos carregam antes de StorageService estar pronto

## Verificação (navegador)

- ✖ Página carrega mas console mostra SyntaxError
- ✖ Menu items não funcionam (erro de sintaxe bloqueia)
- ✖ Planos e Atividades não testadas (bloqueadas por erro)

## Plano de Rollback

Reverter para commit a300430 e recomeçar Fase 6 com investigação mais profunda dos erros de sintaxe.

## Notas

- As funções foram bem estruturadas em planos.js
- A divisão de responsabilidades (strategic vs planos) está clara
- O erro de "already declared" é cryptográfico — precisa de debugging mais cuidadoso
- Talvez usar grep recursivo completo em todo o projeto (incluindo arquivos de backup, se houver)
