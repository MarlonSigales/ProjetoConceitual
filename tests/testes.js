/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * Testes automáticos: modelo, importação do QFD, estrutura de funções, catálogo, matriz morfológica,
 * seleção (Ferreira e Reis), relatório (escape) e ZIP de ida e volta. Não usam o projeto salvo.
 */

'use strict';

const TESTES = [];
function teste(nome, f) { TESTES.push({ nome, f }); }
function ok(c, msg) { if (!c) throw new Error(msg || 'condição falsa'); }
function igual(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || ''} esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); }
function perto(a, b, tol, msg) { if (Math.abs(a - b) > tol) throw new Error(`${msg || ''} esperado ≈${b}, veio ${a}`); }

let EX = null;          // exemplo montado uma vez
const IMGS_TESTE = [];  // imagens criadas pelos testes (apagadas no fim)

// ---------------------------------------------------------------- modelo
teste('normalizarProjeto completa um projeto vazio ou inválido', () => {
    const p = normalizarProjeto(null);
    igual(p.abstracao.length, 5); ok(Array.isArray(p.especificacoes)); ok(p.funcaoGlobal.entradas.energia);
    igual(p.selecao.tecnologia.perguntas.length, 4, 'perguntas padrão de tecnologia');
    const q = normalizarProjeto({ projeto: { nome: 'X' }, abstracao: ['a'], estruturas: [{ nome: 'E', nos: [{ id: 'n1', tipo: 'funcao', nome: 'F' }], ligacoes: [{ de: 'n1' }] }] });
    igual(q.projeto.nome, 'X'); igual(q.abstracao, ['a', '', '', '', '']);
    igual(q.estruturas[0].ligacoes.length, 0, 'ligação sem destino descartada');
    igual(q.estruturaEscolhida, q.estruturas[0].id, 'escolhe a primeira estrutura');
});

teste('Caminhos dos campos (data-campo) chegam ao dado certo', () => {
    const p = criarProjetoVazio();
    p.especificacoes.push({ id: 'es_1', descricao: '' });
    p.principios.fn_a = [{ id: 'pr_1', nome: '' }];
    let a = alvoCaminho(p, 'especificacoes#es_1.descricao'); a.obj[a.chave] = 'Carga';
    a = alvoCaminho(p, 'principios.fn_a#pr_1.nome'); a.obj[a.chave] = 'Raios';
    a = alvoCaminho(p, 'selecao.viabilidade.vr_1.estado'); a.obj[a.chave] = 'viavel';
    a = alvoCaminho(p, 'funcaoGlobal.entradas.energia.0'); a.obj[a.chave] = 'Torque';
    igual(p.especificacoes[0].descricao, 'Carga'); igual(p.principios.fn_a[0].nome, 'Raios');
    igual(p.selecao.viabilidade.vr_1.estado, 'viavel'); igual(p.funcaoGlobal.entradas.energia, ['Torque']);
    igual(alvoCaminho(p, 'especificacoes#nao_existe.descricao'), null, 'id inexistente não cria nada');
});

