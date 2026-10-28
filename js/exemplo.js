/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * EXEMPLO: roda de bicicleta urbana — continuação do exemplo do Sistema QFD. Todas as etapas preenchidas,
 * com duas estruturas alternativas, princípios com imagens, quatro concepções e a seleção completa.
 */

'use strict';

/** Trecho do backup do QFD do exemplo (o mesmo que o Sistema QFD exporta). */
const EXEMPLO_QFD = {"projeto":{"nome":"Roda de bicicleta urbana (exemplo)","cliente":"Ciclistas urbanos","instituicao":"Projeto de exemplo do tutorial","equipe":["Equipe de projeto — exemplo"]},"requisitosCliente":[{"id":"aedd7b76-292b-46c6-9b15-f51f3bbb0d87","descricao":"Ser leve","classificacao":"","peso":0.14285714285714285},{"id":"7e2969d9-ec25-4f85-b2b0-718e73789bd0","descricao":"Ser resistente a buracos e meio-fio","classificacao":"","peso":0.5714285714285714},{"id":"f92e953d-6f94-4da3-9a35-e16e0c29a6a7","descricao":"Ter baixo custo","classificacao":"","peso":0.25},{"id":"da723f2f-7b59-451a-b44c-1a74cce38a9e","descricao":"Ter manutenção fácil","classificacao":"","peso":0},{"id":"5198cffc-f47c-4863-b201-2abb3ed1e520","descricao":"Ter rodagem suave e silenciosa","classificacao":"","peso":0.03571428571428571},{"id":"84d6ddd6-0be2-4c97-accc-39c5bd1bacd7","descricao":"Transmitir o movimento dos pedais ao solo","classificacao":"funcao","peso":0}],"requisitosProjeto":[{"id":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b","descricao":"Massa da roda (g)","classificacao":"","sentidoMelhoria":"down","dificuldadeTecnica":3,"importanciaAbsoluta":73,"pesoRelativo":0.17761557177615572,"observacao":"Roda completa, com aro, raios, cubo e fita, sem pneu."},{"id":"19b7beec-d522-4e3a-8a7b-74d08523f248","descricao":"Carga radial suportada (N)","classificacao":"","sentidoMelhoria":"up","dificuldadeTecnica":4,"importanciaAbsoluta":148,"pesoRelativo":0.36009732360097324,"observacao":"Carga sem deformação permanente do aro."},{"id":"34b94b38-b261-41dc-9a4a-f9dc8fb9336e","descricao":"Custo de fabricação (R$)","classificacao":"","sentidoMelhoria":"down","dificuldadeTecnica":2,"importanciaAbsoluta":63,"pesoRelativo":0.15328467153284672,"observacao":""},{"id":"fe615369-be28-4942-bb34-7da791abf416","descricao":"Número de raios (un)","classificacao":"","sentidoMelhoria":"none","dificuldadeTecnica":1,"importanciaAbsoluta":70,"pesoRelativo":0.170316301703163,"observacao":""},{"id":"82c2df14-d0d6-4c03-b36d-1bba0bd086d5","descricao":"Tempo de troca da câmara (min)","classificacao":"","sentidoMelhoria":"down","dificuldadeTecnica":2,"importanciaAbsoluta":0,"pesoRelativo":0,"observacao":""},{"id":"ebc1a46b-1b63-463f-aacb-cb896474938e","descricao":"Desvio lateral do aro (mm)","classificacao":"","sentidoMelhoria":"down","dificuldadeTecnica":4,"importanciaAbsoluta":57,"pesoRelativo":0.1386861313868613,"observacao":"Empeno medido girando a roda no cavalete."}],"especificacoesProjeto":[{"requisitoProjetoId":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b","unidadeMedida":"g","tipoMeta":"<=","valorMeta":1800,"valorMax":null,"tolerancia":null,"metaTexto":"","aspectosIndesejaveis":"RP2: Carga radial suportada (N) (correlação --)","formaAvaliacao":"Pesagem em balança","valorUnitario":null,"observacao":""},{"requisitoProjetoId":"19b7beec-d522-4e3a-8a7b-74d08523f248","unidadeMedida":"N","tipoMeta":">=","valorMeta":1500,"valorMax":null,"tolerancia":null,"metaTexto":"","aspectosIndesejaveis":"RP1: Massa da roda (g) (correlação --)","formaAvaliacao":"Simulação em bancada de teste","valorUnitario":null,"observacao":""},{"requisitoProjetoId":"34b94b38-b261-41dc-9a4a-f9dc8fb9336e","unidadeMedida":"R$","tipoMeta":"<=","valorMeta":180,"valorMax":null,"tolerancia":null,"metaTexto":"","aspectosIndesejaveis":"","formaAvaliacao":"Soma dos valores gastos com material, processos e mão de obra","valorUnitario":null,"observacao":""},{"requisitoProjetoId":"fe615369-be28-4942-bb34-7da791abf416","unidadeMedida":"un","tipoMeta":"=","valorMeta":32,"valorMax":null,"tolerancia":0,"metaTexto":"","aspectosIndesejaveis":"","formaAvaliacao":"Contagem em laboratório","valorUnitario":null,"observacao":""},{"requisitoProjetoId":"82c2df14-d0d6-4c03-b36d-1bba0bd086d5","unidadeMedida":"min","tipoMeta":"<=","valorMeta":5,"valorMax":null,"tolerancia":null,"metaTexto":"","aspectosIndesejaveis":"","formaAvaliacao":"Cronometragem em laboratório","valorUnitario":null,"observacao":""},{"requisitoProjetoId":"ebc1a46b-1b63-463f-aacb-cb896474938e","unidadeMedida":"mm","tipoMeta":"<=","valorMeta":0.5,"valorMax":null,"tolerancia":null,"metaTexto":"","aspectosIndesejaveis":"","formaAvaliacao":"Medição com relógio comparador","valorUnitario":null,"observacao":"Medido a 10 mm da borda do aro."}],"avaliacaoCompetitiva":{"produtos":[{"id":"nosso","nome":"Nosso produto","tipo":"nosso"},{"id":"00611ef9-079d-47fa-8d7c-2bc306847166","nome":"Roda de aço aro 26","tipo":"concorrente"},{"id":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","nome":"Roda de alumínio parede dupla","tipo":"concorrente"}],"notasCliente":[{"requisitoClienteId":"aedd7b76-292b-46c6-9b15-f51f3bbb0d87","produtoId":"nosso","nota":3},{"requisitoClienteId":"7e2969d9-ec25-4f85-b2b0-718e73789bd0","produtoId":"nosso","nota":3},{"requisitoClienteId":"f92e953d-6f94-4da3-9a35-e16e0c29a6a7","produtoId":"nosso","nota":4},{"requisitoClienteId":"da723f2f-7b59-451a-b44c-1a74cce38a9e","produtoId":"nosso","nota":3},{"requisitoClienteId":"5198cffc-f47c-4863-b201-2abb3ed1e520","produtoId":"nosso","nota":3},{"requisitoClienteId":"aedd7b76-292b-46c6-9b15-f51f3bbb0d87","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","nota":2},{"requisitoClienteId":"7e2969d9-ec25-4f85-b2b0-718e73789bd0","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","nota":4},{"requisitoClienteId":"f92e953d-6f94-4da3-9a35-e16e0c29a6a7","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","nota":5},{"requisitoClienteId":"da723f2f-7b59-451a-b44c-1a74cce38a9e","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","nota":3},{"requisitoClienteId":"5198cffc-f47c-4863-b201-2abb3ed1e520","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","nota":2},{"requisitoClienteId":"aedd7b76-292b-46c6-9b15-f51f3bbb0d87","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","nota":5},{"requisitoClienteId":"7e2969d9-ec25-4f85-b2b0-718e73789bd0","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","nota":3},{"requisitoClienteId":"f92e953d-6f94-4da3-9a35-e16e0c29a6a7","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","nota":2},{"requisitoClienteId":"da723f2f-7b59-451a-b44c-1a74cce38a9e","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","nota":4},{"requisitoClienteId":"5198cffc-f47c-4863-b201-2abb3ed1e520","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","nota":4}],"valoresTecnicos":[{"requisitoProjetoId":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b","produtoId":"nosso","valor":"1950"},{"requisitoProjetoId":"19b7beec-d522-4e3a-8a7b-74d08523f248","produtoId":"nosso","valor":"1400"},{"requisitoProjetoId":"34b94b38-b261-41dc-9a4a-f9dc8fb9336e","produtoId":"nosso","valor":"170"},{"requisitoProjetoId":"fe615369-be28-4942-bb34-7da791abf416","produtoId":"nosso","valor":"32"},{"requisitoProjetoId":"82c2df14-d0d6-4c03-b36d-1bba0bd086d5","produtoId":"nosso","valor":"6"},{"requisitoProjetoId":"ebc1a46b-1b63-463f-aacb-cb896474938e","produtoId":"nosso","valor":"0,6"},{"requisitoProjetoId":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","valor":"2600"},{"requisitoProjetoId":"19b7beec-d522-4e3a-8a7b-74d08523f248","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","valor":"1800"},{"requisitoProjetoId":"34b94b38-b261-41dc-9a4a-f9dc8fb9336e","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","valor":"90"},{"requisitoProjetoId":"fe615369-be28-4942-bb34-7da791abf416","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","valor":"36"},{"requisitoProjetoId":"82c2df14-d0d6-4c03-b36d-1bba0bd086d5","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","valor":"8"},{"requisitoProjetoId":"ebc1a46b-1b63-463f-aacb-cb896474938e","produtoId":"00611ef9-079d-47fa-8d7c-2bc306847166","valor":"1,2"},{"requisitoProjetoId":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","valor":"1700"},{"requisitoProjetoId":"19b7beec-d522-4e3a-8a7b-74d08523f248","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","valor":"1300"},{"requisitoProjetoId":"34b94b38-b261-41dc-9a4a-f9dc8fb9336e","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","valor":"260"},{"requisitoProjetoId":"fe615369-be28-4942-bb34-7da791abf416","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","valor":"28"},{"requisitoProjetoId":"82c2df14-d0d6-4c03-b36d-1bba0bd086d5","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","valor":"4"},{"requisitoProjetoId":"ebc1a46b-1b63-463f-aacb-cb896474938e","produtoId":"6a349fd9-e3e4-4870-8411-f5c81a2e446d","valor":"0,3"}]},"referencias":[{"id":"71429f0c-d75b-4ee1-aaf6-72dd54f789d6","tipo":"norma","identificacao":"ISO 4210-7","titulo":"Bicicletas — requisitos de segurança — métodos de ensaio de rodas e aros","resumo":"Define os ensaios de resistência de rodas e aros; base para a meta de carga radial e para o desvio lateral.","link":"","requisitos":[{"tipo":"cliente","id":"7e2969d9-ec25-4f85-b2b0-718e73789bd0"},{"tipo":"projeto","id":"19b7beec-d522-4e3a-8a7b-74d08523f248"},{"tipo":"projeto","id":"ebc1a46b-1b63-463f-aacb-cb896474938e"}]},{"id":"65d42ab7-3332-451d-a554-6c31aa14f15e","tipo":"produto","identificacao":"","titulo":"Roda de alumínio parede dupla (concorrente)","resumo":"Mais leve e com menor empeno, porém mais cara; referência para massa e desvio lateral.","link":"","requisitos":[{"tipo":"projeto","id":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b"},{"tipo":"projeto","id":"ebc1a46b-1b63-463f-aacb-cb896474938e"}]}],"cadernoIdeias":{"ideias":[{"id":"2bd4abc3-0753-4699-a245-1e18ddf3c81c","titulo":"Aro de alumínio com parede dupla","descricao":"Reduz a massa mantendo a rigidez; avaliar o custo no projeto conceitual.","status":"promissora","requisitos":[{"tipo":"projeto","id":"efaef15e-506c-4b70-ae7e-bb42a5c9d34b"},{"tipo":"projeto","id":"19b7beec-d522-4e3a-8a7b-74d08523f248"}]},{"id":"c311c04e-2004-4af2-8af7-1b470bfcba99","titulo":"Câmara com válvula de engate rápido","descricao":"","status":"nova","requisitos":[{"tipo":"cliente","id":"da723f2f-7b59-451a-b44c-1a74cce38a9e"}]}]},"fechamento":{"abstracao":["Requisitos de cliente: ser leve, resistente, de baixo custo, de manutenção fácil e de rodagem suave.\nRetirada a preferência pela cor do aro.","- Carga radial suportada (≥ 1500 N)\n- Massa da roda (≤ 1800 g)\n- Número de raios (= 32 un)\n- Custo de fabricação (≤ R$ 180)","- Carga radial suportada o maior possível\n- Massa da roda o menor possível\n- Número de raios adequado\n- Custo de fabricação o menor possível","- Suportar cargas elevadas\n- Ter massa reduzida","Sustentar e rolar a bicicleta, suportando cargas elevadas com massa reduzida."],"formulacoes":[{"id":"469b14d0-87a0-418e-9d1e-6aea1b61763c","texto":"Fazer uma roda de alumínio com 32 raios"},{"id":"44a6799c-0cba-48bb-9262-9b5a3b5fc066","texto":"Fazer uma roda leve e resistente"},{"id":"7631eb65-1793-4dff-97cb-d9e882aeac94","texto":"Sustentar e rolar a bicicleta com segurança"}],"formulacaoEscolhida":"7631eb65-1793-4dff-97cb-d9e882aeac94","funcaoGlobal":{"nome":"Sustentar e rolar a bicicleta","entradas":{"energia":["Torque dos pedais"],"material":["Peso do ciclista e da bicicleta"],"sinal":["Comando de freio"]},"saidas":{"energia":["Movimento de rolagem","Calor por atrito"],"material":["Carga transmitida ao solo"],"sinal":["Ruído de rolagem"]}}},"metadata":{"created":"2026-10-27T03:36:45.057Z","lastModified":"2026-10-27T03:36:45.090Z","schemaVersion":11}};

/** Desenhos simples (SVG) para mostrar o uso de fotos/esboços nos princípios e na concepção. */
const EXEMPLO_DESENHOS = {
    raios: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#fff"/><circle cx="100" cy="80" r="66" fill="none" stroke="#333" stroke-width="7"/><circle cx="100" cy="80" r="58" fill="none" stroke="#777" stroke-width="2"/>${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<line x1="${100 + 6 * Math.cos(a + 0.3)}" y1="${80 + 6 * Math.sin(a + 0.3)}" x2="${100 + 57 * Math.cos(a)}" y2="${80 + 57 * Math.sin(a)}" stroke="#555" stroke-width="1.2"/>`; }).join('')}<circle cx="100" cy="80" r="8" fill="#409580"/></svg>`,
    disco: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#fff"/><circle cx="100" cy="80" r="66" fill="#d9dfde" stroke="#333" stroke-width="7"/><circle cx="100" cy="80" r="40" fill="none" stroke="#b9c3c1" stroke-width="2"/><circle cx="100" cy="80" r="9" fill="#409580"/></svg>`,
    bracos: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#fff"/><circle cx="100" cy="80" r="66" fill="none" stroke="#333" stroke-width="9"/>${[0, 120, 240].map(g => `<path d="M100 80 L${100 + 60 * Math.cos((g - 90) * Math.PI / 180) - 7} ${80 + 60 * Math.sin((g - 90) * Math.PI / 180)} L${100 + 60 * Math.cos((g - 90) * Math.PI / 180) + 7} ${80 + 60 * Math.sin((g - 90) * Math.PI / 180)} Z" fill="#1d2b2b"/>`).join('')}<circle cx="100" cy="80" r="10" fill="#409580"/></svg>`,
    freioDisco: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#fff"/><circle cx="90" cy="85" r="55" fill="#c9d1d0" stroke="#555" stroke-width="3"/><circle cx="90" cy="85" r="20" fill="#fff" stroke="#555" stroke-width="3"/>${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return `<circle cx="${90 + 38 * Math.cos(a)}" cy="${85 + 38 * Math.sin(a)}" r="4" fill="#fff"/>`; }).join('')}<rect x="120" y="20" width="44" height="40" rx="8" fill="#b5462f"/><text x="142" y="45" font-size="11" text-anchor="middle" fill="#fff" font-family="Arial">pinça</text></svg>`,
    vbrake: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#fff"/><path d="M30 150 A90 90 0 0 1 170 150" fill="none" stroke="#333" stroke-width="10"/><rect x="58" y="70" width="12" height="40" fill="#b5462f"/><rect x="130" y="70" width="12" height="40" fill="#b5462f"/><path d="M64 70 L80 25 L120 25 L136 70" fill="none" stroke="#555" stroke-width="4"/></svg>`,
    rolamento: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><rect width="200" height="160" fill="#fff"/><circle cx="100" cy="80" r="60" fill="#c9d1d0" stroke="#555" stroke-width="3"/><circle cx="100" cy="80" r="28" fill="#fff" stroke="#555" stroke-width="3"/>${Array.from({ length: 9 }, (_, i) => { const a = i * 2 * Math.PI / 9; return `<circle cx="${100 + 44 * Math.cos(a)}" cy="${80 + 44 * Math.sin(a)}" r="10" fill="#8a9593" stroke="#333"/>`; }).join('')}</svg>`,
    esboco: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220"><rect width="320" height="220" fill="#fffef6"/><g fill="none" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"><circle cx="160" cy="110" r="88"/><circle cx="160" cy="110" r="78"/><circle cx="160" cy="110" r="12"/>${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<line x1="${160 + 12 * Math.cos(a + 0.4)}" y1="${110 + 12 * Math.sin(a + 0.4)}" x2="${160 + 78 * Math.cos(a)}" y2="${110 + 78 * Math.sin(a)}"/>`; }).join('')}<circle cx="160" cy="110" r="30" stroke="#b5462f"/></g><text x="200" y="30" font-family="Comic Sans MS, cursive" font-size="13" fill="#2c3e50">disco 160 mm</text><text x="12" y="210" font-family="Comic Sans MS, cursive" font-size="13" fill="#2c3e50">32 raios aço · blocagem rápida · pneu 700x38</text></svg>`
};

async function guardarDesenho(chave) {
    const svg = EXEMPLO_DESENHOS[chave];
    const id = uid('img');
    try { await Imagens.gravarBruto(id, new Blob([svg], { type: 'image/svg+xml' }), 'image/svg+xml', chave + '.svg'); return id; }
    catch (e) { return null; }
}

/** Monta o projeto de exemplo completo. */
async function criarExemplo() {
    const p = criarProjetoVazio();
    importarQFD(p, clonar(EXEMPLO_QFD), 'qfd-exemplo-roda-de-bicicleta.json');
    p.projeto.nome = 'Roda de bicicleta urbana (exemplo)';
    p.projeto.responsavel = 'Equipe de projeto — exemplo';
    p.restricoes = [
        { id: uid('rs'), texto: 'Compatível com quadros urbanos aro 700c (espaçamento do cubo de 100 mm na dianteira e 135 mm na traseira)' },
        { id: uid('rs'), texto: 'Atender à ABNT NBR 14714 (bicicletas — requisitos de segurança)' },
        { id: uid('rs'), texto: 'Usar processos de fabricação disponíveis nos fornecedores locais' }
    ];
    p.tipoProjeto = 'mecanico';
    const funcaoDe = { 'Carga radial': 'Transmitir a carga do cubo ao aro', 'Massa': 'Transmitir a carga do cubo ao aro', 'Desvio lateral': 'Permitir a rotação no eixo', 'Tempo de troca': 'Fixar a roda ao quadro', 'Número de raios': 'Transmitir a carga do cubo ao aro' };
    p.especificacoes.forEach(e => {
        const k = Object.keys(funcaoDe).find(x => e.descricao.startsWith(x));
        if (k) e.funcao = funcaoDe[k];
        if (/custo/i.test(e.descricao)) e.ehCusto = true;
    });
    p.diretrizes = { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true };

    // ---------- Estrutura 1: freio na roda ----------
    p.estruturas = [];
    const est = montarEstruturaInicial(p, []);
    est.nome = 'Estrutura 1 — freio na roda';
    est.descricao = 'A roda inclui o freio (disco, tambor ou pista no aro).';
    const g = noGlobal(est);
    const L0 = rot => est.ligacoes.find(l => !l.pai && semAcento(l.rotulo).startsWith(semAcento(rot)));
    const porta = rot => 'porta:' + L0(rot).id;
    const F = (nome, pai = g.id) => { const n = { id: uid('fn'), tipo: 'funcao', nome, pai, x: 0, y: 0, w: 170, h: 70, descricao: '' }; est.nos.push(n); return n; };
    const lig = (de, para, tipo, rotulo, pai = g.id) => est.ligacoes.push({ id: uid('lg'), de, para, tipo, rotulo, pai });
    const f1 = F('Fixar a roda ao quadro'), f6 = F('Receber o torque dos pedais'), f2 = F('Permitir a rotação no eixo'),
        f3 = F('Transmitir a carga do cubo ao aro'), f4 = F('Transmitir a carga ao solo'), f5 = F('Frear a roda');
    lig(porta('Peso'), f1.id, 'material', 'Peso');
    lig(f1.id, f2.id, 'material', 'Carga no eixo');
    lig(f2.id, f3.id, 'material', 'Carga no cubo');
    lig(f3.id, f4.id, 'material', 'Carga no aro');
    lig(f4.id, porta('Carga'), 'material', 'Carga ao solo');
    lig(porta('Torque'), f6.id, 'energia', 'Torque');
    lig(f6.id, f3.id, 'energia', 'Torque no cubo');
    lig(f3.id, f4.id, 'energia', 'Rotação do aro');
    lig(f4.id, porta('Movimento'), 'energia', 'Movimento');
    lig(porta('Comando'), f5.id, 'sinal', 'Comando de freio');
    lig(f5.id, f3.id, 'energia', 'Torque de frenagem');
    lig(f5.id, porta('Calor'), 'energia', 'Calor');
    lig(f4.id, porta('Ruído'), 'sinal', 'Ruído');
    // dentro de "Transmitir a carga ao solo"
    const f41 = F('Amortecer os impactos', f4.id), f42 = F('Contatar o solo', f4.id);
    const P4 = rot => 'porta:' + est.ligacoes.find(l => l.pai === g.id && (l.para === f4.id || l.de === f4.id) && l.rotulo === rot).id;
    lig(P4('Carga no aro'), f41.id, 'material', 'Carga no aro', f4.id);
    lig(f41.id, f42.id, 'material', 'Carga amortecida', f4.id);
    lig(f42.id, P4('Carga ao solo'), 'material', 'Carga ao solo', f4.id);
    lig(P4('Rotação do aro'), f42.id, 'energia', 'Rotação', f4.id);
    lig(f42.id, P4('Movimento'), 'energia', 'Movimento', f4.id);
    lig(f42.id, P4('Ruído'), 'sinal', 'Ruído', f4.id);
    organizarNivel(est, null); organizarNivel(est, g.id); organizarNivel(est, f4.id);
    p.estruturas.push(est);
    p.estruturaEscolhida = est.id;

    // ---------- Estrutura 2: freio fora da fronteira ----------
    const { estrutura: est2, mapa } = duplicarEstrutura(est, 'Estrutura 2 — freio no quadro');
    est2.descricao = 'Alterar as fronteiras do sistema: o freio fica no quadro e age sobre o aro.';
    removerNo(p, est2, mapa[f5.id]);
    ['Comando', 'Calor'].forEach(r => { const l = est2.ligacoes.find(x => !x.pai && semAcento(x.rotulo).startsWith(semAcento(r))); if (l) removerLigacao(est2, l.id); });
    est2.nos = est2.nos.filter(n => n.pai || n.tipo === 'funcao' || est2.ligacoes.some(l => l.de === n.id || l.para === n.id));
    organizarNivel(est2, null);
    p.estruturas.push(est2);

    // seleção da estrutura (Ferreira, 1997)
    const esp = nome => p.especificacoes.find(e => e.descricao.startsWith(nome));
    const dt = (a, b) => [a, b];
    const notas = { 'Massa': dt(5, 10), 'Carga': dt(10, 10), 'Número': dt(10, 5), 'Tempo': dt(10, 5), 'Desvio': dt(10, 5) };
    p.selecaoEstrutura.tecnicos = { [est.id]: {}, [est2.id]: {} };
    Object.entries(notas).forEach(([k, [a, b]]) => { const e = esp(k); if (e) { p.selecaoEstrutura.tecnicos[est.id][e.id] = a; p.selecaoEstrutura.tecnicos[est2.id][e.id] = b; } });
    const custo = esp('Custo');
    p.selecaoEstrutura.custos = [{ id: uid('ec'), descricao: custo.descricao, peso: Math.round(custo.peso * 1000) / 10, especId: custo.id }];
    p.selecaoEstrutura.notasCusto = { [est.id]: { [p.selecaoEstrutura.custos[0].id]: 5 }, [est2.id]: { [p.selecaoEstrutura.custos[0].id]: 5 } };

    // ---------- Princípios de solução ----------
    const imgs = {};
    for (const k of Object.keys(EXEMPLO_DESENHOS)) imgs[k] = await guardarDesenho(k);
    // [nome, descrição, método, imagem, maturidade, concorrentes que usam]
    const PR = (f, lista) => { p.principios[f.id] = lista.map(([nome, descricao, metodo, img, maturidade, conc]) => ({ id: uid('pr'), nome, descricao, metodo, imagem: img ? imgs[img] : null, sugerido: false, origem: 'manual', maturidade: maturidade || 'mercado', concorrentes: conc || [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' })); return p.principios[f.id]; };
    const ACO = 'Roda de aço aro 26', ALU = 'Roda de alumínio parede dupla';
    const [qr, , ep] = PR(f1, [
        ['Blocagem rápida (excêntrico)', 'Monta e desmonta sem ferramenta; prática para trocar a câmara.', 'Análise de sistemas técnicos existentes', null, 'mercado', [ALU]],
        ['Eixo com porcas', 'Simples e barato; exige chave e dificulta a troca.', 'Análise de sistemas técnicos existentes', null, 'mercado', [ACO]],
        ['Eixo passante (thru-axle)', 'Rígido e bem alinhado; exige garfo e quadro próprios.', 'Pesquisa bibliográfica']]);
    const [selado, cone, bucha] = PR(f2, [
        ['Rolamento selado (cartucho)', 'Protegido de água e poeira; troca como peça pronta.', 'Catálogo de projeto', 'rolamento', 'mercado', [ALU]],
        ['Rolamento de esferas cone e copo', 'Ajustável e barato; exige regulagem e lubrificação.', 'Análise de sistemas técnicos existentes', null, 'mercado', [ACO]],
        ['Bucha de bronze', 'Muito simples; atrito maior e desgaste.', 'Brainstorming']]);
    const [raios, bracos, disco] = PR(f3, [
        ['Raios de aço tensionados (32)', 'Leve, resistente e consertável; padrão do mercado.', 'Análise de sistemas técnicos existentes', 'raios', 'mercado', [ACO, ALU]],
        ['Braços (3) em compósito', 'Rígido e aerodinâmico; caro e difícil de consertar.', 'Pesquisa bibliográfica', 'bracos', 'adaptar'],
        ['Disco monobloco', 'Sem manutenção de raios; pesado e sensível a vento lateral.', 'Analogia direta', 'disco', 'adaptar']]);
    const [camara, tubeless, macico] = PR(f42, [
        ['Pneu com câmara de ar', 'Barato e fácil de reparar.', 'Análise de sistemas técnicos existentes', null, 'mercado', [ACO, ALU]],
        ['Pneu tubeless com selante', 'Fura menos e roda com pressão menor; montagem mais difícil.', 'Pesquisa bibliográfica'],
        ['Pneu maciço / sem ar', 'Nunca fura; pesado e pouco confortável.', 'Brainstorming', null, 'adaptar']]);
    const [largo, perfil, elast] = PR(f41, [
        ['Pneu largo de baixa pressão', 'O ar do pneu absorve buracos e trepidação.', 'Análise de sistemas técnicos existentes'],
        ['Aro de perfil baixo (flexível)', 'O aro flete um pouco e alivia os impactos.', 'Analogia direta', null, 'adaptar'],
        ['Elastômero no cubo', 'Coxim de borracha entre eixo e cubo.', 'Método 635', null, 'desenvolver']]);
    const [discoF, vb, tambor, contra] = PR(f5, [
        ['Freio a disco mecânico', 'Eficiente na chuva; acionado por cabo.', 'Catálogo de projeto', 'freioDisco'],
        ['Freio na pista do aro (V-brake)', 'Leve e barato; perde eficiência com água e gasta o aro.', 'Análise de sistemas técnicos existentes', 'vbrake', 'mercado', [ACO, ALU]],
        ['Freio a tambor no cubo', 'Fechado e quase sem manutenção; mais pesado.', 'Catálogo de projeto'],
        ['Contra-pedal', 'Freia pedalando para trás; só para a roda traseira.', 'Análise de sistemas técnicos existentes']]);
    const [cassete, rosca, interno] = PR(f6, [
        ['Cubo livre com cassete (freehub)', 'Rolamentos mais afastados no eixo; padrão atual.', 'Análise de sistemas técnicos existentes'],
        ['Roda livre rosqueada', 'Barata; eixo mais sujeito a empenar.', 'Análise de sistemas técnicos existentes', null, 'mercado', [ACO]],
        ['Cubo com marchas internas', 'Marchas protegidas no cubo; mais pesado e caro.', 'Pesquisa bibliográfica'],
        ['Pinhão fixo', 'Simples, sem roda livre; pouco prático na cidade.', 'Brainstorming']]);
    // princípios das funções que só existem na estrutura 2 seguem os da estrutura 1 (mesmo nome)
    est2.nos.filter(n => n.tipo === 'funcao').forEach(n => { const orig = est.nos.find(o => mapa[o.id] === n.id); if (orig && p.principios[orig.id]) p.principios[n.id] = p.principios[orig.id].map(x => Object.assign({}, x, { id: uid('pr'), imagem: null })); });

    // custo estimado de cada princípio (R$ por roda, valores ilustrativos)
    const CUSTO_EX = { 'Blocagem': 15, 'Eixo com porcas': 6, 'Eixo passante': 45, 'Rolamento selado': 20, 'Rolamento de esferas': 10, 'Bucha': 4,
        'Raios de aço': 45, 'Braços': 600, 'Disco monobloco': 220, 'Pneu com câmara': 25, 'Pneu tubeless': 60, 'Pneu maciço': 70,
        'Pneu largo': 5, 'Aro de perfil': 20, 'Elastômero': 25, 'Freio a disco': 40, 'Freio na pista': 20, 'Freio a tambor': 70, 'Contra-pedal': 55,
        'Cubo livre': 28, 'Roda livre': 15, 'Cubo com marchas': 260, 'Pinhão fixo': 12 };
    Object.values(p.principios).flat().forEach(x => {
        const k = Object.keys(CUSTO_EX).find(c => x.nome.startsWith(c));
        if (k) { x.custoValor = CUSTO_EX[k]; x.custo = CUSTO_EX[k] < 20 ? 'baixo' : CUSTO_EX[k] < 100 ? 'medio' : 'alto'; }
    });
    // desdobramento especificação → função (ligações feitas à mão na etapa Análises)
    const fPorNome = n => est.nos.find(x => x.nome === n);
    const ligaEsp = { 'Massa': [f3, f2], 'Carga radial': [f3, f42], 'Número de raios': [f3], 'Desvio lateral': [f2, f3], 'Tempo de troca': [f1, f42] };
    p.especificacoes.forEach(e => { const k = Object.keys(ligaEsp).find(x => e.descricao.startsWith(x)); if (k) e.funcoesIds = ligaEsp[k].map(n => n.id); });
    void fPorNome;
    p.incompatibilidades = [
        { id: uid('ic'), a: macico.id, b: largo.id, nota: 'Pneu maciço não trabalha com pressão de ar.' },
        { id: uid('ic'), a: contra.id, b: cassete.id, nota: 'O contra-pedal exige cubo próprio, sem roda livre de cassete.' },
        { id: uid('ic'), a: tambor.id, b: interno.id, nota: 'Tambor e marchas internas disputam o mesmo cubo.' }
    ];

    // ---------- Concepções ----------
    const V = (nome, cor, descricao, lista) => { const v = { id: uid('vr'), nome, cor, descricao, escolhas: {} }; lista.forEach(([f, x]) => v.escolhas[f.id] = x.id); p.variantes.push(v); return v; };
    const c1 = V('Urbana robusta', '#409580', 'Componentes de mercado com freio a disco', [[f1, qr], [f2, selado], [f3, raios], [f42, camara], [f41, largo], [f5, discoF], [f6, cassete]]);
    const c2 = V('Baixo custo', '#d4a017', 'A mais barata, com peças comuns', [[f1, { id: (p.principios[f1.id][1]).id }], [f2, cone], [f3, raios], [f42, camara], [f41, largo], [f5, vb], [f6, rosca]]);
    const c3 = V('Sem manutenção', '#c0392b', 'Nada para regular ou encher', [[f1, { id: p.principios[f1.id][1].id }], [f2, bucha], [f3, disco], [f42, macico], [f41, elast], [f5, contra], [f6, interno]]);
    const c4 = V('Leve de alto desempenho', '#2f6fb3', 'Compósito e eixo passante', [[f1, ep], [f2, selado], [f3, bracos], [f42, tubeless], [f41, perfil], [f5, discoF], [f6, cassete]]);

    // ---------- Seleção ----------
    const s = p.selecao;
    s.viabilidade = {
        [c1.id]: { estado: 'viavel', razao: 'Todos os componentes existem no mercado.' },
        [c2.id]: { estado: 'viavel', razao: 'Solução tradicional, já fabricada.' },
        [c3.id]: { estado: 'condicional', razao: 'Depende de achar pneu maciço com massa aceitável.' },
        [c4.id]: { estado: 'condicional', razao: 'Braços em compósito exigem molde e cura controlada.' }
    };
    const pt = s.tecnologia.perguntas.map(q => q.id);
    const resp = (ids, vals) => Object.fromEntries(ids.map((id, i) => [id, vals[i]]));
    s.tecnologia.respostas = {
        [c1.id]: resp(pt, ['sim', 'sim', 'sim', 'sim']),
        [c2.id]: resp(pt, ['sim', 'sim', 'sim', 'sim']),
        [c3.id]: resp(pt, ['sim', 'sim', 'nao', 'sim']),
        [c4.id]: resp(pt, ['nao', 'sim', 'nao', 'nao'])
    };
    const pp = s.passa.perguntas.map(q => q.id);
    const ordemNec = p.necessidades.map(n => n.descricao);
    const R = (mapaResp) => Object.fromEntries(pp.map((id, i) => [id, mapaResp[ordemNec[i]] || 'sim']));
    s.passa.respostas = {
        [c1.id]: R({ 'Ter baixo custo': 'talvez' }),
        [c2.id]: R({ 'Ser leve': 'talvez', 'Ter manutenção fácil': 'talvez' }),
        [c3.id]: R({ 'Ser leve': 'nao', 'Ter rodagem suave e silenciosa': 'nao' }),
        [c4.id]: R({})
    };
    s.avaliacao.referencia = c2.id;
    const cr = Object.fromEntries(s.avaliacao.criterios.map(c => [c.texto, c.id]));
    s.avaliacao.notas = {
        [c1.id]: { [cr['Ser leve']]: 0, [cr['Ser resistente a buracos e meio-fio']]: 1, [cr['Ter baixo custo']]: -1, [cr['Ter manutenção fácil']]: 1, [cr['Ter rodagem suave e silenciosa']]: 1 }
    };

    // Evolução das promissoras e avaliação final pelas especificações (Reis, 2003, etapas 2.6 e 2.7)
    const estimativas = { [c1.id]: ['1,75 kg', 'Ø 622 × 25 mm (aro 700c)', 'Massa somada por componente (aro 520 g, raios 32 × 6 g, cubos 480 g, disco 120 g, pneu/câmara 440 g). Disco e blocagem compatíveis com o quadro.'],
        [c2.id]: ['2,30 kg', 'Ø 622 × 25 mm', 'Aro de aço pesa mais; peças comuns no mercado.'] };
    concepcoesEmEvolucao(p).forEach(v => { const e = estimativas[v.id]; if (e) s.evolucao[v.id] = { massa: e[0], dimensoes: e[1], observacoes: e[2], imagem: null }; });
    s.final.participantes = 'Projetista, mecânico de oficina, ciclista usuário e responsável por compras';
    // notas 1–5 por especificação (Urbana robusta equilibrada; Baixo custo pesada demais: ponto fraco em massa)
    const notasFinais = { [c1.id]: [5, 4, 5, 3, 4, 3], [c2.id]: [4, 2, 4, 5, 3, 3] };
    const ordemEsp = [/Carga/, /Massa/, /raios/, /Custo/, /Desvio/, /troca/];
    concepcoesEmEvolucao(p).forEach(v => { const nn = notasFinais[v.id]; if (!nn) return; s.final.notas[v.id] = {};
        p.especificacoes.forEach(e => { const k = ordemEsp.findIndex(r => r.test(e.descricao)); if (k >= 0) s.final.notas[v.id][e.id] = nn[k]; }); });
    sugerirNotasFinais(p); // completa o que faltar

    // ---------- Concepção ----------
    p.concepcao.varianteId = c1.id;
    p.concepcao.descricao = rascunhoDescricaoExemplo(p, est, c1) + '\n\nO freio a disco mantém a eficiência na chuva e não desgasta o aro; os raios de aço tensionados dão resistência a buracos e meio-fio com massa baixa e conserto fácil.';
    p.concepcao.imagens = imgs.esboco ? [{ id: imgs.esboco, legenda: 'Esboço da concepção: 32 raios, disco de 160 mm, blocagem rápida' }] : [];
    p.concepcao.complementos = [{ id: uid('cp'), principioId: tubeless.id, nota: 'Oferecer aro compatível com tubeless como opcional, para reduzir furos.' }];
    p.concepcao.proximosPassos = PROXIMOS_PASSOS_PADRAO_EX;
    // FMEA da concepção: modos de falha sugeridos e ação nos críticos
    sugerirFMEA(p);
    p.fmea.forEach(l => { if (fmeaCritico(l)) l.acao = /Fratura|frenagem/i.test(l.modo) ? 'Ensaio no protótipo (ISO 4210-7) e revisão do dimensionamento' : 'Torque de aperto no manual e inspeção na revisão'; });
    // ---------- Projeto preliminar (início): pré-preenchido a partir da concepção, com algumas respostas ----------
    if (typeof preencherPreliminar === 'function') {
        preencherPreliminar(p);
        const pl = p.preliminar;
        pl.envelope = { c: '640', l: '120', a: '640', obs: 'Roda 700c dentro do garfo de 100 mm e da folga do quadro' };
        const param = { 'cubo': 'Cubo 32 furos, eixo passante 12 × 100 mm', 'raio': '32 raios de aço inox 2,0 mm, cruzamento 3', 'disco': 'Rotor de 160 mm, 6 parafusos', 'aro': 'Aro 622 × 25 mm, parede dupla' };
        pl.portadores.filter(x => x.papel !== 'auxiliar').forEach(x => { const k = Object.keys(param).find(k => semAcento(x.nome).includes(k)); if (k) x.parametro = param[k]; });
        pl.leiauteEscolhido = pl.leiautes[0].id;
        pl.leiautes[1].nome = 'Leiaute B — cubo com freio integrado'; pl.leiautes[1].dimensoes = 'Ø 622 × 25 mm'; pl.leiautes[1].massa = '1,95 kg'; pl.leiautes[1].custo = 210;
        ['clareza', 'simplicidade', 'seguranca', 'montagem', 'padronizacao', 'manutencao'].forEach(k => { pl.diretrizes[k] = { r: 'sim', acao: '' }; });
        pl.diretrizes.corrosao = { r: 'nao', acao: 'Raios em inox e aro anodizado' };
        pl.verificacao.funcao = { r: 'sim', acao: '' };
        pl.prototipo.ciclo[0].situacao = 'feito'; pl.prototipo.ciclo[0].notas = 'Roda montada com peças de mercado';
    }
    return normalizarProjeto(p);
}

const PROXIMOS_PASSOS_PADRAO_EX = '- Dimensionar aro, raios e cubo para a carga radial de 1500 N\n- Escolher o rotor (160 mm) e a pinça mecânica\n- Desenho de conjunto da roda com o cubo de 100 mm\n- Verificar a massa total (meta ≤ 1800 g) e o custo (≤ R$ 180)\n- Montar protótipo e ensaiar o desvio lateral do aro';

function rascunhoDescricaoExemplo(p, est, v) {
    const partes = funcoesFolha(est).filter(f => v.escolhas[f.id]).map(f => `${f.nome.charAt(0).toLowerCase() + f.nome.slice(1)}: ${(acharPrincipio(p, v.escolhas[f.id]) || {}).nome}`);
    return `A concepção "${v.nome}" sustenta e rola a bicicleta com: ${partes.join('; ')}.`;
}
