/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * HISTÓRICO DE GANHO DE CONHECIMENTO DO PROJETO PRELIMINAR
 * Reis (2003, cap. 7) registra o ganho de conhecimento ao longo das fases; Sigales (2021, 2025) executa as tarefas de
 * forma recursiva, e cada volta muda alguma coisa. Aqui, toda mudança feita no preliminar (P1–P6) vira uma linha do
 * histórico, sozinha; na última página (P7) a equipe escreve o que foi melhorado ou aprendido com cada mudança.
 * Mudanças seguidas no mesmo campo, sem anotação, viram uma linha só (não enche o histórico enquanto se digita).
 */

'use strict';

const HIST = { p: null, base: null, juntarMin: 30 };
const TIPOS_GANHO = { melhoria: 'Melhoria', correcao: 'Correção de erro', aprendizado: 'Aprendizado', decisao: 'Decisão' };
const NOMES_CAMPO = {
    nome: 'nome', papel: 'papel', parametro: 'parâmetro característico', material: 'material', processo: 'processo', origem: 'origem',
    fornecedor: 'fornecedor', qtd: 'quantidade', custo: 'custo', imagem: 'imagem', funcaoAux: 'função auxiliar', texto: 'texto', medida: 'medida',
    arranjo: 'arranjo', dimensoes: 'dimensões', massa: 'massa', obs: 'observações', r: 'resposta', acao: 'ação', valor: 'valor obtido',
    estado: 'resultado', motivo: 'motivo', etapa: 'etapa', data: 'data', situacao: 'situação', notas: 'notas', c: 'comprimento', l: 'largura', a: 'altura',
    variaveis: 'variáveis do teste', norma: 'norma ou método', respostas: 'respostas medidas', analise: 'análise', aproximacao: 'tipo (físico/analítico)',
    abrangencia: 'abrangência', proposito: 'propósito', inicio: 'data de início', teste: 'data do teste', decisao: 'data da decisão',
    potenciaW: 'potência', horas: 'horas de uso', tarifa: 'tarifa', kg: 'material (kg)', precoKg: 'preço do material', outros: 'outros custos'
};
const LISTAS_HIST = ['interfaces', 'portadores', 'leiautes'];

/** Retrato do preliminar: { caminho: valor } das folhas, sem o fechamento, o histórico e a IA. */
function retratoPreliminar(pl) {
    const out = {};
    const vai = (v, cam) => {
        if (cam === 'prototipo.rodadas') return; // as rodadas de teste já são o registro delas mesmas
        if (v === null || v === undefined || typeof v !== 'object') { out[cam] = v === undefined ? null : v; return; }
        if (Array.isArray(v)) {
            if (v.length && typeof v[0] === 'object' && v[0] && v[0].id) v.forEach(x => vai(x, `${cam}#${x.id}`));
            else if (v.length || /proposito$/.test(cam)) out[cam] = JSON.stringify(v); // lista de objetos vazia: nada
            return;
        }
        Object.entries(v).forEach(([k, x]) => { if (k !== 'id') vai(x, cam ? `${cam}.${k}` : k); });
    };
    Object.entries(pl).forEach(([k, v]) => { if (!['fechamento', 'historico', 'ia', 'iniciado'].includes(k)) vai(v, k); });
    return out;
}

function textoValor(caminho, v, p) {
    if (v === null || v === undefined || v === '') return 'vazio';
    if (v === true) return 'sim'; if (v === false) return 'não';
    const ult = caminho.split('.').pop();
    if (ult === 'r') return RESPOSTAS_CHECK[v] || v;
    if (ult === 'papel') return PAPEIS[v] || v;
    if (ult === 'origem') return ORIGENS_PECA[v] || v;
    if (ult === 'situacao') return { feito: 'feito/aprovado', reprovou: 'reprovou' }[v] || 'a fazer';
    if (ult === 'imagem' || /esbocoRestricoes$/.test(caminho)) return 'imagem';
    if (caminho === 'leiauteEscolhido') { const l = p.preliminar.leiautes.find(x => x.id === v); return l ? l.nome : 'leiaute excluído'; }
    if (ult === 'proposito') { try { return JSON.parse(v).map(k => PROPOSITOS[k] || k).join(', ') || 'vazio'; } catch (e) { return String(v); } }
    const t = String(v);
    return t.length > 90 ? t.slice(0, 87) + '…' : t;
}