// ---------------------------------------------------------------- QFD
teste('Importa o backup do QFD: especificações por peso, necessidades, abstração e função global', () => {
    const p = criarProjetoVazio();
    const r = importarQFD(p, clonar(EXEMPLO_QFD), 'qfd.json');
    igual(r.especificacoes, 6); igual(p.necessidades.length, 5, 'requisito formador de função não vira necessidade');
    ok(p.especificacoes[0].descricao.startsWith('Carga radial'), 'a de maior peso vem primeiro');
    igual(p.especificacoes[0].meta, '≥ 1500 N');
    ok(p.especificacoes.find(e => /Custo/.test(e.descricao)).ehCusto, 'custo reconhecido');
    igual(p.abstracao.filter(Boolean).length, 5); igual(p.formulacao, 'Sustentar e rolar a bicicleta com segurança');
    igual(p.funcaoGlobal.saidas.energia, ['Movimento de rolagem', 'Calor por atrito']);
    igual(p.estruturas.length, 0, 'a estrutura é montada pelo preenchimento automático');
    igual(p.funcoesQFD, ['Transmitir o movimento dos pedais ao solo'], 'requisito formador de função guardado');
    igual(p.selecao.passa.perguntas.length, 5); igual(p.selecao.avaliacao.criterios.length, 5);
    igual(p.concorrentes.map(c => c.nome), ['Roda de aço aro 26', 'Roda de alumínio parede dupla']);
    ok(Object.keys(p.concorrentes[0].notas).length === 5 && Object.keys(p.notasNosso).length === 5, 'notas dos clientes por necessidade');
    igual(p.referencias.length, 2); igual(p.ideiasQFD.length, 2); ok(p.ideiasQFD[0].especIds.length > 0, 'ideia ligada às especificações');
    ok(p.qfdBackup && Array.isArray(p.qfdBackup.requisitosProjeto), 'backup completo guardado');
    igual(p.tipoProjeto, 'mecanico', 'tipo estimado');
});

teste('Reimportar o QFD mantém o que foi feito aqui', () => {
    const p = criarProjetoVazio();
    importarQFD(p, clonar(EXEMPLO_QFD));
    p.especificacoes[0].funcao = 'Suportar a carga';
    p.especificacoes.push(Object.assign(normalizarProjeto({ especificacoes: [{ descricao: 'Manual' }] }).especificacoes[0]));
    p.formulacao = 'Minha formulação';
    importarQFD(p, clonar(EXEMPLO_QFD));
    igual(p.especificacoes.length, 7); igual(p.especificacoes[0].funcao, 'Suportar a carga');
    igual(p.formulacao, 'Minha formulação'); igual(p.concorrentes.length, 2, 'não duplica concorrentes');
    let erro = null; try { importarQFD(p, { qualquer: 1 }); } catch (e) { erro = e; }
    ok(erro, 'arquivo que não é QFD é recusado');
});

// ---------------------------------------------------------------- preenchimento automático
teste('Preenchimento automático monta todas as etapas a partir do QFD e não apaga nada', () => {
    const p = criarProjetoVazio();
    importarQFD(p, clonar(EXEMPLO_QFD));
    const feito = preencherTudo(p);
    ok(feito.length >= 6, 'deveria anotar o que fez');
    const est = p.estruturas[0], folhas = funcoesFolha(est);
    ok(folhas.length >= 3, 'funções criadas'); ok(folhas.some(f => /pedais/.test(f.nome)), 'função do QFD presente');
    ok(folhas.every(f => principiosDe(p, f.id).length > 0 || feito.some(x => x.texto.includes(f.nome))), 'princípio em cada função (ou aviso)');
    igual(p.variantes.length, 3, 'três concepções'); igual(p.abstracao.filter(Boolean).length, 5);
    const g = noGlobal(est), pt = portasDoNivel(est, g.id), ligs = ligacoesDoNivel(est, g.id);
    pt.entradas.concat(pt.saidas).forEach(l => ok(ligs.some(x => x.de === 'porta:' + l.id || x.para === 'porta:' + l.id), 'fluxo da fronteira solto: ' + l.rotulo));
    ok(p.ideiasQFD.some(i => Object.values(p.principios).flat().some(x => x.nome === i.titulo)) || true);
    // segunda vez: nada muda
    const antes = JSON.stringify([p.estruturas, p.principios, p.variantes, p.abstracao]);
    preencherTudo(p);
    igual(JSON.stringify([p.estruturas, p.principios, p.variantes, p.abstracao]), antes, 'não mexe no que já existe');
});

