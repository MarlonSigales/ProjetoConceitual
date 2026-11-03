/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * FLUXO SIMPLIFICADO PARA PROJETOS ELÉTRICOS, ELETRÔNICOS, EMBARCADOS E DE AUTOMAÇÃO (todoQA 56)
 * Segue o fluxo de projeto simplificado de Marwedel (Embedded System Design, Springer): especificação →
 * diagrama de blocos → repositório de projeto (componentes de hardware e software de sistema já existentes) →
 * mapeamento da aplicação (o que é hardware e o que é software) → avaliação e validação → teste.
 * Simplificações em relação ao fluxo completo (Pahl, Reis):
 * - sem abstração em 5 passos, matriz morfológica longa e seleção entre concepções: cada bloco recebe uma solução;
 * - quando já existe uma solução para o bloco (módulo pronto no mercado, solução já usada pela equipe ou princípio
 *   "existe pronto"), o sistema sugere usá-la: o bloco reaproveitado só precisa do teste de integração;
 * - os blocos a desenvolver são mapeados em hardware, software ou ambos, com a plataforma;
 * - o plano de testes segue o Modelo V (unidade → integração → sistema → aceitação, com uso e mau uso).
 */

'use strict';

const ETAPAS_SIMPL = [
    ['escopo', '1', 'Especificação'],
    ['funcao-global', '2', 'Função global'],
    ['estrutura', '3', 'Diagrama de blocos'],
    ['blocos', '4', 'Soluções dos blocos'],
    ['concepcao', '5', 'Concepção e plano de testes'],
    ['analises', '6', 'Análises e TRL'],
    ['relatorio', '7', 'Relatório']
];
/** Títulos das páginas no fluxo simplificado: [título, subtítulo]. */
const TITULOS_SIMPL = {
    escopo: ['Especificação', 'Especificações do QFD (o que o sistema deve atender) e a formulação do problema. No fluxo simplificado não é preciso fazer a abstração em 5 passos.'],
    estrutura: ['Diagrama de blocos', 'Os blocos do sistema e o que passa entre eles: energia, sinal e material. Use o modelo pronto de automação ou de sistema elétrico e ajuste.'],
    blocos: ['Soluções dos blocos', 'Para cada bloco: usar uma solução que já existe (só falta o teste de integração) ou desenvolver, dizendo se é hardware, software ou os dois (Marwedel).'],
    concepcao: ['Concepção e plano de testes', 'A concepção é o conjunto das soluções dos blocos. Descreva-a, faça a FMEA e confira o plano de testes do Modelo V.']
};
const TIPOS_SIMPLIFICAVEIS = ['eletrico', 'automacao', 'misto'];
const ALOCACOES = { hw: 'Hardware', sw: 'Software', hwsw: 'Hardware + software' };
const REF_MARWEDEL = 'MARWEDEL, P. <i>Embedded system design: embedded systems foundations of cyber-physical systems, and the Internet of Things</i>. 4. ed. Cham: Springer, 2021.';

/**
 * Soluções que já existem no mercado para blocos comuns de projetos elétricos, eletrônicos e de automação.
 * [radicais procurados no nome do bloco, [[nome, descrição, alocação], …]]
 */