/** Rótulo legível, etapa e item de um caminho. */
function descreverCaminho(caminho, p) {
    const pl = p.preliminar, seg = caminho.split('.'), esp = id => (p.especificacoes.find(e => e.id === id) || {}).descricao || 'especificação';
    const campo = k => NOMES_CAMPO[k] || k;
    const [lista, id] = seg[0].split('#');
    if (id) {
        if (lista === 'portadores') {
            const x = pl.portadores.find(y => y.id === id) || {};
            const et = x.papel === 'auxiliar' ? 'p-detalhes' : ['material', 'processo', 'fornecedor', 'custo', 'qtd', 'origem'].includes(seg[1]) ? 'p-verificacoes' : 'p-leiautes';
            return { etapa: et, item: id, rotulo: `Peça "${x.nome || 'sem nome'}": ${campo(seg[1])}` };
        }
        if (lista === 'leiautes') {
            const l = pl.leiautes.find(y => y.id === id) || {};
            return { etapa: 'p-leiautes', item: id, rotulo: seg[1] === 'notas' ? `Leiaute "${l.nome || ''}": nota em "${esp(seg[2])}"` : `Leiaute "${l.nome || ''}": ${campo(seg[1])}` };
        }
        if (lista === 'interfaces') { const i = pl.interfaces.find(y => y.id === id) || {}; return { etapa: 'p-requisitos', item: id, rotulo: `Interface "${i.texto || ''}": ${campo(seg[1])}` }; }
    }
    switch (seg[0]) {
        case 'determinantes': return { etapa: 'p-requisitos', rotulo: `Requisito determinante "${esp(seg[1])}"` };
        case 'envelope': return { etapa: 'p-requisitos', rotulo: `Espaço disponível: ${campo(seg[1])}` };
        case 'esbocoRestricoes': return { etapa: 'p-requisitos', rotulo: 'Desenho em escala das restrições' };
        case 'leiauteEscolhido': return { etapa: 'p-leiautes', rotulo: 'Leiaute escolhido' };
        case 'diretrizes': { const d = DIRETRIZES.find(x => x[0] === seg[1]); return { etapa: 'p-detalhes', rotulo: `Diretriz "${d ? d[1] : seg[1]}": ${campo(seg[2])}` }; }
        case 'verificacao': { const d = VERIFICACAO.find(x => x[0] === seg[1]); return { etapa: 'p-verificacoes', rotulo: `Verificação "${d ? d[1] : seg[1]}": ${campo(seg[2])}` }; }
        case 'adequacao': return { etapa: 'p-adequacao', rotulo: `Especificação "${esp(seg[1])}": ${campo(seg[2])}` };
        case 'prototipo': {
            const [l2, id2] = (seg[1] || '').split('#');
            if (l2 === 'ciclo') { const c = pl.prototipo.ciclo.find(y => y.id === id2) || {}; return { etapa: 'p-prototipo', item: id2, rotulo: `Ciclo do protótipo "${c.etapa || ''}": ${campo(seg[2])}` }; }
            return { etapa: 'p-prototipo', rotulo: `Protótipo: ${campo(seg[seg.length - 1])}` };
        }
        default: return { etapa: 'p-requisitos', rotulo: caminho };
    }
}

function nomeDoItem(lista, x) { return lista === 'portadores' ? `Peça "${x.nome || 'sem nome'}"` : lista === 'leiautes' ? `Leiaute "${x.nome || ''}"` : `Interface "${x.texto || ''}"`; }

