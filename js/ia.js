/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * PESQUISA COM IA (multiagente): monta um pacote (prompt + contexto + imagens) para qualquer assistente de IA
 * (ChatGPT, Claude, Gemini, Copilot…) pesquisar princípios de solução a partir dos concorrentes, de patentes e da
 * literatura, e devolver um JSON num formato fixo, que esta ferramenta importa direto para a matriz morfológica.
 */

'use strict';

const IA_FORMATO = 'projeto-conceitual-ia';

function slug(t, n = 40) { return nomeSeguro(t).slice(0, n) || 'item'; }

/** Contexto estruturado do projeto para a IA (vai como contexto.json e resumido no prompt). */
function contextoIA(p) {
    const est = PC.estrutura ? (p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0]) : null;
    const folhas = funcoesFolha(est);
    const fluxosDe = (f) => {
        if (!est) return { entradas: [], saidas: [] };
        const nivel = ligacoesDoNivel(est, f.pai);
        const nome = id => String(id).startsWith('porta:') ? 'fronteira' : (est.nos.find(n => n.id === id) || {}).nome || '?';
        return {
            entradas: nivel.filter(l => l.para === f.id).map(l => `${TIPOS_FLUXO[l.tipo]}: ${l.rotulo || '—'} (de ${nome(l.de)})`),
            saidas: nivel.filter(l => l.de === f.id).map(l => `${TIPOS_FLUXO[l.tipo]}: ${l.rotulo || '—'} (para ${nome(l.para)})`)
        };
    };
    const arvore = [];
    if (est) {
        const visita = (id, prof) => funcoesFilhas(est, id).forEach(f => { arvore.push({ codigo: 'F' + numeroFuncao(est, f.id), nome: f.nome, nivel: prof, elementar: !funcoesFilhas(est, f.id).length }); visita(f.id, prof + 1); });
        const g = noGlobal(est); if (g) visita(g.id, 1);
    }
    return {
        formato: 'projeto-conceitual-contexto', versao: 1,
        projeto: p.projeto.nome, cliente: p.projeto.cliente,
        tipoProjeto: TIPOS_PROJETO[p.tipoProjeto] ? TIPOS_PROJETO[p.tipoProjeto].nome : 'não informado',
        problema: p.formulacao,
        funcaoGlobal: { nome: p.funcaoGlobal.nome, entradas: p.funcaoGlobal.entradas, saidas: p.funcaoGlobal.saidas },
        especificacoes: p.especificacoes.map(e => ({ codigo: e.codigo, especificacao: e.descricao, meta: e.meta, sentido: { up: 'quanto maior melhor', down: 'quanto menor melhor', none: 'valor-alvo' }[e.sentido], pesoPercentual: Math.round((e.peso || 0) * 1000) / 10, custo: !!e.ehCusto })),
        necessidades: p.necessidades.map(n => ({ necessidade: n.descricao, pesoPercentual: Math.round((n.peso || 0) * 1000) / 10 })),
        restricoes: p.restricoes.map(r => r.texto).filter(Boolean),
        concorrentes: p.concorrentes.map(c => ({ nome: c.nome, melhorQueNos: p.necessidades.filter(n => (c.notas[n.id] || 0) > (p.notasNosso[n.id] || 0)).map(n => n.descricao), piorQueNos: p.necessidades.filter(n => c.notas[n.id] && (c.notas[n.id] || 0) < (p.notasNosso[n.id] || 0)).map(n => n.descricao) })),
        estadoDaTecnica: p.referencias.map(r => ({ tipo: r.tipo, identificacao: r.identificacao, titulo: r.titulo, resumo: r.resumo, link: r.link })),
        estruturaDeFuncoes: arvore,
        funcoesElementares: folhas.map(f => ({
            codigo: 'F' + numeroFuncao(est, f.id), funcao: f.nome, ...fluxosDe(f),
            especificacoesLigadas: p.especificacoes.filter(e => funcoesDaEspec(est, e).some(x => x.id === f.id || ancestrais(est, f.id).some(a => a.id === x.id))).map(e => e.descricao),
            principiosJaLevantados: principiosDe(p, f.id).map(x => ({ nome: x.nome, descricao: x.descricao, origem: ORIGENS_PRINCIPIO[x.origem] || '', imagem: x.imagem ? arquivoImagemIA(est, f, x) : '' }))
        }))
    };
}

