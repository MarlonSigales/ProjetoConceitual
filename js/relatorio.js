/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * RELATÓRIO DO PROJETO CONCEITUAL — mesmo design do Gestão de Projetos e do QFD (capa pontilhada com os
 * quadrados verde e limão, títulos "1 TÍTULO" com linha limão, tabelas de cabeçalho verde e linhas zebradas).
 * Um só gerador para a prévia, para o PDF (impressão do navegador) e para o relatorio.html do ZIP.
 */

'use strict';

const RELATORIO_CSS = `
.rel { font-family: Roboto, "Segoe UI", Arial, sans-serif; color: #1d2b2b; background: #e9efed; padding: 1rem; border-radius: 8px; }
.rel * { box-sizing: border-box; }
.rel .pagina { background: #fff; max-width: 210mm; margin: 0 auto 1rem; box-shadow: 0 6px 24px rgba(16,24,40,.10); border: 1px solid #d5e0dd; border-radius: 4px; overflow: hidden; }
.rel .capa { position: relative; min-height: 270mm; display: flex; flex-direction: column; padding: 2.2rem 2.6rem 2.4rem; background: #fff; overflow: hidden; }
.rel .capa .fundo { position: absolute; left: 0; top: 0; width: 42%; }
.rel .capa::before { content: ""; position: absolute; right: 0; bottom: 9%; width: 11%; height: 31%; background: #409580; }
.rel .capa::after { content: ""; position: absolute; right: 0; bottom: 0; width: 28.5%; height: 9.5%; background: #a8e156; }
.rel .capa-logos { display: flex; gap: 1.4rem; flex-wrap: wrap; position: relative; }
.rel .capa-logos img { height: 46px; width: auto; }
.rel .capa-centro { margin-top: 30%; position: relative; padding-left: 4.2rem; }
.rel .capa-centro::before { content: ""; position: absolute; left: 0; top: 0.1rem; width: 2.6rem; height: 2.6rem; background: #409580; }
.rel .capa-centro::after { content: ""; position: absolute; left: 2.2rem; top: 2.3rem; width: 1.9rem; height: 1.9rem; background: #a8e156; }
.rel .capa-tipo { color: #085357; font-size: 1.9rem; line-height: 1.2; margin: 0 0 1.4rem; text-transform: uppercase; }
.rel .capa h1 { font-size: 1.45rem; color: #085357; margin: 0 0 0.9rem; }
.rel .capa-centro p { margin: 0.1rem 0; color: #085357; font-size: 0.92rem; }
.rel .capa-centro p b { color: #1d2b2b; }
.rel .capa-equipe { margin-top: 2.2rem; padding-left: 4.2rem; font-size: 0.92rem; position: relative; }
.rel .capa-equipe ul { margin: 0.2rem 0 0; padding-left: 1.1rem; }
.rel .capa-rodape { margin-top: auto; padding-right: 32%; font-size: 0.92rem; position: relative; }
.rel .capa-rodape p:first-child { font-size: 1.15rem; color: #085357; margin-bottom: 0.2rem; }
.rel .capa-rodape small { color: #5f6f6d; }
.rel .secao { padding: 1rem 2.25rem 0.9rem; }
.rel h2 { border-bottom: 2px solid #a8e156; padding: 0 0 0.3rem; margin: 0.5rem 0 0.8rem; color: #085357; font-size: 1.15rem; text-transform: uppercase; letter-spacing: 0.01em; }
.rel h2 .n { margin-right: 0.35rem; }
.rel h3 { color: #409580; font-size: 0.98rem; margin: 0.9rem 0 0.35rem; }
.rel p, .rel li { font-size: 0.92rem; line-height: 1.5; }
.rel .pre { white-space: pre-wrap; }
.rel table { width: 100%; border-collapse: collapse; border: 1px solid #cfdcda; margin: 0.4rem 0 0.6rem; }
.rel th { background: #409580; color: #fff; font-size: 0.8rem; font-weight: 700; text-align: left; padding: 0.4rem 0.5rem; border: 1px solid #cfdcda; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.rel td { font-size: 0.82rem; padding: 0.35rem 0.5rem; border: 1px solid #cfdcda; vertical-align: top; }
.rel tbody tr:nth-child(even) { background: #f4f8f7; }
.rel .num { text-align: right; white-space: nowrap; }
.rel .centro { text-align: center; }
.rel .figura { margin: 0.6rem 0 1rem; text-align: center; break-inside: avoid; }
.rel .figura svg, .rel .figura img { max-width: 100%; height: auto; }
.rel .figura figcaption { font-size: 0.8rem; color: #5f6f6d; margin-top: 0.3rem; }
.rel .destaque { border-left: 4px solid #409580; background: #eef7f4; padding: 0.6rem 0.8rem; margin: 0.5rem 0; }
.rel .ponto { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; vertical-align: middle; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.rel .mm td { text-align: center; vertical-align: middle; }
.rel .mm th[scope=row] { background: #eef7f4; color: #0b3b3e; }
.rel .mm img { display: block; max-width: 90px; max-height: 64px; margin: 0 auto 3px; object-fit: contain; }
.rel .mm .marcas { display: block; margin-top: 2px; }
.rel .foto { max-width: 120px; max-height: 90px; object-fit: contain; }
.rel .galeria { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.6rem; }
.rel .galeria figure { margin: 0; text-align: center; border: 1px solid #d5e0dd; padding: 0.4rem; break-inside: avoid; }
.rel .galeria img { max-width: 100%; max-height: 160px; object-fit: contain; }
.rel .galeria figcaption { font-size: 0.78rem; }
.rel .ok { color: #1f5f45; font-weight: 700; }
.rel .nok { color: #b3261e; font-weight: 700; }
.rel .melhor { background: #eef7d9 !important; }
.rel .legenda-fluxos { font-size: 0.8rem; color: #5f6f6d; }
.rel .referencias li { margin-bottom: 0.3rem; }
@media print {
  @page { size: A4; margin: 14mm 12mm; }
  .rel { background: #fff; padding: 0; }
  .rel .pagina { box-shadow: none; border: 0; max-width: none; margin: 0; }
  .rel .capa { min-height: 0; height: 268mm; break-after: page; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 1.2rem 1.4rem; }
  .rel .secao { padding: 0.2rem 0; }
  .rel h2 { break-after: avoid; }
  .rel tr, .rel .figura { break-inside: avoid; }
}`;

