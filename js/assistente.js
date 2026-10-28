/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * PREENCHIMENTO AUTOMÁTICO: monta um rascunho de todas as etapas a partir do que veio do QFD, para o usuário
 * só revisar. Nunca apaga nem troca o que já foi preenchido; só completa o que está vazio.
 */

'use strict';

/** Fluxos genéricos da função global por tipo de projeto (só entram se a função global não tiver nenhum). */
const FLUXOS_PADRAO = {
    mecanico: { entradas: { energia: ['Energia de acionamento'], material: ['Carga / objeto a processar'], sinal: ['Comando do operador'] }, saidas: { energia: ['Movimento útil', 'Perdas (calor, ruído)'], material: ['Objeto processado'], sinal: ['Indicação ao operador'] } },
    eletrico: { entradas: { energia: ['Energia elétrica da fonte'], material: [], sinal: ['Comando de liga/desliga'] }, saidas: { energia: ['Energia para a carga', 'Calor dissipado'], material: [], sinal: ['Indicação de estado', 'Medida de consumo'] } },
    automacao: { entradas: { energia: ['Energia elétrica'], material: ['Processo monitorado'], sinal: ['Comando / setpoint do usuário', 'Grandeza do processo'] }, saidas: { energia: ['Ação do atuador'], material: ['Processo controlado'], sinal: ['Dados e alarmes'] } },
    agricola: { entradas: { energia: ['Potência do trator'], material: ['Insumo', 'Solo'], sinal: ['Regulagem do operador'] }, saidas: { energia: ['Perdas por atrito'], material: ['Insumo depositado', 'Solo trabalhado'], sinal: ['Indicação de funcionamento'] } },
    misto: { entradas: { energia: ['Energia elétrica', 'Energia mecânica'], material: ['Material a processar'], sinal: ['Comando do usuário'] }, saidas: { energia: ['Movimento útil', 'Calor dissipado'], material: ['Material processado'], sinal: ['Dados e indicações'] } }
};

/** Modelo de estrutura usado quando o QFD traz poucas funções. */
const MODELO_DO_TIPO = { mecanico: ['mecanico'], eletrico: ['eletrico'], automacao: ['automacao'], agricola: ['agricola'], misto: ['mecanico', 'automacao'] };

/**
 * Preenche tudo o que der. Devolve a lista do que foi feito: [{ etapa, texto }] (para o usuário revisar).
 */
