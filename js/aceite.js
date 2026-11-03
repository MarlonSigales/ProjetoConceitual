/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * PARTE ELÉTRICA: SÓ A EQUIPE RESPONSÁVEL FAZ; COORDENADOR E GESTOR ACEITAM OU RECUSAM
 * Vale para projetos elétricos e de automação/eletrônica e para a parte elétrica dos projetos mistos.
 * - Fora as especificações, cada etapa é feita pela equipe da área elétrica (definida na aba Áreas do Gestão de Projetos);
 *   os demais veem só para leitura.
 * - A equipe envia a etapa para aceite; o coordenador e o gestor aceitam ou recusam (com motivo). Se a etapa mudar depois
 *   do envio, o aceite volta a ficar pendente até um novo envio.
 * - Quem é quem vem do Gestão de Projetos (nome e e-mail configurados no navegador, comparados com as Áreas, o
 *   coordenador e o grupo de gestão). Não é senha: com o login (item 52 do Gestão) passa a valer por conta.
 *   Fora do Gestão, o sistema só mostra a situação dos aceites.
 */

'use strict';

const ETAPAS_LIVRES = ['inicio', 'escopo', 'analises', 'relatorio']; // especificações e páginas de leitura: todos
const PAPEIS_NOMES = { equipe: 'equipe da área elétrica', coordenador: 'coordenador', gestor: 'gestor' };
const ACOES_LIVRES = ['ac-aceitar', 'ac-recusar', 'ir', 'ir-bloco', 'ir-dev', 'parte', 'tour', 'fechar-menu'];

const CTX_ACEITE = (() => {
    try {
        const q = new URLSearchParams(location.search);
        if (q.get('gp') !== '1' || !q.has('papeis')) return { noGestao: false, papeis: [], usuario: '' };
        return { noGestao: true, papeis: q.get('papeis').split(',').filter(Boolean), usuario: q.get('usuario') || '' };
    } catch (e) { return { noGestao: false, papeis: [], usuario: '' }; }
})();

/** O projeto (ou a parte) é elétrico: tipo elétrico/automação, ou a parte elétrica do misto. */
function parteRestrita(p) { return !!p && (p.ehParteEletrica || (p.tipoProjeto !== 'misto' && ['eletrico', 'automacao'].includes(p.tipoProjeto))); }
function etapasComAceite(p) { return todasEtapas(p).map(e => e[0]).filter(id => !ETAPAS_LIVRES.includes(id)); }
const ehEquipe = () => CTX_ACEITE.papeis.includes('equipe') || CTX_ACEITE.papeis.includes('livre');
/** Esta página está fechada para edição para quem está usando? */
function edicaoBloqueada(p, id) { return CTX_ACEITE.noGestao && parteRestrita(p) && !ETAPAS_LIVRES.includes(id) && !ehEquipe(); }

