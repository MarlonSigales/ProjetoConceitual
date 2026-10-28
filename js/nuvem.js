/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * NUVEM DA EQUIPE (MEGA): cada equipe usa a sua conta MEGA (grátis). Só quem tem o e-mail e a senha da conta entra;
 * nada fica público (não se cria link de compartilhamento). O MEGA criptografa tudo no navegador, e este sistema não
 * tem servidor: os dados vão direto do navegador para a conta da equipe.
 *
 * Pastas na conta:
 *   SistemaProjetoConceitual/Projetos/<projeto>/<projeto>-<data>.zip   (cada salvamento é uma versão)
 *   SistemaProjetoConceitual/Biblioteca/biblioteca.json                (biblioteca completa da equipe)
 *
 * A senha é guardada pelo gerenciador de senhas do navegador (não por este sistema).
 * Biblioteca usada: megajs (cliente JavaScript do MEGA, código aberto, não oficial), carregada só quando a nuvem é usada.
 */

'use strict';

const NUVEM = {
    pastaRaiz: 'SistemaProjetoConceitual',
    fontes: [
        'https://cdn.jsdelivr.net/npm/megajs@1/dist/main.browser-es.mjs',
        'https://esm.sh/megajs@1'
    ],
    mega: null,        // módulo megajs
    storage: null,     // sessão aberta
    email: '',
    conectando: null
};

function nuvemConectada() { return !!NUVEM.storage; }
function emailLembrado() { try { return localStorage.getItem('pc_nuvem_email') || ''; } catch (e) { return ''; } }

async function carregarMega() {
    if (NUVEM.mega) return NUVEM.mega;
    let erro = null;
    for (const u of NUVEM.fontes) {
        try { NUVEM.mega = await import(u); if (NUVEM.mega && NUVEM.mega.Storage) return NUVEM.mega; } catch (e) { erro = e; }
    }
    throw new Error('Não consegui carregar o acesso ao MEGA (sem internet ou bloqueado pela rede). ' + (erro ? erro.message : ''));
}

/** Entra na conta da equipe. */
async function nuvemEntrar(email, senha) {
    const mega = await carregarMega();
    const st = new mega.Storage({ email, password: senha, userAgent: 'SistemaProjetoConceitual/1.0', keepalive: false });
    try { await st.ready; }
    catch (e) { throw new Error(/EBLOCKED|ENOENT|EKEY|-9|-16|password|senha/i.test(String(e && e.message)) ? 'E-mail ou senha da nuvem não conferem.' : 'O MEGA recusou a entrada: ' + (e && e.message || e)); }
    NUVEM.storage = st; NUVEM.email = email;
    try { localStorage.setItem('pc_nuvem_email', email); } catch (e) { /* ok */ }
    return st;
}

function nuvemSair() {
    try { if (NUVEM.storage && NUVEM.storage.close) NUVEM.storage.close(); } catch (e) { /* ok */ }
    NUVEM.storage = null; NUVEM.email = '';
    try { localStorage.removeItem('pc_nuvem_email'); } catch (e) { /* ok */ }
    try { if (navigator.credentials && navigator.credentials.preventSilentAccess) { const r = navigator.credentials.preventSilentAccess(); if (r && r.catch) r.catch(() => {}); } } catch (e) { /* ok */ }
}

/** Pede ao navegador a senha guardada (Chrome/Edge); nos outros, o formulário é preenchido pelo próprio navegador. */
async function senhaDoNavegador() {
    try {
        if (!window.PasswordCredential || !navigator.credentials) return null;
        const c = await navigator.credentials.get({ password: true, mediation: 'optional' });
        return c && c.password ? { email: c.id, senha: c.password } : null;
    } catch (e) { return null; }
}
async function guardarNoNavegador(email, senha) {
    try { if (window.PasswordCredential && navigator.credentials) await navigator.credentials.store(new PasswordCredential({ id: email, password: senha, name: 'Nuvem da equipe (MEGA)' })); } catch (e) { /* o navegador oferece pelo formulário */ }
}

/** Garante a conexão: usa a senha guardada pelo navegador; se não houver, abre o formulário de entrada. */
async function nuvemGarantir() {
    if (NUVEM.storage) return NUVEM.storage;
    if (NUVEM.conectando) return NUVEM.conectando;
    NUVEM.conectando = (async () => {
        const g = await senhaDoNavegador();
        if (g) { try { return await nuvemEntrar(g.email, g.senha); } catch (e) { /* senha mudou: pede de novo */ } }
        return formularioEntrada();
    })();
    try { return await NUVEM.conectando; } finally { NUVEM.conectando = null; }
}

