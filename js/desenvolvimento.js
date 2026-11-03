/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * DESENVOLVIMENTO DOS BLOCOS (fluxo simplificado): cada bloco que não tem solução pronta segue o método da sua natureza,
 * como reunido na tese e na dissertação de Sigales (2025, seção 2.1; 2021):
 * - circuito: ciclo de projeto elétrico de Nilsson e Riedel adaptado ao modelo de consenso — conceito (transdutores,
 *   diagrama de blocos) → modelo do circuito → simulação (SPICE, Simulink, LabVIEW, Xcos) → protótipo físico (componentes
 *   pelos limites de trabalho, de pico e de falha, com fator de segurança) → medição em bancada; repete até atender e volta
 *   ao modelo quando o protótipo não atende nem com refinamento;
 * - controle: os 6 passos de Nise — sistema físico e especificações → diagrama de blocos → esquema → modelo matemático
 *   (Laplace ou espaço de estados, com parâmetros levantados em laboratório) → redução do diagrama → análise, projeto e
 *   teste (degrau, rampa, senoide; sensibilidade e robustez); requisitos conflitantes levam a reespecificar;
 * - software: testes de unidade (Marwedel) antes da integração.
 * Blocos com solução existente não passam por aqui: só têm o teste de integração.
 */

'use strict';

const METODOS_DEV = {
    circuito: { nome: 'Circuito — Nilsson e Riedel', curto: 'circuito' },
    controle: { nome: 'Controle — Nise (6 passos)', curto: 'controle' },
    software: { nome: 'Software — testes de unidade', curto: 'software' }
};
const FERRAMENTAS_SIM = ['SPICE / LTspice', 'Simulink', 'LabVIEW', 'Xcos (Scilab)', 'Proteus', 'Outra'];
const ETAPAS_ITER = { modelo: 'Modelo do circuito', simulacao: 'Simulação', prototipo: 'Protótipo físico', bancada: 'Medição em bancada', unidade: 'Teste de unidade' };
const DECISOES_ITER = { refinar: 'Refinar o protótipo e medir de novo', 'voltar-modelo': 'Voltar ao modelo do circuito', concluido: 'Atende: pronto para a integração' };
const ENTRADAS_NISE = { degrau: 'Degrau', rampa: 'Rampa', senoide: 'Senoide' };
const REF_NILSSON = 'NILSSON, J. W.; RIEDEL, S. A. <i>Circuitos elétricos</i>. 10. ed. São Paulo: Pearson, 2016.';
const REF_NISE = 'NISE, N. S. <i>Engenharia de sistemas de controle</i>. 7. ed. Rio de Janeiro: LTC, 2017.';

// a nova etapa entra depois das soluções dos blocos
if (typeof ETAPAS_SIMPL !== 'undefined' && !ETAPAS_SIMPL.some(e => e[0] === 'desenvolvimento')) {
    const i = ETAPAS_SIMPL.findIndex(e => e[0] === 'blocos');
    ETAPAS_SIMPL.splice(i + 1, 0, ['desenvolvimento', '', 'Desenvolvimento dos blocos']);
    ETAPAS_SIMPL.forEach((e, k) => { e[1] = String(k + 1); });
    TITULOS_SIMPL.desenvolvimento = ['Desenvolvimento dos blocos', 'Os blocos sem solução pronta: circuito pelo ciclo de Nilsson e Riedel, controle pelos 6 passos de Nise e software com testes de unidade. Os reaproveitados não entram aqui.'];
}

function devDe(b) { if (!b.dev || !b.dev.circuito) b.dev = normalizarDevBloco(b.dev); return b.dev; }
function metodoSugerido(f, b) {
    const n = semAcento(f.nome);
    if (/control|regul|malha|pid|posicion|velocidade|temperatura/.test(n)) return 'controle';
    if (b.alocacao === 'sw' || /process|registr|comunic|inform|calcul|decid/.test(n)) return 'software';
    return 'circuito';
}
function metodoDe(f, b) { return b.metodo || metodoSugerido(f, b); }
function blocosADesenvolver(p) {
    const est = estSimpl(p); if (!est) return [];
    return funcoesFolha(est).filter(f => (p.blocos[f.id] || {}).decisao === 'desenvolver');
}
const numSeg = t => { const m = String(t ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/); return m ? +m[0] : null; };
/** Fator de segurança do componente = limite de falha ÷ valor de pico (ou de trabalho, sem pico). */
function fatorSeguranca(c) { const f = numSeg(c.falha), b = numSeg(c.pico) ?? numSeg(c.trabalho); return f && b ? f / b : null; }

