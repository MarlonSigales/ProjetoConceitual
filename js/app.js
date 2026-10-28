/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * APLICAÇÃO: casca (menu de etapas, rotas, salvar automático), ligação dos campos aos dados, arquivo do
 * projeto (ZIP, abrir, importar do QFD, exemplo) e página inicial. As páginas das etapas estão em etapas.js.
 */

'use strict';

const App = {
    pagina: 'inicio',
    editor: null,
    salvoEm: null,
    _timer: null
};

// ============================================================================
// UTILIDADES DE INTERFACE
// ============================================================================

function $(s, r = document) { return r.querySelector(s); }
function $$(s, r = document) { return [...r.querySelectorAll(s)]; }

function avisar(msg, tipo = 'ok', ms = 3500) {
    const a = $('#aviso');
    a.textContent = msg;
    a.className = 'aviso-flutuante visivel ' + tipo;
    clearTimeout(avisar._t);
    avisar._t = setTimeout(() => a.classList.remove('visivel'), ms);
}

function baixarArquivo(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function escolherArquivo(input) {
    return new Promise(ok => {
        const el = typeof input === 'string' ? $(input) : input;
        el.value = '';
        el.onchange = () => ok(el.files && el.files[0] ? el.files[0] : null);
        el.click();
    });
}

/** Preenche os <img data-img="id"> com as fotos guardadas no navegador. */
async function hidratarImagens(raiz = document) {
    for (const img of $$('img[data-img]', raiz)) {
        const u = await Imagens.url(img.dataset.img);
        if (u) img.src = u; else img.replaceWith(Object.assign(document.createElement('span'), { className: 'img-faltando', textContent: 'imagem não encontrada' }));
    }
}

/** Deixa o resultado pronto para o Gestão de Projetos abrir no mesmo navegador (sem baixar arquivo). */
function publicarParaGestao() {
    try {
        const p = PC.p;
        // projeto salvo só na nuvem: nada dele fica neste computador (o Gestão usa o arquivo baixado)
        if (typeof modoArmazenamento === 'function' && modoArmazenamento() === 'nuvem') { localStorage.removeItem('pc_para_gestao'); return; }
        if (!p.estruturas.length || typeof exportarParaGestao !== 'function') return;
        localStorage.setItem('pc_para_gestao', JSON.stringify(exportarParaGestao(p)));
    } catch (e) { /* sem espaço: o arquivo para o Gestão continua disponível para baixar */ }
}

/** Cartão "Usar o QFD deste navegador" (quando o Sistema QFD foi usado neste navegador). */
function htmlQFDNavegador(p) {
    const q = lerQFDDoNavegador();
    if (!q) return '';
    const jaUsado = p.origemQFD && p.origemQFD.navegador && q.modificado && q.modificado <= (p.origemQFD.qfdModificado || '');
    if (jaUsado) return '';
    const quando = q.modificado ? new Date(q.modificado).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    return `<section class="card qfd-navegador">
        <div class="card-topo"><h2>📥 Há um QFD neste navegador</h2>
            <button type="button" class="btn btn-primary" data-acao="qfd-navegador">Usar este QFD</button></div>
        <p class="nota">Projeto <b>${esc(q.nome)}</b>${quando ? `, alterado em ${quando}` : ''}. Não precisa baixar nem escolher arquivo: tudo do QFD entra e as etapas são pré-preenchidas.${p.origemQFD ? ' O que você já fez aqui é mantido.' : ''}</p>
    </section>`;
}

function projetoTemConteudo(p) {
    return !!(p.projeto.nome || p.especificacoes.length || p.estruturas.length || p.variantes.length);
}

// ============================================================================
// SALVAR (automático, a cada alteração)
// ============================================================================

function salvar(adiado = false) {
    clearTimeout(App._timer);
    const faz = () => {
        try { PC.salvar(); App.salvoEm = new Date(); atualizarCasca(); publicarParaGestao(); }
        catch (e) { avisar(e.message, 'erro', 8000); }
    };
    if (adiado) App._timer = setTimeout(faz, 350); else faz();
}

// ============================================================================
// LIGAÇÃO CAMPO ↔ DADOS: data-campo="projeto.nome" | "especificacoes#ID.meta" | "selecao.viabilidade.ID.razao"
// ============================================================================

function alvoCaminho(obj, caminho, criar = true) {
    const segs = caminho.split('.');
    for (let i = 0; i < segs.length - 1; i++) {
        const s = segs[i];
        if (s.includes('#')) {
            const [arr, id] = s.split('#');
            obj = (obj[arr] || []).find(x => x.id === id);
        } else if (/^\d+$/.test(s) && Array.isArray(obj)) obj = obj[+s];
        else {
            if (obj[s] === undefined || obj[s] === null) { if (!criar) return null; obj[s] = {}; }
            obj = obj[s];
        }
        if (!obj) return null;
    }
    return { obj, chave: segs[segs.length - 1] };
}
function valorDoCampo(el) {
    const t = el.dataset.tipo;
    if (el.type === 'checkbox') return el.checked;
    if (t === 'num') { if (String(el.value).trim() === '') return null; const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v : null; }
    if (t === 'linhas') return el.value.split('\n').map(s => s.trim()).filter(Boolean);
    if (t === 'nulo') return el.value === '' ? null : el.value;
    if (t === 'pct') { const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v / 100 : 0; }
    return el.value;
}
function aoEditarCampo(e) {
    const el = e.target;
    if (!el.dataset || !el.dataset.campo || el.closest('.dg-painel')) return;
    const alvo = alvoCaminho(PC.p, el.dataset.campo);
    if (!alvo) return;
    alvo.obj[alvo.chave] = valorDoCampo(el);
    const final = e.type === 'change';
    if (final && el.dataset.rerender !== undefined) { salvar(); renderPagina(true); return; }
    salvar(!final);
    if (el.dataset.campo === 'projeto.nome') atualizarCasca();
}

// ============================================================================
// CASCA: menu de etapas, topo, navegação anterior/próxima
// ============================================================================

const PAGINAS = {};   // preenchido em etapas.js: { id: { titulo, sub, render(p) → html, depois(raiz, p) } }

function atualizarCasca() {
    const p = PC.p;
    const st = statusEtapas(p);
    const prox = proximaEtapa(p, st);
    $('#topbar-projeto-nome').textContent = p.projeto.nome || 'Projeto sem nome';
    $('#sidebar-nav').innerHTML =
        `<a href="#/inicio" class="sidebar-link ${App.pagina === 'inicio' ? 'ativo' : ''}"><span class="sidebar-num">⌂</span><span>Início</span></a>
         <span class="sidebar-grupo">Etapas</span>` +
        ETAPAS.map(linkEtapa).join('') +
        (typeof ETAPAS_PRELIM !== 'undefined' ? `<span class="sidebar-grupo">Projeto preliminar${p.concepcao.varianteId ? '' : ' <small>(após a concepção)</small>'}</span>` + ETAPAS_PRELIM.map(linkEtapa).join('') : '');
    function linkEtapa([id, num, nome]) {
        const s = st[id];
        const cls = ['sidebar-link', App.pagina === id ? 'ativo' : '', 'etapa-' + s.estado, prox.id === id && s.estado !== 'feito' ? 'etapa-proxima' : '', id.startsWith('p-') ? 'etapa-prelim' : ''].join(' ');
        return `<a href="#/${id}" class="${cls}" title="${escAttr(s.resumo)}"><span class="sidebar-num">${s.estado === 'feito' ? '✓' : num}</span><span>${esc(nome)}</span></a>`;
    }
    const ativo = document.querySelector('#sidebar-nav .ativo');
    if (ativo && ativo.scrollIntoView) ativo.scrollIntoView({ block: 'nearest' });
    const hora = App.salvoEm ? App.salvoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    $('#sidebar-estado').innerHTML = `${p.projeto.nome ? esc(p.projeto.nome) : 'Projeto sem nome'}<span>${hora ? 'salvo no navegador às ' + hora : 'guardado neste navegador'}</span>`;
    // navegação no fim da página
    const TODAS = todasEtapas();
    const i = TODAS.findIndex(([id]) => id === App.pagina);
    const nav = $('#etapa-nav');
    if (i < 0) { nav.innerHTML = ''; return; }
    const ant = i > 0 ? TODAS[i - 1] : null, pos = TODAS[i + 1];
    nav.innerHTML =
        (ant ? `<a class="btn btn-secondary" href="#/${ant[0]}"><small>← Voltar</small>${ant[1]}. ${esc(ant[2])}</a>` : `<a class="btn btn-secondary" href="#/inicio"><small>← Voltar</small>Início</a>`) +
        (pos ? `<a class="btn btn-primary etapa-nav-proxima" href="#/${pos[0]}"><small>Próxima etapa →</small>${pos[1]}. ${esc(pos[2])}</a>` : '');
    const conc = $('#etapa-conclusao');
    if (conc) conc.innerHTML = htmlConclusao(App.pagina, st);
}

function htmlConclusao(id, st) {
    if (id === 'relatorio' || !st[id]) return '';
    const marcada = PC.p.etapasConcluidas.includes(id);
    if (st[id].estado === 'feito' && !marcada) return '<span class="etapa-selo-ok">✓ Etapa concluída</span>';
    if (marcada) return `<span class="etapa-selo-ok">✓ Marcada como concluída</span> <button type="button" class="btn btn-secondary btn-sm" data-acao="desmarcar-etapa" data-id="${id}">Desfazer</button>`;
    return `<button type="button" class="btn btn-secondary btn-sm btn-concluir" data-acao="marcar-etapa" data-id="${id}">✓ Marcar etapa como concluída</button>
            <span class="etapa-conclusao-dica">Use quando esta etapa não precisar ser preenchida por completo.</span>`;
}

function rota() {
    const h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return PAGINAS[h] ? h : 'inicio';
}

function renderPagina(manterRolagem = false) {
    const y = window.scrollY;
    const id = rota();
    const mudouPagina = id !== App.pagina;
    App.pagina = id;
    if (App.editor) { App.editor.destruir(); App.editor = null; }
    const pg = PAGINAS[id];
    const p = PC.p;
    const raiz = $('#app');
    const num = (todasEtapas().find(e => e[0] === id) || [])[1];
    raiz.innerHTML = `<div class="container">
        <header class="page-titulo">
            <h1>${num ? `<span class="titulo-num">${num}</span>` : ''}${esc(pg.titulo)}</h1>
            ${pg.sub ? `<p>${pg.sub}</p>` : ''}
            <div class="etapa-conclusao" id="etapa-conclusao"></div>
        </header>
        ${pg.render(p)}
    </div>`;
    document.body.dataset.pagina = id;
    atualizarCasca();
    if (pg.depois) pg.depois(raiz, p);
    hidratarImagens(raiz);
    if (id === 'inicio' && typeof iniciarTour === 'function') setTimeout(() => { if (App.pagina === 'inicio' && !document.querySelector('.tour')) iniciarTour(false); }, 600);
    if (manterRolagem && !mudouPagina) window.scrollTo(0, y);
    else { window.scrollTo(0, 0); raiz.focus({ preventScroll: true }); }
    document.body.classList.remove('sidebar-aberta');
    $('.sidebar-toggle').setAttribute('aria-expanded', 'false');
}

// ============================================================================
// AÇÕES GLOBAIS (data-acao)
// ============================================================================

const ACOES = {
    'baixar-zip': () => baixarZip(),
    'abrir': () => abrirProjeto(),
    'importar-qfd': () => importarDoQFD(),
    'exemplo': () => carregarExemplo(),
    'novo': () => novoProjeto(),
    'ir-nuvem': () => { location.hash = '#/inicio'; setTimeout(() => { const c = $('.cartao-nuvem'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); },
    'tour': () => { location.hash = '#/inicio'; setTimeout(() => iniciarTour(true), 700); },
    'qfd-navegador': () => {
        const q = lerQFDDoNavegador();
        if (!q) { avisar('Não achei o QFD neste navegador. Use "Importar do QFD" com o arquivo de backup.', 'erro'); return; }
        if (importarArquivoQFD({ name: `QFD deste navegador (${q.nome})` }, q.dados)) { PC.p.origemQFD.navegador = true; PC.p.origemQFD.qfdModificado = q.modificado; salvar(); renderPagina(true); }
    },
    'fechar-menu': () => { document.body.classList.remove('sidebar-aberta'); },
    'marcar-etapa': b => { if (!PC.p.etapasConcluidas.includes(b.dataset.id)) PC.p.etapasConcluidas.push(b.dataset.id); salvar(); },
    'desmarcar-etapa': b => { PC.p.etapasConcluidas = PC.p.etapasConcluidas.filter(x => x !== b.dataset.id); salvar(); },
    'ir': b => { location.hash = '#/' + b.dataset.id; },
    'tipo-projeto': b => { PC.p.tipoProjeto = b.dataset.tipo; salvar(); renderPagina(true); avisar(`Tipo: ${TIPOS_PROJETO[b.dataset.tipo].nome}. As sugestões passam a considerar este tipo.`); },
    'preencher-tudo': () => {
        const feito = preencherTudo(PC.p);
        salvar(); renderPagina(true);
        avisar(feito.length ? `${feito.length} item(ns) preenchido(s). Veja a lista e revise.` : 'Nada vazio para preencher: tudo já tem conteúdo.', 'ok', 6000);
    }
};

document.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const f = ACOES[b.dataset.acao];
    if (!f) return;
    e.preventDefault();
    Promise.resolve(f(b, e)).catch(er => { console.error(er); avisar(er.message || String(er), 'erro', 8000); });
});
document.addEventListener('input', aoEditarCampo);
document.addEventListener('change', aoEditarCampo);

// ============================================================================
// ARQUIVO DO PROJETO
// ============================================================================

function diagramasDoProjeto(p) {
    const out = [];
    p.estruturas.forEach(est => niveisComConteudo(est).forEach(nv => out.push({ nome: nv.titulo, svg: svgNivelCompleto(est, nv.pai, nv.titulo) })));
    return out;
}

const RECURSOS_RELATORIO = ['logo-inovaagro.png', 'logo-nimeq.png', 'logo-instagri.png', 'relatorio-fundo-capa.png'];

/** Logos e fundo da capa (para o relatório do ZIP). Aberto direto do disco (file://) pode não carregar: aí ficam de fora. */
async function carregarRecursos() {
    const out = {};
    for (const n of RECURSOS_RELATORIO) {
        try { const r = await fetch('img/' + n); if (r.ok) out[n] = await r.blob(); } catch (e) { /* sem o arquivo */ }
    }
    return out;
}
function blobParaDataUrl(b) { return new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); }); }