function arquivoImagemIA(est, f, x) { return `imagens/F${numeroFuncao(est, f.id)}-${slug(x.nome, 30)}`; } // a extensão vem do tipo da imagem

/** Texto do prompt (multiagente), em português, com o formato de resposta. */
function promptIA(p) {
    const c = contextoIA(p);
    const lista = (arr, f) => arr.length ? arr.map(f).join('\n') : '- (nenhum)';
    const temImg = c.funcoesElementares.some(f => f.principiosJaLevantados.some(x => x.imagem)) || p.concepcao.imagens.length;
    const exemploCod = (c.funcoesElementares[0] || {}).codigo || 'F1';
    return `# Pesquisa de princípios de solução — projeto conceitual
Projeto: **${c.projeto || 'sem nome'}**${c.cliente ? ` · Cliente: ${c.cliente}` : ''} · Tipo: ${c.tipoProjeto}

Você vai trabalhar como uma **equipe de 4 agentes**. Se a sua plataforma permite vários agentes (ou pesquisa profunda / navegação na web), rode os agentes 1, 2 e 3 em paralelo e o 4 no fim. Se não permite, faça as 4 etapas em sequência, uma depois da outra. **Use pesquisa na web** sempre que puder.

## Agentes
1. **Agente de concorrentes** — para cada função elementar, descubra **como os concorrentes resolvem** essa função (os da lista abaixo e outros produtos do mercado). Use catálogos, manuais, fotos e vídeos dos fabricantes. Diga qual concorrente usa qual princípio.
2. **Agente de patentes e literatura** — procure em Google Patents, Espacenet, INPI e artigos científicos (Google Acadêmico, ScienceDirect, IEEE, MDPI) princípios diferentes dos de mercado. Cite a patente ou o artigo.
3. **Agente especialista (${c.tipoProjeto})** — proponha princípios por outros efeitos físicos e tecnologias novas (métodos discursivos: catálogos de projeto, TRIZ, esquemas de classificação; e intuitivos: analogias, sistemas naturais).
4. **Agente integrador e crítico** — junte tudo, **tire repetições**, descarte o que fere as especificações ou as restrições, ordene os princípios **do mais adequado para o menos adequado** em cada função, classifique a maturidade, aponte incompatibilidades entre princípios de funções diferentes e monte **3 concepções** (uma combinação por concepção, bem diferentes entre si). No fim, confira se o JSON está válido.

## O problema
${c.problema || '(sem formulação)'}

**Função global:** ${c.funcaoGlobal.nome || '—'}
- Entradas: ${fluxosTexto(c.funcaoGlobal.entradas)}
- Saídas: ${fluxosTexto(c.funcaoGlobal.saidas)}

## Especificações de projeto (do QFD; peso = importância)
${lista(c.especificacoes, e => `- ${e.codigo ? e.codigo + ' ' : ''}${e.especificacao}${e.meta ? ` — meta ${e.meta}` : ''} (${e.sentido}; peso ${e.pesoPercentual}%)${e.custo ? ' [custo]' : ''}`)}

## Necessidades dos clientes
${lista(c.necessidades, n => `- ${n.necessidade} (peso ${n.pesoPercentual}%)`)}

## Restrições
${lista(c.restricoes, r => `- ${r}`)}

## Concorrentes (use-os como base)
${lista(c.concorrentes, k => `- **${k.nome}**${k.melhorQueNos.length ? ` — os clientes acham melhor que o nosso em: ${k.melhorQueNos.join('; ')}` : ''}${k.piorQueNos.length ? ` — pior em: ${k.piorQueNos.join('; ')}` : ''}`)}
${c.concorrentes.length ? 'Descubra os princípios de solução que fazem esses concorrentes serem melhores nos pontos citados.' : 'Não há concorrentes cadastrados: identifique os principais produtos do mercado para este problema.'}

## Estado da técnica já levantado
${lista(c.estadoDaTecnica, r => `- [${r.tipo || 'ref.'}] ${[r.identificacao, r.titulo].filter(Boolean).join(' — ')}${r.resumo ? `: ${r.resumo}` : ''}${r.link ? ` (${r.link})` : ''}`)}

## Estrutura de funções
${lista(c.estruturaDeFuncoes, f => `${'  '.repeat(f.nivel - 1)}- ${f.codigo} ${f.nome}${f.elementar ? '' : ' (desdobrada)'}`)}

## Funções elementares — pesquise princípios para CADA UMA
${c.funcoesElementares.map(f => `### ${f.codigo} ${f.funcao}
${f.entradas.length ? `- Entra: ${f.entradas.join('; ')}\n` : ''}${f.saidas.length ? `- Sai: ${f.saidas.join('; ')}\n` : ''}${f.especificacoesLigadas.length ? `- Especificações ligadas: ${f.especificacoesLigadas.join('; ')}\n` : ''}- Já levantados pela equipe (não repita; pode complementar): ${f.principiosJaLevantados.length ? f.principiosJaLevantados.map(x => x.nome + (x.imagem ? ` [foto: ${x.imagem}]` : '')).join('; ') : 'nenhum'}`).join('\n\n')}
${temImg ? `
## Imagens anexadas
As imagens anexadas (pasta \`imagens/\` e \`esbocos/\` do pacote) mostram princípios e esboços que a equipe já considerou; o nome do arquivo começa pelo código da função. **Olhe as imagens** para entender o que já existe e proponha alternativas diferentes.` : ''}

## Regras
- Responda em português do Brasil.
- De 3 a 6 princípios por função, **fisicamente diferentes** entre si (não só marcas diferentes do mesmo princípio).
- Não invente: fabricantes, patentes, artigos e links precisam existir. Se não tiver certeza, deixe o campo vazio.
- "imagemUrl" só com link direto de uma imagem que existe (foto do produto, figura da patente); senão, deixe vazio.
- "maturidade": "mercado" (existe pronto para comprar), "adaptar" (existe, mas precisa adaptar) ou "desenvolver" (precisa ser desenvolvido).
- "custo": custo relativo do princípio para este produto — "baixo", "medio" ou "alto".
- "metodo": um destes — Pesquisa bibliográfica; Análise de sistemas naturais; Análise de sistemas técnicos existentes; Analogias; Medições e testes em modelos; Brainstorming; Método 635; Método Delphi; Sinergia; Analogia direta; Analogia simbólica; Combinação de métodos; Estudo sistemático de sistemas técnicos; Esquemas de classificação; Catálogo de projeto; TRIZ; Matriz morfológica.
- Use exatamente os códigos das funções (${exemploCod}, …).

## Formato da resposta (obrigatório)
Termine a resposta com **um único bloco JSON** neste formato (o sistema importa esse bloco direto para a matriz morfológica):

\`\`\`json
{
  "formato": "${IA_FORMATO}",
  "versao": 1,
  "concorrentes": [
    { "nome": "Nome do produto/fabricante", "descricao": "o que é", "fonte": "link" }
  ],
  "funcoes": [
    {
      "codigo": "${exemploCod}",
      "funcao": ${JSON.stringify((c.funcoesElementares[0] || {}).funcao || 'nome da função')},
      "principios": [
        {
          "nome": "Nome curto do princípio",
          "descricao": "Como funciona, em uma ou duas frases",
          "metodo": "Análise de sistemas técnicos existentes",
          "concorrentes": ["Produto que usa este princípio"],
          "maturidade": "mercado",
          "custo": "baixo",
          "vantagens": "…",
          "desvantagens": "…",
          "fonte": "link ou referência (patente, artigo, catálogo)",
          "imagemUrl": ""
        }
      ]
    }
  ],
  "incompatibilidades": [
    { "a": "F1 :: nome do princípio", "b": "F2 :: nome do princípio", "motivo": "por que não funcionam juntos" }
  ],
  "concepcoes": [
    { "nome": "Nome da concepção", "ideia": "a ideia em uma frase", "escolhas": { "${exemploCod}": "nome do princípio escolhido" } }
  ],
  "observacoes": "riscos, lacunas, sugestões"
}
\`\`\`
`;
}