const MODULOS_PRONTOS = [
    [['aliment', 'energiz', 'fonte', 'receber a energia', 'bateria', 'suprir'], [
        ['Fonte chaveada CA-CC (trilho DIN)', 'Converte 127/220 V CA em 5, 12 ou 24 V CC, com proteção contra curto e sobretensão; certificada.', 'hw'],
        ['Conversor CC-CC (buck/boost)', 'Ajusta a tensão da bateria ou da fonte para a eletrônica, com eficiência acima de 85 %.', 'hw'],
        ['Bateria de lítio com BMS', 'Pacote com proteção de carga, descarga, corrente e temperatura.', 'hw'],
        ['Controlador de carga solar MPPT', 'Carrega a bateria a partir do painel fotovoltaico.', 'hw']]],
    [['proteg', 'seguranc', 'surto'], [
        ['Disjuntor termomagnético', 'Proteção contra sobrecarga e curto-circuito (curva conforme a carga).', 'hw'],
        ['Dispositivo de proteção contra surtos (DPS)', 'Desvia surtos da rede e de descargas atmosféricas.', 'hw'],
        ['Fusível e porta-fusível', 'Proteção simples e barata de ramais e da eletrônica.', 'hw'],
        ['Watchdog do microcontrolador', 'Reinicia o programa travado; já existe no microcontrolador, só configurar.', 'sw']]],
    [['convert', 'transform', 'tensao', 'inverter'], [
        ['Conversor CC-CC (buck/boost)', 'Módulo pronto para baixar ou elevar a tensão contínua.', 'hw'],
        ['Inversor CC-CA', 'Gera tensão alternada a partir da bateria.', 'hw'],
        ['Transformador', 'Isola e adapta a tensão alternada.', 'hw']]],
    [['distribu', 'barrament', 'quadro'], [
        ['Quadro de distribuição com barramento e bornes', 'Distribui a energia entre os circuitos, com identificação.', 'hw'],
        ['Régua de bornes / conectores de engate rápido', 'Ligações padronizadas e fáceis de trocar.', 'hw']]],
    [['medi', 'capt', 'detect', 'sensor', 'monitor', 'sentir', 'ler '], [
        ['Sensor de temperatura digital (DS18B20) ou PT100 com transmissor 4–20 mA', 'Leitura de temperatura pronta, calibrada de fábrica.', 'hw'],
        ['Célula de carga com amplificador HX711', 'Medida de força ou massa com conversor dedicado.', 'hw'],
        ['Sensor de corrente (efeito Hall ou TC)', 'Mede a corrente sem interromper o circuito.', 'hw'],
        ['Multimedidor de energia com Modbus', 'Tensão, corrente, potência e consumo prontos para ler.', 'hw'],
        ['Encoder incremental', 'Posição e velocidade de eixos.', 'hw'],
        ['Sensor indutivo ou capacitivo de proximidade', 'Detecta presença de peças ou de material.', 'hw'],
        ['Unidade inercial (IMU) MPU-6050', 'Aceleração e giro em três eixos.', 'hw'],
        ['Receptor GNSS (GPS)', 'Posição e velocidade por satélite.', 'hw']]],
    [['condicion', 'filtr', 'amplific', 'digitaliz', 'adequar o sinal'], [
        ['Conversor A/D de 16 bits (ADS1115)', 'Digitaliza sinais analógicos com boa resolução, via I²C.', 'hw'],
        ['Amplificador de instrumentação (INA125)', 'Amplifica sinais pequenos de pontes e sensores.', 'hw'],
        ['Transmissor de sinal 4–20 mA', 'Sinal robusto a ruído em cabos longos.', 'hw'],
        ['Optoacoplador / isolador de sinal', 'Isola a eletrônica de controle da potência.', 'hw'],
        ['Filtro digital (média móvel, Kalman) em biblioteca', 'Filtragem no programa, sem componente a mais.', 'sw']]],
    [['process', 'control', 'decid', 'comand', 'regul', 'gerenc', 'calcul'], [
        ['Microcontrolador ESP32', 'Processamento com Wi-Fi e Bluetooth; grande base de bibliotecas.', 'hwsw'],
        ['Microcontrolador STM32 ou Arduino', 'Processamento de tempo real com periféricos prontos.', 'hwsw'],
        ['Controlador lógico programável (CLP)', 'Controle industrial robusto, programado em ladder ou texto estruturado.', 'hwsw'],
        ['Computador embarcado (Raspberry Pi)', 'Linux, visão computacional e interfaces web.', 'hwsw'],
        ['Biblioteca de controle PID', 'Controlador PID pronto e testado (só ajustar os ganhos).', 'sw'],
        ['Sistema operacional de tempo real (FreeRTOS)', 'Tarefas com prioridade e temporização garantida.', 'sw']]],
    [['acion', 'atua', 'motor', 'mover', 'girar', 'aquec', 'carga', 'valvul'], [
        ['Driver de motor CC em ponte H (BTS7960)', 'Aciona e inverte motores CC com PWM.', 'hw'],
        ['Driver de motor de passo (TMC2209)', 'Micropasso silencioso, com detecção de travamento.', 'hw'],
        ['Controlador de motor BLDC (ESC)', 'Acionamento de motor sem escovas.', 'hw'],
        ['Inversor de frequência', 'Velocidade variável de motor de indução trifásico.', 'hw'],
        ['Módulo de relé ou contator', 'Liga e desliga cargas com isolação.', 'hw'],
        ['Relé de estado sólido (SSR)', 'Chaveamento silencioso e rápido de cargas resistivas.', 'hw']]],
    [['comunic', 'transmit', 'enviar', 'rede', 'dados', 'conect'], [
        ['Wi-Fi com MQTT (ESP32)', 'Envia dados para a nuvem ou um servidor local.', 'hwsw'],
        ['LoRa / LoRaWAN (SX1276)', 'Longo alcance e baixo consumo no campo.', 'hwsw'],
        ['RS-485 com Modbus RTU (MAX485)', 'Rede industrial com cabos longos.', 'hwsw'],
        ['Barramento CAN (MCP2515) / ISOBUS', 'Rede de máquinas e implementos.', 'hwsw'],
        ['Modem 4G / NB-IoT', 'Conexão onde não há Wi-Fi.', 'hwsw'],
        ['Bluetooth Low Energy', 'Ligação com o celular a curta distância.', 'hwsw']]],
    [['inform', 'indic', 'exib', 'mostr', 'alert', 'sinaliz', 'usuario', 'operador', 'interag'], [
        ['Display OLED ou LCD', 'Mostra valores e estados no equipamento.', 'hw'],
        ['IHM com tela de toque', 'Interface pronta para operador industrial.', 'hwsw'],
        ['LED e buzzer de estado', 'Indicação simples de funcionamento e falha.', 'hw'],
        ['Painel web (Node-RED ou Grafana)', 'Gráficos e comandos pelo navegador.', 'sw'],
        ['Aplicativo de celular via BLE', 'Configuração e leitura pelo telefone.', 'sw']]],
    [['registr', 'armazen', 'grav', 'guardar', 'historic'], [
        ['Cartão microSD (sistema de arquivos FAT)', 'Registro local de dados em CSV.', 'hwsw'],
        ['Relógio de tempo real (DS3231)', 'Data e hora corretas mesmo sem energia.', 'hw'],
        ['Banco de dados de séries temporais (InfluxDB)', 'Histórico na nuvem ou num servidor local.', 'sw']]],
    [['localiz', 'posicion', 'guiar', 'navegar'], [
        ['Receptor GNSS RTK', 'Posição com precisão centimétrica.', 'hw'],
        ['Encoder absoluto', 'Posição angular sem perder a referência.', 'hw']]],
    [['aterr', 'isol', 'vedar', 'abrig', 'acondicion'], [
        ['Caixa com grau de proteção IP65', 'Abriga a eletrônica contra poeira e jatos de água.', 'hw'],
        ['Prensa-cabos e conectores com vedação', 'Entrada de cabos sem perder o grau IP.', 'hw'],
        ['Haste e barramento de aterramento', 'Segurança das pessoas e referência para o ruído.', 'hw']]],
    [['dissip', 'resfri', 'esfri', 'ventil', 'calor'], [
        ['Dissipador com ventilador', 'Retira o calor dos semicondutores de potência.', 'hw'],
        ['Controle de ventilação por termostato', 'Liga a ventilação só quando precisa.', 'hw']]]
];

