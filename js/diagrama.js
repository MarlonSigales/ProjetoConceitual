/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * EDITOR DA ESTRUTURA DE FUNÇÕES (diagrama de blocos)
 * - Blocos de função e blocos laterais (usuário, fonte de potência, ambiente… — Spagnolo, 2011, Fig. 38).
 * - Ligações de energia (linha simples), material (linha dupla) e sinal (tracejada) com rótulo — mesma
 *   convenção da caixa-preta do QFD.
 * - Níveis: cada função pode ser aberta para editar as funções internas (parciais → elementares). Dentro de
 *   uma função, os fluxos que entram e saem dela no nível de cima aparecem como "portas" na fronteira.
 * - Fronteira do sistema desenhada em volta das funções do nível.
 * - Exporta cada nível em SVG (para o ZIP e o relatório).
 */

'use strict';

const COR_FLUXO = { energia: '#b5462f', material: '#085357', sinal: '#2f6fb3' };
const PORTA_STUB = 120;

// ============================================================================
// MANUTENÇÃO DA ESTRUTURA (exclusões em cascata)
// ============================================================================

function descendentes(est, id) {
    const out = [];
    const visita = pid => est.nos.filter(n => n.pai === pid).forEach(n => { out.push(n.id); visita(n.id); });
    visita(id);
    return out;
}

/** Remove a ligação e as ligações internas que usam a porta dela. */
function removerLigacao(est, id) {
    const remover = new Set([id]);
    let mudou = true;
    while (mudou) {
        mudou = false;
        est.ligacoes.forEach(l => {
            if (remover.has(l.id)) return;
            const usa = [l.de, l.para].some(x => typeof x === 'string' && x.startsWith('porta:') && remover.has(x.slice(6)));
            if (usa) { remover.add(l.id); mudou = true; }
        });
    }
    est.ligacoes = est.ligacoes.filter(l => !remover.has(l.id));
}

/** Remove o bloco, as funções internas, as ligações e os princípios ligados (e as escolhas nas concepções). */
function removerNo(p, est, id) {
    const ids = new Set([id, ...descendentes(est, id)]);
    est.ligacoes.filter(l => ids.has(l.de) || ids.has(l.para) || ids.has(l.pai)).map(l => l.id).forEach(lid => removerLigacao(est, lid));
    est.nos = est.nos.filter(n => !ids.has(n.id));
    ids.forEach(fid => {
        const prs = (p.principios[fid] || []).map(x => x.id);
        delete p.principios[fid];
        p.incompatibilidades = p.incompatibilidades.filter(x => !prs.includes(x.a) && !prs.includes(x.b));
        p.variantes.forEach(v => delete v.escolhas[fid]);
    });
}

/** Copia uma estrutura inteira com ids novos (para criar alternativas). Devolve a cópia e o mapa de ids. */
function duplicarEstrutura(est, nome) {
    const mapa = {};
    const nova = clonar(est);
    nova.id = uid('est'); nova.nome = nome || est.nome + ' (cópia)';
    nova.nos.forEach(n => { mapa[n.id] = uid(n.tipo === 'funcao' ? 'fn' : 'ex'); });
    nova.ligacoes.forEach(l => { mapa['lig:' + l.id] = uid('lg'); });
    const tr = x => {
        if (x == null) return x;
        if (typeof x === 'string' && x.startsWith('porta:')) return 'porta:' + (mapa['lig:' + x.slice(6)] || x.slice(6));
        return mapa[x] || x;
    };
    nova.nos.forEach(n => { n.id = mapa[n.id]; n.pai = tr(n.pai); });
    nova.ligacoes.forEach(l => { l.id = mapa['lig:' + l.id]; l.de = tr(l.de); l.para = tr(l.para); l.pai = tr(l.pai); });
    return { estrutura: nova, mapa };
}

// ============================================================================
// GEOMETRIA DE UM NÍVEL
// ============================================================================

function quebrarTexto(t, max) {
    const pal = String(t || '').split(/\s+/).filter(Boolean), linhas = [];
    let cur = '';
    pal.forEach(w => {
        if (!cur) cur = w;
        else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
        else { linhas.push(cur); cur = w; }
    });
    if (cur) linhas.push(cur);
    return linhas.map(l => l.length > max + 4 ? l.slice(0, max + 2) + '…' : l);
}

