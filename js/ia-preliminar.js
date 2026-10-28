/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * PEDIDO PARA IA NO PROJETO PRELIMINAR
 * Monta um pedido para uma IA multiagente (com pesquisa na web) com o contexto do preliminar e um formato JSON fixo de
 * resposta ("projeto-preliminar-ia"). A importação só completa o que está vazio, nunca apaga; componentes e materiais
 * sugeridos entram também no banco da equipe. Preço só com fonte e data; sem fonte, fica "cotar".
 */

'use strict';

const IA_PRELIM_FORMATO = 'projeto-preliminar-ia';

function contextoIAPreliminar(p) {
    const est = estDoP(p), v = concepcaoEscolhida(p), pl = p.preliminar, t = tercosEspec(p);
    const nomeF = id => { const f = est && est.nos.find(n => n.id === id); return f ? `F${numeroFuncao(est, f.id)}` : ''; };
    const nomeFn = id => { const f = est && est.nos.find(n => n.id === id); return f ? f.nome : ''; };
    return {
        projeto: p.projeto.nome, tipo: TIPOS_PROJETO[p.tipoProjeto] ? TIPOS_PROJETO[p.tipoProjeto].nome : '', funcaoGlobal: p.funcaoGlobal.nome,
        concepcao: v ? { nome: v.nome, descricao: p.concepcao.descricao || v.descricao, evolucao: (p.selecao.evolucao || {})[v.id] || {} } : null,
        especificacoes: especsUsadas(p).map(e => ({ codigo: e.codigo, descricao: e.descricao, meta: e.meta, peso: Math.round((+e.peso || 0) * 1000) / 10, terco: t[e.id], determinante: !!pl.determinantes[e.id], comoAvaliar: e.avaliacao, custo: !!e.ehCusto })),
        envelope: pl.envelope, interfaces: pl.interfaces.map(i => ({ texto: i.texto, medida: i.medida })),
        portadores: pl.portadores.filter(x => x.papel !== 'auxiliar').map(x => ({ codigo: nomeF(x.funcId), funcao: nomeFn(x.funcId), portador: x.nome, papel: x.papel, parametro: x.parametro, material: x.material })),
        auxiliares: pl.portadores.filter(x => x.papel === 'auxiliar').map(x => ({ funcao: x.funcaoAux, peca: x.nome, especificacao: x.parametro })),
        leiautes: pl.leiautes.map(l => ({ nome: l.nome, arranjo: l.arranjo, dimensoes: l.dimensoes, massa: l.massa })),
        fmeaCriticos: (p.fmea || []).filter(l => fmeaCritico(l)).map(l => ({ modo: l.modo, efeito: l.efeito, causa: l.causa, acao: l.acao })),
        concorrentes: (p.concorrentes || []).map(c => c.nome).filter(Boolean),
        normasConhecidas: (p.referencias || []).filter(r => /\b(ISO|ABNT|NBR|IEC|ASTM|DIN)\b/.test(`${r.identificacao} ${r.titulo}`)).map(r => `${r.identificacao} ${r.titulo}`.trim()),
        bancoDaEquipe: (typeof lerComponentes === 'function' ? lerComponentes().itens : []).map(i => `${i.nome}${i.especificacao ? ' — ' + i.especificacao : ''}`).slice(0, 80),
        chavesDiretrizes: diretrizesDoTipo(p).map(d => ({ chave: d[0], item: d[1], pergunta: d[2] })),
        chavesVerificacao: VERIFICACAO.map(d => ({ chave: d[0], item: d[1], pergunta: d[2] }))
    };
}

