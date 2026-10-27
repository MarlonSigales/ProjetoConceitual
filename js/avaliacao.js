/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * EVOLUIR E AVALIAR AS CONCEPÇÕES (Reis, 2003, etapas 2.6 e 2.7)
 * 2.6 — as concepções promissoras são desenvolvidas até permitir o cálculo aproximado de custos, pesos e dimensões
 *       gerais, com esboço em escala (French, 1985, apud Reis, 2003).
 * 2.7 — nova matriz de avaliação, agora com as ESPECIFICAÇÕES de projeto como critérios (pesos do QFD). A escolha não
 *       se baseia só no número: uma concepção com nota alta pode ter um ponto fraco pronunciado; preferir a de perfil
 *       equilibrado (Pahl & Beitz, 1996, apud Reis, 2003).
 */

'use strict';

const ESCALA_FINAL = { 1: 'Muito ruim', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Muito bom' };

/** Especificações em uso (as retiradas na revisão de um projeto anterior ficam de fora). */
function especsAtivas(p) { return p.especificacoes.filter(e => e.revisao !== 'removida'); }

/** Concepções que seguem para a evolução: as promissoras da seleção (se nenhuma, as que passaram no passa/não passa). */
function concepcoesEmEvolucao(p) {
    const r = resultadoSelecao(p);
    let ids = r.filter(x => x.promissora).map(x => x.id);
    if (!ids.length) ids = r.filter(x => x.etapa3).map(x => x.id);
    return p.variantes.filter(v => ids.includes(v.id));
}

/**
 * Avaliação final: nota média ponderada (1 a 5) pelas especificações, pontos fracos (nota ≤ 2 numa especificação de
 * peso acima da média) e a recomendada (maior nota sem ponto fraco, se estiver a menos de 10% da maior).
 */
function avaliacaoFinal(p) {
    const vs = concepcoesEmEvolucao(p), esp = especsAtivas(p), notas = p.selecao.final.notas;
    const pesoMedio = esp.length ? esp.reduce((t, e) => t + (+e.peso || 0), 0) / esp.length : 0;
    const linhas = vs.map(v => {
        const n = notas[v.id] || {};
        const avaliadas = esp.filter(e => +n[e.id] >= 1);
        const somaP = avaliadas.reduce((t, e) => t + (+e.peso || 0), 0);
        const nota = somaP ? avaliadas.reduce((t, e) => t + (+e.peso || 0) * (+n[e.id]), 0) / somaP
            : (avaliadas.length ? avaliadas.reduce((t, e) => t + (+n[e.id]), 0) / avaliadas.length : null);
        const fracos = esp.filter(e => +n[e.id] >= 1 && +n[e.id] <= 2 && (+e.peso || 0) >= pesoMedio);
        return { id: v.id, nome: v.nome, cor: v.cor, nota, completo: esp.length > 0 && avaliadas.length === esp.length, fracos, avaliadas: avaliadas.length };
    });
    const com = linhas.filter(x => x.nota !== null).sort((a, b) => b.nota - a.nota);
    let recomendada = com[0] || null;
    if (recomendada && recomendada.fracos.length) {
        const eq = com.find(x => !x.fracos.length && x.nota >= recomendada.nota * 0.9);
        if (eq) recomendada = Object.assign({}, eq, { motivo: `"${com[0].nome}" tem nota maior, mas tem ponto fraco em ${com[0].fracos.map(e => e.descricao).join(', ')}; "${eq.nome}" é mais equilibrada.` });
    }
    return { linhas, recomendada, pesoMedio };
}

function htmlEvolucao(p) {
    const vs = concepcoesEmEvolucao(p);
    if (!vs.length) return '';
    const est = estEscolhida(), ev = p.selecao.evolucao;
    return `<section class="card">
        <h2>5. Evoluir as concepções promissoras</h2>
        <p class="nota">Desenvolva cada concepção até dar para estimar <b>massa, dimensões gerais e custo</b>, com um esboço em escala (Reis, 2003, etapa 2.6). O custo vem dos princípios; a massa e as dimensões são estimativas rápidas.</p>
        <div class="grade-evolucao">${vs.map(v => { const e = ev[v.id] || {}; return `<article class="evolucao" style="--cor:${escAttr(v.cor)}">
            <h3><span class="ponto" style="background:${escAttr(v.cor)}"></span>${esc(v.nome)}</h3>
            <p class="pequeno">Custo estimado: <b>${esc(textoCusto(custoConcepcao(p, est, v)))}</b></p>
            <div class="grade-campos">
                <label>Massa estimada <input type="text" data-campo="selecao.evolucao.${v.id}.massa" value="${escAttr(e.massa || '')}" placeholder="ex.: 1,7 kg" maxlength="40"></label>
                <label>Dimensões gerais <input type="text" data-campo="selecao.evolucao.${v.id}.dimensoes" value="${escAttr(e.dimensoes || '')}" placeholder="ex.: Ø 700 × 40 mm" maxlength="80"></label>
                <label class="largo">Cálculos aproximados e compatibilidade entre as funções <textarea rows="2" data-campo="selecao.evolucao.${v.id}.observacoes" maxlength="1200">${esc(e.observacoes || '')}</textarea></label>
            </div>
            <div class="evolucao-esboco">${e.imagem ? `${imgTag(e.imagem, 'Esboço ' + v.nome)}<button type="button" class="btn-icone perigo" data-acao="evo-img-del" data-id="${v.id}" aria-label="Remover esboço">✕</button>`
                : `<div class="foto-vazia"><button type="button" class="so-toque" data-acao="evo-img" data-cam="1" data-id="${v.id}">📷<span>Tirar foto</span></button><button type="button" data-acao="evo-img" data-id="${v.id}">🖼<span>Imagem</span></button><button type="button" data-acao="evo-desenho" data-id="${v.id}">✏<span>Esboço</span></button></div>`}</div>
        </article>`; }).join('')}</div>
    </section>`;
}

function htmlAvaliacaoFinal(p) {
    const vs = concepcoesEmEvolucao(p);
    if (!vs.length || !especsAtivas(p).length) return '';
    const af = avaliacaoFinal(p), notas = p.selecao.final.notas;
    const L = id => af.linhas.find(x => x.id === id);
    return `<section class="card">
        <div class="card-topo"><h2>6. Avaliação final pelas especificações</h2>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="final-sugerir" title="Preenche as notas vazias a partir da matriz de avaliação e da maturidade (revise)">Sugerir notas</button></div>
        <p class="nota">Agora os critérios são as <b>especificações de projeto</b>, com os pesos do QFD (Reis, 2003, etapa 2.7). Nota de 1 (muito ruim) a 5 (muito bom). Não escolha só pelo número: <b>ponto fraco</b> (nota 1 ou 2 numa especificação importante) pesa contra.</p>
        <label class="campo-participantes">Quem avaliou (Reis ampliou a equipe nesta etapa) <input type="text" data-campo="selecao.final.participantes" value="${escAttr(p.selecao.final.participantes || '')}" placeholder="projeto, produção, campo, manutenção…" maxlength="300"></label>
        <div class="tabela-rolagem"><table class="tabela tabela-final"><thead><tr><th>Especificação</th><th>Peso</th>${vs.map(v => `<th><span class="ponto" style="background:${escAttr(v.cor)}"></span>${esc(v.nome)}</th>`).join('')}</tr></thead>
        <tbody>${especsAtivas(p).map(e => `<tr><td>${esc(e.descricao)}${e.meta ? ` <small>(${esc(e.meta)})</small>` : ''}</td><td class="col-num">${pct(e.peso)}%${seloTerco(p, e)}</td>
            ${vs.map(v => { const n = (notas[v.id] || {})[e.id]; const fraco = L(v.id).fracos.includes(e); return `<td class="${fraco ? 'ponto-fraco' : ''}"><select data-campo="selecao.final.notas.${v.id}.${e.id}" data-tipo="num" data-rerender class="resp resp-n${n || ''}" aria-label="Nota">
                <option value="">—</option>${Object.entries(ESCALA_FINAL).map(([k, t]) => `<option value="${k}" ${+n === +k ? 'selected' : ''}>${k} ${t}</option>`).join('')}</select></td>`; }).join('')}</tr>`).join('')}</tbody>
        <tfoot><tr><th colspan="2">Nota ponderada (1 a 5)</th>${vs.map(v => { const l = L(v.id); return `<td class="col-num"><b>${l.nota === null ? '—' : l.nota.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</b>${l.completo ? '' : ' <small>(incompleta)</small>'}</td>`; }).join('')}</tr>
        <tr><th colspan="2">Perfil</th>${vs.map(v => `<td>${perfilSvg(p, v)}</td>`).join('')}</tr></tfoot></table></div>
        ${af.recomendada ? `<p class="recomendacao">Recomendada: <b>${esc(af.recomendada.nome)}</b>${af.recomendada.motivo ? ` — ${esc(af.recomendada.motivo)}` : af.recomendada.fracos.length ? ` (atenção ao ponto fraco: ${esc(af.recomendada.fracos.map(e => e.descricao).join(', '))})` : ' — sem pontos fracos pronunciados.'}
            ${p.concepcao.varianteId === af.recomendada.id ? '<span class="etapa-selo-ok">escolhida</span>' : `<button type="button" class="btn btn-primary btn-sm" data-acao="sel-escolher" data-id="${af.recomendada.id}">Seguir com ${esc(af.recomendada.nome)} →</button>`}</p>` : ''}
    </section>`;
}

/** Barrinhas das notas por especificação (mostra o "perfil" irregular). */
function perfilSvg(p, v) {
    const n = p.selecao.final.notas[v.id] || {}, esp = especsAtivas(p);
    if (!esp.length) return '';
    const w = Math.max(60, esp.length * 10), h = 34;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Perfil de ${escAttr(v.nome)}">${esp.map((e, i) => {
        const k = +n[e.id] || 0, bh = k * 6;
        return `<rect x="${i * 10 + 1}" y="${h - bh - 2}" width="8" height="${bh}" fill="${k && k <= 2 ? '#c0392b' : v.cor}"><title>${esc(e.descricao)}: ${k || '—'}</title></rect>`;
    }).join('')}<line x1="0" y1="${h - 2}" x2="${w}" y2="${h - 2}" stroke="#9aa7a5"/></svg>`;
}

/** Sugere as notas vazias: parte de 3 e soma o "+/−" da matriz de avaliação do critério com mesmo texto; tecnologia a desenvolver tira 1. */
function sugerirNotasFinais(p) {
    const vs = concepcoesEmEvolucao(p), s = p.selecao;
    let n = 0;
    vs.forEach(v => {
        const notas = s.final.notas[v.id] || (s.final.notas[v.id] = {});
        const desenvolver = Object.values(v.escolhas).some(id => (acharPrincipio(p, id) || {}).maturidade === 'desenvolver');
        especsAtivas(p).forEach(e => {
            if (notas[e.id]) return;
            let k = 3;
            const c = s.avaliacao.criterios.find(cr => palavrasEmComum(cr.texto, e.descricao) >= 1);
            if (c && v.id !== s.avaliacao.referencia) k += +((s.avaliacao.notas[v.id] || {})[c.id] || 0);
            if (desenvolver) k -= 1;
            notas[e.id] = Math.min(5, Math.max(1, k)); n++;
        });
    });
    return n;
}

Object.assign(ACOES, {
    'final-sugerir': () => { const n = sugerirNotasFinais(PC.p); salvar(); renderPagina(true); avisar(n ? `${n} nota(s) sugerida(s) — confira uma a uma; são só um ponto de partida.` : 'Todas as notas já estão preenchidas.'); },
    'evo-img': async b => {
        const arq = await escolherArquivo(b.dataset.cam ? '#arq-camera' : '#arq-imagem');
        if (!arq) return;
        const ev = PC.p.selecao.evolucao[b.dataset.id] || (PC.p.selecao.evolucao[b.dataset.id] = {});
        const id = await Imagens.salvar(arq, 'esboço da concepção');
        if (ev.imagem) await Imagens.apagar(ev.imagem);
        ev.imagem = id; salvar(); renderPagina(true);
    },
    'evo-desenho': async b => {
        const v = PC.p.variantes.find(x => x.id === b.dataset.id);
        const arq = await abrirEsboco(`Esboço em escala: ${v ? v.nome : 'concepção'}`);
        if (!arq) return;
        const ev = PC.p.selecao.evolucao[b.dataset.id] || (PC.p.selecao.evolucao[b.dataset.id] = {});
        const id = await Imagens.salvar(arq, 'esboço da concepção');
        if (ev.imagem) await Imagens.apagar(ev.imagem);
        ev.imagem = id; salvar(); renderPagina(true);
    },
    'evo-img-del': async b => { const ev = PC.p.selecao.evolucao[b.dataset.id] || {}; if (ev.imagem) await Imagens.apagar(ev.imagem); ev.imagem = null; salvar(); renderPagina(true); }
});
