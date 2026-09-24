# Omitir (Citação/Devocional) vira faixa mínima em vez de esconder a engrenagem

**Data/Hora:** 2026-09-24_06:45
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Nos boxes "✨ Citação" e "🙏 Devocional" da página do dia, o modo **Omitir** deixou de esconder o box inteiro. Agora o box vira uma **faixa mínima**, com o título, a engrenagem ⚙️ e o aviso "Oculto desde DD/MM" (a data do marco de Omitir). A faixa fica esmaecida e mais baixa, mas continua clicável, e é por ela que o usuário desfaz o Omitir.

## Por que

`pendencias.md` 1.9, achado ao repetir os testes da §3.26 na Fase 2 da refatoração (v1.51): o Omitir escondia o `#widget-container-<tipo>` inteiro, e a engrenagem — único lugar onde o modo é configurado — ficava dentro dele. A partir da data do marco, o box sumia junto com o controle que o traria de volta. O único caminho era abrir um dia anterior ao marco, que ninguém descobre sozinho.

Foram propostas duas saídas: (a) faixa mínima no lugar do box, ou (b) um "Mostrar de novo" em Configurações. O usuário escolheu a **(a)**. Raciocínio registrado em `UX_LAYOUT.md` (2026-09-24).

## Estado Anterior

`js/modules/citacao.js`, `renderCitacaoWidget()`:

```javascript
if (marker.modo === 'omitir') {
    container.style.display = 'none';
    return;
}
container.style.display = 'flex';
```

## Estado Novo

`js/modules/citacao.js`, `renderCitacaoWidget()`:

```javascript
container.style.display = 'flex';

// Omitir: o box não some — vira uma faixa mínima (título + engrenagem + aviso),
// porque a engrenagem é o único caminho para desfazer (pendencias.md 1.9).
container.classList.toggle('citacao-omitida', marker.modo === 'omitir');
if (marker.modo === 'omitir') {
    const desde = marker.dataInicio.split('-').reverse().slice(0, 2).join('/');
    contentEl.innerHTML = `<span class="citacao-omitida-aviso">Oculto desde ${desde}</span>`;
    itemExibido[tipo] = null;
    return;
}
```

`css/styles.css`, novo bloco "CITAÇÃO / DEVOCIONAL":

```css
.citacao-omitida { padding-top: 6px !important; padding-bottom: 6px !important; opacity: 0.7; }
.citacao-omitida > div:first-child { margin-bottom: 0 !important; }
.citacao-omitida:hover { opacity: 1; }
.citacao-omitida-aviso { font-size: 0.75rem; font-style: italic; color: var(--text-secondary); }
```

CSS próprio, e não classes do Tailwind, porque o build local é o v2 sem JIT (`MANUAL_TECNICO.md` §3.21). O `!important` no espaçamento é para vencer o `p-4` e o `mb-2` do Tailwind que já estão no HTML do box.

## Verificação (navegador, preview local)

Com o caso real que já estava salvo (Citação omitida desde 24/09):
- **Dia 24/09:** o box de Citação aparece como faixa (opacidade 0,7, 6px de espaçamento vertical), com a engrenagem visível e o texto "Oculto desde 24/09". O de Devocional, que não está omitido, continua normal (opacidade 1, 16px).
- **Engrenagem da faixa:** abre a configuração com "Omitir" marcado.
- **Desfazer:** trocar para Aleatório e salvar tira a classe e restaura o box normal com o botão "Ver", que abre uma mensagem.
- **Omitir de novo:** o box volta a ser faixa, sem sumir.
- **Dia anterior (20/09):** continua normal, sem a classe.
- A configuração de teste foi restaurada ao valor de antes, e não houve erros no console.

## Plano de Rollback

Em `js/modules/citacao.js`, voltar o trecho de Omitir para `container.style.display = 'none'; return;` antes de `container.style.display = 'flex'`, e tirar o `classList.toggle('citacao-omitida', …)`. Em `css/styles.css`, apagar o bloco "CITAÇÃO / DEVOCIONAL". Com isso, o problema do item 1.9 volta.