/** Situação do desenvolvimento de um bloco: { feito, andamento, texto }. */
function situacaoDev(f, b) {
    const d = devDe(b), m = metodoDe(f, b), it = d.iteracoes, ult = it[it.length - 1];
    if (m === 'controle') {
        const k = d.controle, passos = [k.sistema, k.diagrama, k.esquema, k.modelo, k.reducao, k.projeto].filter(x => x.trim()).length;
        if (k.conflito && !k.reespecificacao.trim()) return { feito: false, andamento: true, texto: 'requisitos conflitantes: reespecificar' };
        const ok = k.testes.length && k.testes.every(t => t.atende === 'ok');
        return { feito: !!ok && passos === 6, andamento: passos > 0 || k.testes.length > 0, texto: `${passos}/6 passos · ${k.testes.filter(t => t.atende === 'ok').length}/${k.testes.length} teste(s) ok` };
    }
    const okIt = it.some(x => x.atende === 'ok' && (m === 'software' || x.etapa === 'bancada'));
    const texto = !it.length ? (m === 'software' ? 'sem testes de unidade' : 'sem iterações') : ult.atende === 'x' ? (ult.decisao === 'voltar-modelo' ? 'voltar ao modelo do circuito' : 'não atende: refinar') : okIt ? 'atende' : 'em teste';
    const ini = m === 'software' ? d.software.testes.trim() : (d.circuito.modelo.trim() || d.circuito.conceito.trim());
    return { feito: okIt && !(ult && ult.atende === 'x'), andamento: !!(ini || it.length), texto: `${it.length} iteração(ões) · ${texto}` };
}

// ---------------------------------------------------------------- situação da etapa e pendências
{
    const stBase = statusSimplificado;
    // eslint-disable-next-line no-global-assign
    statusSimplificado = function (p, st) {
        const out = stBase(p, st);
        const fs = blocosADesenvolver(p);
        if (!fs.length) out.desenvolvimento = { estado: (out.blocos || {}).estado === 'feito' ? 'feito' : 'vazio', resumo: 'nenhum bloco a desenvolver (todos com solução existente)' };
        else {
            const sit = fs.map(f => situacaoDev(f, p.blocos[f.id]));
            out.desenvolvimento = { estado: sit.every(x => x.feito) ? 'feito' : sit.some(x => x.andamento) ? 'andamento' : 'vazio', resumo: `${sit.filter(x => x.feito).length}/${fs.length} bloco(s) desenvolvido(s) e testado(s)` };
        }
        return out;
    };
    const pendBase = pendencias;
    // eslint-disable-next-line no-global-assign
    pendencias = function (p) {
        const l = pendBase(p);
        if (!fluxoSimplificado(p)) return l;
        blocosADesenvolver(p).forEach(f => {
            const b = p.blocos[f.id], s = situacaoDev(f, b), d = devDe(b);
            if (metodoDe(f, b) === 'controle' && d.controle.conflito && !d.controle.reespecificacao.trim()) l.push({ nivel: 'alta', texto: `${f.nome}: requisitos de controle conflitantes — reespecificar (Nise).`, etapa: 'desenvolvimento' });
            else if (!s.feito) l.push({ nivel: 'media', texto: `${f.nome}: desenvolvimento ${s.texto}.`, etapa: 'desenvolvimento' });
        });
        return l;
    };
    // teste de unidade do plano de testes conforme o método
    const planoBase = planoTestes;
    // eslint-disable-next-line no-global-assign
    planoTestes = function (p) {
        const l = planoBase(p), est = estSimpl(p);
        if (!est) return l;
        blocosADesenvolver(p).forEach(f => {
            const b = p.blocos[f.id], d = devDe(b), m = metodoDe(f, b), nome = `F${numeroFuncao(est, f.id)} ${f.nome}`;
            const x = l.find(y => y.nivel === 'Unidade' && y.bloco === nome);
            if (!x) return;
            if (m === 'circuito') x.teste = `Ciclo de Nilsson e Riedel: simulação${d.circuito.ferramenta ? ' (' + d.circuito.ferramenta + ')' : ''} e medição em bancada; componentes dentro dos limites de trabalho, pico e falha`;
            else if (m === 'controle') x.teste = `Nise: respostas a ${[...new Set(d.controle.testes.map(t => ENTRADAS_NISE[t.entrada]))].join(', ').toLowerCase() || 'degrau, rampa e senoide'}; sensibilidade e robustez`;
            else if (d.software.testes.trim()) x.teste = `Testes de unidade: ${d.software.testes.trim()}`;
            x.criterio = `${x.criterio} · ${situacaoDev(f, b).texto}`;
        });
        return l;
    };
}