function caixa(ns, pad) {
    if (!ns.length) return null;
    const x1 = Math.min(...ns.map(n => n.x)) - pad, y1 = Math.min(...ns.map(n => n.y)) - pad;
    const x2 = Math.max(...ns.map(n => n.x + n.w)) + pad, y2 = Math.max(...ns.map(n => n.y + n.h)) + pad;
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/** Portas: fluxos que entram/saem da função "pai" no nível de cima. */
function portasDoNivel(est, pai) {
    if (!pai) return { entradas: [], saidas: [] };
    const f = est.nos.find(n => n.id === pai);
    if (!f) return { entradas: [], saidas: [] };
    const doCima = est.ligacoes.filter(l => (l.pai || null) === (f.pai || null));
    return { entradas: doCima.filter(l => l.para === pai), saidas: doCima.filter(l => l.de === pai) };
}

function geometriaNivel(est, pai) {
    pai = pai || null;
    const nos = nosDoNivel(est, pai);
    const funcoes = nos.filter(n => n.tipo === 'funcao');
    const pt = portasDoNivel(est, pai);
    let fr = caixa(funcoes, pai ? 50 : 30);
    if (fr && pai) { fr.x -= 50; fr.w += 100; }
    if (!fr && pai) fr = { x: 200, y: 80, w: 420, h: 260 };
    if (fr && pai) {
        const minH = Math.max(pt.entradas.length, pt.saidas.length) * 48 + 40;
        if (fr.h < minH) { fr.y -= (minH - fr.h) / 2; fr.h = minH; }
    }
    const portas = {};
    if (fr) {
        const distribui = (lista, x, lado) => lista.forEach((l, i) => {
            portas['porta:' + l.id] = { id: 'porta:' + l.id, lig: l, lado, x, y: fr.y + fr.h * (i + 1) / (lista.length + 1) };
        });
        distribui(pt.entradas, fr.x, 'entrada');
        distribui(pt.saidas, fr.x + fr.w, 'saida');
    }
    const porId = {};
    nos.forEach(n => porId[n.id] = n);
    const ligs = ligacoesDoNivel(est, pai).filter(l => (porId[l.de] || portas[l.de]) && (porId[l.para] || portas[l.para]));
    const centro = id => porId[id] ? { x: porId[id].x + porId[id].w / 2, y: porId[id].y + porId[id].h / 2 } : { x: portas[id].x, y: portas[id].y };

    // lados de saída/entrada e distribuição dos pontos ao longo de cada lado
    const pontas = [];
    ligs.forEach(l => {
        const a = centro(l.de), b = centro(l.para);
        const dx = b.x - a.x, dy = b.y - a.y;
        let sa, sb;
        if (portas[l.de]) { sa = 'R'; sb = portas[l.para] ? 'L' : (Math.abs(dx) >= Math.abs(dy) * 0.6 || dx > 0 ? 'L' : (dy > 0 ? 'T' : 'B')); }
        else if (portas[l.para]) { sb = 'L'; sa = Math.abs(dx) >= Math.abs(dy) * 0.6 || dx > 0 ? 'R' : (dy > 0 ? 'B' : 'T'); }
        else if (Math.abs(dx) >= Math.abs(dy) * 0.8) { sa = dx >= 0 ? 'R' : 'L'; sb = dx >= 0 ? 'L' : 'R'; }
        else { sa = dy >= 0 ? 'B' : 'T'; sb = dy >= 0 ? 'T' : 'B'; }
        pontas.push({ l, ponta: 'de', no: l.de, lado: sa, outro: b });
        pontas.push({ l, ponta: 'para', no: l.para, lado: sb, outro: a });
    });
    const pos = {};
    const grupos = {};
    pontas.forEach(pp => { if (porId[pp.no]) (grupos[pp.no + '|' + pp.lado] = grupos[pp.no + '|' + pp.lado] || []).push(pp); });
    Object.values(grupos).forEach(g => {
        const n = porId[g[0].no], lado = g[0].lado, horiz = lado === 'L' || lado === 'R';
        g.sort((p1, p2) => horiz ? p1.outro.y - p2.outro.y : p1.outro.x - p2.outro.x);
        g.forEach((pp, i) => {
            const f = (i + 1) / (g.length + 1);
            const ptn = lado === 'L' ? { x: n.x, y: n.y + n.h * f } : lado === 'R' ? { x: n.x + n.w, y: n.y + n.h * f }
                : lado === 'T' ? { x: n.x + n.w * f, y: n.y } : { x: n.x + n.w * f, y: n.y + n.h };
            pos[pp.l.id + '|' + pp.ponta] = Object.assign(ptn, { lado });
        });
    });
    pontas.forEach(pp => { if (portas[pp.no]) pos[pp.l.id + '|' + pp.ponta] = { x: portas[pp.no].x, y: portas[pp.no].y, lado: pp.lado }; });
    // linhas que saem do mesmo lado de um bloco descem/sobem em colunas próprias (não se sobrepõem)
    const desvio = {};
    Object.values(grupos).forEach(g => {
        const saem = g.filter(pp => pp.ponta === 'de');
        saem.forEach((pp, i) => { desvio[pp.l.id] = (i - (saem.length - 1) / 2) * 14; });
    });

    const linhas = ligs.map(l => {
        const a = pos[l.id + '|de'], b = pos[l.id + '|para'];
        const pts = [a];
        const sai = { R: [1, 0], L: [-1, 0], B: [0, 1], T: [0, -1] };
        const horizA = a.lado === 'L' || a.lado === 'R', horizB = b.lado === 'L' || b.lado === 'R';
        if (horizA && horizB) {
            if (Math.abs(a.y - b.y) > 0.5) {
                let mx = (a.x + b.x) / 2 + (desvio[l.id] || 0) * (a.lado === 'R' ? -1 : 1);
                if ((a.lado === 'R' && mx < a.x + 16) || (a.lado === 'L' && mx > a.x - 16)) {
                    // volta: sai 20 px, desce/sobe por fora e entra
                    const ax = a.x + sai[a.lado][0] * 22, bx = b.x + sai[b.lado][0] * 22;
                    const my = (a.y + b.y) / 2;
                    pts.push({ x: ax, y: a.y }, { x: ax, y: my }, { x: bx, y: my }, { x: bx, y: b.y });
                } else pts.push({ x: mx, y: a.y }, { x: mx, y: b.y });
            }
        } else if (!horizA && !horizB) {
            if (Math.abs(a.x - b.x) > 0.5) { const my = (a.y + b.y) / 2; pts.push({ x: a.x, y: my }, { x: b.x, y: my }); }
        } else if (horizA) pts.push({ x: b.x, y: a.y });
        else pts.push({ x: a.x, y: b.y });
        pts.push(b);
        // ponto do rótulo: segmento horizontal mais longo (o texto cabe melhor); senão, o vertical mais longo
        let melhor = -1, rot = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, vertical: false, len: 80 };
        for (let i = 0; i < pts.length - 1; i++) {
            const dx = Math.abs(pts[i + 1].x - pts[i].x), dy = Math.abs(pts[i + 1].y - pts[i].y);
            const nota = dx > 1 ? dx * 1.8 : dy;
            if (nota > melhor) { melhor = nota; rot = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2, vertical: dx <= 1, len: dx > 1 ? dx : 150 }; }
        }
        return { l, pts, rot };
    });

    const todos = nos.map(n => ({ x: n.x, y: n.y, w: n.w, h: n.h }));
    if (fr) todos.push({ x: fr.x - (pt.entradas.length ? PORTA_STUB + 10 : 0), y: fr.y - 24, w: fr.w + (pt.entradas.length ? PORTA_STUB + 10 : 0) + (pt.saidas.length ? PORTA_STUB + 10 : 0), h: fr.h + 30 });
    const bbox = caixa(todos, 30) || { x: 0, y: 0, w: 800, h: 500 };
    return { nos, fr, portas, linhas, bbox };
}

// ============================================================================
// DESENHO (SVG) — usado pelo editor, pela exportação e pelo relatório
// ============================================================================

function portaLigada(est, l) {
    const id = [l.de, l.para].find(x => String(x).startsWith('porta:'));
    return id ? est.ligacoes.find(x => x.id === id.slice(6)) : null;
}