async function baixarZip() {
    const p = PC.p;
    avisar('Montando o ZIP…', 'ok', 2000);
    const blob = await gerarZipDoProjeto(p);
    baixarArquivo(blob, `${nomeSeguro(p.projeto.nome || 'projeto-conceitual')}-${new Date().toISOString().slice(0, 10)}.zip`);
    avisar('ZIP baixado: dados, fotos, diagramas (SVG) e relatório.');
}

async function abrirProjeto() {
    const arq = await escolherArquivo('#arq-abrir');
    if (!arq) return;
    if (/\.json$/i.test(arq.name)) {
        const t = JSON.parse((await arq.text()).replace(/^﻿/, ''));
        if (ehBackupQFD(t)) return importarArquivoQFD(arq, t);
    }
    if (projetoTemConteudo(PC.p) && !confirm('Abrir este arquivo substitui o projeto atual neste navegador. Se quiser guardar o atual, baixe o ZIP antes. Continuar?')) return;
    // as fotos do projeto anterior saem; as do arquivo entram
    const anteriores = imagensUsadas(PC.p);
    const { dados, qfd } = await lerZipOuJson(arq);
    if (qfd) return importarArquivoQFD(arq, dados);
    const novo = normalizarProjeto(dados);
    const usadas = new Set(imagensUsadas(novo));
    for (const id of anteriores) if (!usadas.has(id)) await Imagens.apagar(id);
    PC.substituir(novo);
    App.salvoEm = new Date();
    location.hash = '#/inicio';
    renderPagina();
    avisar(`Projeto "${novo.projeto.nome || 'sem nome'}" aberto.`);
}