// ---------------------------------------------------------------- página
PAGINAS.desenvolvimento = {
    titulo: 'Desenvolvimento dos blocos',
    sub: TITULOS_SIMPL.desenvolvimento ? TITULOS_SIMPL.desenvolvimento[1] : '',
    render(p) {
        const est = estSimpl(p), fs = blocosADesenvolver(p);
        if (!est || !Object.keys(p.blocos).length) return `<section class="card">${vazio('Decida primeiro a solução de cada bloco na etapa <a href="#/blocos">Soluções dos blocos</a>.')}</section>`;
        if (!fs.length) return `<section class="card">${vazio('Todos os blocos usam soluções que já existem: não há o que desenvolver, só os testes de integração (veja o plano de testes na concepção).')}</section>`;
        return `${dica(`<ul><li><b>Circuito (Nilsson e Riedel):</b> conceito com transdutores e diagrama de blocos → modelo do circuito → simulação → protótipo físico (componentes pelos limites de trabalho, de pico e de falha) → medição em bancada. Repita até atender; se o protótipo não atende nem com refinamento, volte ao modelo.</li>
            <li><b>Controle (Nise):</b> 1 sistema físico e especificações → 2 diagrama de blocos → 3 esquema → 4 modelo matemático (parâmetros levantados em laboratório) → 5 redução → 6 análise, projeto e teste. Requisitos conflitantes: reespecificar.</li>
            <li><b>Software:</b> testes de unidade antes da integração (Marwedel).</li></ul>`, 'Como fazer')}
            <section class="card"><div class="card-topo"><h2>Resumo</h2></div><div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Bloco</th><th>Método</th><th>Situação</th></tr></thead><tbody>
            ${fs.map(f => { const b = p.blocos[f.id], s = situacaoDev(f, b); return `<tr><td><a href="#dv-${escAttr(f.id)}" data-acao="ir-dev" data-f="${escAttr(f.id)}">F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</a></td><td>${esc(METODOS_DEV[metodoDe(f, b)].nome)}</td><td>${s.feito ? '<span class="etapa-selo-ok">✓ atende</span>' : esc(s.texto)}</td></tr>`; }).join('')}
            </tbody></table></div></section>
            ${fs.map(f => cartaoDev(p, est, f)).join('')}`;
    }
};

const campoDev = (cam, rot, val, op = {}) => op.area
    ? `<label class="${op.largo ? 'largo' : ''}">${rot}<textarea rows="${op.linhas || 2}" data-campo="${cam}" placeholder="${escAttr(op.ph || '')}">${esc(val)}</textarea></label>`
    : `<label>${rot}<input type="text" data-campo="${cam}" value="${escAttr(val)}" placeholder="${escAttr(op.ph || '')}" maxlength="${op.max || 300}"></label>`;
