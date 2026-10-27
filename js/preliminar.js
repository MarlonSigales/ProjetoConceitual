/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * PROJETO PRELIMINAR — continua no mesmo projeto depois da concepção escolhida.
 * Roteiro de Reis (2003), fase 3, como detalhado por Sigales (2021, 2025): 3.1 leiautes preliminares e desenhos de forma,
 * 3.2 leiautes detalhados, 3.3 finalizar verificações → leiaute definitivo; planejamento do protótipo (Reis, 4.6; Ulrich e
 * Eppinger); ciclo do protótipo de Spagnolo (2011, etapas 06–10); adequação às especificações (Sigales, 2021, Tabela 9;
 * 2025, Tabela 21). Regra de usabilidade: tudo o que dá vem pré-preenchido do conceitual; a pessoa confere e escolhe.
 */

'use strict';

const ETAPAS_PRELIM = [
    ['p-requisitos', 'P1', 'Requisitos e restrições'],
    ['p-leiautes', 'P2', 'Portadores e leiautes'],
    ['p-detalhes', 'P3', 'Funções auxiliares e diretrizes'],
    ['p-verificacoes', 'P4', 'Verificações e lista de partes'],
    ['p-prototipo', 'P5', 'Protótipo e testes'],
    ['p-adequacao', 'P6', 'Adequação às especificações']
];

const PAPEIS = { determinante: 'Determinante', demais: 'Demais', auxiliar: 'Auxiliar' };
const ORIGENS_PECA = { fabricado: 'Fabricada', comprado: 'Comprada (padronizada)' };
const ARRANJOS = ['Compacto (tudo num só conjunto)', 'Modular (subconjuntos separáveis)', 'Um elemento central para várias unidades', 'Um por unidade', 'Vários por unidade'];
const RESPOSTAS_CHECK = { sim: 'Sim', nao: 'Não', na: 'Não se aplica' };
const ESTADOS_ADEQ = { ok: 'ok atendido', x: 'x não atendido', '?': '? a avaliar' };
const MOTIVOS_ADEQ = ['Depende do leiaute definitivo', 'Depende do material definitivo (fadiga, vida útil, intervalo de manutenção)', 'Falta teste ou ensaio', 'Contradiz a física: rever a especificação no projeto informacional'];

/** Funções auxiliares usuais (Reis, 3.2.1) com a solução padronizada típica. */
const AUXILIARES = [
    { funcao: 'Fixar as partes', solucao: 'Parafuso sextavado', tipos: '*' },
    { funcao: 'Vedar', solucao: 'Anel O-ring NBR 70', tipos: '*' },
    { funcao: 'Apoiar o eixo (mancal)', solucao: 'Rolamento rígido de esferas 6202-2RS', tipos: '*' },
    { funcao: 'Proteger as partes móveis', solucao: 'Carenagem / proteção fixa', tipos: '*' },
    { funcao: 'Proteger a eletrônica', solucao: 'Caixa de proteção IP65', tipos: 'eletrico automacao misto agricola' },
    { funcao: 'Conectar energia e sinais', solucao: 'Conector circular à prova d’água', tipos: 'eletrico automacao misto agricola' },
    { funcao: 'Proteger o circuito', solucao: 'Fusível automotivo de lâmina', tipos: 'eletrico automacao misto' },
    { funcao: 'Lubrificar', solucao: 'Graxeira / rolamento vedado', tipos: 'mecanico agricola misto' },
    { funcao: 'Acoplar à máquina', solucao: 'Suporte padrão do fabricante', tipos: 'agricola mecanico misto' }
];

/** Interfaces e restrições usuais por tipo de projeto (Reis, 3.1.2; Sigales, 2025, 4.1). */
const INTERFACES_TIPO = {
    agricola: ['Engate de três pontos (ISO 730), categoria I ou II', 'Tomada de potência (ISO 500), 540 ou 1000 rpm', 'Espaçamento entre linhas', 'Altura livre do solo', 'Suporte padrão do fabricante (ex.: berço do dosador)', 'Mangueira de ar/vácuo no diâmetro mais comum do mercado'],
    eletrico: ['Tensão de alimentação (ex.: 12 V do trator, 220 V)', 'Conector e bitola do cabo', 'Grau de proteção IP da caixa', 'Aterramento e proteção do circuito'],
    automacao: ['Comunicação (ISOBUS ISO 11783, CAN, MQTT/Wi-Fi)', 'Tensão de alimentação', 'Fixação dos sensores', 'Grau de proteção IP da caixa'],
    mecanico: ['Pontos de fixação', 'Eixos e furações de montagem', 'Espaço para montagem e manutenção'],
    comum: ['Limite do equipamento de protótipo (ex.: impressora 3D de 30 × 30 × 30 cm)']
};
INTERFACES_TIPO.misto = INTERFACES_TIPO.mecanico.concat(INTERFACES_TIPO.eletrico.slice(0, 2), INTERFACES_TIPO.automacao.slice(0, 1));

/** Regras básicas e DfX (Reis, 3.2.2; Pahl et al., Figura 21 de Sigales, 2025), em perguntas sim/não. */
const DIRETRIZES = [
    ['clareza', 'Clareza', 'Cada peça tem uma função clara e o funcionamento é previsível?'],
    ['simplicidade', 'Simplicidade', 'O número de peças e de formas diferentes já é o mínimo?'],
    ['seguranca', 'Segurança', 'Partes móveis, quentes e elétricas estão protegidas?'],
    ['fadiga', 'Fadiga e ruptura', 'Peças com carga repetida foram verificadas para fadiga e ruptura?'],
    ['dilatacao', 'Dilatação e alongamento', 'Calor e esforço não travam nem soltam os encaixes?'],
    ['corrosao', 'Corrosão', 'Materiais e acabamentos resistem ao ambiente (umidade, adubo, defensivos)?'],
    ['ergonomia', 'Ergonomia', 'Operar e regular é fácil, sem esforço excessivo nem posição ruim?'],
    ['estetica', 'Estética', 'A aparência comunica a função e deixa espaço para a marca?'],
    ['manufatura', 'Manufatura', 'Usa processos disponíveis e formas simples (cantos arredondados, paredes uniformes)?'],
    ['montagem', 'Montagem', 'Monta à mão, sem ferramenta especial e sem chance de montar errado?'],
    ['normas', 'Normas', 'As normas aplicáveis foram identificadas e atendidas?'],
    ['manutencao', 'Manutenção', 'Peças de desgaste são fáceis de inspecionar e trocar?'],
    ['reciclagem', 'Reciclagem', 'Os materiais podem ser separados e reaproveitados no fim da vida?'],
    ['risco', 'Mínimo risco', 'Uma falha não causa dano maior (falha segura)?'],
    ['padronizacao', 'Padronização', 'Usa peças padronizadas e de catálogo sempre que possível?'],
    ['custo', 'Custo', 'O custo previsto cabe na meta da especificação de custo?'],
    ['confiabilidade', 'Confiabilidade e teste', 'Cada função pode ser testada sozinha?'],
    ['suprimentos', 'Cadeia de suprimentos', 'As peças compradas têm mais de um fornecedor?'],
    ['ip', 'Proteção da eletrônica (IP)', 'A eletrônica tem grau de proteção IP adequado ao ambiente?', 'eletrico automacao misto agricola']
];

/** Lista de verificação do projeto preliminar (Reis, 2003, Quadro 4.4, a partir de Pahl et al.). */
const VERIFICACAO = [
    ['funcao', 'Função', 'A função prevista é cumprida? As funções auxiliares necessárias estão resolvidas?'],
    ['principio', 'Princípio', 'Os princípios escolhidos produzem os efeitos e as vantagens esperadas? Que perturbações podem ocorrer?'],
    ['leiaute', 'Leiaute', 'Resistência, deformação, estabilidade, desgaste, folgas e espaço estão sob controle?'],
    ['seguranca', 'Segurança', 'Os fatores de segurança do usuário, do ambiente e da máquina foram considerados?'],
    ['ergonomia', 'Ergonomia', 'Esforço, alcance, visibilidade e ruído para quem opera foram considerados?'],
    ['producao', 'Produção', 'Processo, custo e prazo de fabricação foram analisados?'],
    ['qualidade', 'Controle de qualidade', 'As verificações necessárias podem ser feitas durante e depois da fabricação?'],
    ['montagem', 'Montagem', 'A montagem é simples, rápida e sem ambiguidade?'],
    ['transporte', 'Transporte', 'Transporte interno e externo e armazenamento foram considerados?'],
    ['operacao', 'Operação', 'Vibração, ruído e manuseio em uso real foram considerados?'],
    ['reciclagem', 'Reciclagem', 'Reaproveitamento e descarte foram considerados?'],
    ['manutencao', 'Manutenção', 'Inspeção, manutenção e reparo são fáceis de fazer e de verificar?'],
    ['custos', 'Custos', 'Os limites de custo serão respeitados? Há custos extras de operação?'],
    ['cronograma', 'Cronograma', 'Os prazos serão cumpridos? O que poderia acelerá-los?']
];

const PROPOSITOS = { aprendizado: 'Aprender (o conceito funciona?)', comunicacao: 'Comunicar (mostrar a ideia)', integracao: 'Integrar as partes', marco: 'Marco do projeto (decidir se segue)' };
const CICLO_PADRAO = ['Construção do protótipo', 'Teste preliminar', 'Ajuste e adequação de componentes', 'Teste definitivo', 'Análise e discussão dos resultados'];

/** Modelo de ensaio de dosador (Sigales, 2025, Tabela 9, a partir de Coelho, 1996, e da ISO 7256-1). */
const MODELO_ENSAIO_DOSADOR = {
    norma: 'ISO 7256-1 (ensaio de dosadores em bancada) e Coelho (1996)',
    variaveis: 'Velocidade de deslocamento (≥ 3 níveis, as usadas em campo); densidade de semeadura (≥ 3: mínima, média, máxima); nível do reservatório (cheio, 1/2, 1/4); inclinação (−11° a 11°, ≥ 3 níveis)',
    respostas: 'Espaçamentos aceitáveis, múltiplos e falhos (%); danificação de sementes (%); capacidade de trabalho (sementes/s)',
    analise: '≥ 4 repetições (5 recomendadas) de ≥ 250 amostras por tratamento; ANOVA de um fator e teste de Tukey; média móvel exponencialmente ponderada quando a distribuição não for normal'
};

// ---------------------------------------------------------------- utilidades

function estDoP(p) { return p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0] || null; }
function concepcaoEscolhida(p) { return p.variantes.find(v => v.id === p.concepcao.varianteId) || null; }
function especsUsadas(p) { return p.especificacoes.filter(e => e.revisao !== 'removida'); }

