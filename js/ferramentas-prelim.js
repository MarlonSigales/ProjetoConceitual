/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * FERRAMENTAS DO PROJETO PRELIMINAR (acrescentadas sem mudar o que já existe):
 *  - Dimensionamento com memória de cálculo (Reis, 2003, 3.2.2 "cálculos detalhados"): eixo, parafuso, rolamento (L10),
 *    motor, cabo (queda de tensão), bateria (autonomia), transmissão por corrente/correia. O resultado diz se atende à meta.
 *  - Material e processo pela exigência da peça (indicativo, para começar a escolha; confirmar com fornecedor/catálogo).
 *  - Diagnóstico de falha liga/desliga (Sigales, 2025, Tabelas 10–12): cada suspeito ligado/desligado, a medida de cada
 *    combinação e o efeito médio de cada um, para achar a causa.
 *  - Comparação com produtos comerciais medidos no mesmo teste e eficiência energética (Sigales, 2021, 2025).
 */

'use strict';

// ---------------------------------------------------------------- dados (normalização sem mexer em dados.js)

const preliminarVazioSemFerramentas = preliminarVazio;
preliminarVazio = function () {
    const o = preliminarVazioSemFerramentas();
    o.calculos = []; o.prototipo.diagnosticos = []; o.comparacao = { produtos: [], valores: {}, teste: '' }; o.eficiencia = [];
    return o;
};
const normalizarPreliminarSemFerramentas = normalizarPreliminar;
normalizarPreliminar = function (x) {
    const o = normalizarPreliminarSemFerramentas(x);
    const src = (x && typeof x === 'object') ? x : {};
    o.calculos = lista(src.calculos).map(c => Object.assign({ id: uid('cl'), tipo: 'eixo', nome: '', especId: '', obs: '' }, c, { entradas: Object.assign({}, c.entradas || {}) }));
    const pr = src.prototipo || {};
    o.prototipo.diagnosticos = lista(pr.diagnosticos).map(d => Object.assign({ id: uid('dg'), nome: '', medida: '', sentido: 'maior', conclusao: '' }, d, {
        suspeitos: lista(d.suspeitos).map(s => Object.assign({ id: uid('sp'), nome: '' }, s)),
        linhas: lista(d.linhas).map(l => Object.assign({ id: uid('dl'), valor: '', obs: '' }, l, { estados: Object.assign({}, l.estados || {}) }))
    }));
    const cp = src.comparacao || {};
    o.comparacao = { produtos: lista(cp.produtos).map(q => Object.assign({ id: uid('cp'), nome: '' }, q)), valores: Object.assign({}, cp.valores || {}), teste: cp.teste || '' };
    o.eficiencia = lista(src.eficiencia).map(e => Object.assign({ id: uid('ef'), nome: '', entradaW: null, saidaW: null, obs: '' }, e));
    return o;
};

const num = v => { if (v === null || v === undefined || String(v).trim() === '') return null; const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
const fmt = (v, d = 2) => (v === null || !isFinite(v) ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: d }));

// ---------------------------------------------------------------- 32 · calculadoras

const BITOLAS_MM2 = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
const ROSCAS_AT = [['M3', 5.03], ['M4', 8.78], ['M5', 14.2], ['M6', 20.1], ['M8', 36.6], ['M10', 58], ['M12', 84.3], ['M16', 157], ['M20', 245], ['M24', 353]]; // área resistente à tração (ISO 898-1)