function promptIAPreliminar(p) {
    const c = contextoIAPreliminar(p);
    const exemplo = {
        formato: IA_PRELIM_FORMATO, versao: 1,
        portadores: [{ codigo: 'F1', parametro: 'Ø 180 mm, 32 furos de 4 mm', material: 'Aço SAE 1020', processo: 'Corte a laser', justificativa: 'por que', fonte: 'https://…' }],
        auxiliares: [{ funcao: 'Vedar', peca: 'Anel O-ring NBR 70', especificacao: 'AS568-030', quantidade: 2 }],
        componentes: [{ tipo: 'componente', categoria: 'Vedação', nome: 'Anel O-ring NBR 70', especificacao: 'AS568-030', unidade: 'un', preco: null, dataPreco: '', fornecedor: 'Nome do fornecedor', cidade: '', fonte: 'https://…' }],
        interfaces: [{ texto: 'Tomada de potência (ISO 500)', medida: '540 rpm', fonte: '' }],
        diretrizes: [{ chave: 'montagem', resposta: 'nao', acao: 'trocar parafusos por encaixe rápido' }],
        verificacao: [{ chave: 'seguranca', resposta: 'sim', acao: '' }],
        modosFalha: [{ codigo: 'F2', modo: 'vazamento de vácuo', efeito: 'falhas na dosagem', causa: 'folga na vedação', s: 7, o: 5, d: 4, acao: 'teste de fumaça' }],
        planoEnsaio: { proposito: ['aprendizado', 'marco'], aproximacao: 'fisico', abrangencia: 'focado', variaveis: '', norma: '', respostas: '', analise: '' },
        adequacao: [{ especificacao: 'E1', valorEstimado: '', estado: '?', motivo: 'Falta teste ou ensaio' }],
        observacoes: 'riscos e pontos a confirmar'
    };
    return `# Pedido: apoio ao PROJETO PRELIMINAR (leiaute) — responder em JSON

Você vai trabalhar como uma equipe de 4 agentes. Pesquise na web quando puder e **cite a fonte** de cada dado técnico, norma, fornecedor ou preço. **Não invente**: sem fonte, deixe vazio (preço = null, "cotar").

1. **Engenheiro de projeto** — para cada portador (peça/conjunto) proponha o parâmetro característico (medidas que o definem), o material e o processo de fabricação, respeitando as especificações determinantes, o espaço disponível e as interfaces.
2. **Compras e padronização** — para as funções auxiliares (fixar, vedar, apoiar, proteger, conectar…) e peças compráveis, indique peças **padronizadas** (norma ou código de catálogo), preferindo as do banco da equipe; fornecedores no Brasil quando possível, com cidade, preço e data da cotação **somente com fonte**.
3. **Qualidade e ensaios** — responda às listas de diretrizes (DfX) e de verificação (Reis, 2003, Quadro 4.4) com "sim", "nao" ou "na" e uma ação para cada "nao"; aponte modos de falha (S, O, D de 1 a 10) e um plano de teste/ensaio com norma aplicável. Diferencie teste (verificação pontual de uma especificação) de ensaio (normatizado e repetido).
4. **Integrador** — junte tudo e responda **só com um bloco JSON** no formato do exemplo, usando os códigos (F1, E1…) e as chaves exatamente como dados abaixo. Estimativas de adequação: "ok", "x" ou "?" com motivo.

## Contexto do projeto
\`\`\`json
${JSON.stringify(c, null, 2)}
\`\`\`

## Formato da resposta (copie a estrutura; listas podem ter quantos itens forem necessários)
\`\`\`json
${JSON.stringify(exemplo, null, 2)}
\`\`\`

Regras: respostas em português; "chave" de diretrizes e verificação somente das listas chavesDiretrizes e chavesVerificacao; "resposta" somente "sim", "nao" ou "na"; "estado" somente "ok", "x" ou "?"; "proposito" somente aprendizado, comunicacao, integracao, marco; "aproximacao" fisico ou analitico; "abrangencia" completo ou focado.`;
}