function preencherTudo(p) {
    const feito = [];
    const anota = (etapa, texto) => feito.push({ etapa, texto });

    // tipo de projeto
    if (!p.tipoProjeto) { p.tipoProjeto = detectarTipoProjeto(p); anota('escopo', `Tipo de projeto estimado: ${TIPOS_PROJETO[p.tipoProjeto].nome} (troque no Início se não for).`); }

    // 1 escopo
    let nAbs = 0;
    p.abstracao = p.abstracao.map((t, i) => { if (t.trim()) return t; const s = textoAbstracaoSugerido(p, i); if (s) nAbs++; return s; });
    if (nAbs) anota('escopo', `${nAbs} passo(s) da abstração orientada escritos a partir das especificações.`);
    if (!p.formulacao.trim() && (p.abstracao[4] || p.funcaoGlobal.nome)) { p.formulacao = p.abstracao[4] || p.funcaoGlobal.nome; anota('escopo', 'Formulação do problema copiada do passo 5 da abstração.'); }
    let nFun = 0;
    p.especificacoes.forEach(e => { if (!e.funcao) { const f = sugerirFuncaoDaEspec(e); if (f) { e.funcao = f; nFun++; } } });
    if (nFun) anota('escopo', `${nFun} especificação(ões) ganharam uma função relacionada.`);

    // 2 função global
    const fg = p.funcaoGlobal;
    if (!fg.nome.trim() && p.formulacao.trim()) { fg.nome = p.formulacao.trim(); anota('funcao-global', 'Função global = formulação do problema.'); }
    const semFluxo = ['entradas', 'saidas'].every(l => Object.values(fg[l]).every(x => !x.length));
    if (semFluxo) {
        const pad = FLUXOS_PADRAO[p.tipoProjeto] || FLUXOS_PADRAO.mecanico;
        ['entradas', 'saidas'].forEach(l => Object.keys(TIPOS_FLUXO).forEach(t => { fg[l][t] = pad[l][t].slice(); }));
        anota('funcao-global', 'Entradas e saídas genéricas do tipo de projeto (troque pelos fluxos reais).');
    }

    // 3 estrutura funcional
    const funcsEspec = [...new Set(p.funcoesQFD.concat(p.especificacoes.map(e => (e.funcao || '').trim())).filter(Boolean))];
    if (!p.estruturas.length) {
        p.estruturas.push(montarEstruturaInicial(p, []));
        p.estruturaEscolhida = p.estruturas[0].id;
        anota('estrutura', 'Estrutura 1 criada com a função global, os blocos laterais e os fluxos da caixa-preta.');
    }
    const est = PC.estrutura ? (p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0]) : p.estruturas[0];
    const g = noGlobal(est);
    if (g && !funcoesFilhas(est, g.id).length) {
        if (funcsEspec.length) { acrescentarFuncoes(est, g.id, funcsEspec); anota('estrutura', `${funcsEspec.length} função(ões) vindas do QFD e das especificações.`); }
        if (funcoesFilhas(est, g.id).length < 3) {
            (MODELO_DO_TIPO[p.tipoProjeto] || ['mecanico']).forEach(k => aplicarModelo(est, g.id, k));
            anota('estrutura', `Funções do modelo "${(MODELO_DO_TIPO[p.tipoProjeto] || ['mecanico']).map(k => MODELOS_ESTRUTURA[k].nome).join('" e "')}" acrescentadas e ligadas.`);
        }
        const principal = ['material', 'energia', 'sinal'].find(t => fg.entradas[t].length) || 'material';
        encadearFuncoes(est, g.id, principal);
        organizarNivel(est, g.id);
        anota('estrutura', 'Funções ligadas em sequência e aos fluxos da fronteira (rascunho: confira as setas).');
    }
    // desdobramento especificação → função
    p.especificacoes.forEach(e => { if (!lista(e.funcoesIds).length) e.funcoesIds = funcoesDaEspec(est, e).map(n => n.id); });

    // 4 princípios: ideias do QFD + catálogo
    const folhas = funcoesFolha(est);
    let nIdeia = 0, nCat = 0;
    p.ideiasQFD.forEach(ide => {
        const alvo = ide.especIds.map(id => p.especificacoes.find(e => e.id === id)).filter(Boolean)
            .flatMap(e => funcoesDaEspec(est, e)).flatMap(f => funcoesFilhas(est, f.id).length ? folhasDe(est, f.id) : [f]);
        [...new Set(alvo)].forEach(f => {
            const l = principiosDe(p, f.id);
            if (l.some(x => semAcento(x.nome) === semAcento(ide.titulo))) return;
            l.push({ id: uid('pr'), nome: ide.titulo, descricao: ide.descricao, imagem: null, metodo: 'Brainstorming', sugerido: true, origem: 'qfd', maturidade: '', concorrentes: [], fonte: 'Caderno de ideias do QFD', imagemUrl: '', vantagens: '', desvantagens: '' });
            nIdeia++;
        });
    });
    let nBib = 0;
    if (typeof sugerirDaBiblioteca === 'function') folhas.forEach(f => {
        const l = principiosDe(p, f.id);
        sugerirDaBiblioteca(f.nome, 3).forEach(i => {
            if (l.some(x => semAcento(x.nome) === semAcento(i.nome))) return;
            l.push({ id: uid('pr'), nome: i.nome, descricao: i.descricao, imagem: null, metodo: i.metodo || 'Análise de sistemas técnicos existentes', sugerido: true, origem: 'biblioteca', maturidade: i.maturidade, custo: i.custo, custoValor: null, concorrentes: i.concorrentes || [], fonte: i.fonte || '', imagemUrl: '', vantagens: '', desvantagens: '' });
            nBib++;
        });
    });
    if (nBib) anota('principios', `${nBib} princípio(s) da biblioteca da equipe (projetos anteriores).`);
    folhas.forEach(f => {
        const l = principiosDe(p, f.id);
        if (l.length >= 3) return;
        sugerirPrincipios(f.nome, 4).forEach(s => {
            if (l.length >= 4 || l.some(x => semAcento(x.nome) === semAcento(s.nome))) return;
            l.push({ id: uid('pr'), nome: s.nome, descricao: s.descricao, imagem: null, metodo: 'Catálogo de projeto', sugerido: true, origem: 'catalogo', maturidade: 'mercado', concorrentes: [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' });
            nCat++;
        });
    });
    if (nIdeia) anota('principios', `${nIdeia} ideia(s) do caderno de ideias do QFD viraram princípios.`);
    if (nCat) anota('principios', `${nCat} princípio(s) do catálogo. Para pesquisar mais (concorrentes, patentes), use o pacote para IA.`);
    const semPrincipio = folhas.filter(f => !principiosDe(p, f.id).length);
    if (semPrincipio.length) anota('principios', `Sem sugestão para: ${semPrincipio.map(f => f.nome).join('; ')} — preencha à mão ou com a IA.`);

    // 5 matriz: 3 concepções diferentes
    if (!p.variantes.length && folhas.length && folhas.every(f => principiosDe(p, f.id).length)) {
        const cs = combinacoesDiversas(gerarCombinacoes(p, est, 400), 3);
        const nomes = ['Mais simples', 'Alternativa', 'Inovadora'];
        cs.forEach((c, i) => { const v = novaVariante(p, c.escolhas); v.nome = nomes[i] || v.nome; });
        if (cs.length) anota('matriz', `${cs.length} concepção(ões) montadas automaticamente, bem diferentes entre si.`);
    }

    // 6 seleção: perguntas e critérios das necessidades
    if (!p.selecao.passa.perguntas.length && p.necessidades.length) { p.selecao.passa.perguntas = p.necessidades.map(n => ({ id: uid('pp'), texto: perguntaDaNecessidade(n.descricao) })); anota('selecao', 'Perguntas do passa/não passa geradas das necessidades.'); }
    if (!p.selecao.avaliacao.criterios.length && p.necessidades.length) { p.selecao.avaliacao.criterios = p.necessidades.map(n => ({ id: uid('cr'), texto: n.descricao, peso: Math.round((n.peso || 0) * 1000) / 10 || 1 })); anota('selecao', 'Critérios da matriz de avaliação com os pesos do QFD.'); }

    if (feito.length) p.ultimoPreenchimento = { em: new Date().toISOString(), itens: feito };
    return feito;
}

/** Funções elementares abaixo de uma função. */
function folhasDe(est, id) {
    const fs = funcoesFilhas(est, id);
    return fs.length ? fs.flatMap(f => folhasDe(est, f.id)) : [est.nos.find(n => n.id === id)];
}