/** Cada calculadora: campos de entrada e a função que devolve { valor, unidade, texto (memória de cálculo) }. */
const CALCULADORAS = {
    eixo: {
        nome: 'Eixo — flexão e torção (diâmetro mínimo)',
        campos: [['M', 'Momento fletor máximo (N·m)'], ['T', 'Torque (N·m)'], ['sadm', 'Tensão admissível do material (MPa)', 'ex.: aço SAE 1045 ≈ 100 a 150 com fator de segurança']],
        calc: e => {
            const M = num(e.M) || 0, T = num(e.T) || 0, s = num(e.sadm);
            if (!s || (!M && !T)) return null;
            const d = Math.cbrt(32 / (Math.PI * s * 1e6) * Math.sqrt(M * M + T * T)) * 1000;
            return { valor: d, unidade: 'mm', texto: `d = [32 / (π · σadm) · √(M² + T²)]^(1/3) = [32 / (π · ${fmt(s)} MPa) · √(${fmt(M)}² + ${fmt(T)}²)]^(1/3) = ${fmt(d)} mm (critério da máxima tensão de cisalhamento; arredonde para cima e confira concentração de tensões e fadiga).` };
        }
    },
    parafuso: {
        nome: 'Parafuso — tração (rosca mínima)',
        campos: [['F', 'Força axial por parafuso (N)'], ['Sp', 'Resistência de prova (MPa)', 'classe 8.8 ≈ 600; 10.9 ≈ 830; 4.6 ≈ 225'], ['n', 'Fator de segurança', 'ex.: 2']],
        calc: e => {
            const F = num(e.F), Sp = num(e.Sp), n = num(e.n) || 1;
            if (!F || !Sp) return null;
            const At = F * n / Sp, r = ROSCAS_AT.find(([, a]) => a >= At);
            return { valor: At, unidade: 'mm² (área resistente)', texto: `At = F · n / Sp = ${fmt(F)} N · ${fmt(n)} / ${fmt(Sp)} MPa = ${fmt(At)} mm² → rosca mínima ${r ? r[0] + ' (At = ' + fmt(r[1]) + ' mm²)' : 'acima de M24: use mais parafusos'}.` };
        }
    },
    rolamento: {
        nome: 'Rolamento — vida L10',
        campos: [['C', 'Capacidade dinâmica C (kN)', 'do catálogo'], ['P', 'Carga dinâmica equivalente P (kN)'], ['rpm', 'Rotação (rpm)'], ['tipo', 'Tipo: esferas ou rolos', 'esferas | rolos']],
        calc: e => {
            const C = num(e.C), P = num(e.P), n = num(e.rpm), p = /rolo/i.test(e.tipo || '') ? 10 / 3 : 3;
            if (!C || !P || !n) return null;
            const L = Math.pow(C / P, p), h = L * 1e6 / (60 * n);
            return { valor: h, unidade: 'h', texto: `L10 = (C/P)^${p === 3 ? '3' : '10/3'} = (${fmt(C)}/${fmt(P)})^${p === 3 ? '3' : '10/3'} = ${fmt(L)} milhões de voltas; L10h = L10 · 10⁶ / (60 · n) = ${fmt(h, 0)} h a ${fmt(n, 0)} rpm.` };
        }
    },
    motor: {
        nome: 'Motor — potência pelo torque e rotação',
        campos: [['T', 'Torque na carga (N·m)'], ['rpm', 'Rotação (rpm)'], ['eta', 'Rendimento da transmissão (%)', 'ex.: 85']],
        calc: e => {
            const T = num(e.T), n = num(e.rpm), eta = (num(e.eta) || 100) / 100;
            if (!T || !n) return null;
            const w = 2 * Math.PI * n / 60, P = T * w / eta;
            return { valor: P, unidade: 'W', texto: `ω = 2π · n / 60 = ${fmt(w)} rad/s; P = T · ω / η = ${fmt(T)} · ${fmt(w)} / ${fmt(eta)} = ${fmt(P, 1)} W (escolha o motor com folga; confira o torque de partida).` };
        }
    },
    cabo: {
        nome: 'Cabo — bitola pela queda de tensão (cobre)',
        campos: [['I', 'Corrente (A)'], ['L', 'Comprimento do cabo, só a ida (m)'], ['V', 'Tensão (V)'], ['queda', 'Queda de tensão máxima (%)', 'ex.: 3']],
        calc: e => {
            const I = num(e.I), L = num(e.L), V = num(e.V), q = num(e.queda) || 3;
            if (!I || !L || !V) return null;
            const rho = 0.0172, dV = V * q / 100, S = 2 * rho * L * I / dV, b = BITOLAS_MM2.find(x => x >= S);
            return { valor: S, unidade: 'mm²', texto: `S = 2 · ρ · L · I / ΔV = 2 · 0,0172 · ${fmt(L)} · ${fmt(I)} / ${fmt(dV)} V = ${fmt(S)} mm² → bitola comercial ${b ? b.toLocaleString('pt-BR') + ' mm²' : 'acima de 50 mm²'} (confira também a capacidade de corrente da bitola).` };
        }
    },
    bateria: {
        nome: 'Bateria — autonomia',
        campos: [['Ah', 'Capacidade (Ah)'], ['V', 'Tensão (V)'], ['W', 'Potência média consumida (W)'], ['dod', 'Profundidade de descarga usada (%)', 'chumbo ≈ 50; lítio ≈ 80']],
        calc: e => {
            const Ah = num(e.Ah), V = num(e.V), W = num(e.W), dod = (num(e.dod) || 80) / 100;
            if (!Ah || !V || !W) return null;
            const h = Ah * V * dod / W;
            return { valor: h, unidade: 'h', texto: `Autonomia = Ah · V · DoD / P = ${fmt(Ah)} · ${fmt(V)} · ${fmt(dod)} / ${fmt(W)} W = ${fmt(h)} h.` };
        }
    },
    transmissao: {
        nome: 'Transmissão por corrente ou correia',
        campos: [['n1', 'Rotação da motora (rpm)'], ['n2', 'Rotação desejada na movida (rpm)'], ['z1', 'Dentes da motora (ou diâmetro, mm)'], ['d', 'Diâmetro primitivo da motora (mm)', 'para a velocidade da corrente/correia']],
        calc: e => {
            const n1 = num(e.n1), n2 = num(e.n2), z1 = num(e.z1), d = num(e.d);
            if (!n1 || !n2) return null;
            const i = n1 / n2, z2 = z1 ? z1 * i : null, v = d ? Math.PI * d * n1 / 60000 : null;
            return { valor: i, unidade: '(relação)', texto: `i = n1 / n2 = ${fmt(n1)} / ${fmt(n2)} = ${fmt(i, 3)}${z2 ? `; movida com ${fmt(z2, 1)} (arredonde para um inteiro e recalcule n2)` : ''}${v ? `; velocidade = π · d · n1 / 60000 = ${fmt(v)} m/s` : ''}.` };
        }
    }
};