function svgSeta(pts, tipo, extra = '') {
    const cor = COR_FLUXO[tipo] || '#333';
    const n = pts.length;
    const a = pts[n - 2], b = pts[n - 1];
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
    const cab = 11, larg = 5.5;
    const fim = { x: b.x - ux * cab, y: b.y - uy * cab };
    const corpo = pts.slice(0, -1).concat([fim]);
    const d = 'M' + corpo.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L');
    let s = '';
    if (tipo === 'material') {
        s += `<path d="${d}" fill="none" stroke="${cor}" stroke-width="7" stroke-linejoin="miter" ${extra}/>`;
        s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="miter"/>`;
    } else {
        s += `<path d="${d}" fill="none" stroke="${cor}" stroke-width="2" ${tipo === 'sinal' ? 'stroke-dasharray="7 5"' : ''} ${extra}/>`;
    }
    const p1 = `${b.x.toFixed(1)},${b.y.toFixed(1)}`;
    const p2 = `${(fim.x - uy * larg).toFixed(1)},${(fim.y + ux * larg).toFixed(1)}`;
    const p3 = `${(fim.x + uy * larg).toFixed(1)},${(fim.y - ux * larg).toFixed(1)}`;
    return s + `<polygon points="${p1} ${p2} ${p3}" fill="${cor}"/>`;
}

/**
 * Escolhe onde pôr o rótulo de uma ligação: tenta o meio de cada segmento (do mais longo para o mais curto), acima e
 * abaixo (ou dos dois lados, se vertical), deslizando ao longo do segmento; fica com a posição que menos se sobrepõe
 * a blocos e a outros rótulos. Marca a área usada em "ocupados".
 */
function posicionarRotulo(texto, pts, ocupados) {
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y);
        segs.push({ a, b, vertical: dx < 1, len: dx < 1 ? dy : dx });
    }
    segs.sort((p, q) => (q.vertical ? q.len * 0.6 : q.len) - (p.vertical ? p.len * 0.6 : p.len));
    const caixa = (x, y, ancora, linhas) => {
        const w = Math.max(...linhas.map(t => t.length), 2) * 6.4, h = linhas.length * 14;
        const x0 = ancora === 'middle' ? x - w / 2 : ancora === 'end' ? x - w : x;
        return { x: x0, y: y - 11, w, h };
    };
    const sobrep = (c) => ocupados.concat(ocupados.tracos || []).reduce((t, o) => {
        const ix = Math.max(0, Math.min(c.x + c.w, o.x + o.w) - Math.max(c.x, o.x)), iy = Math.max(0, Math.min(c.y + c.h, o.y + o.h) - Math.max(c.y, o.y));
        return t + ix * iy * (o.peso || 1);
    }, 0);
    let melhor = null;
    segs.forEach((sg, k) => {
        const max = sg.vertical ? 18 : Math.max(14, Math.min(30, Math.floor((sg.len - 8) / 6.4)));
        const linhas = quebrarTexto(texto, max).slice(0, 3);
        const nl = linhas.length;
        [0.5, 0.3, 0.7, 0.15, 0.85].forEach(f => {
            const mx = sg.a.x + (sg.b.x - sg.a.x) * f, my = sg.a.y + (sg.b.y - sg.a.y) * f;
            const cands = sg.vertical
                ? [{ x: mx + 8, y: my, ancora: 'start' }, { x: mx - 8, y: my, ancora: 'end' }]
                : [{ x: mx, y: my - 8 - (nl - 1) * 14, ancora: 'middle' }, { x: mx, y: my + 18, ancora: 'middle' }];
            cands.forEach((c, j) => {
                const cx = caixa(c.x, c.y, c.ancora, linhas);
                const custo = sobrep(cx) * 10 + k * 40 + Math.abs(f - 0.5) * 60 + j * 15;
                if (!melhor || custo < melhor.custo) melhor = Object.assign({ custo, caixa: cx, max, yTexto: c.y + (nl - 1) * 7 }, c);
            });
        });
    });
    if (!melhor) return { x: pts[0].x, y: pts[0].y, ancora: 'start', max: 24 };
    ocupados.push(melhor.caixa);
    return { x: melhor.x, y: melhor.yTexto, ancora: melhor.ancora, max: melhor.max };
}

function svgRotulo(x, y, texto, cor, ancora = 'middle', max = 24) {
    if (!texto) return '';
    const linhas = quebrarTexto(texto, max).slice(0, 3);
    return `<text x="${x.toFixed(1)}" y="${(y - (linhas.length - 1) * 7).toFixed(1)}" font-size="11.5" text-anchor="${ancora}" fill="${cor}" stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round">` +
        linhas.map((t, i) => `<tspan x="${x.toFixed(1)}" dy="${i ? 14 : 0}">${esc(t)}</tspan>`).join('') + '</text>';
}

/**
 * Desenha um nível. opcoes: { interativo, sel: {tipo,id}, origem, destaque: Set de ids }.
 * Devolve { svg (conteúdo), bbox }.
 */
function desenharNivel(est, pai, opcoes = {}) {
    const g = geometriaNivel(est, pai);
    const it = !!opcoes.interativo;
    const sel = opcoes.sel || {};
    let s = '';
    if (g.fr) {
        s += `<rect x="${g.fr.x}" y="${g.fr.y}" width="${g.fr.w}" height="${g.fr.h}" rx="10" fill="${pai ? '#fbfdfc' : 'none'}" stroke="#8aa5a0" stroke-width="1.4" stroke-dasharray="10 6"/>`;
        const nomePai = pai ? (est.nos.find(n => n.id === pai) || {}).nome : '';
        s += `<text x="${g.fr.x + 10}" y="${g.fr.y - 8}" font-size="11.5" fill="#5f6f6d" font-style="italic">${esc(pai ? 'Fronteira: ' + (nomePai || 'função') : 'Fronteira do sistema')}</text>`;
    }
    // portas
    Object.values(g.portas).forEach(pt => {
        const t = pt.lig.tipo, cor = COR_FLUXO[t];
        const pts = pt.lado === 'entrada' ? [{ x: pt.x - PORTA_STUB, y: pt.y }, { x: pt.x, y: pt.y }] : [{ x: pt.x, y: pt.y }, { x: pt.x + PORTA_STUB, y: pt.y }];
        const ehOrigem = opcoes.origem === pt.id;
        s += `<g ${it ? `data-porta="${escAttr(pt.id)}" class="dg-porta${ehOrigem ? ' origem' : ''}"` : ''}>` + svgSeta(pts, t);
        s += svgRotulo(pt.lado === 'entrada' ? pt.x - PORTA_STUB + 4 : pt.x + 8, pt.y - 10 - (Math.min(3, quebrarTexto(pt.lig.rotulo || '', 17).length) - 1) * 7, pt.lig.rotulo || TIPOS_FLUXO[t], cor, 'start', 17);
        s += `<circle cx="${pt.x}" cy="${pt.y}" r="${it ? 6 : 3.5}" fill="#fff" stroke="${cor}" stroke-width="2"/>`;
        if (it) s += `<circle cx="${pt.x}" cy="${pt.y}" r="14" fill="transparent"/>`;
        s += '</g>';
    });
    // rótulos não podem cair em cima de blocos nem de outros rótulos
    const ocupados = g.nos.map(n => ({ x: n.x - 2, y: n.y - 2, w: n.w + 4, h: n.h + 4 }));
    Object.values(g.portas).forEach(pt => { const lin = quebrarTexto(pt.lig.rotulo || '', 17).slice(0, 3); ocupados.push({ x: pt.lado === 'entrada' ? pt.x - PORTA_STUB + 4 : pt.x + 8, y: pt.y - 10 - (lin.length - 1) * 7 - 12 - (lin.length - 1) * 7, w: Math.max(...lin.map(t => t.length), 4) * 6.4, h: lin.length * 14 + 4 }); });
    // as próprias linhas também atrapalham a leitura (peso menor que blocos e rótulos)
    const tracos = [];
    g.linhas.forEach(({ pts }) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; tracos.push({ x: Math.min(a.x, b.x) - 3, y: Math.min(a.y, b.y) - 3, w: Math.abs(b.x - a.x) + 6, h: Math.abs(b.y - a.y) + 6, peso: 0.35 }); } });
    ocupados.tracos = tracos;
    // ligações
    g.linhas.forEach(({ l, pts, rot }) => {
        const ativo = sel.tipo === 'lig' && sel.id === l.id;
        s += `<g ${it ? `data-lig="${escAttr(l.id)}" class="dg-lig${ativo ? ' sel' : ''}"` : ''}>`;
        if (it) s += `<path d="M${pts.map(p => `${p.x},${p.y}`).join(' L')}" fill="none" stroke="${ativo ? 'rgba(168,225,86,.65)' : 'transparent'}" stroke-width="14" stroke-linejoin="round"/>`;
        s += svgSeta(pts, l.tipo);
        const portaL = portaLigada(est, l);
        const repete = portaL && semAcento(portaL.rotulo).includes(semAcento(l.rotulo));
        if (l.rotulo && !repete) {
            const r = posicionarRotulo(l.rotulo, pts, ocupados);
            s += svgRotulo(r.x, r.y, l.rotulo, COR_FLUXO[l.tipo], r.ancora, r.max);
        }
        s += '</g>';
    });
    // blocos
    g.nos.forEach(n => {
        const ativo = sel.tipo === 'no' && sel.id === n.id;
        const ehF = n.tipo === 'funcao';
        const filhos = ehF ? funcoesFilhas(est, n.id).length : 0;
        const origem = opcoes.origem === n.id;
        const cls = it ? ` data-no="${escAttr(n.id)}" class="dg-no${ativo ? ' sel' : ''}${origem ? ' origem' : ''}"` : '';
        s += `<g${cls}>`;
        if (filhos) s += `<rect x="${n.x + 5}" y="${n.y + 5}" width="${n.w}" height="${n.h}" rx="4" fill="#d6ebe4" stroke="#085357" stroke-width="1.2"/>`;
        s += ehF
            ? `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="4" fill="${n.global ? '#dff0e9' : '#eef7f4'}" stroke="#085357" stroke-width="${n.global ? 2.6 : 2}"/>`
            : `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="14" fill="#f3f4f4" stroke="#6b7a78" stroke-width="1.6"/>`;
        if (ativo || origem) s += `<rect x="${n.x - 4}" y="${n.y - 4}" width="${n.w + 8}" height="${n.h + 8}" rx="${ehF ? 7 : 17}" fill="none" stroke="${origem ? '#d4a017' : '#a8e156'}" stroke-width="3"/>`;
        const linhas = quebrarTexto(n.nome || (ehF ? 'Função sem nome' : 'Bloco'), Math.max(8, Math.floor((n.w - 14) / 7.1))).slice(0, Math.max(1, Math.floor((n.h - 10) / 15)));
        const y0 = n.y + n.h / 2 - (linhas.length - 1) * 7.5 + 4.5;
        s += `<text x="${n.x + n.w / 2}" y="${y0}" font-size="12.5" text-anchor="middle" fill="${ehF ? '#0b3b3e' : '#3c4847'}" font-weight="${ehF ? 600 : 500}">` +
            linhas.map((t, i) => `<tspan x="${n.x + n.w / 2}" dy="${i ? 15 : 0}">${esc(t)}</tspan>`).join('') + '</text>';
        if (ehF && !n.global) s += `<text x="${n.x + 5}" y="${n.y + 12}" font-size="9.5" fill="#409580" font-weight="700">F${esc(numeroFuncao(est, n.id))}</text>`;
        if (filhos && it) s += `<text x="${n.x + n.w - 6}" y="${n.y + n.h - 5}" font-size="10" text-anchor="end" fill="#409580">▸ ${filhos}</text>`;
        if (it && ativo) s += `<rect data-redim="${escAttr(n.id)}" class="dg-redim" x="${n.x + n.w - 6}" y="${n.y + n.h - 6}" width="12" height="12" fill="#a8e156" stroke="#085357"/>`;
        s += '</g>';
    });
    return { svg: s, bbox: g.bbox, geo: g };
}

