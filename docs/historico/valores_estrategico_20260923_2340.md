# Nova Seção "Valores" no Nível Estratégico

**Data/Hora:** 2026-09-23_23:40
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Criada a opção "Valores" no menu lateral, grupo Estratégico, logo abaixo de "Objetivos". A página interna segue o esquema da página de Visão: texto único versionado, com a versão atual em destaque e as versões anteriores listadas abaixo, mais os botões "📚 Educacional" e "✏️ Atualizar Valores".

## Por que

Pedido do usuário: "no sidebar, nível estratégico, crie uma opção 'Valores' abaixo de 'Objetivos'; na página interna de valores pode fazer uma espécie de cópia da página interna de 'Visão'". Valores já faziam parte do Nível 1 (Estratégico) da Pirâmide do Planejamento em `Sobre_extPlanner.md` §2.1 ("Missão, Visão e Valores"), mas ainda não existiam no app.

## Estado Anterior

Estratégico: Missão | Visão | Objetivos. Nenhum registro do tipo `valores`.

## Estado Novo

Estratégico: Missão | Visão | Objetivos | **Valores**.

| Peça | Onde | Espelha na Visão |
| :--- | :--- | :--- |
| Link `#menu-valores` | `index.html`, `<nav>` do sidebar | `#menu-visao` |
| `switchToValoresView()` | `js/app.js`, logo depois de `switchToVisaoView()` | `switchToVisaoView()` |
| `form-valores` (textarea `#valores-content`) | `index.html`, modal CRUD | `form-visao` |
| `view-valores-educacional` | `index.html`, filha de `<main>`, depois da educacional de Objetivos | `view-visao-educacional` |
| Registro `valores` (`selfManaged: true`) | `js/modules/crud/formMappers.js` | `visao` |
| `'valores'` em `SELF_MANAGED_TYPES` | `js/modules/crudModal.js` | `'visao'` |
| Ramo `type === 'valores'` no listener `crudSave` | `js/app.js` | ramo `'visao'` |
| `'view-valores-educacional'` em `hideAllViews()` | `js/app.js` | `'view-visao-educacional'` |
| `'valores': 'Valores'` no `mapType` do gerenciador | `js/app.js`, `renderManagerList()` | `'visao': 'Visão'` |

**Diferenças em relação à Visão (de propósito):**
- **Conteúdo escapado** antes de ir para o `innerHTML` (helper local `esc()`). A Visão injeta o texto do usuário sem escapar; a página nova não repete isso.
- **Quebras de linha preservadas** (`whitespace-pre-line`), sem aspas nem itálico, porque valores costumam ser uma lista, um por linha.
- **Persistência simplificada:** o ramo `crudSave` só adiciona um novo registro `{ id, type: 'valores', content, timestamp }` a `planner_strategies`. O ramo da Visão faz um "mover para histórico" que, na prática, só reordena o array; a versão atual é sempre a de `timestamp` mais recente, porque a página ordena por timestamp. O resultado é o mesmo.
- A Visão não tem botão "Carregar dados de exemplo" (só a Missão tem), então Valores também não tem.

## Validação

- ✅ "Valores" aparece como 4º item do grupo Estratégico.
- ✅ Sem registros: mostra "Nenhuma declaração de valores cadastrada ainda."
- ✅ "Atualizar Valores" abre o modal com título "Definir Valores". Dois envios geram dois registros com `id` e `timestamp`: o mais recente aparece em "Valores Atuais" e o anterior em "Valores (versões anteriores)".
- ✅ Quebras de linha preservadas ("Integridade / Família / Aprendizado contínuo").
- ✅ Escape: um conteúdo com `<img src=x onerror=...>` aparece como texto e **não** executa.
- ✅ "📚 Educacional" abre `view-valores-educacional` (filha direta de `<main>`), e "Voltar" retorna à página de Valores.

## Ficheiros Afetados

`index.html`, `js/app.js`, `js/modules/crud/formMappers.js`, `js/modules/crudModal.js`.

## Plano de Rollback / Desfazer

Remover as peças da tabela acima (link, função, formulário, view educacional, registro no `formMappers`, item em `SELF_MANAGED_TYPES`, ramo do `crudSave`, entrada em `hideAllViews()` e no `mapType`). Os registros `type: 'valores'` já gravados em `planner_strategies` ficam órfãos, mas não afetam nenhuma outra tela.

## Notas Importantes

- **Problema visual pré-existente, herdado da Visão:** o card "Valores Atuais" fica sem fundo, e o título branco quase some. As classes de cor do gradiente não existem no `css/tailwind.css` local (`MANUAL_TECNICO.md` §3.21). Afeta igualmente Missão, Visão e Planos. Registrado em `pendencias.md` §6, não corrigido nesta mudança.
