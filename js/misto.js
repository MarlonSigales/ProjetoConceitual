/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * PROJETO MISTO EM DUAS ABAS
 * - Aba "Mecânica" (o projeto, fluxo completo de Pahl e Reis) e aba "Elétrica e automação" (parte elétrica, fluxo
 *   simplificado de Marwedel), cada uma com seu diagrama, suas soluções, sua concepção e seu preliminar.
 * - Cada especificação é marcada como mecânica, elétrica ou das duas (na aba Mecânica, etapa 1). A parte elétrica
 *   recebe as elétricas e as das duas; as das duas viram testes de integração entre as partes.
 * - O ZIP, a nuvem e o Gestão de Projetos recebem o projeto inteiro (as duas partes).
 */

'use strict';

const DISCIPLINAS = { mecanico: 'Mecânica', eletrico: 'Elétrica e automação', ambas: 'As duas' };
const RE_ELETRICO = /el[eé]tric|tens[aã]o|corrente|bateria|autonomia|consumo|sensor|sinal|control|comunica|dados|software|firmware|programa|display|tela|wi-?fi|bluetooth|lora|celular|aplicativo|led\b|alarme|automa|eletr[oô]nic|motor el|carregador|fonte de alimenta/i;

function ehMisto(r) { return !!r && r.tipoProjeto === 'misto' && !r.ehParteEletrica; }
function disciplinaSugerida(e) { return RE_ELETRICO.test(`${e.descricao || ''} ${e.unidade || ''} ${e.avaliacao || ''}`) ? 'eletrico' : 'mecanico'; }
const chaveEspec = e => e.idQFD ? 'q:' + e.idQFD : 'i:' + e.id;

// a página pode ser aberta numa das partes (?parte=eletrica, usado pelo Gestão de Projetos)
try { if (new URLSearchParams(location.search).get('parte') === 'eletrica') PC.parte = 'eletrica'; } catch (e) { /* ok */ }
const PARTE_FIXA = PC.parte === 'eletrica' || /[?&]gp=1/.test(location.search); // no Gestão, cada parte tem suas seções (sem abas)

/** Cria a parte elétrica do misto (uma vez) e mantém as especificações dela em dia com a divisão. */
function garantirParteEletrica(r) {
    if (!ehMisto(r)) return;
    r.especificacoes.forEach(e => { if (!e.disciplina) e.disciplina = disciplinaSugerida(e); });
    if (!r.parteEletrica) {
        r.parteEletrica = normalizarProjeto({ ehParteEletrica: true, fluxo: 'simplificado', tipoProjeto: 'automacao', formulacao: r.formulacao,
            funcaoGlobal: { nome: '', entradas: {}, saidas: {} } });
    }
    sincronizarParteEletrica(r);
}

function sincronizarParteEletrica(r) {
    const s = r.parteEletrica; if (!s) return;
    s.ehParteEletrica = true; s.fluxo = 'simplificado';
    if (!['eletrico', 'automacao'].includes(s.tipoProjeto)) s.tipoProjeto = 'automacao';
    s.projeto = Object.assign({}, clonar(r.projeto), { nome: `${r.projeto.nome || 'Projeto'} – parte elétrica e de automação` });
    s.origemQFD = r.origemQFD ? clonar(r.origemQFD) : null;
    s.necessidades = clonar(r.necessidades);
    s.restricoes = clonar(r.restricoes);
    if (!s.formulacao.trim() && r.formulacao.trim()) s.formulacao = r.formulacao;
    const ant = new Map(s.especificacoes.map(e => [e.chaveRaiz || chaveEspec(e), e]));
    const daRaiz = r.especificacoes.filter(e => ['eletrico', 'ambas'].includes(e.disciplina)).map(e => {
        const k = chaveEspec(e), a = ant.get(k) || {};
        return Object.assign({}, clonar(e), { id: a.id || uid('es'), chaveRaiz: k, funcoesIds: lista(a.funcoesIds), funcao: a.funcao || '', revisao: a.revisao || e.revisao });
    });
    const proprias = s.especificacoes.filter(e => !e.chaveRaiz && e.origem === 'manual'); // criadas na própria parte elétrica
    s.especificacoes = daRaiz.concat(proprias);
}

// ---------------------------------------------------------------- salvar: as duas partes em dia
{
    const salvarAntesMisto = PC.salvar;
    PC.salvar = function () {
        try { const r = this.raiz; if (ehMisto(r)) garantirParteEletrica(r); } catch (e) { console.warn('projeto misto', e); }
        return salvarAntesMisto.apply(this, arguments);
    };
    const carregarBase = PC.carregar;
    PC.carregar = function () { const out = carregarBase.apply(this, arguments); try { if (ehMisto(this.raiz)) garantirParteEletrica(this.raiz); } catch (e) { /* ok */ } return this.p; };
}