async function importarDoQFD() {
    const arq = await escolherArquivo('#arq-qfd');
    if (!arq) return;
    const d = JSON.parse((await arq.text()).replace(/^﻿/, ''));
    return importarArquivoQFD(arq, d);
}

function importarArquivoQFD(arq, d) {
    if (!ehBackupQFD(d)) throw new Error('Este arquivo não é um backup do Sistema QFD (Backup & Export → Exportar backup).');
    if (projetoTemConteudo(PC.p) && !confirm('Atualizar o projeto atual com os dados deste QFD? O que você já fez aqui é mantido; as especificações vindas do QFD são atualizadas.')) return false;
    const r = importarQFD(PC.p, d, arq.name);
    const feito = preencherTudo(PC.p);   // o que der para montar a partir do QFD já sai pronto (só completa o vazio)
    salvar();
    location.hash = '#/inicio';
    renderPagina();
    avisar(`QFD importado: ${r.especificacoes} especificação(ões), ${r.necessidades} necessidade(s), ${PC.p.concorrentes.length} concorrente(s). ${feito.length} item(ns) pré-preenchido(s): revise no Início.`, 'ok', 7000);
    return true;
}

async function carregarExemplo() {
    if (projetoTemConteudo(PC.p) && !confirm('Carregar o exemplo substitui o projeto atual neste navegador. Baixe o ZIP antes se quiser guardá-lo. Continuar?')) return;
    for (const id of imagensUsadas(PC.p)) await Imagens.apagar(id);
    const p = await criarExemplo();
    PC.substituir(p);
    App.salvoEm = new Date();
    location.hash = '#/inicio';
    renderPagina();
    avisar('Exemplo carregado: roda de bicicleta urbana (continuação do exemplo do QFD).');
}