const selDev = (cam, val, opcoes, rerender = true) => `<select data-campo="${cam}" ${rerender ? 'data-rerender' : ''}>${Object.entries(opcoes).map(([k, t]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;

function cartaoDev(p, est, f) {
    const b = p.blocos[f.id], d = devDe(b), m = metodoDe(f, b), fid = escAttr(f.id), base = `blocos.${fid}.dev`, s = situacaoDev(f, b);
    const x = b.principioId ? acharPrincipio(p, b.principioId) : null;
    let corpo = '';
    if (m === 'circuito') {
        const c = d.circuito;
        corpo = `<ol class="passos-dev">
            <li><b>Conceito</b>${campoDev(`${base}.circuito.conceito`, 'Transdutores e diagrama de blocos do circuito', c.conceito, { area: true, ph: 'ex.: sensor → amplificador → filtro → ADC' })}</li>
            <li><b>Modelo do circuito</b>${campoDev(`${base}.circuito.modelo`, 'Topologia, equações e valores dos componentes', c.modelo, { area: true, linhas: 3 })}</li>
            <li><b>Simulação</b><div class="grade-campos"><label>Ferramenta ${selDev(`${base}.circuito.ferramenta`, c.ferramenta, Object.fromEntries([['', '—']].concat(FERRAMENTAS_SIM.map(t => [t, t]))), false)}</label>
                ${campoDev(`${base}.circuito.simulacao`, 'Resultado da simulação', c.simulacao, { area: true })}</div></li>
            <li><b>Protótipo físico: componentes pelos limites</b>
                <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Componente</th><th>Grandeza</th><th>Trabalho</th><th>Pico</th><th>Falha</th><th>Fator de segurança</th><th></th></tr></thead><tbody>
                ${c.componentes.map(k => { const fs = fatorSeguranca(k); return `<tr>${['componente', 'grandeza', 'trabalho', 'pico', 'falha'].map(a => `<td><input type="text" data-campo="${base}.circuito.componentes#${escAttr(k.id)}.${a}" value="${escAttr(k[a])}" aria-label="${a}" maxlength="120"></td>`).join('')}
                    <td class="${fs !== null && fs < 1.5 ? 'falta' : ''}">${fs === null ? '—' : fs.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${fs !== null && fs < 1.5 ? ' (baixo)' : ''}</td>
                    <td><button type="button" class="btn btn-link btn-sm" data-acao="dev-del" data-f="${fid}" data-lista="componentes" data-id="${escAttr(k.id)}" aria-label="Remover">✕</button></td></tr>`; }).join('')}
                </tbody></table></div><button type="button" class="btn btn-secondary btn-sm" data-acao="dev-add" data-f="${fid}" data-lista="componentes">+ Componente</button>
                <p class="nota">Ex.: MOSFET · tensão dreno-fonte · trabalho 24 V · pico 36 V · falha 60 V → fator 1,67. Abaixo de 1,5 o sistema avisa.</p></li>
            <li><b>Medição em bancada</b> — registre cada volta do ciclo abaixo.</li></ol>`;
    } else if (m === 'controle') {
        const k = d.controle;
        corpo = `<ol class="passos-dev">
            <li><b>Sistema físico e especificações</b>${campoDev(`${base}.controle.sistema`, 'Planta, atuador, sensor e requisitos (tempo de acomodação, sobressinal, erro em regime)', k.sistema, { area: true })}</li>
            <li><b>Diagrama de blocos</b>${campoDev(`${base}.controle.diagrama`, 'Referência → controlador → atuador → planta → sensor (realimentação)', k.diagrama, { area: true })}</li>
            <li><b>Esquema</b>${campoDev(`${base}.controle.esquema`, 'Esquema elétrico e mecânico do sistema', k.esquema, { area: true })}</li>
            <li><b>Modelo matemático</b><div class="grade-campos"><label>Representação ${selDev(`${base}.controle.representacao`, k.representacao, { '': '—', laplace: 'Função de transferência (Laplace)', estados: 'Espaço de estados' }, false)}</label>
                ${campoDev(`${base}.controle.modelo`, 'Modelo', k.modelo, { area: true })}</div>
                <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Parâmetro</th><th>Valor</th><th>Unidade</th><th>Como foi levantado em laboratório</th><th></th></tr></thead><tbody>
                ${k.parametros.map(x => `<tr>${['nome', 'valor', 'unidade', 'como'].map(a => `<td><input type="text" data-campo="${base}.controle.parametros#${escAttr(x.id)}.${a}" value="${escAttr(x[a])}" aria-label="${a}" maxlength="200"></td>`).join('')}
                    <td><button type="button" class="btn btn-link btn-sm" data-acao="dev-del" data-f="${fid}" data-lista="parametros" data-id="${escAttr(x.id)}" aria-label="Remover">✕</button></td></tr>`).join('')}
                </tbody></table></div><button type="button" class="btn btn-secondary btn-sm" data-acao="dev-add" data-f="${fid}" data-lista="parametros">+ Parâmetro</button></li>
            <li><b>Redução do diagrama</b>${campoDev(`${base}.controle.reducao`, 'Função de transferência em malha fechada', k.reducao, { area: true })}</li>
            <li><b>Análise, projeto e teste</b>${campoDev(`${base}.controle.projeto`, 'Controlador projetado (ex.: PI com ganhos…) e por quê', k.projeto, { area: true })}
                <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Entrada</th><th>Resultado</th><th>Atende</th><th></th></tr></thead><tbody>
                ${k.testes.map(x => `<tr><td>${selDev(`${base}.controle.testes#${escAttr(x.id)}.entrada`, x.entrada, ENTRADAS_NISE, false)}</td>
                    <td><input type="text" data-campo="${base}.controle.testes#${escAttr(x.id)}.resultado" value="${escAttr(x.resultado)}" placeholder="ex.: acomodação 1,8 s; sobressinal 6 %" maxlength="300"></td>
                    <td>${selDev(`${base}.controle.testes#${escAttr(x.id)}.atende`, x.atende, { '': '?', ok: '✓ sim', x: '✗ não' })}</td>
                    <td><button type="button" class="btn btn-link btn-sm" data-acao="dev-del" data-f="${fid}" data-lista="testes" data-id="${escAttr(x.id)}" aria-label="Remover">✕</button></td></tr>`).join('')}
                </tbody></table></div><button type="button" class="btn btn-secondary btn-sm" data-acao="dev-add" data-f="${fid}" data-lista="testes">+ Teste</button>
                <div class="grade-campos">${campoDev(`${base}.controle.sensibilidade`, 'Sensibilidade (variação dos parâmetros)', k.sensibilidade, { area: true })}${campoDev(`${base}.controle.robustez`, 'Robustez (perturbações e incertezas)', k.robustez, { area: true })}</div>
                <label class="campo-inline"><input type="checkbox" data-campo="${base}.controle.conflito" data-rerender ${k.conflito ? 'checked' : ''}> Os requisitos são conflitantes (não dá para atender todos com este controlador)</label>
                ${k.conflito ? `<p class="aviso-inline">Nise: com requisitos conflitantes, reespecifique com a equipe (etapa 1) ou mude a planta.</p>${campoDev(`${base}.controle.reespecificacao`, 'Reespecificação acordada', k.reespecificacao, { area: true })}` : ''}</li></ol>`;
    } else {
        corpo = `<div class="grade-campos">${campoDev(`${base}.software.testes`, 'Testes de unidade (o que testar, casos de borda, simulação ou hardware-in-the-loop)', d.software.testes, { area: true, linhas: 3, largo: true })}</div>`;
    }
    const iter = m === 'controle' ? '' : `<h3>${m === 'circuito' ? 'Ciclo: simulação, protótipo e bancada' : 'Execuções dos testes de unidade'}</h3>
        <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Data</th><th>Etapa</th><th>O que foi feito / medido</th><th>Atende</th><th>Decisão</th><th></th></tr></thead><tbody>
        ${d.iteracoes.map(x => `<tr><td><input type="date" data-campo="${base}.iteracoes#${escAttr(x.id)}.data" value="${escAttr(x.data)}"></td>
            <td>${selDev(`${base}.iteracoes#${escAttr(x.id)}.etapa`, x.etapa, m === 'software' ? { unidade: ETAPAS_ITER.unidade } : { modelo: ETAPAS_ITER.modelo, simulacao: ETAPAS_ITER.simulacao, prototipo: ETAPAS_ITER.prototipo, bancada: ETAPAS_ITER.bancada }, false)}</td>
            <td><input type="text" data-campo="${base}.iteracoes#${escAttr(x.id)}.medido" value="${escAttr(x.medido)}" maxlength="400"></td>
            <td>${selDev(`${base}.iteracoes#${escAttr(x.id)}.atende`, x.atende, { '': '?', ok: '✓ sim', x: '✗ não' })}</td>
            <td>${x.atende === 'x' ? selDev(`${base}.iteracoes#${escAttr(x.id)}.decisao`, x.decisao, { '': '—', refinar: DECISOES_ITER.refinar, 'voltar-modelo': DECISOES_ITER['voltar-modelo'] }) : x.atende === 'ok' ? '✓' : ''}</td>
            <td><button type="button" class="btn btn-link btn-sm" data-acao="dev-del" data-f="${fid}" data-lista="iteracoes" data-id="${escAttr(x.id)}" aria-label="Remover">✕</button></td></tr>`).join('')}
        </tbody></table></div><button type="button" class="btn btn-secondary btn-sm" data-acao="dev-add" data-f="${fid}" data-lista="iteracoes">+ ${m === 'circuito' ? 'Volta do ciclo' : 'Execução'}</button>
        ${(() => { const u = d.iteracoes[d.iteracoes.length - 1]; return u && u.atende === 'x' ? `<p class="aviso-inline">${u.decisao === 'voltar-modelo' ? 'O protótipo não atende nem com refinamento: volte ao modelo do circuito (passo 2) e simule de novo.' : 'Não atende: refine o protótipo e meça de novo; se não atender nem assim, volte ao modelo.'}</p>` : ''; })()}`;
    return `<section class="card bloco-dev" id="dv-${fid}">
        <div class="card-topo"><h2><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome)}</h2>${s.feito ? '<span class="etapa-selo-ok">✓ desenvolvido e testado</span>' : `<span class="nota">${esc(s.texto)}</span>`}</div>
        <p class="nota">${x ? esc(x.nome) : 'Desenvolver'}${b.alocacao ? ' · ' + esc(ALOCACOES[b.alocacao]) : ''}${b.plataforma ? ' · ' + esc(b.plataforma) : ''}</p>
        <label class="campo-inline">Método ${selDev(`blocos.${fid}.metodo`, m, Object.fromEntries(Object.entries(METODOS_DEV).map(([k, v]) => [k, v.nome])))}</label>
        ${corpo}${iter}</section>`;
}