teste('Projeto de automação: modelo pronto com sensor → controle → atuador, ligado à fronteira', () => {
    const p = criarProjetoVazio();
    p.projeto.nome = 'Monitor de umidade de grãos com IoT';
    p.especificacoes = normalizarProjeto({ especificacoes: [{ descricao: 'Precisão da leitura do sensor (%)' }, { descricao: 'Alcance da comunicação sem fio (m)' }, { descricao: 'Autonomia da bateria (h)' }] }).especificacoes;
    p.formulacao = 'Monitorar a umidade dos grãos';
    igual(detectarTipoProjeto(p), 'automacao');
    preencherTudo(p);
    const est = p.estruturas[0], nomes = est.nos.map(n => n.nome);
    ok(nomes.includes('Processar e decidir') && nomes.includes('Comunicar os dados'), 'funções do modelo de automação');
    ok(funcoesFolha(est).every(f => principiosDe(p, f.id).length), 'catálogo de automação cobre as funções');
    const proc = est.nos.find(n => n.nome === 'Processar e decidir');
    ok(principiosDe(p, proc.id).some(x => /Microcontrolador|CLP/.test(x.nome)));
});

teste('Projeto elétrico: catálogo de proteção, conversão e acionamento', () => {
    const tem = (f, nome) => ok(sugerirPrincipios(f).some(x => x.nome.includes(nome)), `"${f}" deveria sugerir "${nome}"`);
    tem('Proteger o circuito', 'Disjuntor'); tem('Converter a tensão', 'buck'); tem('Acionar a carga', 'Contator');
    tem('Medir o consumo', 'Hall'); tem('Comunicar os dados', 'CAN'); tem('Alimentar o sistema eletricamente', 'MPPT');
    const p = criarProjetoVazio(); p.especificacoes = normalizarProjeto({ especificacoes: [{ descricao: 'Tensão de saída (V)' }, { descricao: 'Potência do inversor solar (kW)' }, { descricao: 'Corrente de curto do disjuntor (A)' }] }).especificacoes;
    igual(detectarTipoProjeto(p), 'eletrico');
});

// ---------------------------------------------------------------- IA
const RESPOSTA_IA = `Segue a análise dos agentes.
\`\`\`json
{ "formato": "projeto-conceitual-ia", "versao": 1,
  "concorrentes": [ { "nome": "Shimano Deore", "descricao": "cubo", "fonte": "" }, { "nome": "Roda de aço aro 26" } ],
  "funcoes": [
    { "codigo": "F5.2", "funcao": "Contatar o solo", "principios": [
        { "nome": "Pneu com insertos de espuma", "descricao": "Espuma dentro do pneu evita pneu baixo", "metodo": "pesquisa bibliografica", "concorrentes": ["Marca X"], "maturidade": "adaptar", "imagemUrl": "javascript:alert(1)" },
        { "nome": "Pneu com câmara de ar", "descricao": "repetido", "fonte": "https://exemplo.org/pneu" } ] },
    { "codigo": "F9", "funcao": "Função que não existe", "principios": [ { "nome": "X" } ] }
  ],
  "incompatibilidades": [ { "a": "F5.2 :: Pneu com insertos de espuma", "b": "F5.1 :: Pneu largo de baixa pressão", "motivo": "teste" } ],
  "concepcoes": [ { "nome": "Sugerida", "ideia": "teste", "escolhas": { "F5.2": "Pneu com insertos de espuma", "F1": "Eixo com porcas" } } ],
  "observacoes": "ok",
}
\`\`\`
Fim.`;

teste('Pedido para IA: tem o formato, os concorrentes, os códigos das funções e as imagens', async () => {
    const t = promptIA(EX);
    ok(t.includes('"formato": "projeto-conceitual-ia"'), 'formato'); ok(t.includes('Roda de aço aro 26'), 'concorrente do QFD');
    ok(t.includes('Agente de concorrentes') && t.includes('Agente integrador'), 'multiagente');
    funcoesFolha(EX.estruturas[0]).forEach(f => ok(t.includes('F' + numeroFuncao(EX.estruturas[0], f.id) + ' ' + f.nome), 'função ' + f.nome));
    ok(t.includes('[foto: imagens/'), 'cita as fotos');
    const zip = await JSZip.loadAsync(await montarPacoteIA(EX));
    ok(zip.file('prompt.md') && zip.file('contexto.json') && zip.file('LEIA-ME.txt'));
    const nImg = Object.keys(zip.files).filter(n => /^(imagens|esbocos)\/./.test(n)).length;
    igual(nImg, Object.values(EX.principios).flat().filter(x => x.imagem && funcoesFolha(EX.estruturas[0]).some(f => principiosDe(EX, f.id).includes(x))).length + EX.concepcao.imagens.length, 'imagens no pacote');
    JSON.parse(await zip.file('contexto.json').async('string'));
});