function fluxosTexto(f) {
    const partes = Object.keys(TIPOS_FLUXO).filter(t => (f[t] || []).length).map(t => `${TIPOS_FLUXO[t]}: ${f[t].join(', ')}`);
    return partes.length ? partes.join(' · ') : '—';
}

/** Pacote ZIP para a IA: prompt.md, contexto.json, imagens dos princípios e esboços, LEIA-ME. */
async function montarPacoteIA(p) {
    const zip = new JSZip();
    const est = PC.estrutura ? (p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0]) : null;
    zip.file('prompt.md', promptIA(p));
    zip.file('contexto.json', JSON.stringify(contextoIA(p), null, 2));
    for (const f of funcoesFolha(est)) {
        for (const x of principiosDe(p, f.id).filter(y => y.imagem)) {
            const r = await Imagens.ler(x.imagem);
            if (r && r.blob) zip.file(arquivoImagemIA(est, f, x) + '.' + extensao(r.tipo), r.blob);
        }
    }
    for (const im of p.concepcao.imagens) {
        const r = await Imagens.ler(im.id);
        if (r && r.blob) zip.file(`esbocos/${slug(im.legenda || im.id)}.${extensao(r.tipo)}`, r.blob);
    }
    zip.file('LEIA-ME.txt', [
        'COMO USAR ESTE PACOTE',
        '1. Abra um assistente de IA (ChatGPT, Claude, Gemini, Copilot…). De preferência com pesquisa na web / pesquisa profunda ligada.',
        '2. Anexe as imagens das pastas imagens/ e esbocos/ (se houver) e o arquivo contexto.json.',
        '3. Copie todo o texto de prompt.md e cole como mensagem.',
        '4. Quando a IA terminar, copie a resposta inteira (ou só o bloco JSON do fim).',
        '5. No Sistema de Projeto Conceitual, etapa "Princípios de solução", cole em "Colar a resposta da IA" e clique em Importar.'
    ].join('\n'));
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/** Acha o JSON na resposta (com ou sem ```json, com texto antes e depois). */
function extrairJsonIA(texto) {
    const t = String(texto || '').replace(/^﻿/, '');
    const blocos = [...t.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(m => m[1]);
    const candidatos = blocos.reverse().concat([t]);
    for (const c of candidatos) {
        const i = c.indexOf('{'), j = c.lastIndexOf('}');
        if (i < 0 || j <= i) continue;
        try { return JSON.parse(c.slice(i, j + 1)); } catch (e) {
            try { return JSON.parse(c.slice(i, j + 1).replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"')); } catch (e2) { /* tenta o próximo */ }
        }
    }
    throw new Error('Não achei um JSON válido na resposta. Copie a resposta inteira da IA (ou o bloco que começa com { e termina com }).');
}

/**
 * Importa a resposta da IA: princípios por função (pelo código F… ou pelo nome), concorrentes, incompatibilidades
 * e concepções. Não apaga nada; princípio com o mesmo nome é completado. Devolve um resumo.
 */
function importarRespostaIA(p, dados) {
    if (!dados || typeof dados !== 'object' || !Array.isArray(dados.funcoes)) throw new Error('A resposta não está no formato pedido (falta a lista "funcoes").');
    const est = PC.estrutura ? (p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0]) : null;
    const folhas = funcoesFolha(est);
    const porCodigo = new Map(folhas.map(f => [('F' + numeroFuncao(est, f.id)).toUpperCase(), f]));
    const acharF = (cod, nome) => porCodigo.get(String(cod || '').trim().toUpperCase().replace(/^(?!F)/, 'F'))
        || folhas.find(f => semAcento(f.nome) === semAcento(nome || ''))
        || folhas.find(f => nome && semAcento(f.nome).includes(semAcento(nome)));
    const r = { principios: 0, completados: 0, semFuncao: [], concorrentes: 0, incompatibilidades: 0, concepcoes: 0, imagens: [] };
    const metodosValidos = Object.values(METODOS_BUSCA).flatMap(g => g.itens);
    dados.funcoes.forEach(fx => {
        const f = acharF(fx.codigo, fx.funcao);
        if (!f) { r.semFuncao.push(fx.codigo || fx.funcao || '?'); return; }
        const l = principiosDe(p, f.id);
        lista(fx.principios).forEach(px => {
            const nome = txt(px.nome, 120).trim();
            if (!nome) return;
            const campos = {
                descricao: txt(px.descricao, 600), metodo: metodosValidos.find(m => semAcento(m) === semAcento(px.metodo || '')) || txt(px.metodo, 80),
                concorrentes: lista(px.concorrentes).map(c => txt(c, 120)).filter(Boolean), maturidade: MATURIDADES[px.maturidade] ? px.maturidade : '', custo: CUSTOS[semAcento(px.custo || '')] ? semAcento(px.custo) : '',
                vantagens: txt(px.vantagens, 400), desvantagens: txt(px.desvantagens, 400), fonte: txt(px.fonte, 400),
                imagemUrl: /^https?:\/\/\S+$/i.test(String(px.imagemUrl || '').trim()) ? String(px.imagemUrl).trim().slice(0, 600) : ''
            };
            const ja = l.find(x => semAcento(x.nome) === semAcento(nome));
            if (ja) {
                Object.entries(campos).forEach(([k, v]) => { if (Array.isArray(v) ? v.length && !ja[k].length : v && !ja[k]) ja[k] = v; });
                r.completados++;
                if (ja.imagemUrl && !ja.imagem) r.imagens.push(ja);
                return;
            }
            const novo = Object.assign({ id: uid('pr'), nome, imagem: null, sugerido: true, origem: 'ia' }, campos);
            l.push(novo); r.principios++;
            if (novo.imagemUrl) r.imagens.push(novo);
        });
    });
    // concorrentes
    lista(dados.concorrentes).forEach(c => {
        const nome = txt(c && c.nome, 120).trim();
        if (!nome || p.concorrentes.some(x => semAcento(x.nome) === semAcento(nome))) return;
        p.concorrentes.push({ id: uid('cc'), nome, descricao: txt(c.descricao, 300), fonte: txt(c.fonte, 400), notas: {}, origem: 'ia' });
        r.concorrentes++;
    });
    // "F1 :: nome" → princípio
    const acharP = (ref) => {
        const [cod, ...resto] = String(ref || '').split('::');
        const nome = resto.join('::').trim() || cod.trim();
        const fs = resto.length ? [acharF(cod.trim(), '')].filter(Boolean) : folhas;
        for (const f of fs) { const x = principiosDe(p, f.id).find(y => semAcento(y.nome) === semAcento(nome)); if (x) return x; }
        return null;
    };
    lista(dados.incompatibilidades).forEach(i => {
        const a = acharP(i && i.a), b = acharP(i && i.b);
        if (!a || !b || a.id === b.id || incompativeis(p, a.id, b.id)) return;
        p.incompatibilidades.push({ id: uid('ic'), a: a.id, b: b.id, nota: txt(i.motivo, 200) });
        r.incompatibilidades++;
    });
    lista(dados.concepcoes).forEach(cx => {
        const escolhas = {};
        Object.entries((cx && cx.escolhas) || {}).forEach(([cod, nome]) => {
            const f = acharF(cod, cod);
            if (!f) return;
            const x = principiosDe(p, f.id).find(y => semAcento(y.nome) === semAcento(nome));
            if (x) escolhas[f.id] = x.id;
        });
        if (!Object.keys(escolhas).length) return;
        const v = novaVariante(p, escolhas);
        v.nome = 'IA: ' + txt(cx.nome || v.nome, 50); v.descricao = txt(cx.ideia, 300);
        r.concepcoes++;
    });
    p.ia = { importadoEm: new Date().toISOString(), resumo: txt(dados.observacoes, 2000) };
    return r;
}

/** Tenta guardar as imagens indicadas pela IA (muitos sites bloqueiam: aí fica só o link). */
async function baixarImagensIA(itens) {
    let ok = 0;
    for (const x of itens) {
        try {
            const resp = await fetch(x.imagemUrl, { mode: 'cors' });
            if (!resp.ok) continue;
            const blob = await resp.blob();
            if (!/^image\//.test(blob.type)) continue;
            x.imagem = await Imagens.salvar(new File([blob], 'ia.' + (blob.type.split('/')[1] || 'jpg'), { type: blob.type }), x.nome);
            ok++;
        } catch (e) { /* bloqueado pelo site: fica o link */ }
    }
    return ok;
}

/** Cartão "Pesquisar com IA" (usado nas etapas de princípios e matriz). */
function htmlCartaoIA(p, compacto = false) {
    const ultima = p.ia && p.ia.importadoEm ? `<p class="nota">Última resposta importada em ${new Date(p.ia.importadoEm).toLocaleString('pt-BR')}.${p.ia.resumo ? ` Observações da IA: <i>${esc(p.ia.resumo.slice(0, 400))}</i>` : ''}</p>` : '';
    if (compacto) return `<section class="card cartao-ia"><div class="card-topo"><h2>🤖 Pesquisar com IA</h2><a class="btn btn-secondary btn-sm" href="#/principios">Abrir em Princípios de solução →</a></div>
        <p class="nota">Gere um pacote para uma IA pesquisar concorrentes, patentes e novos princípios e montar concepções; a resposta volta direto para esta matriz.</p>${ultima}</section>`;
    return `<section class="card cartao-ia">
        <h2>🤖 Pesquisar com IA (concorrentes, patentes, novas ideias)</h2>
        <ol class="passos-ia">
            <li><b>Baixe o pacote</b> (pedido pronto + fotos + contexto) ou só copie o pedido.
                <div class="botoes"><button type="button" class="btn btn-primary btn-sm" data-acao="ia-pacote">⬇ Baixar pacote para a IA</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="ia-copiar">📋 Copiar o pedido</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="ia-ver">Ver o pedido</button></div></li>
            <li><b>Abra a sua IA</b> (ChatGPT, Claude, Gemini, Copilot… de preferência com pesquisa na web), anexe as fotos e o contexto.json do pacote e cole o pedido.</li>
            <li><b>Cole aqui a resposta</b> da IA (inteira, ou só o bloco JSON) e clique em Importar.
                <textarea id="ia-resposta" rows="4" placeholder="Cole aqui a resposta da IA…" aria-label="Resposta da IA"></textarea>
                <div class="botoes"><button type="button" class="btn btn-primary btn-sm" data-acao="ia-importar">⇩ Importar a resposta</button></div></li>
        </ol>
        <pre id="ia-prompt" class="ia-prompt" hidden></pre>
        ${ultima}
    </section>`;
}

Object.assign(ACOES, {
    'ia-pacote': async () => {
        const p = PC.p;
        if (!funcoesFolha(PC.estrutura()).length) { avisar('Monte primeiro a estrutura de funções.', 'erro'); return; }
        const blob = await montarPacoteIA(p);
        baixarArquivo(blob, `${nomeSeguro(p.projeto.nome || 'projeto')}-pacote-ia.zip`);
        avisar('Pacote baixado: abra o LEIA-ME.txt dentro dele.');
    },
    'ia-copiar': async () => {
        const t = promptIA(PC.p);
        try { await navigator.clipboard.writeText(t); avisar('Pedido copiado. Cole na sua IA.'); }
        catch (e) { const pre = $('#ia-prompt'); pre.hidden = false; pre.textContent = t; avisar('Não deu para copiar sozinho: selecione o texto abaixo e copie.', 'erro'); }
    },
    'ia-ver': () => { const pre = $('#ia-prompt'); pre.hidden = !pre.hidden; if (!pre.hidden) pre.textContent = promptIA(PC.p); },
    'ia-importar': async () => {
        const texto = ($('#ia-resposta') || {}).value || '';
        if (!texto.trim()) { avisar('Cole a resposta da IA na caixa.', 'erro'); return; }
        const r = importarRespostaIA(PC.p, extrairJsonIA(texto));
        salvar();
        renderPagina(true);
        avisar(`IA: ${r.principios} princípio(s) novo(s), ${r.completados} completado(s), ${r.concorrentes} concorrente(s), ${r.incompatibilidades} incompatibilidade(s), ${r.concepcoes} concepção(ões).${r.semFuncao.length ? ` Funções não encontradas: ${r.semFuncao.join(', ')}.` : ''}`, 'ok', 9000);
        if (r.imagens.length) {
            const n = await baixarImagensIA(r.imagens);
            if (n) { salvar(); renderPagina(true); }
            avisar(`${n} de ${r.imagens.length} imagem(ns) da IA guardada(s)${n < r.imagens.length ? '; as outras ficam como link (o site não deixa baixar)' : ''}.`, 'ok', 7000);
        }
    }
});
