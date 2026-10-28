/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * ONDE SALVAR O PROJETO — perguntado no início de cada projeto:
 *  - "Neste computador": como sempre — guardado neste navegador; o ZIP leva para outro lugar.
 *  - "Na nuvem da equipe (MEGA)": pede a conta da equipe (explicando por que o MEGA) e passa a salvar SÓ lá: o projeto
 *    não fica mais guardado neste navegador; cada alteração é enviada sozinha para
 *    SistemaProjetoConceitual/Projetos/<pasta>/<pasta>-atual.zip, com uma versão datada a cada hora de trabalho.
 *    Ao abrir o sistema de novo, entra na nuvem (senha lembrada pelo navegador) e abre a versão mais nova.
 * Fotos e desenhos ficam numa memória de trabalho do navegador enquanto se usa (precisam estar lá para montar o ZIP).
 */

'use strict';

const MODO_CHAVE = 'pc_modo';            // '' (não escolhido) | 'pc' | 'nuvem'
const PASTA_CHAVE = 'pc_nuvem_projeto';  // pasta do projeto atual na nuvem
const ARM = { pendente: false, enviando: false, denovo: false, ultimo: null, erro: '', timer: null, ultimaVersao: 0, carregado: false, abrindoDaNuvem: false, perguntando: false };

function modoArmazenamento() { try { return localStorage.getItem(MODO_CHAVE) || ''; } catch (e) { return ''; } }
function pastaNuvemAtual() { try { return localStorage.getItem(PASTA_CHAVE) || ''; } catch (e) { return ''; } }
function definirModo(m, pastaNome) {
    try {
        if (m) localStorage.setItem(MODO_CHAVE, m); else localStorage.removeItem(MODO_CHAVE);
        if (pastaNome !== undefined) { if (pastaNome) localStorage.setItem(PASTA_CHAVE, pastaNome); else localStorage.removeItem(PASTA_CHAVE); }
    } catch (e) { /* navegador sem armazenamento */ }
}
const emNuvem = () => modoArmazenamento() === 'nuvem';

// ---------------------------------------------------------------- salvar: no navegador ou só na nuvem

const salvarNoNavegador = PC.salvar.bind(PC);
PC.salvar = function (motivo = '') {
    if (!emNuvem()) return salvarNoNavegador(motivo);
    this.p.metadata.modificado = new Date().toISOString();
    try { localStorage.removeItem(PC_CHAVE); } catch (e) { /* ok */ }
    if (ARM.carregado) { ARM.pendente = true; agendarEnvio(); }
    this.ouvintes.forEach(f => { try { f(motivo); } catch (e) { console.error(e); } });
};
/** Trocar de projeto (novo, exemplo, abrir ZIP, importar QFD…) com a nuvem ligada: o novo projeto volta a perguntar onde salvar. */
const substituirOriginal = PC.substituir.bind(PC);
PC.substituir = function (novo) {
    if (emNuvem() && !ARM.abrindoDaNuvem) {
        definirModo('', '');
        ARM.carregado = false; ARM.pendente = false; ARM.ultimo = null; ARM.ultimaVersao = 0;
        if (novo && typeof novo === 'object') delete novo.nuvemPasta;
    }
    return substituirOriginal(novo);
};

function agendarEnvio(ms = 6000) { clearTimeout(ARM.timer); ARM.timer = setTimeout(enviarAgora, ms); atualizarSelo(); }

/** Pasta do projeto na nuvem: fica fixa mesmo se o nome do projeto mudar. */
function pastaDoProjeto(p) {
    if (!p.nuvemPasta) p.nuvemPasta = nomeSeguro(p.projeto.nome || 'projeto-sem-nome');
    return p.nuvemPasta;
}

/** Envia o projeto: substitui o "-atual.zip" e, a cada hora de trabalho, guarda também uma versão datada. */
async function enviarAtual(p) {
    const { projetos } = await pastasBase();
    const nome = pastaDoProjeto(p);
    const dir = await pasta(projetos, nome);
    const blob = await gerarZipDoProjeto(p);
    const antigos = filhosDe(dir).filter(f => !f.directory && f.name === `${nome}-atual.zip`);
    await enviar(dir, `${nome}-atual.zip`, blob);
    for (const a of antigos) { try { await a.delete(true); } catch (e) { /* fica a anterior também */ } }
    if (Date.now() - ARM.ultimaVersao > 3600e3) {
        await enviar(dir, `${nome}-${carimboLocal()}.zip`, blob);
        ARM.ultimaVersao = Date.now();
    }
    definirModo('nuvem', nome);
}

