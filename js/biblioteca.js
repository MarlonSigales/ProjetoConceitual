/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * BIBLIOTECA DA EQUIPE E BUSCA DE PATENTES
 * - A biblioteca guarda os princípios de solução usados nos projetos da equipe (exporta/importa um .json) e passa a
 *   sugeri-los nas funções parecidas, junto com o catálogo.
 * - Cada princípio tem atalhos para buscar patentes (Google Patents, Espacenet) e o INPI.
 */

'use strict';

const BIB_CHAVE = 'pc_biblioteca';
const FORMATO_BIBLIOTECA = 'projeto-conceitual-biblioteca';

function lerBiblioteca() {
    try { const b = JSON.parse(localStorage.getItem(BIB_CHAVE) || 'null'); return b && Array.isArray(b.itens) ? b : { itens: [] }; }
    catch (e) { return { itens: [] }; }
}
function gravarBiblioteca(b) { try { localStorage.setItem(BIB_CHAVE, JSON.stringify(b)); return true; } catch (e) { return false; } }

/** Itens da biblioteca a partir de um projeto: cada princípio com a função a que serviu. */
function itensDoProjeto(p) {
    return p.estruturas.flatMap(est => funcoesFolha(est).flatMap(f => principiosDe(p, f.id).filter(x => x.nome && x.origem !== 'catalogo').map(x => ({
        funcao: f.nome, nome: x.nome, descricao: x.descricao, metodo: x.metodo, maturidade: x.maturidade, custo: x.custo,
        concorrentes: x.concorrentes, fonte: x.fonte, projeto: p.projeto.nome || ''
    }))));
}

/** Junta itens na biblioteca sem repetir (mesma função + mesmo princípio). Devolve quantos entraram. */
function juntarBiblioteca(b, itens) {
    const chave = i => semAcento(i.funcao) + '|' + semAcento(i.nome);
    const tem = new Set(b.itens.map(chave));
    let n = 0;
    itens.forEach(i => {
        if (!i || !i.nome || !i.funcao || tem.has(chave(i))) return;
        b.itens.push({ funcao: txt(i.funcao, 160), nome: txt(i.nome, 120), descricao: txt(i.descricao, 600), metodo: txt(i.metodo, 80),
            maturidade: MATURIDADES[i.maturidade] ? i.maturidade : '', custo: CUSTOS[i.custo] ? i.custo : '',
            concorrentes: lista(i.concorrentes).map(c => txt(c, 120)), fonte: txt(i.fonte, 400), projeto: txt(i.projeto, 160) });
        tem.add(chave(i)); n++;
    });
    return n;
}

/** Princípios da biblioteca para uma função (mesma função ou com 2+ palavras importantes em comum). */
function sugerirDaBiblioteca(nomeFuncao, limite = 8) {
    const b = lerBiblioteca();
    const alvo = semAcento(nomeFuncao);
    return b.itens.map(i => ({ i, k: semAcento(i.funcao) === alvo ? 10 : palavrasEmComum(i.funcao, nomeFuncao) }))
        .filter(x => x.k >= 2).sort((a, b) => b.k - a.k).slice(0, limite).map(x => x.i);
}

/** Endereços de busca de patentes para um princípio (com o nome da função para dar contexto). */
function linksPatentes(principio, funcao) {
    const q = [principio, funcao].filter(Boolean).join(' ');
    const e = encodeURIComponent(q);
    return {
        google: `https://patents.google.com/?q=${encodeURIComponent('(' + principio + ')')}${funcao ? '&q=' + encodeURIComponent('(' + funcao + ')') : ''}`,
        espacenet: `https://worldwide.espacenet.com/patent/search?q=${e}`,
        inpi: 'https://busca.inpi.gov.br/pePI/jsp/patentes/PatenteSearchBasico.jsp',
        consulta: q
    };
}

function htmlLinksPatentes(principio, funcao) {
    const lk = linksPatentes(principio, funcao);
    return `<p class="links-patentes">🔎 Buscar patentes: <a href="${escAttr(lk.google)}" target="_blank" rel="noopener">Google Patents</a> · <a href="${escAttr(lk.espacenet)}" target="_blank" rel="noopener">Espacenet</a> · <a href="${escAttr(lk.inpi)}" target="_blank" rel="noopener" title="No INPI, pesquise por: ${escAttr(lk.consulta)}">INPI</a></p>`;
}

/** Lê projetos (ZIP ou JSON do Projeto Conceitual) ou bibliotecas e devolve os itens. */
async function itensDeArquivo(arq) {
    if (/\.zip$/i.test(arq.name)) {
        const zip = await JSZip.loadAsync(arq);
        const f = zip.file('projeto-conceitual.json');
        if (!f) return [];
        return itensDoProjeto(normalizarProjeto(JSON.parse((await f.async('string')).replace(/^\uFEFF/, ''))));
    }
    const d = JSON.parse((await arq.text()).replace(/^\uFEFF/, ''));
    if (d && d.formato === FORMATO_BIBLIOTECA) return lista(d.itens);
    if (d && Array.isArray(d.estruturas)) return itensDoProjeto(normalizarProjeto(d));
    return [];
}