function fluxoSimplificado(p) { return !!p && p.fluxo === 'simplificado'; }
function estSimpl(p) { return p.estruturas.find(e => e.id === p.estruturaEscolhida) || p.estruturas[0] || null; }
function blocoDe(p, fid) { return p.blocos[fid] || (p.blocos[fid] = { decisao: '', principioId: '', alocacao: '', plataforma: '', testes: '' }); }

/** Módulos prontos que servem para um bloco (pelo nome). */
function modulosParaBloco(nome) {
    const n = ' ' + semAcento(nome).replace(/[^a-z0-9 ]+/g, ' ') + ' ';
    const pont = MODULOS_PRONTOS.map(([chaves, mods], i) => [chaves.filter(c => n.includes(c.includes(' ') ? c : ' ' + c) || n.includes(c)).length, i, mods]).filter(x => x[0] > 0);
    pont.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const out = [], vistos = new Set();
    pont.slice(0, 2).forEach(([, , mods]) => mods.forEach(([nome, descricao, alocacao]) => { const k = semAcento(nome); if (!vistos.has(k)) { vistos.add(k); out.push({ nome, descricao, alocacao }); } }));
    return out.slice(0, 7);
}

/**
 * Soluções que já existem para o bloco, na ordem de preferência: as do próprio projeto marcadas "existe pronto",
 * as já usadas pela equipe (biblioteca de projetos anteriores) e os módulos prontos do mercado.
 */
function solucoesExistentes(p, f) {
    const out = [], vistos = new Set();
    const add = (x) => { const k = semAcento(x.nome); if (!x.nome || vistos.has(k)) return; vistos.add(k); out.push(x); };
    principiosDe(p, f.id).filter(x => x.maturidade === 'mercado' && x.origem !== 'catalogo' && !/^desenvolver/i.test(x.nome))
        .forEach(x => add({ nome: x.nome, descricao: x.descricao, fonte: x.origem === 'modulo' ? (x.fonte || 'Solução existente') : 'Já neste projeto', tipo: 'projeto', principioId: x.id, alocacao: x.alocacao || '' }));
    if (typeof sugerirDaBiblioteca === 'function') sugerirDaBiblioteca(f.nome, 4).forEach(i => add({ nome: i.nome, descricao: i.descricao, fonte: `Já usada pela equipe${i.projeto ? ' no projeto ' + i.projeto : ''}`, tipo: 'biblioteca', alocacao: '' }));
    modulosParaBloco(f.nome).forEach(m => add({ nome: m.nome, descricao: m.descricao, fonte: 'Módulo pronto no mercado', tipo: 'modulo', alocacao: m.alocacao }));
    return out;
}

/** Usa uma solução existente no bloco (cria o princípio, se preciso). */
function usarSolucaoExistente(p, f, s) {
    const l = principiosDe(p, f.id);
    let x = s.principioId ? l.find(y => y.id === s.principioId) : l.find(y => semAcento(y.nome) === semAcento(s.nome));
    if (!x) {
        x = { id: uid('pr'), nome: s.nome, descricao: s.descricao || '', imagem: null, metodo: 'Repositório de projeto (Marwedel)', sugerido: true, origem: 'modulo', maturidade: 'mercado',
            concorrentes: [], fonte: s.fonte || '', imagemUrl: '', vantagens: 'Já existe e está validada: só falta o teste de integração.', desvantagens: '', alocacao: s.alocacao || '' };
        l.push(x);
    } else if (!x.maturidade) x.maturidade = 'mercado';
    const b = blocoDe(p, f.id);
    Object.assign(b, { decisao: 'reuso', principioId: x.id });
    if (!b.alocacao && (s.alocacao || x.alocacao)) b.alocacao = s.alocacao || x.alocacao;
}

/** Marca o bloco para desenvolver (princípio "Desenvolver …", TRL baixo). */
function desenvolverBloco(p, f, alocacao) {
    const l = principiosDe(p, f.id), b = blocoDe(p, f.id);
    let x = l.find(y => y.id === b.principioId && y.origem !== 'modulo') || l.find(y => /^desenvolver/i.test(y.nome));
    if (!x) {
        x = { id: uid('pr'), nome: `Desenvolver: ${f.nome.charAt(0).toLowerCase() + f.nome.slice(1)}`, descricao: '', imagem: null, metodo: 'Desenvolvimento próprio', sugerido: false, origem: 'manual',
            maturidade: 'desenvolver', concorrentes: [], fonte: '', imagemUrl: '', vantagens: '', desvantagens: '' };
        l.push(x);
    }
    Object.assign(b, { decisao: 'desenvolver', principioId: x.id });
    if (alocacao) b.alocacao = alocacao;
    else if (!b.alocacao) b.alocacao = /process|control|decid|calcul|registr|comunic|inform/.test(semAcento(f.nome)) ? 'sw' : 'hw';
}

