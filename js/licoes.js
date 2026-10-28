/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * LIÇÕES APRENDIDAS DAS RECORRÊNCIAS DO PROJETO PRELIMINAR
 * O preliminar é executado de forma recursiva (Sigales, 2021, 2025): cada volta — uma nova rodada de teste depois de
 * "ajustar"/"reprovado", ou um passo do ciclo do protótipo que reprovou — é uma recorrência. Cada recorrência vira uma
 * lição aprendida: o que aconteceu, o que foi mudado e o resultado vêm sozinhos das rodadas; a equipe escreve a lição
 * (o que fazer diferente da próxima vez). As lições vão para o relatório e para as Lições aprendidas do Gestão de Projetos.
 */

'use strict';

/** Recorrências encontradas no preliminar, já com o texto montado. */
function recorrenciasPreliminar(p) {
    const pr = p.preliminar.prototipo, R = pr.rodadas || [], out = [];
    const conc = r => (typeof CONCLUSOES_RODADA !== 'undefined' && CONCLUSOES_RODADA[r.conclusao]) || 'sem conclusão';
    R.forEach((r, i) => {
        if (!i) return;
        const ant = R[i - 1];
        out.push({
            id: 'rd:' + r.id, data: r.data || (r.criadaEm || '').slice(0, 10), titulo: `${ant.nome} → ${r.nome}`,
            situacao: `${ant.nome}: ${conc(ant).replace(/^[✓↻✗]\s*/, '')}${ant.observacoes ? ' — ' + ant.observacoes : ''}`,
            acao: r.modificacoes || '', resultado: r.conclusao ? `${r.nome}: ${conc(r).replace(/^[✓↻✗]\s*/, '')}` : `${r.nome}: em andamento`,
            fechada: !!r.conclusao
        });
    });
    pr.ciclo.filter(c => c.situacao === 'reprovou').forEach(c => out.push({
        id: 'cy:' + c.id, data: c.data || '', titulo: `${c.etapa} reprovou`, situacao: `${c.etapa}: reprovou${c.notas ? ' — ' + c.notas : ''}`,
        acao: '', resultado: 'voltar às verificações (3.3) e repetir', fechada: true
    }));
    return out;
}

function licaoDe(p, id) {
    let l = p.preliminar.licoes.find(x => x.id === id);
    if (!l) { l = { id, licao: '', data: '' }; p.preliminar.licoes.push(l); }
    return l;
}

/** Lições prontas para o Gestão de Projetos (aba Lições aprendidas: data, descrição, recomendação). */
function licoesParaGestao(p) {
    return recorrenciasPreliminar(p).map(r => {
        const l = p.preliminar.licoes.find(x => x.id === r.id) || {};
        return { origem: 'projeto-preliminar', idOrigem: r.id, data: r.data || new Date().toISOString().slice(0, 10),
            descricao: `[Projeto preliminar — recorrência] ${r.situacao}${r.acao ? '\nModificações: ' + r.acao.replace(/\n/g, '; ') : ''}\nResultado: ${r.resultado}`,
            recomendacao: l.licao || '' };
    }).filter(x => x.recomendacao || x.descricao);
}

function htmlLicoes(p) {
    const rec = recorrenciasPreliminar(p);
    return `<section class="card" id="licoes-aprendidas">
        <div class="card-topo"><h2>7. Lições aprendidas das recorrências</h2><span class="contador">${rec.length} recorrência(s) · ${rec.filter(r => !(p.preliminar.licoes.find(l => l.id === r.id) || {}).licao).length} sem lição</span></div>
        <p class="nota">Cada volta do preliminar — nova rodada de teste depois de ajustar ou reprovar, ou um passo do protótipo que reprovou — é uma recorrência. O que aconteceu, o que mudou e o resultado vêm sozinhos; escreva a <b>lição</b>: o que fazer diferente da próxima vez. Vai para o relatório e para as Lições aprendidas do Gestão de Projetos.</p>
        ${rec.length ? `<ol class="historico licoes">${rec.map(r => { const l = p.preliminar.licoes.find(x => x.id === r.id) || {}; return `<li class="${l.licao ? 'hist-ok' : 'hist-vazio'}">
            <div class="hist-topo"><b>${esc(r.titulo)}</b><small>${r.data ? esc(new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')) : ''}</small></div>
            <div class="hist-mudanca"><b>O que aconteceu:</b> ${esc(r.situacao)}</div>
            ${r.acao ? `<div class="hist-mudanca"><b>O que foi mudado:</b><br>${esc(r.acao).replace(/\n/g, '<br>')}</div>` : ''}
            <div class="hist-mudanca"><b>Resultado:</b> ${esc(r.resultado)}</div>
            <textarea rows="2" data-campo="preliminar.licoes#${escAttr(r.id)}.licao" data-licao="${escAttr(r.id)}" maxlength="2000" placeholder="Lição: o que fazer diferente da próxima vez (no projeto, no protótipo, no teste)?" aria-label="Lição aprendida">${esc(l.licao || '')}</textarea>
        </li>`; }).join('')}</ol>` : vazio('Nenhuma recorrência ainda. Quando uma rodada de teste pedir ajuste e você abrir outra (ou um passo do protótipo reprovar), a lição aparece aqui.')}
    </section>`;
}

// a linha da lição precisa existir antes de digitar (o campo grava em preliminar.licoes#id.licao)
document.addEventListener('focusin', e => {
    const id = e.target && e.target.dataset && e.target.dataset.licao;
    if (id && PC.p && PC.p.preliminar) licaoDe(PC.p, id);
});

// ---------------------------------------------------------------- ganchos: P7, relatório, pendências, Gestão

const renderFechLicoes = PAGINAS['p-fechamento'].render;
PAGINAS['p-fechamento'].render = function (p) {
    const html = renderFechLicoes(p);
    if (!concepcaoEscolhida(p)) return html;
    const marca = '<section class="card relatorio-acoes">';
    return html.includes(marca) ? html.replace(marca, htmlLicoes(p) + marca) : html + htmlLicoes(p);
};

const secoesFechLicoes = secoesFechamento;
secoesFechamento = function (p, img) {
    const s = secoesFechLicoes(p, img), rec = recorrenciasPreliminar(p);
    if (!rec.length) return s;
    return s.concat([['Lições aprendidas', `<table><thead><tr><th>Recorrência</th><th>O que aconteceu</th><th>O que foi mudado</th><th>Resultado</th><th>Lição</th></tr></thead><tbody>
        ${rec.map(r => { const l = p.preliminar.licoes.find(x => x.id === r.id) || {}; return `<tr><td>${esc(r.titulo)}</td><td>${esc(r.situacao)}</td><td>${esc(r.acao).replace(/\n/g, '<br>')}</td><td>${esc(r.resultado)}</td><td>${esc(l.licao || '—')}</td></tr>`; }).join('')}</tbody></table>`]]);
};

const pendFechLicoes = pendenciasFechamento;
pendenciasFechamento = function (p) {
    const out = pendFechLicoes(p);
    const sem = recorrenciasPreliminar(p).filter(r => r.fechada && !(p.preliminar.licoes.find(l => l.id === r.id) || {}).licao);
    if (sem.length) out.push({ nivel: 'media', texto: `${sem.length} recorrência(s) sem lição aprendida anotada.`, etapa: 'p-fechamento' });
    return out;
};

if (typeof exportarParaGestao === 'function') {
    const exportarSemLicoes = exportarParaGestao;
    exportarParaGestao = function (p) {
        const d = exportarSemLicoes(p);
        if (p.preliminar && p.preliminar.iniciado) d.licoes = licoesParaGestao(p);
        return d;
    };
}
