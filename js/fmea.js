/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * FMEA DA CONCEPÇÃO: o que pode falhar em cada função da concepção escolhida. Os modos de falha são sugeridos pelo
 * verbo/objeto da função e pela maturidade do princípio; a equipe ajusta S (severidade), O (ocorrência) e
 * D (detecção), de 1 a 10. RPN = S × O × D. Vai para o Gestão de Projetos (FMEA do projeto preliminar → Riscos).
 */

'use strict';

const FMEA_LIMITE = 100;   // mesmo critério do Gestão de Projetos: RPN ≥ 100 ou S ≥ 9 é crítico

/** [radicais da função, modo, efeito, causa, S, O, D] */
const MODOS_FALHA = [
    [['transmit', 'conduz'], 'Escorregamento ou quebra do elemento de transmissão', 'A função seguinte para de receber o esforço', 'Sobrecarga, desgaste, montagem errada', 7, 3, 3],
    [['sustent', 'suport', 'apoi', 'carga'], 'Fratura ou deformação excessiva', 'Perda da estrutura, risco ao usuário', 'Carga acima da prevista, fadiga, material errado', 9, 2, 4],
    [['fix', 'prend', 'mont'], 'Afrouxamento da fixação', 'Folga, desalinhamento ou soltura', 'Vibração, torque de aperto baixo', 8, 3, 3],
    [['gir', 'rot', 'mancal', 'eixo'], 'Desgaste ou travamento do mancal', 'Atrito alto, ruído, parada', 'Contaminação, falta de lubrificação', 6, 3, 4],
    [['ved', 'proteg', 'isol'], 'Entrada de água ou poeira', 'Corrosão e falha dos componentes internos', 'Vedação danificada ou mal especificada', 6, 4, 3],
    [['frear', 'dissip'], 'Perda de eficiência de frenagem', 'Distância de parada maior, risco ao usuário', 'Água, desgaste, contaminação', 9, 3, 3],
    [['amortec', 'absorv'], 'Amortecimento insuficiente', 'Impactos chegam à estrutura e ao usuário', 'Pressão/rigidez fora do previsto', 5, 3, 4],
    [['contat', 'solo', 'rol'], 'Perda de contato ou de pressão (furo)', 'Perda de tração e de controle', 'Objetos cortantes, pressão baixa', 7, 4, 3],
    [['dos', 'dosar', 'distribu'], 'Falha ou duplicidade na dosagem', 'Dose fora da especificação', 'Produto fora do padrão, rotação errada, entupimento', 7, 4, 4],
    [['transport', 'aliment', 'carreg'], 'Entupimento do fluxo de material', 'Interrupção da operação', 'Umidade, impurezas, embuchamento', 6, 4, 3],
    [['cort', 'abr', 'sulc'], 'Corte ou abertura insuficiente', 'Trabalho incompleto', 'Desgaste do elemento, regulagem errada', 6, 3, 4],
    [['aliment', 'energiz', 'receb', 'fornec'], 'Falta de energia (bateria descarregada, rede caída)', 'O sistema para', 'Autonomia insuficiente, falha da fonte', 7, 3, 3],
    [['convert', 'regul'], 'Tensão ou potência fora da faixa', 'Componentes desligam ou queimam', 'Fonte subdimensionada, aquecimento', 7, 2, 4],
    [['proteg', 'circuito'], 'Proteção não atua ou atua sem motivo', 'Queima de componentes ou paradas indevidas', 'Proteção mal dimensionada', 8, 2, 5],
    [['acion', 'atuador', 'comand'], 'Atuador não responde ou superaquece', 'A ação não acontece', 'Driver/contato danificado, sobrecarga', 7, 3, 3],
    [['med', 'capt', 'detect', 'sent', 'monitor'], 'Leitura errada (deriva, sujeira, ruído)', 'Decisão de controle errada', 'Calibração, contaminação, interferência', 7, 4, 4],
    [['process', 'decid', 'control'], 'Travamento ou erro do software', 'Controle perde a ação', 'Erro de programação, memória, ruído elétrico', 8, 2, 5],
    [['comunic', 'transmit dado', 'envi'], 'Perda de comunicação', 'Dados não chegam; sem comando remoto', 'Alcance, interferência, cabo/conector', 5, 4, 3],
    [['indic', 'inform', 'mostr'], 'Informação errada ou ilegível', 'Operador toma decisão errada', 'Tela no sol, falha do sinal', 5, 3, 3],
    [['armazen', 'registr', 'guard'], 'Perda de dados ou de produto armazenado', 'Histórico ou produto perdido', 'Memória cheia, falha de gravação, vazamento', 5, 2, 4]
];

/** Sugestões para uma função (no máximo 2), considerando a maturidade do princípio escolhido. */
function sugerirModosFalha(funcao, principio) {
    const n = semAcento(funcao.nome);
    const out = MODOS_FALHA.filter(([chaves]) => chaves.some(k => n.includes(k))).slice(0, 2)
        .map(([, modo, efeito, causa, s, o, d]) => ({ modo, efeito, causa, s, o, d }));
    if (!out.length) out.push({ modo: `Não ${funcao.nome.charAt(0).toLowerCase() + funcao.nome.slice(1)} (falha total ou parcial)`, efeito: 'O produto não cumpre esta função', causa: 'A definir pela equipe', s: 6, o: 3, d: 4 });
    if (principio && principio.maturidade === 'desenvolver') out.push({ modo: `Comportamento desconhecido de "${principio.nome}" (tecnologia a desenvolver)`, efeito: 'Desempenho abaixo das especificações', causa: 'Falta de testes e de experiência com o princípio', s: 7, o: 6, d: 7 });
    else if (principio && principio.maturidade === 'adaptar') out.push({ modo: `Adaptação de "${principio.nome}" não funciona como previsto`, efeito: 'Retrabalho e atraso', causa: 'Condições diferentes da aplicação original', s: 5, o: 4, d: 4 });
    return out;
}