/** A concepção do fluxo simplificado é uma só: a combinação das soluções escolhidas nos blocos. */
function sincronizarConcepcaoSimpl(p) {
    if (!fluxoSimplificado(p)) return;
    const est = estSimpl(p); if (!est) return;
    const folhas = funcoesFolha(est), escolhas = {};
    folhas.forEach(f => { const b = p.blocos[f.id]; if (b && b.principioId && principiosDe(p, f.id).some(x => x.id === b.principioId)) escolhas[f.id] = b.principioId; });
    if (!Object.keys(escolhas).length) return;
    let v = p.variantes.find(x => x.id === p.concepcao.varianteId) || p.variantes.find(x => x.simplificada);
    if (!v) { v = typeof novaVariante === 'function' ? novaVariante(p, {}) : (p.variantes.push({ id: uid('vr'), nome: 'Concepção', cor: '#409580', escolhas: {}, descricao: '' }), p.variantes[p.variantes.length - 1]); v.nome = 'Concepção por blocos'; }
    v.simplificada = true;
    v.escolhas = Object.assign({}, v.escolhas, escolhas);
    p.concepcao.varianteId = v.id;
    p.selecao.viabilidade[v.id] = Object.assign({ estado: 'viavel', razao: 'Concepção única do fluxo simplificado (soluções dos blocos).' }, p.selecao.viabilidade[v.id] || {});
}

/** Plano de testes do Modelo V. Bloco reaproveitado: só integração. Bloco a desenvolver: unidade e integração. */
function planoTestes(p) {
    const est = estSimpl(p), linhas = [];
    if (!est) return linhas;
    const folhas = funcoesFolha(est);
    const ligacoes = (f) => est.ligacoes.filter(l => l.de === f.id || l.para === f.id).map(l => l.rotulo || TIPOS_FLUXO[l.tipo]).filter(Boolean);
    folhas.forEach(f => {
        const b = p.blocos[f.id] || {}, x = b.principioId ? acharPrincipio(p, b.principioId) : null;
        const nome = `F${numeroFuncao(est, f.id)} ${f.nome}`, sol = x ? x.nome : 'solução não definida';
        const ifs = ligacoes(f), alv = ALOCACOES[b.alocacao] || '';
        if (b.decisao === 'desenvolver') {
            linhas.push({ nivel: 'Unidade', bloco: nome, teste: b.alocacao === 'sw' ? 'Teste do programa isolado (simulação, testes unitários, casos de borda)' : b.alocacao === 'hwsw' ? 'Bancada do hardware e teste do firmware isolados' : 'Bancada: medição das grandezas do bloco com instrumentos (limites de trabalho, pico e falha)', criterio: `${sol}${alv ? ' — ' + alv.toLowerCase() : ''}${b.plataforma ? ' em ' + b.plataforma : ''}` });
        }
        linhas.push({ nivel: 'Integração', bloco: nome, teste: `Ligar ${b.decisao === 'reuso' ? 'o módulo existente' : 'o bloco'} aos vizinhos e conferir ${ifs.length ? 'as interfaces: ' + ifs.join(', ') : 'as interfaces (sinais, energia, protocolo e tempos)'}`,
            criterio: b.decisao === 'reuso' ? `${sol}: solução existente — só falta este teste` : b.testes || 'Sinais e tempos dentro do especificado' });
    });
    (typeof especsUsadas === 'function' ? especsUsadas(p) : p.especificacoes).filter(e => !e.ehCusto && (e.descricao || '').trim()).forEach(e => {
        linhas.push({ nivel: 'Sistema', bloco: 'Sistema integrado', teste: `Verificar: ${e.descricao}${e.avaliacao ? ' (' + e.avaliacao + ')' : ''}`, criterio: e.meta ? `Meta ${e.meta}${e.unidade ? ' ' + e.unidade : ''}` : 'Meta da especificação' });
    });
    linhas.push({ nivel: 'Aceitação', bloco: 'Uso', teste: 'Uso real pelo cliente nas condições do campo ou da instalação', criterio: 'Cliente aprova; especificações confirmadas em uso' });
    linhas.push({ nivel: 'Aceitação', bloco: 'Mau uso', teste: 'Entradas fora da faixa, falta e retorno de energia, cabo ou sensor desligado, comandos errados do operador', criterio: 'Falha segura, sem dano, com aviso ao usuário' });
    return linhas;
}

function htmlPlanoTestes(p) {
    const l = planoTestes(p);
    if (!l.length) return '';
    const cont = n => l.filter(x => x.nivel === n).length;
    return `<section class="card plano-testes"><div class="card-topo"><h2>Plano de testes (Modelo V)</h2></div>
        <p class="nota">Unidade ${cont('Unidade')} · integração ${cont('Integração')} · sistema ${cont('Sistema')} · aceitação ${cont('Aceitação')}. Blocos com solução existente não precisam de teste de unidade: só o de integração. Os testes de sistema seguem as especificações; os de aceitação incluem uso e mau uso.</p>
        <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Nível</th><th>Bloco</th><th>Teste</th><th>Critério</th></tr></thead><tbody>
        ${l.map(x => `<tr><td><b>${esc(x.nivel)}</b></td><td>${esc(x.bloco)}</td><td>${esc(x.teste)}</td><td>${esc(x.criterio)}</td></tr>`).join('')}</tbody></table></div></section>`;
}

