# extPlanner - Manual de Visão, Conceito e Diretrizes Estratégicas

O **extPlanner** faz parte de uma coleção de soluções para problemas cotidianos por meio de extensões do Chrome. Este documento consolida a visão filosófica, a estrutura de funcionamento e os pilares de evolução do projeto, servindo como guia de referência e espaço para expansão de novas ideias.

---

## 1. Visão Geral e Propósito

### 1.1. O Conceito
A proposta do **extPlanner** é criar um planner digital que combine o melhor de dois mundos:
*   **A tangibilidade e o foco do papel:** Menos ruído, foco no essencial e clareza visual.
*   **O poder e a flexibilidade do digital:** Automações, buscas, versionamento histórico, portabilidade e inteligência de dados.

O objetivo principal é ajudar o usuário a conectar o **Macro** (sua razão de ser e grandes metas) com o **Micro** (o que precisa ser feito hoje, nesta hora).

---

## 1. Visão Geral e Propósito

### 1.1. O Conceito
A proposta do **extPlanner** é criar um planner digital que combine o melhor de dois mundos:
*   **A tangibilidade e o foco do papel:** Menos ruído, foco no essencial e clareza visual.
*   **O poder e a flexibilidade do digital:** Automações, buscas, versionamento histórico, portabilidade e inteligência de dados.

O objetivo principal é ajudar o usuário a conectar o **Macro** (sua razão de ser e grandes metas) com o **Micro** (o que precisa ser feito hoje, nesta hora).

### 1.2. A Vida por Contextos (Papeis e Cenários)
O ser humano atua como um ator desempenhando diferentes **papeis** em diferentes cenários (ex: Trabalho, Marido, Filho, Irmão, Pai, Estudante, etc.). 
*   **Diretriz:** Nenhuma atividade existe de forma descontextualizada.
*   **Implementação:** O sistema permite o CRUD de **Contextos/Papeis**. Toda atividade deve ser associada a um contexto. 
*   **Tags:** O contexto funciona como uma tag estruturante. No modal de criação de atividade, o usuário define o contexto ou pode criá-la sem contexto inicial para edição posterior. Isso garante que a visualização dos Planos (Anual, Mensal, Semanal) possa ser filtrada ou agrupada pela vida do usuário em seus diversos papeis.

---

## 2. A Pirâmide do Planejamento (A Almejada Clareza)

A estrutura do extPlanner é hierárquica, garantindo que nenhuma tarefa diária exista no vácuo, mas sim como um desdobramento direto das metas estratégicas do usuário.

```
       ▲  [NÍVEL 1: ESTRATÉGICO] Missão, Visão e Valores (O Porquê)
      ▲▲  [NÍVEL 2: HORIZONTES] Planejamento de Longo, Médio e Curto Prazo (O Onde)
     ▲▲▲  [NÍVEL 3: TÁTICO] Planos Anuais, Mensais e Semanais (O Como e Quando)
    ▲▲▲▲  [NÍVEL 4: OPERACIONAL] Gestão Diária (A Execução/Timeline/Time Blocking)
```

### 2.1. Nível 1: Estratégico (Missão, Visão e Valores)
*   **Definição:** O usuário cadastra sua declaração de Missão pessoal/profissional e sua Visão de futuro.
*   **Inovação - Versionamento Histórico:**
    *   Toda alteração nesses campos não sobrescreve o registro anterior. Em vez disso, gera um novo registro salvo no formato: `missao_YYYY-MM-DD_HH-mm-ss`.
    *   Uma interface dedicada exibe uma tabela descrescente com as versões anteriores.
    *   **Por que isso é importante?** Permite ao usuário observar a evolução de sua maturidade, o aumento de clareza e o refinamento de seus objetivos de vida ao longo dos anos.

### 2.2. Nível 2: Horizontes de Tempo (Objetivos de Longo, Médio e Curto Prazo)
*   **Longo Prazo:** Metas para 5 a 10 anos.
*   **Médio Prazo:** Metas para 2 a 3 anos.
*   **Curto Prazo:** Metas para o ano corrente.
*   *Nota:* Assim como a Missão/Visão, os objetivos de longo, médio e curto prazo também utilizam o sistema de versionamento com timestamp para acompanhar a evolução do planejamento.

### 2.3. Nível 3: Tático (Desdobramento em Planos Temporais)
A partir dos objetivos estabelecidos, o usuário os divide em blocos acionáveis:
*   **Plano Anual:** Grandes marcos do ano.
*   **Plano Mensal:** Focos específicos de cada mês.
*   **Plano Semanal:** O coração do planejamento operacional.
    *   Mapeia o ano em 52 semanas estruturadas (`w01` a `w52`).
    *   Oferece uma "Área de Tarefas Livres" (atividades da semana que ainda não têm dia específico para acontecer).
    *   Permite a distribuição dessas tarefas para os dias da semana de forma visual.