// ---------------------------------------------------------------- abas
function htmlAbasParte() {
    const r = PC.raiz;
    if (!ehMisto(r) || PARTE_FIXA) return '';
    const e = PC.parte === 'eletrica';
    return `<nav class="abas-parte" role="tablist" aria-label="Partes do projeto misto">
        <button type="button" role="tab" aria-selected="${!e}" class="aba-parte ${e ? '' : 'ativa'}" data-acao="parte" data-parte="">⚙ Mecânica <small>Pahl, Reis</small></button>
        <button type="button" role="tab" aria-selected="${e}" class="aba-parte ${e ? 'ativa' : ''}" data-acao="parte" data-parte="eletrica">⚡ Elétrica e automação <small>Marwedel</small></button></nav>`;
}
ACOES.parte = b => {
    PC.parte = b.dataset.parte === 'eletrica' ? 'eletrica' : '';
    try { sessionStorage.setItem('pc_parte', PC.parte); } catch (e) { /* ok */ }
    const id = rota();
    if (id !== 'inicio' && !todasEtapas(PC.p).some(([x]) => x === id)) { location.hash = '#/inicio'; return; }
    renderPagina();
};
if (!PARTE_FIXA) { try { if (sessionStorage.getItem('pc_parte') === 'eletrica') PC.parte = 'eletrica'; } catch (e) { /* ok */ } }

{
    const renderBase = renderPagina;
    // eslint-disable-next-line no-global-assign
    renderPagina = function () {
        if (PC.parte === 'eletrica' && PC.raiz && !PC.raiz.parteEletrica) { if (ehMisto(PC.raiz)) garantirParteEletrica(PC.raiz); else PC.parte = ''; }
        const out = renderBase.apply(this, arguments);
        const c = document.querySelector('#app .container');
        const abas = htmlAbasParte();
        if (c && abas) c.insertAdjacentHTML('afterbegin', abas);
        const p = PC.p;
        if (p && p.ehParteEletrica) {
            document.body.classList.add('parte-eletrica');
            if (App.pagina === 'escopo') { // as especificações vêm da divisão feita na parte mecânica
                c && c.querySelectorAll('.tabela-esp input, .tabela-esp select, .tabela-esp textarea, [data-acao="esp-add"], [data-acao="esp-del"]').forEach(el => { if (!(el.closest('tr') && el.closest('tr').dataset.propria)) el.disabled = true; });
                const t = c && c.querySelector('.tabela-esp');
                if (t) t.insertAdjacentHTML('beforebegin', `<p class="aviso-inline">Estas são as especificações marcadas como elétricas ou das duas partes. A lista completa e a divisão ficam na ${PARTE_FIXA ? 'parte mecânica (seção do projeto conceitual)' : 'aba Mecânica'}, etapa 1.</p>`);
            }
        } else document.body.classList.remove('parte-eletrica');
        return out;
    };
}

// ---------------------------------------------------------------- etapa 1 da parte mecânica: divisão das especificações
{
    const renderEscopo = PAGINAS.escopo.render;
    PAGINAS.escopo.render = function (p) {
        const h = renderEscopo.call(this, p);
        if (!ehMisto(p)) return h;
        garantirParteEletrica(p);
        const n = k => p.especificacoes.filter(e => e.disciplina === k).length;
        return h + `<section class="card divisao-especs"><div class="card-topo"><h2>Divisão das especificações entre as partes</h2></div>
            <p class="nota">Projeto misto: cada parte tem a sua aba. Mecânica ${n('mecanico')} · elétrica e automação ${n('eletrico')} · as duas ${n('ambas')}. As das duas entram nas duas partes e viram testes de integração entre elas.</p>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Especificação</th><th>Meta</th><th>Parte</th></tr></thead><tbody>
            ${p.especificacoes.map(e => `<tr><td>${esc(e.codigo ? e.codigo + ' ' : '')}${esc(e.descricao)}</td><td>${esc(e.meta || '—')}</td>
                <td><select data-campo="especificacoes#${escAttr(e.id)}.disciplina" data-rerender aria-label="Parte de ${escAttr(e.descricao)}">${Object.entries(DISCIPLINAS).map(([k, t]) => `<option value="${k}" ${e.disciplina === k ? 'selected' : ''}>${t}</option>`).join('')}</select></td></tr>`).join('')}
            </tbody></table></div></section>`;
    };
}

