# Refatoração de Cabeçalho: Remoção de Títulos Redundantes

**Data/Hora:** 2026-09-20_0415
**Responsável:** Claude Code & User
**Opção Implementada:** Opção A (Mínimo)

## O que foi feito

Foram removidos os títulos redundantes "Plano Anual Atual", "Plano Mensal Atual" e "Plano Semanal Atual" do cabeçalho dos Planos. Agora o cabeçalho exibe apenas a data e o conteúdo do plano, simplificando o layout e removendo informações já presentes nas abas centrais.

## Por que

O usuário solicitou (Opção A) uma abordagem minimalista:
- Os títulos "Plano Anual", "Plano Mensal" e "Plano Semanal" já existem como abas no cabeçalho central
- Repetir esses nomes no corpo do conteúdo é redundante
- Container `header-periodo-buttons` foi adicionado anteriormente para exibir botões de período quando necessário
- Simplificar o layout torna a navegação mais clara

## Estado Anterior

**Renderização em `renderPlanoVersionado()` (linha 608):**
```javascript
<h2 class="text-3xl font-bold text-white mb-1" style="text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);">${icone} ${tituloCard}</h2>
```

Resultava em:
- "📅 Plano Anual Atual" (no Plano Anual)
- "🗓️ Plano Mensal Atual" (no Plano Mensal)
- "📋 Plano Semanal Atual" (no Plano Semanal)

## Estado Novo

**Após remoção (linha 608 foi excluída):**

Agora o cabeçalho contém apenas:
- Data do plano: "Sábado, 19 De Setembro De 2026"
- Conteúdo do plano em card branco
- Seção "Atividades" com listagem de cards

**Layout simplificado:**
```
┌─────────────────────────────────────────┐
│ Sábado, 19 De Setembro De 2026         │  ← Apenas data
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ "Principais marcos para 2026: ..."  │ │
│ │ Definido em: 19/09/2026, 19:18:45   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📌 Atividades (2)      [+ Adicionar]    │
│ ...                                     │
└─────────────────────────────────────────┘
```

## Ficheiros Afetados

- `js/app.js` (1 mudança):
  - Linhas ~605-609: Removida a linha de título (`h2` com `tituloCard`)
  - Variável `tituloCard` ainda definida (linha 551) mas não renderizada

- `docs/MANUAL_TECNICO.md` (1 adição):
  - Versão 1.23 adicionada ao histórico

## Validation

✅ **Plano Anual:**
- Título removido
- Data exibida corretamente
- Conteúdo do plano intacto
- Seção de Atividades funcional

✅ **Plano Mensal:**
- Título removido
- Data exibida corretamente
- Conteúdo do plano intacto
- Seção de Atividades funcional

✅ **Plano Semanal:**
- Mudança aplicável (quando acessado)

✅ **Header:**
- Container `header-periodo-buttons` permanece (vazio quando `periodosOrdenados.length ≤ 1`)
- Botões de período aparecerão automaticamente quando houver múltiplos períodos

## Plano de Rollback / Desfazer

Para reverter esta mudança:

1. **Restaurar renderização de título em `app.js` (linha ~608):**
   ```javascript
   // Adicionar novamente a linha:
   <h2 class="text-3xl font-bold text-white mb-1" style="text-shadow: 0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);">${icone} ${tituloCard}</h2>
   ```

2. **Remover versão 1.23 de `MANUAL_TECNICO.md`** se desejado

3. **Recarregar a extensão ou página** (Ctrl+Shift+R)

## Notas Importantes

1. **Variável `tituloCard` ainda existe** (linha 551) mas não é renderizada. Pode ser removida em futuro refactor se não for usada em outro contexto.

2. **Botões de período** só aparecem quando há múltiplos períodos (`periodosOrdenados.length > 1`). Atualmente, há apenas um período por tipo (2026, 2026-09, 2026-w38), então os botões não aparecem — o que é correto e esperado.

3. **Essa mudança complementa** a preparação do header que foi feita em versões anteriores (linha ~710 removeu `tituloPorPrazo`, linha ~109 adicionou `header-periodo-buttons`).

4. **Hard reload necessário** no navegador (Ctrl+Shift+R) para ver as mudanças (cache do navegador).

## Próximos Passos (Sugestões)

- Se múltiplos períodos forem criados em banco de dados (ex: 2025, 2026 para Plano Anual), os botões de período aparecerão automaticamente no header sem mudanças de código
- Considerar remover a variável `tituloCard` se nunca for usada
- Documentar no `UX_LAYOUT.md` esta decisão de design (se ainda não estiver lá)