function resultadoCalculo(c) { const k = CALCULADORAS[c.tipo]; try { return k ? k.calc(c.entradas || {}) : null; } catch (e) { return null; } }

function htmlCalculos(p) {
    const pl = p.preliminar, esp = especsUsadas(p);
    return `<section class="card" id="dimensionamento">
        <div class="card-topo"><h2>Dimensionamento com memória de cálculo</h2>
            <div class="botoes"><select id="calc-tipo" aria-label="Tipo de cálculo">${Object.entries(CALCULADORAS).map(([k, c]) => `<option value="${k}">${esc(c.nome)}</option>`).join('')}</select>
            <button type="button" class="btn btn-primary btn-sm" data-acao="calc-add">+ Cálculo</button></div></div>
        <p class="nota">Cálculos prontos com a fórmula e os números à vista (vão para o relatório). Ligue a uma especificação para ver se atende à meta. São contas de pré-dimensionamento: confirme com norma, catálogo e simulação.</p>
        ${pl.calculos.length ? pl.calculos.map(c => {
            const k = CALCULADORAS[c.tipo] || CALCULADORAS.eixo, r = resultadoCalculo(c), e = esp.find(x => x.id === c.especId);
            const at = r && e ? atendeMeta(e, String(r.valor)) : null;
            return `<article class="calculo">
                <div class="card-topo"><b>${esc(k.nome)}</b><button type="button" class="btn-icone" data-acao="calc-del" data-id="${c.id}" aria-label="Excluir cálculo">✕</button></div>
                <div class="grade-campos">
                    <label>Para (peça ou item) <input type="text" data-campo="preliminar.calculos#${c.id}.nome" value="${escAttr(c.nome)}" maxlength="120" placeholder="ex.: eixo do cubo"></label>
                    ${k.campos.map(([cp, rot, dicaC]) => `<label>${esc(rot)} <input type="text" inputmode="decimal" data-campo="preliminar.calculos#${c.id}.entradas.${cp}" data-rerender value="${escAttr(c.entradas[cp] ?? '')}" maxlength="30" ${dicaC ? `placeholder="${escAttr(dicaC)}"` : ''}></label>`).join('')}
                    <label>Especificação ligada <select data-campo="preliminar.calculos#${c.id}.especId" data-rerender><option value="">—</option>${esp.map(x => `<option value="${x.id}" ${c.especId === x.id ? 'selected' : ''}>${esc(x.descricao)}${x.meta ? ' (' + esc(x.meta) + ')' : ''}</option>`).join('')}</select></label>
                </div>
                <p class="memoria">${r ? `<b>Resultado: ${fmt(r.valor, r.unidade === 'h' ? 0 : 2)} ${esc(r.unidade)}</b>${at === null ? '' : at ? ' <span class="ok">— atende à meta</span>' : ' <span class="nok">— não atende à meta</span>'}<br><small>${esc(r.texto)}</small>` : '<small>Preencha os valores para calcular.</small>'}</p>
            </article>`; }).join('') : vazio('Nenhum cálculo ainda. Escolha o tipo e clique em "+ Cálculo".')}
    </section>`;
}

// ---------------------------------------------------------------- 33 · material e processo pela exigência