/** Importa a resposta: completa só o que está vazio. Devolve um resumo do que entrou. */
function importarRespostaIAPreliminar(p, d) {
    if (!d || typeof d !== 'object') throw new Error('Resposta vazia.');
    if (!['portadores', 'auxiliares', 'componentes', 'diretrizes', 'verificacao', 'planoEnsaio', 'adequacao', 'interfaces', 'modosFalha'].some(k => d[k])) throw new Error('A resposta não está no formato pedido (faltam as listas "portadores", "diretrizes"…).');
    const pl = p.preliminar, est = estDoP(p), r = { portadores: 0, auxiliares: 0, componentes: 0, respostas: 0, falhas: 0, adequacao: 0, interfaces: 0, plano: 0 };
    const porCodigo = cod => { const f = est && funcoesFolha(est).find(n => `F${numeroFuncao(est, n.id)}` === String(cod || '').trim().toUpperCase()); return f ? f.id : null; };
    const vazio = v => v === undefined || v === null || String(v).trim() === '';
    lista(d.portadores).forEach(x => {
        const fid = porCodigo(x.codigo);
        const alvo = pl.portadores.find(y => (fid && y.funcId === fid) || (x.portador && semAcento(y.nome) === semAcento(x.portador)));
        if (!alvo) return;
        let mudou = false;
        ['parametro', 'material', 'processo'].forEach(k => { if (vazio(alvo[k]) && !vazio(x[k])) { alvo[k] = txt(x[k], 200); mudou = true; } });
        if (mudou) r.portadores++;
    });
    lista(d.auxiliares).forEach(x => {
        if (vazio(x.peca)) return;
        const ja = pl.portadores.find(y => y.papel === 'auxiliar' && (semAcento(y.nome) === semAcento(x.peca) || (x.funcao && semAcento(y.funcaoAux || '') === semAcento(x.funcao))));
        if (ja) { if (vazio(ja.parametro) && !vazio(x.especificacao)) { ja.parametro = txt(x.especificacao, 200); r.auxiliares++; } return; }
        pl.portadores.push({ id: uid('pt'), funcId: '', principioId: '', nome: txt(x.peca, 140), papel: 'auxiliar', funcaoAux: txt(x.funcao, 100), parametro: txt(x.especificacao, 200), material: '', processo: '', origem: 'comprado', fornecedor: '', qtd: +x.quantidade || 1, custo: null, imagem: null });
        r.auxiliares++;
    });
    if (lista(d.componentes).length && typeof lerComponentes === 'function') {
        const b = lerComponentes(), j = juntarComponentes(b, lista(d.componentes).map(c => Object.assign({}, c, { projeto: `${p.projeto.nome || ''} (IA)`, preco: c.fonte ? c.preco : null, dataPreco: c.fonte ? c.dataPreco : '' })));
        gravarComponentes(b); r.componentes = j.novos + j.atualizados;
        // fornecedor e preço das peças compradas, quando vierem
        lista(d.componentes).forEach(c => { pl.portadores.filter(x => x.origem === 'comprado' && semAcento(x.nome) === semAcento(c.nome || '')).forEach(x => { if (vazio(x.fornecedor) && c.fornecedor) x.fornecedor = txt(c.fornecedor, 120); if ((x.custo === null || x.custo === '') && c.preco !== null && c.preco !== undefined && c.fonte) x.custo = +c.preco; }); });
    }
    lista(d.interfaces).forEach(x => { if (vazio(x.texto) || pl.interfaces.some(i => semAcento(i.texto) === semAcento(x.texto))) return; pl.interfaces.push({ id: uid('if'), texto: txt(x.texto, 200), medida: txt(x.medida, 120) }); r.interfaces++; });
    const resposta = v => ({ sim: 'sim', nao: 'nao', 'não': 'nao', na: 'na' })[semAcento(String(v || '')).trim()] || '';
    [['diretrizes', diretrizesDoTipo(p)], ['verificacao', VERIFICACAO]].forEach(([campo, validas]) => {
        const chaves = new Set(validas.map(x => x[0]));
        lista(d[campo]).forEach(x => {
            if (!chaves.has(x.chave)) return;
            const o = pl[campo][x.chave] || (pl[campo][x.chave] = { r: '', acao: '' });
            let mudou = false;
            if (!o.r && resposta(x.resposta)) { o.r = resposta(x.resposta); mudou = true; }
            if (vazio(o.acao) && !vazio(x.acao)) { o.acao = txt(x.acao, 500); mudou = true; }
            if (mudou) r.respostas++;
        });
    });
    lista(d.modosFalha).forEach(x => {
        if (vazio(x.modo) || (p.fmea || []).some(l => semAcento(l.modo) === semAcento(x.modo))) return;
        const n = v => Math.min(10, Math.max(1, Math.round(+v) || 5));
        p.fmea.push({ id: uid('fm'), funcId: porCodigo(x.codigo) || '', modo: txt(x.modo, 200), efeito: txt(x.efeito, 300), causa: txt(x.causa, 300), s: n(x.s), o: n(x.o), d: n(x.d), acao: txt(x.acao, 300) });
        r.falhas++;
    });
    const pe = d.planoEnsaio || {}, pr = pl.prototipo;
    ['variaveis', 'norma', 'respostas', 'analise'].forEach(k => { if (vazio(pr[k]) && !vazio(pe[k])) { pr[k] = txt(pe[k], 1500); r.plano++; } });
    if (!pr.proposito.length && Array.isArray(pe.proposito)) pr.proposito = pe.proposito.filter(k => PROPOSITOS[k]);
    if (!pr.aproximacao && ['fisico', 'analitico'].includes(pe.aproximacao)) pr.aproximacao = pe.aproximacao;
    if (!pr.abrangencia && ['completo', 'focado'].includes(pe.abrangencia)) pr.abrangencia = pe.abrangencia;
    lista(d.adequacao).forEach(x => {
        const e = especsUsadas(p).find(s => s.codigo === x.especificacao || semAcento(s.descricao) === semAcento(x.especificacao || ''));
        if (!e) return;
        const a = pl.adequacao[e.id] || (pl.adequacao[e.id] = { valor: '', estado: '', motivo: '' });
        let mudou = false;
        if (vazio(a.valor) && !vazio(x.valorEstimado)) { a.valor = txt(x.valorEstimado, 60); mudou = true; }
        // a IA só estima: o resultado continua "?" até a equipe confirmar
        if (!a.estado) a.estado = '?';
        if (vazio(a.motivo) && a.estado === '?') { a.motivo = !vazio(a.valor) ? MOTIVO_CONFIRMAR : MOTIVOS_ADEQ.includes(x.motivo) ? x.motivo : ''; if (a.motivo) mudou = true; }
        if (mudou) r.adequacao++;
    });
    pl.ia = { importadoEm: new Date().toISOString(), observacoes: txt(d.observacoes, 2000) };
    return r;
}

