# Documentação Sincronizada com o Código + Lista Completa de Correções

**Data/Hora:** 2026-09-24_02:30
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

A documentação do projeto foi revisada contra o código atual. No meio do trabalho, o usuário pediu: "anote tudo que necessita de correção no arquivo pendencia.md". **Nenhuma linha de código foi alterada.**

## Por que

Pedidos do usuário: "atualize a documentação do projeto extTotalPlanner" e "anote tudo que necessita de correção no arquivo pendencia.md". Vários documentos descreviam uma arquitetura que não existe mais: o manual apontava para módulos mortos e para a pasta errada, o `GEMINI.md` estava defasado em relação ao `CLAUDE.md`, e as pendências tinham itens já concluídos ainda abertos.

## Estado Anterior → Estado Novo

| Documento | Antes | Depois |
| :--- | :--- | :--- |
| `MANUAL_TECNICO.md` §1 | Uma frase ("SPA em Vanilla JS"). | Arquitetura real: MV3 com newtab override, sem service worker, sem build; Tailwind v2 sem JIT; dados; teste com `rodar.bat`. |
| `MANUAL_TECNICO.md` §2 | Árvore de `ext-planner\`, a pasta errada, com `modal.js`/`views.js`/`renderer.js`/`manager.js`, que são módulos mortos. | Árvore real de `extTotalPlanner/`, com os módulos mortos sinalizados. |
| `MANUAL_TECNICO.md` §3.21 | "Build estático: classes novas não funcionam". | **Diagnóstico corrigido:** é o Tailwind **v2.2.19 completo, sem JIT**, e **nenhuma** classe arbitrária funciona, nem as antigas. Verificado no navegador; 66 classes em uso não existem no build. |
| `MANUAL_TECNICO.md` §4 | Apontava `modal.js`/`renderer.js`/`manager.js` (mortos) como arquivos principais. | Mapeamento real, mais a nova **§4.1 Mapa de Dados**, com todas as chaves de storage e as divergências marcadas. |
| `MANUAL_TECNICO.md` §5 | 3 regras genéricas. | 9 regras, tiradas dos bugs reais do projeto. |
| `pendencias.md` | Itens concluídos ainda abertos; seções sobrepostas (4–7). | **Lista completa do que precisa de correção**, com cada item marcado como ✔ navegador ou 📖 leitura: 1. bugs funcionais; 2. visual/tema; 3. código morto e sujeira; 4. documentação desatualizada; 5. validações na máquina real; 6. decisões em aberto; 7. ideias (preservadas); 8. concluído (referência). |
| `Sobre_extPlanner.md` | v2.0, com a seção 1 duplicada e sem a situação dos módulos. | v2.1: duplicata removida, Valores marcado como implementado, nota "pirâmide x menu", tabela de módulos com a situação de cada um, e as subseções Recursos e Outros Sistemas. A v2.0 foi salva em `historico/Sobre_extPlanner_20260919_v2.0.md`. |
| `CLAUDE.md` / `GEMINI.md` | `GEMINI.md` sem o item 0 (`extDocumentacao`). | Os dois sincronizados, só com os nomes das ferramentas diferentes. Novo item 6 (`header.md`/`sub-header.md`), menção à §4.1 e à §3.21, e regra de anotar em `pendencias.md` o que não for corrigido na hora. |
| `header.md` / `sub-header.md` | Descreviam classes de cor como se funcionassem. | Avisos sobre o que realmente se aplica. Por exemplo, o destaque do dia ativo só mostra o fundo cinza; a borda e o texto na cor primária nunca apareceram. |
| `UX_LAYOUT.md` | Análise de responsividade de 2026-09-20 sem atualização. | Nota "o que mudou desde esta análise". |
| `ANALISE_MANUTENIBILIDADE.md` | Métricas de 2026-09-19 apresentadas como atuais. | Aviso de documento histórico, com os números atuais. |

## Achados novos, registrados em `pendencias.md` e não corrigidos

1. **Chaves divergentes** 📖:
   - Contextos: `planner_contexto` x `planner_contextos`;
   - Categorias de Atividade: `planner_atividade-categoria` x `planner_atividade_categoria`;
   - Hábitos: `planner_habito` x `planner_habitos`, também com campos diferentes.

   É o mesmo tipo de bug de Alarmes e Compras: o que se cadastra por uma tela não aparece em outra.
2. **Tailwind sem JIT** ✔: `text-[var(--text-secondary)]` sai com a cor principal, e no tema escuro as bordas ficam cinza-claro.
3. As telas **Relatórios** e **Exportar** estão inalcançáveis: não há item de menu nem botões de exportar CSV 📖.
4. O **"Gerar Relatório" do Diário** desenha numa tela escondida 📖.
5. Os **botões 🖨️** dos cards de dia não têm ação 📖.
6. Há **44 scripts avulsos** versionados na raiz, mais um arquivo com nome inválido, `C:tempserver.log`.

## Como foi verificado

- Os módulos em uso foram mapeados por busca dos `import` e dos `<script src>`.
- As chaves de storage foram levantadas em todo o código ativo, com os leitores e escritores de cada uma.
- A auditoria de classes Tailwind escapou cada token como seletor CSS e o procurou no `tailwind.css` e no `styles.css`, com uma checagem de sanidade.
- No navegador, foram lidas as cores computadas de elementos com `text-[var(--text-secondary)]` e `border-[var(--border-color)]`, nos temas claro e escuro.

## Plano de Rollback / Desfazer

É só documentação: `git checkout HEAD -- docs/ CLAUDE.md GEMINI.md` desfaz o que já estava versionado. `Sobre_extPlanner.md` pode ser restaurado a partir de `historico/Sobre_extPlanner_20260919_v2.0.md`.