function hashTexto(t) { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function conteudoEtapa(p, id) {
    const sem = o => JSON.parse(JSON.stringify(o, (k, v) => (k === 'metadata' ? undefined : v)));
    switch (id) {
        case 'funcao-global': return sem(p.funcaoGlobal);
        case 'estrutura': return sem(p.estruturas);
        case 'principios': return sem(p.principios);
        case 'matriz': return sem({ v: p.variantes, i: p.incompatibilidades });
        case 'selecao': return sem(p.selecao);
        case 'blocos': return sem({ b: Object.fromEntries(Object.entries(p.blocos).map(([k, b]) => [k, { decisao: b.decisao, principioId: b.principioId, alocacao: b.alocacao, plataforma: b.plataforma }])), pr: p.principios });
        case 'desenvolvimento': return sem(Object.fromEntries(Object.entries(p.blocos).map(([k, b]) => [k, { metodo: b.metodo, dev: b.dev, testes: b.testes }])));
        case 'concepcao': return sem({ c: p.concepcao, f: p.fmea });
        default: return id.startsWith('p-') ? sem(p.preliminar) : null;
    }
}
const hashEtapa = (p, id) => hashTexto(JSON.stringify(conteudoEtapa(p, id) ?? ''));

/** Situação do aceite de uma etapa. */
function estadoAceite(p, id) {
    const a = p.aceites[id];
    if (!a || !a.enviado) return { estado: 'nao-enviado', texto: 'não enviada para aceite' };
    if (a.enviado.hash !== hashEtapa(p, id)) return { estado: 'alterado', texto: 'alterada depois do envio: enviar de novo' };
    const dec = [a.coordenador, a.gestor].filter(d => d && d.hash === a.enviado.hash);
    if (dec.some(d => d.decisao === 'recusado')) return { estado: 'recusado', texto: 'recusada' };
    const ok = d => d && d.hash === a.enviado.hash && d.decisao === 'aceito';
    if (ok(a.coordenador) && ok(a.gestor)) return { estado: 'aceito', texto: 'aceita pelo coordenador e pelo gestor' };
    return { estado: 'aguardando', texto: `aguardando ${[!ok(a.coordenador) && 'coordenador', !ok(a.gestor) && 'gestor'].filter(Boolean).join(' e ')}` };
}

/** Resumo dos aceites (vai para o Gestão de Projetos). */
function resumoAceites(p) {
    if (!parteRestrita(p)) return null;
    const nomes = Object.fromEntries(todasEtapas(p).map(e => [e[0], e[2]]));
    return etapasComAceite(p).map(id => {
        const a = p.aceites[id] || {}, e = estadoAceite(p, id);
        const d = x => x && a.enviado && x.hash === a.enviado.hash ? { decisao: x.decisao, por: x.por, em: x.em, motivo: x.motivo } : null;
        return { etapa: id, nome: nomes[id] || id, estado: e.estado, texto: e.texto, enviadoPor: a.enviado ? a.enviado.por : '', enviadoEm: a.enviado ? a.enviado.em : '', coordenador: d(a.coordenador), gestor: d(a.gestor) };
    });
}

function htmlCartaoAceite(p, id) {
    if (!parteRestrita(p) || ETAPAS_LIVRES.includes(id) || !todasEtapas(p).some(e => e[0] === id)) return '';
    const a = p.aceites[id] || {}, e = estadoAceite(p, id), P = CTX_ACEITE.papeis;
    const dec = (x, rot) => x && a.enviado && x.hash === a.enviado.hash ? `<li><b>${rot}:</b> ${x.decisao === 'aceito' ? '✓ aceitou' : '✗ recusou'} — ${esc(x.por || '')}, ${esc((x.em || '').replace('T', ' ').slice(0, 16))}${x.motivo ? ` · “${esc(x.motivo)}”` : ''}</li>` : `<li><b>${rot}:</b> pendente</li>`;
    let botoes = '';
    if (CTX_ACEITE.noGestao) {
        if (ehEquipe() && e.estado !== 'aceito' && e.estado !== 'aguardando') botoes += `<button type="button" class="btn btn-primary btn-sm" data-acao="ac-enviar" data-id="${id}">Enviar para aceite</button>`;
        const pode = ['coordenador', 'gestor'].filter(x => P.includes(x));
        if (pode.length && a.enviado && e.estado !== 'alterado') botoes += `<label class="largo">Motivo (obrigatório para recusar)<textarea rows="2" id="ac-motivo-${id}" maxlength="1000"></textarea></label>
            ${pode.map(x => `<button type="button" class="btn btn-primary btn-sm" data-acao="ac-aceitar" data-id="${id}" data-papel="${x}">✓ Aceitar como ${PAPEIS_NOMES[x]}</button><button type="button" class="btn btn-danger btn-sm" data-acao="ac-recusar" data-id="${id}" data-papel="${x}">✗ Recusar como ${PAPEIS_NOMES[x]}</button>`).join('')}`;
    }
    return `<section class="card cartao-aceite aceite-${e.estado}"><div class="card-topo"><h2>Aceite desta etapa</h2><span class="selo-aceite">${esc(e.texto)}</span></div>
        <p class="nota">Parte elétrica: só a equipe da área elétrica faz esta etapa; o coordenador e o gestor aceitam ou recusam.${a.enviado ? ` Enviada por ${esc(a.enviado.por || '—')} em ${esc(a.enviado.em.replace('T', ' ').slice(0, 16))}.` : ''}${CTX_ACEITE.noGestao ? '' : ' O envio e o aceite são feitos no Gestão de Projetos.'}</p>
        ${a.enviado ? `<ul class="lista-aceite">${dec(a.coordenador, 'Coordenador')}${dec(a.gestor, 'Gestor')}</ul>` : ''}
        ${botoes ? `<div class="grade-campos botoes-aceite">${botoes}</div>` : ''}</section>`;
}

Object.assign(ACOES, {
    'ac-enviar': b => {
        const p = PC.p, id = b.dataset.id;
        if (!ehEquipe()) return;
        p.aceites[id] = { enviado: { por: CTX_ACEITE.usuario, em: new Date().toISOString(), hash: hashEtapa(p, id) }, coordenador: null, gestor: null };
        salvar(); renderPagina(true); avisar('Etapa enviada para o aceite do coordenador e do gestor.', 'ok', 5000);
    },
    'ac-aceitar': b => decidirAceite(b, 'aceito'),
    'ac-recusar': b => decidirAceite(b, 'recusado')
});
function decidirAceite(b, decisao) {
    const p = PC.p, id = b.dataset.id, papel = b.dataset.papel, a = p.aceites[id];
    if (!a || !a.enviado || !CTX_ACEITE.papeis.includes(papel)) return;
    const m = document.getElementById('ac-motivo-' + id), motivo = m ? m.value.trim() : '';
    if (decisao === 'recusado' && !motivo) { avisar('Escreva o motivo da recusa: ele volta para a equipe.', 'erro'); if (m) m.focus(); return; }
    a[papel] = { decisao, por: CTX_ACEITE.usuario, em: new Date().toISOString(), motivo, hash: a.enviado.hash };
    salvar(); renderPagina(true); avisar(decisao === 'aceito' ? 'Aceite registrado.' : 'Recusa registrada: a equipe vê o motivo.', 'ok', 5000);
}

// ---------------------------------------------------------------- página: cartão de aceite e somente leitura
{
    const renderBase = renderPagina;
    // eslint-disable-next-line no-global-assign
    renderPagina = function () {
        const out = renderBase.apply(this, arguments);
        const p = PC.p, id = App.pagina, c = document.querySelector('#app .container');
        if (!c || !p) return out;
        const card = htmlCartaoAceite(p, id);
        const tit = c.querySelector('.page-titulo');
        if (card && tit) tit.insertAdjacentHTML('afterend', card);
        const bloq = edicaoBloqueada(p, id);
        document.body.classList.toggle('so-leitura-eletrica', bloq);
        if (bloq) {
            c.querySelectorAll('input, select, textarea, button').forEach(el => {
                if (el.closest('.cartao-aceite') || el.closest('.abas-parte') || (el.dataset.acao && ACOES_LIVRES.includes(el.dataset.acao))) return;
                el.disabled = true;
            });
            if (tit) tit.insertAdjacentHTML('afterend', `<p class="aviso-inline aviso-so-leitura">🔒 Somente leitura: na parte elétrica, quem faz esta etapa é a equipe da área elétrica (aba Áreas do Gestão). Você ${CTX_ACEITE.papeis.some(x => x === 'coordenador' || x === 'gestor') ? 'aceita ou recusa no cartão abaixo' : 'pode acompanhar'}.</p>`);
        }
        return out;
    };
    const barra = e => {
        const p = PC.p; if (!p || !edicaoBloqueada(p, App.pagina)) return;
        const t = e.target;
        if (t.closest && (t.closest('.cartao-aceite') || t.closest('.abas-parte'))) return;
        if (e.type === 'click') { const b = t.closest && t.closest('[data-acao]'); if (!b || ACOES_LIVRES.includes(b.dataset.acao)) return; }
        e.stopImmediatePropagation(); e.preventDefault();
    };
    ['input', 'change', 'click', 'pointerdown', 'mousedown', 'dblclick', 'keydown'].forEach(tp => document.addEventListener(tp, ev => {
        if (['pointerdown', 'mousedown', 'dblclick', 'keydown'].includes(tp)) { if (!(ev.target.closest && ev.target.closest('.editor-diagrama, .dg-tela, .esboco'))) return; }
        barra(ev);
    }, true));
}

// ---------------------------------------------------------------- Gestão: situação dos aceites junto com o resultado
{
    const exportarAntesAceite = exportarParaGestao;
    // eslint-disable-next-line no-global-assign
    exportarParaGestao = function (p) {
        const r = exportarAntesAceite(p);
        if (r && parteRestrita(p)) r.aceiteEletrica = resumoAceites(p);
        return r;
    };
}