function htmlCartaoIAPreliminar(p) {
    const ia = p.preliminar.ia;
    return `<section class="card cartao-ia" id="ia-prelim">
        <details><summary><b>🤖 Pedir ajuda a uma IA para o preliminar</b> — parâmetros, materiais, peças padronizadas e fornecedores, diretrizes, falhas e plano de ensaio</summary>
        <ol class="passos-ia">
            <li><b>Copie o pedido</b> (já leva todo o contexto deste projeto e o formato da resposta).
                <div class="botoes"><button type="button" class="btn btn-primary btn-sm" data-acao="iap-copiar">📋 Copiar o pedido</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="iap-baixar">⬇ Baixar como arquivo</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="iap-ver">Ver o pedido</button></div></li>
            <li><b>Cole na sua IA</b> (ChatGPT, Claude, Gemini… de preferência com pesquisa na web).</li>
            <li><b>Cole aqui a resposta</b> e importe. Só completa o que está vazio; peças e materiais sugeridos entram no banco da equipe.
                <textarea id="iap-resposta" rows="4" placeholder="Cole aqui a resposta da IA…" aria-label="Resposta da IA"></textarea>
                <div class="botoes"><button type="button" class="btn btn-primary btn-sm" data-acao="iap-importar">⇩ Importar a resposta</button></div></li>
        </ol>
        <pre id="iap-prompt" class="ia-prompt" hidden></pre>
        ${ia ? `<p class="nota">Última resposta importada em ${new Date(ia.importadoEm).toLocaleString('pt-BR')}.${ia.observacoes ? ` Observações da IA: <i>${esc(ia.observacoes.slice(0, 500))}</i>` : ''}</p>` : ''}
        </details>
    </section>`;
}

Object.assign(ACOES, {
    'iap-copiar': async () => {
        const t = promptIAPreliminar(PC.p);
        try { await navigator.clipboard.writeText(t); avisar('Pedido copiado. Cole na sua IA.'); }
        catch (e) { const pre = $('#iap-prompt'); pre.hidden = false; pre.textContent = t; avisar('Não deu para copiar sozinho: selecione o texto abaixo e copie.', 'erro'); }
    },
    'iap-baixar': () => baixarArquivo(new Blob([promptIAPreliminar(PC.p)], { type: 'text/markdown' }), `${nomeSeguro(PC.p.projeto.nome || 'projeto')}-pedido-ia-preliminar.md`),
    'iap-ver': () => { const pre = $('#iap-prompt'); pre.hidden = !pre.hidden; if (!pre.hidden) pre.textContent = promptIAPreliminar(PC.p); },
    'iap-importar': () => {
        const texto = ($('#iap-resposta') || {}).value || '';
        if (!texto.trim()) { avisar('Cole a resposta da IA na caixa.', 'erro'); return; }
        const r = importarRespostaIAPreliminar(PC.p, extrairJsonIA(texto));
        salvar(); renderPagina(true);
        avisar(`IA: ${r.portadores} portador(es) completado(s), ${r.auxiliares} peça(s) auxiliar(es), ${r.componentes} item(ns) no banco da equipe, ${r.respostas} resposta(s) de diretrizes/verificação, ${r.falhas} modo(s) de falha, ${r.adequacao} adequação(ões), ${r.plano} campo(s) do plano de ensaio. Revise.`, 'ok', 10000);
    }
});
