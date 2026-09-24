# Resíduo de Mojibake: três `U+008F` removidos do `index.html`

**Data/Hora:** 2026-09-24_07:00
**Responsável:** Claude Code (Opus 5.5) & User

## O que foi feito

Removidos do `index.html` três caracteres de controle `U+008F`, que apareciam na tela como um "▯" logo depois de três emojis:

| Linha | Onde | Emoji |
| :--- | :--- | :--- |
| ~119 | Menu lateral, "Configurações" | `⚙️` |
| ~220 | Widget "Hábitos" da página do dia | `✔️` |
| ~257 | Título do box "Devocional" da página do dia | `🙏` |

## Por que

Notado no screenshot do teste da v1.52 (faixa mínima do Omitir): um "▯" ao lado de "🙏 DEVOCIONAL" e de "⚙ Configurações". O mesmo caractere já tinha causado problema na v1.47, quando o `Edit` não conseguiu casar a linha do título do Devocional por causa de um byte invisível.

**Origem:** a reversão de mojibake da v1.5 (`MANUAL_TECNICO.md` §3.9) usava um *fallback* para bytes que não existem na tabela CP1252, entre eles o `0x8F`. Os três emojis afetados terminam justamente nesse byte — `🙏` é `F0 9F 99 8F`, e `⚙️`/`✔️` terminam em `EF B8 8F` (o seletor de variação `U+FE0F`) —, e a reversão deixou o byte final duplicado, regravado como `C2 8F` (`U+008F`). Por isso basta apagar o `U+008F`: o emoji que fica é o correto.

## Estado Anterior

- `⚙️` + `U+008F` + " Configurações", `✔️` + `U+008F` + " Hábitos", `🙏` + `U+008F` + " Devocional".
- Na tela, um "▯" depois de cada emoji.

## Estado Novo

- Os três textos começam pelo emoji correto: `U+2699 U+FE0F` (⚙️), `U+2714 U+FE0F` (✔️), `U+1F64F` (🙏).
- A troca foi feita em Node, lendo e gravando como UTF-8 e preservando o BOM e as quebras CRLF do `index.html`; o `git diff` mostra só as três linhas.

## Verificação

- Varredura de `U+008F` em todos os arquivos versionados `.html`/`.js`/`.css`/`.json`/`.md`: **só havia esses três**, todos no `index.html`.
- No navegador: os três elementos têm os code points esperados, nenhum `U+008F` no DOM, e o "▯" sumiu da tela (título do Devocional e menu Configurações conferidos por screenshot).

## Plano de Rollback

Reverter o commit desta mudança. Não há motivo funcional para isso: os caracteres removidos eram lixo de uma conversão de encoding.