function legendaSvg(x, y) {
    const item = (t, i) => svgSeta([{ x: x + i * 120, y }, { x: x + i * 120 + 40, y }], t) + `<text x="${x + i * 120 + 46}" y="${y + 4}" font-size="11" fill="#3c4847">${TIPOS_FLUXO[t]}</text>`;
    return Object.keys(TIPOS_FLUXO).map(item).join('');
}

/** SVG independente de um nível (para exportar, para o ZIP e para o relatório). */
function svgNivelCompleto(est, pai, titulo = '') {
    const { svg, bbox } = desenharNivel(est, pai);
    const topo = titulo ? 34 : 6, base = 34;
    const x = bbox.x, y = bbox.y - topo, w = Math.max(bbox.w, 380), h = bbox.h + topo + base;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x.toFixed(0)} ${y.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" font-family="Segoe UI, Roboto, Arial, sans-serif">` +
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>` +
        (titulo ? `<text x="${x + 12}" y="${y + 22}" font-size="14" font-weight="700" fill="#085357">${esc(titulo)}</text>` : '') +
        svg + legendaSvg(x + 14, y + h - 16) + '</svg>';
}

/** Níveis com conteúdo (o nível de cima e cada função desdobrada), para exportar todos. */
function niveisComConteudo(est) {
    const out = [{ pai: null, titulo: `${est.nome} — nível 0 (função global)` }];
    const visita = id => funcoesFilhas(est, id).forEach(f => { if (funcoesFilhas(est, f.id).length) { out.push({ pai: f.id, titulo: `${est.nome} — F${numeroFuncao(est, f.id)} ${f.nome}` }); visita(f.id); } });
    const g = noGlobal(est);
    if (g && funcoesFilhas(est, g.id).length) { out.push({ pai: g.id, titulo: `${est.nome} — desdobramento da função global` }); visita(g.id); }
    return out;
}

// ============================================================================
// ORGANIZAÇÃO AUTOMÁTICA (camadas da esquerda para a direita)
// ============================================================================

function organizarNivel(est, pai) {
    const nos = nosDoNivel(est, pai);
    if (!nos.length) return;
    const ids = new Set(nos.map(n => n.id));
    const pt = portasDoNivel(est, pai);
    const ligs = ligacoesDoNivel(est, pai);
    const entra = {}, sai = {};
    nos.forEach(n => { entra[n.id] = []; sai[n.id] = []; });
    ligs.forEach(l => { if (ids.has(l.de) && ids.has(l.para)) { sai[l.de].push(l.para); entra[l.para].push(l.de); } });
    const portaDe = new Set(ligs.filter(l => String(l.de).startsWith('porta:')).map(l => l.para));
    const funcoes = nos.filter(n => n.tipo === 'funcao');
    const externos = nos.filter(n => n.tipo !== 'funcao');
    // camada = maior caminho a partir das fontes (ciclos interrompidos pela visita)
    const camada = {};
    const calc = (id, pilha) => {
        if (camada[id] !== undefined) return camada[id];
        if (pilha.has(id)) return 0;
        pilha.add(id);
        const ant = entra[id].filter(x => funcoes.some(f => f.id === x));
        const c = ant.length ? Math.max(...ant.map(a => calc(a, pilha) + 1)) : 0;
        pilha.delete(id);
        return (camada[id] = c);
    };
    funcoes.forEach(f => calc(f.id, new Set()));
    funcoes.forEach(f => { if (portaDe.has(f.id) && !entra[f.id].length) camada[f.id] = 0; });
    const nCam = funcoes.length ? Math.max(...funcoes.map(f => camada[f.id])) + 1 : 1;
    const xBase = pai ? 300 : 420, passoX = 290, passoY = 135;
    const colunas = {};
    funcoes.forEach(f => (colunas[camada[f.id]] = colunas[camada[f.id]] || []).push(f));
    Object.entries(colunas).forEach(([c, fs]) => {
        fs.sort((a, b) => a.y - b.y);
        fs.forEach((f, i) => { f.w = f.w || 170; f.h = f.h || 70; f.x = xBase + c * passoX; f.y = 80 + i * passoY + (Math.max(...Object.values(colunas).map(v => v.length)) - fs.length) * passoY / 2; });
    });
    // blocos laterais: quem só envia fica à esquerda, quem só recebe à direita, os demais embaixo
    const esq = externos.filter(e => sai[e.id].length && !entra[e.id].length);
    const dir = externos.filter(e => entra[e.id].length && !sai[e.id].length);
    const baixo = externos.filter(e => !esq.includes(e) && !dir.includes(e));
    const altura = Math.max(...Object.values(colunas).map(v => v.length), 1) * passoY;
    const xEsq = xBase - (pai ? 520 : 400), xDir = xBase + (nCam - 1) * passoX + 170 + (pai ? 330 : 230);
    esq.forEach((e, i) => { e.x = xEsq; e.y = 80 + (altura - esq.length * 110) / 2 + i * 110; });
    dir.forEach((e, i) => { e.x = xDir; e.y = 80 + (altura - dir.length * 110) / 2 + i * 110; });
    baixo.forEach((e, i) => { e.x = xBase + i * 220; e.y = 80 + altura + 60; });
    void pt;
}

// ============================================================================
// MODELOS E LIGAÇÃO AUTOMÁTICA (para pré-preencher)
// ============================================================================

/**
 * Liga os fluxos da fronteira (portas) que ainda estão soltos às funções do nível: cada entrada vai para a primeira
 * função que "recebe" aquele tipo (ou a primeira função); cada saída sai da última que "entrega" aquele tipo (ou da última).
 */
/** Quantas palavras importantes dois textos têm em comum (para ligar "Torque dos pedais" a "Receber o torque dos pedais"). */
function palavrasEmComum(a, b) {
    const pal = t => new Set(semAcento(t).split(/[^a-z0-9]+/).filter(w => w.length > 3).map(w => w.slice(0, 6)));
    const A = pal(a), B = pal(b);
    let n = 0; A.forEach(w => { if (B.has(w)) n++; });
    return n;
}
function maisParecida(funcs, rotulo) {
    let melhor = null, m = 0;
    funcs.forEach(f => { const k = palavrasEmComum(f.nome, rotulo); if (k > m) { m = k; melhor = f; } });
    return melhor;
}

function ligarFronteira(est, pai, funcs, recebe = {}, entrega = {}) {
    if (!pai || !funcs.length) return 0;
    const pt = portasDoNivel(est, pai);
    const ligs = ligacoesDoNivel(est, pai);
    let n = 0;
    pt.entradas.forEach(l => {
        if (ligs.some(x => x.de === 'porta:' + l.id)) return;
        const alvo = funcs.find(f => (recebe[f.id] || []).includes(l.tipo)) || maisParecida(funcs, l.rotulo) || funcs[0];
        est.ligacoes.push({ id: uid('lg'), tipo: l.tipo, rotulo: l.rotulo, pai, de: 'porta:' + l.id, para: alvo.id }); n++;
    });
    pt.saidas.forEach(l => {
        if (ligs.some(x => x.para === 'porta:' + l.id)) return;
        const origem = funcs.slice().reverse().find(f => (entrega[f.id] || []).includes(l.tipo)) || maisParecida(funcs, l.rotulo) || funcs[funcs.length - 1];
        est.ligacoes.push({ id: uid('lg'), tipo: l.tipo, rotulo: l.rotulo, pai, de: origem.id, para: 'porta:' + l.id }); n++;
    });
    return n;
}

/** Insere um modelo de estrutura (MODELOS_ESTRUTURA) no nível; liga os fluxos da fronteira e organiza. Devolve as funções criadas. */
function aplicarModelo(est, pai, chave) {
    const m = MODELOS_ESTRUTURA[chave];
    if (!m) return [];
    const existentes = new Set(nosDoNivel(est, pai).filter(n => n.tipo === 'funcao').map(n => semAcento(n.nome)));
    const recebe = {}, entrega = {};
    const criadas = m.funcoes.map(f => {
        const ja = nosDoNivel(est, pai).find(n => n.tipo === 'funcao' && semAcento(n.nome) === semAcento(f.nome));
        const n = ja || { id: uid('fn'), tipo: 'funcao', nome: f.nome, pai, x: 0, y: 0, w: 170, h: 70, descricao: '' };
        if (!ja) est.nos.push(n);
        recebe[n.id] = f.recebe || []; entrega[n.id] = f.entrega || [];
        return n;
    });
    m.ligacoes.forEach(([a, b, tipo, rotulo]) => {
        const de = criadas[a].id, para = criadas[b].id;
        if (!est.ligacoes.some(l => l.pai === pai && l.de === de && l.para === para && l.tipo === tipo)) est.ligacoes.push({ id: uid('lg'), tipo, rotulo, pai, de, para });
    });
    ligarFronteira(est, pai, criadas, recebe, entrega);
    organizarNivel(est, pai);
    void existentes;
    return criadas;
}

/** Encadeia funções soltas (sem nenhuma ligação) pelo fluxo principal — rascunho para o usuário ajustar. */
function encadearFuncoes(est, pai, tipo = 'material') {
    const funcs = nosDoNivel(est, pai).filter(n => n.tipo === 'funcao');
    const ligs = ligacoesDoNivel(est, pai);
    const soltas = funcs.filter(f => !ligs.some(l => l.de === f.id || l.para === f.id));
    if (soltas.length < 2 && !(soltas.length === 1 && funcs.length === 1)) { ligarFronteira(est, pai, funcs); return; }
    for (let i = 0; i < soltas.length - 1; i++) est.ligacoes.push({ id: uid('lg'), tipo, rotulo: '', pai, de: soltas[i].id, para: soltas[i + 1].id });
    ligarFronteira(est, pai, soltas);
}

// ============================================================================
// EDITOR INTERATIVO
// ============================================================================

class EditorDiagrama {
    /**
     * opcoes: { estrutura(): est, projeto(): p, aoMudar(), sugestoes(): [nomes] }
     */
    constructor(raiz, opcoes) {
        this.raiz = raiz; this.o = opcoes;
        this.pai = null; this.sel = {}; this.modo = 'mover'; this.tipoLig = 'material'; this.origem = null;
        this.view = null; this.arrasto = null;
        this.montar();
    }
    get est() { return this.o.estrutura(); }

    montar() {
        this.raiz.innerHTML = `
        <div class="dg-barra">
            <div class="dg-grupo">
                <button type="button" class="btn btn-primary btn-sm" data-dg="add-funcao" title="Acrescentar um bloco de função neste nível">+ Função</button>
                <details class="dg-menu dg-menu-modelo"><summary class="btn btn-secondary btn-sm" title="Insere uma cadeia típica de funções já ligada">+ Modelo pronto ▾</summary><div></div></details>
                <details class="dg-menu"><summary class="btn btn-secondary btn-sm">+ Bloco lateral ▾</summary>
                    <div>${['Usuário', 'Fonte de potência', 'Ambiente', 'Outro sistema', 'Outro bloco'].map(n => `<button type="button" data-dg="add-externo" data-nome="${escAttr(n)}">${esc(n)}</button>`).join('')}</div>
                </details>
            </div>
            <div class="dg-grupo dg-ligar" role="group" aria-label="Ligar blocos">
                <span class="dg-rotulo">Ligar:</span>
                ${Object.entries(TIPOS_FLUXO).map(([t, r]) => `<button type="button" class="btn btn-secondary btn-sm dg-tipo dg-tipo-${t}" data-dg="ligar" data-tipo="${t}" title="Clique no bloco de origem e depois no de destino">${r}</button>`).join('')}
            </div>
            <div class="dg-grupo">
                <button type="button" class="btn btn-secondary btn-sm" data-dg="organizar" title="Organiza os blocos da esquerda para a direita, seguindo os fluxos">Organizar</button>
                <button type="button" class="btn btn-secondary btn-sm" data-dg="ajustar" title="Mostrar tudo">Ajustar</button>
                <button type="button" class="btn btn-secondary btn-sm" data-dg="zoom-" aria-label="Diminuir">−</button>
                <button type="button" class="btn btn-secondary btn-sm" data-dg="zoom+" aria-label="Aumentar">+</button>
                <button type="button" class="btn btn-secondary btn-sm" data-dg="svg" title="Baixar este nível em SVG">SVG</button>
            </div>
        </div>
        <nav class="dg-trilha" aria-label="Nível do diagrama"></nav>
        <div class="dg-aviso" role="status"></div>
        <div class="dg-corpo">
            <div class="dg-tela"><svg class="dg-svg" xmlns="http://www.w3.org/2000/svg" tabindex="0" aria-label="Estrutura de funções"></svg>
                <div class="dg-legenda">${Object.keys(TIPOS_FLUXO).map(t => `<span><svg width="34" height="10">${svgSeta([{ x: 1, y: 5 }, { x: 33, y: 5 }], t)}</svg>${TIPOS_FLUXO[t]}</span>`).join('')}</div>
            </div>
            <aside class="dg-painel"></aside>
        </div>`;
        const tipo = (this.o.projeto() || {}).tipoProjeto;
        this.raiz.querySelector('.dg-menu-modelo > div').innerHTML = modelosParaTipo(tipo).map(([k, m], i) =>
            `<button type="button" data-dg="modelo" data-modelo="${k}">${i === 0 && tipo && tipo !== 'misto' ? '★ ' : ''}${esc(m.nome)}</button>`).join('');
        this.svg = this.raiz.querySelector('.dg-svg');
        this.painel = this.raiz.querySelector('.dg-painel');
        this.raiz.addEventListener('click', e => this.cliqueBarra(e));
        this.svg.addEventListener('pointerdown', e => this.baixo(e));
        this.svg.addEventListener('pointermove', e => this.mover(e));
        this.svg.addEventListener('pointerup', e => this.cima(e));
        this.svg.addEventListener('pointercancel', e => this.cima(e));
        this.svg.addEventListener('dblclick', e => this.duplo(e));
        this.svg.addEventListener('wheel', e => { e.preventDefault(); this.zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, this.ponto(e)); }, { passive: false });
        this.svg.addEventListener('keydown', e => this.tecla(e));
        this.painel.addEventListener('input', e => this.editarPainel(e));
        this.painel.addEventListener('change', e => this.editarPainel(e));
        this.painel.addEventListener('click', e => this.cliquePainel(e));
        this.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.aplicarView()) : null;
        if (this.ro) this.ro.observe(this.svg);
        this.render(true);
    }

    destruir() { if (this.ro) this.ro.disconnect(); }

    // ---------- desenho ----------
    render(ajustar = false) {
        const est = this.est;
        if (!est) { this.svg.innerHTML = ''; return; }
        if (this.pai && !est.nos.some(n => n.id === this.pai)) this.pai = null;
        if (this.sel.id && !(est.nos.some(n => n.id === this.sel.id) || est.ligacoes.some(l => l.id === this.sel.id))) this.sel = {};
        const { svg, bbox } = desenharNivel(est, this.pai, { interativo: true, sel: this.sel, origem: this.origem });
        this.bbox = bbox;
        this.svg.innerHTML = svg;
        if (ajustar || !this.view) this.ajustar(); else this.aplicarView();
        this.renderTrilha(); this.renderPainel(); this.renderModo();
    }
    renderModo() {
        this.raiz.querySelectorAll('.dg-tipo').forEach(b => b.classList.toggle('ativo', this.modo === 'ligar' && b.dataset.tipo === this.tipoLig));
        this.raiz.classList.toggle('dg-modo-ligar', this.modo === 'ligar');
        const av = this.raiz.querySelector('.dg-aviso');
        av.textContent = this.modo === 'ligar'
            ? (this.origem ? `Ligação de ${TIPOS_FLUXO[this.tipoLig].toLowerCase()}: agora clique no bloco de destino. (Esc cancela)` : `Ligação de ${TIPOS_FLUXO[this.tipoLig].toLowerCase()}: clique no bloco (ou na porta da fronteira) de origem. (Esc cancela)`)
            : '';
    }
    renderTrilha() {
        const est = this.est;
        const cad = this.pai ? ancestrais(est, this.pai) : [];
        const t = this.raiz.querySelector('.dg-trilha');
        t.innerHTML = `<span>Nível:</span> <button type="button" data-dg="nivel" data-id="" class="${this.pai ? '' : 'atual'}">Função global e blocos laterais</button>` +
            cad.map(n => ` <span aria-hidden="true">›</span> <button type="button" data-dg="nivel" data-id="${escAttr(n.id)}" class="${n.id === this.pai ? 'atual' : ''}">${n.global ? 'Dentro da função global' : 'F' + esc(numeroFuncao(est, n.id)) + ' ' + esc(n.nome)}</button>`).join('');
    }
    aplicarView() {
        if (!this.view) return;
        const r = this.svg.getBoundingClientRect();
        const W = r.width || 800, H = r.height || 500;
        this.svg.setAttribute('viewBox', `${this.view.x} ${this.view.y} ${W / this.view.k} ${H / this.view.k}`);
    }
    ajustar() {
        const r = this.svg.getBoundingClientRect();
        const W = r.width || 800, H = r.height || 500, b = this.bbox;
        // em tela estreita não encolhe a ponto de ficar ilegível: mostra a parte da esquerda e o resto se arrasta
        const kMin = W < 700 ? 0.55 : 0.2;
        const k = Math.max(kMin, Math.min(W / b.w, H / b.h, 1.4));
        this.view = { k, x: W / k >= b.w ? b.x - (W / k - b.w) / 2 : b.x, y: H / k >= b.h ? b.y - (H / k - b.h) / 2 : b.y };
        this.aplicarView();
    }
    zoom(f, centro) {
        if (!this.view) return;
        const r = this.svg.getBoundingClientRect();
        const c = centro || { x: this.view.x + r.width / this.view.k / 2, y: this.view.y + r.height / this.view.k / 2 };
        const k = Math.max(0.2, Math.min(4, this.view.k * f));
        this.view.x = c.x - (c.x - this.view.x) * this.view.k / k;
        this.view.y = c.y - (c.y - this.view.y) * this.view.k / k;
        this.view.k = k;
        this.aplicarView();
    }
    ponto(e) {
        const r = this.svg.getBoundingClientRect();
        return { x: this.view.x + (e.clientX - r.left) / this.view.k, y: this.view.y + (e.clientY - r.top) / this.view.k };
    }
    mudou(rerender = true) { if (rerender) this.render(); this.o.aoMudar(); }

    // ---------- barra ----------
    cliqueBarra(e) {
        const b = e.target.closest('[data-dg]');
        if (!b || !this.raiz.contains(b)) return;
        const a = b.dataset.dg, est = this.est;
        if (a === 'add-funcao') this.novoNo('funcao', 'Nova função');
        else if (a === 'add-externo') { b.closest('details').open = false; this.novoNo('externo', b.dataset.nome === 'Outro bloco' ? 'Bloco lateral' : b.dataset.nome); }
        else if (a === 'ligar') {
            if (this.modo === 'ligar' && this.tipoLig === b.dataset.tipo) { this.modo = 'mover'; this.origem = null; }
            else { this.modo = 'ligar'; this.tipoLig = b.dataset.tipo; this.origem = null; }
            this.render();
        }
        else if (a === 'modelo') {
            b.closest('details').open = false;
            if (!this.pai) { const g = noGlobal(est); if (g) this.pai = g.id; }
            const n = aplicarModelo(est, this.pai, b.dataset.modelo).length;
            this.sel = {}; this.mudou(false); this.render(true);
            this.avisar(`${n} funções do modelo inseridas e ligadas. Renomeie, apague ou religue o que não servir.`);
        }
        else if (a === 'organizar') { organizarNivel(est, this.pai); this.mudou(false); this.render(true); }
        else if (a === 'ajustar') this.ajustar();
        else if (a === 'zoom+') this.zoom(1.2);
        else if (a === 'zoom-') this.zoom(1 / 1.2);
        else if (a === 'svg') this.baixarSvg();
        else if (a === 'nivel') this.abrirNivel(b.dataset.id || null);
    }
    abrirNivel(id) { this.pai = id || null; this.sel = {}; this.origem = null; this.render(true); }

    novoNo(tipo, nome) {
        const est = this.est;
        const r = this.svg.getBoundingClientRect();
        const cx = this.view.x + r.width / this.view.k / 2, cy = this.view.y + r.height / this.view.k / 2;
        const n = { id: uid(tipo === 'funcao' ? 'fn' : 'ex'), tipo, nome, pai: this.pai, w: 170, h: tipo === 'funcao' ? 70 : 60, descricao: '' };
        // procura um lugar livre perto do centro da tela
        const livres = nosDoNivel(est, this.pai);
        let x = cx - 85, y = cy - 35, k = 0;
        while (livres.some(o => Math.abs(o.x - x) < 180 && Math.abs(o.y - y) < 85) && k < 40) { k++; x = cx - 85 + ((k % 5) - 2) * 200; y = cy - 35 + Math.floor(k / 5) * 100 * (k % 2 ? 1 : -1); }
        n.x = Math.round(x); n.y = Math.round(y);
        est.nos.push(n);
        this.sel = { tipo: 'no', id: n.id };
        this.mudou();
        const inp = this.painel.querySelector('[data-campo="nome"]');
        if (inp) { inp.focus(); inp.select(); }
    }

    baixarSvg() {
        const est = this.est;
        const pai = this.pai ? est.nos.find(n => n.id === this.pai) : null;
        const titulo = pai ? `${est.nome} — ${pai.global ? 'dentro da função global' : 'F' + numeroFuncao(est, pai.id) + ' ' + pai.nome}` : `${est.nome} — função global`;
        baixarArquivo(new Blob([svgNivelCompleto(est, this.pai, titulo)], { type: 'image/svg+xml' }), nomeSeguro(titulo) + '.svg');
    }

    // ---------- ponteiro ----------
    alvo(e) {
        const r = e.target.closest('[data-redim]'); if (r) return { tipo: 'redim', id: r.dataset.redim };
        const n = e.target.closest('[data-no]'); if (n) return { tipo: 'no', id: n.dataset.no };
        const p = e.target.closest('[data-porta]'); if (p) return { tipo: 'porta', id: p.dataset.porta };
        const l = e.target.closest('[data-lig]'); if (l) return { tipo: 'lig', id: l.dataset.lig };
        return null;
    }
    baixo(e) {
        if (e.button !== undefined && e.button !== 0) return;
        // dois dedos: zoom de pinça
        this.dedos = this.dedos || new Map();
        this.dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.dedos.size === 2) {
            const [a, b] = [...this.dedos.values()];
            this.arrasto = { tipo: 'pinca', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, k0: this.view.k };
            return;
        }
        const a = this.alvo(e), p = this.ponto(e), est = this.est;
        this.svg.focus({ preventScroll: true });
        if (this.modo === 'ligar' && a && (a.tipo === 'no' || a.tipo === 'porta')) {
            if (!this.origem) {
                if (a.tipo === 'porta' && !a.id.startsWith('porta:')) return;
                const pt = geometriaNivel(est, this.pai).portas[a.id];
                if (pt && pt.lado === 'saida') { this.avisar('Uma porta de saída só recebe ligações. Comece pela função de dentro.'); return; }
                this.origem = a.id; this.render(); return;
            }
            if (a.id === this.origem) { this.origem = null; this.render(); return; }
            const pt = geometriaNivel(est, this.pai).portas[a.id];
            if (pt && pt.lado === 'entrada') { this.avisar('Uma porta de entrada só envia. Escolha uma função ou a porta de saída.'); return; }
            const l = { id: uid('lg'), tipo: this.tipoLig, rotulo: '', pai: this.pai, de: this.origem, para: a.id };
            const doPorta = String(this.origem).startsWith('porta:') ? est.ligacoes.find(x => x.id === this.origem.slice(6)) : null;
            const paraPorta = String(a.id).startsWith('porta:') ? est.ligacoes.find(x => x.id === a.id.slice(6)) : null;
            const ref = doPorta || paraPorta;
            if (ref) { l.tipo = ref.tipo; l.rotulo = ref.rotulo; }
            est.ligacoes.push(l);
            this.origem = null; this.modo = 'mover';
            this.sel = { tipo: 'lig', id: l.id };
            this.mudou();
            const inp = this.painel.querySelector('[data-campo="rotulo"]');
            if (inp) { inp.focus(); inp.select(); }
            return;
        }
        if (a && a.tipo === 'redim') {
            const n = est.nos.find(x => x.id === a.id);
            this.arrasto = { tipo: 'redim', n, x0: p.x, y0: p.y, w0: n.w, h0: n.h };
        } else if (a && a.tipo === 'no') {
            const n = est.nos.find(x => x.id === a.id);
            this.sel = { tipo: 'no', id: n.id };
            this.arrasto = { tipo: 'no', n, dx: p.x - n.x, dy: p.y - n.y, moveu: false };
            this.render();
        } else if (a && a.tipo === 'lig') {
            this.sel = { tipo: 'lig', id: a.id }; this.render();
        } else if (a && a.tipo === 'porta') {
            this.sel = {}; this.render();
            this.avisar('Esta é uma porta da fronteira: o fluxo vem do nível de cima. Use "Ligar" para conectá-la a uma função interna.');
        } else {
            if (this.sel.id || this.origem) { this.sel = {}; this.origem = null; this.render(); }
            this.arrasto = { tipo: 'pan', cx: e.clientX, cy: e.clientY, vx: this.view.x, vy: this.view.y };
        }
        try { this.svg.setPointerCapture(e.pointerId); } catch (er) { /* sem captura */ }
    }
    mover(e) {
        if (this.dedos && this.dedos.has(e.pointerId)) this.dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const a = this.arrasto;
        if (!a) return;
        if (a.tipo === 'pinca') {
            if (!this.dedos || this.dedos.size < 2) return;
            const [p1, p2] = [...this.dedos.values()];
            const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            const centro = this.ponto({ clientX: (p1.x + p2.x) / 2, clientY: (p1.y + p2.y) / 2 });
            this.zoom(a.k0 * d / a.d0 / this.view.k, centro);
            return;
        }
        if (a.tipo === 'pan') {
            this.view.x = a.vx - (e.clientX - a.cx) / this.view.k;
            this.view.y = a.vy - (e.clientY - a.cy) / this.view.k;
            this.aplicarView(); return;
        }
        const p = this.ponto(e);
        if (a.tipo === 'no') {
            const nx = Math.round((p.x - a.dx) / 5) * 5, ny = Math.round((p.y - a.dy) / 5) * 5;
            if (nx !== a.n.x || ny !== a.n.y) { a.n.x = nx; a.n.y = ny; a.moveu = true; this.redesenharLeve(); }
        } else if (a.tipo === 'redim') {
            a.n.w = Math.max(100, Math.round((a.w0 + p.x - a.x0) / 5) * 5);
            a.n.h = Math.max(44, Math.round((a.h0 + p.y - a.y0) / 5) * 5);
            a.moveu = true; this.redesenharLeve();
        }
    }
    redesenharLeve() {
        const { svg, bbox } = desenharNivel(this.est, this.pai, { interativo: true, sel: this.sel, origem: this.origem });
        this.svg.innerHTML = svg; this.bbox = bbox;
    }
    cima(e) {
        if (this.dedos && e) this.dedos.delete(e.pointerId);
        const a = this.arrasto; this.arrasto = null;
        if (a && (a.tipo === 'no' || a.tipo === 'redim') && a.moveu) this.mudou();
    }
    duplo(e) {
        const a = this.alvo(e);
        if (!a || a.tipo !== 'no') return;
        const n = this.est.nos.find(x => x.id === a.id);
        if (n.tipo === 'funcao') this.abrirNivel(n.id);
        else { const inp = this.painel.querySelector('[data-campo="nome"]'); if (inp) { inp.focus(); inp.select(); } }
    }
    tecla(e) {
        if (e.key === 'Escape') { this.modo = 'mover'; this.origem = null; this.render(); }
        else if ((e.key === 'Delete' || e.key === 'Backspace') && this.sel.id) { e.preventDefault(); this.excluirSel(); }
    }
    avisar(t) {
        const av = this.raiz.querySelector('.dg-aviso');
        av.textContent = t; av.classList.add('pisca');
        clearTimeout(this._av); this._av = setTimeout(() => { av.classList.remove('pisca'); this.renderModo(); }, 3500);
    }
    excluirSel() {
        const est = this.est, p = this.o.projeto();
        if (this.sel.tipo === 'no') {
            const n = est.nos.find(x => x.id === this.sel.id);
            if (!n) return;
            if (n.global) { this.avisar('A função global não pode ser excluída (renomeie em vez disso).'); return; }
            const dentro = descendentes(est, n.id).length;
            if (dentro && !confirm(`"${n.nome}" tem ${dentro} bloco(s) interno(s), que também serão excluídos. Continuar?`)) return;
            removerNo(p, est, n.id);
        } else if (this.sel.tipo === 'lig') removerLigacao(est, this.sel.id);
        this.sel = {};
        this.mudou();
    }

    // ---------- painel de propriedades ----------
    renderPainel() {
        const est = this.est, s = this.sel;
        if (s.tipo === 'no') {
            const n = est.nos.find(x => x.id === s.id);
            const ehF = n.tipo === 'funcao';
            const filhos = ehF ? funcoesFilhas(est, n.id) : [];
            this.painel.innerHTML = `
                <h4>${ehF ? (n.global ? 'Função global' : 'Função F' + esc(numeroFuncao(est, n.id))) : 'Bloco lateral'}</h4>
                <p class="dg-tag">${esc(rotuloNivel(est, n))}</p>
                <label>Nome ${ehF ? '<small>(verbo + substantivo)</small>' : ''}
                    <input type="text" data-campo="nome" value="${escAttr(n.nome)}" maxlength="120" ${ehF ? 'list="dl-verbos"' : ''}></label>
                ${n.global ? '' : `<label>Tipo de bloco
                    <select data-campo="tipo"><option value="funcao" ${ehF ? 'selected' : ''}>Função</option><option value="externo" ${ehF ? '' : 'selected'}>Bloco lateral (fora da fronteira)</option></select></label>`}
                <label>Observação <textarea data-campo="descricao" rows="2" maxlength="600">${esc(n.descricao || '')}</textarea></label>
                <div class="dg-acoes">
                    ${ehF ? `<button type="button" class="btn btn-primary btn-sm" data-pn="abrir">${filhos.length ? `Abrir funções internas (${filhos.length})` : 'Desdobrar em funções internas'}</button>` : ''}
                    ${n.global ? '' : '<button type="button" class="btn btn-danger btn-sm" data-pn="excluir">Excluir</button>'}
                </div>
                ${ehF && !filhos.length && !n.global ? '<p class="dg-dica">Sem funções internas, esta é uma <b>função elementar</b>: vira uma linha da matriz morfológica.</p>' : ''}`;
        } else if (s.tipo === 'lig') {
            const l = est.ligacoes.find(x => x.id === s.id);
            const nome = id => String(id).startsWith('porta:') ? 'fronteira (' + ((est.ligacoes.find(x => x.id === id.slice(6)) || {}).rotulo || 'fluxo') + ')' : (est.nos.find(n => n.id === id) || {}).nome || '?';
            this.painel.innerHTML = `
                <h4>Ligação</h4>
                <p class="dg-tag">${esc(nome(l.de))} → ${esc(nome(l.para))}</p>
                <fieldset class="dg-tipos"><legend>Fluxo</legend>
                    ${Object.entries(TIPOS_FLUXO).map(([t, r]) => `<label class="dg-radio"><input type="radio" name="dg-tipo-lig" data-campo="tipo-lig" value="${t}" ${l.tipo === t ? 'checked' : ''}><svg width="34" height="10">${svgSeta([{ x: 1, y: 5 }, { x: 33, y: 5 }], t)}</svg>${r}</label>`).join('')}
                </fieldset>
                <label>Rótulo (o que flui) <input type="text" data-campo="rotulo" value="${escAttr(l.rotulo)}" maxlength="80" placeholder="Ex.: torque, grãos, sinal de comando"></label>
                <div class="dg-acoes">
                    <button type="button" class="btn btn-secondary btn-sm" data-pn="inverter">Inverter sentido</button>
                    <button type="button" class="btn btn-danger btn-sm" data-pn="excluir">Excluir</button>
                </div>`;
        } else {
            const nos = nosDoNivel(est, this.pai);
            const pt = portasDoNivel(est, this.pai);
            const ligs = ligacoesDoNivel(est, this.pai);
            const soltas = pt.entradas.concat(pt.saidas).filter(l => !ligs.some(x => x.de === 'porta:' + l.id || x.para === 'porta:' + l.id));
            const sugest = (this.o.sugestoes ? this.o.sugestoes() : []).filter(nm => !est.nos.some(n => semAcento(n.nome) === semAcento(nm)));
            this.painel.innerHTML = `
                <h4>Como usar</h4>
                <ul class="dg-ajuda">
                    <li><b>Arraste</b> os blocos; arraste o fundo para navegar; zoom com a roda do mouse, com dois dedos ou com − e +.</li>
                    <li><b>Ligar</b>: escolha Energia, Material ou Sinal, clique na origem e depois no destino.</li>
                    <li><b>Duplo clique</b> numa função abre as funções internas (desdobramento).</li>
                    <li>Clique numa linha ou bloco para editar; <kbd>Delete</kbd> exclui.</li>
                </ul>
                <p class="dg-tag">${nos.filter(n => n.tipo === 'funcao').length} função(ões) · ${nos.filter(n => n.tipo !== 'funcao').length} bloco(s) lateral(is) · ${ligs.length} ligação(ões) neste nível</p>
                ${soltas.length ? `<div class="dg-alerta">Fluxos da fronteira ainda não ligados a funções internas: ${soltas.map(l => `<b>${esc(l.rotulo || TIPOS_FLUXO[l.tipo])}</b>`).join(', ')}.</div>` : ''}
                ${sugest.length ? `<h4>Funções sugeridas pelas especificações</h4><div class="dg-sugestoes">${sugest.slice(0, 12).map(nm => `<button type="button" class="chip" data-pn="sugestao" data-nome="${escAttr(nm)}">+ ${esc(nm)}</button>`).join('')}</div>` : ''}`;
        }
    }
    editarPainel(e) {
        const c = e.target.dataset.campo;
        if (!c) return;
        const est = this.est;
        if (this.sel.tipo === 'no') {
            const n = est.nos.find(x => x.id === this.sel.id);
            if (c === 'nome') n.nome = e.target.value;
            else if (c === 'descricao') n.descricao = e.target.value;
            else if (c === 'tipo' && e.type === 'change') {
                if (e.target.value === 'externo' && funcoesFilhas(est, n.id).length) { alert('Esta função tem funções internas. Exclua-as antes de transformá-la em bloco lateral.'); e.target.value = 'funcao'; return; }
                n.tipo = e.target.value;
                if (n.tipo === 'externo') removerNo(this.o.projeto(), { nos: [], ligacoes: [] }, n.id); // limpa princípios da antiga função
                this.mudou(); return;
            }
        } else if (this.sel.tipo === 'lig') {
            const l = est.ligacoes.find(x => x.id === this.sel.id);
            if (c === 'rotulo') l.rotulo = e.target.value;
            else if (c === 'tipo-lig') { l.tipo = e.target.value; this.mudou(); return; }
        }
        this.redesenharLeve();
        this.o.aoMudar();
    }
    cliquePainel(e) {
        const b = e.target.closest('[data-pn]');
        if (!b) return;
        const est = this.est;
        if (b.dataset.pn === 'excluir') this.excluirSel();
        else if (b.dataset.pn === 'abrir') this.abrirNivel(this.sel.id);
        else if (b.dataset.pn === 'inverter') {
            const l = est.ligacoes.find(x => x.id === this.sel.id);
            if ([l.de, l.para].some(x => String(x).startsWith('porta:'))) { this.avisar('Ligações com a fronteira têm sentido fixo (o do nível de cima).'); return; }
            [l.de, l.para] = [l.para, l.de]; this.mudou();
        } else if (b.dataset.pn === 'sugestao') {
            if (!this.pai) { const g = noGlobal(est); if (g) this.pai = g.id; }
            this.novoNo('funcao', b.dataset.nome);
        }
    }
}