/** Endereço de uma biblioteca compartilhada (ex.: arquivo num repositório do GitHub, link "raw"). */
function urlBiblioteca() { try { return localStorage.getItem('pc_biblioteca_url') || ''; } catch (e) { return ''; } }
async function atualizarDaUrl(silencioso = false) {
    const u = urlBiblioteca();
    if (!u) return 0;
    try {
        const r = await fetch(u, { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        if (!d || d.formato !== FORMATO_BIBLIOTECA) throw new Error('o arquivo não é uma biblioteca de princípios');
        const b = lerBiblioteca(), n = juntarBiblioteca(b, d.itens);
        gravarBiblioteca(b);
        try { localStorage.setItem('pc_biblioteca_lida', new Date().toISOString()); } catch (e) { /* ok */ }
        return n;
    } catch (e) {
        if (!silencioso) throw new Error(`Não consegui ler a biblioteca compartilhada (${e.message}). Confira o endereço; links do Google Drive/OneDrive não deixam ler pelo navegador — use um arquivo público do GitHub (botão "Raw").`);
        return 0;
    }
}

Object.assign(ACOES, {
    'bib-varios': async () => {
        const el = $('#arq-varios'); el.value = '';
        const arqs = await new Promise(ok => { el.onchange = () => ok([...el.files]); el.click(); });
        if (!arqs.length) return;
        const b = lerBiblioteca();
        let n = 0, lidos = 0;
        for (const a of arqs) { try { const it = await itensDeArquivo(a); if (it.length) lidos++; n += juntarBiblioteca(b, it); } catch (e) { /* arquivo que não é projeto */ } }
        gravarBiblioteca(b); renderPagina(true);
        avisar(`${lidos} de ${arqs.length} arquivo(s) lidos; ${n} princípio(s) novo(s) na biblioteca.`, 'ok', 6000);
    },
    'bib-url': async () => {
        const u = prompt('Endereço da biblioteca compartilhada (arquivo .json público; ex.: link "Raw" de um repositório do GitHub). Deixe vazio para desligar.', urlBiblioteca());
        if (u === null) return;
        try { localStorage.setItem('pc_biblioteca_url', u.trim()); } catch (e) { /* ok */ }
        if (!u.trim()) { renderPagina(true); return; }
        const n = await atualizarDaUrl();
        renderPagina(true); avisar(`Biblioteca compartilhada lida: ${n} princípio(s) novo(s).`);
    },
    'bib-exportar': () => {
        const p = PC.p, b = { formato: FORMATO_BIBLIOTECA, versao: 1, geradoEm: new Date().toISOString(), itens: [] };
        juntarBiblioteca(b, lerBiblioteca().itens);
        juntarBiblioteca(b, itensDoProjeto(p));
        if (!b.itens.length) { avisar('Ainda não há princípios da equipe para exportar (os do catálogo não entram).', 'erro'); return; }
        baixarArquivo(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }), 'biblioteca-de-principios.json');
        avisar(`${b.itens.length} princípio(s) na biblioteca. Mande o arquivo para a equipe importar.`);
    },
    'bib-importar': async () => {
        const arq = await escolherArquivo('#arq-abrir');
        if (!arq) return;
        const itens = await itensDeArquivo(arq);
        if (!itens.length) throw new Error('Não achei princípios neste arquivo (use a biblioteca .json ou o ZIP de um projeto).');
        const b = lerBiblioteca(), n = juntarBiblioteca(b, itens);
        if (!gravarBiblioteca(b)) throw new Error('Não coube no navegador.');
        renderPagina(true);
        avisar(`${n} princípio(s) novo(s) na biblioteca da equipe. Eles aparecem como sugestão nas funções parecidas.`);
    },
    'bib-guardar': () => {
        const b = lerBiblioteca(), n = juntarBiblioteca(b, itensDoProjeto(PC.p));
        gravarBiblioteca(b); renderPagina(true);
        avisar(n ? `${n} princípio(s) deste projeto guardado(s) na biblioteca da equipe (neste navegador).` : 'Os princípios deste projeto já estão na biblioteca.');
    }
});

/** Cartão da biblioteca na etapa de princípios. */
function htmlCartaoBiblioteca() {
    if (urlBiblioteca() && !htmlCartaoBiblioteca.lido) { htmlCartaoBiblioteca.lido = true; atualizarDaUrl(true).then(n => { if (n) { avisar(`${n} princípio(s) novo(s) da biblioteca compartilhada.`); renderPagina(true); } }); }
    const n = lerBiblioteca().itens.length;
    return `<details class="card cartao-bib"><summary><h2>📚 Biblioteca da equipe <small>(${n} princípio${n === 1 ? '' : 's'})</small></h2></summary>
        <p class="nota">Princípios usados em projetos anteriores da equipe. Os que servem para funções parecidas aparecem como sugestão em cada função, junto com o catálogo.</p>
        <div class="botoes">
            <button type="button" class="btn btn-secondary btn-sm" data-acao="bib-guardar">Guardar os princípios deste projeto</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="bib-varios" title="Selecione vários ZIPs de projetos (ou bibliotecas) de uma vez">⬆ Juntar projetos antigos (.zip)</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="bib-importar">⬆ Importar biblioteca</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="bib-exportar">⬇ Exportar biblioteca</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="bib-url">🔗 Biblioteca compartilhada${urlBiblioteca() ? ' (ligada)' : ''}</button>
        </div>
        <p class="nota"><b>Melhor caminho para a equipe:</b> a <a href="#/inicio" data-acao="ir-nuvem">nuvem da equipe</a> (conta MEGA com senha) junta a biblioteca de todos os projetos sozinha.</p>
        <p class="nota">Sem nuvem: a biblioteca fica neste navegador. Para a equipe toda, guarde <b>um único arquivo</b> (Exportar) numa pasta compartilhada e cada um importa; importar de novo não duplica. Ou deixe o arquivo num repositório público do GitHub e ligue a "Biblioteca compartilhada": ela é lida sozinha ao abrir esta etapa.</p></details>`;
}