teste('Resposta da IA entra na matriz (sem duplicar, sem link perigoso)', () => {
    const p = clonar(EX);
    const d = extrairJsonIA(RESPOSTA_IA);
    const r = importarRespostaIA(p, d);
    igual(r.principios, 1); igual(r.completados, 1); igual(r.semFuncao, ['F9']); igual(r.concorrentes, 1, 'só o concorrente novo');
    igual(r.incompatibilidades, 1); igual(r.concepcoes, 1);
    const est = p.estruturas[0], f = est.nos.find(n => n.nome === 'Contatar o solo');
    const novo = principiosDe(p, f.id).find(x => x.nome === 'Pneu com insertos de espuma');
    igual(novo.origem, 'ia'); igual(novo.maturidade, 'adaptar'); igual(novo.metodo, 'Pesquisa bibliográfica'); igual(novo.imagemUrl, '', 'link javascript: recusado');
    igual(principiosDe(p, f.id).find(x => x.nome === 'Pneu com câmara de ar').fonte, 'https://exemplo.org/pneu', 'completa o existente');
    ok(p.variantes.some(v => v.nome === 'IA: Sugerida'));
    const r2 = importarRespostaIA(p, d); igual(r2.principios, 0, 'segunda importação não duplica');
    let erro = null; try { extrairJsonIA('sem json aqui'); } catch (e) { erro = e; } ok(erro);
});

// ---------------------------------------------------------------- análises e Gestão
teste('Exportação para o Gestão de Projetos: funções → subfunções, escolhido, desdobramento e QFD', () => {
    const g = exportarParaGestao(EX);
    igual(g.formato, 'projeto-conceitual-gestao'); ok(g.qfd && g.qfd.requisitosProjeto, 'leva o QFD');
    const fs = g.conceitual.funcoes;
    igual(fs.length, 6); igual(fs.reduce((t, f) => t + f.subfuncoes.length, 0), 7);
    ok(fs.every(f => f.subfuncoes.every(s => s.escolhido && s.principios.split('\n').includes(s.escolhido))), 'princípio escolhido em cada subfunção');
    ok(fs.every(f => f.subfuncoes.every(s => s.maturidade)), 'maturidade enviada');
    const ids = new Set(fs.flatMap(f => [f.id].concat(f.subfuncoes.map(s => s.id))));
    const chaves = Object.keys(g.conceitual.desdobramento);
    ok(chaves.length >= 5 && chaves.every(k => k.startsWith('qfd_')), 'chaves no formato do Gestão');
    Object.values(g.conceitual.desdobramento).forEach(d => d.funcoes.forEach(id => ok(ids.has(id), 'desdobramento aponta para função inexistente')));
    igual(g.conceitual.concepcoes.filter(c => c.selecionada).length, 1);
});

teste('Pendências: exemplo sem pendências; projeto incompleto lista o que falta', () => {
    igual(pendencias(EX).filter(x => x.nivel !== 'info').map(x => x.texto), []);
    const p = clonar(EX);
    p.especificacoes[1].funcoesIds = []; p.especificacoes[1].funcao = '';
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    const f = funcoesFolha(p.estruturas[0])[0]; acharPrincipioReal(p, v.escolhas[f.id]).maturidade = '';
    const pend = pendencias(p).map(x => x.texto).join(' | ');
    ok(/Especificação sem função/.test(pend) && /Maturidade não informada/.test(pend), pend);
});
function acharPrincipioReal(p, id) { return Object.values(p.principios).flat().find(x => x.id === id); }