async function enviarAgora() {
    clearTimeout(ARM.timer);
    if (!emNuvem() || !ARM.carregado) return;
    if (ARM.enviando) { ARM.denovo = true; return; }
    if (!ARM.pendente) { atualizarSelo(); return; }
    if (!nuvemConectada()) { ARM.erro = 'entre na nuvem para salvar'; atualizarSelo(); return; }
    ARM.enviando = true; ARM.pendente = false; ARM.erro = ''; atualizarSelo();
    try { await enviarAtual(PC.p); ARM.ultimo = new Date(); }
    catch (e) { ARM.pendente = true; ARM.erro = 'não salvou na nuvem (' + (e.message || e) + '); tento de novo em 1 min'; }
    finally {
        ARM.enviando = false; atualizarSelo();
        if (ARM.denovo) { ARM.denovo = false; ARM.pendente = true; agendarEnvio(1500); }
        else if (ARM.pendente && ARM.erro && nuvemConectada()) agendarEnvio(60000);
    }
}
/** Espera terminar o envio que estiver pendente (antes de trocar de projeto). */
async function esvaziarNuvem() {
    if (!emNuvem() || !ARM.carregado) return;
    if (ARM.pendente && nuvemConectada()) { avisar('Salvando na nuvem antes…', 'ok', 30000); await enviarAgora(); }
    for (let i = 0; i < 120 && ARM.enviando; i++) await new Promise(r => setTimeout(r, 250));
}

// ---------------------------------------------------------------- situação visível (topo e menu)