const EXIGENCIAS = { resistencia: 'Resistência mecânica', corrosao: 'Umidade e corrosão', massa: 'Baixa massa', custo: 'Baixo custo', desgaste: 'Desgaste e atrito', temperatura: 'Temperatura', prototipo: 'Protótipo rápido' };
/** Notas indicativas de 1 a 5 (comparação entre si, não substitui o catálogo). */
const MATERIAIS_EXIG = [
    ['Aço SAE 1020', { resistencia: 3, corrosao: 1, massa: 1, custo: 5, desgaste: 2, temperatura: 4, prototipo: 2 }, 'Corte a laser e dobra; solda; usinagem', 'pintar ou zincar contra corrosão'],
    ['Aço SAE 1045', { resistencia: 4, corrosao: 1, massa: 1, custo: 4, desgaste: 4, temperatura: 4, prototipo: 2 }, 'Usinagem; tratamento térmico', 'eixos e peças com esforço'],
    ['Aço inox AISI 304', { resistencia: 3, corrosao: 5, massa: 1, custo: 2, desgaste: 3, temperatura: 5, prototipo: 2 }, 'Corte a laser e dobra; solda TIG; usinagem', 'contato com adubo, defensivos e água'],
    ['Alumínio 6061-T6', { resistencia: 3, corrosao: 4, massa: 5, custo: 3, desgaste: 2, temperatura: 3, prototipo: 3 }, 'Usinagem; extrusão; corte a laser', 'leve; anodizar'],
    ['PLA (impressão 3D)', { resistencia: 1, corrosao: 3, massa: 5, custo: 5, desgaste: 1, temperatura: 1, prototipo: 5 }, 'Impressão 3D (protótipo) → injeção', 'amolece perto de 55 °C; poroso: vedar com resina'],
    ['PETG (impressão 3D)', { resistencia: 2, corrosao: 4, massa: 5, custo: 4, desgaste: 2, temperatura: 2, prototipo: 4 }, 'Impressão 3D (protótipo)', 'mais resistente ao calor e ao impacto que o PLA'],
    ['Nylon PA6', { resistencia: 3, corrosao: 3, massa: 4, custo: 3, desgaste: 5, temperatura: 3, prototipo: 3 }, 'Usinagem; injeção', 'absorve umidade (muda de medida)'],
    ['Polipropileno (PP)', { resistencia: 2, corrosao: 5, massa: 5, custo: 5, desgaste: 2, temperatura: 2, prototipo: 2 }, 'Injeção; rotomoldagem', 'resiste a produtos químicos'],
    ['Borracha NBR', { resistencia: 1, corrosao: 4, massa: 4, custo: 4, desgaste: 3, temperatura: 3, prototipo: 2 }, 'Moldagem (peça de catálogo)', 'vedações; resiste a óleo']
];
function materiaisPorExigencia(sel) {
    const ks = Object.keys(EXIGENCIAS).filter(k => sel[k]);
    if (!ks.length) return [];
    return MATERIAIS_EXIG.map(([nome, n, proc, obs]) => ({ nome, proc, obs, nota: ks.reduce((t, k) => t + (n[k] || 0), 0) / ks.length, min: Math.min(...ks.map(k => n[k] || 0)) }))
        .sort((a, b) => b.nota - a.nota || b.min - a.min).slice(0, 4);
}
function htmlMaterialExigencia(p) {
    const sel = App.exigencias || {}, sug = materiaisPorExigencia(sel);
    const fabricadas = p.preliminar.portadores.filter(x => x.origem === 'fabricado');
    return `<section class="card" id="material-exigencia">
        <h2>Escolher material e processo pela exigência</h2>
        <p class="nota">Marque o que a peça precisa; a lista mostra os materiais mais indicados (notas indicativas de 1 a 5, comparando os materiais entre si — confirme no catálogo do fornecedor).</p>
        <div class="chips">${Object.entries(EXIGENCIAS).map(([k, t]) => `<button type="button" class="chip ${sel[k] ? 'chip-ativo' : ''}" aria-pressed="${!!sel[k]}" data-acao="exig" data-k="${k}">${sel[k] ? '✓ ' : ''}${esc(t)}</button>`).join('')}</div>
        ${sug.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Material</th><th>Nota</th><th>Processo</th><th>Cuidado</th><th>Usar na peça</th></tr></thead><tbody>
            ${sug.map((m, i) => `<tr><td><b>${esc(m.nome)}</b></td><td class="col-num">${fmt(m.nota, 1)}${m.min <= 1 ? ' <small class="nok">ponto fraco</small>' : ''}</td><td>${esc(m.proc)}</td><td class="pequeno">${esc(m.obs)}</td>
            <td>${fabricadas.length ? `<select data-mat="${i}" aria-label="Peça"><option value="">escolha a peça…</option>${fabricadas.map(x => `<option value="${x.id}">${esc(x.nome)}${x.material ? ' (' + esc(x.material) + ')' : ''}</option>`).join('')}</select>` : '<small>sem peças fabricadas</small>'}</td></tr>`).join('')}</tbody></table></div>` : ''}
    </section>`;
}

// ---------------------------------------------------------------- 39 · diagnóstico de falha liga/desliga

function combinacoes(n) { const out = []; for (let m = (1 << n) - 1; m >= 0; m--) out.push([...Array(n)].map((_, i) => !!(m & (1 << (n - 1 - i))))); return out; }
/** Efeito médio de cada suspeito: média da medida com ele LIGADO − média com ele DESLIGADO (só linhas com valor). */
function efeitosDiagnostico(d) {
    const linhas = d.linhas.filter(l => num(l.valor) !== null);
    return d.suspeitos.map(s => {
        const on = linhas.filter(l => l.estados[s.id]).map(l => num(l.valor)), off = linhas.filter(l => !l.estados[s.id]).map(l => num(l.valor));
        const m = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
        const ef = m(on) !== null && m(off) !== null ? m(on) - m(off) : null;
        return { id: s.id, nome: s.nome, efeito: ef, nOn: on.length, nOff: off.length };
    }).sort((a, b) => Math.abs(b.efeito ?? 0) - Math.abs(a.efeito ?? 0));
}
function htmlDiagnosticos(p) {
    const D = p.preliminar.prototipo.diagnosticos;
    return `<section class="card" id="diagnostico">
        <div class="card-topo"><h2>Diagnóstico de falha (liga/desliga)</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="dg-add">+ Diagnóstico</button></div>
        <p class="nota">Quando um teste falha e há vários suspeitos (ex.: vedações), teste cada combinação ligando e desligando um suspeito de cada vez e anote a medida (Sigales, 2025, Tabelas 10–12). O efeito médio mostra qual suspeito mais pesa. Ligado = o item está presente/atuando (ex.: vedação colocada).</p>
        ${D.map(d => { const ef = efeitosDiagnostico(d), top = ef.find(x => x.efeito !== null); return `<article class="calculo">
            <div class="card-topo"><input class="titulo-campo" type="text" data-campo="preliminar.prototipo.diagnosticos#${d.id}.nome" value="${escAttr(d.nome)}" maxlength="120" placeholder="Nome (ex.: Estanqueidade do cilindro)" aria-label="Nome do diagnóstico">
                <button type="button" class="btn-icone" data-acao="dg-del" data-id="${d.id}" aria-label="Excluir">✕</button></div>
            <div class="grade-campos">
                <label>Medida (com unidade) <input type="text" data-campo="preliminar.prototipo.diagnosticos#${d.id}.medida" value="${escAttr(d.medida)}" maxlength="80" placeholder="ex.: pressão no cilindro (mmHg)"></label>
                <label>Melhor quando a medida é <select data-campo="preliminar.prototipo.diagnosticos#${d.id}.sentido" data-rerender><option value="maior" ${d.sentido !== 'menor' ? 'selected' : ''}>maior (em módulo)</option><option value="menor" ${d.sentido === 'menor' ? 'selected' : ''}>menor</option></select></label>
            </div>
            <h3>Suspeitos (até 5)</h3>
            <div class="chips">${d.suspeitos.map(s => `<span class="chip chip-fixo"><input type="text" data-campo="preliminar.prototipo.diagnosticos#${d.id}.suspeitos#${s.id}.nome" value="${escAttr(s.nome)}" maxlength="60" aria-label="Suspeito" style="width:11rem"><button type="button" class="btn-icone" data-acao="dg-susp-del" data-id="${d.id}" data-s="${s.id}" aria-label="Tirar">✕</button></span>`).join('')}
                ${d.suspeitos.length < 5 ? `<button type="button" class="chip" data-acao="dg-susp" data-id="${d.id}">+ Suspeito</button>` : ''}
                ${d.suspeitos.length ? `<button type="button" class="chip" data-acao="dg-comb" data-id="${d.id}" title="Cria uma linha para cada combinação liga/desliga">Gerar as ${1 << d.suspeitos.length} combinações</button>` : ''}</div>
            ${d.linhas.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr>${d.suspeitos.map(s => `<th class="col-centro">${esc(s.nome || 'suspeito')}</th>`).join('')}<th>${esc(d.medida || 'Medida')}</th><th>Observação</th><th></th></tr></thead><tbody>
                ${d.linhas.map(l => `<tr>${d.suspeitos.map(s => `<td class="col-centro"><input type="checkbox" data-campo="preliminar.prototipo.diagnosticos#${d.id}.linhas#${l.id}.estados.${s.id}" data-rerender ${l.estados[s.id] ? 'checked' : ''} aria-label="${escAttr(s.nome)} ligado"></td>`).join('')}
                <td><input type="text" inputmode="decimal" data-campo="preliminar.prototipo.diagnosticos#${d.id}.linhas#${l.id}.valor" data-rerender value="${escAttr(l.valor)}" maxlength="20" style="width:7rem" aria-label="Medida"></td>
                <td><input type="text" data-campo="preliminar.prototipo.diagnosticos#${d.id}.linhas#${l.id}.obs" value="${escAttr(l.obs)}" maxlength="200" aria-label="Observação"></td>
                <td class="col-acao"><button type="button" class="btn-icone" data-acao="dg-linha-del" data-id="${d.id}" data-l="${l.id}" aria-label="Excluir linha">✕</button></td></tr>`).join('')}</tbody></table></div>
                <h3>Efeito de cada suspeito</h3>
                <ul class="efeitos">${ef.map(x => `<li><b>${esc(x.nome || 'suspeito')}</b>: ${x.efeito === null ? 'faltam medidas com ele ligado e desligado' : `${x.efeito >= 0 ? '+' : ''}${fmt(x.efeito)} ${esc((d.medida.match(/\(([^)]+)\)/) || [])[1] || '')} em média quando ligado`}</li>`).join('')}</ul>
                ${top ? `<p class="recomendacao">Maior efeito: <b>${esc(top.nome)}</b> — é por onde começar a correção.</p>` : ''}` : ''}
            <label class="campo-participantes">Conclusão (causa achada e correção) <textarea rows="2" data-campo="preliminar.prototipo.diagnosticos#${d.id}.conclusao" maxlength="1500">${esc(d.conclusao)}</textarea></label>
        </article>`; }).join('') || vazio('Nenhum diagnóstico. Use quando um teste falhar e houver mais de uma causa possível.')}
    </section>`;
}

// ---------------------------------------------------------------- 40 · produtos comerciais e eficiência energética

function htmlComparacaoComercial(p) {
    const pl = p.preliminar, cp = pl.comparacao, esp = especsUsadas(p);
    if (!cp.produtos.length && (p.concorrentes || []).length) { cp.produtos = p.concorrentes.filter(c => c.nome).map(c => ({ id: uid('cp'), nome: c.nome })); }
    const val = (pid, eid) => ((cp.valores[pid] || {})[eid] ?? '');
    const marca = (e, v) => { const r = String(v).trim() ? atendeMeta(e, v) : null; return r === null ? '' : r ? ' <small class="ok">✓</small>' : ' <small class="nok">✗</small>'; };
    return `<section class="card" id="comparacao-comercial">
        <div class="card-topo"><h2>Comparação com produtos comerciais (mesmo teste)</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="cmp-add">+ Produto</button></div>
        <p class="nota">Meça um produto do mercado no <b>mesmo</b> teste e nas mesmas condições, como a tese fez com um dosador comercial. Os concorrentes do QFD já entram como colunas.</p>
        <label class="campo-participantes">Teste e condições usados <input type="text" data-campo="preliminar.comparacao.teste" value="${escAttr(cp.teste)}" maxlength="300" placeholder="ex.: bancada, 5 km/h, 0°, 5 repetições"></label>
        ${cp.produtos.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Especificação</th><th>Meta</th><th>Nosso</th>${cp.produtos.map(q => `<th><input type="text" data-campo="preliminar.comparacao.produtos#${q.id}.nome" value="${escAttr(q.nome)}" maxlength="80" aria-label="Produto" style="min-width:8rem"><button type="button" class="btn-icone" data-acao="cmp-del" data-id="${q.id}" aria-label="Tirar">✕</button></th>`).join('')}</tr></thead><tbody>
            ${esp.map(e => { const nosso = (pl.adequacao[e.id] || {}).valor || ''; return `<tr><td>${esc(e.descricao)}</td><td class="col-meta">${esc(e.meta || '')}</td><td class="col-num">${esc(nosso || '—')}${marca(e, nosso)}</td>
                ${cp.produtos.map(q => `<td><input type="text" data-campo="preliminar.comparacao.valores.${q.id}.${e.id}" data-rerender value="${escAttr(val(q.id, e.id))}" maxlength="40" style="width:6rem" aria-label="Valor">${marca(e, val(q.id, e.id))}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>` : ''}
    </section>
    <section class="card" id="eficiencia">
        <div class="card-topo"><h2>Eficiência energética</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="ef-add">+ Medição</button></div>
        <p class="nota">η = potência útil na saída ÷ potência na entrada. Compare as alternativas (ex.: acionamento elétrico × transmissão mecânica, como na dissertação).</p>
        ${pl.eficiencia.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Alternativa / condição</th><th>Entrada (W)</th><th>Saída útil (W)</th><th>η</th><th>Observação</th><th></th></tr></thead><tbody>
            ${pl.eficiencia.map(x => { const a = num(x.entradaW), b = num(x.saidaW), eta = a && b !== null ? b / a * 100 : null; return `<tr><td><input type="text" data-campo="preliminar.eficiencia#${x.id}.nome" value="${escAttr(x.nome)}" maxlength="120" aria-label="Alternativa"></td>
                <td><input type="text" inputmode="decimal" data-campo="preliminar.eficiencia#${x.id}.entradaW" data-rerender value="${escAttr(x.entradaW ?? '')}" style="width:6rem" aria-label="Entrada"></td>
                <td><input type="text" inputmode="decimal" data-campo="preliminar.eficiencia#${x.id}.saidaW" data-rerender value="${escAttr(x.saidaW ?? '')}" style="width:6rem" aria-label="Saída"></td>
                <td class="col-num"><b>${eta === null ? '—' : fmt(eta, 1) + '%'}</b>${eta !== null && eta > 100 ? ' <small class="nok">confira: acima de 100%</small>' : ''}</td>
                <td><input type="text" data-campo="preliminar.eficiencia#${x.id}.obs" value="${escAttr(x.obs)}" maxlength="200" aria-label="Observação"></td>
                <td class="col-acao"><button type="button" class="btn-icone" data-acao="ef-del" data-id="${x.id}" aria-label="Excluir">✕</button></td></tr>`; }).join('')}</tbody></table></div>` : ''}
    </section>`;
}

// ---------------------------------------------------------------- ganchos nas páginas e no relatório (só acrescentam)

function inserirAntes(html, marca, novo) { return html.includes(marca) ? html.replace(marca, novo + marca) : html + novo; }

const renderVerifFerr = PAGINAS['p-verificacoes'].render;
PAGINAS['p-verificacoes'].render = function (p) {
    let html = renderVerifFerr(p);
    if (!concepcaoEscolhida(p)) return html;
    try { html = inserirAntes(html, '<section class="card cartao-componentes"', htmlCalculos(p) + htmlMaterialExigencia(p)); } catch (e) { console.error(e); }
    return html;
};
const renderProtFerr = PAGINAS['p-prototipo'].render;
PAGINAS['p-prototipo'].render = function (p) {
    let html = renderProtFerr(p);
    if (!concepcaoEscolhida(p)) return html;
    try { html = inserirAntes(html, '<section class="card">\n            <h2>Ciclo do protótipo</h2>', htmlDiagnosticos(p)); } catch (e) { console.error(e); }
    return html;
};
const renderAdeqFerr = PAGINAS['p-adequacao'].render;
PAGINAS['p-adequacao'].render = function (p) {
    let html = renderAdeqFerr(p);
    if (!concepcaoEscolhida(p)) return html;
    try { html += htmlComparacaoComercial(p); } catch (e) { console.error(e); }
    return html;
};

const secoesPrelimFerr = secoesRelatorioPreliminar;
secoesRelatorioPreliminar = function (p, img) {
    const s = secoesPrelimFerr(p, img), pl = p.preliminar;
    try {
        const calc = pl.calculos.map(c => ({ c, r: resultadoCalculo(c) })).filter(x => x.r);
        if (calc.length) s.splice(Math.max(0, s.findIndex(([t]) => t === 'Verificações e lista de partes')), 0, ['Dimensionamento', `<table><thead><tr><th>Cálculo</th><th>Para</th><th>Resultado</th><th>Memória de cálculo</th></tr></thead><tbody>
            ${calc.map(({ c, r }) => `<tr><td>${esc((CALCULADORAS[c.tipo] || {}).nome || c.tipo)}</td><td>${esc(c.nome)}</td><td class="num">${fmt(r.valor, r.unidade === 'h' ? 0 : 2)} ${esc(r.unidade)}</td><td>${esc(r.texto)}</td></tr>`).join('')}</tbody></table>`]);
        const D = pl.prototipo.diagnosticos.filter(d => d.linhas.some(l => num(l.valor) !== null));
        if (D.length) s.push(['Diagnóstico de falhas (liga/desliga)', D.map(d => `<h3>${esc(d.nome || 'Diagnóstico')} — ${esc(d.medida)}</h3><table><thead><tr>${d.suspeitos.map(x => `<th>${esc(x.nome)}</th>`).join('')}<th>Medida</th></tr></thead><tbody>
            ${d.linhas.map(l => `<tr>${d.suspeitos.map(x => `<td class="centro">${l.estados[x.id] ? '1' : '0'}</td>`).join('')}<td class="num">${esc(l.valor)}</td></tr>`).join('')}</tbody></table>
            <p>Efeito médio (ligado − desligado): ${efeitosDiagnostico(d).map(x => `${esc(x.nome)} ${x.efeito === null ? '—' : fmt(x.efeito)}`).join('; ')}.${d.conclusao ? ' ' + esc(d.conclusao) : ''}</p>`).join('')]);
        const cp = pl.comparacao, esp = especsUsadas(p);
        if (cp.produtos.length && cp.produtos.some(q => Object.values(cp.valores[q.id] || {}).some(v => String(v).trim()))) s.push(['Comparação com produtos comerciais', `${cp.teste ? `<p>Teste: ${esc(cp.teste)}</p>` : ''}<table><thead><tr><th>Especificação</th><th>Meta</th><th>Nosso</th>${cp.produtos.map(q => `<th>${esc(q.nome)}</th>`).join('')}</tr></thead><tbody>
            ${esp.map(e => `<tr><td>${esc(e.descricao)}</td><td>${esc(e.meta)}</td><td class="num">${esc((pl.adequacao[e.id] || {}).valor || '—')}</td>${cp.produtos.map(q => `<td class="num">${esc((cp.valores[q.id] || {})[e.id] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table>`]);
        const ef = pl.eficiencia.filter(x => num(x.entradaW) && num(x.saidaW) !== null);
        if (ef.length) s.push(['Eficiência energética', `<table><thead><tr><th>Alternativa</th><th>Entrada (W)</th><th>Saída (W)</th><th>η</th></tr></thead><tbody>${ef.map(x => `<tr><td>${esc(x.nome)}</td><td class="num">${fmt(num(x.entradaW))}</td><td class="num">${fmt(num(x.saidaW))}</td><td class="num">${fmt(num(x.saidaW) / num(x.entradaW) * 100, 1)}%</td></tr>`).join('')}</tbody></table>`]);
    } catch (e) { console.error(e); }
    return s;
};

// ---------------------------------------------------------------- ações

const acharDg = id => PC.p.preliminar.prototipo.diagnosticos.find(d => d.id === id);
Object.assign(ACOES, {
    'calc-add': () => { const t = ($('#calc-tipo') || {}).value || 'eixo'; PC.p.preliminar.calculos.push({ id: uid('cl'), tipo: t, nome: '', especId: '', obs: '', entradas: {} }); salvar(); renderPagina(true); },
    'calc-del': b => { if (!confirm('Excluir este cálculo?')) return; PC.p.preliminar.calculos = PC.p.preliminar.calculos.filter(c => c.id !== b.dataset.id); salvar(); renderPagina(true); },
    'exig': b => { App.exigencias = Object.assign({}, App.exigencias || {}); App.exigencias[b.dataset.k] = !App.exigencias[b.dataset.k]; renderPagina(true); },
    'dg-add': () => { PC.p.preliminar.prototipo.diagnosticos.push({ id: uid('dg'), nome: '', medida: '', sentido: 'maior', conclusao: '', suspeitos: [], linhas: [] }); salvar(); renderPagina(true); },
    'dg-del': b => { if (!confirm('Excluir este diagnóstico?')) return; const pr = PC.p.preliminar.prototipo; pr.diagnosticos = pr.diagnosticos.filter(d => d.id !== b.dataset.id); salvar(); renderPagina(true); },
    'dg-susp': b => { const d = acharDg(b.dataset.id); if (d.suspeitos.length >= 5) return; d.suspeitos.push({ id: uid('sp'), nome: '' }); salvar(); renderPagina(true); },
    'dg-susp-del': b => { const d = acharDg(b.dataset.id); d.suspeitos = d.suspeitos.filter(s => s.id !== b.dataset.s); d.linhas.forEach(l => delete l.estados[b.dataset.s]); salvar(); renderPagina(true); },
    'dg-comb': b => {
        const d = acharDg(b.dataset.id);
        if (d.linhas.some(l => String(l.valor).trim()) && !confirm('Já há medidas anotadas. Acrescentar só as combinações que faltam?')) return;
        const chave = l => d.suspeitos.map(s => (l.estados[s.id] ? 1 : 0)).join('');
        const tem = new Set(d.linhas.map(chave));
        combinacoes(d.suspeitos.length).forEach(c => { const estados = {}; d.suspeitos.forEach((s, i) => { estados[s.id] = c[i]; }); const l = { id: uid('dl'), estados, valor: '', obs: '' }; if (!tem.has(chave(l))) d.linhas.push(l); });
        salvar(); renderPagina(true);
    },
    'dg-linha-del': b => { const d = acharDg(b.dataset.id); d.linhas = d.linhas.filter(l => l.id !== b.dataset.l); salvar(); renderPagina(true); },
    'cmp-add': () => { PC.p.preliminar.comparacao.produtos.push({ id: uid('cp'), nome: '' }); salvar(); renderPagina(true); },
    'cmp-del': b => { const cp = PC.p.preliminar.comparacao; cp.produtos = cp.produtos.filter(q => q.id !== b.dataset.id); delete cp.valores[b.dataset.id]; salvar(); renderPagina(true); },
    'ef-add': () => { PC.p.preliminar.eficiencia.push({ id: uid('ef'), nome: '', entradaW: null, saidaW: null, obs: '' }); salvar(); renderPagina(true); },
    'ef-del': b => { PC.p.preliminar.eficiencia = PC.p.preliminar.eficiencia.filter(x => x.id !== b.dataset.id); salvar(); renderPagina(true); }
});

/** Escolher a peça na tabela de materiais aplica o material e o processo (só se a peça ainda não tiver). */
document.addEventListener('change', e => {
    const el = e.target;
    if (!el || !el.dataset || el.dataset.mat === undefined || !el.value) return;
    const m = materiaisPorExigencia(App.exigencias || {})[+el.dataset.mat], x = PC.p.preliminar.portadores.find(y => y.id === el.value);
    if (!m || !x) return;
    if (x.material && !confirm(`"${x.nome}" já tem material (${x.material}). Trocar por ${m.nome}?`)) { el.value = ''; return; }
    x.material = m.nome; if (!x.processo) x.processo = m.proc.split(';')[0].trim();
    salvar(); renderPagina(true); avisar(`${x.nome}: ${m.nome}.`);
});
