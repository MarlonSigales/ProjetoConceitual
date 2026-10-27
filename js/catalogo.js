/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * CATÁLOGO DE PRINCÍPIOS DE SOLUÇÃO
 * Pré-preenche a matriz morfológica: para cada função elementar (verbo + substantivo), procura no catálogo
 * os princípios de solução conhecidos (catálogos de projeto — métodos discursivos, Quadro 1 de Reis, 2003;
 * análise de sistemas técnicos existentes). Os itens entram marcados como "sugestão do catálogo" e o
 * projetista apaga, reordena ou acrescenta os seus.
 *
 * Cada entrada: verbos (radicais, sem acento), objetos (radicais; vazio = qualquer), princípios.
 */

'use strict';

/** Verbos usuais de funções técnicas (Pahl et al., 2005; Back et al., 2008) para autocompletar nomes. */
const VERBOS_FUNCAO = [
    'Absorver', 'Acionar', 'Acumular', 'Ajustar', 'Alimentar', 'Alinhar', 'Amortecer', 'Amplificar', 'Apoiar', 'Aquecer', 'Armazenar',
    'Bombear', 'Captar', 'Carregar', 'Classificar', 'Cobrir', 'Colher', 'Comandar', 'Comprimir', 'Conduzir', 'Conectar', 'Controlar',
    'Converter', 'Cortar', 'Desacoplar', 'Descarregar', 'Detectar', 'Direcionar', 'Dissipar', 'Distribuir', 'Dosar', 'Elevar',
    'Esfriar', 'Fixar', 'Frear', 'Girar', 'Guiar', 'Indicar', 'Isolar', 'Limpar', 'Medir', 'Misturar', 'Mover', 'Posicionar',
    'Proteger', 'Pulverizar', 'Receber', 'Reduzir', 'Regular', 'Rolar', 'Secar', 'Selar', 'Separar', 'Sustentar', 'Transmitir',
    'Transportar', 'Triturar', 'Vedar'
];