/** Lê número de um texto ("1,75 kg", "≤ R$ 180", "1800 g"). */
function numeroDe(t) { const m = String(t ?? '').replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/); return m ? parseFloat(m[0].replace(',', '.')) : null; }
function kgDe(t) { const n = numeroDe(t); if (n === null) return null; return /\bg\b|\dg$|gramas?/i.test(String(t)) && !/kg/i.test(String(t)) ? n / 1000 : n; }

/** A meta "≤ 1800 g", ">= 1500", "= 32" e o valor obtido: true/false, ou null se não der para comparar (5% no "="). */
function atendeMeta(e, valor) {
    const v = numeroDe(valor), meta = String(e.meta || '');
    const alvo = numeroDe(meta);
    if (v === null || alvo === null) return null;
    if (/≤|<=|<|máx|max/i.test(meta)) return v <= alvo;
    if (/≥|>=|>|mín|min/i.test(meta)) return v >= alvo;
    if (/=|±/.test(meta) || e.sentido === 'none') return Math.abs(v - alvo) <= Math.abs(alvo) * 0.05;
    if (e.sentido === 'down') return v <= alvo;
    if (e.sentido === 'up') return v >= alvo;
    return null;
}

const RX_DETERMINANTE = /massa|peso|dimens|di[aâ]metro|largura|altura|comprimento|espa[cç]amento|dist[aâ]ncia|carga|for[cç]a|torque|pot[eê]ncia|volume|vaz[aã]o|capacidade|press[aã]o|velocidade|rota[cç][aã]o|material|espessura|raio|tens[aã]o|corrente|raios|inclina/i;
function ehDeterminante(e) { return !e.ehCusto && RX_DETERMINANTE.test(`${e.descricao} ${e.unidade || ''}`); }

/** A função elementar f atende a alguma especificação determinante? (pela própria função ou por uma de cima) */
function funcaoDeterminante(p, est, f) {
    const det = especsUsadas(p).filter(e => p.preliminar.determinantes[e.id]);
    const cadeia = new Set(ancestrais(est, f.id).map(n => n.id).concat(f.id));
    return det.some(e => funcoesDaEspec(est, e).some(n => cadeia.has(n.id)));
}

