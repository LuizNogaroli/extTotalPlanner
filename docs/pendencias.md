# Pendências e Ideias para Implementação Futura

Este arquivo compila as ideias, *features* de marketing e funcionalidades que foram discutidas para desenvolvimento nas próximas sessões.

## 1. Implementação Core (Técnica) Pendente
- [ ] Construir o esqueleto do **Modal Global de CRUD**, que será a janela central para cadastro de Ações, Tarefas e edição de Missão/Visão.
- [ ] Conectar a interface ao `StorageService.js` (salvamento real usando `chrome.storage.local`).
- [ ] **Integração com Google Calendar:** Pesquisar e implementar fluxo OAuth2 (via `chrome.identity`) para sincronizar eventos da agenda do usuário com o planejador diário.

## 2. Contextualização Hierárquica de Missão, Visão, Objetivos e Planos
- **Conceito:** Hoje Missão, Visão, Objetivos e os Planos (Anual/Mensal/Semanal) são únicos e globais (um texto "atual" por tipo, sem separação por área da vida). A ideia é criar um nível hierárquico **acima** de todos eles: o **Contexto** (ex.: Profissional, Familiar, Espiritual, e outros que o usuário queira criar).
- **Dinâmica:**
  - Cada Contexto passa a ter sua **própria** Missão, Visão, Objetivos (Curto/Médio/Longo Prazo) **e também seus próprios Planos** (Anual/Mensal/Semanal) — não um conjunto único compartilhado como é hoje.
  - Exemplo: Contexto "Profissional" → Missão, Visão, Objetivos e Planos (Anual/Mensal/Semanal) profissionais. Contexto "Familiar" → seu próprio conjunto completo. Contexto "Espiritual" → idem.
  - O usuário poderia alternar entre contextos (ex.: abas ou seletor no topo das seções Estratégico e Tático) para ver/editar cada conjunto separadamente.
- **Impacto técnico esperado (a avaliar quando for implementar):**
  - Muda o modelo de dados de `planner_strategies`: os registros de `missao`/`visao`/`obj_curto`/`obj_medio`/`obj_longo`/`plano_anual`/`plano_mensal`/`plano_semanal` precisariam ganhar uma dimensão `contexto` (ex.: `profissional`/`familiar`/`espiritual`), e as consultas por tipo (`s.type === 'missao'`) passam a precisar filtrar também por `s.contexto === '...'`.
  - Precisa de uma tela/fluxo para o usuário **cadastrar seus próprios contextos** (não só os três exemplos citados — Profissional, Familiar, Espiritual — mas permitir adicionar outros).
  - `switchToMissaoView`, `switchToVisaoView`, `switchToObjetivosView`, `switchToPlanosView`/`renderPlanoVersionado` e os respectivos formulários (`form-missao`, `form-visao`, `form-objetivos`, `form-plano_anual`, `form-plano_mensal`, `form-plano_semanal`) precisariam saber "em qual contexto estou agora" para filtrar e salvar corretamente.

### 2.1. Alinhamento de Atividades por Assunto/Projeto dentro dos Planos
- **Conceito:** Dentro dos Planos Anual, Mensal e Semanal, as atividades/marcos devem poder ser organizadas e alinhadas por **assunto** ou **projeto** — um agrupamento temático transversal, diferente do Contexto (área da vida). Exemplo: dentro do Plano Anual do Contexto Profissional, agrupar itens pelo projeto "Lançamento do Produto X" ou pelo assunto "Certificações".
- **Dinâmica (a definir em sessão futura):**
  - Avaliar se "Assunto/Projeto" vira uma entidade cadastrável própria (CRUD dedicado, no mesmo espírito de "Contextos/Papeis" já existente), atribuível a cada atividade/marco dos Planos.
  - Permitiria depois filtrar ou visualizar um Plano agrupado por projeto/assunto (ex.: ver tudo relacionado a "Produto X" espalhado entre o Plano Anual, Mensal e Semanal).
- **Observação:** Não confundir com Contexto. Contexto = área da vida (Profissional/Familiar/Espiritual). Assunto/Projeto = agrupamento temático **dentro** de um Contexto (ex.: dentro de "Profissional", os projetos "Produto X", "Certificação Y", etc.).

## 3. Motor de Tráfego Orgânico e Conteúdo (Growth/Marketing)
As seguintes ideias visam transformar o planner de uma ferramenta isolada para um vetor de compartilhamento em redes sociais, gerando tráfego orgânico para aquisição de novos usuários.

### 3.1. Repositório de Citações e Frases (O "Refrigério da Alma")
- **Conceito:** Um banco de dados colaborativo de frases motivacionais, referências bíblicas, citações de famosos, trechos de filmes e poemas.
- **Dinâmica:** 
  - Os usuários podem *cadastrar* novas frases no repositório geral e *consumir* frases de outras pessoas para inserir em seus próprios dias.
  - **Motor de Viralização:** Cada frase ou citação será formatada visualmente de forma agradável (como um "card" ou "quote") e terá um botão nativo de "Compartilhar nas Redes Sociais" (Instagram Stories, Twitter, WhatsApp). Esse compartilhamento sempre levará uma marca d'água ou link sutil (`via Total Planner Extension`), atuando como marketing orgânico.

### 3.2. Curadoria Diária: "Neste dia na História"
- **Conceito:** Na tela de **Agenda Diária**, haverá um espaço dedicado à curiosidades e conhecimento inútil agradável (ou reflexivo).
- **Conteúdo:** Fatos históricos relevantes, aniversários de lançamentos de filmes clássicos, marcos científicos, artes ou devocionais ligados especificamente àquele dia e mês (ex: "Em 18 de Setembro de 1950...").
- **Dinâmica de Viralização:** Assim como as citações, o objetivo é que essas pílulas de conhecimento se tornem alvo de posts em redes sociais. O usuário vê uma curiosidade legal logo de manhã e quer compartilhar com a rede dele, carregando consigo o link da extensão.

---
**Próximos Passos:** 
Amanhã, discutiremos se começamos pelo Modal de CRUD (prioridade operacional) ou se já desenhamos no layout diário o espaço que abrigará o módulo "Neste dia na História".
