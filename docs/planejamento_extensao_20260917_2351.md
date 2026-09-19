# Planejamento: Extensão Chrome - Planner Digital

## 1. Visão Geral
**Objetivo:** Desenvolver uma extensão para o Google Chrome que vá muito além de um simples *planner* digital. O projeto funcionará como um hub de **planejamento estratégico, tático e operacional**. O objetivo é ajudar o usuário não apenas a gerenciar tarefas do dia a dia, mas garantir que essas ações estejam alinhadas com sua Missão, Visão e objetivos de curto, médio e longo prazo.

**Estratégia de Evolução:**
- **Fase 1 (Atual):** Extensão do Chrome funcionando de forma independente, utilizando o armazenamento local do navegador (`chrome.storage`), sem necessidade de backend. Foco em uma experiência rápida e fluida.
- **Fase 2 (Futura):** Plataforma web completa desenvolvida em PHP (Laravel) com banco de dados (MySQL/PostgreSQL), permitindo sincronização em nuvem, aplicativos mobile, e recursos avançados (compartilhamento, integrações, relatórios).

---

## 2. Arquitetura de Negócio e Funcionalidades (MVP)

A organização do planner será dividida nos seguintes módulos principais:

### 2.1. Área de Planejamento Estratégico (O "Porquê" e "Onde")
- **Fundamentos:** Definição de Missão e Visão.
- **Horizontes de Tempo:** Planejamento estruturado para Longo Prazo, Médio Prazo e Curto Prazo.
- **Versionamento de Histórico:** Para que o usuário não perca sua evolução de pensamento, as definições estratégicas adotarão o padrão de salvamento com timestamp: `nome_YYYY-MM-DD_HH:MM:SS` (Ex: `missao_2026-01-01_14:30:00`, `plan_longo_2026-02-15_09:15:00`). Assim, será possível consultar versões antigas.

### 2.2. Planejamento Tático e Operacional (O "Como" e "Quando")
- **Interface de Cadastro (Modais):** Todas as operações de CRUD (Missão, Visão, Tarefas, Pendências) serão feitas através de *Modais* flutuantes. Isso garante uma usabilidade perfeita e responsiva (Mobile-First), evitando redirecionamentos de página.
- **Lógica de Agendamento Flexível:**
  - *Tarefas/Ações:* Possuem Data de Cadastro e Data de Execução.
  - *Pendências e Tarefas Livres:* Podem ser agendadas para um dia específico (aparecendo no card do dia) ou agendadas para a *Semana* (ficando "soltas" num painel de planejamento flexível no topo da semana correspondente).
- **Organização Semanal (`w01` a `w52`):** O ano será mapeado estruturalmente em 52 semanas. 
  - *Convenção Adotada:* Usaremos a convenção tradicional/americana onde **o primeiro dia da semana é o Domingo**.
  - *Regra da Semana 1 (`w01`):* A semana 1 do ano será sempre definida como a semana que contém o dia **1º de Janeiro**. Se o dia 1º cair em uma quarta-feira, a semana 1 terá começado no domingo do ano anterior.
  - O cabeçalho da visão semanal sempre informará o intervalo exato (ex: *12/01 a 18/01*).
- **Organização Diária (`YYYY-MM-DD`):** O fluxo mais granular do planner. Cada dia terá o seu próprio contexto ou "arquivo" dedicado usando o formato exato de data, como `2026-01-01`.
- **Área de Tarefas Livres da Semana:** Abaixo do cabeçalho da semana, haverá um espaço dedicado para listar as atividades e pendências que precisam ser resolvidas naquela semana, mas que ainda não foram alocadas para um dia específico.

### 2.3. Módulo de Geração de Relatórios e Impressão (Físico/A4)
Para os usuários que gostam de tangibilizar o planejamento no papel, o sistema terá uma inteligência de exportação:
- **Relatório Semanal:** Um botão no cabeçalho da semana exportará um arquivo ou abrirá uma nova janela estilizada gerando o arquivo `wXX_relatorio.pdf` (ou uma view otimizada para impressão em A4). Esse relatório trará o "Foco da Semana" e um resumo enxuto dos 7 dias.
- **Relatório Diário:** Cada dia individual também terá a opção de impressão (`YYYY-MM-DD_relatorio`), perfeito para quem gosta de focar no Micro-Planejamento ou criar uma "Folha do Dia" para levar consigo em reuniões.
- A página de impressão terá um CSS isolado (`@media print`) para ignorar barras laterais e temas dark, focando em economizar tinta e manter a legibilidade no padrão A4.