const CATALOGO_PRINCIPIOS = [
    // ---------- energia mecânica ----------
    { verbos: ['transmit', 'conduz', 'transfer'], objetos: ['torque', 'moviment', 'rotac', 'potenc', 'forca'], principios: [
        ['Corrente e rodas dentadas', 'Transmissão por corrente de rolos; boa eficiência, admite distância entre eixos.'],
        ['Correia sincronizadora', 'Correia dentada; silenciosa, sem lubrificação, sem deslizamento.'],
        ['Correia em V / plana', 'Transmissão por atrito; amortece choques, pode deslizar.'],
        ['Engrenagens', 'Par de engrenagens cilíndricas ou cônicas; compacta, relação fixa.'],
        ['Eixo cardã', 'Árvore com juntas universais; transmite entre eixos desalinhados.'],
        ['Transmissão hidráulica', 'Bomba e motor hidráulico; flexível no arranjo, perdas maiores.']
    ] },
    { verbos: ['transmit', 'conduz', 'distribu', 'transfer'], objetos: ['carga', 'esforc', 'peso'], principios: [
        ['Raios tensionados', 'Elementos finos trabalhando à tração entre cubo e aro.'],
        ['Disco monobloco', 'Placa contínua entre cubo e aro; rígida, mais pesada.'],
        ['Braços (3 a 5) em compósito', 'Poucos braços rígidos de fibra; leve, caro.'],
        ['Treliça', 'Barras articuladas formando triângulos; leve e rígida.'],
        ['Viga ou perfil estrutural', 'Perfil laminado ou dobrado trabalhando à flexão.']
    ] },
    { verbos: ['convert', 'transform', 'gerar', 'produz'], objetos: ['eletric'], principios: [
        ['Motor elétrico CC', 'Controle simples de velocidade; escovas exigem manutenção.'],
        ['Motor CC sem escovas (BLDC)', 'Alta eficiência, precisa de controlador.'],
        ['Motor de indução trifásico', 'Robusto e barato, precisa de inversor para variar a velocidade.'],
        ['Motor de passo', 'Posicionamento em malha aberta; torque cai com a rotação.'],
        ['Servomotor', 'Posição e velocidade controladas em malha fechada.'],
        ['Solenoide / atuador linear elétrico', 'Movimento linear curto ou com fuso.']
    ] },
    { verbos: ['convert', 'transform', 'gerar'], objetos: ['hidraul', 'pressao', 'fluido', 'oleo'], principios: [
        ['Cilindro hidráulico', 'Força elevada em movimento linear.'],
        ['Motor hidráulico', 'Torque elevado em baixa rotação.'],
        ['Bomba de engrenagens', 'Simples e robusta, vazão fixa.'],
        ['Bomba de pistões axiais', 'Vazão variável, alta pressão.']
    ] },
    { verbos: ['convert', 'transform', 'gerar'], objetos: ['pneumat', 'ar comprim'], principios: [
        ['Cilindro pneumático', 'Movimento rápido e limpo, força limitada.'],
        ['Motor pneumático', 'Seguro em ambientes inflamáveis.'],
        ['Músculo pneumático', 'Atuador flexível de contração.']
    ] },
    { verbos: ['convert', 'transform', 'gerar', 'acion'], objetos: ['humana', 'muscular', 'pedal', 'manual', 'operador'], principios: [
        ['Pedivela e pedais', 'Força das pernas em movimento rotativo.'],
        ['Manivela', 'Força do braço em rotação.'],
        ['Alavanca', 'Amplifica a força com curso maior.'],
        ['Volante manual', 'Ajustes finos por rotação.']
    ] },
    { verbos: ['reduz', 'amplific', 'ajust', 'vari', 'alter'], objetos: ['velocid', 'rotac', 'torque', 'relac'], principios: [
        ['Redutor de engrenagens', 'Relação fixa, compacto.'],
        ['Câmbio de marchas (descarrilhador)', 'Várias relações escalonadas.'],
        ['Cubo com marchas internas', 'Marchas protegidas no cubo; pouca manutenção.'],
        ['CVT por polias variáveis', 'Variação contínua da relação.'],
        ['Inversor de frequência', 'Varia a rotação do motor elétrico.'],
        ['Parafuso sem-fim e coroa', 'Grande redução, irreversível.']
    ] },
    { verbos: ['armazen', 'acumul', 'guard'], objetos: ['energ', 'eletric', 'carga'], principios: [
        ['Bateria de íons de lítio', 'Alta densidade de energia.'],
        ['Bateria chumbo-ácido', 'Barata, pesada.'],
        ['Supercapacitor', 'Carga e descarga rápidas, pouca energia.'],
        ['Mola', 'Energia potencial elástica.'],
        ['Volante de inércia', 'Energia cinética de rotação.'],
        ['Acumulador hidropneumático', 'Energia em fluido sob pressão.']
    ] },
    { verbos: ['frear', 'parar', 'dissip', 'desaceler', 'deter', 'reduz'], objetos: ['moviment', 'velocid', 'frenag', 'energ', 'roda', 'rotac', 'calor'], principios: [
        ['Freio na pista do aro (V-brake)', 'Sapatas sobre o aro; leve e barato, perde eficiência com água.'],
        ['Freio a disco mecânico', 'Pinça acionada por cabo; boa eficiência em chuva.'],
        ['Freio a disco hidráulico', 'Maior força e modulação; manutenção especializada.'],
        ['Freio a tambor no cubo', 'Fechado, pouca manutenção, mais pesado.'],
        ['Contra-pedal', 'Freio no cubo acionado pedalando para trás.'],
        ['Freio regenerativo', 'Motor elétrico como gerador; recupera energia.']
    ] },
    { verbos: ['amortec', 'absorv', 'atenu', 'isol'], objetos: ['impact', 'vibrac', 'choque', 'ruido', 'oscil'], principios: [
        ['Pneu de baixa pressão (largo)', 'O ar do pneu absorve as irregularidades.'],
        ['Mola helicoidal com amortecedor', 'Suspensão com dissipação viscosa.'],
        ['Elastômero (coxim de borracha)', 'Simples, sem manutenção.'],
        ['Amortecedor a ar', 'Rigidez ajustável pela pressão.'],
        ['Estrutura flexível (deflexão controlada)', 'Componentes projetados para fletir.']
    ] },
    { verbos: ['sustent', 'suport', 'apoi', 'resist'], objetos: [], principios: [
        ['Quadro tubular soldado', 'Tubos unidos por solda; robusto e de fácil fabricação.'],
        ['Chassi em perfis dobrados', 'Chapas dobradas e parafusadas.'],
        ['Monobloco em compósito', 'Peça única moldada; leve e caro.'],
        ['Treliça espacial', 'Barras formando triângulos; leve e rígida.'],
        ['Fundido ou injetado', 'Forma complexa em peça única, para grandes lotes.']
    ] },
    { verbos: ['gir', 'rot', 'permit', 'apoi', 'mancal'], objetos: ['eixo', 'rotac', 'gir', 'cubo', 'mancal'], principios: [
        ['Rolamento de esferas de contato angular (cone e copo)', 'Ajustável, desmontável, exige regulagem.'],
        ['Rolamento selado (cartucho)', 'Montado pronto, protegido de água e poeira.'],
        ['Bucha de bronze', 'Simples e barata, atrito maior.'],
        ['Mancal de rolos cônicos', 'Suporta cargas radiais e axiais elevadas.'],
        ['Mancal hidrodinâmico', 'Filme de óleo; sem contato em regime.']
    ] },
    { verbos: ['fix', 'prend', 'conect', 'unir', 'acopl', 'mont'], objetos: [], principios: [
        ['Parafuso e porca', 'Desmontável, exige ferramenta.'],
        ['Blocagem rápida (excêntrico)', 'Monta e desmonta sem ferramenta.'],
        ['Eixo passante (thru-axle)', 'Rígido e alinhado, rosqueado no garfo.'],
        ['Solda', 'Permanente, sem folgas.'],
        ['Rebite', 'Permanente, sem calor.'],
        ['Encaixe por pressão / engate rápido', 'Montagem rápida, sem ferramenta.'],
        ['Adesivo estrutural', 'Distribui as tensões; união permanente.']
    ] },
    { verbos: ['contat', 'rol', 'tracion', 'aderir', 'apoi', 'desloc', 'mover'], objetos: ['solo', 'chao', 'piso', 'terreno', 'via'], principios: [
        ['Pneu com câmara de ar', 'Barato e fácil de reparar.'],
        ['Pneu sem câmara (tubeless) com selante', 'Menos furos, pressão menor.'],
        ['Pneu maciço / sem ar', 'Não fura; mais pesado e menos confortável.'],
        ['Esteira', 'Grande área de contato, baixa compactação do solo.'],
        ['Rodado duplo', 'Distribui a carga, mais tração.']
    ] },
    { verbos: ['guiar', 'direcion', 'orient', 'conduz', 'alinh'], objetos: [], principios: [
        ['Guia linear com patins', 'Movimento retilíneo preciso.'],
        ['Barra de direção e articulação', 'Direção mecânica.'],
        ['Direção hidráulica', 'Menor esforço do operador.'],
        ['Trilho / canaleta', 'Guia simples por contato.'],
        ['Guidão', 'Comando manual direto.']
    ] },
    { verbos: ['proteg', 'cobr', 'isol', 'ved', 'sel'], objetos: [], principios: [
        ['Carenagem em chapa', 'Proteção mecânica contra contato.'],
        ['Retentor / vedação labial', 'Impede a entrada de água e poeira.'],
        ['Fole (sanfona)', 'Protege peças móveis.'],
        ['Pintura eletrostática / galvanização', 'Proteção contra corrosão.'],
        ['Invólucro com grau IP', 'Proteção de eletrônicos.']
    ] },
    { verbos: ['elev', 'levant', 'ergu', 'iç'], objetos: [], principios: [
        ['Cilindro hidráulico', 'Força alta em curso linear.'],
        ['Fuso de esferas', 'Precisão e irreversibilidade com freio.'],
        ['Talha / guincho de cabo', 'Grandes cursos.'],
        ['Mecanismo pantográfico (tesoura)', 'Elevação compacta.'],
        ['Elevador de canecas', 'Transporte vertical de granéis.']
    ] },
    { verbos: ['transport', 'mover', 'conduz', 'desloc', 'aliment', 'carreg', 'descarreg'], objetos: ['grao', 'semente', 'granel', 'produto', 'material', 'massa', 'po', 'insumo', 'fertiliz'], principios: [
        ['Rosca sem-fim (helicoide)', 'Transporte fechado de granéis.'],
        ['Esteira transportadora', 'Contínua, para produtos variados.'],
        ['Transporte pneumático', 'Tubulação com ar; trajetos flexíveis.'],
        ['Calha vibratória', 'Dosa e transporta com vibração.'],
        ['Elevador de canecas', 'Transporte vertical.'],
        ['Por gravidade (tremonha e calha)', 'Sem acionamento.']
    ] },
    // ---------- agrícolas ----------
    { verbos: ['dos', 'distribu', 'meter', 'singular', 'individualiz'], objetos: ['semente', 'grao'], principios: [
        ['Disco perfurado horizontal', 'Mecânico, simples; depende da classificação da semente.'],
        ['Dosador pneumático a vácuo', 'Alta precisão de espaçamento, maior custo.'],
        ['Dedos prensores', 'Bom para sementes graúdas e irregulares (milho).'],
        ['Rotor acanalado', 'Fluxo contínuo para sementes miúdas (trigo, arroz).'],
        ['Disco inclinado', 'Singulariza sem classificação rigorosa.']
    ] },
    { verbos: ['dos', 'distribu', 'aplic'], objetos: ['fertiliz', 'adubo', 'calcar', 'corretiv', 'insumo'], principios: [
        ['Rosca dosadora (helicoide)', 'Dosagem volumétrica proporcional à rotação.'],
        ['Rotor dentado', 'Para fertilizantes granulados.'],
        ['Esteira com comporta', 'Distribuição a lanço ou em linha.'],
        ['Disco centrífugo (lanço)', 'Larga faixa de aplicação.']
    ] },
    { verbos: ['cort', 'romp', 'secc'], objetos: ['palha', 'resid', 'cobert'], principios: [
        ['Disco de corte liso', 'Bom em palha seca, exige carga vertical.'],
        ['Disco ondulado', 'Mobiliza mais solo, corta palha úmida.'],
        ['Disco recortado', 'Mais agressivo no corte.'],
        ['Facão / lâmina', 'Simples, embucha com muita palha.']
    ] },
    { verbos: ['abr', 'sulc', 'mobiliz', 'escarific'], objetos: ['sulco', 'solo', 'terra'], principios: [
        ['Haste sulcadora', 'Rompe camadas compactadas; maior força de tração.'],
        ['Disco duplo defasado', 'Menor mobilização e esforço.'],
        ['Disco simples', 'Para solos sem compactação.'],
        ['Botinha / sulcador tipo enxada', 'Barato, para solo preparado.']
    ] },
    { verbos: ['cobr', 'fech', 'compact', 'firm'], objetos: ['sulco', 'semente', 'solo'], principios: [
        ['Rodas compactadoras em V', 'Fecha o sulco com pressão lateral.'],
        ['Roda compactadora única', 'Simples, pressão sobre a linha.'],
        ['Correntes arrastadas', 'Cobre sem compactar.'],
        ['Discos cobridores', 'Puxam o solo sobre o sulco.']
    ] },
    { verbos: ['colh', 'arranc', 'recolh', 'cort'], objetos: ['planta', 'grao', 'fruto', 'cultura', 'colmo', 'espiga', 'forrag'], principios: [
        ['Barra de corte com navalhas', 'Corte alternativo junto ao solo.'],
        ['Molinete', 'Conduz as plantas à barra de corte.'],
        ['Plataforma de espigas (rolos espigadores)', 'Para milho.'],
        ['Recolhedor (pick-up) de dedos', 'Recolhe material enleirado.'],
        ['Vibrador de tronco', 'Derriça frutos (café, citros).']
    ] },
    { verbos: ['separ', 'classific', 'limp', 'peneir', 'selecion', 'debulh', 'trilh'], objetos: [], principios: [
        ['Peneiras vibratórias', 'Separa por tamanho.'],
        ['Ventilador / coluna de ar', 'Separa por massa e forma (impurezas leves).'],
        ['Mesa densimétrica', 'Separa por densidade.'],
        ['Cilindro trilhador e côncavo', 'Debulha por impacto e atrito.'],
        ['Ciclone', 'Separa partículas do ar.'],
        ['Separador óptico (câmera)', 'Separa por cor ou defeito.'],
        ['Trieur (cilindro alveolado)', 'Separa por comprimento.']
    ] },
    { verbos: ['sec', 'desidrat'], objetos: [], principios: [
        ['Secador de fluxo contínuo com ar aquecido', 'Grande capacidade.'],
        ['Secagem estacionária em silo', 'Ar natural ou pouco aquecido; lenta.'],
        ['Secagem solar', 'Barata, depende do clima.'],
        ['Secador rotativo', 'Mistura enquanto seca.']
    ] },
    { verbos: ['pulveriz', 'aplic', 'asperg'], objetos: ['liquid', 'calda', 'defensiv', 'agua', 'produto'], principios: [
        ['Bicos hidráulicos de jato plano', 'Gotas médias; uso geral.'],
        ['Bicos com indução de ar', 'Gotas grossas, menos deriva.'],
        ['Atomizador rotativo (disco)', 'Gotas uniformes, baixo volume.'],
        ['Turbopulverizador (ar)', 'Penetra na copa das plantas.'],
        ['Pulverização eletrostática', 'Melhora a deposição.']
    ] },
    { verbos: ['mistur', 'homogeneiz', 'agit'], objetos: [], principios: [
        ['Misturador de pás', 'Uso geral.'],
        ['Misturador helicoidal (vertical)', 'Para rações e granéis.'],
        ['Tambor rotativo', 'Suave, para produtos frágeis.'],
        ['Agitação por retorno de bomba', 'Mantém caldas homogêneas.']
    ] },
    { verbos: ['tritur', 'mo', 'picar', 'fragment', 'quebr'], objetos: [], principios: [
        ['Moinho de martelos', 'Robusto, para grãos e fibras.'],
        ['Moinho de rolos', 'Granulometria uniforme.'],
        ['Faca rotativa (picador)', 'Para forragem.'],
        ['Britador de mandíbulas', 'Para materiais duros.']
    ] },
    { verbos: ['bomb', 'succion', 'recalc', 'escoar'], objetos: [], principios: [
        ['Bomba centrífuga', 'Vazão alta, pressão moderada.'],
        ['Bomba de diafragma', 'Resiste a produtos químicos.'],
        ['Bomba de pistão', 'Pressão alta.'],
        ['Bomba de engrenagens', 'Fluidos viscosos.']
    ] },
    { verbos: ['aquec', 'esquent'], objetos: [], principios: [
        ['Resistência elétrica', 'Controle simples.'],
        ['Queimador a gás / lenha', 'Energia barata, exige exaustão.'],
        ['Trocador de calor', 'Aproveita calor residual.'],
        ['Coletor solar', 'Energia gratuita, intermitente.'],
        ['Indução', 'Aquecimento rápido de peças metálicas.']
    ] },
    { verbos: ['esfri', 'resfri', 'refriger'], objetos: [], principios: [
        ['Ventilação forçada', 'Simples, limitada à temperatura do ar.'],
        ['Ciclo de compressão de vapor', 'Temperaturas abaixo do ambiente.'],
        ['Evaporação de água', 'Barato em clima seco.'],
        ['Dissipador aletado', 'Passivo.'],
        ['Pastilha Peltier', 'Compacta, baixa eficiência.']
    ] },
    // ---------- sinais e controle ----------
    { verbos: ['med', 'detect', 'sent', 'perceb', 'monitor', 'identific', 'verific', 'capt'], objetos: ['posic', 'distanc', 'desloc', 'presenc', 'nivel'], principios: [
        ['Sensor indutivo', 'Detecta metal sem contato.'],
        ['Sensor capacitivo', 'Detecta materiais diversos, inclusive grãos.'],
        ['Sensor óptico (barreira / reflexivo)', 'Detecção rápida, sensível a poeira.'],
        ['Ultrassom', 'Mede distância e nível.'],
        ['Encoder', 'Posição angular ou linear.'],
        ['Chave fim de curso', 'Contato mecânico simples.']
    ] },
    { verbos: ['med', 'detect', 'sent', 'monitor', 'capt'], objetos: ['velocid', 'rotac'], principios: [
        ['Sensor de efeito Hall com ímã', 'Robusto e barato.'],
        ['Encoder óptico', 'Alta resolução.'],
        ['Radar / GNSS', 'Velocidade de deslocamento real.'],
        ['Tacogerador', 'Sinal analógico proporcional.']
    ] },
    { verbos: ['med', 'detect', 'sent', 'monitor', 'capt'], objetos: ['forca', 'carga', 'pressao', 'peso', 'massa', 'torque'], principios: [
        ['Célula de carga (extensômetro)', 'Força e peso com boa exatidão.'],
        ['Transdutor de pressão piezorresistivo', 'Pressão em fluidos.'],
        ['Sensor piezoelétrico', 'Forças dinâmicas e impactos.'],
        ['Torquímetro rotativo', 'Torque em eixos girando.']
    ] },
    { verbos: ['med', 'detect', 'sent', 'monitor', 'capt'], objetos: ['temperat', 'umidad', 'clima'], principios: [
        ['Termopar', 'Ampla faixa de temperatura.'],
        ['Termorresistência (PT100)', 'Exatidão.'],
        ['Termistor NTC', 'Barato.'],
        ['Sensor capacitivo de umidade', 'Umidade do ar ou do grão.'],
        ['Infravermelho', 'Sem contato.']
    ] },
    { verbos: ['control', 'regul', 'comand', 'process', 'gerenci', 'acion'], objetos: [], principios: [
        ['Comando mecânico (alavancas e cabos)', 'Sem energia elétrica.'],
        ['Microcontrolador (Arduino, ESP32)', 'Barato e flexível.'],
        ['CLP', 'Robusto, padrão industrial.'],
        ['Controle hidráulico proporcional', 'Para grandes potências.'],
        ['Relés e contatores', 'Lógica simples.']
    ] },
    { verbos: ['indic', 'inform', 'mostr', 'exib', 'sinaliz', 'alert', 'comunic'], objetos: [], principios: [
        ['Mostrador analógico', 'Leitura rápida de tendência.'],
        ['Display LCD / OLED', 'Valores numéricos e menus.'],
        ['Lâmpadas / LEDs indicadores', 'Estados simples.'],
        ['Sinal sonoro', 'Alertas sem olhar.'],
        ['Aplicativo no celular (Bluetooth / Wi-Fi)', 'Interface rica, sem painel físico.']
    ] },
    { verbos: ['receb', 'entr', 'insir', 'introduz'], objetos: ['comand', 'sinal', 'ordem', 'ajust', 'usuario', 'operador'], principios: [
        ['Botões e chaves', 'Comando direto.'],
        ['Manete / alavanca', 'Comando proporcional.'],
        ['Tela sensível ao toque', 'Comandos variados.'],
        ['Pedal', 'Mãos livres.'],
        ['Controle remoto', 'Comando à distância.']
    ] },
    { verbos: ['receb', 'aliment', 'abastec', 'carreg', 'armazen', 'acumul', 'conter'], objetos: ['grao', 'semente', 'produto', 'material', 'insumo', 'granel', 'fertiliz'], principios: [
        ['Reservatório (tremonha) em chapa', 'Robusto, escoamento por gravidade.'],
        ['Reservatório em polietileno', 'Leve, não corrói.'],
        ['Silo bolsa', 'Armazenagem temporária barata.'],
        ['Big bag com descarga inferior', 'Abastecimento rápido.']
    ] },
    { verbos: ['ved', 'sel', 'estanq'], objetos: [], principios: [
        ['Anel O-ring', 'Vedação estática simples.'],
        ['Retentor labial', 'Vedação de eixos girando.'],
        ['Selo mecânico', 'Vedação de bombas.'],
        ['Junta plana', 'Entre flanges.']
    ] }
];

