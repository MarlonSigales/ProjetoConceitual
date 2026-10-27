/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * ESBOÇO À MÃO: tela de desenho com o dedo, a caneta ou o mouse (celular, tablet ou computador).
 * abrirEsboco(titulo) devolve um File PNG (ou null se a pessoa cancelar).
 */

'use strict';

function abrirEsboco(titulo = 'Desenhar esboço') {
    return new Promise(resolve => {
        const fundo = document.createElement('div');
        fundo.className = 'esb-fundo';
        fundo.innerHTML = `<div class="esb-janela" role="dialog" aria-modal="true" aria-label="${escAttr(titulo)}">
            <div class="esb-topo"><b>${esc(titulo)}</b><span class="esb-dica">Desenhe com o dedo, a caneta ou o mouse.</span></div>
            <div class="esb-ferramentas">
                ${[['#1d2b2b', 'Preto'], ['#b5462f', 'Vermelho'], ['#2f6fb3', 'Azul'], ['#409580', 'Verde']].map(([c, n], i) => `<button type="button" class="esb-cor ${i ? '' : 'ativa'}" data-cor="${c}" style="--c:${c}" aria-label="${n}" title="${n}"></button>`).join('')}
                <button type="button" class="esb-cor" data-cor="borracha" title="Borracha" aria-label="Borracha">⌫</button>
                <label class="esb-espessura">Traço <input type="range" min="1" max="16" value="3" aria-label="Espessura do traço"></label>
                <button type="button" class="btn btn-secondary btn-sm" data-esb="desfazer">↶ Desfazer</button>
                <button type="button" class="btn btn-secondary btn-sm" data-esb="limpar">Limpar</button>
            </div>
            <div class="esb-area"><canvas></canvas></div>
            <div class="esb-rodape">
                <button type="button" class="btn btn-secondary" data-esb="cancelar">Cancelar</button>
                <button type="button" class="btn btn-primary" data-esb="salvar">✓ Usar este desenho</button>
            </div></div>`;
        document.body.appendChild(fundo);
        document.body.classList.add('esb-aberto');
        const cv = fundo.querySelector('canvas'), area = fundo.querySelector('.esb-area');
        const W = 1200, H = 800;
        cv.width = W; cv.height = H;
        const g = cv.getContext('2d');
        const pinta = () => { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); };
        pinta();
        let cor = '#1d2b2b', esp = 3, desenhando = false, ultimo = null, mexeu = false;
        const historico = [];
        const ponto = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
        cv.addEventListener('pointerdown', e => {
            e.preventDefault();
            historico.push(g.getImageData(0, 0, W, H)); if (historico.length > 30) historico.shift();
            desenhando = true; ultimo = ponto(e); mexeu = true;
            try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ok */ }
            g.beginPath(); g.arc(ultimo.x, ultimo.y, (cor === 'borracha' ? esp * 4 : esp * (e.pressure > 0 && e.pointerType === 'pen' ? 0.5 + e.pressure : 1)) / 2, 0, Math.PI * 2);
            g.fillStyle = cor === 'borracha' ? '#fff' : cor; g.fill();
        });
        cv.addEventListener('pointermove', e => {
            if (!desenhando) return;
            const p = ponto(e);
            g.strokeStyle = cor === 'borracha' ? '#fff' : cor;
            g.lineWidth = cor === 'borracha' ? esp * 4 : esp * (e.pressure > 0 && e.pointerType === 'pen' ? 0.5 + e.pressure : 1);
            g.lineCap = 'round'; g.lineJoin = 'round';
            g.beginPath(); g.moveTo(ultimo.x, ultimo.y); g.lineTo(p.x, p.y); g.stroke();
            ultimo = p;
        });
        const fim = () => { desenhando = false; };
        cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim); cv.addEventListener('pointerleave', fim);
        fundo.querySelector('input[type=range]').addEventListener('input', e => { esp = +e.target.value; });
        const fechar = (r) => { fundo.remove(); document.body.classList.remove('esb-aberto'); document.removeEventListener('keydown', tecla); resolve(r); };
        const tecla = e => { if (e.key === 'Escape') fechar(null); if ((e.ctrlKey || e.metaKey) && e.key === 'z') { const h = historico.pop(); if (h) g.putImageData(h, 0, 0); } };
        document.addEventListener('keydown', tecla);
        fundo.addEventListener('click', e => {
            const c = e.target.closest('[data-cor]');
            if (c) { cor = c.dataset.cor; fundo.querySelectorAll('.esb-cor').forEach(b => b.classList.toggle('ativa', b === c)); return; }
            const b = e.target.closest('[data-esb]');
            if (!b) return;
            const a = b.dataset.esb;
            if (a === 'desfazer') { const h = historico.pop(); if (h) g.putImageData(h, 0, 0); }
            else if (a === 'limpar') { historico.push(g.getImageData(0, 0, W, H)); pinta(); }
            else if (a === 'cancelar') { if (!mexeu || confirm('Descartar o desenho?')) fechar(null); }
            else if (a === 'salvar') {
                if (!mexeu) { fechar(null); return; }
                cv.toBlob(bl => fechar(bl ? new File([bl], 'esboco.png', { type: 'image/png' }) : null), 'image/png');
            }
        });
        void area;
    });
}
