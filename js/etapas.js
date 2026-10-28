/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * PÁGINAS DAS ETAPAS: escopo, função global, estrutura funcional, princípios de solução, matriz morfológica,
 * seleção da concepção, concepção selecionada e relatório.
 */

'use strict';

const NOMES_SENTIDO = { up: '↑ maior é melhor', down: '↓ menor é melhor', none: '= valor-alvo' };

function dica(html, titulo = 'Como fazer') {
    return `<details class="dicas"><summary>${titulo}</summary><div>${html}</div></details>`;
}
function vazio(html) { return `<div class="vazio">${html}</div>`; }
function pct(x) { return ((+x || 0) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }); }
function imgTag(id, alt = '', cls = '') { return id ? `<img data-img="${escAttr(id)}" alt="${escAttr(alt)}" class="${cls}" loading="lazy">` : ''; }
function estEscolhida() { return PC.estrutura(); }
function nomeFuncaoCompleto(est, f) { return `F${numeroFuncao(est, f.id)} ${f.nome || 'função sem nome'}`; }

// ============================================================================
// 1 ESCOPO DO PROBLEMA
// ============================================================================

const FUNCAO_DA_ESPEC = [
    [/carga|peso|esfor[cç]o|resist/, 'Suportar a carga'], [/torque|pot[eê]ncia/, 'Transmitir o torque'], [/velocidade|rota[cç][aã]o|rpm/, 'Transmitir o movimento'],
    [/freio|frenagem|parada|desacelera/, 'Frear o movimento'], [/vaz[aã]o|fluxo/, 'Conduzir o fluxo'], [/temperatura/, 'Controlar a temperatura'],
    [/umidade/, 'Medir a umidade'], [/ru[ií]do|vibra|impacto|conforto/, 'Amortecer as vibrações'], [/semente/, 'Dosar as sementes'], [/gr[aã]o/, 'Transportar os grãos'],
    [/profundidade/, 'Controlar a profundidade'], [/troca|montagem|desmont/, 'Fixar os componentes'], [/desvio|alinhamento|empeno|lateral/, 'Guiar a rotação'],
    [/capacidade|volume/, 'Armazenar o produto'], [/autonomia|bateria/, 'Armazenar energia'], [/precis[aã]o|espa[cç]amento|dose/, 'Dosar o produto']
];
function sugerirFuncaoDaEspec(e) {
    if (e.ehCusto) return '';
    const d = semAcento(e.descricao);
    if (/massa|custo|preco|prazo/.test(d) && !/carga/.test(d)) return '';
    const m = FUNCAO_DA_ESPEC.find(([re]) => re.test(d));
    return m ? m[1] : '';
}

function textoAbstracaoSugerido(p, i) {
    const esp = p.especificacoes;
    const sentidoTxt = { up: 'o maior possível', down: 'o menor possível', none: 'adequado' };
    const limpa = d => String(d).replace(/\s*\([^)]*\)\s*$/, '');
    if (i === 0) return p.necessidades.length ? 'Requisitos: ' + p.necessidades.map(n => n.descricao.charAt(0).toLowerCase() + n.descricao.slice(1)).join('; ') + '.\nPreferências pessoais retiradas: (anote aqui)' : '';
    if (i === 1) return esp.filter(e => e.peso > 0 || e.origem === 'manual').map(e => `- ${e.descricao}${e.meta ? ' (' + e.meta + ')' : ''}`).join('\n');
    if (i === 2) return esp.filter(e => e.peso > 0 || e.origem === 'manual').map(e => `- ${limpa(e.descricao)} ${sentidoTxt[e.sentido] || 'adequado'}`).join('\n');
    if (i === 3) return esp.slice().sort((a, b) => b.peso - a.peso).slice(0, 3).map(e => `- ${limpa(e.descricao)} ${sentidoTxt[e.sentido] || ''}`.trim()).join('\n');
    if (i === 4) return p.funcaoGlobal.nome || p.formulacao || '';
    return '';
}

