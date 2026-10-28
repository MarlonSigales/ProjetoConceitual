/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * ============================================================================
 * PROJETO CONCEITUAL — MODELO DE DADOS, ARMAZENAMENTO E CÁLCULOS
 * ============================================================================
 *
 * Roteiro do projeto conceitual de Spagnolo (2011, Fig. 11), com base em Pahl et al. (2005)
 * e Reis (2003):
 *   1 Verificar o escopo do problema (especificações, restrições, abstração orientada)
 *   2 Estabelecer a estrutura funcional (função global, estruturas alternativas, seleção — Ferreira, 1997)
 *   3 Pesquisar princípios de solução (métodos convencionais, intuitivos e discursivos — Quadro 1)
 *   4 Combinar princípios de solução (matriz morfológica)
 *   5 Selecionar e avaliar concepções (viabilidade, tecnologia, passa/não passa, matriz de avaliação)
 *   6 Evoluir a concepção selecionada
 *
 * O projeto fica no navegador (localStorage); as fotos e esboços ficam no IndexedDB e vão no ZIP.
 */

'use strict';

const PC_VERSAO = 2;
const PC_CHAVE = 'pc_projeto';

const TIPOS_FLUXO = { energia: 'Energia', material: 'Material', sinal: 'Sinal' };
const TIPOS_NO = { funcao: 'Função', externo: 'Bloco lateral (externo)' };

/** Tipo de projeto: muda o catálogo, os modelos de estrutura e os fluxos sugeridos. */
const TIPOS_PROJETO = {
    mecanico: { nome: 'Mecânico', icone: '⚙', exemplo: 'máquina, mecanismo, estrutura, roda' },
    eletrico: { nome: 'Elétrico', icone: '⚡', exemplo: 'quadro elétrico, energia solar, motor, instalação' },
    automacao: { nome: 'Automação / eletrônico', icone: '🔌', exemplo: 'sensores, controlador, IoT, embarcado' },
    agricola: { nome: 'Máquina agrícola', icone: '🌱', exemplo: 'semeadora, pulverizador, colhedora, secador' },
    misto: { nome: 'Misto (mecânico + elétrico + automação)', icone: '🧩', exemplo: 'máquina com motor elétrico e controle' }
};

/** Maturidade do princípio de solução (alimenta a análise de TRL no Gestão de Projetos). */
const MATURIDADES = {
    mercado: { nome: 'Existe pronto no mercado', trl: '7 a 9', cor: '#409580' },
    adaptar: { nome: 'Existe, mas precisa adaptar', trl: '4 a 6', cor: '#d4a017' },
    desenvolver: { nome: 'Precisa ser desenvolvido', trl: '1 a 3', cor: '#c0392b' }
};
/** Custo relativo do princípio (quando não se sabe o valor em R$). */
const CUSTOS = { baixo: { nome: 'Barato', peso: 1 }, medio: { nome: 'Médio', peso: 5 }, alto: { nome: 'Caro', peso: 10 } };
const ORIGENS_PRINCIPIO = { manual: 'equipe', catalogo: 'catálogo', ia: 'IA', qfd: 'ideia do QFD', biblioteca: 'biblioteca' };

/** Quadro 1 — métodos de busca por princípios de solução (Reis, 2003, apud Spagnolo, 2011) */
const METODOS_BUSCA = {
    convencionais: { rotulo: 'Convencionais', itens: ['Pesquisa bibliográfica', 'Análise de sistemas naturais', 'Análise de sistemas técnicos existentes', 'Analogias', 'Medições e testes em modelos'] },
    intuitivos: { rotulo: 'Intuitivos', itens: ['Brainstorming', 'Método 635', 'Método Delphi', 'Sinergia', 'Analogia direta', 'Analogia simbólica', 'Combinação de métodos'] },
    discursivos: { rotulo: 'Discursivos', itens: ['Estudo sistemático de sistemas técnicos', 'Esquemas de classificação', 'Catálogo de projeto', 'TRIZ', 'Matriz morfológica'] }
};

/** Passos da abstração orientada (Pahl et al., 2005, como em Spagnolo, 2011, 5.2.1) */
const PASSOS_ABSTRACAO = [
    'Omitir preferências pessoais',
    'Omitir requisitos sem relação direta com a função e com as restrições essenciais',
    'Transformar informações quantitativas em qualitativas e reduzi-las ao essencial',
    'Generalizar os requisitos do passo anterior',
    'Formular o problema sem inclusão de solução'
];

/** Diretrizes para a estrutura funcional (Back et al., 2008) e para variá-la (Pahl et al., 2005) */
const DIRETRIZES_ESTRUTURA = [
    'Decompor a função global em funções parciais identificadas nas especificações ou nas interfaces; cada declaração com um verbo e um substantivo.',
    'Se uma função parcial não permitir identificar um princípio de solução, decompô-la até o nível de funções elementares.',
    'Identificar as entradas e saídas de cada bloco, indicando em cada seta se é energia, material ou sinal.',
    'Começar pelo fluxo principal e depois completar com os fluxos auxiliares.',
    'Verificar em cada nível se há princípios de solução ou módulos de outros sistemas que possam ser adaptados.',
    'Havendo estruturas alternativas, comparar cada uma com as especificações e selecionar e otimizar a melhor.'
];
const VARIACOES_ESTRUTURA = ['Dividir ou combinar as subfunções', 'Mudar a disposição de subfunções individuais', 'Variar o tipo de ligação (série ou paralelo)', 'Alterar as fronteiras do sistema',
    'Variar o arranjo do sistema: um elemento central para várias unidades, um por unidade ou vários por unidade (ex.: um dosador para várias linhas, um por linha, vários por linha — Reis, 2003)'];

/** Disponibilidade de tecnologia (Reis, 2003): perguntas padrão */
const PERGUNTAS_TECNOLOGIA = [
    'A tecnologia pode ser produzida por processos conhecidos?',
    'Os parâmetros funcionais críticos são conhecidos?',
    'A sensibilidade dos parâmetros operacionais é conhecida?',
    'Os modos de falha são conhecidos?'
];

