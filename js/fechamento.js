/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * FIM DO PROJETO PRELIMINAR: LEIAUTE DEFINITIVO E RELATÓRIO
 * Reis (2003): 3.3.1 otimizar e completar (eliminar os pontos fracos achados no caminho, aproveitar o que era bom nos
 * leiautes descartados) e 3.3.3 lista de partes preliminar e documentos para produção → leiaute definitivo.
 * Spagnolo (2011): etapas 10 (análise e discussão dos resultados) e 11 (relatórios, artigos e patentes).
 * Sigales (2025): lista de peças definitiva, documentos de montagem, uso e segurança; trabalhos futuros; instrumentos
 * criados no projeto também podem ser patenteados (o sensor de pressão da tese foi depositado).
 */

'use strict';

ETAPAS_PRELIM.push(['p-fechamento', 'P7', 'Leiaute definitivo e relatório']);

const DOCUMENTOS = [
    ['lista', 'Lista de partes (peças, quantidades, materiais, fornecedores)', p => p.preliminar.portadores.length > 0 && p.preliminar.portadores.every(x => x.nome && (x.origem === 'comprado' || x.material))],
    ['conjunto', 'Desenhos de conjunto e das peças principais (CAD), com as versões', null],
    ['montagem', 'Instruções de montagem', null],
    ['uso', 'Manual de uso e de segurança', null],
    ['manutencao', 'Plano de manutenção (peças de desgaste, intervalos)', null],
    ['testes', 'Registro dos testes e ensaios (resultados, fotos, datas)', p => p.preliminar.prototipo.ciclo.length > 0 && p.preliminar.prototipo.ciclo.every(c => c.situacao === 'feito')]
];
const DECISOES_PATENTE = { depositar: 'Depositar antes de publicar', sigilo: 'Manter em sigilo (segredo industrial)', publicar: 'Sem novidade patenteável: publicar', avaliar: 'Avaliar com o NIT da instituição' };

/** Pontos fracos achados no caminho (3.3.1), montados sozinhos a partir das etapas anteriores. */
function pontosFracosPreliminar(p) {
    const pl = p.preliminar, out = [], t = tercosEspec(p);
    const add = (chave, origem, texto, acao = '') => out.push({ chave, origem, texto, acao });
    const lt = pl.leiautes.find(l => l.id === pl.leiauteEscolhido);
    if (lt) especsUsadas(p).filter(e => t[e.id] === 'superior' && +lt.notas[e.id] >= 1 && +lt.notas[e.id] <= 2).forEach(e => add('lt-' + e.id, 'Leiaute', `Nota ${lt.notas[e.id]} em "${e.descricao}" (terço superior)`));
    diretrizesDoTipo(p).forEach(([k, n]) => { const d = pl.diretrizes[k] || {}; if (d.r === 'nao') add('dir-' + k, 'Diretriz', n, d.acao); });
    VERIFICACAO.forEach(([k, n]) => { const d = pl.verificacao[k] || {}; if (d.r === 'nao') add('ver-' + k, 'Verificação', n, d.acao); });
    (p.fmea || []).filter(l => fmeaCritico(l)).forEach(l => add('fm-' + l.id, 'FMEA', `${l.modo} (RPN ${rpn(l)})`, l.acao));
    especsUsadas(p).forEach(e => { const a = pl.adequacao[e.id] || {}; if (a.estado === 'x') add('ad-' + e.id, 'Especificação', `Não atende: ${e.descricao}${e.meta ? ' (meta ' + e.meta + ')' : ''}`, a.motivo); });
    pl.prototipo.ciclo.filter(c => c.situacao === 'reprovou').forEach(c => add('cy-' + c.id, 'Teste', `${c.etapa} reprovou${c.notas ? ': ' + c.notas : ''}`));
    return out;
}