// ---------------------------------------------------------------- Início da parte elétrica
{
    const tipoBase = htmlTipoProjeto;
    // eslint-disable-next-line no-global-assign
    htmlTipoProjeto = function (p) {
        if (p.ehParteEletrica) return `<p class="nota">Parte elétrica e de automação do projeto misto: fluxo simplificado (Marwedel). As especificações vêm da divisão feita na parte mecânica.</p>`;
        const h = tipoBase(p);
        return ehMisto(p) ? h + `<p class="nota">Projeto misto: a parte mecânica segue o fluxo completo (Pahl, Reis) e a parte elétrica e de automação, o simplificado (Marwedel), ${PARTE_FIXA ? 'nas seções próprias' : 'na aba ⚡ Elétrica e automação'}.</p>` : h;
    };
    if (typeof htmlEscolhaFluxo === 'function') {
        const fluxoBase = htmlEscolhaFluxo;
        // eslint-disable-next-line no-global-assign
        htmlEscolhaFluxo = function (p) { return p.ehParteEletrica || ehMisto(p) ? '' : fluxoBase(p); };
    }
}

// ---------------------------------------------------------------- só as especificações da parte
{
    const usadasBase = especsUsadas;
    // eslint-disable-next-line no-global-assign
    especsUsadas = function (p) { const l = usadasBase(p); return ehMisto(p) ? l.filter(e => e.disciplina !== 'eletrico') : l; };
    const pendBase = pendencias;
    // eslint-disable-next-line no-global-assign
    pendencias = function (p) {
        const l = pendBase(p);
        if (!ehMisto(p)) return l;
        const est = estDoProjeto(p);
        const out = l.filter(x => !/^Especificação sem função/.test(x.texto));
        if (est) {
            const semF = p.especificacoes.filter(e => !e.ehCusto && e.disciplina !== 'eletrico' && !funcoesDaEspec(est, e).length);
            if (semF.length) out.unshift({ nivel: 'alta', texto: `Especificação sem função (indica função faltando): ${semF.map(e => e.descricao).join('; ')}.`, etapa: 'analises' });
        }
        const pe = p.parteEletrica;
        if (pe && !pe.estruturas.length) out.push({ nivel: 'media', texto: 'A parte elétrica e de automação ainda não começou (diagrama de blocos).', etapa: 'inicio' });
        return out;
    };
}

// ---------------------------------------------------------------- projeto inteiro: biblioteca, imagens, Gestão
{
    const itensBase = itensDoProjeto;
    // eslint-disable-next-line no-global-assign
    itensDoProjeto = function (p) { return itensBase(p).concat(p && p.parteEletrica ? itensBase(p.parteEletrica) : []); };
    const imgsBase = imagensUsadas;
    // eslint-disable-next-line no-global-assign
    imagensUsadas = function (p) { return [...new Set(imgsBase(p).concat(p && p.parteEletrica ? imgsBase(p.parteEletrica) : []))]; };

    const exportarBase = exportarParaGestao;
    // eslint-disable-next-line no-global-assign
    exportarParaGestao = function (p) {
        const r = exportarBase(p);
        if (!ehMisto(p) || !p.parteEletrica || !r) return r;
        const pe = p.parteEletrica;
        if (!pe.estruturas.length) { r.misto = true; return r; }
        const e = exportarBase(pe);
        const E = s => s ? 'E' + s : s;
        r.misto = true;
        r.conceitual.funcoes = r.conceitual.funcoes.concat(e.conceitual.funcoes.map(f => Object.assign({}, f, { nome: `${f.nome} (elétrica)`, codigo: E(f.codigo),
            subfuncoes: f.subfuncoes.map(sf => Object.assign({}, sf, { codigo: E(sf.codigo) })) })));
        Object.entries(e.conceitual.desdobramento).forEach(([k, d]) => {
            const espE = pe.especificacoes.find(x => (x.idQFD ? 'qfd_' + x.idQFD : 'pc_' + x.id) === k);
            const raizK = espE && espE.chaveRaiz && espE.chaveRaiz.startsWith('i:') ? 'pc_' + espE.chaveRaiz.slice(2) : k;
            const a = r.conceitual.desdobramento[raizK];
            r.conceitual.desdobramento[raizK] = a ? { funcoes: [...new Set(a.funcoes.concat(d.funcoes))], obs: [a.obs, d.obs].filter(Boolean).join('; ') } : d;
        });
        r.conceitual.concepcoes = r.conceitual.concepcoes.concat(e.conceitual.concepcoes.map(c => Object.assign({}, c, { nome: `Parte elétrica: ${c.nome}` })));
        r.fmea = (r.fmea || []).concat((e.fmea || []).map(l => Object.assign({}, l, { item: `[Elétrica] ${l.item || ''}`.trim() })));
        const ambas = p.especificacoes.filter(x => x.disciplina === 'ambas' && (x.descricao || '').trim());
        r.planoTestes = (e.planoTestes || []).concat(ambas.map(x => ({ nivel: 'Integração', bloco: 'Mecânica × elétrica', teste: `Verificar com as duas partes montadas: ${x.descricao}`, criterio: x.meta ? `Meta ${x.meta}${x.unidade ? ' ' + x.unidade : ''}` : 'Meta da especificação' })));
        if (typeof resumoAceites === 'function') r.aceiteEletrica = resumoAceites(pe);
        return r;
    };
}
