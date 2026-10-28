/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * RODADAS DE TESTE — metodologia e resultados a cada rodada de modificações.
 * Sigales (2021, 2025): o preliminar é executado de forma recursiva; a tese registra o protótipo anterior e cada nova
 * verificação (ex.: "Verificação 1", "Verificação 2" da Tabela 10) com o mesmo procedimento e as medidas de cada uma.
 * Cada rodada guarda: o que foi modificado desde a anterior (trazido do histórico), a metodologia usada (copiada da
 * rodada anterior para só mudar o que mudou), os resultados por especificação e condição, e a conclusão.
 * Os valores podem ir para a adequação às especificações, onde ficam "?" até a equipe confirmar.
 */

'use strict';

const TIPOS_RODADA = { preliminar: 'Teste preliminar', ajuste: 'Teste após ajuste', definitivo: 'Teste definitivo', ensaio: 'Ensaio normatizado' };
const CONCLUSOES_RODADA = { aprovado: '✓ Aprovado — segue', ajustar: '↻ Ajustar e testar de novo', reprovado: '✗ Reprovado — rever o leiaute' };

function rodadasDe(p) { return p.preliminar.prototipo.rodadas; }

/** Nova rodada: copia a metodologia e as linhas de resultado da anterior (ou do plano geral) e traz as mudanças do histórico. */
function novaRodada(p) {
    const pr = p.preliminar.prototipo, R = pr.rodadas, ant = R[R.length - 1];
    const met = ant ? Object.assign({}, ant.metodologia) : { variaveis: pr.variaveis, norma: pr.norma, procedimento: '', amostras: '', respostas: pr.respostas, analise: pr.analise };
    let linhas;
    if (ant) linhas = ant.resultados.map(x => ({ id: uid('rs'), especId: x.especId, condicao: x.condicao, repeticoes: x.repeticoes, valor: '', obs: '' }));
    else {
        const t = tercosEspec(p), ordem = { superior: 0, medio: 1, inferior: 2 };
        linhas = especsUsadas(p).filter(e => (p.preliminar.adequacao[e.id] || {}).estado !== 'ok')
            .sort((a, b) => (ordem[t[a.id]] ?? 3) - (ordem[t[b.id]] ?? 3))
            .map(e => ({ id: uid('rs'), especId: e.id, condicao: '', repeticoes: '', valor: '', obs: '' }));
    }
    const r = { id: uid('rd'), nome: `Rodada ${R.length + 1}`, data: new Date().toISOString().slice(0, 10), tipo: ant ? 'ajuste' : 'preliminar',
        modificacoes: ant ? mudancasDesde(p, ant.criadaEm || ant.data) : '', metodologia: met, resultados: linhas, conclusao: '', observacoes: '', imagem: null, criadaEm: new Date().toISOString() };
    R.push(r);
    return r;
}

/** Mudanças do histórico de ganho de conhecimento desde uma data, em texto (uma por linha). */
function mudancasDesde(p, desde) {
    const t0 = desde ? Date.parse(desde) : 0;
    return (p.preliminar.historico || []).filter(h => Date.parse(h.em) >= t0)
        .map(h => `- ${h.rotulo}${h.antes || h.depois ? `: ${h.antes || 'vazio'} → ${h.depois || 'vazio'}` : ''}${h.aprendizado ? ` (${h.aprendizado})` : ''}`).join('\n');
}

/** Leva os valores da rodada para a adequação (ficam "?" até a equipe confirmar). Devolve quantos. */
function levarRodadaParaAdequacao(p, r) {
    let n = 0;
    r.resultados.filter(x => x.especId && String(x.valor).trim()).forEach(x => {
        const a = p.preliminar.adequacao[x.especId] || (p.preliminar.adequacao[x.especId] = { valor: '', estado: '?', motivo: '' });
        if (a.valor === x.valor && a.estado !== '?') return; // já confirmado com este valor
        a.valor = String(x.valor); a.estado = '?'; a.motivo = MOTIVO_CONFIRMAR; a.rodada = r.nome;
        n++;
    });
    return n;
}