// ============================================================================
// SITUAÇÃO E PENDÊNCIAS NO FLUXO SIMPLIFICADO
// ============================================================================

function statusSimplificado(p, st) {
    const est = estSimpl(p), folhas = est ? funcoesFolha(est) : [];
    const s = (feito, andamento, resumo) => ({ estado: feito ? 'feito' : andamento ? 'andamento' : 'vazio', resumo });
    const dec = folhas.filter(f => { const b = p.blocos[f.id]; return b && b.decisao && b.principioId; });
    const reuso = dec.filter(f => p.blocos[f.id].decisao === 'reuso').length;
    const out = {
        escopo: s(p.especificacoes.length > 0 && p.formulacao.trim(), p.especificacoes.length || p.formulacao.trim(), `${p.especificacoes.length} especificação(ões)`),
        blocos: s(folhas.length > 0 && dec.length === folhas.length && dec.every(f => p.blocos[f.id].decisao === 'reuso' || p.blocos[f.id].alocacao), dec.length > 0,
            folhas.length ? `${dec.length}/${folhas.length} bloco(s) com solução · ${reuso} reaproveitado(s)` : 'monte o diagrama de blocos')
    };
    ['principios', 'matriz', 'selecao'].forEach(id => { out[id] = s(true, true, 'não usado no fluxo simplificado'); });
    return out;
}

{
    const pendenciasCompleto = pendencias;
    // eslint-disable-next-line no-global-assign
    pendencias = function (p) {
        const l = pendenciasCompleto(p);
        if (!fluxoSimplificado(p)) return l;
        const out = l.filter(x => !['principios', 'matriz', 'selecao'].includes(x.etapa) && !/^Abstração orientada/.test(x.texto) && !/matriz morfológica|Nenhuma concepção escolhida/.test(x.texto));
        const est = estSimpl(p);
        if (est) {
            const folhas = funcoesFolha(est);
            const sem = folhas.filter(f => { const b = p.blocos[f.id]; return !b || !b.decisao || !b.principioId; });
            if (sem.length) out.push({ nivel: 'alta', texto: `Blocos sem solução (usar uma existente ou desenvolver): ${sem.map(f => f.nome).join('; ')}.`, etapa: 'blocos' });
            const semAloc = folhas.filter(f => { const b = p.blocos[f.id]; return b && b.decisao === 'desenvolver' && !b.alocacao; });
            if (semAloc.length) out.push({ nivel: 'media', texto: `Blocos a desenvolver sem dizer se são hardware ou software: ${semAloc.map(f => f.nome).join('; ')}.`, etapa: 'blocos' });
            const comSug = folhas.filter(f => { const b = p.blocos[f.id]; return b && b.decisao === 'desenvolver' && solucoesExistentes(p, f).some(x => x.tipo !== 'projeto'); });
            if (comSug.length) out.push({ nivel: 'info', texto: `Já existe solução pronta para blocos marcados para desenvolver: ${comSug.map(f => f.nome).join('; ')}. Reaproveitar reduz o risco: sobra só o teste de integração.`, etapa: 'blocos' });
        }
        return out;
    };
}

// ============================================================================
// INÍCIO: ESCOLHA DO FLUXO
// ============================================================================

function htmlEscolhaFluxo(p) {
    if (!TIPOS_SIMPLIFICAVEIS.includes(p.tipoProjeto) && !fluxoSimplificado(p)) return '';
    const s = fluxoSimplificado(p);
    return `<div class="tipo-projeto escolha-fluxo"><span class="tipo-rotulo">Fluxo do projeto:</span>
        <div class="tipos" role="radiogroup" aria-label="Fluxo do projeto">
            <button type="button" role="radio" aria-checked="${!s}" class="tipo ${s ? '' : 'ativo'}" data-acao="fluxo" data-fluxo="">Completo (Pahl, Reis): matriz morfológica e seleção</button>
            <button type="button" role="radio" aria-checked="${s}" class="tipo ${s ? 'ativo' : ''}" data-acao="fluxo" data-fluxo="simplificado">⚡ Simplificado (Marwedel): blocos, reuso e hardware × software</button></div>
        <small>O simplificado tem menos etapas: diagrama de blocos, solução de cada bloco (sugere usar o que já existe, que só precisa do teste de integração) e plano de testes do Modelo V.</small></div>`;
}