### 2.4. Nível 4: Operacional (O Dia a Dia)
*   **Agenda Diária (`YYYY-MM-DD`):** Fluxo granular com timeline, tarefas, controle de hábitos e notas.
*   As atividades podem ser arrastadas e alocadas em horários específicos (Time Blocking).

---

## 3. Módulos e Funcionalidades Core (Existentes ou em Progresso)

Para dar suporte prático a essa filosofia, o extPlanner integra os seguintes módulos:

*   **Rastreador de Hábitos (Habit Tracker):** Acompanhamento de rotinas integradas à visualização semanal/diária.
*   **Gestão de Pendências e Vencidos:** Tarefas não concluídas que transitam de forma inteligente para que o usuário não as perca de vista.
*   **Controle Financeiro Essencial:** Contas a pagar e a receber com estimativas de valores.
*   **Lista de Desejos / Coisas para Comprar:** Organizada por categorias editáveis, servindo como base de monetização futura por meio de links de afiliados.
*   **Bloco de Notas / "Brain Dump":** Espaço rápido para descarregar pensamentos e ideias antes de serem organizados.
*   **Engine de Impressão (A4):** Capacidade de gerar relatórios semanais (`wXX_relatorio.pdf`) e diários formatados para papel, permitindo que o usuário imprima e trabalhe fisicamente quando preferir.

---

## 4. Seção para Ampliação de Ideias (Rascunhos e Novidades)

*Use esta seção para registrar novas ideias, insights ou detalhes de funcionalidades que surgirem ao longo do desenvolvimento.*

### 4.1. Ideias de Integração e Ecossistema (Futuro)
*   *(Exemplo: Integração com Google Calendar ou Outlook para sincronizar compromissos operacionais)*
*   *(Exemplo: Extensão do Chrome capaz de capturar páginas da web e enviar direto para o "Brain Dump" como notas de referência)*
*   *(Espaço livre: Digite aqui suas ideias de integração...)*

### 4.2. Ideias de Gamificação e Recompensas
*   *(Exemplo: Sistema de conquistas/badges ao completar hábitos recorrentes por 7, 30 ou 100 dias consecutivos)*
*   *(Espaço livre: Digite aqui suas ideias de gamificação...)*

### 4.3. Detalhes de Layout e UI/UX Desejados
*   *(Exemplo: Transições suaves ao expandir os accordions dos dias na visualização semanal)*
*   *(Espaço livre: Digite aqui os detalhes visuais ou de usabilidade...)*

### 4.4. Recursos Esquecidos / Ajustes Futuros
*   *(Use esta subseção para listar qualquer elemento do planejamento tradicional de papel que ainda não foi mapeado no planner digital)*
*   *(Espaço livre: Digite aqui os recursos esquecidos...)*

---

## 5. Documentação Técnica Relacionada

Para manter a separação saudável entre a **visão de produto** (negócio) e os **detalhes de código** (programação), as especificações técnicas, arquivos correspondentes e padrões de engenharia reutilizáveis foram organizados em um manual dedicado.

*   Consulte o documento: **[Manual de Arquitetura e Soluções Técnicas (docs/MANUAL_TECNICO.md)](MANUAL_TECNICO.md)** para entender detalhadamente quais arquivos cuidam de cada funcionalidade, como o código foi implementado e quais soluções podem ser copiadas para novos projetos.

---

## 6. Histórico de Versões do Documento

Como desenvolvedores, valorizamos rastrear como a clareza e as soluções amadureceram. Abaixo está o registro cronológico das versões deste documento. Versões anteriores completas podem ser acessadas na pasta `docs/historico/`.

| Versão | Data/Hora (Timestamp) | Responsável | Resumo das Alterações / Evolução da Clareza | Arquivo de Histórico |
| :---: | :--- | :--- | :--- | :--- |
| **1.0** | 2026-09-17_23-50-00 | Desenvolvedor (User) | Redação conceitual inicial contendo as ideias fundamentais, a pirâmide de planejamento e a premissa de versionamento com timestamp. | `historico/Sobre_extPlanner_20260919_original.md` |
| **2.0** | 2026-09-19_15-45-00 | Gemini CLI & User | Reestruturação completa do documento em seções formais, detalhamento de módulos, adição de áreas de ampliação e criação do link com o Manual Técnico. | *Este arquivo (Versão Atual)* |