/**
 * Corpo do relatório. opcoes:
 *  dataImg: true → <img data-img="id"> (a prévia preenche depois);
 *  imgSrc(id) → endereço da imagem (ZIP: "imagens/x.jpg"; HTML único: data URL);
 *  recurso(nome) → endereço dos logos e da imagem da capa ('' para omitir).
 */
function corpoRelatorio(p, opcoes = {}) {
    const recurso = opcoes.recurso || (n => 'img/' + n);
    const img = (id, alt, cls = '') => {
        if (!id) return '';
        if (opcoes.dataImg) return `<img data-img="${escAttr(id)}" alt="${escAttr(alt || '')}" class="${cls}">`;
        const src = opcoes.imgSrc ? opcoes.imgSrc(id) : '';
        return src ? `<img src="${escAttr(src)}" alt="${escAttr(alt || '')}" class="${cls}">` : '';
    };
    const est = PC.estrutura ? (p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0]) : null;
    const folhas = funcoesFolha(est);
    const nomePr = id => (acharPrincipio(p, id) || {}).nome || '—';
    const data = new Date().toLocaleDateString('pt-BR');
    let n = 0;
    const secao = (titulo, html) => html ? `<section class="secao"><h2><span class="n">${++n}</span>${esc(titulo)}</h2>${html}</section>` : '';
    const vazio = t => `<p><i>${esc(t)}</i></p>`;
    const logo = (arq, alt) => recurso(arq) ? `<img src="${escAttr(recurso(arq))}" alt="${escAttr(alt)}">` : '';

    const capa = `<div class="capa">
        ${recurso('relatorio-fundo-capa.png') ? `<img class="fundo" src="${escAttr(recurso('relatorio-fundo-capa.png'))}" alt="">` : ''}
        <div class="capa-logos">${logo('logo-inovaagro.png', 'Inova Agro')}${logo('logo-nimeq.png', 'NIMEq')}${logo('logo-instagri.png', 'InstAgri')}</div>
        <div class="capa-centro">
            <p class="capa-tipo">Relatório de<br>projeto conceitual</p>
            <h1>${esc(p.projeto.nome || 'Projeto sem nome')}</h1>
            ${p.projeto.cliente ? `<p><b>Cliente:</b> ${esc(p.projeto.cliente)}</p>` : ''}
            ${p.projeto.instituicao ? `<p><b>Instituição:</b> ${esc(p.projeto.instituicao)}</p>` : ''}
            ${p.projeto.responsavel ? `<p><b>Responsável:</b> ${esc(p.projeto.responsavel)}</p>` : ''}
        </div>
        ${p.projeto.equipe.length ? `<div class="capa-equipe"><b>Equipe</b><ul>${p.projeto.equipe.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        <div class="capa-rodape"><p>${data}</p><small>Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII</small></div>
    </div>`;

    // 1 Escopo
    const sentido = { up: '↑', down: '↓', none: '=' };
    const escopo = (p.especificacoes.length ? `<h3>Especificações de projeto</h3><table><thead><tr><th>Cód.</th><th>Especificação</th><th>Meta</th><th>Sentido</th><th>Peso</th><th>Função relacionada</th>${p.baseAnterior ? '<th>Revisão</th>' : ''}</tr></thead><tbody>
        ${p.especificacoes.map(e => `<tr><td>${esc(e.codigo)}</td><td>${esc(e.descricao)}${e.ehCusto ? ' <i>(custo)</i>' : ''}</td><td>${esc(e.meta)}</td><td class="centro">${sentido[e.sentido] || ''}</td><td class="num">${pct(e.peso)}%</td><td>${esc(e.funcao || '')}</td>${p.baseAnterior ? `<td>${esc(REVISOES_ESPEC[e.revisao || 'nova'])}</td>` : ''}</tr>`).join('')}</tbody></table>${p.baseAnterior ? `<p>Projeto desenvolvido a partir de <b>${esc(p.baseAnterior.nome)}</b>; especificações revisadas pela equipe.</p>` : ''}` : vazio('Sem especificações.'))
        + (p.necessidades.length ? `<h3>Necessidades dos clientes</h3><table><thead><tr><th>Necessidade</th><th>Peso</th></tr></thead><tbody>${p.necessidades.map(x => `<tr><td>${esc(x.descricao)}</td><td class="num">${pct(x.peso)}%</td></tr>`).join('')}</tbody></table>` : '')
        + (p.restricoes.length ? `<h3>Restrições</h3><ul>${p.restricoes.map(r => `<li>${esc(r.texto)}</li>`).join('')}</ul>` : '')
        + (p.abstracao.some(t => t.trim()) ? `<h3>Abstração orientada</h3><table><tbody>${PASSOS_ABSTRACAO.map((t, i) => `<tr><td style="width:32%"><b>${i + 1}.</b> ${esc(t)}</td><td class="pre">${esc(p.abstracao[i])}</td></tr>`).join('')}</tbody></table>` : '')
        + (p.formulacao ? `<h3>Formulação do problema</h3><p class="destaque">${esc(p.formulacao)}</p>` : '')
        + (p.origemQFD ? `<p><small>Especificações importadas do QFD (${esc(p.origemQFD.arquivo || 'backup')}).</small></p>` : '');

    // 2 Função global
    const fg = p.funcaoGlobal;
    const temFluxo = ['entradas', 'saidas'].some(l => Object.values(fg[l]).some(x => x.length));
    const funcaoGlobal = fg.nome || temFluxo ? `<p><b>Função global:</b> ${esc(fg.nome)}</p>
        <figure class="figura">${svgCaixaPretaPC(fg)}<figcaption>Caixa-preta — energia (linha simples), material (linha dupla), sinal (tracejada).</figcaption></figure>` : '';

    // 3 Estrutura funcional
    let estrutura = '';
    if (est) {
        const arvore = f => { const fs = funcoesFilhas(est, f.id); return `<li>${f.global ? '' : `<b>F${esc(numeroFuncao(est, f.id))}</b> `}${esc(f.nome)} <i>(${esc(rotuloNivel(est, f))})</i>${fs.length ? `<ul>${fs.map(arvore).join('')}</ul>` : ''}</li>`; };
        const g = noGlobal(est);
        estrutura += `<p>Estrutura escolhida: <b>${esc(est.nome)}</b>${est.descricao ? ' — ' + esc(est.descricao.replace(/[.\s]+$/, '')) : ''}. ${folhas.length} função(ões) elementar(es).</p>`;
        estrutura += niveisComConteudo(est).map(nv => `<figure class="figura">${svgNivelCompleto(est, nv.pai, nv.titulo)}</figure>`).join('');
        if (g) estrutura += `<h3>Desdobramento das funções</h3><ul>${arvore(g)}</ul>`;
        const outras = p.estruturas.filter(e => e.id !== est.id);
        if (outras.length) {
            estrutura += `<h3>Estruturas alternativas</h3>` + outras.map(e => `<p><b>${esc(e.nome)}</b>${e.descricao ? ' — ' + esc(e.descricao) : ''}</p>` +
                niveisComConteudo(e).map(nv => `<figure class="figura">${svgNivelCompleto(e, nv.pai, nv.titulo)}</figure>`).join('')).join('');
            const ind = indicesFerreira(p);
            if (ind.some(x => x.idt || x.idc)) {
                const comR = ind.filter(x => x.razao !== null), mel = comR.length ? comR.reduce((a, b) => b.razao > a.razao ? b : a) : null;
                estrutura += `<h3>Seleção da estrutura (Ferreira, 1997)</h3><table><thead><tr><th>Estrutura</th><th>IDT</th><th>IDC</th><th>IDT/IDC</th></tr></thead><tbody>
                    ${ind.map(x => `<tr class="${mel && mel.id === x.id ? 'melhor' : ''}"><td>${esc(x.nome)}${x.id === p.estruturaEscolhida ? ' ★' : ''}</td><td class="num">${x.idt.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td><td class="num">${x.idc.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td><td class="num">${x.razao === null ? '—' : x.razao.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</td></tr>`).join('')}</tbody></table>
                    <p><small>IDT = Σ (peso do requisito técnico × desempenho 1/5/10); IDC = Σ (valor relativo do custo × custo 1/5/10).</small></p>`;
            }
        }
    }

    // 4 Princípios
    const principios = folhas.some(f => principiosDe(p, f.id).length) ? folhas.map(f => {
        const prs = principiosDe(p, f.id);
        return `<h3>F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</h3>` + (prs.length ? `<table><thead><tr><th>#</th><th>Princípio</th><th>Descrição</th><th>Método / origem</th><th>Maturidade</th><th>Imagem</th></tr></thead><tbody>
            ${prs.map((x, i) => `<tr><td>${i + 1}</td><td><b>${esc(x.nome)}</b>${x.concorrentes && x.concorrentes.length ? `<br><small>Usado por: ${esc(x.concorrentes.join(', '))}</small>` : ''}</td><td>${esc(x.descricao)}${x.fonte ? `<br><small>Fonte: ${esc(x.fonte)}</small>` : ''}</td><td>${esc(x.metodo)}${x.origem && x.origem !== 'manual' ? `<br><small>${esc(ORIGENS_PRINCIPIO[x.origem] || '')}</small>` : ''}</td><td>${MATURIDADES[x.maturidade] ? esc(MATURIDADES[x.maturidade].nome) + `<br><small>TRL ${MATURIDADES[x.maturidade].trl}</small>` : '—'}</td><td class="centro">${img(x.imagem, x.nome, 'foto')}</td></tr>`).join('')}</tbody></table>` : vazio('Sem princípios.'));
    }).join('') : '';

    // 5 Matriz morfológica
    let matriz = '';
    if (folhas.some(f => principiosDe(p, f.id).length)) {
        const nCol = Math.max(...folhas.map(f => principiosDe(p, f.id).length));
        matriz = `<table class="mm"><thead><tr><th>Função</th>${Array.from({ length: nCol }, (_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead><tbody>
            ${folhas.map(f => `<tr><th scope="row">F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</th>${Array.from({ length: nCol }, (_, i) => {
                const x = principiosDe(p, f.id)[i];
                if (!x) return '<td></td>';
                const marcas = p.variantes.filter(v => v.escolhas[f.id] === x.id);
                return `<td>${img(x.imagem, x.nome)}${esc(x.nome)}${marcas.length ? `<span class="marcas">${marcas.map(v => `<span class="ponto" style="background:${escAttr(v.cor)}" title="${escAttr(v.nome)}"></span>`).join('')}</span>` : ''}</td>`;
            }).join('')}</tr>`).join('')}</tbody></table>`;
        if (p.variantes.length) {
            matriz += `<p class="legenda-fluxos">${p.variantes.map(v => `<span class="ponto" style="background:${escAttr(v.cor)}"></span>${esc(v.nome)}`).join(' &nbsp; ')}</p>`;
            matriz += `<h3>Concepções</h3><table><thead><tr><th>Função</th>${p.variantes.map(v => `<th>${esc(v.nome)}</th>`).join('')}</tr></thead><tbody>
                ${folhas.map(f => `<tr><td>F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</td>${p.variantes.map(v => `<td>${v.escolhas[f.id] ? esc(nomePr(v.escolhas[f.id])) : '—'}</td>`).join('')}</tr>`).join('')}
                <tr><td><b>Custo estimado</b></td>${p.variantes.map(v => `<td><b>${esc(textoCusto(custoConcepcao(p, est, v)))}</b></td>`).join('')}</tr>
                ${p.variantes.some(v => v.descricao) ? `<tr><td><i>Ideia</i></td>${p.variantes.map(v => `<td><i>${esc(v.descricao)}</i></td>`).join('')}</tr>` : ''}</tbody></table>`;
        }
        if (p.incompatibilidades.length) matriz += `<h3>Incompatibilidades</h3><ul>${p.incompatibilidades.map(i => `<li>${esc(nomePr(i.a))} ✕ ${esc(nomePr(i.b))}${i.nota ? ' — ' + esc(i.nota) : ''}</li>`).join('')}</ul>`;
    }

    // 6 Seleção
    let selecao = '';
    if (p.variantes.length) {
        const s = p.selecao, r = resultadoSelecao(p);
        const R = id => r.find(x => x.id === id);
        const resp = { sim: 'Sim', nao: 'Não', talvez: 'Talvez' };
        const cab = p.variantes.map(v => `<th>${esc(v.nome)}</th>`).join('');
        selecao += `<h3>Julgamento da viabilidade</h3><table><thead><tr><th>Concepção</th><th>Julgamento</th><th>Razão</th></tr></thead><tbody>
            ${p.variantes.map(v => { const vb = s.viabilidade[v.id] || {}; return `<tr><td>${esc(v.nome)}</td><td>${esc(ESTADOS_VIAB_REL[vb.estado] || '—')}</td><td>${esc(vb.razao || '')}</td></tr>`; }).join('')}</tbody></table>`;
        if (s.tecnologia.perguntas.length) selecao += `<h3>Disponibilidade de tecnologia</h3><table><thead><tr><th>Pergunta</th>${cab}</tr></thead><tbody>
            ${s.tecnologia.perguntas.map(q => `<tr><td>${esc(q.texto)}</td>${p.variantes.map(v => `<td class="centro">${R(v.id).etapa1 ? esc(resp[(s.tecnologia.respostas[v.id] || {})[q.id]] || '—') : '<i>descartada</i>'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        if (s.passa.perguntas.length) selecao += `<h3>Exame passa / não passa</h3><table><thead><tr><th>Pergunta</th>${cab}</tr></thead><tbody>
            ${s.passa.perguntas.map(q => `<tr><td>${esc(q.texto)}</td>${p.variantes.map(v => `<td class="centro">${R(v.id).etapa2 ? esc(resp[(s.passa.respostas[v.id] || {})[q.id]] || '—') : '<i>descartada</i>'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        const ref = s.avaliacao.referencia;
        if (ref && s.avaliacao.criterios.length) {
            const sinal = { 1: '+', 0: 'S', '-1': '−' };
            selecao += `<h3>Matriz de avaliação (referência: ${esc((p.variantes.find(v => v.id === ref) || {}).nome || '')})</h3><table><thead><tr><th>Critério</th><th>Peso</th>${cab}</tr></thead><tbody>
                ${s.avaliacao.criterios.map(c => `<tr><td>${esc(c.texto)}</td><td class="num">${+c.peso || 0}</td>${p.variantes.map(v => `<td class="centro">${v.id === ref ? 'S' : R(v.id).etapa3 ? esc(sinal[String((s.avaliacao.notas[v.id] || {})[c.id])] || '—') : '<i>descartada</i>'}</td>`).join('')}</tr>`).join('')}
                <tr><td colspan="2"><b>Soma</b></td>${p.variantes.map(v => `<td class="centro"><b>${v.id === ref ? 0 : R(v.id).etapa3 ? R(v.id).soma : ''}</b></td>`).join('')}</tr></tbody></table>`;
        }
        const evo = typeof concepcoesEmEvolucao === 'function' ? concepcoesEmEvolucao(p) : [];
        if (evo.length) {
            const est = p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0];
            selecao += `<h3>Evolução das concepções promissoras (Reis, 2003, etapa 2.6)</h3><table><thead><tr><th>Concepção</th><th>Massa</th><th>Dimensões</th><th>Custo</th><th>Observações</th></tr></thead><tbody>
                ${evo.map(v => { const e = s.evolucao[v.id] || {}; return `<tr><td>${esc(v.nome)}</td><td>${esc(e.massa || '—')}</td><td>${esc(e.dimensoes || '—')}</td><td>${esc(est ? textoCusto(custoConcepcao(p, est, v)) : '')}</td><td>${esc(e.observacoes || '')}</td></tr>`; }).join('')}</tbody></table>`;
            const af = avaliacaoFinal(p);
            if (af.linhas.some(l => l.nota !== null)) {
                selecao += `<h3>Avaliação final pelas especificações (Reis, 2003, etapa 2.7)</h3>${s.final.participantes ? `<p>Avaliadores: ${esc(s.final.participantes)}</p>` : ''}<table><thead><tr><th>Especificação</th><th>Peso</th>${evo.map(v => `<th>${esc(v.nome)}</th>`).join('')}</tr></thead><tbody>
                ${p.especificacoes.map(e => `<tr><td>${esc(e.descricao)}</td><td class="num">${pct(e.peso)}%</td>${evo.map(v => { const n = (s.final.notas[v.id] || {})[e.id]; return `<td class="centro">${n ? (n <= 2 && (+e.peso || 0) >= af.pesoMedio ? `<b class="nok">${n}</b>` : n) : '—'}</td>`; }).join('')}</tr>`).join('')}
                <tr><td colspan="2"><b>Nota ponderada (1 a 5)</b></td>${evo.map(v => { const l = af.linhas.find(x => x.id === v.id); return `<td class="centro"><b>${l.nota === null ? '—' : l.nota.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</b></td>`; }).join('')}</tr></tbody></table>
                ${af.recomendada ? `<p>Recomendada: <b>${esc(af.recomendada.nome)}</b>${af.recomendada.motivo ? ' — ' + esc(af.recomendada.motivo) : ''}. Em vermelho, pontos fracos (nota 1 ou 2 em especificação de peso acima da média).</p>` : ''}`;
            }
        }
        selecao += `<h3>Resultado</h3><table><thead><tr><th>Concepção</th><th>Viabilidade</th><th>Tecnologia</th><th>Passa/não passa</th><th>Promissora</th></tr></thead><tbody>
            ${r.map(x => `<tr class="${p.concepcao.varianteId === x.id ? 'melhor' : ''}"><td>${esc(x.nome)}${p.concepcao.varianteId === x.id ? ' ★' : ''}</td><td>${x.etapa1 ? '<span class="ok">passa</span>' : x.viabilidade ? '<span class="nok">não passa</span>' : '—'}</td><td>${x.etapa2 ? '<span class="ok">passa</span>' : x.etapa1 ? '<span class="nok">não passa</span>' : ''}</td><td>${x.etapa3 ? '<span class="ok">passa</span>' : x.etapa2 ? '<span class="nok">não passa</span>' : ''}</td><td>${x.promissora ? '<span class="ok">sim</span>' : ''}</td></tr>`).join('')}</tbody></table>`;
    }

    // 7 Concepção
    let concepcao = '';
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    if (v) {
        const c = p.concepcao;
        concepcao += `<p>Concepção selecionada: <b>${esc(v.nome)}</b>${v.descricao ? ' — ' + esc(v.descricao) : ''}</p>`;
        if (c.descricao) concepcao += `<p class="destaque pre">${esc(c.descricao)}</p>`;
        concepcao += `<table><thead><tr><th>Função</th><th>Princípio de solução</th><th>Imagem</th></tr></thead><tbody>${folhas.map(f => { const x = acharPrincipio(p, v.escolhas[f.id]); return `<tr><td>F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</td><td><b>${x ? esc(x.nome) : '—'}</b>${x && x.descricao ? '<br>' + esc(x.descricao) : ''}</td><td class="centro">${x ? img(x.imagem, x.nome, 'foto') : ''}</td></tr>`; }).join('')}</tbody></table>`;
        if (c.imagens.length) concepcao += `<h3>Esboços e fotos</h3><div class="galeria">${c.imagens.map(im => `<figure>${img(im.id, im.legenda)}<figcaption>${esc(im.legenda || '')}</figcaption></figure>`).join('')}</div>`;
        if (c.complementos.length) concepcao += `<h3>Complementos de outras concepções</h3><ul>${c.complementos.map(k => `<li><b>${esc(nomePr(k.principioId))}</b>${k.nota ? ' — ' + esc(k.nota) : ''}</li>`).join('')}</ul>`;
        if (p.fmea.length) concepcao += `<h3>FMEA da concepção</h3><table><thead><tr><th>Função</th><th>Modo de falha</th><th>Efeito</th><th>Causa</th><th>S</th><th>O</th><th>D</th><th>RPN</th><th>Ação</th></tr></thead><tbody>
            ${p.fmea.slice().sort((a, b) => rpn(b) - rpn(a)).map(l => { const f = est.nos.find(n => n.id === l.funcId); return `<tr class="${fmeaCritico(l) ? 'melhor' : ''}"><td>${f ? 'F' + esc(numeroFuncao(est, f.id)) + ' ' + esc(f.nome) : ''}</td><td>${esc(l.modo)}</td><td>${esc(l.efeito)}</td><td>${esc(l.causa)}</td><td class="centro">${+l.s}</td><td class="centro">${+l.o}</td><td class="centro">${+l.d}</td><td class="centro"><b>${rpn(l)}</b></td><td>${esc(l.acao)}</td></tr>`; }).join('')}</tbody></table><p><small>RPN = S × O × D; em destaque os críticos (RPN ≥ ${FMEA_LIMITE} ou S ≥ 9).</small></p>`;
        if (c.proximosPassos) concepcao += `<h3>Próximos passos</h3><p class="pre">${esc(c.proximosPassos)}</p>`;
    }

    // 8 Análises: maturidade (TRL), desdobramento e pendências
    let analises = '';
    if (est && typeof linhasMaturidade === 'function') {
        const lm = linhasMaturidade(p);
        if (v) analises += `<h3>Maturidade das soluções da concepção (para o TRL)</h3><table><thead><tr><th>Função</th><th>Princípio</th><th>Maturidade</th><th>TRL provável</th></tr></thead><tbody>
            ${lm.map(({ f, x }) => `<tr><td>F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</td><td>${x ? esc(x.nome) : '—'}</td><td>${x && MATURIDADES[x.maturidade] ? esc(MATURIDADES[x.maturidade].nome) : '—'}</td><td class="centro">${x && MATURIDADES[x.maturidade] ? MATURIDADES[x.maturidade].trl : '—'}</td></tr>`).join('')}</tbody></table>`;
        if (p.especificacoes.length) analises += `<h3>Desdobramento: especificação → função</h3><table><thead><tr><th>Especificação</th><th>Funções que atendem</th></tr></thead><tbody>
            ${p.especificacoes.map(e => `<tr><td>${esc(e.descricao)}</td><td>${esc(funcoesDaEspec(est, e).map(n => 'F' + numeroFuncao(est, n.id) + ' ' + n.nome).join('; ')) || (e.ehCusto ? '— (custo)' : '<b>nenhuma</b>')}</td></tr>`).join('')}</tbody></table>`;
        const pend = pendencias(p).filter(x => x.nivel !== 'info');
        if (pend.length) analises += `<h3>Pendências</h3><ul>${pend.map(x => `<li>${esc(x.texto)}</li>`).join('')}</ul>`;
    }

    const referencias = `<ul class="referencias">
        <li>BACK, N.; OGLIARI, A.; DIAS, A.; SILVA, J. C. <i>Projeto integrado de produtos: planejamento, concepção e modelagem</i>. Barueri: Manole, 2008.</li>
        <li>FERREIRA, M. G. G. <i>Utilização de modelos para a representação de produtos no projeto conceitual</i>. Dissertação (Mestrado) — UFSC, Florianópolis, 1997.</li>
        <li>PAHL, G.; BEITZ, W.; FELDHUSEN, J.; GROTE, K.-H. <i>Projeto na engenharia</i>. 6. ed. São Paulo: Edgard Blücher, 2005.</li>
        <li>REIS, A. V. <i>Desenvolvimento de concepções para a dosagem e deposição de precisão para sementes miúdas</i>. Tese (Doutorado) — UFSC, Florianópolis, 2003.</li>
        <li>ROOZENBURG, N. F. M.; EEKELS, J. <i>Product design: fundamentals and methods</i>. Chichester: Wiley, 1995.</li>
        <li>SPAGNOLO, R. T. <i>Integração da qualidade no projeto conceitual de máquinas agrícolas</i>. Tese (Doutorado) — UFPel, Pelotas, 2011.</li></ul>`;

    return `<div class="rel"><div class="pagina">${capa}</div><div class="pagina">
        ${secao('Escopo do problema', escopo)}
        ${secao('Função global', funcaoGlobal)}
        ${secao('Estrutura funcional', estrutura)}
        ${secao('Princípios de solução', principios)}
        ${secao('Matriz morfológica', matriz)}
        ${secao('Seleção da concepção', selecao)}
        ${secao('Concepção selecionada', concepcao)}
        ${secao('Análises e TRL', analises)}
        ${secao('Referências', referencias)}
    </div></div>`;
}

const ESTADOS_VIAB_REL = { viavel: 'Viável', condicional: 'Condicionalmente viável', nao: 'Não viável' };

/** Documento HTML completo (para o ZIP ou para baixar). */
function documentoRelatorio(p, imgSrc, recurso) {
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relatório de projeto conceitual — ${esc(p.projeto.nome || 'projeto')}</title>
<style>body{margin:0;background:#e9efed}${RELATORIO_CSS}</style></head><body>
${corpoRelatorio(p, { imgSrc, recurso: recurso || (n => 'img/' + n) })}
</body></html>`;
}