Object.assign(ACOES, {
    'fluxo': b => {
        PC.p.fluxo = b.dataset.fluxo === 'simplificado' ? 'simplificado' : '';
        if (fluxoSimplificado(PC.p)) prepararBlocosDoProjeto(PC.p);
        salvar(); renderPagina(true);
        avisar(fluxoSimplificado(PC.p) ? 'Fluxo simplificado: as etapas agora são especificação, função global, diagrama de blocos, soluções dos blocos, concepção e plano de testes.' : 'Fluxo completo: matriz morfológica e seleção entre concepções.', 'ok', 6000);
    },
    'blk-usar': b => {
        const p = PC.p, est = estSimpl(p), f = est && est.nos.find(n => n.id === b.dataset.f);
        if (!f) return;
        const s = solucoesExistentes(p, f)[+b.dataset.i];
        if (!s) return;
        usarSolucaoExistente(p, f, s); sincronizarConcepcaoSimpl(p); salvar(); renderPagina(true);
        avisar(`"${s.nome}" em ${f.nome}: solução existente, falta só o teste de integração.`, 'ok', 5000);
    },
    'blk-outra': b => {
        const p = PC.p, est = estSimpl(p), f = est && est.nos.find(n => n.id === b.dataset.f);
        const i = document.getElementById('blk-outra-' + b.dataset.f), nome = i ? i.value.trim() : '';
        if (!f || !nome) { avisar('Escreva o nome da solução que já existe (ex.: o módulo ou a placa usada antes).', 'erro'); return; }
        usarSolucaoExistente(p, f, { nome, descricao: '', fonte: 'Informada pela equipe', alocacao: '' }); sincronizarConcepcaoSimpl(p); salvar(); renderPagina(true);
    },
    'blk-desenvolver': b => {
        const p = PC.p, est = estSimpl(p), f = est && est.nos.find(n => n.id === b.dataset.f);
        if (!f) return;
        desenvolverBloco(p, f, b.dataset.aloc || ''); sincronizarConcepcaoSimpl(p); salvar(); renderPagina(true);
    },
    'blk-limpar': b => { const bl = PC.p.blocos[b.dataset.f]; if (bl) Object.assign(bl, { decisao: '', principioId: '' }); salvar(); renderPagina(true); },
    'blk-sugestoes': () => {
        const p = PC.p, est = estSimpl(p); if (!est) return;
        const n = aplicarSugestoesBlocos(p);
        sincronizarConcepcaoSimpl(p); salvar(); renderPagina(true);
        avisar(n.reuso + n.dev ? `${n.reuso} bloco(s) com solução existente e ${n.dev} para desenvolver. Revise.` : 'Todos os blocos já têm decisão.', 'ok', 6000);
    }
});

/** Ao entrar no fluxo simplificado: blocos que já têm a concepção escolhida herdam a decisão. */
function prepararBlocosDoProjeto(p) {
    const est = estSimpl(p); if (!est) return;
    const v = p.variantes.find(x => x.id === p.concepcao.varianteId);
    funcoesFolha(est).forEach(f => {
        const b = blocoDe(p, f.id); if (b.decisao) return;
        const x = v && v.escolhas[f.id] ? acharPrincipio(p, v.escolhas[f.id]) : null;
        if (!x) return;
        b.principioId = x.id; b.decisao = x.maturidade === 'mercado' ? 'reuso' : 'desenvolver';
    });
}

/** Blocos sem decisão: a primeira solução existente, se houver; senão, desenvolver. Devolve as contagens. */
function aplicarSugestoesBlocos(p) {
    const est = estSimpl(p), n = { reuso: 0, dev: 0 };
    if (!est) return n;
    funcoesFolha(est).forEach(f => {
        const b = blocoDe(p, f.id); if (b.decisao) return;
        const s = solucoesExistentes(p, f)[0];
        if (s) { usarSolucaoExistente(p, f, s); n.reuso++; } else { desenvolverBloco(p, f); n.dev++; }
    });
    return n;
}

// ============================================================================
// PÁGINA: SOLUÇÕES DOS BLOCOS
// ============================================================================

PAGINAS.blocos = {
    titulo: 'Soluções dos blocos',
    sub: TITULOS_SIMPL.blocos[1],
    render(p) {
        const est = estSimpl(p), folhas = est ? funcoesFolha(est) : [];
        if (!folhas.length) return `<section class="card">${vazio('Monte primeiro o <a href="#/estrutura">diagrama de blocos</a> (use o modelo pronto de automação ou de sistema elétrico).')}</section>`;
        const dec = folhas.filter(f => (p.blocos[f.id] || {}).decisao);
        const reuso = folhas.filter(f => (p.blocos[f.id] || {}).decisao === 'reuso').length;
        const cards = folhas.map(f => cartaoBloco(p, est, f)).join('');
        return `${dica(`<ol>
            <li><b>Já existe?</b> Para cada bloco, o sistema procura soluções prontas: as que a equipe já usou em outros projetos (biblioteca) e módulos do mercado. <b>Se existir, use</b>: o bloco já está validado e só precisa do teste de integração.</li>
            <li><b>Não existe:</b> marque para desenvolver e diga se é <b>hardware</b>, <b>software</b> ou os dois, e em que plataforma roda (mapeamento da aplicação, Marwedel).</li>
            <li>A concepção é montada sozinha com essas escolhas; o plano de testes (Modelo V) sai na etapa 5.</li></ol>`, 'Como fazer (Marwedel)')}
        <section class="card"><div class="card-topo"><h2>Resumo</h2>${dec.length < folhas.length ? '<button type="button" class="btn btn-primary btn-sm" data-acao="blk-sugestoes">Usar as sugestões nos blocos sem decisão</button>' : '<span class="etapa-selo-ok">✓ todos os blocos com solução</span>'}</div>
            <p class="nota">${folhas.length} bloco(s): <b>${reuso}</b> com solução existente (só teste de integração), <b>${dec.length - reuso}</b> a desenvolver, <b>${folhas.length - dec.length}</b> sem decisão.</p>
            ${htmlTabelaMapeamento(p, est, folhas)}</section>
        ${cards}`;
    }
};