async function novoProjeto() {
    if (projetoTemConteudo(PC.p) && !confirm('Começar um projeto novo apaga o atual deste navegador. Baixe o ZIP antes se quiser guardá-lo. Continuar?')) return;
    for (const id of imagensUsadas(PC.p)) await Imagens.apagar(id);
    PC.substituir(criarProjetoVazio());
    App.salvoEm = new Date();
    location.hash = '#/inicio';
    renderPagina();
}

// ============================================================================
// PÁGINA INICIAL
// ============================================================================

PAGINAS.inicio = {
    titulo: 'Projeto Conceitual',
    sub: 'Do fim do QFD à concepção escolhida: escopo, estrutura de funções, princípios de solução, matriz morfológica e seleção — seguindo Pahl et al. (2005), Reis (2003) e Spagnolo (2011).',
    render(p) {
        const st = statusEtapas(p), prox = proximaEtapa(p, st);
        const nEtapas = ETAPAS.length - 1;
        const feitas = ETAPAS.filter(([id]) => id !== 'relatorio' && st[id].estado === 'feito').length;
        const tem = projetoTemConteudo(p);
        const comecar = `
        <section class="card comecar">
            <h2>${tem ? 'Arquivo do projeto' : 'Como começar'}</h2>
            <div class="comecar-opcoes">
                <button type="button" class="opcao" data-acao="importar-qfd"><b>⇪ Importar do QFD</b><span>Use o backup (.json) do Sistema QFD: especificações, necessidades e função global já entram preenchidas.</span></button>
                <button type="button" class="opcao" data-acao="abrir"><b>📂 Abrir projeto</b><span>Continue um projeto baixado antes (.zip).</span></button>
                <button type="button" class="opcao" data-acao="exemplo"><b>🚲 Ver o exemplo</b><span>Roda de bicicleta urbana, com todas as etapas preenchidas.</span></button>
                ${tem ? '<button type="button" class="opcao" data-acao="novo"><b>✚ Novo projeto</b><span>Começar do zero (o atual é apagado deste navegador).</span></button>'
                      : '<a class="opcao" href="#/escopo"><b>✎ Começar em branco</b><span>Preencha as especificações à mão.</span></a>'}
            </div>
        </section>`;
        if (!tem) return htmlQFDNavegador(p) + comecar + (typeof htmlCartaoNuvem === 'function' ? htmlCartaoNuvem() : '') + htmlFluxoMetodo();
        return `${htmlQFDNavegador(p)}
        <div class="proximo-passo">
            <div class="proximo-passo-texto">
                <span class="proximo-passo-rotulo">Próximo passo</span> <b>${prox.numero}. ${esc(prox.nome)}</b>
                <span class="proximo-passo-resumo">— ${esc(st[prox.id].resumo)}</span>
                <div class="proximo-passo-barra"><i style="width:${Math.round(feitas / nEtapas * 100)}%"></i></div>
                <small>${feitas} de ${nEtapas} etapas concluídas</small>
            </div>
            <a class="btn btn-primary" href="#/${prox.id}">Continuar →</a>
        </div>
        <section class="card">
            <h2>Projeto</h2>
            <div class="grade-campos">
                <label>Nome do projeto <input type="text" data-campo="projeto.nome" value="${escAttr(p.projeto.nome)}" maxlength="160"></label>
                <label>Cliente <input type="text" data-campo="projeto.cliente" value="${escAttr(p.projeto.cliente)}" maxlength="160"></label>
            </div>
            ${p.origemQFD ? `<p class="nota">Dados vindos do QFD: <b>${esc(p.origemQFD.arquivo || 'backup')}</b>, importado em ${new Date(p.origemQFD.importadoEm).toLocaleString('pt-BR')}.</p>` : ''}
            ${htmlTipoProjeto(p)}
        </section>
        ${htmlPreenchimento(p)}
        ${htmlInicioPreliminar(p, st)}
        <section class="cartoes-etapas">
            ${ETAPAS.map(([id, num, nome]) => `<a class="cartao-etapa estado-${st[id].estado}" href="#/${id}">
                <span class="sidebar-num">${st[id].estado === 'feito' ? '✓' : num}</span>
                <span><b>${esc(nome)}</b><small>${esc(st[id].resumo)}</small></span></a>`).join('')}
        </section>
        ${comecar}
        ${typeof htmlCartaoNuvem === 'function' ? htmlCartaoNuvem() : ''}
        ${htmlFluxoMetodo(true)}`;
    }
};