/** Compara com o último retrato e acrescenta ao histórico o que mudou. Devolve quantas linhas mudaram. */
function registrarMudancasPreliminar(p) {
    const pl = p && p.preliminar;
    if (!pl || !pl.iniciado) { HIST.p = p; HIST.base = null; return 0; }
    const atual = retratoPreliminar(pl);
    if (HIST.p !== p || !HIST.base) { HIST.p = p; HIST.base = atual; return 0; } // projeto aberto agora: só tira o retrato
    const antes = HIST.base, agora = Date.now(), H = pl.historico;
    let n = 0;
    const recente = h => !h.aprendizado && !h.tipo && agora - Date.parse(h.em) < HIST.juntarMin * 60e3;
    // peças, leiautes e interfaces incluídos ou excluídos: uma linha por item
    const idsDe = (snap, lista) => new Set(Object.keys(snap).filter(k => k.startsWith(lista + '#')).map(k => k.split('.')[0].split('#')[1]));
    const tratados = new Set();
    LISTAS_HIST.forEach(lista => {
        const a = idsDe(antes, lista), d = idsDe(atual, lista);
        d.forEach(id => {
            if (a.has(id)) return;
            tratados.add(id);
            const x = pl[lista].find(y => y.id === id) || {};
            H.push({ id: uid('hk'), em: new Date().toISOString(), etapa: lista === 'leiautes' ? 'p-leiautes' : lista === 'interfaces' ? 'p-requisitos' : (x.papel === 'auxiliar' ? 'p-detalhes' : 'p-verificacoes'),
                caminho: `${lista}#${id}`, item: id, rotulo: `${nomeDoItem(lista, x)} incluído(a)`, antes: '', depois: 'incluído', tipo: '', aprendizado: '' });
            n++;
        });
        a.forEach(id => {
            if (d.has(id)) return;
            tratados.add(id);
            const inc = H.find(h => h.item === id && h.depois === 'incluído' && recente(h));
            if (inc) { H.splice(H.indexOf(inc), 1); n++; return; } // incluído e excluído sem anotação: some
            const nome = antes[`${lista}#${id}.nome`] || antes[`${lista}#${id}.texto`] || '';
            H.push({ id: uid('hk'), em: new Date().toISOString(), etapa: lista === 'leiautes' ? 'p-leiautes' : lista === 'interfaces' ? 'p-requisitos' : 'p-verificacoes',
                caminho: `${lista}#${id}`, item: id, rotulo: `${lista === 'portadores' ? 'Peça' : lista === 'leiautes' ? 'Leiaute' : 'Interface'} "${nome}" excluído(a)`, antes: 'existia', depois: 'excluído', tipo: '', aprendizado: '' });
            n++;
        });
    });
    // campos alterados
    new Set(Object.keys(antes).concat(Object.keys(atual))).forEach(cam => {
        const va = antes[cam] ?? null, vd = atual[cam] ?? null;
        if (va === vd || ((va === null || va === '' || va === false) && (vd === null || vd === '' || vd === false))) return;
        const idItem = (cam.split('.')[0].split('#')[1]) || '';
        if (idItem && tratados.has(idItem)) return;
        // campos de um item incluído há pouco e ainda sem anotação: atualizam a linha da inclusão
        const inc = idItem && H.find(h => h.item === idItem && h.depois === 'incluído' && recente(h));
        if (inc) { const lista = cam.split('#')[0], x = (pl[lista] || []).find(y => y.id === idItem); if (x) inc.rotulo = `${nomeDoItem(lista, x)} incluído(a)`; return; }
        const ult = [...H].reverse().find(h => h.caminho === cam);
        if (ult && recente(ult)) {
            ult.depois = textoValor(cam, vd, p); ult.em = new Date().toISOString();
            if (ult.depois === ult.antes) H.splice(H.indexOf(ult), 1);
            n++; return;
        }
        const d = descreverCaminho(cam, p);
        H.push({ id: uid('hk'), em: new Date().toISOString(), etapa: d.etapa, caminho: cam, item: d.item || '', rotulo: d.rotulo,
            antes: textoValor(cam, va, p), depois: textoValor(cam, vd, p), tipo: '', aprendizado: '' });
        n++;
    });
    if (H.length > 600) H.splice(0, H.length - 600);
    HIST.base = atual;
    return n;
}

// toda gravação passa por aqui: registra antes de salvar
const salvarComHistorico = PC.salvar;
PC.salvar = function (motivo = '') {
    try { registrarMudancasPreliminar(this.p); } catch (e) { console.error('histórico', e); }
    return salvarComHistorico.call(this, motivo);
};

// projeto aberto ou trocado: tira o retrato antes de mostrar (a primeira mudança também entra)
const renderPaginaSemHist = renderPagina;
renderPagina = function (...a) {
    if (HIST.p !== PC.p) { try { registrarMudancasPreliminar(PC.p); } catch (e) { /* segue */ } }
    return renderPaginaSemHist(...a);
};

// ---------------------------------------------------------------- tela (P7) e relatório

function nomeEtapaPrelim(id) { return (ETAPAS_PRELIM.find(e => e[0] === id) || [])[2] || ''; }
function numEtapaPrelim(id) { return (ETAPAS_PRELIM.find(e => e[0] === id) || [])[1] || ''; }