### 2.4. Módulos Operacionais e Financeiros
Para dar suporte prático ao dia a dia, a extensão contará com listas e controles específicos:
- **Visualização em Accordion:** Na "Pele" de Lista Empilhada, os dias e o *Foco da Semana* operam como *Accordions* (usando HTML5 nativo `<details>` e `<summary>`). O usuário clica para expandir apenas o dia atual, reduzindo a sobrecarga cognitiva e focando no que importa.
- **Agendamento de Compromissos:** Registro de eventos e atividades que possuem data e horário específicos marcados.
- **Gestão de Ações e Pendências:**
  - *Coisas para Fazer:* Lista de atividades (programadas ou não) que ainda estão dentro do seu prazo ou aguardando execução.
  - *Pendências:* Atividades não realizadas no tempo correto e que "venceram", exigindo atenção imediata do usuário.
- **Controle Financeiro Básico:**
  - *Contas a Pagar:* Lista de despesas programadas, incluindo campo de valor estimado.
  - *Contas a Receber:* Entradas financeiras e recebimentos esperados, também com valor estimado.
- **Coisas para Comprar (Lista de Desejos e Monetização):**
  - Lista de intenções de compra separada por categorias (com um CRUD exclusivo para o usuário criar e gerenciar essas categorias).
  - Cada item incluirá o valor estimado da compra.
  - *Estratégia de Rentabilização:* A partir do que o usuário cadastrar nesta lista, a extensão terá uma área de "Sugestões de Compras" que exibirá produtos alinhados aos desejos cadastrados, contendo **links de nossos programas de afiliados**. Essa será uma das principais formas de rentabilizar a versão da extensão do Chrome.
- **Bloco de Notas / "Brain Dump":** Espaço para descarregar pensamentos e ideias de forma livre antes de categorizá-los.
- **Armazenamento de Dados:** Inicialmente usando a API `chrome.storage.local` para manter os registros de forma rápida, espelhando a hierarquia proposta.

### 2.4. Módulo de Desenvolvimento Pessoal e Conteúdo
Para enriquecer a experiência do público-alvo (focado em produtividade), a extensão também atuará como um hub de curadoria de conhecimento:
- **Biblioteca de Recomendações:** Uma estante virtual sugerindo livros consagrados sobre produtividade, gestão de tempo, negócios e desenvolvimento pessoal. Excelente oportunidade para integrar com programas de afiliados (ex: Amazon Associates).
- **Central de Artigos e Insights:** Uma área dedicada com links curados, resumos e dicas para leitura focados em estudos, saúde mental e produtividade. (Futuramente pode até se integrar via RSS ou API do próprio blog do projeto).

### 2.5. Funcionalidades de Produtividade Avançada (Roadmap Adicional)
Levantamento feito sobre os recursos mais desejados em ecossistemas de *Digital Planners* e *Notion Templates*:
- **Rastreador de Hábitos (Habit Tracker):** Um grid ou lista de checkboxes na visão semanal para o usuário acompanhar rotinas diárias (ex: meditar, exercícios, leitura).
- **Time Blocking (Blocos de Tempo):** Na visão diária, um recurso visual para alocar blocos de horários dedicados, evitando interrupções em tarefas de grande foco (*Deep Work*).
- **Páginas de Reflexão (Review/Reflection):** Ao final de cada semana e mês, um template de reflexão rápida (*O que deu certo? O que melhorar? Qual a prioridade da próxima semana?*), mantendo a engrenagem estratégica viva.
- **Notas de Áudio (Voice Notes):** Recurso nativo para gravar mensagens curtas de voz (um *Brain Dump* falado). Permite capturar ideias rapidamente sem a necessidade de digitação, deixando para que o usuário transcreva e categorize a informação no planner em um momento mais calmo.

---

## 3. Stack Tecnológica (Fase 1)
- **Frontend:** HTML5, CSS3, e JavaScript. 
- **Estilização:** Tailwind CSS (recomendado para acelerar o desenvolvimento de uma interface bonita e limpa) ou CSS puro.
- **Extensão:** Manifest V3 (padrão atual e obrigatório do Google Chrome).

---

## 4. Arquitetura Visando o Futuro (Integração com Laravel)
Para facilitar a migração ou integração com o futuro backend em Laravel, adotaremos as seguintes boas práticas desde o início:
- **Service Pattern para Dados:** Criaremos uma camada de abstração (ex: `StorageService.js`) para lidar com salvar/ler dados. Hoje ela salvará no `chrome.storage`. No futuro, bastará alterar esse arquivo para fazer chamadas via `fetch`/Axios para a API em Laravel.
- **Estrutura de Dados Clara:** Os objetos JSON salvos no navegador espelharão o que seriam as futuras tabelas do banco de dados (ex: `tasks`, `goals`, `notes`).

---