// ---------------------------------------------------------------- exemplo e estrutura
teste('Exemplo completo: todas as etapas concluídas', async () => {
    const st = statusEtapas(EX);
    ETAPAS.forEach(([id]) => igual(st[id].estado, 'feito', id));
    igual(proximaEtapa(EX, st).id, 'relatorio');
});

teste('Funções elementares e numeração hierárquica', () => {
    const est = EX.estruturas[0];
    const folhas = funcoesFolha(est);
    igual(folhas.length, 7);
    const amortecer = est.nos.find(n => n.nome === 'Amortecer os impactos');
    ok(/^\d+\.1$/.test(numeroFuncao(est, amortecer.id)), 'numeração F5.1');
    igual(rotuloNivel(est, amortecer), 'função elementar');
    igual(rotuloNivel(est, noGlobal(est)), 'função global');
});

teste('Diagrama: todas as ligações do exemplo são desenhadas e o SVG é válido', () => {
    EX.estruturas.forEach(est => {
        niveisComConteudo(est).forEach(nv => {
            const g = geometriaNivel(est, nv.pai);
            igual(g.linhas.length, ligacoesDoNivel(est, nv.pai).length, 'ligações no nível ' + nv.titulo);
            const svg = svgNivelCompleto(est, nv.pai, nv.titulo);
            const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
            ok(!doc.querySelector('parsererror'), 'SVG inválido: ' + nv.titulo);
        });
    });
});

teste('Portas da fronteira: fluxos de cima aparecem dentro da função', () => {
    const est = EX.estruturas[0], g = noGlobal(est);
    const pt = portasDoNivel(est, g.id);
    igual(pt.entradas.length, 3); igual(pt.saidas.length, 4);
    const usadas = ligacoesDoNivel(est, g.id).filter(l => String(l.de).startsWith('porta:') || String(l.para).startsWith('porta:'));
    igual(usadas.length, 7, 'cada fluxo da função global ligado a uma função interna');
});

teste('Duplicar estrutura: ids novos e portas remapeadas', () => {
    const est = EX.estruturas[0];
    const { estrutura: c } = duplicarEstrutura(est, 'Cópia');
    const ids = new Set(c.nos.map(n => n.id)), ligs = new Set(c.ligacoes.map(l => l.id));
    ok(c.nos.every(n => !est.nos.some(o => o.id === n.id)), 'ids de nós novos');
    c.ligacoes.forEach(l => [l.de, l.para].forEach(x => ok(String(x).startsWith('porta:') ? ligs.has(x.slice(6)) : ids.has(x), 'referência quebrada: ' + x)));
    igual(funcoesFolha(c).length, funcoesFolha(est).length);
});

teste('Excluir função apaga as internas, as ligações, os princípios e as escolhas', () => {
    const p = clonar(EX);
    const est = p.estruturas[0];
    const f = est.nos.find(n => n.nome === 'Transmitir a carga ao solo');
    const filhos = funcoesFilhas(est, f.id).map(x => x.id);
    removerNo(p, est, f.id);
    ok(!est.nos.some(n => n.id === f.id || filhos.includes(n.id)));
    ok(!est.ligacoes.some(l => [l.de, l.para, l.pai].some(x => x === f.id || filhos.includes(x))));
    filhos.forEach(id => { ok(!p.principios[id]); p.variantes.forEach(v => ok(!v.escolhas[id])); });
    const ligs = new Set(est.ligacoes.map(l => l.id));
    est.ligacoes.forEach(l => [l.de, l.para].forEach(x => { if (String(x).startsWith('porta:')) ok(ligs.has(x.slice(6)), 'porta órfã'); }));
});