function htmlHistorico(p) {
    const H = p.preliminar.historico, so = App.histSoVazias;
    const lst = [...H].reverse().filter(h => !so || !h.aprendizado);
    const vazias = H.filter(h => !h.aprendizado).length;
    return `<section class="card" id="historico-ganho">
        <div class="card-topo"><h2>6. Histórico de ganho de conhecimento</h2>
            <span class="contador">${H.length} mudança(s) · ${vazias} sem anotação</span></div>
        <p class="nota">Cada mudança feita no preliminar entra aqui sozinha. Escreva <b>o que foi melhorado ou aprendido</b> e por quê — é o ganho de conhecimento do projeto (Reis, 2003, cap. 7), que vai para o relatório e serve aos próximos projetos.</p>
        ${H.length ? `<div class="botoes"><button type="button" class="btn btn-secondary btn-sm" data-acao="hist-filtro">${so ? 'Mostrar todas' : 'Mostrar só as sem anotação'}</button></div>
        <ol class="historico">${lst.map(h => `<li class="${h.aprendizado ? 'hist-ok' : 'hist-vazio'}">
            <div class="hist-topo"><span class="hist-etapa">${esc(numEtapaPrelim(h.etapa))}</span><b>${esc(h.rotulo)}</b><small>${new Date(h.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</small>
                <button type="button" class="btn-icone" data-acao="hist-del" data-id="${h.id}" title="Apagar esta linha" aria-label="Apagar">✕</button></div>
            ${h.antes || h.depois ? `<div class="hist-mudanca"><span class="hist-antes">${esc(h.antes || 'vazio')}</span> → <span class="hist-depois">${esc(h.depois || 'vazio')}</span></div>` : ''}
            <div class="hist-campos">
                <select data-campo="preliminar.historico#${h.id}.tipo" aria-label="Tipo"><option value="">tipo…</option>${Object.entries(TIPOS_GANHO).map(([k, t]) => `<option value="${k}" ${h.tipo === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
                <textarea rows="2" data-campo="preliminar.historico#${h.id}.aprendizado" maxlength="1500" placeholder="O que melhorou ou o que aprendemos com esta mudança? Por quê?" aria-label="O que foi melhorado">${esc(h.aprendizado)}</textarea>
            </div></li>`).join('')}</ol>` : vazio('Ainda não houve mudanças no preliminar depois do pré-preenchimento. Cada alteração em P1–P6 aparece aqui.')}
    </section>`;
}

function secaoRelatorioHistorico(p) {
    const H = (p.preliminar.historico || []).filter(h => h.aprendizado || h.tipo);
    const total = (p.preliminar.historico || []).length;
    if (!total) return [];
    return [['Ganho de conhecimento', `<p>${total} mudança(s) registrada(s) no projeto preliminar; ${H.length} com o que foi melhorado ou aprendido.</p>
        ${H.length ? `<table><thead><tr><th>Quando</th><th>Etapa</th><th>Mudança</th><th>Tipo</th><th>O que foi melhorado / aprendido</th></tr></thead><tbody>
        ${H.map(h => `<tr><td>${esc(new Date(h.em).toLocaleDateString('pt-BR'))}</td><td>${esc(nomeEtapaPrelim(h.etapa))}</td><td>${esc(h.rotulo)}${h.antes || h.depois ? `<br><small>${esc(h.antes || 'vazio')} → ${esc(h.depois || 'vazio')}</small>` : ''}</td><td>${esc(TIPOS_GANHO[h.tipo] || '')}</td><td>${esc(h.aprendizado)}</td></tr>`).join('')}</tbody></table>` : ''}`]];
}

// a página P7 ganha o histórico antes do relatório; o relatório ganha a seção
const renderFechamentoBase = PAGINAS['p-fechamento'].render;
PAGINAS['p-fechamento'].render = function (p) {
    const html = renderFechamentoBase(p);
    if (!concepcaoEscolhida(p)) return html;
    const marca = '<section class="card relatorio-acoes">';
    return html.includes(marca) ? html.replace(marca, htmlHistorico(p) + marca) : html + htmlHistorico(p);
};
const secoesFechamentoBase = secoesFechamento;
secoesFechamento = function (p, img) { return secoesFechamentoBase(p, img).concat(secaoRelatorioHistorico(p)); };
const pendFechHist = pendenciasFechamento;
pendenciasFechamento = function (p) {
    const out = pendFechHist(p), n = (p.preliminar.historico || []).filter(h => !h.aprendizado).length;
    if (n) out.push({ nivel: 'media', texto: `${n} mudança(s) no histórico sem anotar o que foi melhorado ou aprendido.`, etapa: 'p-fechamento' });
    return out;
};

Object.assign(ACOES, {
    'hist-filtro': () => { App.histSoVazias = !App.histSoVazias; renderPagina(true); },
    'hist-del': b => {
        const H = PC.p.preliminar.historico, h = H.find(x => x.id === b.dataset.id);
        if (h && h.aprendizado && !confirm('Apagar esta linha e a anotação?')) return;
        PC.p.preliminar.historico = H.filter(x => x.id !== b.dataset.id); salvar(); renderPagina(true);
    }
});