## 5. Diretrizes de Layout e Interface (UI/UX)
- **Layout Fluido (100% Width):** No ambiente Desktop (como página de "Nova Aba" do Chrome), a interface ocupará **100% da tela disponível**, tirando proveito do grande espaço para apresentar o *Dashboard* tático da semana ao lado dos recursos estratégicos, sem amontoar informações.
- **Responsividade e Mobile-First:** A estrutura visual deve ser planejada com flexibilidade total. À medida que a largura da tela diminui (simulando celulares ou tablets na versão Web/PWA futura), os painéis laterais devem se retrair ou virar abas, e os dias da semana (`wXX` para `YYYY-MM-DD`) devem ser empilhados verticalmente para garantir usabilidade com um dedo.

---

## 6. Painel de Configurações, Customização e Acessibilidade
Para garantir que a plataforma seja amigável e adaptável, o sistema deve ser construído com uma arquitetura onde **os Dados são completamente separados da Interface (Engine de Templates)**, similar ao funcionamento de temas no WordPress.

### 6.1. Motor de Templates ("Peles" / Skins)
- O usuário não ficará preso a uma única interface. A camada visual será modular, permitindo que a área de configurações altere o "Template" geral do planner (ex: mudar da *Visão Dashboard* para *Visão Colunas Kanban* ou *Visão Papelaria*).
- Esta arquitetura permitirá a evolução do projeto com a oferta futura de novos templates, podendo até abrir portas para uma loja ou galeria de designs criados pela comunidade.

### 6.2. Personalização Visual
- **Modo Claro / Escuro (Light & Dark Mode):** Alternância manual e automática (baseada no sistema do usuário).
- **Paleta de Cores:** Possibilidade de o usuário definir sua cor primária e de destaque, alterando botões, links e componentes.

### 6.3. Acessibilidade
- **Controle de Tamanho de Fonte:** Uma configuração vital. O usuário poderá alterar o tamanho global das fontes (Normal, Grande, Extra Grande) para atender a diferentes necessidades visuais sem que o layout seja "quebrado".

### 6.4. Internacionalização (i18n)
- **Suporte a Multi-idiomas:** O código não terá rótulos de interface "hardcoded". Será implementado um sistema de dicionários (ex: `pt-BR.json`, `en-US.json`). Ao alterar o idioma, a interface inteira traduz seus labels instantaneamente, o que prepara a extensão para o mercado global desde o dia 1.

---

## 7. Próximos Passos (Plano de Ação)
- [x] **Passo 1:** Configuração da Estrutura Base (`manifest.json` V3) e definição da arquitetura (separação clara entre Lógica de Dados e Camada de Apresentação/Templates).
- [x] **Passo 2:** Configuração do Core de Sistema: Dicionários de Idiomas (i18n), Gerenciador de Tema (Dark/Light mode) e Controle de Acessibilidade (Tamanho de fontes via variáveis CSS).
- [x] **Passo 3:** Desenvolvimento do *Template Padrão* (HTML/CSS responsivo, abrangendo 100% da tela no desktop e reorganização vertical no mobile), Engine SPA e Navegação Temporal (Árvore de Linha do Tempo).
- [ ] **Passo 4:** Integração de `chrome.storage.local` com o Service de Dados e Modal Global para CRUD (Criação de Tarefas/Missão).
- [ ] **Passo 5:** Criação das entidades principais (Semana `wXX`, Dias, Estratégia) conectando a interface.
- [ ] **Passo 6:** Implementação dos Módulos Avançados (Notas de Áudio, Controle Financeiro e Área de Afiliados/Compras).

---

## 8. Log de Desenvolvimento (Status Atual)
*Até a sessão atual (Setembro/2026), o sistema conta com a seguinte arquitetura funcional:*
1. **Engine SPA (Single Page Application):** Criamos roteamento nativo em `app.js` para alternar entre "Meu Planner" (Dashboard Semanal), "Agenda Diária" e "Configurações", aproveitando 100% da área da tela (sem frames ou recarregamentos).
2. **Navegação Temporal Dinâmica:** A barra lateral possui uma *Linha do Tempo* hierárquica (Ano > Mês > Semana > Dia). Apenas o período atual fica expandido por padrão graças ao motor de cálculo de datas que injeta nativamente `<details>` e `<summary>`.
3. **Peles e Templates:** A área de configurações central abriga os botões de layout, permitindo alternar de forma transparente entre o "Grid (Trello)" e a "Lista Empilhada" para a visão semanal.
4. **Visão Focada:** A Agenda Diária foi desenhada. Clicar em um dia específico (via menu lateral ou cabeçalho do Grid) esconde as obrigações semanais e foca na interface diária.
*Para logs completos de alteração (Reversibilidade), consulte o diretório `docs/historico/`.*