function formularioEntrada() {
    return new Promise((resolve, reject) => {
        const fundo = document.createElement('div');
        fundo.className = 'esb-fundo';
        fundo.innerHTML = `<form class="esb-janela nuvem-form" method="post" action="#" autocomplete="on">
            <h2>☁ Nuvem da equipe (MEGA)</h2>
            <p class="nota">Entre com a conta MEGA <b>da equipe</b>. Só quem tem esta senha vê os projetos. O navegador vai oferecer para lembrar a senha.</p>
            <label>E-mail da conta <input type="email" name="username" autocomplete="username" required value="${escAttr(emailLembrado())}"></label>
            <label>Senha <input type="password" name="password" autocomplete="current-password" required></label>
            <p class="nuvem-erro" role="alert"></p>
            <div class="esb-rodape">
                <button type="button" class="btn btn-secondary" data-n="cancelar">Cancelar</button>
                <button type="submit" class="btn btn-primary">Entrar</button>
            </div>
            <p class="nota">Não tem conta? Crie uma conta grátis em mega.io com um e-mail da equipe, baixe a chave de recuperação e passe a senha só para quem é da equipe. Quando alguém sair, troque a senha.</p>
            ${htmlPorQueMega()}
        </form>`;
        document.body.appendChild(fundo);
        const form = fundo.querySelector('form'), erro = fundo.querySelector('.nuvem-erro');
        (form.username.value ? form.password : form.username).focus();
        const fechar = () => fundo.remove();
        fundo.querySelector('[data-n=cancelar]').addEventListener('click', () => { fechar(); reject(new Error('Entrada na nuvem cancelada.')); });
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const email = form.username.value.trim(), senha = form.password.value;
            erro.textContent = 'Entrando…';
            form.querySelector('[type=submit]').disabled = true;
            try {
                const st = await nuvemEntrar(email, senha);
                await guardarNoNavegador(email, senha);
                fechar(); resolve(st);
            } catch (er) { erro.textContent = er.message; form.querySelector('[type=submit]').disabled = false; }
        });
    });
}

// ---------------------------------------------------------------- pastas e arquivos

