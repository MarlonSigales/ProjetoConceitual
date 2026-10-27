/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * ANÁLISES: o que falta (pendências), rastreabilidade especificação → função → princípio, maturidade (TRL) das funções
 * da concepção escolhida, concorrentes — e a exportação das funções para o Gestão de Projetos (análise de TRL).
 */

'use strict';

const FORMATO_GESTAO = 'projeto-conceitual-gestao';

function estDoProjeto(p) { return p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0] || null; }

/** Lista do que falta ou merece atenção. nivel: 'alta' | 'media' | 'info'. */
function pendencias(p) {
    const out = [];
    const add = (nivel, texto, etapa) => out.push({ nivel, texto, etapa });
    const est = estDoProjeto(p);
    if (!p.especificacoes.length) add('alta', 'Sem especificações: importe o backup do QFD.', 'escopo');
    if (!p.formulacao.trim()) add('alta', 'Falta a formulação do problema.', 'escopo');
    if (p.abstracao.some(t => !t.trim())) add('media', `Abstração orientada: ${p.abstracao.filter(t => !t.trim()).length} passo(s) vazio(s).`, 'escopo');
    if (!p.funcaoGlobal.nome.trim()) add('alta', 'Falta o nome da função global.', 'funcao-global');
    if (!est) { add('alta', 'Falta a estrutura de funções.', 'estrutura'); return out; }
    const semF = p.especificacoes.filter(e => !e.ehCusto && !funcoesDaEspec(est, e).length);
    if (semF.length) add('alta', `Especificação sem função (indica função faltando): ${semF.map(e => e.descricao).join('; ')}.`, 'analises');
    const folhas = funcoesFolha(est);
    const sem = folhas.filter(f => !principiosDe(p, f.id).length), um = folhas.filter(f => principiosDe(p, f.id).length === 1);
    if (sem.length) add('alta', `Funções sem princípio de solução: ${sem.map(f => f.nome).join('; ')}.`, 'principios');
    if (um.length) add('media', `Funções com um só princípio (sem alternativa): ${um.map(f => f.nome).join('; ')}.`, 'principios');
    const soltas = [];
    est.nos.filter(n => n.tipo === 'funcao' && funcoesFilhas(est, n.id).length).forEach(n => {
        const pt = portasDoNivel(est, n.id), ligs = ligacoesDoNivel(est, n.id);
        pt.entradas.concat(pt.saidas).forEach(l => { if (!ligs.some(x => x.de === 'porta:' + l.id || x.para === 'porta:' + l.id)) soltas.push(`${l.rotulo || TIPOS_FLUXO[l.tipo]} (em ${n.nome})`); });
    });
    if (soltas.length) add('media', `Fluxos que entram/saem e não chegam a nenhuma função interna: ${soltas.join('; ')}.`, 'estrutura');
    const isoladas = est.nos.filter(n => n.tipo === 'funcao' && !n.global && !est.ligacoes.some(l => l.de === n.id || l.para === n.id));
    if (isoladas.length) add('media', `Funções sem nenhuma ligação no diagrama: ${isoladas.map(f => f.nome).join('; ')}.`, 'estrutura');
    if (!p.variantes.length) add('alta', 'Nenhuma concepção montada na matriz morfológica.', 'matriz');
    p.variantes.forEach(v => {
        const falta = folhas.filter(f => !v.escolhas[f.id]).length;
        if (falta) add('media', `"${v.nome}" sem princípio em ${falta} função(ões).`, 'matriz');
        if (conflitosVariante(p, v).length) add('alta', `"${v.nome}" usa princípios incompatíveis.`, 'matriz');
    });
    const semJulg = p.variantes.filter(v => !(p.selecao.viabilidade[v.id] || {}).estado);
    if (p.variantes.length && semJulg.length) add('media', `Seleção: falta julgar a viabilidade de ${semJulg.map(v => v.nome).join(', ')}.`, 'selecao');
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    if (p.variantes.length && !v) add('alta', 'Nenhuma concepção escolhida.', 'concepcao');
    if (v) {
        const semMat = folhas.filter(f => { const x = acharPrincipio(p, v.escolhas[f.id]); return x && !x.maturidade; });
        if (semMat.length) add('media', `Maturidade não informada (TRL) em: ${semMat.map(f => f.nome).join('; ')}.`, 'analises');
        const dev = folhas.filter(f => { const x = acharPrincipio(p, v.escolhas[f.id]); return x && x.maturidade === 'desenvolver'; });
        if (dev.length) add('info', `Funções que precisam ser desenvolvidas (TRL baixo, maior risco): ${dev.map(f => f.nome).join('; ')}.`, 'analises');
        if (!p.concepcao.descricao.trim()) add('media', 'A concepção escolhida está sem descrição.', 'concepcao');
        if (typeof fmeaCritico === 'function') {
            if (!p.fmea.length) add('media', 'FMEA da concepção não feita (o que pode falhar em cada função).', 'concepcao');
            const crit = p.fmea.filter(l => fmeaCritico(l) && !String(l.acao || '').trim());
            if (crit.length) add('media', `FMEA: ${crit.length} modo(s) de falha crítico(s) sem ação definida.`, 'concepcao');
        }
    }
    return out;
}

