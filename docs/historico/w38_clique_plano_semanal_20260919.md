# Fix: Clique no w38 (número da semana) Carrega Plano Semanal

**Data/Hora:** 2026-09-19
**Responsável:** Claude Code & User

## O que foi feito

Implementado a funcionalidade de navegação para o Plano Semanal quando o usuário clica no botão `w38` (número da semana) no cabeçalho. 

## Problema Identificado

A tarefa solicitada na sessão anterior ("quando clica no wXX número da semana deve carregar o plano semanal") estava incompleta. O evento de clique no botão `w38` chamava `switchToPlanosView('semanal')`, mas essa função não estava acessível no contexto do listener de clique.

**Root Cause:** A função `switchToPlanosView` era local ao escopo do `DOMContentLoaded`, e embora o listener estivesse no mesmo escopo, o listener estava tentando chamar a função diretamente em vez de através da API pública do `window.appRouter`.

## Solução Implementada

### 1. Exposição Global da Função (linha 2170)
Adicionado `switchToPlanosView` ao objeto `window.appRouter` para expô-la globalmente:

```javascript
window.appRouter = {
    ...
    switchToPlanosView: (prazo) => switchToPlanosView(prazo),
    ...
}
```

### 2. Atualização do Listener (linha 2358)
Alterado o listener de clique para chamar através de `window.appRouter`:

```javascript
if (targetBtn.dataset.date === 'weekly') {
    window.appRouter.switchToPlanosView('semanal');
}
```

### 3. Remoção de console.logs de Debug
Removidos os `console.log` adicionados durante o debugging.

## Estado Anterior

- Clique no botão w38 não navegava para o Plano Semanal
- Função `switchToPlanosView` não estava exposta em `window.appRouter`
- Listener tentava chamar função não acessível

## Estado Novo

✅ Clique no botão w38 navega para o Plano Semanal
✅ Header permanece com os botões de semana (w38, Dom, Seg, Ter, Qua, Qui, Sex, Sab) e datas
✅ Conteúdo do Plano Semanal é exibido com:
   - Título da data (ex: "Sábado, 19 De Setembro De 2026")
   - Card de conteúdo do plano
   - Seção de Atividades
   - Botão "+ Atualizar Plano Semanal"

## Ficheiros Afetados

- `js/app.js`:
  - Linha 2170: Adicionada `switchToPlanosView` a `window.appRouter`
  - Linha 2358: Alterada chamada de `switchToPlanosView('semanal')` para `window.appRouter.switchToPlanosView('semanal')`
  - Removidos console.logs de debug (linhas ~2355-2356)
  - Linhas 2176-2197: Removidas linhas em branco que causavam problemas de indentation

## Validation

✅ Clique direto no botão w38 carrega Plano Semanal
✅ Header mantém layout com botões de semana e datas
✅ Sem erros no console
✅ Sem quebra de funcionalidades existentes

## Plano de Rollback

Para reverter esta mudança:

1. **Remover `switchToPlanosView` de `window.appRouter` (linha 2170)**
2. **Restaurar chamada direta na linha 2358:**
   ```javascript
   switchToPlanosView('semanal');
   ```
3. **Recarregar a página (Ctrl+Shift+R)**

## Notas Importantes

1. **Problema de Cache:** Durante o debugging, o navegador estava servindo uma versão cached do arquivo JavaScript. Parar e reiniciar o servidor HTTP resolveu o problema.

2. **Indentation Issue:** Ao remover linhas em branco entre `transferActivity` e `initDragAndDrop`, houve um problema de indentation que foi corrigido ao reformatar a função `initDragAndDrop` com indentation apropriada.

3. **Validação de Sintaxe:** Usou-se `node -c` para validar a sintaxe do JavaScript antes de debugar no navegador, confirmando que não havia erros de parsing.

## Próximos Passos (Sugestões)

- Testar navegação para dias específicos (clique nos botões Dom, Seg, Ter, etc.) para confirmar que `goDaily` funciona corretamente
- Considerar melhorar o feedback visual quando um dia é selecionado (highlight do botão)
- Documentar a API de `window.appRouter` em `MANUAL_TECNICO.md`