const filhosDe = pasta => (pasta && pasta.children) || [];
async function pasta(mae, nome) {
    const ja = filhosDe(mae).find(f => f.directory && f.name === nome);
    if (ja) return ja;
    return mae.mkdir(nome);
}
async function pastasBase() {
    const st = await nuvemGarantir();
    const raiz = await pasta(st.root, NUVEM.pastaRaiz);
    return { st, raiz, projetos: await pasta(raiz, 'Projetos'), biblioteca: await pasta(raiz, 'Biblioteca') };
}
async function enviar(pastaDestino, nome, blob) {
    const dados = new Uint8Array(await blob.arrayBuffer());
    const up = pastaDestino.upload({ name: nome, size: dados.length }, dados);
    return up.complete;
}
async function baixar(arquivo) {
    const b = await arquivo.downloadBuffer();
    return new Blob([b]);
}
/** Data e hora locais para o nome do arquivo: 2026-10-27_23h07 */
function carimboLocal(d = new Date()) { const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}h${z(d.getMinutes())}`; }
const quandoArquivo = f => (f.timestamp ? new Date(f.timestamp * 1000) : null);

/** Projetos da nuvem: [{ nome, pasta, versoes: [arquivo ...] (mais nova primeiro) }] */
async function listarProjetosNuvem() {
    const { projetos } = await pastasBase();
    return filhosDe(projetos).filter(f => f.directory).map(d => ({
        nome: d.name, pasta: d,
        versoes: filhosDe(d).filter(f => !f.directory && /\.zip$/i.test(f.name)).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    })).sort((a, b) => ((b.versoes[0] || {}).timestamp || 0) - ((a.versoes[0] || {}).timestamp || 0));
}

/** Salva o projeto atual (ZIP completo) e junta os princípios dele na biblioteca da nuvem. */
async function salvarNaNuvem(p) {
    const { projetos, biblioteca } = await pastasBase();
    const nome = p.nuvemPasta || nomeSeguro(p.projeto.nome || 'projeto-sem-nome');
    const dir = await pasta(projetos, nome);
    const blob = await gerarZipDoProjeto(p);
    await enviar(dir, `${nome}-${carimboLocal()}.zip`, blob);
    const n = await juntarBibliotecaNuvem(biblioteca, itensDoProjeto(p));
    // componentes padronizados, materiais e fornecedores do projeto vão para o banco da equipe
    let componentes = 0;
    if (typeof sincronizarComponentesNuvem === 'function') { try { componentes = (await sincronizarComponentesNuvem(componentesDoProjeto(p))).novosNaNuvem; } catch (e) { /* o projeto já foi salvo */ } }
    return { pasta: nome, biblioteca: n, componentes };
}

/** Lê a biblioteca da nuvem, junta itens e regrava (uma só cópia). Também atualiza a biblioteca deste navegador. */
async function juntarBibliotecaNuvem(pastaBib, itens) {
    const atual = filhosDe(pastaBib).find(f => !f.directory && f.name === 'biblioteca.json');
    const b = { formato: FORMATO_BIBLIOTECA, versao: 1, itens: [] };
    if (atual) { try { const d = JSON.parse(await (await baixar(atual)).text()); juntarBiblioteca(b, lista(d.itens)); } catch (e) { /* arquivo ilegível: recomeça */ } }
    const n = juntarBiblioteca(b, itens);
    b.geradoEm = new Date().toISOString();
    if (n || !atual) {
        await enviar(pastaBib, 'biblioteca.json', new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }));
        if (atual) { try { await atual.delete(true); } catch (e) { /* fica a anterior também */ } }
    }
    const local = lerBiblioteca(); juntarBiblioteca(local, b.itens); gravarBiblioteca(local);
    return n;
}

/** Remonta a biblioteca da nuvem lendo a versão mais nova de cada projeto da equipe. */
async function remontarBibliotecaNuvem() {
    const lst = await listarProjetosNuvem();
    const itens = [];
    for (const pr of lst) {
        if (!pr.versoes[0]) continue;
        try { itens.push(...await itensDeArquivo(new File([await baixar(pr.versoes[0])], pr.versoes[0].name))); } catch (e) { /* versão ilegível */ }
    }
    const { biblioteca } = await pastasBase();
    const n = await juntarBibliotecaNuvem(biblioteca, itens);
    return { projetos: lst.length, novos: n };
}

/** ZIP completo do projeto (o mesmo do botão "Baixar ZIP"). */
async function gerarZipDoProjeto(p) {
    const rec = typeof carregarRecursos === 'function' ? await carregarRecursos() : {};
    return montarZip(p, {
        diagramas: diagramasDoProjeto(p),
        arquivos: Object.entries(rec).map(([n, b]) => ({ caminho: 'img/' + n, blob: b })),
        relatorioHtml: mapa => documentoRelatorio(p, id => mapa[id] || '', n => rec[n] ? 'img/' + n : '')
    });
}

// ---------------------------------------------------------------- interface

/** Balão "Por que o MEGA?": motivo da escolha e cuidados (termos de uso conforme o conhecimento de out/2026; podem mudar). */
function htmlPorQueMega() {
    return `<details class="balao-info"><summary title="Por que usamos o MEGA?">ⓘ Por que o MEGA?</summary><div class="balao-info-corpo">
        <p><b>Os arquivos continuam seus.</b> Nos termos de uso do Google Drive, OneDrive, Dropbox e MEGA você mantém a propriedade e só dá uma licença para o serviço guardar e processar os arquivos.</p>
        <p><b>A diferença é quem consegue ler.</b> Google Drive, OneDrive e Dropbox criptografam, mas guardam a chave: tecnicamente podem ler o conteúdo (para procurar vírus e material ilegal, aplicar as regras de uso ou atender ordem judicial). No MEGA a criptografia é de ponta a ponta: a chave vem da senha da equipe e o MEGA não consegue ler os arquivos nem os nomes deles — é uma limitação técnica, não só uma promessa.</p>
        <p><b>O que o MEGA ainda vê:</b> o e-mail da conta, o endereço de acesso (IP), o espaço usado e quando os arquivos foram enviados; isso pode ser entregue por ordem judicial.</p>
        <p><b>Cuidados:</b></p>
        <ul>
            <li>Perdeu a senha sem a chave de recuperação, perdeu os dados (o MEGA não consegue recuperar). Ao criar a conta, baixe a <b>chave de recuperação</b> e guarde em lugar seguro.</li>
            <li>Link público do MEGA leva a chave junto: este sistema nunca cria link; não crie links para estas pastas.</li>
            <li>Contas grátis muito tempo sem uso podem ser apagadas pelo MEGA: entre de vez em quando.</li>
            <li>Uma conta por equipe; quando alguém sair, troque a senha.</li>
        </ul>
        <p class="balao-info-fonte">Baseado nos termos de uso e na forma como cada serviço funciona (out/2026). Os termos mudam: confira os atuais antes de guardar dados sigilosos.</p>
    </div></details>`;
}

function htmlCartaoNuvem() {
    const on = nuvemConectada(), em = NUVEM.email || emailLembrado();
    return `<section class="card cartao-nuvem">
        <div class="card-topo"><h2>☁ Nuvem da equipe</h2><span class="contador">${on ? `conectado: ${esc(NUVEM.email)}` : em ? `conta: ${esc(em)}` : 'MEGA — só a equipe acessa'}</span></div>
        <p class="nota">Guarda os projetos e a biblioteca da equipe numa conta MEGA <b>da equipe</b>, protegida por senha; nada fica público. Cada salvamento vira uma versão; a biblioteca junta os princípios de todos os projetos. ${htmlPorQueMega()}</p>
        ${typeof htmlModoArmazenamento === 'function' ? htmlModoArmazenamento() : ''}
        <div class="botoes">
            <button type="button" class="btn btn-primary btn-sm" data-acao="nuvem-salvar">☁⬆ ${typeof modoArmazenamento === 'function' && modoArmazenamento() === 'nuvem' ? 'Guardar uma versão datada agora' : 'Salvar este projeto na nuvem'}</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="nuvem-abrir">☁⬇ Abrir projeto da nuvem</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="nuvem-biblioteca">📚 Atualizar a biblioteca com a nuvem</button>
            ${on || em ? '<button type="button" class="btn btn-secondary btn-sm" data-acao="nuvem-sair">Sair da nuvem</button>' : ''}
        </div>
        <div id="nuvem-lista"></div>
    </section>`;
}

async function comAviso(texto, f) {
    await nuvemGarantir();   // primeiro a senha; o aviso de "trabalhando" só depois
    avisar(texto, 'ok', 60000);
    try { return await f(); } finally { /* a mensagem final substitui esta */ }
}

Object.assign(ACOES, {
    'nuvem-salvar': async () => {
        const r = await comAviso('Salvando na nuvem da equipe…', () => salvarNaNuvem(PC.p));
        renderPagina(true);
        avisar(`Salvo na nuvem: pasta "${r.pasta}"${r.biblioteca ? `; ${r.biblioteca} princípio(s) novo(s) na biblioteca da equipe` : ''}${r.componentes ? `; ${r.componentes} componente(s)/material(is) novo(s) no banco da equipe` : ''}.`, 'ok', 7000);
    },
    'nuvem-abrir': async () => {
        const lst = await comAviso('Lendo os projetos da equipe…', listarProjetosNuvem);
        $('#aviso').classList.remove('visivel');
        const alvo = $('#nuvem-lista');
        if (!alvo) return;
        App.nuvemLista = lst;
        alvo.innerHTML = lst.length ? `<ul class="lista-nuvem">${lst.map((pr, i) => `<li><b>${esc(pr.nome)}</b> <small>${pr.versoes.length} versão(ões)${pr.versoes[0] && quandoArquivo(pr.versoes[0]) ? ' · última em ' + quandoArquivo(pr.versoes[0]).toLocaleString('pt-BR') : ''}</small>
            ${pr.versoes.length ? `<select data-nuvem-versao="${i}" aria-label="Versão">${pr.versoes.map((v, k) => `<option value="${k}">${esc(quandoArquivo(v) ? quandoArquivo(v).toLocaleString('pt-BR') : v.name)}</option>`).join('')}</select>
            <button type="button" class="btn btn-primary btn-sm" data-acao="nuvem-abrir-versao" data-i="${i}">Abrir</button>` : ''}</li>`).join('')}</ul>`
            : vazio('Nenhum projeto na nuvem da equipe ainda. Use "Salvar este projeto na nuvem".');
    },
    'nuvem-abrir-versao': async b => {
        const pr = App.nuvemLista[+b.dataset.i];
        const sel = $(`[data-nuvem-versao="${b.dataset.i}"]`);
        const arq = pr.versoes[sel ? +sel.value : 0];
        if (projetoTemConteudo(PC.p) && !confirm(`Abrir "${pr.nome}" da nuvem substitui o projeto deste navegador (o que estiver salvo na nuvem continua lá). Continuar?`)) return;
        const blob = await comAviso('Baixando da nuvem…', () => baixar(arq));
        const anteriores = imagensUsadas(PC.p);
        const { dados } = await lerZipOuJson(new File([blob], arq.name, { type: 'application/zip' }));
        const novo = normalizarProjeto(dados);
        const usadas = new Set(imagensUsadas(novo));
        for (const id of anteriores) if (!usadas.has(id)) await Imagens.apagar(id);
        PC.substituir(novo); App.salvoEm = new Date();
        location.hash = '#/inicio'; renderPagina();
        avisar(`Projeto "${novo.projeto.nome || pr.nome}" aberto da nuvem.`);
    },
    'nuvem-biblioteca': async () => {
        const r = await comAviso('Juntando os princípios de todos os projetos da equipe…', remontarBibliotecaNuvem);
        renderPagina(true);
        avisar(`Biblioteca da equipe atualizada: ${r.projetos} projeto(s) lidos, ${r.novos} princípio(s) novo(s).`, 'ok', 7000);
    },
    'nuvem-sair': () => { nuvemSair(); renderPagina(true); avisar('Saiu da nuvem neste navegador.'); }
});

// balões de informação fecham ao clicar fora deles
document.addEventListener('click', e => {
    document.querySelectorAll('details.balao-info[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
});