/** Cartão do projeto preliminar no Início: aparece quando a concepção já foi escolhida. */
function htmlInicioPreliminar(p, st) {
    if (typeof ETAPAS_PRELIM === 'undefined' || !p.concepcao.varianteId) return '';
    const feitas = ETAPAS_PRELIM.filter(([id]) => st[id].estado === 'feito').length;
    const prox = ETAPAS_PRELIM.find(([id]) => st[id].estado !== 'feito');
    return `<section class="card cartao-prelim">
        <div class="card-topo"><h2>Projeto preliminar</h2>${prox ? `<a class="btn btn-primary" href="#/${prox[0]}">${p.preliminar.iniciado ? 'Continuar' : 'Começar'}: ${prox[1]}. ${esc(prox[2])} →</a>` : '<span class="etapa-selo-ok">✓ concluído</span>'}</div>
        <p class="nota">${p.preliminar.iniciado ? `${feitas} de ${ETAPAS_PRELIM.length} etapas concluídas.` : 'A concepção está escolhida. Ao abrir, o preliminar já vem preenchido a partir dela: requisitos determinantes, interfaces, portadores, dois leiautes, peças padronizadas, plano do protótipo e adequação às especificações.'}</p>
        <div class="cartoes-etapas">${ETAPAS_PRELIM.map(([id, num, nome]) => `<a class="cartao-etapa estado-${st[id].estado}" href="#/${id}"><span class="sidebar-num">${st[id].estado === 'feito' ? '✓' : num}</span><span><b>${esc(nome)}</b><small>${esc(st[id].resumo)}</small></span></a>`).join('')}</div>
    </section>`;
}