/** Linhas da tabela de maturidade: função elementar → princípio da concepção escolhida. */
function linhasMaturidade(p) {
    const est = estDoProjeto(p), v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    return funcoesFolha(est).map(f => ({ f, x: v ? acharPrincipio(p, v.escolhas[f.id]) : null, especs: p.especificacoes.filter(e => funcoesDaEspec(est, e).some(n => n.id === f.id || ancestrais(est, f.id).some(a => a.id === n.id))) }));
}

// ============================================================================
// EXPORTAÇÃO PARA O GESTÃO DE PROJETOS (projeto conceitual → árvore TRL)
// ============================================================================

/**
 * Formato do Gestão de Projetos (produto.etapas.conceitual): funções parciais → subfunções, com princípios (um por linha)
 * e o escolhido; desdobramento das especificações; concepções. Leva junto o backup do QFD, para o Gestão importar tudo
 * de uma vez.
 */
function exportarParaGestao(p) {
    const est = estDoProjeto(p);
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    const g = est ? noGlobal(est) : null;
    const gid = id => 'pc_' + id;
    const mapaGestao = {};          // id da função aqui → id da função/subfunção no Gestão
    const funcoes = (g ? funcoesFilhas(est, g.id) : []).map(f => {
        const folhas = funcoesFilhas(est, f.id).length ? folhasDe(est, f.id) : [f];
        mapaGestao[f.id] = gid(f.id);
        descendentes(est, f.id).forEach(id => { mapaGestao[id] = gid(f.id); }); // intermediárias: a função parcial (as folhas são trocadas abaixo)
        const subfuncoes = folhas.map(sf => {
            const prs = principiosDe(p, sf.id);
            const esc = v ? acharPrincipio(p, v.escolhas[sf.id]) : null;
            const sid = sf.id === f.id ? gid(sf.id) + '_e' : gid(sf.id);
            mapaGestao[sf.id] = sid;
            return {
                id: sid, nome: sf.nome, codigo: 'F' + numeroFuncao(est, sf.id),
                principios: prs.map(x => x.nome).filter(Boolean).join('\n'),
                escolhido: esc ? esc.nome : '',
                maturidade: esc ? esc.maturidade : '', maturidadeTexto: esc && MATURIDADES[esc.maturidade] ? MATURIDADES[esc.maturidade].nome : '',
                trlFaixa: esc && MATURIDADES[esc.maturidade] ? MATURIDADES[esc.maturidade].trl : '',
                concorrentes: esc ? esc.concorrentes : [], fonte: esc ? esc.fonte : ''
            };
        });
        return { id: gid(f.id), nome: f.nome, codigo: 'F' + numeroFuncao(est, f.id), subfuncoes };
    });
    const fluxos = lado => Object.keys(TIPOS_FLUXO).filter(t => p.funcaoGlobal[lado][t].length).map(t => `${TIPOS_FLUXO[t]}: ${p.funcaoGlobal[lado][t].join(', ')}`).join('\n');
    const desdobramento = {};
    p.especificacoes.forEach(e => {
        const ids = [...new Set(funcoesDaEspec(est, e).map(n => mapaGestao[n.id]).filter(Boolean))];
        if (ids.length) desdobramento[e.idQFD ? 'qfd_' + e.idQFD : gid(e.id)] = { funcoes: ids, obs: e.funcao ? `Função relacionada: ${e.funcao}` : '' };
    });
    const r = resultadoSelecao(p);
    const folhasTodas = funcoesFolha(est);
    const concepcoes = p.variantes.map(x => {
        const rr = r.find(y => y.id === x.id) || {};
        return {
            id: gid(x.id), nome: x.nome, selecionada: x.id === p.concepcao.varianteId,
            descricao: (x.id === p.concepcao.varianteId && p.concepcao.descricao ? p.concepcao.descricao + '\n\n' : (x.descricao ? x.descricao + '\n\n' : '')) +
                folhasTodas.filter(f => x.escolhas[f.id]).map(f => `${f.nome}: ${(acharPrincipio(p, x.escolhas[f.id]) || {}).nome}`).join('\n'),
            custoEstimado: textoCusto(custoConcepcao(p, est, x)),
            avaliacao: ['Custo estimado: ' + textoCusto(custoConcepcao(p, est, x)), rr.viabilidade ? 'Viabilidade: ' + ({ viavel: 'viável', condicional: 'condicionalmente viável', nao: 'não viável' }[rr.viabilidade]) : '',
                rr.etapa2 ? 'Tecnologia disponível' : '', rr.etapa3 ? 'Passou no passa/não passa' : '', rr.promissora ? 'Promissora na matriz de avaliação' : ''].filter(Boolean).join('; ')
        };
    });
    return {
        formato: FORMATO_GESTAO, versao: 1, geradoEm: new Date().toISOString(),
        projeto: { nome: p.projeto.nome, cliente: p.projeto.cliente },
        qfd: p.qfdBackup || null,
        especificacoesManuais: p.especificacoes.filter(e => !e.idQFD).map(e => ({ id: gid(e.id), requisito: e.descricao, criterioAceite: e.meta })),
        fmea: (p.fmea || []).map(l => { const f = est ? est.nos.find(n => n.id === l.funcId) : null; return { id: gid(l.id), item: f ? `F${numeroFuncao(est, f.id)} ${f.nome}` : '', modo: l.modo, efeito: l.efeito, causa: l.causa, s: +l.s || 5, o: +l.o || 5, d: +l.d || 5, acao: l.acao }; }),
        conceitual: { funcaoGlobal: { nome: p.funcaoGlobal.nome, entradas: fluxos('entradas'), saidas: fluxos('saidas') }, funcoes, desdobramento, concepcoes }
    };
}