function htmlRodadas(p) {
    const R = rodadasDe(p), esp = especsUsadas(p);
    const nomeE = id => (esp.find(e => e.id === id) || {}).descricao || '';
    const opcoesEsp = sel => `<option value="">— (outra medida)</option>${esp.map(e => `<option value="${e.id}" ${sel === e.id ? 'selected' : ''}>${esc(e.descricao)}${e.meta ? ' (' + esc(e.meta) + ')' : ''}</option>`).join('')}`;
    return `<section class="card" id="rodadas">
        <div class="card-topo"><h2>Rodadas de teste</h2><button type="button" class="btn btn-primary btn-sm" data-acao="rod-nova">+ Nova rodada</button></div>
        <p class="nota">Cada rodada de modificações tem a <b>sua</b> metodologia e os <b>seus</b> resultados. A nova rodada copia a metodologia da anterior (mude só o que mudou) e traz do histórico o que foi modificado desde então.</p>
        ${R.length ? R.map((r, i) => `<details class="rodada rodada-${r.conclusao || 'aberta'}" ${i === R.length - 1 ? 'open' : ''}>
            <summary><b>${esc(r.nome)}</b> <small>${esc(TIPOS_RODADA[r.tipo] || '')}${r.data ? ' · ' + esc(new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')) : ''}</small>
                <span class="rodada-conclusao">${esc(CONCLUSOES_RODADA[r.conclusao] || 'em andamento')}</span></summary>
            <div class="grade-campos">
                <label>Nome <input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.nome" value="${escAttr(r.nome)}" maxlength="80"></label>
                <label>Data <input type="date" data-campo="preliminar.prototipo.rodadas#${r.id}.data" value="${escAttr(r.data)}"></label>
                <label>Tipo <select data-campo="preliminar.prototipo.rodadas#${r.id}.tipo">${Object.entries(TIPOS_RODADA).map(([k, t]) => `<option value="${k}" ${r.tipo === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            </div>
            <div class="card-topo"><h3>O que foi modificado desde a rodada anterior</h3>${i ? `<button type="button" class="btn btn-secondary btn-sm" data-acao="rod-mudancas" data-id="${r.id}">Trazer do histórico</button>` : ''}</div>
            <textarea rows="3" data-campo="preliminar.prototipo.rodadas#${r.id}.modificacoes" maxlength="4000" placeholder="${i ? 'peças trocadas, medidas alteradas, vedações, ajustes…' : 'primeira rodada: protótipo como construído'}" aria-label="Modificações">${esc(r.modificacoes)}</textarea>
            <h3>Metodologia desta rodada</h3>
            <div class="grade-campos">
                <label class="largo">O que variar (variáveis e níveis) <textarea rows="2" data-campo="preliminar.prototipo.rodadas#${r.id}.metodologia.variaveis" maxlength="1500">${esc(r.metodologia.variaveis)}</textarea></label>
                <label>Norma ou método <input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.metodologia.norma" value="${escAttr(r.metodologia.norma)}" maxlength="300"></label>
                <label>Amostras e repetições <input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.metodologia.amostras" value="${escAttr(r.metodologia.amostras)}" maxlength="200" placeholder="ex.: 5 repetições de 250 sementes"></label>
                <label class="largo">Procedimento (passo a passo, equipamentos, instrumentos) <textarea rows="2" data-campo="preliminar.prototipo.rodadas#${r.id}.metodologia.procedimento" maxlength="3000">${esc(r.metodologia.procedimento)}</textarea></label>
                <label class="largo">O que medir (respostas) <textarea rows="2" data-campo="preliminar.prototipo.rodadas#${r.id}.metodologia.respostas" maxlength="1500">${esc(r.metodologia.respostas)}</textarea></label>
                <label class="largo">Como analisar <textarea rows="2" data-campo="preliminar.prototipo.rodadas#${r.id}.metodologia.analise" maxlength="1500">${esc(r.metodologia.analise)}</textarea></label>
            </div>
            <div class="card-topo"><h3>Resultados desta rodada</h3><button type="button" class="btn btn-secondary btn-sm" data-acao="rod-linha" data-id="${r.id}">+ Linha</button></div>
            <div class="tabela-rolagem"><table class="tabela tabela-partes tabela-resultados"><thead><tr><th>Especificação / medida</th><th>Condição</th><th>Repetições</th><th>Valor obtido</th><th>Observação</th><th></th></tr></thead><tbody>
                ${r.resultados.map(x => { const e = esp.find(y => y.id === x.especId), ind = e && String(x.valor).trim() ? atendeMeta(e, x.valor) : null; return `<tr>
                <td data-rotulo="Especificação"><select data-campo="preliminar.prototipo.rodadas#${r.id}.resultados#${x.id}.especId" data-rerender aria-label="Especificação">${opcoesEsp(x.especId)}</select></td>
                <td data-rotulo="Condição"><input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.resultados#${x.id}.condicao" value="${escAttr(x.condicao)}" maxlength="200" placeholder="ex.: 5 km/h, 0°" aria-label="Condição"></td>
                <td data-rotulo="Repetições"><input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.resultados#${x.id}.repeticoes" value="${escAttr(x.repeticoes)}" maxlength="40" aria-label="Repetições" style="width:6rem"></td>
                <td data-rotulo="Valor obtido"><input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.resultados#${x.id}.valor" data-rerender value="${escAttr(x.valor)}" maxlength="60" aria-label="Valor obtido" style="width:7rem">${ind === null ? '' : `<small class="${ind ? 'ok' : 'nok'}"> ${ind ? 'atende' : 'não atende'} a meta</small>`}</td>
                <td data-rotulo="Observação"><input type="text" data-campo="preliminar.prototipo.rodadas#${r.id}.resultados#${x.id}.obs" value="${escAttr(x.obs)}" maxlength="400" aria-label="Observação"></td>
                <td class="col-acao"><button type="button" class="btn-icone" data-acao="rod-linha-del" data-id="${r.id}" data-linha="${x.id}" aria-label="Excluir linha">✕</button></td></tr>`; }).join('') || `<tr><td colspan="6">Sem linhas. Use "+ Linha".</td></tr>`}</tbody></table></div>
            <div class="grade-campos">
                <label>Conclusão da rodada <select data-campo="preliminar.prototipo.rodadas#${r.id}.conclusao" data-rerender><option value="">em andamento</option>${Object.entries(CONCLUSOES_RODADA).map(([k, t]) => `<option value="${k}" ${r.conclusao === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
                <label class="largo">Observações e conclusões <textarea rows="2" data-campo="preliminar.prototipo.rodadas#${r.id}.observacoes" maxlength="3000">${esc(r.observacoes)}</textarea></label>
            </div>
            <div class="botoes">
                <button type="button" class="btn btn-secondary btn-sm" data-acao="rod-adequacao" data-id="${r.id}" title="Os valores entram como ? e esperam a confirmação da equipe">Levar os valores para a adequação →</button>
                ${r.conclusao === 'ajustar' || r.conclusao === 'reprovado' ? '<a class="btn-link" href="#/p-verificacoes">Fazer as modificações (P2–P4) e depois abrir uma nova rodada →</a>' : ''}
                ${R.length > 1 ? `<button type="button" class="btn-link perigo" data-acao="rod-del" data-id="${r.id}">Excluir esta rodada</button>` : ''}
            </div>
        </details>`).join('') : vazio('Nenhuma rodada ainda. Use "+ Nova rodada" quando o protótipo estiver pronto para testar.')}
        ${R.length > 1 ? htmlComparacaoRodadas(p) : ''}
    </section>`;
}

/** Tabela lado a lado: o mesmo item medido em cada rodada (como a Tabela 10 da tese). */
function htmlComparacaoRodadas(p, paraRelatorio = false) {
    const R = rodadasDe(p), esp = especsUsadas(p);
    const chaves = [];
    R.forEach(r => r.resultados.forEach(x => { const k = `${x.especId}|${x.condicao}`; if ((x.especId || x.condicao) && String(x.valor).trim() && !chaves.includes(k)) chaves.push(k); }));
    if (!chaves.length) return '';
    const nome = k => { const [id, c] = k.split('|'); return `${(esp.find(e => e.id === id) || {}).descricao || 'medida'}${c ? ' — ' + c : ''}`; };
    const val = (r, k) => { const x = r.resultados.find(y => `${y.especId}|${y.condicao}` === k); return x && String(x.valor).trim() ? x.valor : '—'; };
    const tab = `<table class="${paraRelatorio ? '' : 'tabela'}"><thead><tr><th>Especificação / medida</th>${R.map(r => `<th>${esc(r.nome)}</th>`).join('')}</tr></thead><tbody>
        ${chaves.map(k => `<tr><td>${esc(nome(k))}</td>${R.map(r => `<td class="${paraRelatorio ? 'num' : 'col-num'}">${esc(val(r, k))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    return paraRelatorio ? tab : `<h3>Comparação entre as rodadas</h3><div class="tabela-rolagem">${tab}</div>`;
}

// ---------------------------------------------------------------- ganchos: página P5, relatório, pendências

const renderPrototipoBase = PAGINAS['p-prototipo'].render;
PAGINAS['p-prototipo'].render = function (p) {
    const html = renderPrototipoBase(p);
    if (!concepcaoEscolhida(p)) return html;
    if (!rodadasDe(p).length && p.preliminar.iniciado) { novaRodada(p); salvar(); }
    const marca = '<section class="card">\n            <h2>Ciclo do protótipo</h2>';
    return html.includes(marca) ? html.replace(marca, htmlRodadas(p) + marca) : html + htmlRodadas(p);
};

const secoesPrelimBase = secoesRelatorioPreliminar;
secoesRelatorioPreliminar = function (p, img) {
    const s = secoesPrelimBase(p, img), R = rodadasDe(p), esp = especsUsadas(p);
    if (!R.length) return s;
    const nomeE = id => (esp.find(e => e.id === id) || {}).descricao || 'medida';
    const html = `<h3>Rodadas de teste</h3>${R.map(r => `<h4>${esc(r.nome)} — ${esc(TIPOS_RODADA[r.tipo] || '')}${r.data ? ' (' + esc(new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')) + ')' : ''}: ${esc(CONCLUSOES_RODADA[r.conclusao] || 'em andamento')}</h4>
        ${r.modificacoes ? `<p><b>Modificações:</b><br>${esc(r.modificacoes).replace(/\n/g, '<br>')}</p>` : ''}
        <table><tbody>${[['Variáveis', r.metodologia.variaveis], ['Norma ou método', r.metodologia.norma], ['Amostras e repetições', r.metodologia.amostras], ['Procedimento', r.metodologia.procedimento], ['Respostas', r.metodologia.respostas], ['Análise', r.metodologia.analise]].filter(([, v]) => v).map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
        ${r.resultados.some(x => String(x.valor).trim()) ? `<table><thead><tr><th>Especificação / medida</th><th>Condição</th><th>Repetições</th><th>Valor</th><th>Observação</th></tr></thead><tbody>${r.resultados.filter(x => String(x.valor).trim()).map(x => `<tr><td>${esc(nomeE(x.especId))}</td><td>${esc(x.condicao)}</td><td>${esc(x.repeticoes)}</td><td class="num">${esc(x.valor)}</td><td>${esc(x.obs)}</td></tr>`).join('')}</tbody></table>` : '<p><i>Sem resultados registrados.</i></p>'}
        ${r.observacoes ? `<p>${esc(r.observacoes)}</p>` : ''}`).join('')}
        ${R.length > 1 ? '<h3>Comparação entre as rodadas</h3>' + htmlComparacaoRodadas(p, true) : ''}`;
    const i = s.findIndex(([t]) => t === 'Protótipo e testes');
    if (i >= 0) s[i] = [s[i][0], s[i][1] + html]; else s.push(['Rodadas de teste', html]);
    return s;
};

const pendRodBase = pendenciasPreliminar;
pendenciasPreliminar = function (p) {
    const out = pendRodBase(p);
    if (!concepcaoEscolhida(p) || !p.preliminar.iniciado) return out;
    const R = rodadasDe(p), ult = R[R.length - 1];
    R.slice(0, -1).filter(r => !r.resultados.some(x => String(x.valor).trim())).forEach(r => out.push({ nivel: 'media', texto: `${r.nome} sem resultados registrados.`, etapa: 'p-prototipo' }));
    if (ult && (ult.conclusao === 'ajustar' || ult.conclusao === 'reprovado')) out.push({ nivel: 'alta', texto: `${ult.nome}: ${ult.conclusao === 'ajustar' ? 'pede ajuste' : 'reprovada'} — faça as modificações e abra uma nova rodada de teste.`, etapa: 'p-prototipo' });
    if (ult && ult.conclusao && !ult.metodologia.procedimento) out.push({ nivel: 'info', texto: `${ult.nome}: descreva o procedimento do teste (para repetir igual na próxima rodada).`, etapa: 'p-prototipo' });
    return out;
};

const acharRod = id => rodadasDe(PC.p).find(r => r.id === id);
Object.assign(ACOES, {
    'rod-nova': () => {
        const R = rodadasDe(PC.p), ult = R[R.length - 1];
        if (ult && !ult.conclusao && !confirm(`${ult.nome} ainda está em andamento. Abrir uma nova rodada mesmo assim?`)) return;
        const r = novaRodada(PC.p); salvar(); renderPagina(true);
        setTimeout(() => { const el = document.querySelector('#rodadas details:last-of-type'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        avisar(`${r.nome} aberta: a metodologia veio da anterior${r.modificacoes ? ' e as modificações do histórico' : ''}. Mude só o que mudou.`);
    },
    'rod-mudancas': b => {
        const R = rodadasDe(PC.p), i = R.findIndex(r => r.id === b.dataset.id), r = R[i], ant = R[i - 1];
        const t = mudancasDesde(PC.p, ant ? (ant.criadaEm || ant.data) : '');
        if (!t) { avisar('Nenhuma mudança no histórico desde a rodada anterior.'); return; }
        if (r.modificacoes && !confirm('Substituir o texto pelas mudanças do histórico?')) return;
        r.modificacoes = t; salvar(); renderPagina(true);
    },
    'rod-linha': b => { acharRod(b.dataset.id).resultados.push({ id: uid('rs'), especId: '', condicao: '', repeticoes: '', valor: '', obs: '' }); salvar(); renderPagina(true); },
    'rod-linha-del': b => { const r = acharRod(b.dataset.id); r.resultados = r.resultados.filter(x => x.id !== b.dataset.linha); salvar(); renderPagina(true); },
    'rod-del': b => { const r = acharRod(b.dataset.id); if (!confirm(`Excluir "${r.nome}" com a metodologia e os resultados?`)) return; PC.p.preliminar.prototipo.rodadas = rodadasDe(PC.p).filter(x => x !== r); salvar(); renderPagina(true); },
    'rod-adequacao': b => {
        const n = levarRodadaParaAdequacao(PC.p, acharRod(b.dataset.id)); salvar(); renderPagina(true);
        avisar(n ? `${n} valor(es) levado(s) para a adequação — confirme lá (ficam "?" até a equipe confirmar).` : 'Nada a levar: preencha o valor obtido nas linhas ligadas a uma especificação.');
    }
});