/** Escolha do tipo de projeto (muda catálogo, modelos e sugestões). */
function htmlTipoProjeto(p) {
    return `<div class="tipo-projeto"><span class="tipo-rotulo">Tipo de projeto${p.tipoProjeto ? '' : ' <b class="falta">(escolha um)</b>'}:</span>
        <div class="tipos" role="radiogroup" aria-label="Tipo de projeto">${Object.entries(TIPOS_PROJETO).map(([k, t]) => `<button type="button" role="radio" aria-checked="${p.tipoProjeto === k}" class="tipo ${p.tipoProjeto === k ? 'ativo' : ''}" data-acao="tipo-projeto" data-tipo="${k}" title="${escAttr(t.exemplo)}"><span aria-hidden="true">${t.icone}</span> ${esc(t.nome)}</button>`).join('')}</div>
        <small>Muda as sugestões do catálogo, os modelos prontos de estrutura e os fluxos sugeridos.</small></div>`;
}

/** Botão "preencher o que der" e o resumo do último preenchimento automático. */
function htmlPreenchimento(p) {
    const u = p.ultimoPreenchimento;
    const nomeEt = id => (ETAPAS.find(e => e[0] === id) || [])[2] || id;
    return `<section class="card preencher">
        <div class="card-topo"><h2>✨ Preenchimento automático</h2>
            <button type="button" class="btn btn-primary" data-acao="preencher-tudo">Preencher o que estiver vazio</button></div>
        <p class="nota">Monta um rascunho de todas as etapas com o que veio do QFD, o catálogo e os modelos prontos. <b>Nunca apaga</b> o que você já fez; só completa o que está vazio. Depois é só revisar.</p>
        ${u && u.itens.length ? `<details ${Date.now() - new Date(u.em).getTime() < 3600e3 ? 'open' : ''}><summary>O que foi preenchido em ${new Date(u.em).toLocaleString('pt-BR')} (${u.itens.length}) — revise</summary>
            <ul class="lista-preenchido">${u.itens.map(x => `<li><a href="#/${x.etapa}">${esc(nomeEt(x.etapa))}</a>: ${esc(x.texto)}</li>`).join('')}</ul></details>` : ''}
    </section>`;
}