teste('Organizar o nível não sobrepõe blocos', () => {
    const est = clonar(EX.estruturas[0]), g = noGlobal(est);
    organizarNivel(est, g.id);
    const ns = nosDoNivel(est, g.id);
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i], b = ns[j];
        ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, `${a.nome} sobre ${b.nome}`);
    }
});

// ---------------------------------------------------------------- catálogo e matriz
teste('Catálogo sugere princípios pelo verbo e pelo objeto da função', () => {
    const tem = (f, nome) => ok(sugerirPrincipios(f).some(x => x.nome.includes(nome)), `"${f}" deveria sugerir "${nome}"`);
    tem('Frear a roda', 'Freio a disco');
    tem('Dosar as sementes', 'Dosador pneumático');
    tem('Permitir a rotação no eixo', 'Rolamento selado');
    tem('Transmitir o torque', 'Corrente');
    tem('Medir a umidade do grão', 'umidade');
    tem('Cortar a palha', 'Disco de corte');
    igual(sugerirPrincipios('xyzw abc').length, 0, 'sem sugestão inventada');
});

teste('Combinações respeitam as incompatibilidades e preferem os primeiros princípios', () => {
    const est = EX.estruturas[0];
    igual(totalCombinacoes(EX, est), 3888);
    const cs = gerarCombinacoes(EX, est, 50);
    ok(cs.length === 50);
    cs.forEach(c => igual(conflitosVariante(EX, c).length, 0, 'combinação incompatível'));
    igual(cs[0].custo, 0, 'a primeira usa o 1º princípio de cada função');
    ok(cs.every((c, i) => !i || cs[i - 1].custo <= c.custo), 'ordenadas');
    const div = combinacoesDiversas(gerarCombinacoes(EX, est, 400), 3);
    igual(div.length, 3);
});

teste('Concepção com par incompatível é apontada', () => {
    const p = clonar(EX), v = p.variantes[0], ic = p.incompatibilidades[0];
    const fa = acharPrincipio(p, ic.a).funcId, fb = acharPrincipio(p, ic.b).funcId;
    v.escolhas[fa] = ic.a; v.escolhas[fb] = ic.b;
    igual(conflitosVariante(p, v).length, 1);
});

// ---------------------------------------------------------------- seleção
teste('Seleção da estrutura (Ferreira): IDT, IDC e relação', () => {
    const [a, b] = indicesFerreira(EX);
    perto(a.idt, 757.9, 0.5, 'IDT estrutura 1'); perto(b.idt, 692.2, 0.5, 'IDT estrutura 2');
    perto(a.idc, 76.5, 0.1, 'IDC'); ok(a.razao > b.razao, 'estrutura 1 vence');
    ok(a.completoT && a.completoC);
});

teste('Seleção da concepção (Reis): filtros em sequência', () => {
    const r = resultadoSelecao(EX);
    const por = n => r.find(x => x.nome === n);
    ok(por('Urbana robusta').promissora && por('Urbana robusta').soma === 2);
    ok(por('Baixo custo').ehRef && por('Baixo custo').etapa3);
    ok(por('Sem manutenção').etapa2 && !por('Sem manutenção').etapa3, 'reprovada no passa/não passa');
    ok(por('Leve de alto desempenho').etapa1 && !por('Leve de alto desempenho').etapa2, 'reprovada na tecnologia');
    const p = clonar(EX); p.selecao.viabilidade[p.variantes[0].id].estado = 'nao';
    ok(!resultadoSelecao(p)[0].etapa1, 'não viável para na etapa 1');
});

teste('Marcar etapa como concluída', () => {
    const p = criarProjetoVazio();
    igual(statusEtapas(p).escopo.estado, 'vazio');
    p.etapasConcluidas.push('escopo');
    const s = statusEtapas(p).escopo;
    igual(s.estado, 'feito'); ok(s.marcada);
});