function textoSituacao() {
    if (!emNuvem()) return null;
    if (!ARM.carregado) return { t: '☁ nuvem: abrir o projeto', classe: 'falta' };
    if (ARM.enviando) return { t: '☁ salvando na nuvem…', classe: 'enviando' };
    if (ARM.erro) return { t: '☁ ' + ARM.erro, classe: 'falta' };
    if (ARM.pendente) return { t: '☁ alterações a enviar…', classe: 'enviando' };
    return { t: ARM.ultimo ? `☁ salvo na nuvem às ${ARM.ultimo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '☁ na nuvem da equipe', classe: 'ok' };
}
function atualizarSelo() {
    const s = textoSituacao(), selo = $('#topbar-selo'), est = $('#sidebar-estado');
    if (selo) {
        if (!selo.dataset.original) selo.dataset.original = selo.textContent;
        selo.textContent = s ? s.t : selo.dataset.original;
        selo.className = 'topbar-selo' + (s ? ' selo-nuvem selo-' + s.classe : '');
        selo.title = s ? 'Este projeto é salvo só na nuvem da equipe (MEGA). Clique para salvar agora.' : 'Os dados ficam guardados neste navegador; baixe o ZIP para levar a outro computador';
        if (s) { selo.setAttribute('role', 'button'); selo.tabIndex = 0; selo.dataset.acao = 'arm-salvar-agora'; } else { selo.removeAttribute('role'); selo.removeAttribute('tabindex'); delete selo.dataset.acao; }
    }
    if (est && s) {
        const span = est.querySelector('span');
        if (span) span.textContent = s.t;
    }
    document.body.classList.toggle('modo-nuvem', emNuvem());
    const faixa = $('#faixa-nuvem');
    if (faixa) faixa.remove();
    if (s && s.classe === 'falta' && ARM.carregado) {
        const d = document.createElement('div');
        d.id = 'faixa-nuvem'; d.className = 'faixa-nuvem'; d.setAttribute('role', 'status');
        d.innerHTML = `<span>${esc(s.t)}</span><button type="button" class="btn btn-primary btn-sm" data-acao="arm-salvar-agora">Entrar e salvar agora</button>`;
        document.body.appendChild(d);
    }
}

// ---------------------------------------------------------------- pergunta no início do projeto

function perguntarArmazenamento() {
    if (ARM.perguntando || document.querySelector('.esb-fundo')) return;
    ARM.perguntando = true;
    const fundo = document.createElement('div');
    fundo.className = 'esb-fundo';
    fundo.innerHTML = `<div class="esb-janela janela-modo" role="dialog" aria-modal="true" aria-labelledby="modo-titulo">
        <h2 id="modo-titulo">Onde salvar este projeto?</h2>
        <p class="nota">Escolha uma vez; dá para mudar depois no Início.</p>
        <div class="opcoes-modo">
            <button type="button" class="opcao" data-modo="pc"><b>💻 Neste computador</b><span>Fica guardado neste navegador, como sempre. Para levar a outro computador ou fazer cópia, use "Baixar ZIP".</span></button>
            <button type="button" class="opcao" data-modo="nuvem"><b>☁ Na nuvem da equipe (MEGA)</b><span>Pede o e-mail e a senha da conta da equipe. Salva sozinho na nuvem a cada alteração e <b>não fica guardado neste computador</b>. Só quem tem a senha acessa.</span></button>
        </div>
        <div class="modo-porque"><b>Por que o MEGA?</b> A criptografia é de ponta a ponta: a chave vem da senha da equipe, então nem o MEGA consegue ler os projetos — diferente de Google Drive, OneDrive e Dropbox, que guardam a chave. ${htmlPorQueMega()}</div>
    </div>`;
    document.body.appendChild(fundo);
    fundo.querySelector('[data-modo=pc]').focus();
    fundo.addEventListener('click', async e => {
        const b = e.target.closest('[data-modo]');
        if (!b) return;
        fundo.remove(); ARM.perguntando = false;
        if (b.dataset.modo === 'pc') { definirModo('pc'); salvarNoNavegador(); atualizarSelo(); renderPagina(true); avisar('Salvando neste computador. Use "Baixar ZIP" para levar a outro lugar.'); }
        else await passarParaNuvem();
    });
}

/** Liga a nuvem para o projeto atual: entra na conta, envia e para de guardar no navegador. */
async function passarParaNuvem() {
    try { await nuvemGarantir(); }
    catch (e) { avisar('Sem entrar na nuvem o projeto continua neste computador. Você pode escolher a nuvem depois no Início.', 'erro', 8000); if (!modoArmazenamento()) definirModo('pc'); salvarNoNavegador(); atualizarSelo(); renderPagina(true); return; }
    const nome = pastaDoProjeto(PC.p);
    try {
        const lst = await listarProjetosNuvem();
        if (lst.some(x => x.nome === nome) && !confirm(`Já existe na nuvem um projeto na pasta "${nome}". Salvar este projeto como a versão mais nova dessa pasta?\n\nCancelar cria uma pasta nova.`)) {
            let k = 2; while (lst.some(x => x.nome === `${nome}-${k}`)) k++;
            PC.p.nuvemPasta = `${nome}-${k}`;
        }
    } catch (e) { /* segue: a pasta é criada no envio */ }
    definirModo('nuvem', PC.p.nuvemPasta);
    ARM.carregado = true; ARM.pendente = true; ARM.ultimaVersao = 0;
    avisar('Enviando o projeto para a nuvem da equipe…', 'ok', 60000);
    await enviarAgora();
    if (ARM.erro) { avisar('A nuvem não respondeu: ' + ARM.erro + '. O projeto continua aberto aqui; não feche a página até aparecer "salvo na nuvem".', 'erro', 12000); return; }
    try { localStorage.removeItem(PC_CHAVE); } catch (e) { /* ok */ }
    renderPagina(true);
    avisar(`Projeto salvo na nuvem da equipe (pasta "${PC.p.nuvemPasta}"). A partir de agora ele é salvo só lá, sozinho.`, 'ok', 9000);
}

// ---------------------------------------------------------------- abrir da nuvem ao entrar no sistema

function telaAbrirDaNuvem(erro = '') {
    let t = $('#tela-nuvem');
    if (!t) { t = document.createElement('div'); t.id = 'tela-nuvem'; t.className = 'esb-fundo'; document.body.appendChild(t); }
    t.innerHTML = `<div class="esb-janela janela-modo" role="dialog" aria-modal="true">
        <h2>☁ Projeto na nuvem da equipe</h2>
        <p>Este computador está usando a nuvem da equipe para o projeto <b>${esc(pastaNuvemAtual() || '—')}</b>. Ele não fica guardado aqui: entre para abrir a versão mais nova.</p>
        ${erro ? `<p class="nuvem-erro" role="alert">${esc(erro)}</p>` : ''}
        <div class="botoes">
            <button type="button" class="btn btn-primary" data-acao="arm-abrir-nuvem">Entrar e abrir</button>
            <button type="button" class="btn btn-secondary" data-acao="arm-sair-nuvem" title="Volta a salvar neste computador, começando um projeto vazio (o da nuvem continua lá)">Usar este computador sem a nuvem</button>
        </div>
    </div>`;
}
async function abrirDaNuvemAoIniciar() {
    const nome = pastaNuvemAtual();
    if (!nome) { definirModo(''); return; }
    telaAbrirDaNuvem();
    try {
        await nuvemGarantir();
        avisar('Abrindo da nuvem…', 'ok', 60000);
        const lst = await listarProjetosNuvem();
        const pr = lst.find(x => x.nome === nome);
        if (!pr || !pr.versoes[0]) throw new Error(`A pasta "${nome}" não está na nuvem da equipe (foi apagada ou renomeada?).`);
        const ultima = pr.versoes[0];
        const blob = await baixar(ultima);
        const { dados } = await lerZipOuJson(new File([blob], ultima.name, { type: 'application/zip' }));
        const novo = normalizarProjeto(dados);
        novo.nuvemPasta = nome;
        PC.p = novo;
        ARM.carregado = true; ARM.pendente = false; ARM.erro = ''; ARM.ultimo = quandoArquivo(ultima) || new Date();
        const t = $('#tela-nuvem'); if (t) t.remove();
        renderPagina();
        avisar(`Projeto "${novo.projeto.nome || nome}" aberto da nuvem da equipe.`);
    } catch (e) {
        $('#aviso').classList.remove('visivel');
        telaAbrirDaNuvem(e.message || String(e));
    }
}

// ---------------------------------------------------------------- cartão no Início

function htmlModoArmazenamento() {
    const m = modoArmazenamento();
    if (m === 'nuvem') return `<p class="modo-atual">Este projeto é salvo <b>só na nuvem da equipe</b> (pasta "${esc(pastaNuvemAtual() || PC.p.nuvemPasta || '')}"), sozinho, a cada alteração; uma versão datada fica guardada a cada hora de trabalho.
        <button type="button" class="btn-link" data-acao="arm-pc">Passar a salvar neste computador</button></p>`;
    return `<p class="modo-atual">Este projeto é salvo <b>neste computador</b>. <button type="button" class="btn-link" data-acao="arm-nuvem">Passar a salvar só na nuvem da equipe</button></p>`;
}

// ---------------------------------------------------------------- ações e ganchos

Object.assign(ACOES, {
    'arm-salvar-agora': async () => {
        if (!emNuvem()) return;
        if (!ARM.carregado) { abrirDaNuvemAoIniciar(); return; }
        try { await nuvemGarantir(); } catch (e) { return; }
        ARM.pendente = true; ARM.erro = '';
        await enviarAgora();
        if (!ARM.erro) avisar('Salvo na nuvem da equipe.');
    },
    'arm-abrir-nuvem': () => abrirDaNuvemAoIniciar(),
    'arm-sair-nuvem': () => {
        if (!confirm('Usar este computador sem a nuvem? Começa um projeto vazio salvo aqui; o projeto da nuvem continua lá e pode ser aberto depois em "Abrir projeto da nuvem".')) return;
        definirModo('pc', ''); ARM.carregado = false;
        const t = $('#tela-nuvem'); if (t) t.remove();
        PC.p = normalizarProjeto({}); salvarNoNavegador(); renderPagina();
    },
    'arm-pc': async () => {
        if (!confirm('Passar a salvar neste computador? O projeto fica guardado neste navegador; as versões já salvas na nuvem continuam lá.')) return;
        await esvaziarNuvem();
        definirModo('pc', ''); ARM.carregado = false;
        salvarNoNavegador(); atualizarSelo(); renderPagina(true);
        avisar('Agora o projeto é salvo neste computador.');
    },
    'arm-nuvem': () => passarParaNuvem()
});

/** Antes de trocar de projeto com a nuvem ligada, termina o envio do atual (as fotos dele ainda precisam estar aqui). */
['novo', 'exemplo', 'abrir', 'importar-qfd', 'qfd-navegador', 'base-anterior'].forEach(k => {
    const orig = ACOES[k];
    if (!orig) return;
    ACOES[k] = async (...a) => { await esvaziarNuvem(); return orig(...a); };
});
/** Abrir uma versão da nuvem com a nuvem ligada: passa a salvar nessa pasta. */
if (ACOES['nuvem-abrir-versao']) {
    const orig = ACOES['nuvem-abrir-versao'];
    ACOES['nuvem-abrir-versao'] = async b => {
        await esvaziarNuvem();
        const pr = App.nuvemLista && App.nuvemLista[+b.dataset.i];
        const eraNuvem = emNuvem();
        ARM.abrindoDaNuvem = eraNuvem;
        try { await orig(b); } finally { ARM.abrindoDaNuvem = false; }
        if (eraNuvem && pr) { PC.p.nuvemPasta = pr.nome; definirModo('nuvem', pr.nome); ARM.carregado = true; ARM.pendente = false; ARM.ultimo = new Date(); try { localStorage.removeItem(PC_CHAVE); } catch (e) { /* ok */ } atualizarSelo(); }
    };
}

/** Depois de cada tela: atualiza a situação e pergunta onde salvar quando o projeto começa. */
const renderPaginaOriginal = renderPagina;
renderPagina = function (...a) {
    renderPaginaOriginal(...a);
    atualizarSelo();
    if (emNuvem() && !ARM.carregado) { if (!$('#tela-nuvem') && !NUVEM.conectando) abrirDaNuvemAoIniciar(); return; }
    if (!modoArmazenamento() && projetoTemConteudo(PC.p)) setTimeout(() => { if (!modoArmazenamento() && projetoTemConteudo(PC.p)) perguntarArmazenamento(); }, 400);
};

window.addEventListener('beforeunload', e => {
    if (emNuvem() && ARM.carregado && (ARM.pendente || ARM.enviando)) { e.preventDefault(); e.returnValue = ''; enviarAgora(); }
});
document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.id === 'topbar-selo' && e.target.dataset.acao) { e.preventDefault(); ACOES['arm-salvar-agora'](); }
});