function htmlFluxoMetodo(recolhido = false) {
    const passos = [
        ['Verificar o escopo', 'Especificações e restrições do QFD; abstração orientada em 5 passos; formular o problema sem solução.'],
        ['Estabelecer a estrutura funcional', 'Função global com entradas e saídas de energia, material e sinal; desdobrar em funções parciais e elementares; comparar estruturas alternativas.'],
        ['Pesquisar princípios de solução', 'Para cada função elementar: métodos convencionais, intuitivos e discursivos (Quadro 1).'],
        ['Combinar princípios', 'Matriz morfológica: combinar princípios compatíveis em concepções.'],
        ['Selecionar a concepção', 'Viabilidade, disponibilidade de tecnologia, passa/não passa e matriz de avaliação.'],
        ['Evoluir a concepção', 'Descrever, esboçar e completar com bons princípios das concepções descartadas.']
    ];
    return `<details class="card sobre" ${recolhido ? '' : 'open'}>
        <summary><h2>O método</h2></summary>
        <ol class="fluxo-metodo">${passos.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('')}</ol>
        <p class="nota">Baseado no modelo de Spagnolo (2011, Fig. 11), que integra Pahl et al. (2005) e Reis (2003). Tudo fica guardado neste navegador; para levar a outro computador ou entregar, use <b>Baixar ZIP</b> (dados, fotos, diagramas em SVG e relatório).</p>
    </details>`;
}

// ============================================================================
// INÍCIO
// ============================================================================

function iniciar() {
    if (!document.getElementById('app')) return; // página de testes
    PC.carregar();
    $('#dl-verbos').innerHTML = VERBOS_FUNCAO.map(v => `<option value="${escAttr(v)} ">`).join('');
    $('.sidebar-toggle').addEventListener('click', () => {
        const aberto = document.body.classList.toggle('sidebar-aberta');
        $('.sidebar-toggle').setAttribute('aria-expanded', String(aberto));
    });
    window.addEventListener('hashchange', () => { if (!pedidoDoQFD()) renderPagina(); });
    window.addEventListener('storage', e => {
        if (e.key !== PC_CHAVE) return;
        if (typeof modoArmazenamento === 'function' && modoArmazenamento() === 'nuvem') return; // projeto da nuvem: não vem do navegador
        PC.carregar(); renderPagina(true);
    });
    renderPagina();
    pedidoDoQFD();
}

/**
 * Aberto pelo botão do fim do QFD (#/inicio?qfd=navegador): importa sozinho o QFD deste navegador.
 * Tira o pedido do endereço, para recarregar a página não importar de novo. Devolve true se tratou o pedido.
 */
function pedidoDoQFD() {
    if (!/[?&]qfd=navegador\b/.test(location.hash)) return false;
    history.replaceState(null, '', location.pathname + location.search + '#/inicio');
    renderPagina();
    const q = lerQFDDoNavegador();
    if (!q) { avisar('O QFD não está neste navegador (outro computador ou outro navegador?). Use "Importar do QFD" com o arquivo de backup.', 'erro', 9000); return true; }
    setTimeout(() => ACOES['qfd-navegador'](), 50);
    return true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else setTimeout(iniciar, 0);