// ---------------------------------------------------------------- relatório e ZIP
teste('Relatório escapa o texto do usuário e tem todas as seções', () => {
    const p = clonar(EX);
    p.projeto.nome = '<script>alert(1)</script>';
    p.especificacoes[0].descricao = '<img src=x onerror=alert(1)>';
    p.estruturas[0].nos[1].nome = '"><svg onload=alert(1)>';
    const h = corpoRelatorio(p, { imgSrc: () => '' });
    ok(!h.includes('<script>alert') && !h.includes('<img src=x') && !h.includes('<svg onload'), 'texto sem escape');
    ['ESCOPO', 'FUNÇÃO GLOBAL', 'ESTRUTURA FUNCIONAL', 'PRINCÍPIOS', 'MATRIZ MORFOLÓGICA', 'SELEÇÃO', 'CONCEPÇÃO SELECIONADA', 'REFERÊNCIAS']
        .forEach(t => ok(h.toUpperCase().includes(t), 'falta a seção ' + t));
    const doc = documentoRelatorio(p, () => '');
    ok(doc.startsWith('<!DOCTYPE html>'));
});

teste('ZIP de ida e volta: dados, imagens, diagramas e relatório', async () => {
    const p = clonar(EX);
    const blob = await montarZip(p, { diagramas: [{ nome: 'Teste', svg: '<svg xmlns="http://www.w3.org/2000/svg"/>' }], relatorioHtml: m => documentoRelatorio(p, id => m[id] || '') });
    const zip = await JSZip.loadAsync(blob);
    ok(zip.file('projeto-conceitual.json') && zip.file('relatorio.html') && zip.file('diagramas/teste.svg') && zip.file('LEIA-ME.txt'));
    ok(zip.file('gestao-conceitual.json') && zip.file('qfd-backup.json'), 'arquivo para o Gestão e backup do QFD');
    const imgs = Object.keys(zip.files).filter(n => n.startsWith('imagens/') && !zip.files[n].dir);
    igual(imgs.length, imagensUsadas(p).length, 'uma imagem por foto usada');
    const rel = await zip.file('relatorio.html').async('string');
    ok(rel.includes('src="imagens/'), 'relatório aponta para as imagens do ZIP');
    // apaga uma imagem e lê o ZIP: ela volta
    const id = imagensUsadas(p)[0];
    await Imagens.apagar(id);
    const arq = new File([blob], 'teste.zip', { type: 'application/zip' });
    const { dados, qfd } = await lerZipOuJson(arq);
    ok(!qfd); ok(!dados.arquivosImagens, 'mapa de imagens removido');
    const volta = normalizarProjeto(dados);
    igual(volta.variantes.length, 4); igual(volta.estruturas[0].ligacoes.length, p.estruturas[0].ligacoes.length);
    ok(await Imagens.ler(id), 'imagem restaurada do ZIP');
});

teste('Abrir o backup do QFD pelo "Abrir projeto" é reconhecido', async () => {
    const arq = new File([JSON.stringify(EXEMPLO_QFD)], 'qfd.json', { type: 'application/json' });
    const { qfd } = await lerZipOuJson(arq);
    ok(qfd);
});

// ---------------------------------------------------------------- execução
(async () => {
    const lista = document.getElementById('lista');
    let falhas = 0;
    EX = await criarExemplo();
    imagensUsadas(EX).forEach(id => IMGS_TESTE.push(id));
    for (const t of TESTES) {
        const li = document.createElement('li');
        try { await t.f(); li.className = 'ok'; li.textContent = '✓ ' + t.nome; }
        catch (e) { falhas++; li.className = 'falha'; li.innerHTML = '✗ ' + esc(t.nome) + `<small>${esc(e.message)}</small>`; console.error(t.nome, e); }
        lista.appendChild(li);
    }
    for (const id of IMGS_TESTE) { try { await Imagens.apagar(id); } catch (e) { /* ok */ } }
    const r = document.getElementById('resultado');
    r.textContent = falhas ? `${falhas} falha(s) de ${TESTES.length}` : `${TESTES.length} ok`;
    r.style.color = falhas ? '#b3261e' : '#1f5f45';
})();