function custoLista(p) {
    return p.preliminar.portadores.reduce((t, x) => t + (x.custo !== null && x.custo !== '' && isFinite(+x.custo) ? +x.custo * (+x.qtd || 1) : 0), 0);
}
function custoPrototipo(p) {
    const c = p.preliminar.prototipo.custo, n = v => (v === null || v === '' || !isFinite(+v) ? 0 : +v);
    const energia = n(c.potenciaW) / 1000 * n(c.horas) * n(c.tarifa), material = n(c.kg) * n(c.precoKg);
    const compradas = p.preliminar.portadores.filter(x => x.origem === 'comprado').reduce((t, x) => t + n(x.custo) * (+x.qtd || 1), 0);
    return { energia, material, compradas, outros: n(c.outros), total: energia + material + compradas + n(c.outros) };
}
/** "Ø 622 × 25 mm" → { c: 622, l: 25, a: 622 }; "640 × 120 × 640" → c, l, a. Só em mm (converte cm e m). */
function envelopeDe(t) {
    const s = String(t || ''), nums = [...s.matchAll(/\d+(?:[.,]\d+)?/g)].map(m => parseFloat(m[0].replace(',', '.')));
    if (!nums.length) return null;
    const f = /\bm\b/.test(s) && !/mm/.test(s) ? 1000 : /cm/.test(s) ? 10 : 1, n = nums.map(x => String(Math.round(x * f * 10) / 10));
    if (/[ØøΦ⌀]/.test(s) && n.length >= 2) return { c: n[0], l: n[1], a: n[0] };
    if (n.length >= 3) return { c: n[0], l: n[1], a: n[2] };
    return null;
}
const reais = v => 'R$ ' + (+v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Nota técnica (0–1, notas 1–5 ponderadas pelas especificações) e econômica (0–1, menor custo = 1) de cada leiaute. */
function avaliarLeiautes(p) {
    const esp = especsUsadas(p).filter(e => !e.ehCusto), L = p.preliminar.leiautes;
    const custos = L.map(l => (l.custo !== null && l.custo !== '' && isFinite(+l.custo) && +l.custo > 0 ? +l.custo : null));
    const menor = Math.min(...custos.filter(c => c !== null));
    return L.map((l, i) => {
        const av = esp.filter(e => +l.notas[e.id] >= 1), sp = av.reduce((t, e) => t + (+e.peso || 0), 0);
        const tec = av.length ? (sp ? av.reduce((t, e) => t + (+e.peso || 0) * +l.notas[e.id], 0) / sp : av.reduce((t, e) => t + +l.notas[e.id], 0) / av.length) / 5 : null;
        const eco = custos[i] !== null && isFinite(menor) ? menor / custos[i] : null;
        const dist = tec !== null && eco !== null ? Math.hypot(1 - tec, 1 - eco) : null;
        return { id: l.id, nome: l.nome, tec, eco, dist, avaliadas: av.length, total: esp.length };
    });
}

// ---------------------------------------------------------------- pré-preenchimento a partir do conceitual

/**
 * Preenche o que estiver vazio a partir do conceitual. Nunca apaga. Devolve a lista do que fez (para mostrar ao usuário).
 */
function preencherPreliminar(p) {
    const pl = p.preliminar, est = estDoP(p), v = concepcaoEscolhida(p), feitos = [];
    if (!v || !est) return feitos;
    const esp = especsUsadas(p);
    // 3.1.1 requisitos determinantes
    if (!Object.keys(pl.determinantes).length) {
        esp.filter(ehDeterminante).forEach(e => { pl.determinantes[e.id] = true; });
        const n = Object.keys(pl.determinantes).length;
        if (n) feitos.push(`${n} especificação(ões) marcada(s) como determinante(s) (tamanho, arranjo, material)`);
    }
    // 3.1.2 envelope e interfaces
    const evo = (p.selecao.evolucao || {})[v.id] || {};
    if (!pl.envelope.obs && evo.dimensoes) {
        pl.envelope.obs = `Dimensões gerais estimadas na seleção: ${evo.dimensoes}`;
        const env = envelopeDe(evo.dimensoes);
        if (env && !pl.envelope.c && !pl.envelope.l && !pl.envelope.a) Object.assign(pl.envelope, env);
        feitos.push('espaço disponível a partir das dimensões estimadas da concepção (confira: é o tamanho do produto, aumente se houver folga)');
    }
    if (!pl.interfaces.length) {
        (INTERFACES_TIPO[p.tipoProjeto] || INTERFACES_TIPO.mecanico).concat(INTERFACES_TIPO.comum).forEach(t => pl.interfaces.push({ id: uid('if'), texto: t, medida: '' }));
        feitos.push(`${pl.interfaces.length} interface(s)/restrição(ões) usuais do tipo de projeto (apague as que não valem)`);
    }
    if (!pl.esbocoRestricoes && evo.imagem) pl.esbocoRestricoes = evo.imagem;
    // 3.1.3 e 3.1.6 portadores de efeito físico: um por função da concepção
    if (!pl.portadores.some(x => x.papel !== 'auxiliar')) {
        funcoesFolha(est).forEach(f => {
            const pr = acharPrincipio(p, v.escolhas[f.id]);
            if (!pr) return;
            pl.portadores.push({ id: uid('pt'), funcId: f.id, principioId: pr.id, nome: pr.nome, papel: funcaoDeterminante(p, est, f) ? 'determinante' : 'demais',
                parametro: '', material: '', processo: '', origem: 'fabricado', fornecedor: '', qtd: 1, custo: pr.custoValor ?? null, imagem: pr.imagem || null });
        });
        const n = pl.portadores.filter(x => x.papel !== 'auxiliar').length;
        if (n) feitos.push(`${n} portador(es) de efeito físico criado(s), um por função da concepção, com princípio, foto e custo`);
    }
    // 3.1.4 leiautes preliminares: o da concepção evoluída e uma alternativa de arranjo
    if (!pl.leiautes.length) {
        const notas = Object.assign({}, (p.selecao.final.notas || {})[v.id] || {});
        const c = custoConcepcao(p, est, v);
        pl.leiautes.push({ id: uid('lt'), nome: `Leiaute A — ${v.nome}`, arranjo: ARRANJOS[0], dimensoes: evo.dimensoes || '', massa: evo.massa || '', imagem: evo.imagem || null,
            obs: evo.observacoes || '', notas, custo: c && c.valor !== null ? c.valor : null });
        pl.leiautes.push({ id: uid('lt'), nome: 'Leiaute B — arranjo alternativo', arranjo: ARRANJOS[1], dimensoes: '', massa: '', imagem: null, obs: '', notas: {}, custo: null });
        feitos.push('2 leiautes iniciados (A com as estimativas e notas da concepção; B para outro arranjo)');
    }
    // 3.2.1 funções auxiliares com solução padronizada do banco da equipe
    if (!pl.portadores.some(x => x.papel === 'auxiliar')) {
        const tipo = p.tipoProjeto || 'mecanico';
        AUXILIARES.filter(a => a.tipos === '*' || a.tipos.split(' ').includes(tipo)).slice(0, 5).forEach(a => {
            const c = typeof acharComponente === 'function' ? acharComponente(a.solucao) : null;
            pl.portadores.push({ id: uid('pt'), funcId: '', principioId: '', nome: a.solucao, papel: 'auxiliar', parametro: c ? c.especificacao : '', material: '', processo: '',
                origem: 'comprado', fornecedor: c ? c.fornecedor : '', qtd: 1, custo: c ? c.preco : null, imagem: null, funcaoAux: a.funcao });
        });
        feitos.push('funções auxiliares usuais com peças padronizadas do banco da equipe (fixar, vedar, apoiar, proteger…)');
    }
    // 3.3.2 verificação: ações já conhecidas da FMEA da concepção
    const criticos = (p.fmea || []).filter(l => fmeaCritico(l));
    if (criticos.length && !(pl.verificacao.seguranca || {}).acao) {
        pl.verificacao.seguranca = Object.assign({ r: '' }, pl.verificacao.seguranca || {}, { acao: 'Da FMEA da concepção: ' + criticos.map(l => `${l.modo}${l.acao ? ' → ' + l.acao : ''}`).join('; ') });
        feitos.push(`${criticos.length} modo(s) de falha crítico(s) da FMEA levados para a verificação`);
    }
    // planejamento do protótipo (Reis, 4.6)
    const pr = pl.prototipo;
    const arriscadas = funcoesFolha(est).filter(f => { const x = acharPrincipio(p, v.escolhas[f.id]); return x && (x.maturidade === 'desenvolver' || x.maturidade === 'adaptar'); });
    if (!pr.proposito.length) { pr.proposito = arriscadas.length ? ['aprendizado', 'marco'] : ['integracao', 'marco']; }
    if (!pr.aproximacao) pr.aproximacao = 'fisico';
    if (!pr.abrangencia) pr.abrangencia = arriscadas.length && arriscadas.length < funcoesFolha(est).length ? 'focado' : 'completo';
    if (!pr.variaveis && arriscadas.length) pr.variaveis = 'Funções a testar primeiro (tecnologia a adaptar ou desenvolver): ' + arriscadas.map(f => `F${numeroFuncao(est, f.id)} ${f.nome}`).join('; ');
    if (!pr.norma) {
        const normas = (p.referencias || []).filter(r => /norma/i.test(r.tipo || '') || /\b(ISO|ABNT|NBR|IEC|ASTM|DIN)\b/.test(r.identificacao || ''));
        if (normas.length) pr.norma = normas.map(r => [r.identificacao, r.titulo].filter(Boolean).join(' — ')).join('; ');
        else if (/dosad/i.test(`${p.projeto.nome} ${p.funcaoGlobal.nome}`)) pr.norma = MODELO_ENSAIO_DOSADOR.norma;
    }
    if (!pr.respostas) {
        const t = tercosEspec(p);
        const sup = esp.filter(e => t[e.id] === 'superior');
        if (sup.length) pr.respostas = sup.map(e => `${e.descricao}${e.meta ? ' (meta ' + e.meta + ')' : ''}${e.avaliacao ? ' — ' + e.avaliacao : ''}`).join('; ');
    }
    if (!pr.analise) pr.analise = 'Comparar cada resultado com a meta da especificação; repetir o teste (≥ 3 vezes) quando houver variação; registrar foto e data.';
    if (!pr.ciclo.length) { CICLO_PADRAO.forEach(etapa => pr.ciclo.push({ id: uid('cy'), etapa, data: '', situacao: '', notas: '', imagem: null })); feitos.push('plano do protótipo e ciclo construção → teste preliminar → ajuste → teste definitivo → análise'); }
    if (pr.custo.kg === null) { const kg = kgDe(evo.massa); if (kg !== null) pr.custo.kg = Math.round(kg * 1000) / 1000; }
    // adequação às especificações: valor conhecido e motivo provável do que ainda não dá para avaliar
    esp.forEach(e => {
        const a = pl.adequacao[e.id] || (pl.adequacao[e.id] = { valor: '', estado: '', motivo: '' });
        if (!a.valor) {
            if (e.ehCusto) { const c = custoLista(p) || (custoConcepcao(p, est, v) || {}).valor; if (c) a.valor = String(Math.round(c * 100) / 100); }
            else if (/massa|peso/i.test(e.descricao) && evo.massa) { const kg = kgDe(evo.massa); a.valor = kg === null ? '' : /\(g\)|\bg\b/.test(`${e.descricao} ${e.unidade}`) && !/kg/i.test(`${e.descricao} ${e.unidade}`) ? String(Math.round(kg * 1000)) : String(kg); }
        }
        if (!a.estado) {
            const r = a.valor ? atendeMeta(e, a.valor) : null;
            a.estado = r === true ? 'ok' : r === false ? 'x' : '?';
        }
        if (a.estado === '?' && !a.motivo) {
            const t = `${e.descricao} ${e.avaliacao}`;
            a.motivo = /vida|fadiga|confiab|durab|intervalo/i.test(t) ? MOTIVOS_ADEQ[1] : /ensaio|bancada|laborat|campo|simula|medi|contagem|cronomet/i.test(t) ? MOTIVOS_ADEQ[2] : MOTIVOS_ADEQ[0];
        }
    });
    pl.iniciado = true;
    return feitos;
}

/** Garante o pré-preenchimento na primeira visita (concepção escolhida). */
function garantirPreliminar(p) {
    if (p.preliminar.iniciado || !concepcaoEscolhida(p)) return;
    const feitos = preencherPreliminar(p);
    if (feitos.length) {
        p.ultimoPreenchimento = { em: new Date().toISOString(), itens: feitos.map(t => ({ etapa: 'p-requisitos', texto: t })).concat(lista((p.ultimoPreenchimento || {}).itens)) };
        App.preliminarAviso = feitos;
    }
    salvar();
}

// ---------------------------------------------------------------- pendências do preliminar

function pendenciasPreliminar(p) {
    const out = [], add = (nivel, texto, etapa) => out.push({ nivel, texto, etapa });
    const pl = p.preliminar;
    if (!concepcaoEscolhida(p)) { add('alta', 'Escolha a concepção na etapa 7 do conceitual antes de começar o preliminar.', 'concepcao'); return out; }
    if (!Object.values(pl.determinantes).some(Boolean)) add('alta', 'Marque os requisitos determinantes (tamanho, arranjo, material).', 'p-requisitos');
    if (!pl.envelope.c && !pl.envelope.l && !pl.envelope.a) add('media', 'Informe o espaço disponível (comprimento × largura × altura).', 'p-requisitos');
    const semParam = pl.portadores.filter(x => x.papel === 'determinante' && !x.parametro);
    if (semParam.length) add('media', `Portadores determinantes sem parâmetro característico: ${semParam.map(x => x.nome).join(', ')}.`, 'p-leiautes');
    if (pl.leiautes.filter(l => l.dimensoes || l.imagem).length < 2 && pl.leiautes.length < 2) add('media', 'Faça pelo menos dois leiautes para comparar (Reis, 3.1.4).', 'p-leiautes');
    if (!pl.leiauteEscolhido) add('alta', 'Escolha o leiaute (avaliação técnica e econômica).', 'p-leiautes');
    const dir = diretrizesDoTipo(p);
    const semResp = dir.filter(d => !(pl.diretrizes[d[0]] || {}).r);
    if (semResp.length) add('media', `Diretrizes sem resposta: ${semResp.length} de ${dir.length}.`, 'p-detalhes');
    const naoSemAcao = dir.filter(d => (pl.diretrizes[d[0]] || {}).r === 'nao' && !(pl.diretrizes[d[0]] || {}).acao);
    if (naoSemAcao.length) add('alta', `Diretrizes com "Não" e sem ação: ${naoSemAcao.map(d => d[1]).join(', ')}.`, 'p-detalhes');
    const verSem = VERIFICACAO.filter(d => !(pl.verificacao[d[0]] || {}).r);
    if (verSem.length) add('media', `Lista de verificação (Quadro 4.4): ${verSem.length} item(ns) sem resposta.`, 'p-verificacoes');
    const verNao = VERIFICACAO.filter(d => (pl.verificacao[d[0]] || {}).r === 'nao' && !(pl.verificacao[d[0]] || {}).acao);
    if (verNao.length) add('alta', `Verificação com "Não" e sem ação: ${verNao.map(d => d[1]).join(', ')}.`, 'p-verificacoes');
    const compSemForn = pl.portadores.filter(x => x.origem === 'comprado' && !x.fornecedor);
    if (compSemForn.length) add('info', `Peças compradas sem fornecedor: ${compSemForn.map(x => x.nome).join(', ')}.`, 'p-verificacoes');
    const fabSemMat = pl.portadores.filter(x => x.origem === 'fabricado' && !x.material);
    if (fabSemMat.length) add('media', `Peças fabricadas sem material: ${fabSemMat.map(x => x.nome).join(', ')}.`, 'p-verificacoes');
    if (pl.prototipo.ciclo.some(c => c.situacao === 'reprovou')) add('alta', 'Um teste reprovou: volte às verificações (3.3) e ajuste o leiaute, depois repita o teste.', 'p-verificacoes');
    const t = tercosEspec(p);
    const supSem = especsUsadas(p).filter(e => t[e.id] === 'superior' && (pl.adequacao[e.id] || {}).estado !== 'ok');
    if (supSem.length) add('media', `Especificações do terço superior ainda não atendidas: ${supSem.map(e => e.descricao).join('; ')}.`, 'p-adequacao');
    const fisica = especsUsadas(p).filter(e => (pl.adequacao[e.id] || {}).motivo === MOTIVOS_ADEQ[3]);
    if (fisica.length) add('alta', `Rever no QFD/informacional (contradiz a física): ${fisica.map(e => e.descricao).join('; ')}.`, 'p-adequacao');
    return out;
}
function diretrizesDoTipo(p) { const t = p.tipoProjeto || 'mecanico'; return DIRETRIZES.filter(d => !d[3] || d[3].split(' ').includes(t)); }

function statusPreliminar(p) {
    const pl = p.preliminar, s = (feito, andamento, resumo) => ({ estado: feito ? 'feito' : andamento ? 'andamento' : 'vazio', resumo });
    if (!concepcaoEscolhida(p)) return Object.fromEntries(ETAPAS_PRELIM.map(([id]) => [id, s(false, false, 'escolha a concepção antes')]));
    const nDet = Object.values(pl.determinantes).filter(Boolean).length;
    const dir = diretrizesDoTipo(p), dirR = dir.filter(d => (pl.diretrizes[d[0]] || {}).r).length;
    const verR = VERIFICACAO.filter(d => (pl.verificacao[d[0]] || {}).r).length;
    const ciclo = pl.prototipo.ciclo, cicloOk = ciclo.filter(c => c.situacao === 'feito').length;
    const esp = especsUsadas(p), adeqOk = esp.filter(e => (pl.adequacao[e.id] || {}).estado === 'ok').length;
    const avaliadas = esp.filter(e => ['ok', 'x'].includes((pl.adequacao[e.id] || {}).estado)).length;
    return {
        'p-requisitos': s(nDet > 0 && (pl.envelope.c || pl.envelope.l || pl.envelope.a), nDet > 0 || pl.interfaces.length, `${nDet} determinante(s) · ${pl.interfaces.length} interface(s)`),
        'p-leiautes': s(!!pl.leiauteEscolhido, pl.portadores.length > 0, `${pl.portadores.filter(x => x.papel !== 'auxiliar').length} portador(es) · ${pl.leiautes.length} leiaute(s)${pl.leiauteEscolhido ? ' · escolhido' : ''}`),
        'p-detalhes': s(dir.length && dirR === dir.length, dirR > 0, `diretrizes ${dirR}/${dir.length}`),
        'p-verificacoes': s(verR === VERIFICACAO.length, verR > 0, `verificação ${verR}/${VERIFICACAO.length} · ${pl.portadores.length} peça(s)`),
        'p-prototipo': s(ciclo.length && cicloOk === ciclo.length, cicloOk > 0 || pl.prototipo.variaveis, `${cicloOk}/${ciclo.length} passo(s) do ciclo`),
        'p-adequacao': s(esp.length && adeqOk === esp.length, avaliadas > 0, `${adeqOk} de ${esp.length} atendida(s)`)
    };
}

// ---------------------------------------------------------------- pedaços de tela

function htmlSemConcepcao() {
    return `<section class="card">${vazio('O projeto preliminar começa da <b>concepção escolhida</b>. Termine a <a href="#/selecao">seleção</a> e escolha a concepção na <a href="#/concepcao">etapa 7</a>; depois volte aqui: quase tudo já vem preenchido.')}</section>`;
}

/** Topo de cada página do preliminar: o que foi preenchido sozinho e o que falta nesta página. */
function htmlTopoPreliminar(p, pagina) {
    const aviso = App.preliminarAviso;
    App.preliminarAviso = null;
    const pend = pendenciasPreliminar(p).filter(x => x.etapa === pagina);
    return `${aviso && aviso.length ? `<section class="card preenchido-auto"><h2>✨ Preenchido a partir do conceitual — confira</h2><ul>${aviso.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
        ${pagina !== 'p-requisitos' && typeof htmlCartaoIAPreliminar === 'function' ? '<p class="link-ia"><button type="button" class="btn-link" data-acao="ir-ia-prelim">🤖 A IA pode sugerir parâmetros, materiais, peças padronizadas, respostas e plano de ensaio →</button></p>' : ''}
        ${pend.length ? `<ul class="pendencias pendencias-pagina">${pend.map(x => `<li class="pend-${x.nivel}"><span class="pend-sinal">${x.nivel === 'alta' ? '!' : x.nivel === 'media' ? '•' : 'i'}</span><span>${esc(x.texto)}</span></li>`).join('')}</ul>` : '<p class="etapa-selo-ok pendencias-pagina">✓ Nada pendente nesta etapa.</p>'}`;
}

function selectSimNao(caminho, valor, rotulo) {
    return `<select data-campo="${caminho}" data-rerender class="resp resp-${valor === 'sim' ? 'sim' : valor === 'nao' ? 'nao' : valor === 'na' ? 'na' : 'vazio'}" aria-label="${escAttr(rotulo)}">
        <option value="">—</option>${Object.entries(RESPOSTAS_CHECK).map(([k, t]) => `<option value="${k}" ${valor === k ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
}
function fotoPortador(x, acaoBase, extra = '') {
    return x.imagem ? `<div class="mini-foto">${imgTag(x.imagem, x.nome)}<button type="button" class="btn-icone perigo" data-acao="${acaoBase}-del" data-id="${x.id}" ${extra} aria-label="Remover imagem">✕</button></div>`
        : `<div class="foto-vazia mini"><button type="button" class="so-toque" data-acao="${acaoBase}" data-cam="1" data-id="${x.id}" ${extra} aria-label="Tirar foto">📷</button><button type="button" data-acao="${acaoBase}" data-id="${x.id}" ${extra} aria-label="Escolher imagem">🖼</button><button type="button" data-acao="${acaoBase}-desenho" data-id="${x.id}" ${extra} aria-label="Desenhar">✏</button></div>`;
}

// ---------------------------------------------------------------- P1 requisitos e restrições (Reis 3.1.1, 3.1.2)

PAGINAS['p-requisitos'] = {
    titulo: 'Requisitos e restrições',
    sub: 'Primeiro passo do projeto preliminar (Reis, 2003, tarefas 3.1.1 e 3.1.2): quais especificações definem tamanho, arranjo e material, e qual o espaço e as ligações com o resto da máquina.',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const pl = p.preliminar, esp = especsUsadas(p), v = concepcaoEscolhida(p);
        const sugIf = (INTERFACES_TIPO[p.tipoProjeto] || INTERFACES_TIPO.mecanico).concat(INTERFACES_TIPO.comum).filter(t => !pl.interfaces.some(i => i.texto === t));
        return `${htmlTopoPreliminar(p, 'p-requisitos')}
        <section class="card">
            <div class="card-topo"><h2>Concepção escolhida: ${esc(v.nome)}</h2><a class="btn btn-secondary btn-sm" href="#/concepcao">Ver a concepção</a></div>
            <p class="nota">${esc((p.concepcao.descricao || v.descricao || '').slice(0, 400))}${(p.concepcao.descricao || '').length > 400 ? '…' : ''}</p>
        </section>
        <section class="card">
            <div class="card-topo"><h2>1. Requisitos determinantes (3.1.1)</h2>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="pl-det-sugerir" title="Marca as que falam de massa, dimensões, carga, potência, velocidade…">Marcar as sugeridas</button></div>
            <p class="nota">Marque as especificações que <b>definem o tamanho, o arranjo ou o material</b> (ex.: diâmetros, cargas, potência, espessura). Elas guiam os primeiros desenhos. Já vêm marcadas pelas palavras da especificação.</p>
            <div class="tabela-rolagem"><table class="tabela"><thead><tr><th class="col-centro">Define?</th><th>Especificação</th><th>Meta</th><th>Peso</th></tr></thead>
            <tbody>${esp.map(e => `<tr><td class="col-centro"><input type="checkbox" data-campo="preliminar.determinantes.${e.id}" data-rerender ${pl.determinantes[e.id] ? 'checked' : ''} aria-label="Determinante"></td>
                <td>${esc(e.descricao)}</td><td>${esc(e.meta || '')}</td><td class="col-num">${pct(e.peso)}%${seloTerco(p, e)}</td></tr>`).join('')}</tbody></table></div>
        </section>
        <section class="card">
            <h2>2. Espaço disponível e ligações (3.1.2)</h2>
            <p class="nota">O "envelope" é a caixa onde o produto precisa caber. Use mm.</p>
            <div class="grade-campos envelope">
                <label>Comprimento (mm) <input type="text" inputmode="decimal" data-campo="preliminar.envelope.c" value="${escAttr(pl.envelope.c)}" maxlength="20"></label>
                <label>Largura (mm) <input type="text" inputmode="decimal" data-campo="preliminar.envelope.l" value="${escAttr(pl.envelope.l)}" maxlength="20"></label>
                <label>Altura (mm) <input type="text" inputmode="decimal" data-campo="preliminar.envelope.a" value="${escAttr(pl.envelope.a)}" maxlength="20"></label>
                <label class="largo">Observações <input type="text" data-campo="preliminar.envelope.obs" value="${escAttr(pl.envelope.obs)}" maxlength="300"></label>
            </div>
            <h3>Interfaces e restrições</h3>
            ${pl.interfaces.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Interface / restrição</th><th>Medida ou valor</th><th></th></tr></thead><tbody>
                ${pl.interfaces.map(i => `<tr><td><input type="text" data-campo="preliminar.interfaces#${i.id}.texto" value="${escAttr(i.texto)}" maxlength="200" aria-label="Interface"></td>
                <td><input type="text" data-campo="preliminar.interfaces#${i.id}.medida" value="${escAttr(i.medida)}" maxlength="120" placeholder="ex.: cat. II, 540 rpm, 12 V" aria-label="Medida"></td>
                <td class="col-acao"><button type="button" class="btn-icone" data-acao="pl-if-del" data-id="${i.id}" aria-label="Excluir">✕</button></td></tr>`).join('')}</tbody></table></div>` : ''}
            <div class="chips">${sugIf.map(t => `<button type="button" class="chip" data-acao="pl-if-sug" data-texto="${escAttr(t)}">+ ${esc(t)}</button>`).join('')}<button type="button" class="chip" data-acao="pl-if-add">+ Outra</button></div>
            <h3>Desenho em escala das restrições</h3>
            <div class="evolucao-esboco">${pl.esbocoRestricoes ? `${imgTag(pl.esbocoRestricoes, 'Esboço das restrições')}<button type="button" class="btn-icone perigo" data-acao="pl-esb-del" aria-label="Remover">✕</button>`
                : `<div class="foto-vazia"><button type="button" class="so-toque" data-acao="pl-esb" data-cam="1">📷<span>Tirar foto</span></button><button type="button" data-acao="pl-esb">🖼<span>Imagem</span></button><button type="button" data-acao="pl-esb-desenho">✏<span>Esboço</span></button></div>`}</div>
        </section>
        ${typeof htmlCartaoIAPreliminar === 'function' ? htmlCartaoIAPreliminar(p) : ''}`;
    }
};

// ---------------------------------------------------------------- P2 portadores e leiautes (3.1.3–3.1.6, 3.2.4)

PAGINAS['p-leiautes'] = {
    titulo: 'Portadores e leiautes',
    sub: 'Cada função da concepção vira uma peça ou conjunto ("portador de efeito físico"). Faça dois ou mais leiautes e escolha pela avaliação técnica e econômica (Reis, 2003, tarefas 3.1.3 a 3.1.6 e 3.2.4).',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const pl = p.preliminar, est = estDoP(p), esp = especsUsadas(p).filter(e => !e.ehCusto);
        const nomeF = id => { const f = est && est.nos.find(n => n.id === id); return f ? `F${numeroFuncao(est, f.id)} ${f.nome}` : ''; };
        const principais = pl.portadores.filter(x => x.papel !== 'auxiliar');
        const av = avaliarLeiautes(p);
        const melhor = av.filter(a => a.dist !== null).sort((a, b) => a.dist - b.dist)[0];
        return `${htmlTopoPreliminar(p, 'p-leiautes')}
        <section class="card">
            <h2>1. Portadores de efeito físico (3.1.3 e 3.1.6)</h2>
            <p class="nota">Comece pelos <b>determinantes</b> (os que atendem às especificações marcadas em P1). O <b>parâmetro característico</b> é a medida que define a peça (ex.: diâmetro do disco, número de furos, rotação, potência).</p>
            <div class="tabela-rolagem"><table class="tabela tabela-portadores"><thead><tr><th>Foto</th><th>Função</th><th>Portador (peça/conjunto)</th><th>Papel</th><th>Parâmetro característico</th></tr></thead>
            <tbody>${principais.map(x => `<tr class="papel-${x.papel}"><td>${fotoPortador(x, 'pl-pt-img')}</td><td class="pequeno">${esc(nomeF(x.funcId))}</td>
                <td><input type="text" data-campo="preliminar.portadores#${x.id}.nome" value="${escAttr(x.nome)}" maxlength="140" aria-label="Portador"></td>
                <td><select data-campo="preliminar.portadores#${x.id}.papel" data-rerender aria-label="Papel">${Object.entries(PAPEIS).filter(([k]) => k !== 'auxiliar').map(([k, t]) => `<option value="${k}" ${x.papel === k ? 'selected' : ''}>${t}</option>`).join('')}</select></td>
                <td><input type="text" data-campo="preliminar.portadores#${x.id}.parametro" value="${escAttr(x.parametro)}" maxlength="200" placeholder="ex.: Ø 180 mm, 32 furos, 60 rpm" aria-label="Parâmetro"></td></tr>`).join('') || `<tr><td colspan="5">Nenhum portador. <button type="button" class="btn btn-secondary btn-sm" data-acao="pl-refazer-portadores">Criar a partir da concepção</button></td></tr>`}</tbody></table></div>
        </section>
        <section class="card">
            <div class="card-topo"><h2>2. Leiautes preliminares (3.1.4)</h2><button type="button" class="btn btn-primary btn-sm" data-acao="pl-lt-add">+ Leiaute</button></div>
            <p class="nota">Um leiaute é o arranjo geral em escala (foto do CAD, do modelo ou desenho à mão). Varie o <b>arranjo</b> para ter alternativas reais.</p>
            <div class="grade-evolucao">${pl.leiautes.map(l => `<article class="evolucao leiaute ${pl.leiauteEscolhido === l.id ? 'escolhido' : ''}" style="--cor:${pl.leiauteEscolhido === l.id ? '#2f7d57' : '#9aa7a5'}">
                <div class="card-topo"><input class="titulo-campo" type="text" data-campo="preliminar.leiautes#${l.id}.nome" value="${escAttr(l.nome)}" maxlength="100" aria-label="Nome do leiaute">
                    <button type="button" class="btn-icone" data-acao="pl-lt-del" data-id="${l.id}" aria-label="Excluir leiaute">✕</button></div>
                <div class="grade-campos">
                    <label class="largo">Arranjo <select data-campo="preliminar.leiautes#${l.id}.arranjo">${['<option value="">—</option>'].concat(ARRANJOS.map(a => `<option ${l.arranjo === a ? 'selected' : ''}>${esc(a)}</option>`)).join('')}</select></label>
                    <label>Dimensões gerais <input type="text" data-campo="preliminar.leiautes#${l.id}.dimensoes" value="${escAttr(l.dimensoes)}" maxlength="80" placeholder="C × L × A"></label>
                    <label>Massa estimada <input type="text" data-campo="preliminar.leiautes#${l.id}.massa" value="${escAttr(l.massa)}" maxlength="40"></label>
                    <label>Custo estimado (R$) <input type="text" inputmode="decimal" data-campo="preliminar.leiautes#${l.id}.custo" data-tipo="num" data-rerender value="${l.custo ?? ''}" maxlength="20"></label>
                    <label class="largo">Observações <textarea rows="2" data-campo="preliminar.leiautes#${l.id}.obs" maxlength="800">${esc(l.obs)}</textarea></label>
                </div>
                <div class="evolucao-esboco">${l.imagem ? `${imgTag(l.imagem, l.nome)}<button type="button" class="btn-icone perigo" data-acao="pl-lt-img-del" data-id="${l.id}" aria-label="Remover">✕</button>`
                    : `<div class="foto-vazia"><button type="button" class="so-toque" data-acao="pl-lt-img" data-cam="1" data-id="${l.id}">📷<span>Tirar foto</span></button><button type="button" data-acao="pl-lt-img" data-id="${l.id}">🖼<span>Imagem</span></button><button type="button" data-acao="pl-lt-img-desenho" data-id="${l.id}">✏<span>Esboço</span></button></div>`}</div>
            </article>`).join('')}</div>
        </section>
        ${pl.leiautes.length ? `<section class="card">
            <div class="card-topo"><h2>3. Escolher o leiaute (3.1.5 e 3.2.4)</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="pl-lt-notas" title="Usa as notas da avaliação final da concepção onde estiver vazio">Sugerir notas</button></div>
            <p class="nota">Nota de 1 (muito ruim) a 5 (muito bom) em cada especificação técnica; o custo entra no valor econômico. O melhor é o mais perto do canto de cima à direita (técnico e econômico altos).</p>
            <div class="tabela-rolagem"><table class="tabela tabela-final"><thead><tr><th>Especificação</th><th>Peso</th>${pl.leiautes.map(l => `<th>${esc(l.nome)}</th>`).join('')}</tr></thead>
            <tbody>${esp.map(e => `<tr><td>${esc(e.descricao)}${p.preliminar.determinantes[e.id] ? ' <small class="selo-det">determinante</small>' : ''}</td><td class="col-num">${pct(e.peso)}%${seloTerco(p, e)}</td>
                ${pl.leiautes.map(l => { const n = l.notas[e.id]; return `<td><select data-campo="preliminar.leiautes#${l.id}.notas.${e.id}" data-tipo="num" data-rerender class="resp resp-n${n || ''}" aria-label="Nota"><option value="">—</option>${Object.entries(ESCALA_FINAL).map(([k, t]) => `<option value="${k}" ${+n === +k ? 'selected' : ''}>${k} ${t}</option>`).join('')}</select></td>`; }).join('')}</tr>`).join('')}</tbody>
            <tfoot><tr><th colspan="2">Valor técnico (0 a 1)</th>${av.map(a => `<td class="col-num"><b>${a.tec === null ? '—' : a.tec.toFixed(2)}</b></td>`).join('')}</tr>
                <tr><th colspan="2">Valor econômico (0 a 1)</th>${av.map(a => `<td class="col-num"><b>${a.eco === null ? '—' : a.eco.toFixed(2)}</b></td>`).join('')}</tr>
                <tr><th colspan="2"></th>${pl.leiautes.map(l => `<td>${pl.leiauteEscolhido === l.id ? '<span class="etapa-selo-ok">escolhido</span>' : `<button type="button" class="btn btn-secondary btn-sm" data-acao="pl-lt-escolher" data-id="${l.id}">Escolher</button>`}</td>`).join('')}</tr></tfoot></table></div>
            <div class="grafico-te">${graficoTecnicoEconomico(av, pl.leiauteEscolhido)}
                <p>${melhor ? `Mais equilibrado: <b>${esc(melhor.nome)}</b>.` : 'Dê notas e custo aos leiautes para ver o gráfico.'} Pode também <b>fundir</b> leiautes: copie os pontos fortes de um para o outro e avalie de novo (Reis, 3.3.1).</p></div>
        </section>` : ''}`;
    }
};

function graficoTecnicoEconomico(av, escolhido) {
    const W = 220, H = 220, m = 28, X = v => m + v * (W - 2 * m), Y = v => H - m - v * (H - 2 * m);
    const pts = av.filter(a => a.tec !== null && a.eco !== null);
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Valor técnico × econômico">
        <rect x="${m}" y="${m}" width="${W - 2 * m}" height="${H - 2 * m}" fill="#f6faf8" stroke="#c9d5d2"/>
        <line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="#c9d5d2" stroke-dasharray="4 4"/>
        <text x="${W / 2}" y="${H - 6}" font-size="10" text-anchor="middle" fill="#55625f">valor técnico →</text>
        <text x="10" y="${H / 2}" font-size="10" text-anchor="middle" fill="#55625f" transform="rotate(-90 10 ${H / 2})">valor econômico →</text>
        ${pts.map((a, i) => `<g><circle cx="${X(a.tec)}" cy="${Y(a.eco)}" r="${a.id === escolhido ? 8 : 6}" fill="${a.id === escolhido ? '#2f7d57' : '#d4a017'}"><title>${esc(a.nome)}</title></circle>
            <text x="${X(a.tec) + 9}" y="${Y(a.eco) + 4}" font-size="11" fill="#1d2b28">${String.fromCharCode(65 + av.indexOf(a))}</text></g>`).join('')}</svg>`;
}

// ---------------------------------------------------------------- P3 funções auxiliares e diretrizes (3.2.1–3.2.3)

PAGINAS['p-detalhes'] = {
    titulo: 'Funções auxiliares e diretrizes',
    sub: 'Resolva as funções auxiliares (fixar, vedar, apoiar, proteger…) com peças padronizadas sempre que der, e confira o leiaute com as regras básicas e o "projeto para X" (Reis, 2003, tarefas 3.2.1 a 3.2.3).',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const pl = p.preliminar, aux = pl.portadores.filter(x => x.papel === 'auxiliar'), tipo = p.tipoProjeto || 'mecanico';
        const sug = AUXILIARES.filter(a => (a.tipos === '*' || a.tipos.split(' ').includes(tipo)) && !aux.some(x => x.funcaoAux === a.funcao));
        const dir = diretrizesDoTipo(p);
        return `${htmlTopoPreliminar(p, 'p-detalhes')}
        ${htmlListasComponentes()}
        <section class="card">
            <h2>1. Funções auxiliares com peças padronizadas (3.2.1)</h2>
            <p class="nota">Escolha a peça da lista (vem do banco da equipe); especificação, fornecedor e preço entram sozinhos quando existirem lá.</p>
            ${aux.length ? `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Função auxiliar</th><th>Peça padronizada</th><th>Especificação</th><th>Qtd.</th><th></th></tr></thead><tbody>
                ${aux.map(x => `<tr><td><input type="text" data-campo="preliminar.portadores#${x.id}.funcaoAux" value="${escAttr(x.funcaoAux || '')}" maxlength="100" aria-label="Função auxiliar"></td>
                <td><input type="text" list="dl-componentes" data-campo="preliminar.portadores#${x.id}.nome" data-acao-mudar="pl-comp" data-id="${x.id}" value="${escAttr(x.nome)}" maxlength="140" aria-label="Peça"></td>
                <td><input type="text" data-campo="preliminar.portadores#${x.id}.parametro" value="${escAttr(x.parametro)}" maxlength="200" aria-label="Especificação"></td>
                <td class="col-num"><input type="number" min="0" step="1" data-campo="preliminar.portadores#${x.id}.qtd" data-tipo="num" value="${x.qtd ?? 1}" aria-label="Quantidade" style="width:4.5rem"></td>
                <td class="col-acao"><button type="button" class="btn-icone" data-acao="pl-pt-del" data-id="${x.id}" aria-label="Excluir">✕</button></td></tr>`).join('')}</tbody></table></div>` : ''}
            <div class="chips">${sug.map(a => `<button type="button" class="chip" data-acao="pl-aux-sug" data-funcao="${escAttr(a.funcao)}" data-solucao="${escAttr(a.solucao)}">+ ${esc(a.funcao)}</button>`).join('')}<button type="button" class="chip" data-acao="pl-aux-add">+ Outra</button></div>
        </section>
        <section class="card">
            <h2>2. Regras básicas e "projeto para X" (3.2.2)</h2>
            <p class="nota">Responda olhando o leiaute escolhido. Cada <b>Não</b> precisa de uma ação (vira pendência até ter).</p>
            <div class="tabela-rolagem"><table class="tabela tabela-check"><thead><tr><th>Item</th><th>Pergunta</th><th>Resposta</th><th>Ação / observação</th></tr></thead><tbody>
            ${dir.map(([k, nome, perg]) => { const d = pl.diretrizes[k] || {}; return `<tr class="${d.r === 'nao' && !d.acao ? 'linha-alerta' : ''}"><td><b>${esc(nome)}</b></td><td>${esc(perg)}</td><td>${selectSimNao(`preliminar.diretrizes.${k}.r`, d.r, nome)}</td>
                <td><input type="text" data-campo="preliminar.diretrizes.${k}.acao" value="${escAttr(d.acao || '')}" maxlength="300" placeholder="${d.r === 'nao' ? 'o que fazer?' : ''}" aria-label="Ação"></td></tr>`; }).join('')}</tbody></table></div>
            ${dica('<p>Regras básicas de Pahl et al.: <b>claro</b> (função e efeito previsíveis), <b>simples</b> (poucas peças e formas) e <b>seguro</b>. Para peças plásticas que vão para injeção (Sigales, 2021): cantos arredondados, paredes finas e uniformes, nervuras de 0,2 a 0,7 da espessura da parede, ângulo de saída e tolerâncias que considerem a contração.</p>', 'Dicas')}
        </section>
        ${htmlCartaoComponentes(p)}`;
    }
};

// ---------------------------------------------------------------- P4 verificações e lista de partes (3.3.1–3.3.3)

PAGINAS['p-verificacoes'] = {
    titulo: 'Verificações e lista de partes',
    sub: 'Procure erros e fatores de perturbação com a lista de verificação e feche a lista de partes preliminar — o que leva ao leiaute definitivo (Reis, 2003, tarefas 3.3.1 a 3.3.3).',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const pl = p.preliminar, total = custoLista(p);
        const especCusto = especsUsadas(p).find(e => e.ehCusto);
        const metaCusto = especCusto ? numeroDe(especCusto.meta) : null;
        const crit = (p.fmea || []).filter(l => fmeaCritico(l));
        return `${htmlTopoPreliminar(p, 'p-verificacoes')}
        ${htmlListasComponentes()}
        <section class="card">
            <h2>1. Erros e fatores de perturbação (3.3.2)</h2>
            <p class="nota">Lista de verificação de Reis (2003, Quadro 4.4). Cada <b>Não</b> precisa de ação. ${crit.length ? `A FMEA da concepção tem <b>${crit.length} modo(s) crítico(s)</b> — já levados para "Segurança".` : ''}</p>
            <div class="tabela-rolagem"><table class="tabela tabela-check"><thead><tr><th>Item</th><th>Pergunta</th><th>Resposta</th><th>Ação / observação</th></tr></thead><tbody>
            ${VERIFICACAO.map(([k, nome, perg]) => { const d = pl.verificacao[k] || {}; return `<tr class="${d.r === 'nao' && !d.acao ? 'linha-alerta' : ''}"><td><b>${esc(nome)}</b></td><td>${esc(perg)}</td><td>${selectSimNao(`preliminar.verificacao.${k}.r`, d.r, nome)}</td>
                <td><input type="text" data-campo="preliminar.verificacao.${k}.acao" value="${escAttr(d.acao || '')}" maxlength="500" aria-label="Ação"></td></tr>`; }).join('')}</tbody></table></div>
            ${dica(`<table class="tabela"><thead><tr><th>Tipo de falha</th><th>Medidas</th></tr></thead><tbody>
                <tr><td>Geometria (espaço errado, configuração defeituosa)</td><td>Modelagem 3D, tolerâncias e revisão de projeto</td></tr>
                <tr><td>Função (não cumpre, interface ruim)</td><td>FMEA, árvore de falhas, QFD, validação</td></tr>
                <tr><td>Leiaute (cinemática, esforços)</td><td>Experimento, teste de campo, simulação (elementos finitos, multicorpos)</td></tr>
                <tr><td>Processo (documentos, versões)</td><td>Controle de versões dos desenhos e documentos</td></tr></tbody></table><p>Pahl et al. (2007), na Figura 22 de Sigales (2025).</p>`, 'Que medida usar para cada falha')}
        </section>
        <section class="card">
            <div class="card-topo"><h2>2. Lista de partes preliminar (3.3.3)</h2><button type="button" class="btn btn-secondary btn-sm" data-acao="pl-peca-add">+ Peça</button></div>
            <p class="nota">Já traz os portadores e as peças auxiliares. Material e fornecedor sugerem do banco da equipe.</p>
            <div class="tabela-rolagem"><table class="tabela tabela-partes"><thead><tr><th>Peça</th><th>Qtd.</th><th>Origem</th><th>Material</th><th>Processo</th><th>Fornecedor</th><th>Custo unit. (R$)</th><th>Total</th><th></th></tr></thead><tbody>
            ${pl.portadores.map(x => `<tr><td data-rotulo="Peça"><input type="text" ${x.origem === 'comprado' ? 'list="dl-componentes"' : ''} data-campo="preliminar.portadores#${x.id}.nome" data-acao-mudar="pl-comp" data-id="${x.id}" value="${escAttr(x.nome)}" maxlength="140" aria-label="Peça"></td>
                <td data-rotulo="Qtd." class="col-num"><input type="number" min="0" step="1" data-campo="preliminar.portadores#${x.id}.qtd" data-tipo="num" data-rerender value="${x.qtd ?? 1}" aria-label="Quantidade" style="width:4.5rem"></td>
                <td data-rotulo="Origem"><select data-campo="preliminar.portadores#${x.id}.origem" data-rerender aria-label="Origem">${Object.entries(ORIGENS_PECA).map(([k, t]) => `<option value="${k}" ${x.origem === k ? 'selected' : ''}>${t}</option>`).join('')}</select></td>
                <td data-rotulo="Material">${x.origem === 'fabricado' ? `<input type="text" list="dl-materiais" data-campo="preliminar.portadores#${x.id}.material" value="${escAttr(x.material)}" maxlength="80" aria-label="Material">` : '<small>—</small>'}</td>
                <td data-rotulo="Processo">${x.origem === 'fabricado' ? `<input type="text" list="dl-processos" data-campo="preliminar.portadores#${x.id}.processo" value="${escAttr(x.processo)}" maxlength="80" aria-label="Processo">` : '<small>—</small>'}</td>
                <td data-rotulo="Fornecedor"><input type="text" list="dl-fornecedores" data-campo="preliminar.portadores#${x.id}.fornecedor" value="${escAttr(x.fornecedor)}" maxlength="120" aria-label="Fornecedor"></td>
                <td data-rotulo="Custo unit. (R$)" class="col-num"><input type="text" inputmode="decimal" data-campo="preliminar.portadores#${x.id}.custo" data-tipo="num" data-rerender value="${x.custo ?? ''}" maxlength="14" aria-label="Custo unitário" style="width:6rem"></td>
                <td data-rotulo="Total" class="col-num">${x.custo !== null && x.custo !== '' ? reais(+x.custo * (+x.qtd || 1)) : '—'}</td>
                <td data-rotulo="" class="col-acao"><button type="button" class="btn-icone" data-acao="pl-pt-del" data-id="${x.id}" aria-label="Excluir">✕</button></td></tr>`).join('')}</tbody>
            <tfoot><tr><th colspan="7">Total${especCusto ? ` (meta: ${esc(especCusto.meta || '—')})` : ''}</th><td class="col-num"><b class="${metaCusto !== null && total > metaCusto ? 'nok' : ''}">${reais(total)}</b></td><td></td></tr></tfoot></table></div>
            <datalist id="dl-processos">${['Impressão 3D (protótipo)', 'Injeção plástica', 'Usinagem', 'Corte a laser e dobra', 'Solda', 'Fundição', 'Estampagem', 'Montagem de placa eletrônica'].map(t => `<option value="${t}">`).join('')}</datalist>
            ${metaCusto !== null && total > metaCusto ? `<p class="nok">O total passa da meta de custo em ${reais(total - metaCusto)}. Procure peças padronizadas mais baratas ou simplifique.</p>` : ''}
        </section>
        ${htmlCartaoComponentes(p)}`;
    }
};

// ---------------------------------------------------------------- P5 protótipo e testes (Reis 4.6; Spagnolo etapas 06–10)

PAGINAS['p-prototipo'] = {
    titulo: 'Protótipo e testes',
    sub: 'Planeje o protótipo em quatro perguntas (Reis, 2003, item 4.6, a partir de Ulrich e Eppinger) e acompanhe o ciclo construção → teste preliminar → ajuste → teste definitivo (Spagnolo, 2011).',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const pr = p.preliminar.prototipo, c = custoPrototipo(p);
        return `${htmlTopoPreliminar(p, 'p-prototipo')}
        <section class="card">
            <h2>1. Para que serve o protótipo?</h2>
            <div class="chips">${Object.entries(PROPOSITOS).map(([k, t]) => `<button type="button" class="chip ${pr.proposito.includes(k) ? 'chip-ativo' : ''}" aria-pressed="${pr.proposito.includes(k)}" data-acao="pl-proposito" data-k="${k}">${pr.proposito.includes(k) ? '✓ ' : ''}${esc(t)}</button>`).join('')}</div>
            <h2>2. Que tipo de protótipo?</h2>
            <div class="grade-campos">
                <label>Aproximação <select data-campo="preliminar.prototipo.aproximacao"><option value="">—</option><option value="fisico" ${pr.aproximacao === 'fisico' ? 'selected' : ''}>Físico (peças reais, impressão 3D)</option><option value="analitico" ${pr.aproximacao === 'analitico' ? 'selected' : ''}>Analítico (simulação, cálculo)</option></select></label>
                <label>Abrangência <select data-campo="preliminar.prototipo.abrangencia"><option value="">—</option><option value="completo" ${pr.abrangencia === 'completo' ? 'selected' : ''}>Completo (o produto todo)</option><option value="focado" ${pr.abrangencia === 'focado' ? 'selected' : ''}>Focado (só as funções de risco)</option></select></label>
            </div>
        </section>
        <section class="card">
            <div class="card-topo"><h2>3. Plano de teste e ensaio</h2>
                <button type="button" class="btn btn-secondary btn-sm" data-acao="pl-ensaio-dosador" title="Sigales (2025), Tabela 9, a partir de Coelho (1996) e da ISO 7256-1">Usar modelo de ensaio de dosador</button></div>
            <p class="nota"><b>Teste</b> confere uma especificação de forma pontual (contar, medir, cronometrar). <b>Ensaio</b> é a operação repetida e normatizada (Geitner e Eierman, 2022, em Sigales, 2025).</p>
            <div class="grade-campos">
                <label class="largo">O que variar (variáveis e níveis) <textarea rows="2" data-campo="preliminar.prototipo.variaveis" maxlength="1500">${esc(pr.variaveis)}</textarea></label>
                <label class="largo">Norma ou método <input type="text" data-campo="preliminar.prototipo.norma" value="${escAttr(pr.norma)}" maxlength="300"></label>
                <label class="largo">O que medir (respostas) <textarea rows="2" data-campo="preliminar.prototipo.respostas" maxlength="1500">${esc(pr.respostas)}</textarea></label>
                <label class="largo">Como analisar <textarea rows="2" data-campo="preliminar.prototipo.analise" maxlength="1000">${esc(pr.analise)}</textarea></label>
            </div>
            <h2>4. Datas</h2>
            <div class="grade-campos">
                <label>Início <input type="date" data-campo="preliminar.prototipo.datas.inicio" value="${escAttr(pr.datas.inicio)}"></label>
                <label>Teste <input type="date" data-campo="preliminar.prototipo.datas.teste" value="${escAttr(pr.datas.teste)}"></label>
                <label>Decisão <input type="date" data-campo="preliminar.prototipo.datas.decisao" value="${escAttr(pr.datas.decisao)}"></label>
            </div>
        </section>
        <section class="card">
            <h2>Ciclo do protótipo</h2>
            <p class="nota">Se um teste <b>reprovar</b>, volte às <a href="#/p-verificacoes">verificações</a>, ajuste e repita (execução recursiva, como em Sigales, 2021 e 2025). Para achar a causa, teste ligando e desligando um suspeito por vez e anote a medida de cada combinação.</p>
            <ol class="ciclo">${pr.ciclo.map(x => `<li class="ciclo-${x.situacao || 'afazer'}"><div class="ciclo-linha">
                <b>${esc(x.etapa)}</b>
                <select data-campo="preliminar.prototipo.ciclo#${x.id}.situacao" data-rerender aria-label="Situação"><option value="">a fazer</option><option value="feito" ${x.situacao === 'feito' ? 'selected' : ''}>✓ feito / aprovado</option><option value="reprovou" ${x.situacao === 'reprovou' ? 'selected' : ''}>✗ reprovou</option></select>
                <input type="date" data-campo="preliminar.prototipo.ciclo#${x.id}.data" value="${escAttr(x.data)}" aria-label="Data"></div>
                <input type="text" data-campo="preliminar.prototipo.ciclo#${x.id}.notas" value="${escAttr(x.notas)}" maxlength="600" placeholder="resultado, medidas, o que mudou" aria-label="Notas">
                ${x.situacao === 'reprovou' ? '<a class="btn-link" href="#/p-verificacoes">Voltar às verificações →</a>' : ''}</li>`).join('')}</ol>
        </section>
        <section class="card">
            <h2>Custo do protótipo</h2>
            <p class="nota">Material: kg × preço (ou a estimativa do programa da impressora 3D). Peças compradas vêm da lista de partes. <b>Não é o custo de produção</b> (Sigales, 2025).</p>
            <div class="grade-campos custo-prot">
                <label>Potência do equipamento (W) <input type="text" inputmode="decimal" data-campo="preliminar.prototipo.custo.potenciaW" data-tipo="num" data-rerender value="${pr.custo.potenciaW ?? ''}"></label>
                <label>Horas de uso <input type="text" inputmode="decimal" data-campo="preliminar.prototipo.custo.horas" data-tipo="num" data-rerender value="${pr.custo.horas ?? ''}"></label>
                <label>Tarifa (R$/kWh) <input type="text" inputmode="decimal" data-campo="preliminar.prototipo.custo.tarifa" data-tipo="num" data-rerender value="${pr.custo.tarifa ?? ''}" placeholder="da conta de luz"></label>
                <label>Material (kg) <input type="text" inputmode="decimal" data-campo="preliminar.prototipo.custo.kg" data-tipo="num" data-rerender value="${pr.custo.kg ?? ''}"></label>
                <label>Preço do material (R$/kg) <input type="text" inputmode="decimal" data-campo="preliminar.prototipo.custo.precoKg" data-tipo="num" data-rerender value="${pr.custo.precoKg ?? ''}"></label>
                <label>Outros (R$) <input type="text" inputmode="decimal" data-campo="preliminar.prototipo.custo.outros" data-tipo="num" data-rerender value="${pr.custo.outros ?? ''}"></label>
            </div>
            <p class="custo-resumo">Energia ${reais(c.energia)} + material ${reais(c.material)} + peças compradas ${reais(c.compradas)} + outros ${reais(c.outros)} = <b>${reais(c.total)}</b></p>
        </section>`;
    }
};

// ---------------------------------------------------------------- P6 adequação às especificações

PAGINAS['p-adequacao'] = {
    titulo: 'Adequação às especificações',
    sub: 'Para cada especificação: o valor obtido e se atende (ok), não atende (x) ou ainda não foi avaliada (?), com o motivo — como nas Tabelas 9 de Sigales (2021) e 21 de Sigales (2025).',
    render(p) {
        if (!concepcaoEscolhida(p)) return htmlSemConcepcao();
        garantirPreliminar(p);
        const pl = p.preliminar, esp = especsUsadas(p), t = tercosEspec(p);
        const cont = { ok: 0, x: 0, '?': 0 };
        esp.forEach(e => { const s = (pl.adequacao[e.id] || {}).estado || '?'; cont[s] = (cont[s] || 0) + 1; });
        return `${htmlTopoPreliminar(p, 'p-adequacao')}
        <section class="card">
            <div class="resumo-adeq"><span class="adeq-ok">ok ${cont.ok}</span><span class="adeq-x">x ${cont.x}</span><span class="adeq-q">? ${cont['?']}</span></div>
            <p class="nota">Ao digitar o valor, o resultado é calculado pela meta (tolerância de 5% em "="). Prefira atender primeiro o <b>terço superior</b>.</p>
            <div class="tabela-rolagem"><table class="tabela tabela-adeq"><thead><tr><th>Especificação</th><th>Meta</th><th>Como avaliar</th><th>Valor obtido</th><th>Resultado</th><th>Motivo (se ? ou x)</th></tr></thead><tbody>
            ${esp.map(e => { const a = pl.adequacao[e.id] || {}; return `<tr class="adeq-${a.estado === 'ok' ? 'ok' : a.estado === 'x' ? 'x' : 'q'}"><td data-rotulo="Especificação">${esc(e.descricao)}${seloTerco(p, e)}</td><td data-rotulo="Meta" class="col-meta">${esc(e.meta || '')}</td><td data-rotulo="Como avaliar" class="pequeno">${esc(e.avaliacao || '')}</td>
                <td data-rotulo="Valor obtido"><input type="text" data-campo="preliminar.adequacao.${e.id}.valor" data-acao-mudar="pl-adeq-valor" data-id="${e.id}" value="${escAttr(a.valor || '')}" maxlength="60" aria-label="Valor obtido" style="width:7rem"></td>
                <td data-rotulo="Resultado"><select data-campo="preliminar.adequacao.${e.id}.estado" data-rerender aria-label="Resultado">${Object.entries(ESTADOS_ADEQ).map(([k, tx]) => `<option value="${k}" ${(a.estado || '?') === k ? 'selected' : ''}>${tx}</option>`).join('')}</select></td>
                <td data-rotulo="Motivo">${a.estado === 'ok' ? '' : `<select data-campo="preliminar.adequacao.${e.id}.motivo" data-rerender aria-label="Motivo"><option value="">—</option>${MOTIVOS_ADEQ.map(m => `<option ${a.motivo === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>`}</td></tr>`; }).join('')}</tbody></table></div>
            ${dica('<p>Compare também com um produto comercial medido no <b>mesmo</b> teste (os concorrentes do QFD estão em Princípios). Especificação herdada de outro tipo de produto pode não fazer sentido: marque "Contradiz a física" e reveja no QFD.</p>', 'Dicas')}
        </section>`;
    }
};

// ---------------------------------------------------------------- relatório

function htmlRelatorioPreliminar(p, img) {
    const pl = p.preliminar;
    if (!pl || !pl.iniciado) return '';
    const est = estDoP(p), t = tercosEspec(p), esp = especsUsadas(p);
    const nomeF = id => { const f = est && est.nos.find(n => n.id === id); return f ? `F${numeroFuncao(est, f.id)} ${f.nome}` : ''; };
    const lt = pl.leiautes.find(l => l.id === pl.leiauteEscolhido);
    const resp = o => `${RESPOSTAS_CHECK[(o || {}).r] || '—'}${(o || {}).acao ? ' — ' + esc(o.acao) : ''}`;
    return `<h3>Requisitos determinantes e restrições</h3><ul>${esp.filter(e => pl.determinantes[e.id]).map(e => `<li>${esc(e.descricao)}${e.meta ? ' (' + esc(e.meta) + ')' : ''}</li>`).join('')}</ul>
        <p>Espaço disponível: ${esc([pl.envelope.c, pl.envelope.l, pl.envelope.a].map(x => x || '?').join(' × '))} mm. ${esc(pl.envelope.obs)}</p>
        ${pl.interfaces.length ? `<table><thead><tr><th>Interface / restrição</th><th>Valor</th></tr></thead><tbody>${pl.interfaces.map(i => `<tr><td>${esc(i.texto)}</td><td>${esc(i.medida)}</td></tr>`).join('')}</tbody></table>` : ''}
        <h3>Portadores de efeito físico</h3><table><thead><tr><th>Função</th><th>Portador</th><th>Papel</th><th>Parâmetro</th></tr></thead><tbody>
        ${pl.portadores.filter(x => x.papel !== 'auxiliar').map(x => `<tr><td>${esc(nomeF(x.funcId))}</td><td>${esc(x.nome)}</td><td>${esc(PAPEIS[x.papel])}</td><td>${esc(x.parametro)}</td></tr>`).join('')}</tbody></table>
        <h3>Leiautes</h3><table><thead><tr><th>Leiaute</th><th>Arranjo</th><th>Dimensões</th><th>Massa</th><th>Técnico</th><th>Econômico</th></tr></thead><tbody>
        ${avaliarLeiautes(p).map((a, i) => { const l = pl.leiautes[i]; return `<tr class="${l.id === pl.leiauteEscolhido ? 'melhor' : ''}"><td>${esc(l.nome)}${l.id === pl.leiauteEscolhido ? ' ★' : ''}</td><td>${esc(l.arranjo)}</td><td>${esc(l.dimensoes)}</td><td>${esc(l.massa)}</td><td class="num">${a.tec === null ? '—' : a.tec.toFixed(2)}</td><td class="num">${a.eco === null ? '—' : a.eco.toFixed(2)}</td></tr>`; }).join('')}</tbody></table>
        ${lt && lt.imagem && img ? `<figure>${img(lt.imagem, lt.nome)}<figcaption>${esc(lt.nome)}</figcaption></figure>` : ''}
        <h3>Diretrizes (regras básicas e DfX)</h3><table><tbody>${diretrizesDoTipo(p).map(([k, n]) => `<tr><td>${esc(n)}</td><td>${resp(pl.diretrizes[k])}</td></tr>`).join('')}</tbody></table>
        <h3>Lista de verificação (Reis, 2003, Quadro 4.4)</h3><table><tbody>${VERIFICACAO.map(([k, n]) => `<tr><td>${esc(n)}</td><td>${resp(pl.verificacao[k])}</td></tr>`).join('')}</tbody></table>
        <h3>Lista de partes preliminar</h3><table><thead><tr><th>Peça</th><th>Qtd.</th><th>Origem</th><th>Material / processo</th><th>Fornecedor</th><th>Total</th></tr></thead><tbody>
        ${pl.portadores.map(x => `<tr><td>${esc(x.nome)}</td><td class="num">${x.qtd ?? 1}</td><td>${esc(ORIGENS_PECA[x.origem])}</td><td>${esc([x.material, x.processo].filter(Boolean).join(' · '))}</td><td>${esc(x.fornecedor)}</td><td class="num">${x.custo !== null && x.custo !== '' ? reais(+x.custo * (+x.qtd || 1)) : '—'}</td></tr>`).join('')}
        <tr><td colspan="5"><b>Total</b></td><td class="num"><b>${reais(custoLista(p))}</b></td></tr></tbody></table>
        <h3>Protótipo</h3><p>Para: ${esc(pl.prototipo.proposito.map(k => PROPOSITOS[k]).join('; ') || '—')}. Variáveis: ${esc(pl.prototipo.variaveis || '—')}. Norma: ${esc(pl.prototipo.norma || '—')}. Respostas: ${esc(pl.prototipo.respostas || '—')}. Análise: ${esc(pl.prototipo.analise || '—')}.</p>
        <table><thead><tr><th>Etapa</th><th>Data</th><th>Situação</th><th>Notas</th></tr></thead><tbody>${pl.prototipo.ciclo.map(x => `<tr><td>${esc(x.etapa)}</td><td>${esc(x.data)}</td><td>${x.situacao === 'feito' ? 'feito' : x.situacao === 'reprovou' ? '<span class="nok">reprovou</span>' : 'a fazer'}</td><td>${esc(x.notas)}</td></tr>`).join('')}</tbody></table>
        <p>Custo do protótipo: ${reais(custoPrototipo(p).total)} (não é o custo de produção).</p>
        <h3>Adequação às especificações</h3><table><thead><tr><th>Especificação</th><th>Terço</th><th>Meta</th><th>Obtido</th><th>Resultado</th><th>Motivo</th></tr></thead><tbody>
        ${esp.map(e => { const a = pl.adequacao[e.id] || {}; return `<tr><td>${esc(e.descricao)}</td><td>${esc({ superior: 'superior', medio: 'médio', inferior: 'inferior' }[t[e.id]] || '')}</td><td>${esc(e.meta)}</td><td>${esc(a.valor || '')}</td><td class="centro">${a.estado === 'ok' ? '<span class="ok">ok</span>' : a.estado === 'x' ? '<span class="nok">x</span>' : '?'}</td><td>${a.estado === 'ok' ? '' : esc(a.motivo || '')}</td></tr>`; }).join('')}</tbody></table>
        <p><i>ok — atendido; x — não atendido; ? — ainda não avaliado.</i></p>`;
}

// ---------------------------------------------------------------- ações

const acharPt = id => PC.p.preliminar.portadores.find(x => x.id === id);
const acharLt = id => PC.p.preliminar.leiautes.find(x => x.id === id);
async function imagemPara(obj, campo, b, legenda) {
    const arq = b.dataset.desenho ? await abrirEsboco(legenda) : await escolherArquivo(b.dataset.cam ? '#arq-camera' : '#arq-imagem');
    if (!arq) return;
    const id = await Imagens.salvar(arq, legenda);
    if (obj[campo]) await Imagens.apagar(obj[campo]);
    obj[campo] = id; salvar(); renderPagina(true);
}
async function apagarImagem(obj, campo) { if (obj[campo]) await Imagens.apagar(obj[campo]); obj[campo] = null; salvar(); renderPagina(true); }

Object.assign(ACOES, {
    'ir-ia-prelim': () => {
        location.hash = '#/p-requisitos';
        setTimeout(() => { const c = $('#ia-prelim'); if (c) { c.querySelector('details').open = true; c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 250);
    },
    'pl-det-sugerir': () => { const pl = PC.p.preliminar; let n = 0; especsUsadas(PC.p).filter(ehDeterminante).forEach(e => { if (!pl.determinantes[e.id]) { pl.determinantes[e.id] = true; n++; } }); salvar(); renderPagina(true); avisar(n ? `${n} marcada(s).` : 'Nenhuma sugestão nova.'); },
    'pl-if-sug': b => { PC.p.preliminar.interfaces.push({ id: uid('if'), texto: b.dataset.texto, medida: '' }); salvar(); renderPagina(true); },
    'pl-if-add': () => { PC.p.preliminar.interfaces.push({ id: uid('if'), texto: '', medida: '' }); salvar(); renderPagina(true); },
    'pl-if-del': b => { PC.p.preliminar.interfaces = PC.p.preliminar.interfaces.filter(x => x.id !== b.dataset.id); salvar(); renderPagina(true); },
    'pl-esb': b => imagemPara(PC.p.preliminar, 'esbocoRestricoes', b, 'Restrições em escala'),
    'pl-esb-desenho': b => { b.dataset.desenho = '1'; return imagemPara(PC.p.preliminar, 'esbocoRestricoes', b, 'Restrições em escala'); },
    'pl-esb-del': () => apagarImagem(PC.p.preliminar, 'esbocoRestricoes'),
    'pl-pt-img': b => imagemPara(acharPt(b.dataset.id), 'imagem', b, acharPt(b.dataset.id).nome),
    'pl-pt-img-desenho': b => { b.dataset.desenho = '1'; return imagemPara(acharPt(b.dataset.id), 'imagem', b, acharPt(b.dataset.id).nome); },
    'pl-pt-img-del': b => apagarImagem(acharPt(b.dataset.id), 'imagem'),
    'pl-pt-del': b => { const x = acharPt(b.dataset.id); if (x && x.nome && !confirm(`Excluir "${x.nome}"?`)) return; PC.p.preliminar.portadores = PC.p.preliminar.portadores.filter(y => y.id !== b.dataset.id); salvar(); renderPagina(true); },
    'pl-refazer-portadores': () => { const p = PC.p; p.preliminar.portadores = p.preliminar.portadores.filter(x => x.papel === 'auxiliar'); const f = preencherPreliminar(p); salvar(); renderPagina(true); avisar(f.join('; ') || 'Nada a criar.'); },
    'pl-lt-add': () => { const L = PC.p.preliminar.leiautes; L.push({ id: uid('lt'), nome: `Leiaute ${String.fromCharCode(65 + L.length)}`, arranjo: ARRANJOS[L.length % ARRANJOS.length], dimensoes: '', massa: '', imagem: null, obs: '', notas: {}, custo: null }); salvar(); renderPagina(true); },
    'pl-lt-del': b => { const pl = PC.p.preliminar, l = acharLt(b.dataset.id); if (!confirm(`Excluir "${l.nome}"?`)) return; pl.leiautes = pl.leiautes.filter(x => x.id !== l.id); if (pl.leiauteEscolhido === l.id) pl.leiauteEscolhido = null; salvar(); renderPagina(true); },
    'pl-lt-img': b => imagemPara(acharLt(b.dataset.id), 'imagem', b, acharLt(b.dataset.id).nome),
    'pl-lt-img-desenho': b => { b.dataset.desenho = '1'; return imagemPara(acharLt(b.dataset.id), 'imagem', b, `Leiaute em escala: ${acharLt(b.dataset.id).nome}`); },
    'pl-lt-img-del': b => apagarImagem(acharLt(b.dataset.id), 'imagem'),
    'pl-lt-escolher': b => { PC.p.preliminar.leiauteEscolhido = b.dataset.id; salvar(); renderPagina(true); avisar('Leiaute escolhido. Siga para as funções auxiliares e diretrizes.'); },
    'pl-lt-notas': () => {
        const p = PC.p, v = concepcaoEscolhida(p), base = (p.selecao.final.notas || {})[v ? v.id : ''] || {};
        let n = 0;
        p.preliminar.leiautes.forEach(l => especsUsadas(p).filter(e => !e.ehCusto).forEach(e => { if (!l.notas[e.id] && base[e.id]) { l.notas[e.id] = base[e.id]; n++; } }));
        salvar(); renderPagina(true); avisar(n ? `${n} nota(s) copiada(s) da avaliação final da concepção. Ajuste o que mudou em cada leiaute.` : 'Sem notas para copiar: faça a avaliação final na Seleção ou dê as notas aqui.');
    },
    'pl-aux-sug': b => {
        const c = typeof acharComponente === 'function' ? acharComponente(b.dataset.solucao) : null;
        PC.p.preliminar.portadores.push({ id: uid('pt'), funcId: '', principioId: '', nome: b.dataset.solucao, papel: 'auxiliar', funcaoAux: b.dataset.funcao, parametro: c ? c.especificacao : '', material: '', processo: '', origem: 'comprado', fornecedor: c ? c.fornecedor : '', qtd: 1, custo: c ? c.preco : null, imagem: null });
        salvar(); renderPagina(true);
    },
    'pl-aux-add': () => { PC.p.preliminar.portadores.push({ id: uid('pt'), funcId: '', principioId: '', nome: '', papel: 'auxiliar', funcaoAux: '', parametro: '', material: '', processo: '', origem: 'comprado', fornecedor: '', qtd: 1, custo: null, imagem: null }); salvar(); renderPagina(true); },
    'pl-peca-add': () => { PC.p.preliminar.portadores.push({ id: uid('pt'), funcId: '', principioId: '', nome: '', papel: 'demais', parametro: '', material: '', processo: '', origem: 'fabricado', fornecedor: '', qtd: 1, custo: null, imagem: null }); salvar(); renderPagina(true); },
    'pl-proposito': b => { const pr = PC.p.preliminar.prototipo, k = b.dataset.k; pr.proposito = pr.proposito.includes(k) ? pr.proposito.filter(x => x !== k) : pr.proposito.concat(k); salvar(); renderPagina(true); },
    'pl-ensaio-dosador': () => {
        const pr = PC.p.preliminar.prototipo, campos = ['norma', 'variaveis', 'respostas', 'analise'];
        if (campos.some(c => pr[c] && pr[c] !== MODELO_ENSAIO_DOSADOR[c]) && !confirm('Substituir norma, variáveis, respostas e análise pelo modelo de ensaio de dosador?')) return;
        campos.forEach(c => { pr[c] = MODELO_ENSAIO_DOSADOR[c]; }); salvar(); renderPagina(true);
    }
});

/** Ao escolher uma peça do banco, completa especificação, fornecedor e preço vazios. Ao digitar o valor obtido, calcula ok/x. */
document.addEventListener('change', e => {
    const el = e.target;
    if (!el.dataset || !el.dataset.acaoMudar) return;
    const p = PC.p;
    if (el.dataset.acaoMudar === 'pl-comp') {
        const x = acharPt(el.dataset.id), c = typeof acharComponente === 'function' ? acharComponente(el.value) : null;
        if (!x || !c) return;
        if (!x.parametro) x.parametro = c.especificacao;
        if (!x.fornecedor) x.fornecedor = c.fornecedor;
        if ((x.custo === null || x.custo === '') && c.preco !== null) x.custo = c.preco;
        if (c.tipo === 'componente') x.origem = 'comprado';
        salvar(); renderPagina(true);
    } else if (el.dataset.acaoMudar === 'pl-adeq-valor') {
        const e2 = p.especificacoes.find(s => s.id === el.dataset.id), a = p.preliminar.adequacao[el.dataset.id] || (p.preliminar.adequacao[el.dataset.id] = {});
        a.valor = el.value;
        const r = atendeMeta(e2, el.value);
        if (r !== null) { a.estado = r ? 'ok' : 'x'; if (r) a.motivo = ''; }
        salvar(); renderPagina(true);
    }
});
