/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * TOUR: 5 balões na primeira visita (pula o que não está na tela). Reabre em "Mais opções → Como usar".
 */

'use strict';

const TOUR_CHAVE = 'pc_tour_visto';

function passosTour() {
    return [
        { sel: '.qfd-navegador, [data-acao="importar-qfd"].opcao', texto: '<b>Comece pelo QFD.</b> Use o QFD deste navegador ou o arquivo de backup: quase tudo já vem preenchido.' },
        { sel: '.tipos', texto: '<b>Diga o tipo de projeto.</b> Muda as sugestões de soluções e os modelos prontos.' },
        { sel: '.preencher', texto: '<b>Preenchimento automático.</b> Monta um rascunho de todas as etapas. Ele nunca apaga o que você já fez.' },
        { sel: '#sidebar-nav', menu: true, texto: '<b>As etapas, em ordem.</b> Verde = pronta, amarela = começada, "próximo" = onde continuar.' },
        { sel: '.topbar-zip', texto: '<b>Baixe o ZIP</b> para guardar ou mandar o projeto. Tudo fica salvo sozinho neste navegador.' }
    ];
}

function iniciarTour(forcar = false) {
    try { if (!forcar && localStorage.getItem(TOUR_CHAVE)) return; } catch (e) { /* sem armazenamento: mostra */ }
    const visivel = el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
    const passos = passosTour().map(p => {
        const el = [...document.querySelectorAll(p.sel)].find(visivel);
        return el ? Object.assign({ el }, p) : null;
    }).filter(Boolean);
    if (!passos.length) return;
    let i = 0;
    const camada = document.createElement('div');
    camada.className = 'tour';
    camada.innerHTML = '<div class="tour-foco"></div><div class="tour-balao" role="dialog" aria-live="polite"><div class="tour-texto"></div><div class="tour-botoes"><button type="button" class="btn btn-secondary btn-sm" data-tour="pular">Pular</button><button type="button" class="btn btn-primary btn-sm" data-tour="proximo">Próximo</button></div></div>';
    document.body.appendChild(camada);
    const foco = camada.querySelector('.tour-foco'), balao = camada.querySelector('.tour-balao');
    const fim = () => { if (!camada.isConnected) return; camada.remove(); window.removeEventListener('resize', mostra); try { localStorage.setItem(TOUR_CHAVE, '1'); } catch (e) { /* ok */ } };
    function mostra() {
        const p = passos[i];
        p.el.scrollIntoView({ block: 'center', behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
        const r = p.el.getBoundingClientRect();
        Object.assign(foco.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' });
        camada.querySelector('.tour-texto').innerHTML = `<small>${i + 1} de ${passos.length}</small><p>${p.texto}</p>`;
        camada.querySelector('[data-tour=proximo]').textContent = i === passos.length - 1 ? 'Entendi' : 'Próximo';
        const bw = Math.min(320, window.innerWidth - 24);
        balao.style.width = bw + 'px';
        const abaixo = r.bottom + 16 + 150 < window.innerHeight;
        balao.style.top = (abaixo ? r.bottom + 14 : Math.max(10, r.top - 14 - balao.offsetHeight)) + 'px';
        balao.style.left = Math.max(12, Math.min(window.innerWidth - bw - 12, r.left)) + 'px';
    }
    camada.addEventListener('click', e => {
        const b = e.target.closest('[data-tour]');
        if (!b) return;
        if (b.dataset.tour === 'pular' || i === passos.length - 1) fim(); else { i++; mostra(); }
    });
    window.addEventListener('resize', mostra);
    window.addEventListener('hashchange', fim, { once: true }); // mudou de página: o tour some (e não volta sozinho)
    mostra();
}