/** Pré-preenche o fechamento a partir do que já foi feito. Nunca apaga. */
function preencherFechamento(p) {
    const pl = p.preliminar, f = pl.fechamento, lt = pl.leiautes.find(l => l.id === pl.leiauteEscolhido), feitos = [];
    if (lt) {
        const d = f.definitivo;
        if (!d.dimensoes && lt.dimensoes) d.dimensoes = lt.dimensoes;
        if (!d.massa && lt.massa) d.massa = lt.massa;
        if (!d.imagem && lt.imagem) d.imagem = lt.imagem;
        if (!d.descricao) {
            d.descricao = `${lt.nome}${lt.arranjo ? ' — arranjo: ' + lt.arranjo.toLowerCase() : ''}. ` +
                pl.portadores.filter(x => x.papel !== 'auxiliar').map(x => `${x.nome}${x.parametro ? ' (' + x.parametro + ')' : ''}`).join('; ') + '.' + (lt.obs ? ' ' + lt.obs : '');
            feitos.push('descrição do leiaute definitivo a partir do leiaute escolhido');
        }
    }
    if (!f.incorporar) {
        const desc = pl.leiautes.filter(l => l.id !== pl.leiauteEscolhido && (l.obs || l.arranjo));
        if (desc.length) f.incorporar = desc.map(l => `${l.nome}: ${[l.arranjo, l.obs].filter(Boolean).join(' — ')}`).join('\n');
    }
    DOCUMENTOS.forEach(([k, , auto]) => { if (auto && f.documentos[k] === undefined && auto(p)) f.documentos[k] = true; });
    return feitos;
}

function rascunhoAnalise(p) {
    const pl = p.preliminar, esp = especsUsadas(p), t = tercosEspec(p);
    const cont = { ok: 0, x: 0, '?': 0 };
    esp.forEach(e => { cont[(pl.adequacao[e.id] || {}).estado || '?']++; });
    const sup = esp.filter(e => t[e.id] === 'superior');
    const supOk = sup.filter(e => (pl.adequacao[e.id] || {}).estado === 'ok');
    const lt = pl.leiautes.find(l => l.id === pl.leiauteEscolhido);
    const ciclo = pl.prototipo.ciclo, feitos = ciclo.filter(c => c.situacao === 'feito').length;
    const meta = esp.find(e => e.ehCusto);
    return [
        `O leiaute escolhido foi "${lt ? lt.nome : '—'}"${lt && lt.arranjo ? ' (' + lt.arranjo.toLowerCase() + ')' : ''}, entre ${pl.leiautes.length} leiaute(s) avaliado(s) por critérios técnicos e econômicos.`,
        `Das ${esp.length} especificações, ${cont.ok} foram atendidas, ${cont.x} não foram atendidas e ${cont['?']} ainda não foram avaliadas ou confirmadas; no terço superior de importância, ${supOk.length} de ${sup.length} estão atendidas.`,
        `O protótipo cumpriu ${feitos} de ${ciclo.length} passos do ciclo de construção e testes; custo do protótipo: ${reais(custoPrototipo(p).total)}.`,
        `A lista de partes soma ${reais(custoLista(p))}${meta ? ` para a meta de ${meta.meta}` : ''}.`,
        pontosFracosPreliminar(p).filter(x => !(pl.fechamento.pontos[x.chave] || {}).resolvido).length ? `Ainda há ${pontosFracosPreliminar(p).filter(x => !(pl.fechamento.pontos[x.chave] || {}).resolvido).length} ponto(s) fraco(s) em aberto (ver trabalhos futuros).` : 'Os pontos fracos identificados foram tratados.'
    ].join(' ');
}
function rascunhoTrabalhosFuturos(p) {
    const pl = p.preliminar, linhas = [];
    especsUsadas(p).forEach(e => { const a = pl.adequacao[e.id] || {}; if (a.estado !== 'ok') linhas.push(`- ${a.estado === 'x' ? 'Resolver' : 'Verificar'} "${e.descricao}"${e.meta ? ' (meta ' + e.meta + ')' : ''}${a.motivo ? ': ' + a.motivo.toLowerCase() : ''}.`); });
    pontosFracosPreliminar(p).filter(x => !(pl.fechamento.pontos[x.chave] || {}).resolvido && x.origem !== 'Especificação').forEach(x => linhas.push(`- ${x.origem}: ${x.texto}${x.acao ? ' → ' + x.acao : ''}.`));
    return linhas.join('\n');
}