ACOES['ir-dev'] = b => { const c = document.getElementById('dv-' + b.dataset.f); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
function listaDev(d, nome) { return nome === 'componentes' ? d.circuito.componentes : nome === 'parametros' ? d.controle.parametros : nome === 'testes' ? d.controle.testes : d.iteracoes; }
ACOES['dev-add'] = b => {
    const p = PC.p, bl = p.blocos[b.dataset.f]; if (!bl) return;
    const d = devDe(bl), l = listaDev(d, b.dataset.lista), est = estSimpl(p), f = est && est.nos.find(n => n.id === b.dataset.f);
    if (b.dataset.lista === 'componentes') l.push({ id: uid('cp'), componente: '', grandeza: '', trabalho: '', pico: '', falha: '' });
    else if (b.dataset.lista === 'parametros') l.push({ id: uid('pm'), nome: '', valor: '', unidade: '', como: '' });
    else if (b.dataset.lista === 'testes') l.push({ id: uid('te'), entrada: ['degrau', 'rampa', 'senoide'][l.length % 3], resultado: '', atende: '' });
    else {
        const m = f ? metodoDe(f, bl) : 'circuito', ant = l[l.length - 1];
        const etapa = m === 'software' ? 'unidade' : !ant ? 'simulacao' : ant.decisao === 'voltar-modelo' ? 'modelo' : ant.etapa === 'simulacao' ? 'prototipo' : 'bancada';
        l.push({ id: uid('it'), data: new Date().toISOString().slice(0, 10), etapa, descricao: '', medido: '', atende: '', decisao: '' });
    }
    if (!bl.metodo && f) bl.metodo = metodoDe(f, bl);
    salvar(); renderPagina(true);
};
ACOES['dev-del'] = b => {
    const bl = PC.p.blocos[b.dataset.f]; if (!bl) return;
    const l = listaDev(devDe(bl), b.dataset.lista), i = l.findIndex(x => x.id === b.dataset.id);
    if (i >= 0) l.splice(i, 1);
    salvar(); renderPagina(true);
};

// ---------------------------------------------------------------- relatório
{
    const secBase = secoesRelatorioSimpl;
    // eslint-disable-next-line no-global-assign
    secoesRelatorioSimpl = function (p) {
        const out = secBase(p), est = estSimpl(p), fs = blocosADesenvolver(p);
        out.desenvolvimento = fs.length ? fs.map(f => {
            const b = p.blocos[f.id], d = devDe(b), m = metodoDe(f, b), s = situacaoDev(f, b);
            let h = `<h3>F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)} — ${esc(METODOS_DEV[m].nome)} (${esc(s.texto)})</h3>`;
            const par = (r, t) => t && t.trim() ? `<p><b>${r}:</b> <span class="pre">${esc(t)}</span></p>` : '';
            if (m === 'circuito') {
                const c = d.circuito;
                h += par('Conceito', c.conceito) + par('Modelo do circuito', c.modelo) + par(`Simulação${c.ferramenta ? ' (' + esc(c.ferramenta) + ')' : ''}`, c.simulacao);
                if (c.componentes.length) h += `<table><thead><tr><th>Componente</th><th>Grandeza</th><th>Trabalho</th><th>Pico</th><th>Falha</th><th>FS</th></tr></thead><tbody>${c.componentes.map(k => { const fsg = fatorSeguranca(k); return `<tr><td>${esc(k.componente)}</td><td>${esc(k.grandeza)}</td><td>${esc(k.trabalho)}</td><td>${esc(k.pico)}</td><td>${esc(k.falha)}</td><td>${fsg === null ? '—' : fsg.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</td></tr>`; }).join('')}</tbody></table>`;
            } else if (m === 'controle') {
                const k = d.controle;
                h += ['sistema', 'diagrama', 'esquema', 'modelo', 'reducao', 'projeto'].map((a, i) => par(`${i + 1}. ${['Sistema físico e especificações', 'Diagrama de blocos', 'Esquema', 'Modelo matemático', 'Redução', 'Análise e projeto'][i]}`, k[a])).join('');
                if (k.parametros.length) h += `<table><thead><tr><th>Parâmetro</th><th>Valor</th><th>Unidade</th><th>Levantamento</th></tr></thead><tbody>${k.parametros.map(x => `<tr><td>${esc(x.nome)}</td><td>${esc(x.valor)}</td><td>${esc(x.unidade)}</td><td>${esc(x.como)}</td></tr>`).join('')}</tbody></table>`;
                if (k.testes.length) h += `<table><thead><tr><th>Entrada</th><th>Resultado</th><th>Atende</th></tr></thead><tbody>${k.testes.map(x => `<tr><td>${esc(ENTRADAS_NISE[x.entrada])}</td><td>${esc(x.resultado)}</td><td>${x.atende === 'ok' ? 'sim' : x.atende === 'x' ? 'não' : '—'}</td></tr>`).join('')}</tbody></table>`;
                h += par('Sensibilidade', k.sensibilidade) + par('Robustez', k.robustez) + (k.conflito ? par('Requisitos conflitantes — reespecificação', k.reespecificacao || 'pendente') : '');
            } else h += par('Testes de unidade', d.software.testes);
            if (d.iteracoes.length) h += `<table><thead><tr><th>Data</th><th>Etapa</th><th>Feito / medido</th><th>Atende</th><th>Decisão</th></tr></thead><tbody>${d.iteracoes.map(x => `<tr><td>${esc(x.data)}</td><td>${esc(ETAPAS_ITER[x.etapa] || x.etapa)}</td><td>${esc(x.medido)}</td><td>${x.atende === 'ok' ? 'sim' : x.atende === 'x' ? 'não' : '—'}</td><td>${esc(DECISOES_ITER[x.decisao] || '')}</td></tr>`).join('')}</tbody></table>`;
            return h;
        }).join('') : '';
        return out;
    };
}