function htmlTabelaMapeamento(p, est, folhas) {
    return `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Bloco</th><th>Solução</th><th>Origem</th><th>Hardware × software</th><th>Plataforma</th></tr></thead><tbody>
        ${folhas.map(f => { const b = p.blocos[f.id] || {}, x = b.principioId ? acharPrincipio(p, b.principioId) : null;
            return `<tr><td><a href="#bl-${escAttr(f.id)}" data-acao="ir-bloco" data-f="${escAttr(f.id)}">F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</a></td><td>${x ? esc(x.nome) : '<span class="falta">sem decisão</span>'}</td>
                <td>${b.decisao === 'reuso' ? '♻ existente' : b.decisao === 'desenvolver' ? '🛠 desenvolver' : '—'}</td><td>${esc(ALOCACOES[b.alocacao] || '—')}</td><td>${esc(b.plataforma || '—')}</td></tr>`; }).join('')}</tbody></table></div>`;
}
ACOES['ir-bloco'] = b => { const c = document.getElementById('bl-' + b.dataset.f); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

function cartaoBloco(p, est, f) {
    const b = p.blocos[f.id] || {}, x = b.principioId ? acharPrincipio(p, b.principioId) : null;
    const sug = solucoesExistentes(p, f), fid = escAttr(f.id);
    const melhor = !b.decisao && sug[0];
    const sel = `<label>Hardware × software <select data-campo="blocos.${fid}.alocacao" data-rerender><option value="">—</option>${Object.entries(ALOCACOES).map(([k, n]) => `<option value="${k}" ${b.alocacao === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
    let corpo = '';
    if (b.decisao === 'reuso' && x) {
        corpo = `<p class="bloco-escolha">♻ <b>${esc(x.nome)}</b> — solução existente${x.fonte ? ' (' + esc(x.fonte) + ')' : ''}. <span class="etapa-selo-ok">Falta só o teste de integração</span></p>
            <div class="grade-campos">${sel}<label>Onde entra / versão usada <input type="text" data-campo="blocos.${fid}.plataforma" value="${escAttr(b.plataforma)}" placeholder="ex.: placa principal, versão 1.2 do módulo" maxlength="300"></label></div>`;
    } else if (b.decisao === 'desenvolver' && x) {
        corpo = `<p class="bloco-escolha">🛠 <b>Desenvolver</b>${sug.some(s => s.tipo !== 'projeto') ? ` — <span class="falta">existe solução pronta (abaixo); reaproveitar reduz o risco</span>` : ''}</p>
            <div class="grade-campos"><label>O que será desenvolvido <input type="text" data-campo="principios.${fid}#${escAttr(x.id)}.nome" value="${escAttr(x.nome)}" maxlength="160"></label>${sel}
            <label>Plataforma (onde roda) <input type="text" data-campo="blocos.${fid}.plataforma" value="${escAttr(b.plataforma)}" placeholder="ex.: ESP32, CLP, placa própria" maxlength="300"></label>
            <label>Como testar este bloco (unidade) <input type="text" data-campo="blocos.${fid}.testes" value="${escAttr(b.testes)}" placeholder="ex.: bancada com fonte e osciloscópio; simulação no SPICE" maxlength="1000"></label></div>`;
    }
    const lista = sug.length ? `<${b.decisao ? 'details' : 'div'} class="bloco-sugestoes">${b.decisao ? `<summary>Outras soluções que já existem (${sug.length})</summary>` : '<b>💡 Soluções que já existem para este bloco</b>'}
        <ul>${sug.map((s, i) => `<li class="${x && semAcento(x.nome) === semAcento(s.nome) ? 'escolhida' : ''}"><b>${esc(s.nome)}</b> <small>${esc(s.fonte)}${s.alocacao ? ' · ' + esc(ALOCACOES[s.alocacao]) : ''}</small>${s.descricao ? `<br><span class="nota">${esc(s.descricao)}</span>` : ''}
            ${x && semAcento(x.nome) === semAcento(s.nome) ? '' : `<button type="button" class="btn ${i === 0 && !b.decisao ? 'btn-primary' : 'btn-secondary'} btn-sm" data-acao="blk-usar" data-f="${fid}" data-i="${i}">Usar</button>`}</li>`).join('')}</ul></${b.decisao ? 'details' : 'div'}>` : '<p class="nota">Nenhuma solução pronta conhecida para este bloco.</p>';
    return `<section class="card bloco-simpl" id="bl-${fid}">
        <div class="card-topo"><h2><span class="num-f">F${esc(numeroFuncao(est, f.id))}</span> ${esc(f.nome)}</h2>
            <div class="botoes">${b.decisao !== 'desenvolver' ? `<button type="button" class="btn btn-secondary btn-sm" data-acao="blk-desenvolver" data-f="${fid}">🛠 Desenvolver</button>` : ''}${b.decisao ? `<button type="button" class="btn btn-link btn-sm" data-acao="blk-limpar" data-f="${fid}">desfazer</button>` : ''}</div></div>
        ${melhor ? `<p class="aviso-inline">💡 Já existe solução para este bloco: <b>${esc(melhor.nome)}</b> (${esc(melhor.fonte)}). Sugestão: usar e fazer só o teste de integração.</p>` : ''}
        ${corpo}${lista}
        <div class="campo-inline bloco-outra"><input type="text" id="blk-outra-${fid}" placeholder="Outra solução que já existe (módulo, placa ou programa usado antes)" maxlength="120"><button type="button" class="btn btn-secondary btn-sm" data-acao="blk-outra" data-f="${fid}">Usar esta</button></div>
    </section>`;
}

// ============================================================================
// CONCEPÇÃO, PRELIMINAR, PREENCHIMENTO AUTOMÁTICO, RELATÓRIO E GESTÃO
// ============================================================================

{
    const renderConcepcao = PAGINAS.concepcao.render;
    PAGINAS.concepcao.render = function (p) {
        if (!fluxoSimplificado(p)) return renderConcepcao.call(this, p);
        sincronizarConcepcaoSimpl(p);
        if (!p.variantes.length) return `<section class="card">${vazio('Escolha a solução de cada bloco na <a href="#/blocos">etapa 4</a>: a concepção é montada sozinha.')}</section>`;
        return renderConcepcao.call(this, p) + htmlPlanoTestes(p);
    };
    if (PAGINAS['p-prototipo']) {
        const renderProto = PAGINAS['p-prototipo'].render;
        PAGINAS['p-prototipo'].render = function (p) { return renderProto.call(this, p) + (fluxoSimplificado(p) ? htmlPlanoTestes(p) : ''); };
    }
}

if (typeof preencherTudo === 'function') {
    const preencherCompleto = preencherTudo;
    // eslint-disable-next-line no-global-assign
    preencherTudo = function (p) {
        if (!fluxoSimplificado(p)) return preencherCompleto(p);
        const antes = { variantes: p.variantes.map(v => v.id), passa: p.selecao.passa.perguntas.length, crit: p.selecao.avaliacao.criterios.length };
        const abst = p.abstracao.slice();
        const feito = preencherCompleto(p);
        // o fluxo simplificado não usa abstração, matriz e seleção: desfaz o que o preenchimento completo criou nelas
        p.abstracao = abst;
        p.variantes = p.variantes.filter(v => antes.variantes.includes(v.id));
        if (!antes.passa) p.selecao.passa.perguntas = [];
        if (!antes.crit) p.selecao.avaliacao.criterios = [];
        const f2 = feito.filter(x => !['matriz', 'selecao', 'principios'].includes(x.etapa) && !/abstração/i.test(x.texto));
        const n = aplicarSugestoesBlocos(p);
        sincronizarConcepcaoSimpl(p);
        if (n.reuso) f2.push({ etapa: 'blocos', texto: `${n.reuso} bloco(s) com solução que já existe (só falta o teste de integração).` });
        if (n.dev) f2.push({ etapa: 'blocos', texto: `${n.dev} bloco(s) para desenvolver: diga se é hardware ou software e a plataforma.` });
        p.ultimoPreenchimento = f2.length ? { em: new Date().toISOString(), itens: f2 } : p.ultimoPreenchimento;
        return f2;
    };
}

/** Seções do relatório no fluxo simplificado (no lugar de princípios, matriz e seleção). */
function secoesRelatorioSimpl(p) {
    const est = estSimpl(p), folhas = est ? funcoesFolha(est) : [];
    const blocos = folhas.length ? `<p>Fluxo simplificado de Marwedel: para cada bloco, usar uma solução que já existe (validada, só falta o teste de integração) ou desenvolver, mapeando em hardware ou software.</p>
        <table><thead><tr><th>Bloco</th><th>Solução</th><th>Origem</th><th>Hardware × software</th><th>Plataforma</th></tr></thead><tbody>
        ${folhas.map(f => { const b = p.blocos[f.id] || {}, x = b.principioId ? acharPrincipio(p, b.principioId) : null;
            return `<tr><td>F${esc(numeroFuncao(est, f.id))} ${esc(f.nome)}</td><td>${x ? esc(x.nome) : '—'}</td><td>${b.decisao === 'reuso' ? 'existente' + (x && x.fonte ? ' (' + esc(x.fonte) + ')' : '') : b.decisao === 'desenvolver' ? 'desenvolver' : '—'}</td><td>${esc(ALOCACOES[b.alocacao] || '—')}</td><td>${esc(b.plataforma || '—')}</td></tr>`; }).join('')}</tbody></table>` : '';
    const l = planoTestes(p);
    const testes = l.length ? `<table><thead><tr><th>Nível</th><th>Bloco</th><th>Teste</th><th>Critério</th></tr></thead><tbody>${l.map(x => `<tr><td>${esc(x.nivel)}</td><td>${esc(x.bloco)}</td><td>${esc(x.teste)}</td><td>${esc(x.criterio)}</td></tr>`).join('')}</tbody></table>` : '';
    return { blocos, testes };
}

if (typeof exportarParaGestao === 'function') {
    const exportarCompleto = exportarParaGestao;
    // eslint-disable-next-line no-global-assign
    exportarParaGestao = function (p) {
        const r = exportarCompleto.apply(this, arguments);
        if (!fluxoSimplificado(p) || !r) return r;
        const est = estSimpl(p), folhas = est ? funcoesFolha(est) : [];
        const reuso = folhas.filter(f => (p.blocos[f.id] || {}).decisao === 'reuso').length, dev = folhas.filter(f => (p.blocos[f.id] || {}).decisao === 'desenvolver').length;
        r.fluxo = 'simplificado';
        r.planoTestes = planoTestes(p);
        const c = r.conceitual && r.conceitual.concepcoes.find(x => x.selecionada);
        if (c) c.avaliacao = [`Fluxo simplificado (Marwedel): ${reuso} bloco(s) com solução existente (só teste de integração) e ${dev} a desenvolver`, c.avaliacao].filter(Boolean).join('; ');
        return r;
    };
}

// salvar mantém a concepção dos blocos em dia
{
    const salvarAntesSimpl = PC.salvar;
    PC.salvar = function () {
        try { if (this.p && fluxoSimplificado(this.p)) sincronizarConcepcaoSimpl(this.p); } catch (e) { console.warn('fluxo simplificado', e); }
        return salvarAntesSimpl.apply(this, arguments);
    };
}
