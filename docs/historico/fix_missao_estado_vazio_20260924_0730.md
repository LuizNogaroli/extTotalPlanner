# Página de Missão sem "Educacional" e "Atualizar Missão" quando vazia

**Data/Hora:** 2026-09-24_07:30
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

`switchToMissaoView()` (`js/app.js`) passou a ter a mesma estrutura de `switchToVisaoView()`: uma barra de botões única, usada tanto no estado vazio quanto no estado com registros, e um `if/else` no lugar do `return` antecipado.

## Por que

Relato do usuário: "o botão de missão no sidebar não está carregando a página de conteúdo adequada, confira pois está diferente de visão".

**Reproduzido no navegador**, sem nenhuma Missão cadastrada:

| Página | O que aparecia |
| :--- | :--- |
| Missão | 🎲 Carregar dados de exemplo · "Nenhuma missão cadastrada ainda." |
| Visão | 📚 Educacional · ✏️ Atualizar Visão · "Nenhuma visão cadastrada ainda." |
| Valores | 📚 Educacional · ✏️ Atualizar Valores · "Nenhuma declaração de valores cadastrada ainda." |

**Causa:** no estado vazio, a Missão desenhava só o botão de dados de exemplo e fazia `return`. Consequências:
1. Sem "✏️ Atualizar Missão", não havia como cadastrar a **primeira** Missão pela tela.
2. Sem "📚 Educacional", a página educacional ficava inacessível.
3. O `return` pulava o registro dos listeners do Educacional e dos dois botões "Voltar" da página educacional.

**Origem:** a estrutura "texto + `return`" é a original da Missão. Quando a Visão foi criada "nos mesmos moldes" (v1.6), ela já saiu com os botões também no estado vazio, e a Missão ficou para trás. Em `3904e84` (2026-09-19), o botão "Carregar dados de exemplo" foi colocado no estado vazio da Missão, mas o `return` ficou.

## Estado Anterior

```javascript
if (missaoRecords.length === 0) {
    contentArea.innerHTML = `
        <div class="flex justify-end gap-3 mb-6">
            <button id="btn-seed-estrategicos" ...>🎲 Carregar dados de exemplo</button>
        </div>
        <div class="...">Nenhuma missão cadastrada ainda.</div>
    `;
    document.getElementById('btn-seed-estrategicos').addEventListener('click', seedDemoEstrategicos);
    return;
}
// ... estado com registros, com a barra de botões completa inline ...
// ... e um </div> sobrando no fim do template
```

## Estado Novo

```javascript
const botoesMissao = `
    <div class="flex justify-end gap-3 mb-6">
        <button id="btn-seed-estrategicos" ...>🎲 Carregar dados de exemplo</button>
        <button id="btn-educacional-missao" ...>📚 Educacional</button>
        <button id="btn-new-missao" ...>✏️ Atualizar Missão</button>
    </div>
`;

if (missaoRecords.length === 0) {
    contentArea.innerHTML = `${botoesMissao}<div class="...">Nenhuma missão cadastrada ainda.</div>`;
} else {
    // ... estado com registros, usando ${botoesMissao} ...
}
// listeners (Atualizar, dados de exemplo, Educacional, Voltar): sempre registrados
```

- O botão "🎲 Carregar dados de exemplo" continua **só na Missão**: foi colocado lá de propósito (`3904e84`), como o único ponto visível para `seedDemoEstrategicos()`, que popula Missão, Visão, Objetivos e Planos.
- Saiu o `</div>` sobrando do template com registros (a Visão não tem). Era inofensivo: o navegador ignorava a tag de fechamento sem par.

## Verificação (navegador, preview local)

- Estado vazio: "🎲 Carregar dados de exemplo · 📚 Educacional · ✏️ Atualizar Missão · Nenhuma missão cadastrada ainda."
- "📚 Educacional" abre a página educacional; "Voltar" do topo e do rodapé voltam para a Missão.
- "✏️ Atualizar Missão" abre o formulário "Definir Missão"; salvar grava em `planner_strategies` e a página passa a mostrar "Missão Atual" com o texto e a data. Com registro, os três botões continuam presentes.
- O `planner_strategies` foi restaurado ao valor de antes do teste; depois disso, a Missão voltou ao estado vazio correto.
- Objetivos e Valores conferidos no estado vazio: já tinham Educacional e Atualizar.
- Nenhum erro no console.

## Plano de Rollback

Reverter o commit desta mudança. Isso traz de volta o problema: sem nenhuma Missão cadastrada, a página não oferece como cadastrar a primeira.