// ============================================================================
// PÁGINA
// ============================================================================

PAGINAS.analises = {
    titulo: 'Análises e TRL',
    sub: 'O que falta, de onde vem cada função, quão madura é cada solução e como estamos frente aos concorrentes. As funções daqui são as usadas na análise de TRL do Gestão de Projetos.',
    render(p) {
        const est = estDoProjeto(p);
        const pend = pendencias(p);
        const ordem = { alta: 0, media: 1, info: 2 };
        pend.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
        const nome = id => (ETAPAS.find(e => e[0] === id) || [])[2] || '';
        const linhas = linhasMaturidade(p);
        const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
        const cont = { mercado: 0, adaptar: 0, desenvolver: 0, '': 0 };
        linhas.forEach(l => { cont[l.x ? l.x.maturidade : ''] = (cont[l.x ? l.x.maturidade : ''] || 0) + 1; });
        const total = linhas.length || 1;
        const funcsOp = est ? est.nos.filter(n => n.tipo === 'funcao' && !n.global) : [];
        return `
        <section class="card">
            <div class="card-topo"><h2>O que falta</h2><span class="contador">${pend.filter(x => x.nivel === 'alta').length} importante(s) · ${pend.filter(x => x.nivel === 'media').length} a melhorar</span></div>
            ${pend.length ? `<ul class="pendencias">${pend.map(x => `<li class="pend-${x.nivel}"><span class="pend-sinal">${x.nivel === 'alta' ? '!' : x.nivel === 'media' ? '•' : 'i'}</span><span>${esc(x.texto)}</span>
                ${x.etapa !== 'analises' ? `<a class="btn-link" href="#/${x.etapa}">ir para ${esc(nome(x.etapa))} →</a>` : ''}</li>`).join('')}</ul>`
                : '<p class="etapa-selo-ok">✓ Nada pendente. Gere o relatório e envie as funções ao Gestão de Projetos.</p>'}
        </section>

        <section class="card">
            <div class="card-topo"><h2>Enviar ao Gestão de Projetos (TRL)</h2>
                <button type="button" class="btn btn-primary" data-acao="gestao-baixar">⬇ Baixar arquivo para o Gestão</button></div>
            <p class="nota">Um arquivo só, com o QFD${p.qfdBackup ? '' : ' (não há backup do QFD neste projeto: só as funções vão)'}, as funções e subfunções, os princípios, a concepção escolhida e a maturidade.
            No Gestão de Projetos, abra <b>Projeto de produto → Projeto conceitual</b> e use <b>Importar resultado</b> (ou importe no lugar do JSON do QFD): a estrutura de funções vira a árvore TRL.</p>
            <p class="nota">${est ? `${est ? funcoesFilhas(est, (noGlobal(est) || {}).id).length : 0} função(ões) parcial(is) e ${funcoesFolha(est).length} subfunção(ões) vão para o TRL${v ? `, com os princípios da concepção "${esc(v.nome)}"` : ' (escolha a concepção para mandar o princípio escolhido)'}.` : 'Monte a estrutura de funções primeiro.'}</p>
        </section>

        <section class="card">
            <h2>Maturidade das soluções (TRL) — concepção ${v ? `"${esc(v.nome)}"` : 'não escolhida'}</h2>
            ${v ? `<div class="barra-maturidade" role="img" aria-label="Distribuição da maturidade">${Object.entries(MATURIDADES).map(([k, m]) => cont[k] ? `<i style="width:${cont[k] / total * 100}%;background:${m.cor}" title="${escAttr(m.nome)}: ${cont[k]}"></i>` : '').join('')}${cont[''] ? `<i style="width:${cont[''] / total * 100}%;background:#c9d6d3" title="sem informação: ${cont['']}"></i>` : ''}</div>
            <p class="legenda-fluxos">${Object.entries(MATURIDADES).map(([k, m]) => `<span><span class="ponto" style="background:${m.cor}"></span>${esc(m.nome)} (TRL ${m.trl}): <b>${cont[k] || 0}</b></span>`).join('')}<span><span class="ponto" style="background:#c9d6d3"></span>sem informação: <b>${cont[''] || 0}</b></span></p>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Função</th><th>Princípio escolhido</th><th>Maturidade</th><th>TRL provável</th><th>Concorrentes que usam</th><th>Especificações atendidas</th></tr></thead>
            <tbody>${linhas.map(({ f, x, especs }) => `<tr><td><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome)}</td>
                <td>${x ? esc(x.nome) : '<span class="falta">não escolhido</span>'}</td>
                <td>${x ? `<select data-campo="principios.${f.id}#${x.id}.maturidade" data-rerender class="resp resp-mat-${x.maturidade || 'vazia'}"><option value="">—</option>${Object.entries(MATURIDADES).map(([k, m]) => `<option value="${k}" ${x.maturidade === k ? 'selected' : ''}>${esc(m.nome)}</option>`).join('')}</select>` : ''}</td>
                <td class="col-num">${x && MATURIDADES[x.maturidade] ? MATURIDADES[x.maturidade].trl : '—'}</td>
                <td class="pequeno">${x ? esc(x.concorrentes.join(', ')) : ''}</td>
                <td class="pequeno">${esc(especs.map(e => e.descricao).join('; ')) || '<span class="falta">nenhuma</span>'}</td></tr>`).join('')}</tbody></table></div>`
                : vazio('Escolha a concepção (etapa 7) para ver a maturidade de cada solução.')}
        </section>

        <section class="card">
            <h2>Especificação → função (desdobramento)</h2>
            <p class="nota">Cada especificação deve ser atendida por ao menos uma função; especificação sem função indica função faltando. Ligue ou desligue aqui (as de custo não precisam de função).</p>
            ${est && p.especificacoes.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Especificação</th><th>Peso</th><th>Funções que atendem</th><th>Ligar</th></tr></thead>
            <tbody>${p.especificacoes.map(e => { const fs = funcoesDaEspec(est, e); return `<tr><td>${esc(e.descricao)}${e.meta ? ` <small>(${esc(e.meta)})</small>` : ''}${e.ehCusto ? ' <small>[custo]</small>' : ''}</td><td class="col-num">${pct(e.peso)}%</td>
                <td>${fs.map(n => `<span class="chip-fixo"><span class="num-f">F${esc(numeroFuncao(est, n.id))}</span> ${esc(n.nome)} <button type="button" class="btn-icone" data-acao="rast-del" data-esp="${e.id}" data-f="${n.id}" aria-label="Desligar">✕</button></span>`).join('') || (e.ehCusto ? '<small>—</small>' : '<span class="falta">nenhuma</span>')}</td>
                <td><select data-rast="${e.id}" aria-label="Ligar função"><option value="">+ função…</option>${funcsOp.filter(n => !fs.includes(n)).map(n => `<option value="${n.id}">F${esc(numeroFuncao(est, n.id))} ${esc(n.nome)}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table></div>`
                : vazio('Sem especificações ou sem estrutura de funções.')}
        </section>

        ${p.concorrentes.length ? `<section class="card"><h2>Concorrentes</h2>
            <p class="nota">Notas dos clientes no QFD (1 a 5) e os princípios que cada concorrente usa (vindos da pesquisa com IA ou digitados nos princípios).</p>
            ${p.necessidades.length && p.concorrentes.some(c => Object.keys(c.notas).length) ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Necessidade</th><th>Nosso</th>${p.concorrentes.map(c => `<th>${esc(c.nome)}</th>`).join('')}</tr></thead>
            <tbody>${p.necessidades.map(n => `<tr><td>${esc(n.descricao)}</td><td class="col-num">${p.notasNosso[n.id] || '—'}</td>${p.concorrentes.map(c => { const a = c.notas[n.id], b = p.notasNosso[n.id]; return `<td class="col-num ${a && b && a > b ? 'pior-nos' : ''}">${a || '—'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
            <ul class="lista-incomp">${p.concorrentes.map(c => { const usa = Object.values(p.principios).flat().filter(x => x.concorrentes.some(k => semAcento(k).includes(semAcento(c.nome)) || semAcento(c.nome).includes(semAcento(k)))); return `<li><b>${esc(c.nome)}</b>: ${usa.length ? esc(usa.map(x => x.nome).join('; ')) : '<small>nenhum princípio ligado ainda</small>'}</li>`; }).join('')}</ul>
        </section>` : ''}`;
    },
    depois(raiz) {
        raiz.addEventListener('change', e => {
            const s = e.target.closest('[data-rast]');
            if (!s || !s.value) return;
            const esp = PC.p.especificacoes.find(x => x.id === s.dataset.rast);
            const est = estDoProjeto(PC.p);
            esp.funcoesIds = [...new Set(funcoesDaEspec(est, esp).map(n => n.id).concat(s.value))];
            salvar(); renderPagina(true);
        });
    }
};

Object.assign(ACOES, {
    'rast-del': b => {
        const p = PC.p, esp = p.especificacoes.find(x => x.id === b.dataset.esp), est = estDoProjeto(p);
        const n = est.nos.find(x => x.id === b.dataset.f);
        esp.funcoesIds = funcoesDaEspec(est, esp).map(x => x.id).filter(id => id !== b.dataset.f);
        if (n && semAcento(esp.funcao) === semAcento(n.nome)) esp.funcao = '';
        salvar(); renderPagina(true);
    },
    'gestao-baixar': () => {
        const p = PC.p;
        if (!p.estruturas.length) { avisar('Monte a estrutura de funções primeiro.', 'erro'); return; }
        baixarArquivo(new Blob([JSON.stringify(exportarParaGestao(p), null, 2)], { type: 'application/json' }), `${nomeSeguro(p.projeto.nome || 'projeto')}-para-gestao.json`);
        avisar('Arquivo baixado. No Gestão de Projetos: Projeto de produto → Projeto conceitual → Importar resultado.', 'ok', 7000);
    }
});