PAGINAS.escopo = {
    titulo: 'Escopo do problema',
    sub: 'Confira as especificações vindas do QFD, registre as restrições e use a abstração orientada para chegar ao problema essencial, formulado sem solução.',
    render(p) {
        const esp = p.especificacoes;
        const linhas = esp.map(e => `<tr>
            <td class="col-cod">${esc(e.codigo || '—')}${e.origem === 'qfd' ? '<span class="selo-qfd" title="Veio do QFD">QFD</span>' : ''}</td>
            <td><input type="text" data-campo="especificacoes#${e.id}.descricao" value="${escAttr(e.descricao)}" maxlength="200" aria-label="Especificação"></td>
            <td><input type="text" data-campo="especificacoes#${e.id}.meta" value="${escAttr(e.meta)}" maxlength="80" aria-label="Meta" placeholder="Ex.: ≤ 1800 g"></td>
            <td><select data-campo="especificacoes#${e.id}.sentido" aria-label="Sentido de melhoria">${Object.entries(NOMES_SENTIDO).map(([k, v]) => `<option value="${k}" ${e.sentido === k ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
            <td class="col-num"><input type="number" min="0" max="100" step="0.1" data-campo="especificacoes#${e.id}.peso" data-tipo="pct" value="${pct(e.peso).replace(',', '.')}" aria-label="Peso relativo (%)">${seloTerco(p, e)}</td>
            <td class="col-centro"><input type="checkbox" data-campo="especificacoes#${e.id}.ehCusto" ${e.ehCusto ? 'checked' : ''} aria-label="É especificação de custo"></td>
            <td><input type="text" list="dl-verbos" data-campo="especificacoes#${e.id}.funcao" value="${escAttr(e.funcao || '')}" maxlength="120" placeholder="—" aria-label="Função relacionada"></td>
            ${p.baseAnterior ? `<td><select data-campo="especificacoes#${e.id}.revisao" data-rerender class="revisao-${escAttr(e.revisao || 'nova')}" aria-label="Revisão">${Object.entries(REVISOES_ESPEC).map(([k, v]) => `<option value="${k}" ${(e.revisao || 'nova') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></td>` : ''}
            <td class="col-acao"><button type="button" class="btn-icone" data-acao="esp-del" data-id="${e.id}" title="Excluir" aria-label="Excluir">✕</button></td>
        </tr>`).join('');
        return `
        <section class="card">
            <h2>Dados do projeto</h2>
            <div class="grade-campos">
                <label>Nome do projeto <input type="text" data-campo="projeto.nome" value="${escAttr(p.projeto.nome)}" maxlength="160"></label>
                <label>Cliente <input type="text" data-campo="projeto.cliente" value="${escAttr(p.projeto.cliente)}" maxlength="160"></label>
                <label>Instituição / empresa <input type="text" data-campo="projeto.instituicao" value="${escAttr(p.projeto.instituicao)}" maxlength="160"></label>
                <label>Responsável <input type="text" data-campo="projeto.responsavel" value="${escAttr(p.projeto.responsavel)}" maxlength="120"></label>
                <label class="largo">Equipe (um nome por linha) <textarea rows="2" data-campo="projeto.equipe" data-tipo="linhas">${esc(p.projeto.equipe.join('\n'))}</textarea></label>
            </div>
        </section>

        <section class="card">
            <div class="card-topo"><h2>Especificações de projeto</h2>
                <div class="botoes">
                    <button type="button" class="btn btn-secondary btn-sm" data-acao="importar-qfd">⇪ Importar/atualizar do QFD</button>
                    <button type="button" class="btn btn-secondary btn-sm" data-acao="base-anterior" title="Começar a partir de um projeto já feito (ZIP): reaproveita especificações, funções, princípios e concepções">↺ Partir de projeto anterior</button>
                    <button type="button" class="btn btn-secondary btn-sm" data-acao="esp-sugerir-funcoes" title="Preenche a coluna Função relacionada onde estiver vazia">Sugerir funções</button>
                    <button type="button" class="btn btn-primary btn-sm" data-acao="esp-add">+ Especificação</button>
                </div>
            </div>
            ${p.baseAnterior ? `<p class="aviso-base">Este projeto parte de <b>${esc(p.baseAnterior.nome)}</b> (${esc(p.baseAnterior.em)}). Revise cada especificação com a equipe de especialistas e marque na coluna <b>Revisão</b> se foi mantida, alterada, é nova ou foi retirada. ${(() => { const c = {}; p.especificacoes.forEach(e => { const k = e.revisao || 'nova'; c[k] = (c[k] || 0) + 1; }); return Object.entries(REVISOES_ESPEC).filter(([k]) => c[k]).map(([k, v]) => `${v}: ${c[k]}`).join(' · '); })()}</p>` : ''}
            <p class="nota">Ordenadas pela importância do QFD. O selo abaixo do peso mostra o terço de importância (superior, médio, inferior), como nas tabelas de especificações de Reis (2003) e Sigales (2021). Marque as de <b>custo</b> (entram no índice de custo da seleção da estrutura) e, quando houver, a <b>função relacionada</b>: ela aparece como sugestão de bloco no diagrama (desdobramento especificação → função).</p>
            ${esp.length ? `<div class="tabela-rolagem"><table class="tabela tabela-esp">
                <thead><tr><th>Cód.</th><th>Especificação</th><th>Meta</th><th>Sentido</th><th>Peso %</th><th>Custo</th><th>Função relacionada</th>${p.baseAnterior ? '<th>Revisão</th>' : ''}<th></th></tr></thead>
                <tbody>${linhas}</tbody></table></div>`
                : vazio('Nenhuma especificação ainda. <b>Importe o backup do QFD</b> (traz as especificações com metas e pesos) ou acrescente à mão.')}
        </section>

        <div class="grade-2">
        <section class="card">
            <div class="card-topo"><h2>Necessidades dos clientes</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="nec-add">+ Necessidade</button></div>
            <p class="nota">Viram as perguntas do exame passa/não passa e os critérios da matriz de avaliação (etapa 6).</p>
            ${p.necessidades.length ? `<ul class="lista-editavel">${p.necessidades.map(n => `<li>
                <input type="text" data-campo="necessidades#${n.id}.descricao" value="${escAttr(n.descricao)}" maxlength="200" aria-label="Necessidade">
                <input type="number" class="peso" min="0" max="100" step="0.1" data-campo="necessidades#${n.id}.peso" data-tipo="pct" value="${pct(n.peso).replace(',', '.')}" aria-label="Peso (%)" title="Peso (%)">
                <button type="button" class="btn-icone" data-acao="nec-del" data-id="${n.id}" aria-label="Excluir">✕</button></li>`).join('')}</ul>` : vazio('Sem necessidades. Elas vêm do QFD ou podem ser escritas aqui.')}
        </section>
        <section class="card">
            <div class="card-topo"><h2>Restrições</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="rest-add">+ Restrição</button></div>
            <p class="nota">Limites que toda concepção deve respeitar (normas, orçamento, processos disponíveis, prazos).</p>
            ${p.restricoes.length ? `<ul class="lista-editavel">${p.restricoes.map(r => `<li>
                <input type="text" data-campo="restricoes#${r.id}.texto" value="${escAttr(r.texto)}" maxlength="240" aria-label="Restrição">
                <button type="button" class="btn-icone" data-acao="rest-del" data-id="${r.id}" aria-label="Excluir">✕</button></li>`).join('')}</ul>` : ''}
            <div class="chips">${['Atender às normas de segurança aplicáveis', 'Respeitar o orçamento do projeto', 'Usar processos de fabricação disponíveis', 'Cumprir o prazo do projeto']
                .filter(t => !p.restricoes.some(r => r.texto === t)).map(t => `<button type="button" class="chip" data-acao="rest-sug" data-texto="${escAttr(t)}">+ ${esc(t)}</button>`).join('')}</div>
        </section>
        </div>

        <section class="card">
            <div class="card-topo"><h2>Abstração orientada</h2>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="abs-prefill" title="Preenche os passos vazios a partir das especificações">Pré-preencher os passos vazios</button></div>
            <p class="nota">Cinco passos para chegar ao essencial do problema (Pahl et al., 2005). Se o QFD tiver o fechamento preenchido, os passos já vêm prontos.</p>
            <ol class="passos-abstracao">${PASSOS_ABSTRACAO.map((t, i) => `<li><label><b>${i + 1}. ${esc(t)}</b>
                <textarea rows="${i < 3 ? 4 : 2}" data-campo="abstracao.${i}">${esc(p.abstracao[i])}</textarea></label></li>`).join('')}</ol>
        </section>

        <section class="card">
            <h2>Formulação do problema</h2>
            <label>Problema essencial, <b>sem indicar a solução</b> (diga o que fazer, não como)
                <textarea rows="2" data-campo="formulacao" placeholder="Ex.: Sustentar e rolar a bicicleta com segurança">${esc(p.formulacao)}</textarea></label>
            ${p.abstracao[4] && p.abstracao[4] !== p.formulacao ? `<button type="button" class="btn btn-secondary btn-sm" data-acao="form-de-abs">Usar o texto do passo 5</button>` : ''}
            ${dica('<p>Evite palavras que já são solução ("roda de alumínio", "motor elétrico"). Uma formulação neutra abre espaço para mais princípios de solução. Ex.: "Fazer uma roda de alumínio com 32 raios" → "Sustentar e rolar a bicicleta com segurança".</p>', 'Exemplo')}
        </section>`;
    }
};

Object.assign(ACOES, {
    'base-anterior': async () => {
        if (projetoTemConteudo(PC.p) && !confirm('Isto substitui o projeto atual neste navegador por uma nova versão do projeto anterior. Se quiser guardar o atual, baixe o ZIP antes. Continuar?')) return;
        const arq = await escolherArquivo('#arq-abrir');
        if (!arq) return;
        const { dados, qfd } = await lerZipOuJson(arq);
        if (qfd) { avisar('Esse arquivo é um backup do QFD, não um projeto conceitual. Use "Importar do QFD".'); return; }
        const novo = projetoAPartirDe(dados);
        PC.substituir(novo); salvar(); renderPagina();
        avisar(`Nova versão a partir de "${novo.baseAnterior.nome}". Revise as especificações (coluna Revisão) e depois as funções e princípios.`);
    },
    'esp-add': () => { PC.p.especificacoes.push({ id: uid('es'), codigo: 'E' + (PC.p.especificacoes.filter(e => e.origem !== 'qfd').length + 1), descricao: '', sentido: 'none', meta: '', unidade: '', avaliacao: '', aspectos: '', peso: 0, dificuldade: null, origem: 'manual', ehCusto: false, funcao: '', funcoesIds: [], revisao: PC.p.baseAnterior ? 'nova' : undefined }); salvar(); renderPagina(true); },
    'esp-del': b => { const e = PC.p.especificacoes.find(x => x.id === b.dataset.id); if (e && e.descricao && !confirm(`Excluir "${e.descricao}"?`)) return; PC.p.especificacoes = PC.p.especificacoes.filter(x => x.id !== b.dataset.id); salvar(); renderPagina(true); },
    'esp-sugerir-funcoes': () => { let n = 0; PC.p.especificacoes.forEach(e => { if (!e.funcao) { const f = sugerirFuncaoDaEspec(e); if (f) { e.funcao = f; n++; } } }); salvar(); renderPagina(true); avisar(n ? `${n} função(ões) sugerida(s). Revise e ajuste.` : 'Nenhuma sugestão nova (as especificações de massa e custo não geram função).'); },
    'nec-add': () => { PC.p.necessidades.push({ id: uid('nc'), descricao: '', peso: 0 }); salvar(); renderPagina(true); },
    'nec-del': b => { PC.p.necessidades = PC.p.necessidades.filter(x => x.id !== b.dataset.id); salvar(); renderPagina(true); },
    'rest-add': () => { PC.p.restricoes.push({ id: uid('rs'), texto: '' }); salvar(); renderPagina(true); },
    'rest-sug': b => { PC.p.restricoes.push({ id: uid('rs'), texto: b.dataset.texto }); salvar(); renderPagina(true); },
    'rest-del': b => { PC.p.restricoes = PC.p.restricoes.filter(x => x.id !== b.dataset.id); salvar(); renderPagina(true); },
    'abs-prefill': () => { const p = PC.p; let n = 0; p.abstracao = p.abstracao.map((t, i) => { if (t.trim()) return t; const s = textoAbstracaoSugerido(p, i); if (s) n++; return s; }); if (!p.formulacao && p.abstracao[4]) p.formulacao = p.abstracao[4]; salvar(); renderPagina(true); avisar(n ? `${n} passo(s) pré-preenchido(s). Revise o texto.` : 'Nada a pré-preencher: os passos já têm texto ou faltam especificações.'); },
    'form-de-abs': () => { PC.p.formulacao = PC.p.abstracao[4]; salvar(); renderPagina(true); }
});

// ============================================================================
// 2 FUNÇÃO GLOBAL
// ============================================================================

function svgCaixaPretaPC(fg) {
    const lista = lado => Object.keys(TIPOS_FLUXO).flatMap(t => (fg[lado][t] || []).filter(Boolean).map(texto => ({ tipo: t, texto })));
    const ent = lista('entradas'), sai = lista('saidas');
    const W = 720, passo = 48, topo = 30;
    const H = Math.max(ent.length, sai.length, 2) * passo + topo * 2;
    const cx = 270, cw = 180;
    const fl = (itens, x1, x2, xt) => itens.map((f, i) => {
        const y = topo + passo * i + passo / 2 + (H - topo * 2 - passo * itens.length) / 2;
        return svgSeta([{ x: x1, y }, { x: x2, y }], f.tipo) + `<text x="${xt}" y="${y - 10}" font-size="12" fill="${COR_FLUXO[f.tipo]}">${esc(quebrarTexto(f.texto, 32)[0] || '')}</text>`;
    }).join('');
    const nome = quebrarTexto(fg.nome || 'Função global', 20).slice(0, 5);
    const y0 = H / 2 - (nome.length - 1) * 9 + 5;
    return `<svg class="caixa-preta" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Função global" font-family="Segoe UI, Roboto, Arial, sans-serif">
        <rect x="${cx}" y="18" width="${cw}" height="${H - 36}" rx="6" fill="#dff0e9" stroke="#085357" stroke-width="2.4"/>
        ${nome.map((l, i) => `<text x="${cx + cw / 2}" y="${y0 + i * 18}" text-anchor="middle" font-size="14" font-weight="700" fill="#085357">${esc(l)}</text>`).join('')}
        ${fl(ent, 10, cx, 10)}${fl(sai, cx + cw, W - 10, cx + cw + 10)}</svg>`;
}

function legendaFluxosHtml() {
    return `<div class="legenda-fluxos">${Object.keys(TIPOS_FLUXO).map(t => `<span><svg width="40" height="12">${svgSeta([{ x: 1, y: 6 }, { x: 39, y: 6 }], t)}</svg> ${TIPOS_FLUXO[t]}</span>`).join('')}</div>`;
}

/** Acrescenta à estrutura (nível 0) os fluxos da função global que ainda não estão lá. */
function sincronizarFuncaoGlobal(p, est) {
    const g = noGlobal(est);
    if (!g) return 0;
    if (p.funcaoGlobal.nome) g.nome = p.funcaoGlobal.nome;
    let n = 0;
    const nomesLado = { energia: { entradas: 'Fonte de potência', saidas: 'Ambiente' }, material: { entradas: 'Origem do material', saidas: 'Destino do material' }, sinal: { entradas: 'Usuário', saidas: 'Usuário (informações)' } };
    ['entradas', 'saidas'].forEach(lado => Object.keys(TIPOS_FLUXO).forEach(t => p.funcaoGlobal[lado][t].filter(Boolean).forEach(rot => {
        const existe = est.ligacoes.some(l => !l.pai && l.tipo === t && semAcento(l.rotulo) === semAcento(rot) && (lado === 'entradas' ? l.para === g.id : l.de === g.id));
        if (existe) return;
        let ext = est.nos.find(x => !x.pai && x.tipo === 'externo' && x.nome === nomesLado[t][lado]);
        if (!ext) {
            const doLado = est.nos.filter(x => !x.pai && x.tipo === 'externo' && (lado === 'entradas' ? x.x < g.x : x.x > g.x));
            ext = { id: uid('ex'), tipo: 'externo', nome: nomesLado[t][lado], pai: null, x: lado === 'entradas' ? g.x - 300 : g.x + g.w + 130, y: g.y - 60 + doLado.length * 110, w: 170, h: 60, descricao: '' };
            est.nos.push(ext);
        }
        est.ligacoes.push({ id: uid('lg'), tipo: t, rotulo: rot, pai: null, de: lado === 'entradas' ? ext.id : g.id, para: lado === 'entradas' ? g.id : ext.id });
        n++;
    })));
    return n;
}

PAGINAS['funcao-global'] = {
    titulo: 'Função global',
    sub: 'A função global descreve o que o sistema faz, com as entradas e saídas de energia, material e sinal (caixa-preta). Ela é o ponto de partida da estrutura de funções.',
    render(p) {
        const fg = p.funcaoGlobal;
        const coluna = lado => `<div class="fluxos-coluna"><h3>${lado === 'entradas' ? 'Entradas' : 'Saídas'}</h3>
            ${Object.entries(TIPOS_FLUXO).map(([t, r]) => `<div class="fluxo-tipo fluxo-${t}"><h4><svg width="34" height="10">${svgSeta([{ x: 1, y: 5 }, { x: 33, y: 5 }], t)}</svg> ${r}</h4>
                ${fg[lado][t].map((v, i) => `<div class="fluxo-item"><input type="text" data-campo="funcaoGlobal.${lado}.${t}.${i}" value="${escAttr(v)}" maxlength="80" aria-label="${r} (${lado})">
                    <button type="button" class="btn-icone" data-acao="fg-del" data-lado="${lado}" data-tipo="${t}" data-i="${i}" aria-label="Excluir">✕</button></div>`).join('')}
                <button type="button" class="btn-link" data-acao="fg-add" data-lado="${lado}" data-tipo="${t}">+ ${r.toLowerCase()}</button>
                <div class="chips chips-fluxo">${FLUXOS_SUGERIDOS[t].filter(x => !fg[lado][t].includes(x)).slice(0, 5).map(x => `<button type="button" class="chip" data-acao="fg-sug" data-lado="${lado}" data-tipo="${t}" data-texto="${escAttr(x)}">+ ${esc(x)}</button>`).join('')}</div></div>`).join('')}</div>`;
        const est = estEscolhida();
        return `
        <section class="card">
            <label class="campo-destaque">Função global <small>(verbo + substantivo, sem solução)</small>
                <input type="text" list="dl-verbos" data-campo="funcaoGlobal.nome" value="${escAttr(fg.nome)}" maxlength="120" placeholder="Ex.: Sustentar e rolar a bicicleta"></label>
            ${!fg.nome && p.formulacao ? `<button type="button" class="btn btn-secondary btn-sm" data-acao="fg-da-formulacao">Usar a formulação do problema: "${esc(p.formulacao)}"</button>` : ''}
        </section>
        <div class="grade-2">${coluna('entradas')}${coluna('saidas')}</div>
        <section class="card">
            <div class="card-topo"><h2>Caixa-preta</h2>${legendaFluxosHtml()}</div>
            <div class="caixa-preta-area" id="caixa-preta">${svgCaixaPretaPC(fg)}</div>
            <div class="botoes">
                ${est ? `<button type="button" class="btn btn-primary" data-acao="fg-sincronizar">Levar os fluxos para a estrutura "${esc(est.nome)}"</button>
                         <a class="btn btn-secondary" href="#/estrutura">Abrir a estrutura funcional →</a>`
                      : `<button type="button" class="btn btn-primary" data-acao="fg-criar-estrutura">Criar a estrutura funcional a partir da função global →</button>`}
            </div>
        </section>
        ${dica(`<ul>
            <li><b>Energia</b>: mecânica, elétrica, térmica, hidráulica… (ex.: torque dos pedais, calor por atrito).</li>
            <li><b>Material</b>: o que entra e sai fisicamente (ex.: grãos, ar, peso suportado, carga transmitida).</li>
            <li><b>Sinal</b>: informação e comandos (ex.: comando de freio, indicação de nível, ruído).</li>
            <li>De onde vêm as entradas e para onde vão as saídas viram os <b>blocos laterais</b> do diagrama: usuário, fonte de potência, ambiente (Spagnolo, 2011, Fig. 38).</li>
            <li>Funções gerais (Pahl et al., 2005): <i>canalizar, converter, alterar, conectar, armazenar</i>.</li></ul>`)}`;
    },
    depois(raiz) {
        raiz.addEventListener('input', e => { if (e.target.dataset.campo && e.target.dataset.campo.startsWith('funcaoGlobal')) $('#caixa-preta').innerHTML = svgCaixaPretaPC(PC.p.funcaoGlobal); });
    }
};

Object.assign(ACOES, {
    'fg-add': b => { PC.p.funcaoGlobal[b.dataset.lado][b.dataset.tipo].push(''); salvar(); renderPagina(true); const ins = $$(`[data-campo^="funcaoGlobal.${b.dataset.lado}.${b.dataset.tipo}."]`); if (ins.length) ins[ins.length - 1].focus(); },
    'fg-sug': b => { PC.p.funcaoGlobal[b.dataset.lado][b.dataset.tipo].push(b.dataset.texto); salvar(); renderPagina(true); },
    'fg-del': b => { PC.p.funcaoGlobal[b.dataset.lado][b.dataset.tipo].splice(+b.dataset.i, 1); salvar(); renderPagina(true); },
    'fg-da-formulacao': () => { PC.p.funcaoGlobal.nome = PC.p.formulacao; salvar(); renderPagina(true); },
    'fg-criar-estrutura': () => {
        const p = PC.p;
        const funcs = [...new Set(p.especificacoes.map(e => e.funcao).filter(Boolean))];
        p.estruturas.push(montarEstruturaInicial(p, funcs));
        p.estruturaEscolhida = p.estruturas[p.estruturas.length - 1].id;
        salvar(); location.hash = '#/estrutura';
    },
    'fg-sincronizar': () => { const n = sincronizarFuncaoGlobal(PC.p, estEscolhida()); salvar(); avisar(n ? `${n} fluxo(s) acrescentado(s) à estrutura.` : 'A estrutura já tem todos os fluxos da função global.'); }
});

// ============================================================================
// 3 ESTRUTURA FUNCIONAL
// ============================================================================

function htmlArvoreFuncoes(est) {
    const g = noGlobal(est);
    if (!g) return '';
    const item = f => {
        const filhos = funcoesFilhas(est, f.id);
        return `<li><button type="button" class="btn-link" data-acao="est-abrir-nivel" data-id="${f.id}" title="Ver no diagrama">${f.global ? '' : `<span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> `}${esc(f.nome || 'sem nome')}</button>
            <span class="tag-nivel">${esc(rotuloNivel(est, f))}</span>${filhos.length ? `<ol>${filhos.map(item).join('')}</ol>` : ''}</li>`;
    };
    return `<ol class="arvore-funcoes">${item(g)}</ol>`;
}

function htmlFerreira(p) {
    if (p.estruturas.length < 2) return vazio('Crie ao menos duas estruturas (botão <b>Duplicar para variar</b>) e altere uma delas — dividir ou juntar funções, mudar a ordem, ligar em série ou paralelo, mudar a fronteira — para compará-las aqui.');
    const sel = p.selecaoEstrutura;
    const tec = p.especificacoes.filter(e => !e.ehCusto);
    const opDT = (estId, eid) => `<select data-campo="selecaoEstrutura.tecnicos.${estId}.${eid}" data-tipo="num" data-rerender aria-label="Desempenho técnico">
        <option value="">—</option>${Object.entries(ESCALA_DT).map(([v, r]) => `<option value="${v}" ${+((sel.tecnicos[estId] || {})[eid]) === +v ? 'selected' : ''}>${v} ${r}</option>`).join('')}</select>`;
    const opC = (estId, cid) => `<select data-campo="selecaoEstrutura.notasCusto.${estId}.${cid}" data-tipo="num" data-rerender aria-label="Custo">
        <option value="">—</option>${Object.entries(ESCALA_CUSTO).map(([v, r]) => `<option value="${v}" ${+((sel.notasCusto[estId] || {})[cid]) === +v ? 'selected' : ''}>${v} ${r}</option>`).join('')}</select>`;
    const ind = indicesFerreira(p);
    const comRazao = ind.filter(x => x.razao !== null);
    const melhor = comRazao.length ? comRazao.reduce((a, b) => b.razao > a.razao ? b : a) : null;
    return `
    <h3>Desempenho técnico (DT): 1 fraco · 5 satisfatório · 10 excelente</h3>
    <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Requisito técnico</th><th>Peso (PR)</th>${p.estruturas.map(e => `<th>${esc(e.nome)}</th>`).join('')}</tr></thead>
    <tbody>${tec.map(e => `<tr><td>${esc(e.descricao)}</td><td class="col-num">${pct(e.peso)}%</td>${p.estruturas.map(s => `<td>${opDT(s.id, e.id)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${2 + p.estruturas.length}">Sem especificações técnicas.</td></tr>`}</tbody></table></div>
    <div class="card-topo"><h3>Custo: 1 baixo · 5 médio · 10 alto</h3>
        <div class="botoes"><button type="button" class="btn btn-secondary btn-sm" data-acao="fer-custos-espec">Trazer especificações de custo</button><button type="button" class="btn btn-secondary btn-sm" data-acao="fer-custo-add">+ Item de custo</button></div></div>
    <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Especificação de custo</th><th>Valor relativo (ECR)</th>${p.estruturas.map(e => `<th>${esc(e.nome)}</th>`).join('')}<th></th></tr></thead>
    <tbody>${sel.custos.map(c => `<tr><td><input type="text" data-campo="selecaoEstrutura.custos#${c.id}.descricao" value="${escAttr(c.descricao)}" aria-label="Item de custo"></td>
        <td class="col-num"><input type="number" min="0" step="0.1" data-campo="selecaoEstrutura.custos#${c.id}.peso" data-tipo="num" data-rerender value="${+c.peso || 0}" aria-label="Valor relativo"></td>
        ${p.estruturas.map(s => `<td>${opC(s.id, c.id)}</td>`).join('')}<td><button type="button" class="btn-icone" data-acao="fer-custo-del" data-id="${c.id}" aria-label="Excluir">✕</button></td></tr>`).join('') || `<tr><td colspan="${3 + p.estruturas.length}">Acrescente os itens de custo (ex.: custo de fabricação, de manutenção).</td></tr>`}</tbody></table></div>
    <h3>Resultado</h3>
    <div class="tabela-rolagem"><table class="tabela tabela-resultado"><thead><tr><th>Estrutura</th><th>IDT = Σ PR × DT</th><th>IDC = Σ ECR × custo</th><th>IDT / IDC</th></tr></thead>
    <tbody>${ind.map(x => `<tr class="${melhor && x.id === melhor.id ? 'linha-melhor' : ''}"><td>${esc(x.nome)}${x.id === p.estruturaEscolhida ? ' ★' : ''}</td>
        <td class="col-num">${x.idt.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${x.completoT ? '' : ' <small>(incompleto)</small>'}</td>
        <td class="col-num">${x.idc.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${x.completoC ? '' : ' <small>(incompleto)</small>'}</td>
        <td class="col-num"><b>${x.razao === null ? '—' : x.razao.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</b></td></tr>`).join('')}</tbody></table></div>
    ${melhor ? `<p>Maior relação desempenho/custo: <b>${esc(melhor.nome)}</b>. ${melhor.id === p.estruturaEscolhida ? 'É a estrutura escolhida.' : `<button type="button" class="btn btn-primary btn-sm" data-acao="est-escolher" data-id="${melhor.id}">Seguir com ${esc(melhor.nome)}</button>`}</p>` : '<p class="nota">Preencha as notas para calcular os índices.</p>'}`;
}

PAGINAS.estrutura = {
    titulo: 'Estrutura funcional',
    sub: 'Desdobre a função global em funções parciais e elementares, ligadas por fluxos de energia, material e sinal. Os blocos laterais mostram o que está fora do sistema.',
    render(p) {
        if (!p.estruturas.length) return `<section class="card">${vazio(`Ainda não há estrutura. <button type="button" class="btn btn-primary" data-acao="fg-criar-estrutura">Criar a partir da função global</button>
            <br><small>A estrutura começa com a função global, os blocos laterais e os fluxos da caixa-preta${p.especificacoes.some(e => e.funcao) ? ', e com as funções relacionadas às especificações' : ''}.</small>`)}</section>`;
        if (!App.estEditando || !p.estruturas.some(e => e.id === App.estEditando)) App.estEditando = p.estruturaEscolhida;
        const est = PC.estrutura(App.estEditando);
        return `
        <section class="card estruturas-barra">
            <div class="abas-estruturas" role="tablist">${p.estruturas.map(e => `<button type="button" role="tab" class="aba ${e.id === est.id ? 'ativa' : ''}" data-acao="est-editar" data-id="${e.id}" aria-selected="${e.id === est.id}">${e.id === p.estruturaEscolhida ? '★ ' : ''}${esc(e.nome)}</button>`).join('')}</div>
            <div class="estrutura-campos">
                <label>Nome <input type="text" data-campo="estruturas#${est.id}.nome" value="${escAttr(est.nome)}" maxlength="80"></label>
                <label class="largo">O que muda nesta alternativa <input type="text" data-campo="estruturas#${est.id}.descricao" value="${escAttr(est.descricao)}" maxlength="300" placeholder="Ex.: freio fora da fronteira (no quadro)"></label>
            </div>
            <div class="botoes">
                ${est.id === p.estruturaEscolhida ? '<span class="etapa-selo-ok">★ Estrutura escolhida para as próximas etapas</span>' : `<button type="button" class="btn btn-primary btn-sm" data-acao="est-escolher" data-id="${est.id}">★ Seguir com esta estrutura</button>`}
                <button type="button" class="btn btn-secondary btn-sm" data-acao="est-duplicar">Duplicar para variar</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="est-nova">+ Nova a partir da função global</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="est-svgs">Baixar todos os níveis (SVG)</button>
                ${p.estruturas.length > 1 ? '<button type="button" class="btn btn-danger btn-sm" data-acao="est-excluir">Excluir esta estrutura</button>' : ''}
            </div>
        </section>
        <section class="card card-editor"><div id="editor-estrutura" class="editor-diagrama"></div></section>
        <div class="grade-2">
            <section class="card"><h2>Funções desta estrutura</h2><p class="nota">As funções sem desdobramento (elementares) serão as linhas da matriz morfológica.</p><div id="lista-funcoes">${htmlArvoreFuncoes(est)}</div></section>
            <section class="card"><h2>Diretrizes (Back et al., 2008)</h2>
                <ul class="checklist">${DIRETRIZES_ESTRUTURA.map((t, i) => `<li><label><input type="checkbox" data-campo="diretrizes.${i}" ${p.diretrizes[i] ? 'checked' : ''}> ${esc(t)}</label></li>`).join('')}</ul>
                <h3>Para criar alternativas (Pahl et al., 2005)</h3><ul>${VARIACOES_ESTRUTURA.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
            </section>
        </div>
        <section class="card" id="ferreira"><h2>Seleção da estrutura (Ferreira, 1997)</h2>
            <p class="nota">Compara as estruturas pelo índice de desempenho técnico (IDT), usando os pesos do QFD, e pelo índice de custo (IDC). Vence a maior relação IDT/IDC.</p>
            ${htmlFerreira(p)}</section>`;
    },
    depois(raiz, p) {
        const el = $('#editor-estrutura');
        if (!el) return;
        App.editor = new EditorDiagrama(el, {
            estrutura: () => PC.estrutura(App.estEditando),
            projeto: () => PC.p,
            aoMudar: () => { salvar(true); const l = $('#lista-funcoes'); if (l) l.innerHTML = htmlArvoreFuncoes(PC.estrutura(App.estEditando)); },
            sugestoes: () => [...new Set(PC.p.especificacoes.map(e => (e.funcao || '').trim()).filter(Boolean))]
        });
        if (App.nivelInicial) { App.editor.abrirNivel(App.nivelInicial); App.nivelInicial = null; }
        else { const g = noGlobal(PC.estrutura(App.estEditando)); if (g && funcoesFilhas(PC.estrutura(App.estEditando), g.id).length) App.editor.abrirNivel(g.id); }
    }
};

Object.assign(ACOES, {
    'est-editar': b => { App.estEditando = b.dataset.id; renderPagina(true); },
    'est-escolher': b => { PC.p.estruturaEscolhida = b.dataset.id; App.estEditando = b.dataset.id; salvar(); renderPagina(true); avisar('Estrutura escolhida: as próximas etapas usam as funções dela.'); },
    'est-duplicar': () => {
        const p = PC.p, est = PC.estrutura(App.estEditando);
        const { estrutura, mapa } = duplicarEstrutura(est, `Estrutura ${p.estruturas.length + 1}`);
        estrutura.descricao = '';
        // os princípios já pesquisados acompanham as funções copiadas
        Object.entries(mapa).forEach(([velho, novo]) => { if (p.principios[velho]) p.principios[novo] = p.principios[velho].map(x => Object.assign({}, x, { id: uid('pr') })); });
        p.estruturas.push(estrutura); App.estEditando = estrutura.id;
        salvar(); renderPagina(true); avisar('Cópia criada. Mude algo nela (ordem, fronteira, divisão das funções) para comparar.');
    },
    'est-nova': () => { const p = PC.p; const e = montarEstruturaInicial(p, []); e.nome = `Estrutura ${p.estruturas.length + 1}`; p.estruturas.push(e); App.estEditando = e.id; salvar(); renderPagina(true); },
    'est-excluir': () => {
        const p = PC.p, est = PC.estrutura(App.estEditando);
        if (!confirm(`Excluir "${est.nome}" e os princípios das funções dela?`)) return;
        est.nos.filter(n => n.tipo === 'funcao').forEach(n => { delete p.principios[n.id]; p.variantes.forEach(v => delete v.escolhas[n.id]); });
        p.estruturas = p.estruturas.filter(e => e.id !== est.id);
        if (p.estruturaEscolhida === est.id) p.estruturaEscolhida = p.estruturas[0].id;
        App.estEditando = p.estruturaEscolhida; salvar(); renderPagina(true);
    },
    'est-abrir-nivel': b => {
        const est = PC.estrutura(App.estEditando || PC.p.estruturaEscolhida);
        const n = est.nos.find(x => x.id === b.dataset.id);
        if (!n || !App.editor) return;
        App.editor.abrirNivel(n.pai || null); App.editor.sel = { tipo: 'no', id: n.id }; App.editor.render();
        $('#editor-estrutura').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    'est-svgs': async () => {
        const est = PC.estrutura(App.estEditando);
        const zip = new JSZip();
        niveisComConteudo(est).forEach(nv => zip.file(nomeSeguro(nv.titulo) + '.svg', svgNivelCompleto(est, nv.pai, nv.titulo)));
        baixarArquivo(await zip.generateAsync({ type: 'blob' }), nomeSeguro(est.nome) + '-diagramas.zip');
    },
    'fer-custos-espec': () => {
        const p = PC.p; let n = 0;
        p.especificacoes.filter(e => e.ehCusto).forEach(e => { if (!p.selecaoEstrutura.custos.some(c => c.especId === e.id)) { p.selecaoEstrutura.custos.push({ id: uid('ec'), descricao: e.descricao, peso: Math.round((e.peso || 0) * 1000) / 10 || 1, especId: e.id }); n++; } });
        salvar(); renderPagina(true); avisar(n ? `${n} item(ns) de custo trazido(s).` : 'Nenhuma especificação marcada como custo no Escopo (coluna "Custo").');
    },
    'fer-custo-add': () => { PC.p.selecaoEstrutura.custos.push({ id: uid('ec'), descricao: '', peso: 1 }); salvar(); renderPagina(true); },
    'fer-custo-del': b => { PC.p.selecaoEstrutura.custos = PC.p.selecaoEstrutura.custos.filter(c => c.id !== b.dataset.id); salvar(); renderPagina(true); }
});

// ============================================================================
// 4 PRINCÍPIOS DE SOLUÇÃO
// ============================================================================

function selectMetodo(campo, valor) {
    return `<select data-campo="${campo}" aria-label="Método de busca"><option value="">Método de busca…</option>
        ${Object.values(METODOS_BUSCA).map(g => `<optgroup label="${escAttr(g.rotulo)}">${g.itens.map(m => `<option ${valor === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</optgroup>`).join('')}
        ${valor && !Object.values(METODOS_BUSCA).some(g => g.itens.includes(valor)) ? `<option selected>${esc(valor)}</option>` : ''}</select>`;
}

function htmlQuadroMetodos() {
    return `<div class="tabela-rolagem"><table class="tabela"><thead><tr>${Object.values(METODOS_BUSCA).map(g => `<th>${esc(g.rotulo)}</th>`).join('')}</tr></thead>
        <tbody><tr>${Object.values(METODOS_BUSCA).map(g => `<td><ul>${g.itens.map(m => `<li>${esc(m)}</li>`).join('')}</ul></td>`).join('')}</tr></tbody></table></div>
        <p class="nota">Quadro 1 — Métodos de busca por princípios de solução (Reis, 2003, apud Spagnolo, 2011).</p>`;
}

PAGINAS.principios = {
    titulo: 'Princípios de solução',
    sub: 'Para cada função elementar, levante princípios de solução diferentes entre si. O catálogo já sugere os conhecidos; acrescente fotos, esboços e os seus.',
    render(p) {
        const est = estEscolhida();
        const folhas = funcoesFolha(est);
        if (!est || !folhas.length) return `<section class="card">${vazio('Monte primeiro a <a href="#/estrutura">estrutura funcional</a>: as funções elementares viram as linhas desta etapa e da matriz morfológica.')}</section>`;
        const semNada = folhas.filter(f => !principiosDe(p, f.id).length).length;
        return `
        <section class="card">
            <div class="card-topo"><h2>${folhas.length} funções elementares · estrutura "${esc(est.nome)}"</h2>
                <button type="button" class="btn btn-primary btn-sm" data-acao="pr-catalogo-todas">Pré-preencher com o catálogo</button></div>
            <p class="nota">${semNada ? `${semNada} função(ões) ainda sem princípios. ` : ''}O pré-preenchimento acrescenta princípios conhecidos para cada função (marcados como <span class="selo-cat">catálogo</span>); apague os que não servem. A ordem conta: deixe os mais adequados primeiro (Roozenburg e Eekels, 1995).</p>
            ${dica(htmlQuadroMetodos(), 'Métodos de busca (Quadro 1)')}
        </section>
        ${htmlCartaoIA(p)}
        ${htmlCartaoBiblioteca()}
        ${htmlIdeiasSoltas(p, est)}
        ${folhas.map(f => {
            const prs = principiosDe(p, f.id);
            const cad = ancestrais(est, f.id).slice(1, -1).filter(n => !n.global);
            const sug = sugerirPrincipios(f.nome).filter(s => !prs.some(x => semAcento(x.nome) === semAcento(s.nome)));
            const bib = sugerirDaBiblioteca(f.nome).filter(s => !prs.some(x => semAcento(x.nome) === semAcento(s.nome)));
            return `<section class="card funcao-principios" id="f-${f.id}">
                <div class="card-topo"><h2><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome || 'função sem nome')}</h2>
                    <span class="contador">${prs.length} princípio(s)</span></div>
                ${cad.length ? `<p class="nota">Dentro de: ${cad.map(n => esc(n.nome)).join(' › ')}</p>` : ''}
                <div class="grade-principios">
                ${prs.map((x, i) => `<article class="principio">
                    <div class="principio-foto">${x.imagem ? `${imgTag(x.imagem, x.nome)}<div class="foto-acoes"><button type="button" data-acao="pr-foto" data-f="${f.id}" data-id="${x.id}">Trocar</button><button type="button" data-acao="pr-foto-del" data-f="${f.id}" data-id="${x.id}">Remover</button></div>`
                        : `<div class="foto-vazia">
                            <button type="button" class="so-toque" data-acao="pr-foto" data-cam="1" data-f="${f.id}" data-id="${x.id}">📷<span>Tirar foto</span></button>
                            <button type="button" data-acao="pr-foto" data-f="${f.id}" data-id="${x.id}">🖼<span>Imagem</span></button>
                            <button type="button" data-acao="pr-desenho" data-f="${f.id}" data-id="${x.id}">✏<span>Desenhar</span></button></div>`}</div>
                    <div class="principio-campos">
                        <div class="principio-linha"><span class="ordem">${i + 1}</span><input type="text" data-campo="principios.${f.id}#${x.id}.nome" value="${escAttr(x.nome)}" maxlength="120" aria-label="Princípio de solução" placeholder="Nome do princípio">${x.origem && x.origem !== 'manual' ? `<span class="selo-cat selo-${x.origem}" title="Origem">${esc(ORIGENS_PRINCIPIO[x.origem] || x.origem)}</span>` : ''}</div>
                        <textarea rows="2" data-campo="principios.${f.id}#${x.id}.descricao" maxlength="600" placeholder="Como funciona, vantagens e limitações" aria-label="Descrição">${esc(x.descricao)}</textarea>
                        ${selectMetodo(`principios.${f.id}#${x.id}.metodo`, x.metodo)}
                        <select data-campo="principios.${f.id}#${x.id}.maturidade" aria-label="Maturidade" class="resp-mat-${x.maturidade || 'vazia'}" data-rerender>
                            <option value="">Maturidade (para o TRL)…</option>${Object.entries(MATURIDADES).map(([k, m]) => `<option value="${k}" ${x.maturidade === k ? 'selected' : ''}>${esc(m.nome)} · TRL ${m.trl}</option>`).join('')}</select>
                        <div class="principio-custo"><select data-campo="principios.${f.id}#${x.id}.custo" data-rerender aria-label="Custo">
                            <option value="">Custo…</option>${Object.entries(CUSTOS).map(([k, c]) => `<option value="${k}" ${x.custo === k ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select>
                            <input type="number" min="0" step="0.01" data-campo="principios.${f.id}#${x.id}.custoValor" data-tipo="num" value="${x.custoValor ?? ''}" placeholder="R$ (opcional)" aria-label="Custo em reais"></div>
                        <details class="principio-mais"><summary>${x.concorrentes.length ? `Usado por: ${esc(x.concorrentes.join(', '))}` : 'Patentes e mais informações'}</summary>
                            ${htmlLinksPatentes(x.nome, f.nome)}
                            ${x.vantagens ? `<p><b>+</b> ${esc(x.vantagens)}</p>` : ''}${x.desvantagens ? `<p><b>−</b> ${esc(x.desvantagens)}</p>` : ''}
                            ${x.fonte ? `<p>Fonte: ${linkOuTexto(x.fonte)}</p>` : ''}${x.imagemUrl && !x.imagem ? `<p><a href="${escAttr(x.imagemUrl)}" target="_blank" rel="noopener">🔗 ver imagem indicada pela IA</a></p>` : ''}</details>
                        <div class="principio-acoes">
                            <button type="button" class="btn-icone" data-acao="pr-mover" data-f="${f.id}" data-id="${x.id}" data-d="-1" ${i ? '' : 'disabled'} title="Mais adequado (para a esquerda)" aria-label="Mover para antes">◀</button>
                            <button type="button" class="btn-icone" data-acao="pr-mover" data-f="${f.id}" data-id="${x.id}" data-d="1" ${i < prs.length - 1 ? '' : 'disabled'} title="Menos adequado" aria-label="Mover para depois">▶</button>
                            <button type="button" class="btn-icone perigo" data-acao="pr-del" data-f="${f.id}" data-id="${x.id}" title="Excluir" aria-label="Excluir">✕</button>
                        </div>
                    </div></article>`).join('')}
                    <button type="button" class="principio-novo" data-acao="pr-add" data-f="${f.id}">+ Princípio</button>
                </div>
                ${bib.length ? `<div class="chips"><span class="chips-rotulo">Da biblioteca da equipe:</span>${bib.map(s => `<button type="button" class="chip chip-bib" data-acao="pr-bib" data-f="${f.id}" data-nome="${escAttr(s.nome)}" title="${escAttr((s.descricao || '') + (s.projeto ? ' — usado em ' + s.projeto : ''))}">+ ${esc(s.nome)}</button>`).join('')}</div>` : ''}
                ${sug.length ? `<div class="chips"><span class="chips-rotulo">Do catálogo:</span>${sug.map(s => `<button type="button" class="chip" data-acao="pr-sug" data-f="${f.id}" data-nome="${escAttr(s.nome)}" data-desc="${escAttr(s.descricao)}" title="${escAttr(s.descricao)}">+ ${esc(s.nome)}</button>`).join('')}</div>` : ''}
            </section>`;
        }).join('')}`;
    }
};

function linkOuTexto(t) {
    const u = String(t || '').trim();
    return /^https?:\/\/\S+$/i.test(u) ? `<a href="${escAttr(u)}" target="_blank" rel="noopener">${esc(u.length > 70 ? u.slice(0, 67) + '…' : u)}</a>` : esc(u);
}

/** Ideias do caderno do QFD que não ficaram ligadas a nenhuma função (para o usuário pôr onde quiser). */
function htmlIdeiasSoltas(p, est) {
    const usadas = new Set(Object.values(p.principios).flat().map(x => semAcento(x.nome)));
    const soltas = p.ideiasQFD.filter(i => !usadas.has(semAcento(i.titulo)));
    if (!soltas.length) return '';
    const folhas = funcoesFolha(est);
    return `<section class="card"><h2>💡 Ideias do QFD ainda sem função</h2><p class="nota">Vieram do caderno de ideias do QFD. Escolha a função e clique para virar princípio.</p>
        <ul class="lista-incomp">${soltas.map(i => `<li><b>${esc(i.titulo)}</b>${i.descricao ? ` — <small>${esc(i.descricao)}</small>` : ''}
            <select data-ideia="${i.id}" aria-label="Função"><option value="">Pôr na função…</option>${folhas.map(f => `<option value="${f.id}">F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</option>`).join('')}</select></li>`).join('')}</ul></section>`;
}

PAGINAS.principios.depois = raiz => {
    raiz.addEventListener('change', e => {
        const s = e.target.closest('[data-ideia]');
        if (!s || !s.value) return;
        const p = PC.p, i = p.ideiasQFD.find(x => x.id === s.dataset.ideia);
        principiosDe(p, s.value).push({ id: uid('pr'), nome: i.titulo, descricao: i.descricao, imagem: null, metodo: 'Brainstorming', sugerido: true, origem: 'qfd', maturidade: '', concorrentes: [], fonte: 'Caderno de ideias do QFD', imagemUrl: '', vantagens: '', desvantagens: '' });
        salvar(); renderPagina(true);
    });
};

function acharPr(fid, id) { return principiosDe(PC.p, fid).find(x => x.id === id); }

Object.assign(ACOES, {
    'pr-add': b => {
        const l = principiosDe(PC.p, b.dataset.f);
        const x = { id: uid('pr'), nome: '', descricao: '', imagem: null, metodo: '', sugerido: false, origem: 'manual', maturidade: '', concorrentes: [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' };
        l.push(x); salvar(); renderPagina(true);
        const el = $(`[data-campo="principios.${b.dataset.f}#${x.id}.nome"]`); if (el) el.focus();
    },
    'pr-sug': b => { principiosDe(PC.p, b.dataset.f).push({ id: uid('pr'), nome: b.dataset.nome, descricao: b.dataset.desc || '', imagem: null, metodo: 'Catálogo de projeto', sugerido: true, origem: 'catalogo', maturidade: 'mercado', concorrentes: [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' }); salvar(); renderPagina(true); },
    'pr-bib': b => {
        const i = sugerirDaBiblioteca(PC.estrutura().nos.find(n => n.id === b.dataset.f).nome, 50).find(x => x.nome === b.dataset.nome);
        if (!i) return;
        principiosDe(PC.p, b.dataset.f).push({ id: uid('pr'), nome: i.nome, descricao: i.descricao, imagem: null, metodo: i.metodo || 'Análise de sistemas técnicos existentes', sugerido: true, origem: 'biblioteca', maturidade: i.maturidade, custo: i.custo, custoValor: null, concorrentes: i.concorrentes, fonte: i.fonte || (i.projeto ? 'Projeto ' + i.projeto : ''), imagemUrl: '', vantagens: '', desvantagens: '' });
        salvar(); renderPagina(true);
    },
    'pr-catalogo-todas': () => {
        const p = PC.p; let n = 0;
        funcoesFolha(estEscolhida()).forEach(f => {
            const l = principiosDe(p, f.id);
            sugerirPrincipios(f.nome).forEach(s => { if (!l.some(x => semAcento(x.nome) === semAcento(s.nome))) { l.push({ id: uid('pr'), nome: s.nome, descricao: s.descricao, imagem: null, metodo: 'Catálogo de projeto', sugerido: true, origem: 'catalogo', maturidade: 'mercado', concorrentes: [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' }); n++; } });
        });
        salvar(); renderPagina(true);
        avisar(n ? `${n} princípio(s) acrescentado(s) do catálogo. Apague os que não servem.` : 'O catálogo não tem sugestões novas para estas funções. Use os métodos do Quadro 1.');
    },
    'pr-del': async b => {
        const p = PC.p, x = acharPr(b.dataset.f, b.dataset.id);
        if (!x) return;
        if (x.nome && !confirm(`Excluir o princípio "${x.nome}"?`)) return;
        if (x.imagem) await Imagens.apagar(x.imagem);
        p.principios[b.dataset.f] = principiosDe(p, b.dataset.f).filter(y => y.id !== x.id);
        p.incompatibilidades = p.incompatibilidades.filter(i => i.a !== x.id && i.b !== x.id);
        p.variantes.forEach(v => { if (v.escolhas[b.dataset.f] === x.id) delete v.escolhas[b.dataset.f]; });
        salvar(); renderPagina(true);
    },
    'pr-mover': b => {
        const l = principiosDe(PC.p, b.dataset.f), i = l.findIndex(x => x.id === b.dataset.id), j = i + +b.dataset.d;
        if (i < 0 || j < 0 || j >= l.length) return;
        [l[i], l[j]] = [l[j], l[i]]; salvar(); renderPagina(true);
    },
    'pr-desenho': async b => {
        const x = acharPr(b.dataset.f, b.dataset.id);
        const arq = await abrirEsboco(`Esboço: ${x.nome || 'princípio de solução'}`);
        if (!arq) return;
        const id = await Imagens.salvar(arq, x.nome);
        if (x.imagem) await Imagens.apagar(x.imagem);
        x.imagem = id; salvar(); renderPagina(true);
    },
    'pr-foto': async b => {
        const arq = await escolherArquivo(b.dataset.cam ? '#arq-camera' : '#arq-imagem');
        if (!arq) return;
        const x = acharPr(b.dataset.f, b.dataset.id);
        const id = await Imagens.salvar(arq, x.nome);
        if (x.imagem) await Imagens.apagar(x.imagem);
        x.imagem = id; salvar(); renderPagina(true);
    },
    'pr-foto-del': async b => { const x = acharPr(b.dataset.f, b.dataset.id); if (x.imagem) await Imagens.apagar(x.imagem); x.imagem = null; salvar(); renderPagina(true); }
});

// ============================================================================
// 5 MATRIZ MORFOLÓGICA
// ============================================================================

/** Escolhe n combinações bem diferentes entre si (para montar concepções iniciais). */
function combinacoesDiversas(combos, n) {
    if (!combos.length) return [];
    const out = [combos[0]];
    const dist = (a, b) => Object.keys(a.escolhas).filter(k => a.escolhas[k] !== b.escolhas[k]).length;
    while (out.length < n) {
        let melhor = null, md = -1;
        combos.forEach(c => { if (out.includes(c)) return; const d = Math.min(...out.map(o => dist(o, c))) - c.custo * 0.01; if (d > md) { md = d; melhor = c; } });
        if (!melhor || md <= 0) break;
        out.push(melhor);
    }
    return out;
}

function novaVariante(p, escolhas = {}) {
    const i = p.variantes.length;
    const v = { id: uid('vr'), nome: `Concepção ${i + 1}`, cor: CORES_VARIANTES.find(c => !p.variantes.some(x => x.cor === c)) || CORES_VARIANTES[i % CORES_VARIANTES.length], escolhas: Object.assign({}, escolhas), descricao: '' };
    p.variantes.push(v);
    return v;
}

PAGINAS.matriz = {
    titulo: 'Matriz morfológica',
    sub: 'Combine um princípio de cada função para formar concepções. Escolha a concepção ativa e clique nos princípios; as linhas coloridas mostram cada combinação.',
    render(p) {
        const est = estEscolhida();
        const folhas = funcoesFolha(est);
        if (!est || !folhas.length) return `<section class="card">${vazio('Monte primeiro a <a href="#/estrutura">estrutura funcional</a>.')}</section>`;
        const nCol = Math.max(1, ...folhas.map(f => principiosDe(p, f.id).length));
        if (!App.varAtiva || !p.variantes.some(v => v.id === App.varAtiva)) App.varAtiva = p.variantes[0] ? p.variantes[0].id : null;
        const ativa = p.variantes.find(v => v.id === App.varAtiva);
        const total = totalCombinacoes(p, est);
        const conflitosAtiva = ativa ? conflitosVariante(p, ativa).flat() : [];
        const linha = f => {
            const prs = principiosDe(p, f.id);
            const celulas = [];
            for (let i = 0; i < nCol; i++) {
                const x = prs[i];
                if (!x) { celulas.push(i === prs.length ? `<td class="mm-vazia"><button type="button" class="btn-link" data-acao="mm-add" data-f="${f.id}">+ princípio</button></td>` : '<td class="mm-vazia"></td>'); continue; }
                const quem = p.variantes.filter(v => v.escolhas[f.id] === x.id);
                const ehAtiva = ativa && ativa.escolhas[f.id] === x.id;
                celulas.push(`<td><button type="button" class="mm-cel ${ehAtiva ? 'escolhida' : ''} ${ehAtiva && conflitosAtiva.includes(x.id) ? 'conflito' : ''}" data-acao="mm-escolher" data-f="${f.id}" data-id="${x.id}"
                    data-mm="${f.id}|${x.id}" ${ehAtiva ? `style="--cor:${ativa.cor}"` : ''} title="${escAttr(x.descricao || x.nome)}">
                    ${x.imagem ? imgTag(x.imagem, x.nome, 'mm-img') : ''}<span>${esc(x.nome || 'sem nome')}</span>
                    ${quem.length ? `<i class="mm-pontos">${quem.map(v => `<b style="background:${v.cor}" title="${escAttr(v.nome)}"></b>`).join('')}</i>` : ''}
                    ${ehAtiva && conflitosAtiva.includes(x.id) ? '<em class="mm-alerta" title="Incompatível com outro princípio escolhido">⚠</em>' : ''}</button></td>`);
            }
            return `<tr><th scope="row"><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome || 'sem nome')}</th>${celulas.join('')}</tr>`;
        };
        const todosPr = folhas.flatMap(f => principiosDe(p, f.id).map(x => ({ f, x })));
        const opPr = sel => `<option value="">Escolha…</option>${folhas.map(f => `<optgroup label="${escAttr(nomeFuncaoCompleto(est, f))}">${principiosDe(p, f.id).map(x => `<option value="${x.id}" ${sel === x.id ? 'selected' : ''}>${esc(x.nome || 'sem nome')}</option>`).join('')}</optgroup>`).join('')}`;
        const nomePr = id => { const x = acharPrincipio(p, id); return x ? x.nome : '?'; };
        return `
        <section class="card">
            <div class="card-topo"><h2>Concepções</h2>
                <div class="botoes">
                    <button type="button" class="btn btn-primary btn-sm" data-acao="mm-var-nova">+ Nova concepção</button>
                    ${!p.variantes.length && folhas.every(f => principiosDe(p, f.id).length) ? '<button type="button" class="btn btn-secondary btn-sm" data-acao="mm-auto">Montar 3 concepções automaticamente</button>' : ''}
                </div></div>
            ${p.variantes.length ? `<div class="variantes" role="radiogroup" aria-label="Concepção ativa">${p.variantes.map(v => {
                const falta = folhas.filter(f => !v.escolhas[f.id]).length, conf = conflitosVariante(p, v).length;
                return `<button type="button" role="radio" aria-checked="${v.id === App.varAtiva}" class="variante ${v.id === App.varAtiva ? 'ativa' : ''}" style="--cor:${v.cor}" data-acao="mm-var-ativar" data-id="${v.id}">
                    <b></b>${esc(v.nome)}<small>${falta ? `faltam ${falta}` : 'completa'}${conf ? ' · ⚠ incompatível' : ''}</small></button>`;
            }).join('')}</div>
            ${ativa ? `<div class="variante-edicao">
                <label>Nome <input type="text" data-campo="variantes#${ativa.id}.nome" value="${escAttr(ativa.nome)}" maxlength="60"></label>
                <label class="largo">Ideia desta concepção <input type="text" data-campo="variantes#${ativa.id}.descricao" value="${escAttr(ativa.descricao)}" maxlength="300" placeholder="Ex.: a mais simples e barata"></label>
                <label>Cor <input type="color" data-campo="variantes#${ativa.id}.cor" data-rerender value="${escAttr(ativa.cor)}"></label>
                <div class="botoes"><button type="button" class="btn btn-secondary btn-sm" data-acao="mm-var-dup">Duplicar</button><button type="button" class="btn btn-danger btn-sm" data-acao="mm-var-del">Excluir</button></div>
            </div>` : ''}` : vazio('Nenhuma concepção ainda. Crie uma e clique em um princípio por linha, ou peça para montar automaticamente.')}
        </section>

        <section class="card card-matriz">
            <div class="card-topo"><h2>Matriz</h2><span class="contador">${total.toLocaleString('pt-BR')} combinações possíveis</span></div>
            <div class="mm-rolagem"><div class="mm-envoltorio">
                <table class="matriz-morfologica"><thead><tr><th>Função</th>${Array.from({ length: nCol }, (_, i) => `<th>Princípio ${i + 1}</th>`).join('')}</tr></thead>
                <tbody>${folhas.map(linha).join('')}</tbody></table>
                <svg class="mm-linhas" aria-hidden="true"></svg>
            </div></div>
            <p class="nota">${ativa ? `Clique para escolher o princípio de cada função na <b style="color:${ativa.cor}">${esc(ativa.nome)}</b>; clique de novo para desmarcar.` : 'Crie uma concepção para começar a combinar.'} Para mudar fotos e descrições, vá a <a href="#/principios">Princípios de solução</a>.</p>
        </section>

        <div class="grade-2">
        <section class="card">
            <h2>Combinações sugeridas</h2>
            <p class="nota">Combina os princípios respeitando as incompatibilidades e dando preferência aos primeiros de cada linha (os mais adequados).</p>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="mm-gerar">Sugerir combinações compatíveis</button>
            <div id="mm-sugestoes">${(App.combinacoes || []).map((c, i) => `<div class="combinacao"><ol>${folhas.filter(f => c.escolhas[f.id]).map(f => `<li><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(nomePr(c.escolhas[f.id]))}</li>`).join('')}</ol>
                <button type="button" class="btn btn-primary btn-sm" data-acao="mm-usar" data-i="${i}">Usar como concepção</button></div>`).join('')}</div>
        </section>
        <section class="card">
            <h2>Incompatibilidades</h2>
            <p class="nota">Pares de princípios que não funcionam juntos (Pahl et al., 2005: combinar só princípios compatíveis).</p>
            ${todosPr.length > 1 ? `<div class="incomp-form">
                <select id="inc-a" aria-label="Princípio A">${opPr('')}</select><span>✕</span><select id="inc-b" aria-label="Princípio B">${opPr('')}</select>
                <input type="text" id="inc-nota" placeholder="Por quê? (opcional)" maxlength="160" aria-label="Motivo">
                <button type="button" class="btn btn-secondary btn-sm" data-acao="mm-inc-add">Marcar</button></div>` : ''}
            <ul class="lista-incomp">${p.incompatibilidades.map(i => `<li><b>${esc(nomePr(i.a))}</b> ✕ <b>${esc(nomePr(i.b))}</b>${i.nota ? ` — ${esc(i.nota)}` : ''} <button type="button" class="btn-icone" data-acao="mm-inc-del" data-id="${i.id}" aria-label="Excluir">✕</button></li>`).join('')}</ul>
        </section>
        </div>

        ${htmlCartaoIA(p, true)}
        ${p.variantes.length ? `<section class="card"><h2>Resumo das concepções</h2>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Função</th>${p.variantes.map(v => `<th><span class="ponto" style="background:${v.cor}"></span>${esc(v.nome)}</th>`).join('')}</tr></thead>
            <tbody>${folhas.map(f => `<tr><td><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome)}</td>${p.variantes.map(v => `<td>${v.escolhas[f.id] ? esc(nomePr(v.escolhas[f.id])) : '<span class="falta">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody>
            <tfoot><tr><th>Custo estimado</th>${p.variantes.map(v => `<td>${esc(textoCusto(custoConcepcao(p, est, v)))}</td>`).join('')}</tr></tfoot></table></div>
            <p class="nota">O custo vem do campo "Custo" de cada princípio (Barato/Médio/Caro ou o valor em R$), em Princípios de solução.</p>
        </section>` : ''}
        ${dica(`<ol><li>Combine só princípios <b>compatíveis</b>.</li><li>Só os que atendem às <b>especificações</b> e ao orçamento.</li><li>Concentre-se nas combinações <b>promissoras</b> e registre o porquê.</li></ol><p>Critérios para limitar as combinações (Pahl et al., 2005).</p>`, 'Critérios para combinar')}`;
    },
    depois(raiz) {
        desenharLinhasMatriz();
        if (!App._mmResize) { App._mmResize = true; window.addEventListener('resize', () => { if (App.pagina === 'matriz') desenharLinhasMatriz(); }); }
        $$('.mm-img', raiz).forEach(img => img.addEventListener('load', desenharLinhasMatriz));
    }
};

/** Linhas que ligam os princípios escolhidos de cada concepção (como na matriz feita à mão). */
function desenharLinhasMatriz() {
    const env = $('.mm-envoltorio'), svg = $('.mm-linhas');
    if (!env || !svg) return;
    const p = PC.p, est = estEscolhida(), folhas = funcoesFolha(est);
    const r0 = env.getBoundingClientRect();
    svg.setAttribute('width', env.scrollWidth); svg.setAttribute('height', env.scrollHeight);
    svg.setAttribute('viewBox', `0 0 ${env.scrollWidth} ${env.scrollHeight}`);
    const n = p.variantes.length;
    svg.innerHTML = p.variantes.map((v, k) => {
        const pts = folhas.map(f => v.escolhas[f.id] ? $(`[data-mm="${f.id}|${v.escolhas[f.id]}"]`, env) : null).filter(Boolean).map(el => {
            const r = el.getBoundingClientRect();
            return [r.left - r0.left + r.width / 2 + (k - (n - 1) / 2) * 6, r.top - r0.top + r.height / 2];
        });
        if (pts.length < 2) return '';
        const ativa = v.id === App.varAtiva;
        return `<polyline points="${pts.map(q => q.map(c => c.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${v.cor}" stroke-width="${ativa ? 4 : 2.5}" stroke-opacity="${ativa ? 0.9 : 0.55}" stroke-linejoin="round" stroke-linecap="round"/>` +
            pts.map(q => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${ativa ? 5 : 3.5}" fill="${v.cor}"/>`).join('');
    }).join('');
}

Object.assign(ACOES, {
    'mm-var-nova': () => { const v = novaVariante(PC.p); App.varAtiva = v.id; salvar(); renderPagina(true); },
    'mm-var-ativar': b => { App.varAtiva = b.dataset.id; renderPagina(true); },
    'mm-var-dup': () => { const p = PC.p, a = p.variantes.find(v => v.id === App.varAtiva); const v = novaVariante(p, a.escolhas); v.nome = a.nome + ' (variação)'; App.varAtiva = v.id; salvar(); renderPagina(true); },
    'mm-var-del': () => {
        const p = PC.p, a = p.variantes.find(v => v.id === App.varAtiva);
        if (!confirm(`Excluir "${a.nome}"?`)) return;
        p.variantes = p.variantes.filter(v => v.id !== a.id);
        ['viabilidade'].forEach(k => delete p.selecao[k][a.id]);
        delete p.selecao.tecnologia.respostas[a.id]; delete p.selecao.passa.respostas[a.id]; delete p.selecao.avaliacao.notas[a.id];
        if (p.selecao.avaliacao.referencia === a.id) p.selecao.avaliacao.referencia = null;
        if (p.concepcao.varianteId === a.id) p.concepcao.varianteId = null;
        App.varAtiva = null; salvar(); renderPagina(true);
    },
    'mm-escolher': b => {
        const p = PC.p;
        let v = p.variantes.find(x => x.id === App.varAtiva);
        if (!v) { v = novaVariante(p); App.varAtiva = v.id; }
        if (v.escolhas[b.dataset.f] === b.dataset.id) delete v.escolhas[b.dataset.f]; else v.escolhas[b.dataset.f] = b.dataset.id;
        salvar(); renderPagina(true);
    },
    'mm-add': b => {
        const nome = prompt('Nome do novo princípio de solução:');
        if (!nome || !nome.trim()) return;
        principiosDe(PC.p, b.dataset.f).push({ id: uid('pr'), nome: nome.trim(), descricao: '', imagem: null, metodo: '', sugerido: false, origem: 'manual', maturidade: '', concorrentes: [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' });
        salvar(); renderPagina(true);
    },
    'mm-gerar': () => {
        const p = PC.p, est = estEscolhida();
        const existentes = new Set(p.variantes.map(v => JSON.stringify(Object.keys(v.escolhas).sort().map(k => v.escolhas[k]))));
        App.combinacoes = gerarCombinacoes(p, est, 60).filter(c => !existentes.has(JSON.stringify(Object.keys(c.escolhas).sort().map(k => c.escolhas[k])))).slice(0, 6);
        renderPagina(true);
        if (!App.combinacoes.length) avisar('Nenhuma combinação compatível nova. Acrescente princípios ou revise as incompatibilidades.', 'erro');
    },
    'mm-usar': b => { const c = App.combinacoes[+b.dataset.i]; const v = novaVariante(PC.p, c.escolhas); App.varAtiva = v.id; App.combinacoes.splice(+b.dataset.i, 1); salvar(); renderPagina(true); },
    'mm-auto': () => {
        const p = PC.p, est = estEscolhida();
        const cs = combinacoesDiversas(gerarCombinacoes(p, est, 400), 3);
        cs.forEach(c => novaVariante(p, c.escolhas));
        App.varAtiva = p.variantes[0] ? p.variantes[0].id : null;
        salvar(); renderPagina(true);
        avisar(cs.length ? `${cs.length} concepção(ões) montada(s), bem diferentes entre si. Ajuste à vontade.` : 'Não há combinações compatíveis.', cs.length ? 'ok' : 'erro');
    },
    'mm-inc-add': () => {
        const a = $('#inc-a').value, b = $('#inc-b').value, nota = $('#inc-nota').value.trim();
        if (!a || !b || a === b) { avisar('Escolha dois princípios diferentes.', 'erro'); return; }
        const p = PC.p;
        if (incompativeis(p, a, b)) { avisar('Este par já está marcado.'); return; }
        const fa = acharPrincipio(p, a), fb = acharPrincipio(p, b);
        if (fa.funcId === fb.funcId) { avisar('Os dois são da mesma função: uma concepção nunca usa os dois juntos.', 'erro'); return; }
        p.incompatibilidades.push({ id: uid('ic'), a, b, nota });
        salvar(); renderPagina(true);
    },
    'mm-inc-del': b => { PC.p.incompatibilidades = PC.p.incompatibilidades.filter(i => i.id !== b.dataset.id); salvar(); renderPagina(true); }
});

// ============================================================================
// 6 SELEÇÃO DA CONCEPÇÃO (Reis, 2003)
// ============================================================================

const ESTADOS_VIAB = { viavel: 'Viável', condicional: 'Condicionalmente viável', nao: 'Não viável' };

PAGINAS.selecao = {
    titulo: 'Seleção da concepção',
    sub: 'Quatro filtros em sequência (Reis, 2003): só segue para o próximo a concepção que passou no anterior. As promissoras são evoluídas (massa, dimensões, custo, esboço) e avaliadas de novo pelas especificações.',
    render(p) {
        if (!p.variantes.length) return `<section class="card">${vazio('Monte as concepções na <a href="#/matriz">matriz morfológica</a> primeiro.')}</section>`;
        const s = p.selecao, r = resultadoSelecao(p);
        const R = id => r.find(x => x.id === id);
        const cab = (filtro) => p.variantes.map(v => `<th class="${filtro && !filtro(R(v.id)) ? 'fora' : ''}"><span class="ponto" style="background:${v.cor}"></span>${esc(v.nome)}</th>`).join('');
        const desc = v => { const est = estEscolhida(); return funcoesFolha(est).filter(f => v.escolhas[f.id]).map(f => (acharPrincipio(p, v.escolhas[f.id]) || {}).nome).join(' · '); };
        const respSel = (campo, val, ops, ativo) => ativo ? `<select data-campo="${campo}" data-rerender class="resp resp-${val || 'vazia'}">${['<option value="">—</option>'].concat(Object.entries(ops).map(([k, t]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${t}</option>`)).join('')}</select>` : '<span class="fora">—</span>';
        const refOk = s.avaliacao.referencia && R(s.avaliacao.referencia) && R(s.avaliacao.referencia).etapa3;
        const naMatriz = p.variantes.filter(v => R(v.id).etapa3);
        const melhor = r.filter(x => x.promissora).sort((a, b) => b.ponderada - a.ponderada || b.soma - a.soma)[0];
        return `
        <section class="card">
            <h2>1. Julgamento da viabilidade</h2>
            <p class="nota">Avalie cada concepção pela experiência da equipe: viável, condicionalmente viável (depende de algo) ou não viável — e diga por quê.</p>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Concepção</th><th>Princípios</th><th>Julgamento</th><th>Razão</th></tr></thead>
            <tbody>${p.variantes.map(v => { const vb = s.viabilidade[v.id] || {}; return `<tr><td><span class="ponto" style="background:${v.cor}"></span><b>${esc(v.nome)}</b></td><td class="pequeno">${esc(desc(v))}</td>
                <td>${respSel(`selecao.viabilidade.${v.id}.estado`, vb.estado, ESTADOS_VIAB, true)}</td>
                <td><input type="text" data-campo="selecao.viabilidade.${v.id}.razao" value="${escAttr(vb.razao || '')}" maxlength="300" aria-label="Razão"></td></tr>`; }).join('')}</tbody></table></div>
        </section>

        <section class="card">
            <div class="card-topo"><h2>2. Disponibilidade de tecnologia</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="sel-perg-add" data-k="tecnologia">+ Pergunta</button></div>
            <p class="nota">Para as viáveis: a tecnologia está madura? Passa quem responder "sim" a pelo menos metade das perguntas.</p>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Pergunta</th>${cab(x => x.etapa1)}<th></th></tr></thead>
            <tbody>${s.tecnologia.perguntas.map(q => `<tr><td><input type="text" data-campo="selecao.tecnologia.perguntas#${q.id}.texto" value="${escAttr(q.texto)}" aria-label="Pergunta"></td>
                ${p.variantes.map(v => `<td>${respSel(`selecao.tecnologia.respostas.${v.id}.${q.id}`, (s.tecnologia.respostas[v.id] || {})[q.id], { sim: 'Sim', nao: 'Não' }, R(v.id).etapa1)}</td>`).join('')}
                <td><button type="button" class="btn-icone" data-acao="sel-perg-del" data-k="tecnologia" data-id="${q.id}" aria-label="Excluir">✕</button></td></tr>`).join('')}</tbody></table></div>
        </section>

        <section class="card">
            <div class="card-topo"><h2>3. Exame passa / não passa</h2>
                <div class="botoes"><button type="button" class="btn btn-secondary btn-sm" data-acao="sel-passa-necess">Gerar perguntas das necessidades</button><button type="button" class="btn btn-secondary btn-sm" data-acao="sel-perg-add" data-k="passa">+ Pergunta</button></div></div>
            <p class="nota">As necessidades dos clientes viram perguntas de sim/talvez/não. Passa quem tiver "não" em no máximo um terço delas.</p>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Pergunta</th>${cab(x => x.etapa2)}<th></th></tr></thead>
            <tbody>${s.passa.perguntas.map(q => `<tr><td><input type="text" data-campo="selecao.passa.perguntas#${q.id}.texto" value="${escAttr(q.texto)}" aria-label="Pergunta"></td>
                ${p.variantes.map(v => `<td>${respSel(`selecao.passa.respostas.${v.id}.${q.id}`, (s.passa.respostas[v.id] || {})[q.id], { sim: 'Sim', talvez: 'Talvez', nao: 'Não' }, R(v.id).etapa2)}</td>`).join('')}
                <td><button type="button" class="btn-icone" data-acao="sel-perg-del" data-k="passa" data-id="${q.id}" aria-label="Excluir">✕</button></td></tr>`).join('') || `<tr><td colspan="${p.variantes.length + 2}">Sem perguntas. Gere a partir das necessidades.</td></tr>`}</tbody></table></div>
        </section>

        <section class="card">
            <div class="card-topo"><h2>4. Matriz de avaliação</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="sel-crit-add">+ Critério</button></div>
            <p class="nota">Compare com uma concepção de referência: <b>+</b> melhor, <b>S</b> igual, <b>−</b> pior. As que somarem mais que a referência são as promissoras.</p>
            <label class="campo-inline">Referência <select data-campo="selecao.avaliacao.referencia" data-tipo="nulo" data-rerender><option value="">Escolha…</option>${naMatriz.map(v => `<option value="${v.id}" ${s.avaliacao.referencia === v.id ? 'selected' : ''}>${esc(v.nome)}</option>`).join('')}</select></label>
            ${naMatriz.length ? '' : '<p class="aviso-inline">Nenhuma concepção passou nos filtros 1 a 3 ainda.</p>'}
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Critério</th><th>Peso</th>${cab(x => x.etapa3)}<th></th></tr></thead>
            <tbody>${s.avaliacao.criterios.map(c => `<tr><td><input type="text" data-campo="selecao.avaliacao.criterios#${c.id}.texto" value="${escAttr(c.texto)}" aria-label="Critério"></td>
                <td class="col-num"><input type="number" min="0" step="0.1" data-campo="selecao.avaliacao.criterios#${c.id}.peso" data-tipo="num" data-rerender value="${+c.peso || 0}" aria-label="Peso"></td>
                ${p.variantes.map(v => `<td>${v.id === s.avaliacao.referencia ? '<b class="ref">S</b>' : R(v.id).etapa3 && refOk
                    ? `<select data-campo="selecao.avaliacao.notas.${v.id}.${c.id}" data-tipo="num" data-rerender class="resp">${[['', '—'], ['1', '+'], ['0', 'S'], ['-1', '−']].map(([k, t]) => `<option value="${k}" ${String((s.avaliacao.notas[v.id] || {})[c.id] ?? '') === k ? 'selected' : ''}>${t}</option>`).join('')}</select>` : '<span class="fora">—</span>'}</td>`).join('')}
                <td><button type="button" class="btn-icone" data-acao="sel-crit-del" data-id="${c.id}" aria-label="Excluir">✕</button></td></tr>`).join('')}</tbody>
            <tfoot><tr><th colspan="2">Soma (+ menos −)</th>${p.variantes.map(v => `<td class="col-num">${R(v.id).etapa3 && refOk ? (v.id === s.avaliacao.referencia ? '0' : R(v.id).soma) : ''}</td>`).join('')}<td></td></tr>
            <tr><th colspan="2">Média ponderada</th>${p.variantes.map(v => `<td class="col-num">${R(v.id).etapa3 && refOk ? (v.id === s.avaliacao.referencia ? '0' : R(v.id).ponderada.toLocaleString('pt-BR', { maximumFractionDigits: 2 })) : ''}</td>`).join('')}<td></td></tr></tfoot></table></div>
        </section>

        ${htmlEvolucao(p)}
        ${htmlAvaliacaoFinal(p)}
        <section class="card">
            <h2>Resultado</h2>
            <div class="tabela-rolagem"><table class="tabela tabela-resultado"><thead><tr><th>Concepção</th><th>1 Viabilidade</th><th>2 Tecnologia</th><th>3 Passa/não passa</th><th>4 Avaliação</th><th>Custo estimado</th><th></th></tr></thead>
            <tbody>${r.map(x => `<tr class="${melhor && melhor.id === x.id ? 'linha-melhor' : ''}"><td><span class="ponto" style="background:${x.cor}"></span><b>${esc(x.nome)}</b></td>
                <td>${x.viabilidade ? (x.etapa1 ? '✓ ' : '✗ ') + ESTADOS_VIAB[x.viabilidade] : '…'}</td>
                <td>${!x.etapa1 ? '' : x.respTec < x.nPerg ? `… ${x.respTec}/${x.nPerg}` : x.etapa2 ? `✓ ${x.naoTec} não` : `✗ ${x.naoTec} não`}</td>
                <td>${!x.etapa2 ? '' : x.respPassa < x.nPassa ? `… ${x.respPassa}/${x.nPassa}` : x.etapa3 ? `✓ ${x.naoPassa} não` : `✗ ${x.naoPassa} não`}</td>
                <td>${!x.etapa3 ? '' : x.ehRef ? 'referência' : refOk ? `${x.soma > 0 ? '+' : ''}${x.soma} (${x.ponderada.toLocaleString('pt-BR', { maximumFractionDigits: 2 })})` : '…'}</td>
                <td class="pequeno">${esc(textoCusto(custoConcepcao(p, estEscolhida(), p.variantes.find(v => v.id === x.id))))}</td>
                <td>${x.etapa3 ? (p.concepcao.varianteId === x.id ? '<span class="etapa-selo-ok">escolhida</span>' : `<button type="button" class="btn btn-secondary btn-sm" data-acao="sel-escolher" data-id="${x.id}">Escolher</button>`) : ''}</td></tr>`).join('')}</tbody></table></div>
            ${melhor ? `<p>Melhor avaliada: <b>${esc(melhor.nome)}</b>. ${p.concepcao.varianteId === melhor.id ? '' : `<button type="button" class="btn btn-primary btn-sm" data-acao="sel-escolher" data-id="${melhor.id}">Seguir com ${esc(melhor.nome)} →</button>`}</p>` : ''}
        </section>`;
    }
};

Object.assign(ACOES, {
    'sel-perg-add': b => { PC.p.selecao[b.dataset.k].perguntas.push({ id: uid('pp'), texto: '' }); salvar(); renderPagina(true); },
    'sel-perg-del': b => { const k = PC.p.selecao[b.dataset.k]; k.perguntas = k.perguntas.filter(q => q.id !== b.dataset.id); salvar(); renderPagina(true); },
    'sel-passa-necess': () => {
        const p = PC.p; let n = 0;
        p.necessidades.forEach(nc => { const t = perguntaDaNecessidade(nc.descricao); if (t && !p.selecao.passa.perguntas.some(q => q.texto === t)) { p.selecao.passa.perguntas.push({ id: uid('pp'), texto: t }); n++; } });
        if (!p.selecao.avaliacao.criterios.length) p.selecao.avaliacao.criterios = p.necessidades.map(nc => ({ id: uid('cr'), texto: nc.descricao, peso: Math.round((nc.peso || 0) * 1000) / 10 || 1 }));
        salvar(); renderPagina(true); avisar(n ? `${n} pergunta(s) criada(s).` : 'Sem necessidades novas (veja o Escopo).');
    },
    'sel-crit-add': () => { PC.p.selecao.avaliacao.criterios.push({ id: uid('cr'), texto: '', peso: 1 }); salvar(); renderPagina(true); },
    'sel-crit-del': b => { const a = PC.p.selecao.avaliacao; a.criterios = a.criterios.filter(c => c.id !== b.dataset.id); salvar(); renderPagina(true); },
    'sel-escolher': b => { PC.p.concepcao.varianteId = b.dataset.id; salvar(); location.hash = '#/concepcao'; }
});

// ============================================================================
// 7 CONCEPÇÃO SELECIONADA
// ============================================================================

function rascunhoDescricao(p, v) {
    const est = estEscolhida();
    const partes = funcoesFolha(est).filter(f => v.escolhas[f.id]).map(f => { const x = acharPrincipio(p, v.escolhas[f.id]) || {}; return `${f.nome.charAt(0).toLowerCase() + f.nome.slice(1)} por ${x.nome ? x.nome.charAt(0).toLowerCase() + x.nome.slice(1) : '—'}`; });
    return `A concepção "${v.nome}" ${p.funcaoGlobal.nome ? 'cumpre a função global "' + p.funcaoGlobal.nome.toLowerCase() + '" ao ' : 'realiza as funções ao '}${partes.join('; ')}.${v.descricao ? ' ' + v.descricao.charAt(0).toUpperCase() + v.descricao.slice(1) + (/[.!?]$/.test(v.descricao) ? '' : '.') : ''}`;
}
const PROXIMOS_PASSOS_PADRAO = '- Definir as dimensões principais e o arranjo dos componentes\n- Fazer os desenhos de conjunto (esboço em escala)\n- Verificar as especificações críticas com cálculos preliminares\n- Incorporar os bons princípios das concepções descartadas\n- Planejar protótipo / modelo de testes para os pontos de maior risco';
/** Próximos passos conforme o tipo de projeto: os fluxos elétrico, de controle e embarcado reunidos na tese de Sigales (2025, seção 2.1). */
const PASSOS_POR_TIPO = {
    eletrico: '- Ciclo do projeto elétrico (Nilsson e Riedel, adaptado por Sigales, 2021): modelo do circuito → simulação (SPICE, Simulink) → protótipo físico → medição em bancada; repetir até atender às especificações\n- Escolher os componentes pelos limites de trabalho, de pico e de falha (tensão, corrente, potência dissipada, frequência), com fator de segurança',
    automacao: '- Controle (Nise): diagrama de blocos → esquema → modelo matemático (levantar em laboratório os parâmetros do motor ou da planta) → projetar e testar; se os requisitos forem conflitantes, reespecificar\n- Embarcado (Marwedel): separar o que é hardware e o que é software, reaproveitar módulos já validados (com controle de versões) e planejar testes de uso e de mau uso',
    agricola: '- Interface com a máquina: aproveitar o suporte padrão do fabricante quando existir (ex.: berço do dosador), para trocar sem modificar a máquina\n- Planejar o ensaio normatizado (ex.: ISO 7256-1 para dosadores) separado dos testes pontuais das especificações'
};
function proximosPassosPara(p) {
    const t = p.tipoProjeto, extra = t === 'misto' ? [PASSOS_POR_TIPO.eletrico, PASSOS_POR_TIPO.automacao] : PASSOS_POR_TIPO[t] ? [PASSOS_POR_TIPO[t]] : [];
    return [PROXIMOS_PASSOS_PADRAO].concat(extra).join('\n');
}

PAGINAS.concepcao = {
    titulo: 'Concepção selecionada',
    sub: 'Descreva a concepção escolhida, acrescente esboços e fotos e traga bons princípios das concepções descartadas (Spagnolo, 2011, etapa 6).',
    render(p) {
        if (!p.variantes.length) return `<section class="card">${vazio('Monte as concepções na <a href="#/matriz">matriz morfológica</a> e selecione uma na <a href="#/selecao">etapa 6</a>.')}</section>`;
        const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
        const est = estEscolhida(), folhas = funcoesFolha(est);
        const c = p.concepcao;
        const naoUsados = v ? folhas.flatMap(f => principiosDe(p, f.id).filter(x => x.id !== v.escolhas[f.id]).map(x => ({ f, x }))) : [];
        return `
        <section class="card">
            <label class="campo-destaque">Concepção escolhida
                <select data-campo="concepcao.varianteId" data-tipo="nulo" data-rerender><option value="">Escolha…</option>${p.variantes.map(x => `<option value="${x.id}" ${x.id === c.varianteId ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
            ${!v ? '<p class="nota">Dica: a etapa 6 indica a melhor avaliada.</p>' : ''}
        </section>
        ${v ? `
        <section class="card">
            <h2>Princípios de solução da concepção</h2>
            <div class="grade-concepcao">${folhas.map(f => { const x = acharPrincipio(p, v.escolhas[f.id]); return `<figure class="concepcao-item">
                ${x && x.imagem ? imgTag(x.imagem, x.nome) : '<div class="sem-foto">sem foto</div>'}
                <figcaption><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome)}<b>${x ? esc(x.nome) : '<span class="falta">não escolhido</span>'}</b></figcaption></figure>`; }).join('')}</div>
        </section>
        <section class="card">
            <div class="card-topo"><h2>Descrição</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="conc-rascunho">Rascunhar a partir dos princípios</button></div>
            <textarea rows="6" data-campo="concepcao.descricao" placeholder="Como a concepção funciona, arranjo dos componentes, pontos fortes e riscos">${esc(c.descricao)}</textarea>
        </section>
        <section class="card">
            <div class="card-topo"><h2>Esboços e fotos</h2><div class="botoes">
                <button type="button" class="btn btn-primary btn-sm so-toque" data-acao="conc-img-add" data-cam="1">📷 Tirar foto</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="conc-img-add">🖼 Acrescentar imagem</button>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="conc-desenho">✏ Desenhar esboço</button></div></div>
            ${c.imagens.length ? `<div class="grade-esbocos">${c.imagens.map(im => `<figure class="esboco">${imgTag(im.id, im.legenda)}
                <input type="text" data-campo="concepcao.imagens#${im.id}.legenda" value="${escAttr(im.legenda || '')}" placeholder="Legenda" maxlength="160" aria-label="Legenda">
                <button type="button" class="btn-icone perigo" data-acao="conc-img-del" data-id="${im.id}" aria-label="Remover">✕</button></figure>`).join('')}</div>`
                : vazio('Fotografe um esboço feito à mão, um modelo ou uma referência. As imagens vão no ZIP e no relatório.')}
        </section>
        <section class="card">
            <h2>Complementos de outras concepções</h2>
            <p class="nota">Bons princípios das concepções descartadas que podem melhorar a escolhida.</p>
            ${naoUsados.length ? `<div class="incomp-form"><select id="comp-pr" aria-label="Princípio">${folhas.map(f => `<optgroup label="${escAttr(nomeFuncaoCompleto(est, f))}">${principiosDe(p, f.id).filter(x => x.id !== v.escolhas[f.id]).map(x => `<option value="${x.id}">${esc(x.nome)}</option>`).join('')}</optgroup>`).join('')}</select>
                <input type="text" id="comp-nota" placeholder="Como aproveitar" maxlength="200" aria-label="Como aproveitar"><button type="button" class="btn btn-secondary btn-sm" data-acao="conc-comp-add">Acrescentar</button></div>` : ''}
            <ul class="lista-incomp">${c.complementos.map(k => { const x = acharPrincipio(p, k.principioId); return `<li><b>${esc(x ? x.nome : '?')}</b>${k.nota ? ' — ' + esc(k.nota) : ''} <button type="button" class="btn-icone" data-acao="conc-comp-del" data-id="${k.id}" aria-label="Excluir">✕</button></li>`; }).join('')}</ul>
        </section>
        ${htmlFMEA(p)}
        <section class="card">
            <div class="card-topo"><h2>Próximos passos (evoluir a concepção)</h2>${c.proximosPassos ? '' : '<button type="button" class="btn btn-secondary btn-sm" data-acao="conc-passos">Sugerir</button>'}</div>
            <textarea rows="6" data-campo="concepcao.proximosPassos">${esc(c.proximosPassos)}</textarea>
            <a class="btn btn-primary" href="#/relatorio">Gerar o relatório →</a>
        </section>` : ''}`;
    }
};

Object.assign(ACOES, {
    'conc-rascunho': () => {
        const p = PC.p, v = p.variantes.find(x => x.id === p.concepcao.varianteId);
        if (p.concepcao.descricao.trim() && !confirm('Substituir o texto atual pelo rascunho?')) return;
        p.concepcao.descricao = rascunhoDescricao(p, v); salvar(); renderPagina(true);
    },
    'conc-passos': () => { PC.p.concepcao.proximosPassos = proximosPassosPara(PC.p); salvar(); renderPagina(true); },
    'conc-desenho': async () => {
        const arq = await abrirEsboco('Esboço da concepção');
        if (!arq) return;
        const id = await Imagens.salvar(arq, 'esboço');
        PC.p.concepcao.imagens.push({ id, legenda: 'Esboço ' + (PC.p.concepcao.imagens.length + 1) });
        salvar(); renderPagina(true);
    },
    'conc-img-add': async b => {
        const arq = await escolherArquivo(b && b.dataset.cam ? '#arq-camera' : '#arq-imagem');
        if (!arq) return;
        const id = await Imagens.salvar(arq, arq.name);
        PC.p.concepcao.imagens.push({ id, legenda: arq.name.replace(/\.[^.]+$/, '') });
        salvar(); renderPagina(true);
    },
    'conc-img-del': async b => { await Imagens.apagar(b.dataset.id); PC.p.concepcao.imagens = PC.p.concepcao.imagens.filter(i => i.id !== b.dataset.id); salvar(); renderPagina(true); },
    'conc-comp-add': () => { const id = $('#comp-pr').value; if (!id) return; PC.p.concepcao.complementos.push({ id: uid('cp'), principioId: id, nota: $('#comp-nota').value.trim() }); salvar(); renderPagina(true); },
    'conc-comp-del': b => { PC.p.concepcao.complementos = PC.p.concepcao.complementos.filter(k => k.id !== b.dataset.id); salvar(); renderPagina(true); }
});

// ============================================================================
// 8 RELATÓRIO
// ============================================================================

PAGINAS.relatorio = {
    titulo: 'Relatório',
    sub: 'Relatório completo do projeto conceitual. Para PDF, use Imprimir → Salvar como PDF. O ZIP leva o relatório, os dados, as fotos e os diagramas.',
    render(p) {
        return `<section class="card relatorio-acoes">
            <button type="button" class="btn btn-primary" data-acao="rel-imprimir">🖨 Imprimir / Salvar PDF</button>
            <button type="button" class="btn btn-secondary" data-acao="baixar-zip">⬇ Baixar ZIP completo</button>
            <button type="button" class="btn btn-secondary" data-acao="rel-html">Baixar só o relatório (HTML)</button>
        </section>
        <div id="relatorio-previa" class="relatorio-previa"><style>${RELATORIO_CSS}</style>${corpoRelatorio(p, { dataImg: true })}</div>`;
    }
};

Object.assign(ACOES, {
    'rel-imprimir': async () => { await hidratarImagens($('#relatorio-previa')); window.print(); },
    'rel-html': async () => {
        // HTML único, com as imagens embutidas (abre em qualquer lugar)
        const p = PC.p, mapa = {};
        for (const id of imagensUsadas(p)) {
            const r = await Imagens.ler(id);
            if (r && r.blob) mapa[id] = await new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(r.blob); });
        }
        const rec = await carregarRecursos(), urls = {};
        for (const [n, b] of Object.entries(rec)) urls[n] = await blobParaDataUrl(b);
        baixarArquivo(new Blob([documentoRelatorio(p, id => mapa[id] || '', n => urls[n] || '')], { type: 'text/html' }), nomeSeguro(p.projeto.nome || 'projeto-conceitual') + '-relatorio.html');
    }
});