function pendenciasFechamento(p) {
    const out = [], add = (nivel, texto) => out.push({ nivel, texto, etapa: 'p-fechamento' });
    if (!p.preliminar.iniciado) return out;
    const f = p.preliminar.fechamento;
    const abertos = pontosFracosPreliminar(p).filter(x => !(f.pontos[x.chave] || {}).resolvido);
    if (abertos.length) add('media', `${abertos.length} ponto(s) fraco(s) sem marcar como resolvido (3.3.1).`);
    if (!f.definitivo.descricao || (!f.definitivo.dimensoes && !f.definitivo.imagem)) add('alta', 'Descreva o leiaute definitivo (descrição, dimensões e imagem).');
    const docs = DOCUMENTOS.filter(([k]) => !f.documentos[k]);
    if (docs.length) add('media', `Documentos para a produção ainda não prontos: ${docs.length} de ${DOCUMENTOS.length}.`);
    if (!f.analise.trim()) add('media', 'Escreva a análise e discussão dos resultados (há um rascunho automático).');
    if (!f.patente.busca) add('info', 'Faça a busca de anterioridade antes de publicar (links na página).');
    if (f.patente.busca && !f.patente.decisao) add('media', 'Registre a decisão sobre patente antes de publicar.');
    return out;
}

/** Seções do fechamento no relatório do preliminar. */
function secoesFechamento(p, img) {
    const pl = p.preliminar;
    if (!pl || !pl.iniciado) return [];
    const f = pl.fechamento, pf = pontosFracosPreliminar(p);
    return [
        ['Otimização e pontos fracos', pf.length ? `<table><thead><tr><th>Origem</th><th>Ponto fraco</th><th>Ação</th><th>Situação</th></tr></thead><tbody>${pf.map(x => { const r = f.pontos[x.chave] || {}; return `<tr><td>${esc(x.origem)}</td><td>${esc(x.texto)}</td><td>${esc(r.acao || x.acao || '')}</td><td>${r.resolvido ? '<span class="ok">resolvido</span>' : '<span class="nok">em aberto</span>'}</td></tr>`; }).join('')}</tbody></table>` : '<p>Nenhum ponto fraco registrado.</p>'
            + (f.incorporar ? `<p><b>Aproveitado dos leiautes descartados:</b> ${esc(f.incorporar).replace(/\n/g, '<br>')}</p>` : '')],
        ['Leiaute definitivo', `<p>${esc(f.definitivo.descricao || '—')}</p><p><b>Dimensões gerais:</b> ${esc(f.definitivo.dimensoes || '—')} · <b>Massa:</b> ${esc(f.definitivo.massa || '—')}</p>
            ${f.definitivo.imagem && img ? `<figure>${img(f.definitivo.imagem, 'Leiaute definitivo')}<figcaption>Leiaute definitivo</figcaption></figure>` : ''}
            <h3>Documentos para a produção</h3><ul>${DOCUMENTOS.map(([k, n]) => `<li>${f.documentos[k] ? '✓' : '☐'} ${esc(n)}</li>`).join('')}</ul>`],
        ['Análise e discussão dos resultados', `<p>${esc(f.analise || '—').replace(/\n/g, '<br>')}</p>`],
        ['Trabalhos futuros', f.trabalhosFuturos ? `<p>${esc(f.trabalhosFuturos).replace(/\n/g, '<br>')}</p>` : '<p>—</p>'],
        ['Propriedade intelectual', `<p>Busca de anterioridade: ${f.patente.busca ? 'feita' : 'não feita'}. ${f.patente.novidade ? 'Possível novidade: ' + esc(f.patente.novidade) + '. ' : ''}Decisão: ${esc(DECISOES_PATENTE[f.patente.decisao] || '—')}. ${esc(f.patente.obs || '')}</p>`]
    ];
}