/** Princípios do catálogo para uma função (melhores correspondências primeiro). Devolve [{nome, descricao}]. */
function sugerirPrincipios(nomeFuncao, limite = 8) {
    const n = ' ' + semAcento(nomeFuncao).replace(/[^a-z0-9 ]+/g, ' ') + ' ';
    const palavras = n.trim().split(/\s+/);
    const verbo = palavras[0] || '';
    const pontuadas = [];
    CATALOGO_PRINCIPIOS.forEach((e, i) => {
        const okVerbo = e.verbos.some(v => verbo.startsWith(v)) ? 2 : (e.verbos.some(v => n.includes(' ' + v)) ? 1 : 0);
        const nObj = e.objetos.filter(o => n.includes(o)).length;
        if (!okVerbo && !nObj) return;
        if (e.objetos.length && !nObj) { if (!okVerbo) return; pontuadas.push([okVerbo * 0.5, i, e]); return; }
        if (!okVerbo && e.objetos.length && nObj) { pontuadas.push([nObj * 1.2, i, e]); return; }
        pontuadas.push([okVerbo * 2 + nObj * 3 + (e.objetos.length ? 1 : 0), i, e]);
    });
    pontuadas.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const melhores = pontuadas.filter(x => x[0] >= (pontuadas[0] ? pontuadas[0][0] * 0.6 : 0)).slice(0, 2);
    const out = [], vistos = new Set();
    melhores.forEach(([, , e]) => e.principios.forEach(([nome, descricao]) => {
        const k = semAcento(nome);
        if (!vistos.has(k)) { vistos.add(k); out.push({ nome, descricao }); }
    }));
    return out.slice(0, limite);
}