const rpn = x => (+x.s || 0) * (+x.o || 0) * (+x.d || 0);
const fmeaCritico = x => rpn(x) >= FMEA_LIMITE || +x.s >= 9;

/** Preenche a FMEA da concepção escolhida (só as funções que ainda não têm linhas). Devolve quantas linhas entraram. */
function sugerirFMEA(p) {
    const est = p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0];
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    if (!est || !v) return 0;
    let n = 0;
    funcoesFolha(est).forEach(f => {
        if (p.fmea.some(l => l.funcId === f.id)) return;
        const pr = acharPrincipio(p, v.escolhas[f.id]);
        sugerirModosFalha(f, pr).forEach(m => { p.fmea.push(Object.assign({ id: uid('fm'), funcId: f.id, acao: '', sugerido: true }, m)); n++; });
    });
    return n;
}

function htmlFMEA(p) {
    const est = p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0];
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    if (!est || !v) return '';
    const n10 = val => Array.from({ length: 10 }, (_, i) => `<option ${+val === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('');
    const nomeF = id => { const f = est.nos.find(n => n.id === id); return f ? `F${numeroFuncao(est, f.id)} ${f.nome}` : '(função removida)'; };
    const linhas = p.fmea.slice().sort((a, b) => rpn(b) - rpn(a));
    const criticos = p.fmea.filter(fmeaCritico).length;
    return `<section class="card">
        <div class="card-topo"><h2>O que pode falhar (FMEA da concepção)</h2>
            <div class="botoes"><button type="button" class="btn btn-secondary btn-sm" data-acao="fmea-sugerir">Sugerir modos de falha</button><button type="button" class="btn btn-secondary btn-sm" data-acao="fmea-add">+ Linha</button></div></div>
        <p class="nota">Para cada função: como ela pode falhar, o efeito e a causa. Notas de 1 a 10 — <b>S</b> gravidade, <b>O</b> chance de acontecer, <b>D</b> dificuldade de perceber antes. <b>RPN = S × O × D</b>; RPN ≥ ${FMEA_LIMITE} ou S ≥ 9 é crítico${criticos ? ` (<b>${criticos}</b> agora)` : ''}. Vai para o Gestão de Projetos (FMEA → Riscos).</p>
        ${linhas.length ? `<div class="tabela-rolagem"><table class="tabela tabela-fmea"><thead><tr><th>Função</th><th>Modo de falha</th><th>Efeito</th><th>Causa</th><th>S</th><th>O</th><th>D</th><th>RPN</th><th>Ação</th><th></th></tr></thead>
        <tbody>${linhas.map(l => `<tr class="${fmeaCritico(l) ? 'fmea-critico' : ''}"><td class="pequeno">${esc(nomeF(l.funcId))}</td>
            <td><textarea rows="2" data-campo="fmea#${l.id}.modo" aria-label="Modo de falha">${esc(l.modo)}</textarea></td>
            <td><textarea rows="2" data-campo="fmea#${l.id}.efeito" aria-label="Efeito">${esc(l.efeito)}</textarea></td>
            <td><textarea rows="2" data-campo="fmea#${l.id}.causa" aria-label="Causa">${esc(l.causa)}</textarea></td>
            ${['s', 'o', 'd'].map(k => `<td><select data-campo="fmea#${l.id}.${k}" data-tipo="num" data-rerender aria-label="${k.toUpperCase()}">${n10(l[k])}</select></td>`).join('')}
            <td class="col-num"><b>${rpn(l)}</b></td>
            <td><textarea rows="2" data-campo="fmea#${l.id}.acao" placeholder="O que fazer" aria-label="Ação">${esc(l.acao)}</textarea></td>
            <td><button type="button" class="btn-icone" data-acao="fmea-del" data-id="${l.id}" aria-label="Excluir">✕</button></td></tr>`).join('')}</tbody></table></div>`
            : vazio('Clique em <b>Sugerir modos de falha</b>: cada função da concepção ganha os modos de falha típicos para você ajustar.')}
        ${dica(`<p>Comece pelas linhas com maior RPN. A ação pode ser mudar o princípio, prever um teste no protótipo, um sensor para detectar a falha ou uma instrução de manutenção.</p>`, 'Como usar')}
    </section>`;
}

Object.assign(ACOES, {
    'fmea-sugerir': () => { const n = sugerirFMEA(PC.p); salvar(); renderPagina(true); avisar(n ? `${n} modo(s) de falha sugerido(s). Ajuste as notas.` : 'Todas as funções já têm linhas na FMEA.'); },
    'fmea-add': () => {
        const p = PC.p, est = PC.estrutura(), f = funcoesFolha(est)[0];
        p.fmea.push({ id: uid('fm'), funcId: f ? f.id : '', modo: '', efeito: '', causa: '', s: 5, o: 5, d: 5, acao: '', sugerido: false });
        salvar(); renderPagina(true);
    },
    'fmea-del': b => { PC.p.fmea = PC.p.fmea.filter(l => l.id !== b.dataset.id); salvar(); renderPagina(true); }
});