PAGINAS['p-fechamento'] = {
    titulo: 'Leiaute definitivo e relatório',
    sub: 'Último passo do preliminar: eliminar os pontos fracos, fechar o leiaute definitivo e os documentos (Reis, 2003, tarefas 3.3.1 e 3.3.3), analisar os resultados, decidir sobre patente e gerar o relatório do projeto preliminar (Spagnolo, 2011, etapas 10 e 11).',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const feitos = preencherFechamento(p);
        if (feitos.length) salvar();
        const pl = p.preliminar, f = pl.fechamento, pf = pontosFracosPreliminar(p), v = concepcaoEscolhida(p), est = estDoP(p);
        const lt = pl.leiautes.find(l => l.id === pl.leiauteEscolhido);
        const env = [pl.envelope.c, pl.envelope.l, pl.envelope.a].map(numeroDe);
        const dims = (typeof envelopeDe === 'function' ? envelopeDe(f.definitivo.dimensoes) : null);
        const cabe = dims && env.every(x => x !== null) ? ['c', 'l', 'a'].every((k, i) => +dims[k] <= env[i]) : null;
        const pend = pendenciasFechamento(p);
        const principios = est && v ? funcoesFolha(est).map(fn => acharPrincipio(p, v.escolhas[fn.id])).filter(Boolean) : [];
        return `${pend.length ? `<ul class="pendencias pendencias-pagina">${pend.map(x => `<li class="pend-${x.nivel}"><span class="pend-sinal">${x.nivel === 'alta' ? '!' : x.nivel === 'media' ? '•' : 'i'}</span><span>${esc(x.texto)}</span></li>`).join('')}</ul>` : '<p class="etapa-selo-ok pendencias-pagina">✓ Nada pendente: gere o relatório.</p>'}
        <section class="card">
            <h2>1. Otimizar: eliminar os pontos fracos (3.3.1)</h2>
            <p class="nota">Juntados sozinhos das etapas anteriores (leiaute, diretrizes, verificação, FMEA, especificações e testes). Marque o que foi resolvido; se algo exigir mudar o leiaute, volte à etapa e repita (execução recursiva).</p>
            ${pf.length ? `<div class="tabela-rolagem"><table class="tabela tabela-check"><thead><tr><th>Origem</th><th>Ponto fraco</th><th>Ação</th><th>Resolvido?</th></tr></thead><tbody>
                ${pf.map(x => { const r = f.pontos[x.chave] || {}; return `<tr class="${r.resolvido ? '' : 'linha-alerta'}"><td><b>${esc(x.origem)}</b></td><td>${esc(x.texto)}</td>
                <td><input type="text" data-campo="preliminar.fechamento.pontos.${x.chave}.acao" value="${escAttr(r.acao || x.acao || '')}" maxlength="400" aria-label="Ação"></td>
                <td class="col-centro"><input type="checkbox" data-campo="preliminar.fechamento.pontos.${x.chave}.resolvido" data-rerender ${r.resolvido ? 'checked' : ''} aria-label="Resolvido"></td></tr>`; }).join('')}</tbody></table></div>` : vazio('Nenhum ponto fraco encontrado nas etapas anteriores.')}
            <label class="campo-participantes">Bons pontos dos leiautes descartados para aproveitar <textarea rows="2" data-campo="preliminar.fechamento.incorporar" maxlength="1500">${esc(f.incorporar)}</textarea></label>
        </section>
        <section class="card">
            <h2>2. Leiaute definitivo (3.3.3)</h2>
            <p class="nota">Vem do leiaute escolhido${lt ? ` (<b>${esc(lt.nome)}</b>)` : ''}; atualize com o que mudou nos testes e na otimização.</p>
            <div class="grade-campos">
                <label class="largo">Descrição <textarea rows="3" data-campo="preliminar.fechamento.definitivo.descricao" maxlength="3000">${esc(f.definitivo.descricao)}</textarea></label>
                <label>Dimensões gerais <input type="text" data-campo="preliminar.fechamento.definitivo.dimensoes" data-rerender value="${escAttr(f.definitivo.dimensoes)}" maxlength="80" placeholder="C × L × A (mm)"></label>
                <label>Massa <input type="text" data-campo="preliminar.fechamento.definitivo.massa" value="${escAttr(f.definitivo.massa)}" maxlength="40"></label>
            </div>
            ${cabe === null ? '' : `<p class="${cabe ? 'ok' : 'nok'}">${cabe ? '✓ Cabe no espaço disponível' : '✗ Passa do espaço disponível'} (${esc(env.join(' × '))} mm).</p>`}
            <div class="evolucao-esboco">${f.definitivo.imagem ? `${imgTag(f.definitivo.imagem, 'Leiaute definitivo')}<button type="button" class="btn-icone perigo" data-acao="fe-img-del" aria-label="Remover">✕</button>`
                : `<div class="foto-vazia"><button type="button" class="so-toque" data-acao="fe-img" data-cam="1">📷<span>Tirar foto</span></button><button type="button" data-acao="fe-img">🖼<span>Imagem do CAD</span></button><button type="button" data-acao="fe-img-desenho">✏<span>Esboço</span></button></div>`}</div>
            <h3>Documentos para a produção</h3>
            <ul class="lista-docs">${DOCUMENTOS.map(([k, n, auto]) => `<li><label><input type="checkbox" data-campo="preliminar.fechamento.documentos.${k}" data-rerender ${f.documentos[k] ? 'checked' : ''}> ${esc(n)}</label>${auto ? ' <small>(marcado sozinho quando completo)</small>' : ''}</li>`).join('')}</ul>
        </section>
        <section class="card">
            <div class="card-topo"><h2>3. Análise e discussão dos resultados</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="fe-rascunho" data-campo-alvo="analise">${f.analise ? 'Refazer o rascunho' : 'Rascunhar a partir dos dados'}</button></div>
            <textarea rows="5" data-campo="preliminar.fechamento.analise" maxlength="6000" aria-label="Análise e discussão">${esc(f.analise)}</textarea>
            <div class="card-topo"><h3>Trabalhos futuros</h3><button type="button" class="btn btn-secondary btn-sm" data-acao="fe-rascunho" data-campo-alvo="trabalhosFuturos">${f.trabalhosFuturos ? 'Refazer a lista' : 'Listar o que ficou em aberto'}</button></div>
            <textarea rows="4" data-campo="preliminar.fechamento.trabalhosFuturos" maxlength="6000" aria-label="Trabalhos futuros">${esc(f.trabalhosFuturos)}</textarea>
        </section>
        <section class="card">
            <h2>4. Patente antes de publicar</h2>
            <p class="nota">Publicar (artigo, apresentação, feira) antes de depositar tira a novidade. Busque anterioridade nos princípios escolhidos e também nos instrumentos e dispositivos criados para os testes.</p>
            ${principios.length && typeof htmlLinksPatentes === 'function' ? `<details><summary>Buscas prontas por princípio (${principios.length})</summary>${principios.map(x => `<div><b>${esc(x.nome)}</b>${htmlLinksPatentes(x.nome, '')}</div>`).join('')}</details>` : ''}
            <div class="grade-campos">
                <label class="largo"><span><input type="checkbox" data-campo="preliminar.fechamento.patente.busca" data-rerender ${f.patente.busca ? 'checked' : ''}> Busca de anterioridade feita</span></label>
                <label class="largo">O que pode ser novo (produto, mecanismo, instrumento de teste…) <input type="text" data-campo="preliminar.fechamento.patente.novidade" value="${escAttr(f.patente.novidade)}" maxlength="400"></label>
                <label>Decisão <select data-campo="preliminar.fechamento.patente.decisao" data-rerender><option value="">—</option>${Object.entries(DECISOES_PATENTE).map(([k, t]) => `<option value="${k}" ${f.patente.decisao === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
                <label>Observações <input type="text" data-campo="preliminar.fechamento.patente.obs" value="${escAttr(f.patente.obs)}" maxlength="400"></label>
            </div>
        </section>
        <section class="card relatorio-acoes">
            <h2>5. Relatório do projeto preliminar</h2>
            <p class="nota">Reúne todas as etapas P1 a P7 com os dados, as tabelas e as imagens. Também vai no ZIP (relatorio-preliminar.html) e no salvamento na nuvem.</p>
            <div class="botoes">
                <button type="button" class="btn btn-primary" data-acao="relp-imprimir">🖨 Imprimir / Salvar PDF</button>
                <button type="button" class="btn btn-secondary" data-acao="relp-html">⬇ Baixar o relatório (HTML)</button>
                <button type="button" class="btn btn-secondary" data-acao="relp-ver">${App.verRelPrelim ? 'Esconder a prévia' : 'Ver a prévia aqui'}</button>
            </div>
        </section>
        ${App.verRelPrelim ? `<div id="relatorio-previa" class="relatorio-previa"><style>${RELATORIO_CSS}</style>${corpoRelatorio(p, { dataImg: true, tipo: 'preliminar' })}</div>` : ''}`;
    }
};

// ---------------------------------------------------------------- status, pendências e ações

const statusPreliminarBase = statusPreliminar;
statusPreliminar = function (p) {
    const out = statusPreliminarBase(p), f = p.preliminar.fechamento;
    if (!concepcaoEscolhida(p)) { out['p-fechamento'] = { estado: 'vazio', resumo: 'escolha a concepção antes' }; return out; }
    const docs = DOCUMENTOS.filter(([k]) => f.documentos[k]).length;
    const feito = !!f.definitivo.descricao && docs === DOCUMENTOS.length && !!f.analise.trim();
    out['p-fechamento'] = { estado: feito ? 'feito' : (f.definitivo.descricao || docs || f.analise) ? 'andamento' : 'vazio', resumo: `documentos ${docs}/${DOCUMENTOS.length}${f.analise ? ' · análise escrita' : ''}` };
    return out;
};
const pendenciasPreliminarBase = pendenciasPreliminar;
pendenciasPreliminar = function (p) { return pendenciasPreliminarBase(p).concat(concepcaoEscolhida(p) ? pendenciasFechamento(p) : []); };

async function documentoRelPrelimComImagens(p) {
    const mapa = {};
    for (const id of imagensUsadas(p)) {
        const r = await Imagens.ler(id);
        if (r && r.blob) mapa[id] = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(r.blob); });
    }
    const rec = await carregarRecursos(), urls = {};
    for (const [n, b] of Object.entries(rec)) urls[n] = await blobParaDataUrl(b);
    return documentoRelatorio(p, id => mapa[id] || '', n => urls[n] || '', 'preliminar');
}

Object.assign(ACOES, {
    'fe-rascunho': b => {
        const f = PC.p.preliminar.fechamento, alvo = b.dataset.campoAlvo;
        if (f[alvo] && !confirm('Substituir o texto atual pelo rascunho?')) return;
        f[alvo] = alvo === 'analise' ? rascunhoAnalise(PC.p) : rascunhoTrabalhosFuturos(PC.p);
        salvar(); renderPagina(true); avisar('Rascunho pronto: revise e complete com a sua análise.');
    },
    'fe-img': b => imagemPara(PC.p.preliminar.fechamento.definitivo, 'imagem', b, 'Leiaute definitivo'),
    'fe-img-desenho': b => { b.dataset.desenho = '1'; return imagemPara(PC.p.preliminar.fechamento.definitivo, 'imagem', b, 'Leiaute definitivo'); },
    'fe-img-del': () => apagarImagem(PC.p.preliminar.fechamento.definitivo, 'imagem'),
    'relp-ver': () => { App.verRelPrelim = !App.verRelPrelim; renderPagina(true); },
    'relp-imprimir': async () => {
        if (!App.verRelPrelim) { App.verRelPrelim = true; renderPagina(true); }
        await hidratarImagens($('#relatorio-previa'));
        document.body.classList.add('imprimindo-rel');
        window.print();
        setTimeout(() => document.body.classList.remove('imprimindo-rel'), 500);
    },
    'relp-html': async () => {
        const p = PC.p;
        baixarArquivo(new Blob([await documentoRelPrelimComImagens(p)], { type: 'text/html' }), nomeSeguro(p.projeto.nome || 'projeto') + '-relatorio-preliminar.html');
    }
});