/** Cores das concepções (variantes) na matriz morfológica */
const CORES_VARIANTES = ['#409580', '#d4a017', '#c0392b', '#2f6fb3', '#8e44ad', '#e67e22', '#16a085', '#7f8c8d'];

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function uid(pref = 'id') {
    return pref + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
}
function esc(t) {
    return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const escAttr = esc;
function semAcento(t) {
    return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
function clonar(o) { return JSON.parse(JSON.stringify(o)); }
function txt(x, max = 2000) { return String(x ?? '').slice(0, max); }
function lista(x) { return Array.isArray(x) ? x : []; }

// ============================================================================
// MODELO
// ============================================================================

function criarFluxos() { return { energia: [], material: [], sinal: [] }; }

function criarProjetoVazio() {
    return {
        schemaVersion: PC_VERSAO,
        projeto: { nome: '', cliente: '', instituicao: '', responsavel: '', equipe: [] },
        origemQFD: null,                 // { arquivo, importadoEm }
        tipoProjeto: '',                 // chave de TIPOS_PROJETO
        qfdBackup: null,                 // backup completo do QFD (vai para o Gestão de Projetos junto com as funções)
        concorrentes: [],                // { id, nome, idQFD, notas: { [necessidadeId]: 1..5 } }
        notasNosso: {},                  // notas do nosso produto atual no QFD { [necessidadeId]: 1..5 }
        referencias: [],                 // estado da técnica do QFD { id, tipo, identificacao, titulo, resumo, link }
        ideiasQFD: [],                   // caderno de ideias do QFD { id, titulo, descricao, status, especIds }
        ia: { importadoEm: '', resumo: '' },
        funcoesQFD: [],                  // requisitos "formadores de função" do QFD
        ultimoPreenchimento: null,
        baseAnterior: null,              // { nome, em } quando o projeto partiu de outro (revisão das especificações)
        preliminar: preliminarVazio(),   // fase 3 de Reis (2003): leiautes, verificações, protótipo, adequação
        fmea: [],                        // FMEA da concepção { id, funcId, modo, efeito, causa, s, o, d, acao }
        // 1 Escopo
        especificacoes: [],              // { id, codigo, descricao, sentido, meta, unidade, avaliacao, aspectos, peso, dificuldade, origem, ehCusto, funcao, funcoesIds }
        necessidades: [],                // requisitos dos clientes { id, descricao, peso }
        restricoes: [],                  // { id, texto }
        abstracao: ['', '', '', '', ''],
        formulacao: '',
        // 2 Estrutura funcional
        funcaoGlobal: { nome: '', entradas: criarFluxos(), saidas: criarFluxos() },
        estruturas: [],                  // ver criarEstrutura()
        estruturaEscolhida: null,
        diretrizes: {},                  // { indice: true } diretrizes de Back et al. aplicadas
        selecaoEstrutura: { tecnicos: {}, custos: [], notasCusto: {} }, // Ferreira (1997)
        // 3 e 4 Princípios e matriz morfológica (por estrutura escolhida, chave = id da função)
        principios: {},                  // { [funcId]: [ { id, nome, descricao, imagem, metodo, sugerido, origem, maturidade, concorrentes, fonte, imagemUrl, vantagens, desvantagens } ] }
        incompatibilidades: [],          // { id, a, b, nota }  (ids de princípios)
        variantes: [],                   // { id, nome, cor, escolhas: { [funcId]: princId }, descricao }
        // 5 Seleção (Reis, 2003)
        selecao: {
            viabilidade: {},             // { [varId]: { estado: 'viavel'|'condicional'|'nao', razao } }
            tecnologia: { perguntas: PERGUNTAS_TECNOLOGIA.map(t => ({ id: uid('pt'), texto: t })), respostas: {} },
            passa: { perguntas: [], respostas: {} },
            avaliacao: { referencia: null, criterios: [], notas: {} },
            evolucao: {},                // Reis 2.6 { [varId]: { massa, dimensoes, observacoes, imagem } }
            final: { notas: {}, participantes: '' } // Reis 2.7 { notas: { [varId]: { [especId]: 1..5 } } }
        },
        // 6 Concepção
        concepcao: { varianteId: null, descricao: '', imagens: [], complementos: [], proximosPassos: '' },
        etapasConcluidas: [],
        metadata: { criado: new Date().toISOString(), modificado: new Date().toISOString() }
    };
}

/** Estrutura de funções: nós (funções e blocos laterais) e ligações (energia, material, sinal), em níveis. */
function criarEstrutura(nome = 'Estrutura 1') {
    const global = { id: uid('fn'), tipo: 'funcao', nome: 'Função global', pai: null, x: 330, y: 150, w: 190, h: 80, descricao: '', global: true };
    return { id: uid('est'), nome, descricao: '', nos: [global], ligacoes: [], fronteira: {} };
}

/** Projeto preliminar (Reis, 2003, fase 3; Spagnolo, 2011, etapas 05–11; Sigales, 2021 e 2025). */
function preliminarVazio() {
    return {
        iniciado: false,
        determinantes: {},                       // { [especId]: true } requisitos que definem tamanho, arranjo, material (3.1.1)
        envelope: { c: '', l: '', a: '', obs: '' },
        interfaces: [],                          // { id, texto, medida } (3.1.2)
        esbocoRestricoes: null,
        portadores: [],                          // { id, funcId, principioId, nome, papel, parametro, material, processo, origem, fornecedor, qtd, custo, imagem } (3.1.3, 3.1.6, 3.2.1, 3.3.3)
        leiautes: [],                            // { id, nome, arranjo, dimensoes, massa, imagem, obs, notas: { [especId]: 1..5 }, custo } (3.1.4, 3.1.5, 3.2.4)
        leiauteEscolhido: null,
        diretrizes: {},                          // { [chave]: { r: 'sim'|'nao'|'na', acao } } (3.2.2)
        verificacao: {},                         // { [chave]: { r, acao } } (3.3.2, Quadro 4.4)
        prototipo: {
            proposito: [], aproximacao: '', abrangencia: '', variaveis: '', norma: '', respostas: '', analise: '',
            datas: { inicio: '', teste: '', decisao: '' },
            ciclo: [],                           // { id, etapa, data, situacao: ''|'feito'|'reprovou', notas, imagem }
            custo: { potenciaW: null, horas: null, tarifa: null, kg: null, precoKg: null, outros: null }
        },
        adequacao: {},                           // { [especId]: { valor, estado: 'ok'|'x'|'?', motivo } }
        fechamento: fechamentoVazio()            // 3.3.1, 3.3.3 e Spagnolo (2011), etapas 10–11
    };
}
function fechamentoVazio() {
    return {
        pontos: {},                              // { [chave]: { resolvido, acao } } pontos fracos a eliminar (3.3.1)
        incorporar: '',                          // bons pontos dos leiautes descartados
        definitivo: { descricao: '', dimensoes: '', massa: '', imagem: null },
        documentos: {},                          // { [chave]: true }
        analise: '', trabalhosFuturos: '',
        patente: { busca: false, novidade: '', decisao: '', obs: '' }
    };
}
function normalizarPreliminar(x) {
    const b = preliminarVazio();
    x = x && typeof x === 'object' ? x : {};
    const o = Object.assign(b, x);
    o.determinantes = Object.assign({}, x.determinantes || {});
    o.envelope = Object.assign(preliminarVazio().envelope, x.envelope || {});
    o.interfaces = lista(x.interfaces).map(i => Object.assign({ id: uid('if'), texto: '', medida: '' }, i));
    o.portadores = lista(x.portadores).map(i => Object.assign({ id: uid('pt'), funcId: '', principioId: '', nome: '', papel: 'demais', parametro: '', material: '', processo: '', origem: 'fabricado', fornecedor: '', qtd: 1, custo: null, imagem: null }, i));
    o.leiautes = lista(x.leiautes).map(i => Object.assign({ id: uid('lt'), nome: '', arranjo: '', dimensoes: '', massa: '', imagem: null, obs: '', custo: null }, i, { notas: Object.assign({}, i.notas || {}) }));
    o.diretrizes = Object.assign({}, x.diretrizes || {});
    o.verificacao = Object.assign({}, x.verificacao || {});
    const pr = x.prototipo || {};
    o.prototipo = Object.assign(preliminarVazio().prototipo, pr, {
        proposito: lista(pr.proposito), datas: Object.assign({ inicio: '', teste: '', decisao: '' }, pr.datas || {}),
        ciclo: lista(pr.ciclo).map(c => Object.assign({ id: uid('cy'), etapa: '', data: '', situacao: '', notas: '', imagem: null }, c)),
        custo: Object.assign(preliminarVazio().prototipo.custo, pr.custo || {})
    });
    o.adequacao = Object.assign({}, x.adequacao || {});
    const f = x.fechamento || {};
    o.fechamento = Object.assign(fechamentoVazio(), f, {
        pontos: Object.assign({}, f.pontos || {}), documentos: Object.assign({}, f.documentos || {}),
        definitivo: Object.assign(fechamentoVazio().definitivo, f.definitivo || {}), patente: Object.assign(fechamentoVazio().patente, f.patente || {})
    });
    return o;
}

const REVISOES_ESPEC = { mantida: 'Mantida', alterada: 'Alterada', nova: 'Nova', removida: 'Retirada' };

/**
 * Parte de um projeto anterior (como na dissertação, que partiu das especificações e da matriz morfológica de Reis, 2003):
 * mantém especificações, funções, princípios e concepções; zera a escolha final, a evolução e o FMEA; marca cada
 * especificação como "mantida" para a equipe de especialistas revisar.
 */
function projetoAPartirDe(anterior) {
    const n = normalizarProjeto(JSON.parse(JSON.stringify(anterior)));
    n.baseAnterior = { nome: anterior.projeto && anterior.projeto.nome || 'projeto anterior', em: new Date().toISOString().slice(0, 10) };
    n.projeto.nome = `${n.baseAnterior.nome} — nova versão`;
    n.especificacoes.forEach(e => { e.revisao = 'mantida'; });
    n.selecao.evolucao = {}; n.selecao.final = { notas: {}, participantes: '' };
    n.concepcao.varianteId = null;
    n.fmea = [];
    n.metadata.created = new Date().toISOString();
    return n;
}

/** Terço de importância de cada especificação (ordem pelo peso): superior, médio ou inferior — como em Reis (2003) e Sigales (2021). */
function tercosEspec(p) {
    const ativas = p.especificacoes.filter(e => e.revisao !== 'removida').slice().sort((a, b) => (+b.peso || 0) - (+a.peso || 0));
    const n = ativas.length, out = {};
    ativas.forEach((e, i) => { out[e.id] = i < Math.ceil(n / 3) ? 'superior' : i < Math.ceil(2 * n / 3) ? 'medio' : 'inferior'; });
    return out;
}
function seloTerco(p, e) {
    const t = tercosEspec(p)[e.id];
    return t ? `<span class="selo-terco terco-${t}" title="Terço ${t === 'medio' ? 'médio' : t} de importância">${t === 'superior' ? 'sup.' : t === 'medio' ? 'méd.' : 'inf.'}</span>` : '';
}

/** Completa campos ausentes sem apagar nada (projetos antigos, importados ou corrompidos). */
function normalizarProjeto(p) {
    const base = criarProjetoVazio();
    p = p && typeof p === 'object' ? p : {};
    const out = Object.assign(base, p);
    out.projeto = Object.assign(base.projeto, p.projeto || {});
    out.projeto.equipe = lista(out.projeto.equipe).map(x => txt(x, 120));
    out.especificacoes = lista(p.especificacoes).map(e => Object.assign({ id: uid('es'), codigo: '', descricao: '', sentido: 'none', meta: '', unidade: '', avaliacao: '', aspectos: '', peso: 0, dificuldade: null, origem: 'manual', ehCusto: false, funcao: '' }, e, { funcoesIds: lista(e.funcoesIds).map(String) }));
    out.necessidades = lista(p.necessidades).map(n => Object.assign({ id: uid('nc'), descricao: '', peso: 0 }, n));
    out.restricoes = lista(p.restricoes).map(r => Object.assign({ id: uid('rs'), texto: '' }, r));
    out.abstracao = [0, 1, 2, 3, 4].map(i => txt(lista(p.abstracao)[i] || ''));
    out.funcaoGlobal = Object.assign({ nome: '' }, p.funcaoGlobal || {});
    ['entradas', 'saidas'].forEach(l => {
        const f = (p.funcaoGlobal || {})[l] || {};
        out.funcaoGlobal[l] = { energia: lista(f.energia).map(String), material: lista(f.material).map(String), sinal: lista(f.sinal).map(String) };
    });
    out.estruturas = lista(p.estruturas).map(e => ({
        id: e.id || uid('est'), nome: txt(e.nome || 'Estrutura', 80), descricao: txt(e.descricao),
        nos: lista(e.nos).map(n => Object.assign({ id: uid('fn'), tipo: 'funcao', nome: '', pai: null, x: 40, y: 40, w: 170, h: 70, descricao: '' }, n)),
        ligacoes: lista(e.ligacoes).filter(l => l && l.de && l.para).map(l => Object.assign({ id: uid('lg'), tipo: 'material', rotulo: '', pai: null }, l)),
        fronteira: Object.assign({}, e.fronteira || {})
    }));
    if (out.estruturaEscolhida && !out.estruturas.some(e => e.id === out.estruturaEscolhida)) out.estruturaEscolhida = null;
    if (!out.estruturaEscolhida && out.estruturas.length) out.estruturaEscolhida = out.estruturas[0].id;
    out.diretrizes = Object.assign({}, p.diretrizes || {});
    out.selecaoEstrutura = Object.assign({ tecnicos: {}, custos: [], notasCusto: {} }, p.selecaoEstrutura || {});
    out.selecaoEstrutura.custos = lista(out.selecaoEstrutura.custos).map(c => Object.assign({ id: uid('ec'), descricao: '', peso: 0 }, c));
    out.principios = {};
    Object.entries(p.principios || {}).forEach(([k, l]) => {
        out.principios[k] = lista(l).map(x => {
            const y = Object.assign({ id: uid('pr'), nome: '', descricao: '', imagem: null, metodo: '', sugerido: false, origem: '', maturidade: '', fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' }, x);
            y.concorrentes = lista(x.concorrentes).map(c => txt(c, 120));
            if (!y.origem) y.origem = y.sugerido ? 'catalogo' : 'manual';
            if (!MATURIDADES[y.maturidade]) y.maturidade = '';
            if (!CUSTOS[y.custo]) y.custo = '';
            y.custoValor = y.custoValor === null || y.custoValor === undefined || y.custoValor === '' || !isFinite(+y.custoValor) ? null : +y.custoValor;
            return y;
        });
    });
    out.incompatibilidades = lista(p.incompatibilidades).filter(x => x && x.a && x.b).map(x => Object.assign({ id: uid('ic'), nota: '' }, x));
    out.variantes = lista(p.variantes).map((v, i) => Object.assign({ id: uid('vr'), nome: `Concepção ${i + 1}`, cor: CORES_VARIANTES[i % CORES_VARIANTES.length], escolhas: {}, descricao: '' }, v));
    const s = p.selecao || {};
    out.selecao = {
        viabilidade: Object.assign({}, s.viabilidade || {}),
        tecnologia: { perguntas: lista((s.tecnologia || {}).perguntas).length ? s.tecnologia.perguntas : base.selecao.tecnologia.perguntas, respostas: Object.assign({}, (s.tecnologia || {}).respostas || {}) },
        passa: { perguntas: lista((s.passa || {}).perguntas), respostas: Object.assign({}, (s.passa || {}).respostas || {}) },
        avaliacao: Object.assign({ referencia: null, criterios: [], notas: {} }, s.avaliacao || {}),
        evolucao: Object.assign({}, s.evolucao || {}),
        final: Object.assign({ notas: {}, participantes: '' }, s.final || {})
    };
    out.selecao.final.notas = Object.assign({}, out.selecao.final.notas);
    out.selecao.avaliacao.criterios = lista(out.selecao.avaliacao.criterios).map(c => Object.assign({ id: uid('cr'), texto: '', peso: 1 }, c));
    out.concepcao = Object.assign(base.concepcao, p.concepcao || {});
    out.concepcao.imagens = lista(out.concepcao.imagens);
    out.concepcao.complementos = lista(out.concepcao.complementos);
    out.etapasConcluidas = lista(p.etapasConcluidas).filter(x => typeof x === 'string');
    if (!TIPOS_PROJETO[out.tipoProjeto]) out.tipoProjeto = '';
    out.concorrentes = lista(p.concorrentes).map(c => Object.assign({ id: uid('cc'), nome: '', notas: {} }, c, { notas: Object.assign({}, c.notas || {}) }));
    out.notasNosso = Object.assign({}, p.notasNosso || {});
    out.referencias = lista(p.referencias).map(r => Object.assign({ id: uid('rf'), tipo: '', identificacao: '', titulo: '', resumo: '', link: '' }, r));
    out.ideiasQFD = lista(p.ideiasQFD).map(r => Object.assign({ id: uid('id'), titulo: '', descricao: '', status: '' }, r, { especIds: lista(r.especIds) }));
    out.ia = Object.assign({ importadoEm: '', resumo: '' }, p.ia || {});
    out.funcoesQFD = lista(p.funcoesQFD).map(String);
    out.fmea = lista(p.fmea).map(l => Object.assign({ id: uid('fm'), funcId: '', modo: '', efeito: '', causa: '', s: 5, o: 5, d: 5, acao: '' }, l));
    out.ultimoPreenchimento = p.ultimoPreenchimento && Array.isArray(p.ultimoPreenchimento.itens) ? p.ultimoPreenchimento : null;
    out.qfdBackup = p.qfdBackup && typeof p.qfdBackup === 'object' ? p.qfdBackup : null;
    out.preliminar = normalizarPreliminar(p.preliminar);
    out.baseAnterior = p.baseAnterior && typeof p.baseAnterior === 'object' ? { nome: txt(p.baseAnterior.nome, 160), em: txt(p.baseAnterior.em, 40) } : null;
    out.metadata = Object.assign(base.metadata, p.metadata || {});
    out.schemaVersion = PC_VERSAO;
    return out;
}

// ============================================================================
// ARMAZENAMENTO (localStorage) — uma instância global: PC
// ============================================================================

const PC = {
    p: null,
    ouvintes: [],
    carregar() {
        let dados = null;
        try { dados = JSON.parse(localStorage.getItem(PC_CHAVE) || 'null'); } catch (e) { dados = null; }
        this.p = normalizarProjeto(dados);
        return this.p;
    },
    salvar(motivo = '') {
        this.p.metadata.modificado = new Date().toISOString();
        try {
            localStorage.setItem(PC_CHAVE, JSON.stringify(this.p));
        } catch (e) {
            throw new Error('Não foi possível guardar no navegador (armazenamento cheio?). Baixe o ZIP do projeto.');
        }
        this.ouvintes.forEach(f => { try { f(motivo); } catch (e) { console.error(e); } });
    },
    substituir(novo) { this.p = normalizarProjeto(novo); this.salvar('substituir'); },
    aoMudar(f) { this.ouvintes.push(f); },
    estrutura(id) {
        const p = this.p;
        return p.estruturas.find(e => e.id === (id || p.estruturaEscolhida)) || p.estruturas[0] || null;
    }
};

// ============================================================================
// IMAGENS (IndexedDB): fotos de princípios de solução e esboços da concepção
// ============================================================================

const Imagens = {
    db: null, cacheUrl: new Map(),
    abrir() {
        if (this.db) return Promise.resolve(this.db);
        return new Promise((ok, falha) => {
            if (!window.indexedDB) { falha(new Error('Este navegador não guarda imagens (IndexedDB indisponível).')); return; }
            const r = indexedDB.open('pc_imagens', 1);
            r.onupgradeneeded = () => r.result.createObjectStore('imagens', { keyPath: 'id' });
            r.onsuccess = () => { this.db = r.result; ok(this.db); };
            r.onerror = () => falha(r.error);
        });
    },
    async _tx(modo, fn) {
        const db = await this.abrir();
        return new Promise((ok, falha) => {
            const t = db.transaction('imagens', modo), st = t.objectStore('imagens');
            const r = fn(st);
            t.oncomplete = () => ok(r && 'result' in r ? r.result : undefined);
            t.onerror = () => falha(t.error);
        });
    },
    /** Reduz a imagem (lado maior ≤ 1200 px, JPEG) para não pesar no ZIP; SVG e GIF ficam como estão. */
    async preparar(arquivo) {
        if (!arquivo || !/^image\//.test(arquivo.type)) throw new Error('Escolha um arquivo de imagem (foto, desenho, print).');
        if (/svg|gif/.test(arquivo.type)) return { blob: arquivo, tipo: arquivo.type };
        const url = URL.createObjectURL(arquivo);
        try {
            const img = await new Promise((ok, falha) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => falha(new Error('Imagem inválida.')); i.src = url; });
            const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
            const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
            const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.85));
            return { blob: blob || arquivo, tipo: blob ? 'image/jpeg' : arquivo.type };
        } finally { URL.revokeObjectURL(url); }
    },
    async salvar(arquivo, nome = '') {
        const { blob, tipo } = await this.preparar(arquivo);
        const id = uid('img');
        await this._tx('readwrite', st => st.put({ id, blob, tipo, nome: txt(nome || arquivo.name || '', 120) }));
        return id;
    },
    async gravarBruto(id, blob, tipo, nome = '') { await this._tx('readwrite', st => st.put({ id, blob, tipo, nome })); this.cacheUrl.delete(id); },
    async ler(id) { if (!id) return null; try { return await this._tx('readonly', st => st.get(id)); } catch (e) { return null; } },
    async url(id) {
        if (!id) return '';
        if (this.cacheUrl.has(id)) return this.cacheUrl.get(id);
        const r = await this.ler(id);
        const u = r && r.blob ? URL.createObjectURL(r.blob) : '';
        this.cacheUrl.set(id, u);
        return u;
    },
    async apagar(id) { if (!id) return; await this._tx('readwrite', st => st.delete(id)); const u = this.cacheUrl.get(id); if (u) URL.revokeObjectURL(u); this.cacheUrl.delete(id); },
    async todas() { try { return await this._tx('readonly', st => st.getAll()); } catch (e) { return []; } },
    async limpar() { await this._tx('readwrite', st => st.clear()); this.cacheUrl.forEach(u => u && URL.revokeObjectURL(u)); this.cacheUrl.clear(); }
};

/** Ids de imagens que o projeto usa (para o ZIP e para limpar sobras). */
function imagensUsadas(p) {
    const ids = new Set();
    Object.values(p.principios).forEach(l => l.forEach(x => x.imagem && ids.add(x.imagem)));
    p.concepcao.imagens.forEach(x => x && x.id && ids.add(x.id));
    Object.values(p.selecao.evolucao || {}).forEach(e => e && e.imagem && ids.add(e.imagem));
    const pl = p.preliminar || {};
    [pl.esbocoRestricoes].concat(lista(pl.portadores).map(x => x.imagem), lista(pl.leiautes).map(x => x.imagem), [((pl.fechamento || {}).definitivo || {}).imagem], lista((pl.prototipo || {}).ciclo).map(x => x.imagem)).forEach(id => id && ids.add(id));
    return [...ids];
}

// ============================================================================
// ESTRUTURA DE FUNÇÕES: navegação na árvore
// ============================================================================

function noGlobal(est) { return est ? est.nos.find(n => n.global) || est.nos.find(n => n.tipo === 'funcao' && !n.pai) : null; }
function nosDoNivel(est, pai) { return est.nos.filter(n => (n.pai || null) === (pai || null)); }
function ligacoesDoNivel(est, pai) { return est.ligacoes.filter(l => (l.pai || null) === (pai || null)); }
function funcoesFilhas(est, id) { return est.nos.filter(n => n.pai === id && n.tipo === 'funcao'); }
function ancestrais(est, id) {
    const out = []; let n = est.nos.find(x => x.id === id);
    while (n) { out.unshift(n); n = n.pai ? est.nos.find(x => x.id === n.pai) : null; }
    return out;
}
/** Nível da função: 0 global, 1 parcial, 2+ elementar (conforme Spagnolo, 2011, Fig. 13) */
function nivelFuncao(est, id) { return ancestrais(est, id).filter(n => n.tipo === 'funcao').length - 1; }
function rotuloNivel(est, n) {
    if (n.tipo !== 'funcao') return 'bloco lateral';
    const k = nivelFuncao(est, n.id);
    return k === 0 ? 'função global' : funcoesFilhas(est, n.id).length ? (k === 1 ? 'função parcial' : 'função parcial (desdobrada)') : (k === 1 ? 'função parcial' : 'função elementar');
}
/** Funções sem desdobramento (folhas): são as linhas da matriz morfológica. */
function funcoesFolha(est) {
    if (!est) return [];
    const out = [];
    const visita = (id) => funcoesFilhas(est, id).forEach(f => { if (funcoesFilhas(est, f.id).length) visita(f.id); else out.push(f); });
    const g = noGlobal(est);
    if (!g) return out;
    if (!funcoesFilhas(est, g.id).length) return [g];
    visita(g.id);
    return out;
}
/** Rótulo hierárquico "1.2" de uma função dentro da estrutura. */
function numeroFuncao(est, id) {
    const cad = ancestrais(est, id).filter(n => n.tipo === 'funcao');
    if (cad.length <= 1) return '0';
    return cad.slice(1).map((n, i) => funcoesFilhas(est, cad[i].id).findIndex(x => x.id === n.id) + 1).join('.');
}

// ============================================================================
// IMPORTAÇÃO DO QFD (backup JSON do Sistema QFD)
// ============================================================================

/**
 * QFD aberto neste navegador: o Sistema QFD, o Projeto Conceitual e o Gestão de Projetos ficam no mesmo endereço
 * (marlonsigales.github.io), então dividem o armazenamento do navegador. Lê o projeto do QFD sem precisar baixar arquivo.
 * Devolve { dados, nome, modificado } ou null.
 */
function lerQFDDoNavegador() {
    try {
        const d = JSON.parse(localStorage.getItem('qfd_data') || 'null');
        if (!d || typeof d !== 'object') return null;
        if (!Array.isArray(d.especificacoesProjeto)) d.especificacoesProjeto = [];
        if (!ehBackupQFD(d) || !d.requisitosProjeto.length) return null;
        return { dados: d, nome: (d.projeto && d.projeto.nome) || 'projeto sem nome', modificado: (d.metadata && d.metadata.lastModified) || '' };
    } catch (e) { return null; }
}

function ehBackupQFD(d) {
    return !!(d && typeof d === 'object' && Array.isArray(d.requisitosCliente) && Array.isArray(d.requisitosProjeto) && Array.isArray(d.especificacoesProjeto));
}

const SIMBOLO_META = { '>=': '≥', '<=': '≤', '=': '=', 'entre': 'entre', 'intervalo': 'entre' };
function textoMetaQFD(e) {
    if (!e) return '';
    if (e.metaTexto) return String(e.metaTexto);
    if (e.valorMeta === null || e.valorMeta === undefined || e.valorMeta === '') return '';
    const un = e.unidadeMedida ? ' ' + e.unidadeMedida : '';
    if (e.valorMax !== null && e.valorMax !== undefined && e.valorMax !== '') return `${e.valorMeta} a ${e.valorMax}${un}`;
    const s = SIMBOLO_META[e.tipoMeta] || '';
    return `${s ? s + ' ' : ''}${e.valorMeta}${un}${e.tolerancia ? ' ± ' + e.tolerancia : ''}`.trim();
}

/**
 * Traz do QFD: dados do projeto, especificações (na ordem de importância), requisitos dos clientes,
 * abstração e formulação do Fechamento e a função global com os fluxos. Requisitos marcados no QFD como
 * "formadores de função" viram funções parciais da estrutura (se ela ainda não tiver funções).
 * O que já foi preenchido aqui e não vem do QFD é mantido. Devolve um resumo.
 */
function importarQFD(p, d, arquivo = '') {
    if (!ehBackupQFD(d)) throw new Error('O arquivo não é um backup do Sistema QFD.');
    const pj = d.projeto || {};
    ['nome', 'cliente', 'instituicao'].forEach(k => { if (pj[k] && !p.projeto[k]) p.projeto[k] = txt(pj[k], 160); });
    if (Array.isArray(pj.equipe) && pj.equipe.length && !p.projeto.equipe.length) p.projeto.equipe = pj.equipe.map(x => txt(x, 120));

    const noQFD = r => !r.classificacao;
    const rps = d.requisitosProjeto.filter(noQFD).slice().sort((a, b) => (b.pesoRelativo || 0) - (a.pesoRelativo || 0));
    const manuais = p.especificacoes.filter(e => e.origem !== 'qfd');
    const antigas = new Map(p.especificacoes.filter(e => e.origem === 'qfd').map(e => [e.idQFD, e]));
    const novas = rps.map((r, i) => {
        const esp = d.especificacoesProjeto.find(e => e.requisitoProjetoId === r.id) || {};
        const ant = antigas.get(r.id) || {};
        const desc = String(r.descricao || '');
        return Object.assign({}, ant, {
            id: ant.id || uid('es'), idQFD: r.id, codigo: `RP${d.requisitosProjeto.findIndex(x => x.id === r.id) + 1}`, descricao: desc,
            sentido: ['up', 'down', 'none'].includes(r.sentidoMelhoria) ? r.sentidoMelhoria : 'none',
            meta: textoMetaQFD(esp), unidade: esp.unidadeMedida || '', avaliacao: esp.formaAvaliacao || '', aspectos: esp.aspectosIndesejaveis || '',
            peso: +r.pesoRelativo || 0, dificuldade: r.dificuldadeTecnica ?? null, origem: 'qfd', ordem: i + 1, funcoesIds: lista(ant.funcoesIds), funcao: ant.funcao || '',
            ehCusto: ant.ehCusto !== undefined ? ant.ehCusto : /custo|preço|preco|r\$/i.test(desc)
        });
    });
    p.especificacoes = novas.concat(manuais);

    const ncAnt = new Map(p.necessidades.map(n => [n.idQFD, n]));
    p.necessidades = d.requisitosCliente.filter(noQFD).slice().sort((a, b) => (b.peso || 0) - (a.peso || 0))
        .map(r => Object.assign({}, ncAnt.get(r.id) || {}, { id: (ncAnt.get(r.id) || {}).id || uid('nc'), idQFD: r.id, descricao: String(r.descricao || ''), peso: +r.peso || 0 }));

    const f = d.fechamento || {};
    if (Array.isArray(f.abstracao)) f.abstracao.forEach((t, i) => { if (i < 5 && t && !p.abstracao[i]) p.abstracao[i] = String(t); });
    const escolhida = lista(f.formulacoes).find(x => x.id === f.formulacaoEscolhida);
    if (!p.formulacao) p.formulacao = String((escolhida && escolhida.texto) || p.abstracao[4] || '');
    const fg = f.funcaoGlobal || {};
    if (fg.nome && !p.funcaoGlobal.nome) p.funcaoGlobal.nome = String(fg.nome);
    ['entradas', 'saidas'].forEach(l => Object.keys(TIPOS_FLUXO).forEach(t => {
        const vindos = lista((fg[l] || {})[t]).map(String);
        if (vindos.length && !p.funcaoGlobal[l][t].length) p.funcaoGlobal[l][t] = vindos;
    }));

    const formadores = d.requisitosCliente.concat(d.requisitosProjeto).filter(r => r.classificacao === 'funcao').map(r => String(r.descricao || ''));
    // funções vindas do QFD (requisitos "formadores de função"): entram na estrutura no preenchimento automático
    p.funcoesQFD = formadores;
    const criouEstrutura = false;
    if (p.estruturas.length) {
        const est = p.estruturas[0], g = noGlobal(est);
        if (g && !funcoesFilhas(est, g.id).length && formadores.length) acrescentarFuncoes(est, g.id, formadores);
    }
    if (!p.selecao.passa.perguntas.length) p.selecao.passa.perguntas = p.necessidades.map(n => ({ id: uid('pp'), texto: perguntaDaNecessidade(n.descricao) }));
    if (!p.selecao.avaliacao.criterios.length) p.selecao.avaliacao.criterios = p.necessidades.map(n => ({ id: uid('cr'), texto: n.descricao, peso: Math.round((n.peso || 0) * 1000) / 10 || 1 }));
    // concorrentes e notas dos clientes (avaliação competitiva)
    const ac = d.avaliacaoCompetitiva || {};
    const ncPorQFD = new Map(p.necessidades.map(n => [n.idQFD, n.id]));
    const notasDe = pid => {
        const o = {};
        lista(ac.notasCliente).filter(x => x.produtoId === pid && ncPorQFD.has(x.requisitoClienteId)).forEach(x => { o[ncPorQFD.get(x.requisitoClienteId)] = +x.nota || 0; });
        return o;
    };
    const ccAnt = new Map(p.concorrentes.map(c => [c.idQFD, c]));
    const vindos = lista(ac.produtos).filter(x => x.tipo === 'concorrente').map(x => Object.assign({}, ccAnt.get(x.id) || {}, { id: (ccAnt.get(x.id) || {}).id || uid('cc'), idQFD: x.id, nome: txt(x.nome, 120), notas: notasDe(x.id) }));
    p.concorrentes = vindos.concat(p.concorrentes.filter(c => !c.idQFD));
    p.notasNosso = notasDe('nosso');
    // estado da técnica (normas, produtos, patentes, artigos)
    const rfAnt = new Map(p.referencias.map(x => [x.idQFD, x]));
    p.referencias = lista(d.referencias).map(x => Object.assign({}, rfAnt.get(x.id) || {}, { id: (rfAnt.get(x.id) || {}).id || uid('rf'), idQFD: x.id, tipo: txt(x.tipo, 40), identificacao: txt(x.identificacao, 120), titulo: txt(x.titulo, 300), resumo: txt(x.resumo, 1200), link: txt(x.link, 500) }))
        .concat(p.referencias.filter(x => !x.idQFD));
    // ideias de solução do caderno de ideias: viram sugestões de princípios
    const espPorQFD = new Map(p.especificacoes.filter(e => e.idQFD).map(e => [e.idQFD, e.id]));
    p.ideiasQFD = lista((d.cadernoIdeias || {}).ideias).filter(x => x.titulo || x.descricao).map(x => ({
        id: uid('id'), idQFD: x.id, titulo: txt(x.titulo || x.descricao, 160), descricao: txt(x.descricao, 800), status: txt(x.status, 30),
        especIds: lista(x.requisitos).filter(q => q.tipo === 'projeto' && espPorQFD.has(q.id)).map(q => espPorQFD.get(q.id))
    }));
    p.qfdBackup = clonar(d);
    if (!p.tipoProjeto) p.tipoProjeto = detectarTipoProjeto(p);
    p.origemQFD = { arquivo: txt(arquivo, 160), importadoEm: new Date().toISOString() };
    return { especificacoes: novas.length, necessidades: p.necessidades.length, formadores: formadores.length, criouEstrutura };
}

/** Palpite do tipo de projeto pelo vocabulário das especificações e necessidades (o usuário pode trocar). */
function detectarTipoProjeto(p) {
    const t = semAcento([p.projeto.nome, p.formulacao, p.funcaoGlobal.nome].concat(p.especificacoes.map(e => e.descricao), p.necessidades.map(n => n.descricao)).join(' '));
    const conta = re => (t.match(re) || []).length;
    const pts = {
        eletrico: conta(/eletric|tensao|corrente|potencia|bateria|volt|\bkw|\bw\b|inversor|solar|fotovolt|disjunt|cabo|aterr/g),
        automacao: conta(/sensor|control|automa|software|comunica|sinal|wifi|bluetooth|iot|dado|monitor|embarc|microcontrol|precisao|app\b/g),
        agricola: conta(/semente|plant|pulveriz|colh|grao|graos|solo|lavoura|aduba|fertiliz|trator|agric|dosa|secag|cultiv/g),
        mecanico: conta(/massa|carga|resist|rigidez|desgaste|rolamento|eixo|engrenag|estrutura|chassi|quadro|roda|mola/g)
    };
    const ord = Object.entries(pts).sort((a, b) => b[1] - a[1]);
    if (!ord[0][1]) return 'mecanico';
    const fortes = ord.filter(([, v]) => v >= Math.max(2, ord[0][1] * 0.6)).map(([k]) => k);
    if (fortes.length >= 2 && fortes.some(k => k === 'eletrico' || k === 'automacao') && fortes.some(k => k === 'mecanico' || k === 'agricola')) return 'misto';
    return ord[0][0];
}

/** Funções da estrutura ligadas a uma especificação: escolhidas à mão (funcoesIds) ou com o mesmo nome da "função relacionada". */
function funcoesDaEspec(est, e) {
    if (!est) return [];
    const ids = new Set(lista(e.funcoesIds));
    const nome = semAcento(e.funcao || '').trim();
    return est.nos.filter(n => n.tipo === 'funcao' && !n.global && (ids.has(n.id) || (nome && semAcento(n.nome).trim() === nome)));
}

function perguntaDaNecessidade(t) {
    const s = String(t || '').trim().replace(/[.?!]+$/, '');
    if (!s) return '';
    return `A concepção atende "${s.charAt(0).toLowerCase() + s.slice(1)}"?`;
}

/**
 * Estrutura inicial a partir da função global do QFD: o bloco da função global, blocos laterais à esquerda
 * (de onde vêm as entradas) e à direita (para onde vão as saídas), com uma ligação por fluxo (energia,
 * material, sinal). Dentro da função global, as funções parciais vindas dos requisitos formadores de função.
 */
function montarEstruturaInicial(p, funcoesIniciais = []) {
    const est = criarEstrutura('Estrutura 1');
    const g = noGlobal(est);
    g.nome = p.funcaoGlobal.nome || p.formulacao || 'Função global';
    const fg = p.funcaoGlobal;
    const nFluxos = Math.max(...['entradas', 'saidas'].map(l => Object.values(fg[l]).reduce((t, v) => t + v.length, 0)), 1);
    g.h = Math.max(80, nFluxos * 34 + 16); g.y = 170 - g.h / 2 + 40; g.x = 420; g.w = 200;
    const lados = [['entradas', 20, 'Origem'], ['saidas', 850, 'Destino']];
    const nomesLado = { energia: { entradas: 'Fonte de energia', saidas: 'Ambiente (energia)' }, material: { entradas: 'Origem do material', saidas: 'Destino do material' }, sinal: { entradas: 'Usuário (comandos)', saidas: 'Usuário (informações)' } };
    lados.forEach(([lado, x]) => {
        const tipos = Object.keys(TIPOS_FLUXO).filter(t => fg[lado][t].length);
        tipos.forEach((t, k) => {
            const ext = { id: uid('ex'), tipo: 'externo', nome: nomesLado[t][lado], pai: null, x, y: 40 + k * 120 + (3 - tipos.length) * 40, w: 170, h: 60, descricao: '' };
            est.nos.push(ext);
            fg[lado][t].forEach(rot => est.ligacoes.push({ id: uid('lg'), tipo: t, rotulo: rot, pai: null, de: lado === 'entradas' ? ext.id : g.id, para: lado === 'entradas' ? g.id : ext.id }));
        });
    });
    if (funcoesIniciais.length) acrescentarFuncoes(est, g.id, funcoesIniciais);
    return est;
}

function acrescentarFuncoes(est, paiId, nomes) {
    const existentes = funcoesFilhas(est, paiId);
    nomes.forEach((nome, i) => {
        const k = existentes.length + i;
        est.nos.push({ id: uid('fn'), tipo: 'funcao', nome: txt(nome, 120), pai: paiId, x: 60 + (k % 4) * 210, y: 60 + Math.floor(k / 4) * 130, w: 170, h: 70, descricao: '' });
    });
}

// ============================================================================
// MATRIZ MORFOLÓGICA E COMBINAÇÕES
// ============================================================================

function principiosDe(p, funcId) { return p.principios[funcId] || (p.principios[funcId] = []); }
function incompativeis(p, a, b) { return p.incompatibilidades.some(x => (x.a === a && x.b === b) || (x.a === b && x.b === a)); }

/** Número total de combinações (produto do número de princípios de cada função com pelo menos um). */
function totalCombinacoes(p, est) {
    const linhas = funcoesFolha(est).map(f => principiosDe(p, f.id).length).filter(n => n > 0);
    return linhas.length ? linhas.reduce((a, b) => a * b, 1) : 0;
}

/**
 * Combinações compatíveis, das mais promissoras para as menos: os princípios são postos em ordem de
 * adequação em cada linha (Roozenburg & Eekels, 1995), então somar as posições dá a preferência.
 * Respeita as incompatibilidades marcadas (Pahl et al., 2005, critério a).
 */
function gerarCombinacoes(p, est, limite = 20) {
    const fs = funcoesFolha(est).filter(f => principiosDe(p, f.id).length);
    if (!fs.length) return [];
    const out = [];
    let visitados = 0;
    const MAX_VISITAS = 200000;
    const busca = (k, escolha, custo) => {
        if (visitados++ > MAX_VISITAS) return;
        if (k === fs.length) { out.push({ escolhas: Object.assign({}, escolha), custo }); return; }
        const f = fs[k];
        principiosDe(p, f.id).forEach((pr, pos) => {
            if (Object.values(escolha).some(outro => incompativeis(p, outro, pr.id))) return;
            escolha[f.id] = pr.id;
            busca(k + 1, escolha, custo + pos);
            delete escolha[f.id];
        });
    };
    busca(0, {}, 0);
    out.sort((a, b) => a.custo - b.custo);
    return out.slice(0, limite);
}

/**
 * Custo estimado de uma concepção: soma dos valores (R$) dos princípios escolhidos quando todos têm valor;
 * senão, o nível médio (barato/médio/caro) dos que têm faixa. Devolve { valor, parcial, comValor, nivel, faltam, total }.
 */
function custoConcepcao(p, est, v) {
    const xs = funcoesFolha(est).map(f => acharPrincipio(p, v.escolhas[f.id])).filter(Boolean);
    const comValor = xs.filter(x => x.custoValor !== null && x.custoValor !== undefined && isFinite(x.custoValor));
    const parcial = comValor.reduce((t, x) => t + (+x.custoValor), 0);
    const niveis = xs.map(x => x.custo ? CUSTOS[x.custo].peso : null).filter(n => n !== null);
    const media = niveis.length ? niveis.reduce((a, b) => a + b, 0) / niveis.length : null;
    const nivel = media === null ? '' : media < 3.5 ? 'baixo' : media < 7.5 ? 'medio' : 'alto';
    return { valor: xs.length && comValor.length === xs.length ? parcial : null, parcial, comValor: comValor.length, nivel, media, faltam: xs.filter(x => !x.custo && (x.custoValor === null || x.custoValor === undefined)).length, total: xs.length };
}
function textoCusto(c) {
    if (!c) return '—';
    if (c.valor !== null) return 'R$ ' + c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const partes = [];
    if (c.nivel) partes.push(CUSTOS[c.nivel].nome);
    if (c.comValor) partes.push(`R$ ${c.parcial.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} em ${c.comValor}/${c.total}`);
    return partes.join(' · ') || '—';
}

/** A variante usa algum par incompatível? Lista os pares. */
function conflitosVariante(p, v) {
    const ids = Object.values(v.escolhas || {}), out = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (incompativeis(p, ids[i], ids[j])) out.push([ids[i], ids[j]]);
    return out;
}

function acharPrincipio(p, id) {
    for (const [f, l] of Object.entries(p.principios)) { const x = l.find(y => y.id === id); if (x) return Object.assign({ funcId: f }, x); }
    return null;
}

// ============================================================================
// SELEÇÃO DA ESTRUTURA FUNCIONAL (Ferreira, 1997, apud Spagnolo, 2011, Fig. 12)
// ============================================================================

const ESCALA_DT = { 1: 'Fraco', 5: 'Satisfatório', 10: 'Excelente' };
const ESCALA_CUSTO = { 1: 'Baixo', 5: 'Médio', 10: 'Alto' };

/**
 * IDT = Σ (peso relativo do requisito técnico × desempenho técnico 1/5/10);
 * IDC = Σ (valor relativo da especificação de custo × custo 1/5/10). Maior IDT/IDC é melhor.
 */
function indicesFerreira(p) {
    const tec = p.especificacoes.filter(e => !e.ehCusto);
    const sel = p.selecaoEstrutura;
    return p.estruturas.map(est => {
        const dt = sel.tecnicos[est.id] || {}, ct = sel.notasCusto[est.id] || {};
        const avalT = tec.filter(e => dt[e.id]);
        const idt = avalT.reduce((s, e) => s + (+e.peso || 0) * 100 * (+dt[e.id] || 0), 0);
        const avalC = sel.custos.filter(c => ct[c.id]);
        const idc = avalC.reduce((s, c) => s + (+c.peso || 0) * (+ct[c.id] || 0), 0);
        return { id: est.id, nome: est.nome, idt, idc, razao: idc > 0 ? idt / idc : null, completoT: tec.length > 0 && avalT.length === tec.length, completoC: sel.custos.length > 0 && avalC.length === sel.custos.length };
    });
}

// ============================================================================
// SELEÇÃO DA CONCEPÇÃO (Reis, 2003, apud Spagnolo, 2011, 4.2.5)
// ============================================================================

/** Situação de cada variante nas quatro técnicas, em sequência (só segue quem passou na anterior). */
function resultadoSelecao(p) {
    const s = p.selecao;
    const nPerg = s.tecnologia.perguntas.length, nPassa = s.passa.perguntas.length;
    const av = s.avaliacao, ref = av.referencia;
    return p.variantes.map(v => {
        const via = (s.viabilidade[v.id] || {}).estado || '';
        const rt = s.tecnologia.respostas[v.id] || {};
        const naoTec = s.tecnologia.perguntas.filter(q => rt[q.id] === 'nao').length, respTec = s.tecnologia.perguntas.filter(q => rt[q.id]).length;
        const rp = s.passa.respostas[v.id] || {};
        const naoPassa = s.passa.perguntas.filter(q => rp[q.id] === 'nao').length, respPassa = s.passa.perguntas.filter(q => rp[q.id]).length;
        const notas = av.notas[v.id] || {};
        const soma = av.criterios.reduce((t, c) => t + (+notas[c.id] || 0), 0);
        const pesoTot = av.criterios.reduce((t, c) => t + (+c.peso || 0), 0);
        const ponderada = pesoTot ? av.criterios.reduce((t, c) => t + (+c.peso || 0) * (+notas[c.id] || 0), 0) / pesoTot : 0;
        const ehRef = v.id === ref;
        const etapa1 = via === 'viavel' || via === 'condicional';
        const etapa2 = etapa1 && respTec === nPerg && nPerg > 0 && naoTec <= Math.floor(nPerg / 2);
        const etapa3 = etapa2 && respPassa === nPassa && (nPassa === 0 || naoPassa <= Math.floor(nPassa / 3));
        return { id: v.id, nome: v.nome, cor: v.cor, viabilidade: via, naoTec, respTec, nPerg, naoPassa, respPassa, nPassa, soma, ponderada, ehRef,
            etapa1, etapa2, etapa3, promissora: etapa3 && (ehRef || soma > 0) };
    });
}

// ============================================================================
// SITUAÇÃO DAS ETAPAS
// ============================================================================

const ETAPAS = [
    ['escopo', '1', 'Escopo do problema'],
    ['funcao-global', '2', 'Função global'],
    ['estrutura', '3', 'Estrutura funcional'],
    ['principios', '4', 'Princípios de solução'],
    ['matriz', '5', 'Matriz morfológica'],
    ['selecao', '6', 'Seleção da concepção'],
    ['concepcao', '7', 'Concepção selecionada'],
    ['analises', '8', 'Análises e TRL'],
    ['relatorio', '9', 'Relatório']
];

function statusEtapas(p) {
    const est = PC.estrutura ? (p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0]) : null;
    const folhas = funcoesFolha(est);
    const comPrinc = folhas.filter(f => (p.principios[f.id] || []).length > 0).length;
    const comDois = folhas.filter(f => (p.principios[f.id] || []).length >= 2).length;
    const nAbs = p.abstracao.filter(t => t.trim()).length;
    const s = (feito, andamento, resumo) => ({ estado: feito ? 'feito' : andamento ? 'andamento' : 'vazio', resumo });
    const r = resultadoSelecao(p);
    const out = {
        'escopo': s(p.especificacoes.length > 0 && nAbs === 5 && p.formulacao.trim(), p.especificacoes.length || nAbs || p.formulacao.trim(), `${p.especificacoes.length} especificação(ões) · abstração ${nAbs}/5`),
        'funcao-global': s(p.funcaoGlobal.nome.trim() && ['entradas', 'saidas'].every(l => Object.values(p.funcaoGlobal[l]).some(x => x.length)), p.funcaoGlobal.nome.trim(), p.funcaoGlobal.nome.trim() ? 'função global definida' : 'sem função global'),
        'estrutura': s(est && folhas.length >= 2 && est.ligacoes.some(l => l.pai), est && folhas.length > 1, `${p.estruturas.length} estrutura(s) · ${folhas.length} função(ões) elementar(es)`),
        'principios': s(folhas.length > 0 && comDois === folhas.length, comPrinc > 0, `${comPrinc}/${folhas.length} função(ões) com princípios`),
        'matriz': s(p.variantes.length >= 2 && p.variantes.every(v => folhas.every(f => v.escolhas[f.id])), p.variantes.length > 0, `${p.variantes.length} concepção(ões)`),
        'selecao': s(r.length > 0 && !!p.selecao.avaliacao.referencia && r.some(x => x.promissora), r.some(x => x.viabilidade), r.length ? `${r.filter(x => x.promissora).length} promissora(s)` : 'sem concepções'),
        'concepcao': s(p.concepcao.varianteId && p.concepcao.descricao.trim(), p.concepcao.varianteId || p.concepcao.descricao.trim(), p.concepcao.varianteId ? 'concepção escolhida' : 'não escolhida'),
        'analises': s(false, false, ''),
        'relatorio': s(false, false, 'gerar ao final')
    };
    if (typeof pendencias === 'function') {
        const pend = pendencias(p), altas = pend.filter(x => x.nivel === 'alta').length, medias = pend.filter(x => x.nivel === 'media').length;
        out.analises = s(est && !altas && !medias && out.concepcao.estado === 'feito', est && folhas.length > 0, altas + medias ? `${altas} importante(s), ${medias} a melhorar` : 'nada pendente');
    }
    out.relatorio = s(out.concepcao.estado === 'feito', out.estrutura.estado !== 'vazio', out.concepcao.estado === 'feito' ? 'pronto para gerar' : 'pode gerar a qualquer momento');
    if (typeof statusPreliminar === 'function') Object.assign(out, statusPreliminar(p));
    p.etapasConcluidas.forEach(id => { if (out[id] && out[id].estado !== 'feito') out[id] = { estado: 'feito', resumo: out[id].resumo + ' · marcada como concluída', marcada: true }; });
    return out;
}

/** Etapas do conceitual seguidas das do preliminar (quando o módulo está carregado). */
function todasEtapas() { return typeof ETAPAS_PRELIM !== 'undefined' ? ETAPAS.concat(ETAPAS_PRELIM) : ETAPAS; }

function proximaEtapa(p, st) {
    st = st || statusEtapas(p);
    const e = ETAPAS.find(([id]) => id !== 'relatorio' && st[id].estado !== 'feito');
    return e ? { id: e[0], numero: e[1], nome: e[2] } : { id: 'relatorio', numero: '9', nome: 'Relatório' };
}

// ============================================================================
// ZIP COMPLETO: projeto.json + imagens/ + diagramas/ + relatório (HTML) + backup QFD de origem
// ============================================================================

function nomeSeguro(t) {
    return semAcento(t || 'projeto-conceitual').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'projeto-conceitual';
}
function extensao(tipo) { return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/gif': 'gif', 'image/webp': 'webp' }[tipo] || 'bin'; }

/**
 * Monta o ZIP do projeto. extras: { diagramas: [{ nome, svg }], relatorioHtml } (gerados pela interface).
 */
async function montarZip(p, extras = {}) {
    if (typeof JSZip === 'undefined') throw new Error('Biblioteca de ZIP não carregada.');
    const zip = new JSZip();
    const usadas = new Set(imagensUsadas(p));
    const imgs = (await Imagens.todas()).filter(x => usadas.has(x.id));
    const mapa = {};
    imgs.forEach(x => { const arq = `imagens/${x.id}.${extensao(x.tipo)}`; mapa[x.id] = arq; zip.file(arq, x.blob); });
    zip.file('projeto-conceitual.json', JSON.stringify(Object.assign({}, p, { arquivosImagens: mapa }), null, 2));
    lista(extras.diagramas).forEach(d => zip.file(`diagramas/${nomeSeguro(d.nome)}.svg`, d.svg));
    lista(extras.arquivos).forEach(a => zip.file(a.caminho, a.blob));
    if (typeof exportarParaGestao === 'function' && p.estruturas.length) zip.file('gestao-conceitual.json', JSON.stringify(exportarParaGestao(p), null, 2));
    if (p.qfdBackup) zip.file('qfd-backup.json', JSON.stringify(p.qfdBackup, null, 2));
    if (extras.relatorioHtml) zip.file('relatorio.html', typeof extras.relatorioHtml === 'function' ? extras.relatorioHtml(mapa) : extras.relatorioHtml);
    if (extras.relatorioPreliminarHtml && p.preliminar && p.preliminar.iniciado) zip.file('relatorio-preliminar.html', extras.relatorioPreliminarHtml(mapa));
    zip.file('LEIA-ME.txt', [
        'Projeto conceitual exportado pelo Sistema de Projeto Conceitual.',
        '', '- projeto-conceitual.json: todos os dados (abra em "Abrir projeto" para continuar de onde parou).',
        '- imagens/: fotos e esboços dos princípios de solução e da concepção.',
        '- diagramas/: estruturas de funções em SVG (abrem no navegador, Inkscape, Word, PowerPoint).',
        '- relatorio.html: relatório completo (abra no navegador; para PDF, use Imprimir → Salvar como PDF).',
        '- relatorio-preliminar.html: relatório do projeto preliminar (quando iniciado).',
        '- gestao-conceitual.json: funções, princípios e concepção para o Gestão de Projetos (árvore TRL); o Gestão também aceita este ZIP inteiro.',
        '- qfd-backup.json: o backup do QFD de onde o projeto partiu.'
    ].join('\n'));
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/** Lê um ZIP exportado (ou o JSON sozinho). Devolve o projeto normalizado; grava as imagens. */
async function lerZipOuJson(arquivo) {
    if (/\.json$/i.test(arquivo.name) || arquivo.type === 'application/json') {
        const d = JSON.parse((await arquivo.text()).replace(/^﻿/, ''));
        return { dados: d, qfd: ehBackupQFD(d) };
    }
    if (typeof JSZip === 'undefined') throw new Error('Biblioteca de ZIP não carregada.');
    const zip = await JSZip.loadAsync(arquivo);
    const entrada = zip.file('projeto-conceitual.json') || zip.file(/\.json$/i).find(f => !/^__MACOSX/.test(f.name));
    if (!entrada) throw new Error('O ZIP não tem o arquivo projeto-conceitual.json.');
    const d = JSON.parse((await entrada.async('string')).replace(/^﻿/, ''));
    if (ehBackupQFD(d)) return { dados: d, qfd: true };
    const mapa = d.arquivosImagens || {};
    for (const [id, caminho] of Object.entries(mapa)) {
        const f = zip.file(caminho);
        if (!f) continue;
        const blob = await f.async('blob');
        const tipo = { jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', gif: 'image/gif', webp: 'image/webp' }[caminho.split('.').pop()] || 'application/octet-stream';
        await Imagens.gravarBruto(id, new Blob([blob], { type: tipo }), tipo, caminho.split('/').pop());
    }
    delete d.arquivosImagens;
    return { dados: d, qfd: false };
}
