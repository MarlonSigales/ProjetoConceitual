/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
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
    'Transportar', 'Triturar', 'Vedar',
    'Aterrar', 'Comunicar', 'Condicionar', 'Diagnosticar', 'Energizar', 'Filtrar', 'Informar', 'Localizar', 'Monitorar', 'Processar', 'Registrar'
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
    { verbos: ['tritur', 'moer', 'moa', 'picar', 'fragment', 'quebr'], objetos: [], principios: [
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
    { verbos: ['convert', 'transform'], objetos: ['moviment', 'rotac', 'linear', 'alternativ'], principios: [
        ['Biela-manivela', 'Rotação ↔ movimento alternativo.'],
        ['Came e seguidor', 'Movimento programado pelo perfil do came.'],
        ['Pinhão e cremalheira', 'Rotação → movimento linear.'],
        ['Fuso (parafuso de potência)', 'Rotação → linear com grande redução.'],
        ['Excêntrico', 'Oscilação simples e robusta.']
    ] },
    { verbos: ['acion', 'receb', 'mov', 'aliment'], objetos: ['mecanism', 'acionamento', 'dosador', 'rotor', 'eixo de acion'], principios: [
        ['Roda de terra (acionamento pelo rodado)', 'Dose proporcional ao deslocamento, sem energia externa; patina.'],
        ['Tomada de potência (TDP) do trator', 'Muita potência disponível; rotação fixa.'],
        ['Motor hidráulico do trator', 'Rotação ajustável, usa o sistema hidráulico existente.'],
        ['Motor elétrico com controle', 'Rotação variável por comando (taxa variável).'],
        ['Motor a combustão próprio', 'Independe do trator; peso e manutenção.']
    ] },
    { verbos: ['deposit', 'coloc', 'enterr', 'semear', 'plant'], objetos: ['solo', 'sulco', 'insumo', 'semente', 'muda'], principios: [
        ['Tubo condutor por gravidade', 'Simples; a semente pode quicar e perder o espaçamento.'],
        ['Condutor com esteira (escova)', 'Leva a semente até o fundo do sulco sem quicar.'],
        ['Ejetor pneumático', 'Lança a semente com velocidade controlada.'],
        ['Roda puncionadora', 'Abre a cova e deposita sem sulco contínuo.'],
        ['Distribuição a lanço', 'Rápida, sem precisão de posição.']
    ] },
    // ---------- elétrico ----------
    { verbos: ['receb', 'aliment', 'fornec', 'energiz', 'suprir', 'captar'], objetos: ['energia eletr', 'eletric', 'alimentac', 'tensao', 'rede', 'potencia'], principios: [
        ['Rede elétrica 127/220 V', 'Energia contínua e barata onde há rede; exige instalação e proteção.'],
        ['Bateria com BMS (lítio)', 'Autonomia sem rede; o BMS protege contra sobrecarga e descarga profunda.'],
        ['Painel fotovoltaico + controlador MPPT', 'Energia no campo, sem rede; depende de sol e de armazenamento.'],
        ['Bateria/alternador do trator (12 V)', 'Aproveita a energia já disponível na máquina; potência limitada.'],
        ['Gerador a combustão', 'Alta potência sem rede; ruído e manutenção.'],
        ['Alimentação pelo cabo de dados (PoE / USB)', 'Um cabo só para energia e dados; baixa potência.']
    ] },
    { verbos: ['convert', 'transform', 'regul', 'ajust', 'adequ', 'reduz', 'elev'], objetos: ['tensao', 'eletric', 'ca ', 'cc ', 'ca-cc', 'cc-cc', 'alimentac', 'potencia eletr', 'corrente alternada', 'corrente continua'], principios: [
        ['Fonte chaveada CA-CC', 'Compacta e eficiente; gera ruído de alta frequência.'],
        ['Conversor CC-CC abaixador (buck)', 'Reduz a tensão com alta eficiência (ex.: 12 V → 5 V).'],
        ['Conversor CC-CC elevador (boost)', 'Eleva a tensão de baterias.'],
        ['Regulador linear (LDO)', 'Simples e sem ruído; desperdiça energia em calor.'],
        ['Transformador + retificador', 'Robusto e isolado; pesado.'],
        ['Inversor CC-CA', 'Gera corrente alternada a partir de bateria/painel.']
    ] },
    { verbos: ['proteg', 'isol', 'seccion', 'interromp', 'limit'], objetos: ['circuito', 'eletric', 'sobrecorrente', 'curto', 'surto', 'sobretensao', 'instalac', 'choque', 'equipamento'], principios: [
        ['Fusível', 'Barato e rápido; precisa ser trocado depois de atuar.'],
        ['Disjuntor termomagnético', 'Protege contra sobrecarga e curto; rearmável.'],
        ['Dispositivo DR (diferencial residual)', 'Protege as pessoas contra choque elétrico.'],
        ['DPS (protetor de surto)', 'Desvia surtos de tensão (raios, manobras).'],
        ['Diodo TVS / varistor', 'Protege a eletrônica contra picos de tensão.'],
        ['Fusível rearmável (PTC)', 'Volta a conduzir sozinho depois de esfriar.'],
        ['Relé térmico de sobrecarga', 'Protege motores contra sobreaquecimento.']
    ] },
    { verbos: ['acion', 'comand', 'chave', 'ligar', 'aliment', 'control'], objetos: ['motor', 'carga', 'atuador', 'bomba', 'valvula', 'solenoide', 'lampada', 'resistencia'], principios: [
        ['Contator', 'Liga cargas de potência por comando de baixa tensão; robusto.'],
        ['Relé eletromecânico', 'Simples e barato; desgaste mecânico dos contatos.'],
        ['Relé de estado sólido (SSR)', 'Sem desgaste e silencioso; aquece.'],
        ['MOSFET com PWM', 'Controla a potência de cargas CC com eficiência.'],
        ['Ponte H / driver de motor CC', 'Controla sentido e velocidade de motores CC.'],
        ['Inversor de frequência', 'Controla a velocidade de motores de indução.'],
        ['Soft-starter', 'Partida suave de motores, menos pico de corrente.']
    ] },
    { verbos: ['distribu', 'conduz', 'levar', 'transmit'], objetos: ['energia', 'eletric', 'potencia eletr', 'alimentac'], principios: [
        ['Quadro de distribuição com barramento', 'Organiza e protege os circuitos.'],
        ['Régua de bornes', 'Ligações organizadas e fáceis de manter.'],
        ['Chicote elétrico com conectores', 'Montagem rápida em série; padrão automotivo.'],
        ['Cabos em eletroduto / eletrocalha', 'Proteção mecânica dos cabos.']
    ] },
    { verbos: ['conect', 'lig', 'unir', 'acopl'], objetos: ['eletric', 'cabo', 'fio', 'sinal', 'conector', 'chicote'], principios: [
        ['Conector circular IP67 (M12)', 'Estanque, padrão em sensores industriais.'],
        ['Conector automotivo (tipo Deutsch)', 'Resiste a vibração, água e poeira.'],
        ['Borne de mola / parafuso', 'Simples para painéis.'],
        ['Terminal crimpado', 'Ligação confiável e rápida.'],
        ['Solda em placa', 'Permanente e compacta.']
    ] },
    { verbos: ['aterr', 'isol', 'blind'], objetos: [], principios: [
        ['Haste de aterramento', 'Escoa correntes de fuga e surtos.'],
        ['Isolamento galvânico (optoacoplador / transformador)', 'Separa circuitos de potência e de controle.'],
        ['Cabo blindado aterrado em um ponto', 'Reduz interferência nos sinais.'],
        ['Dupla isolação (classe II)', 'Dispensa aterramento do equipamento.']
    ] },
    { verbos: ['med', 'monitor', 'sent', 'capt', 'detect'], objetos: ['corrente', 'tensao', 'consumo', 'energia', 'potencia'], principios: [
        ['Resistor shunt + amplificador', 'Barato e preciso em CC.'],
        ['Sensor de corrente por efeito Hall', 'Isolado, mede CC e CA.'],
        ['Transformador de corrente (TC)', 'Para CA, sem contato elétrico.'],
        ['Divisor resistivo', 'Mede tensão com o conversor A/D.'],
        ['Medidor de energia com Modbus', 'Pronto para integrar ao controle.'],
        ['CI monitor de energia (ex.: INA219)', 'Tensão, corrente e potência por I2C.']
    ] },
    // ---------- automação e eletrônica ----------
    { verbos: ['capt', 'med', 'detect', 'sent', 'ler', 'perceb', 'adquir'], objetos: ['sinal', 'processo', 'grandeza', 'variavel', 'sensor', 'leitura'], principios: [
        ['Sensor analógico com saída 0–10 V / 4–20 mA', 'Padrão industrial, fácil de ligar ao CLP.'],
        ['Sensor digital (I2C / SPI)', 'Ligação direta ao microcontrolador, já calibrado.'],
        ['Sensor óptico / infravermelho', 'Rápido, sem contato; sensível a sujeira.'],
        ['Câmera e visão computacional', 'Vê muitas coisas ao mesmo tempo; exige processamento.'],
        ['Chave / sensor de contato', 'Simples e barato para presença ou fim de curso.'],
        ['Sensor capacitivo', 'Detecta produtos não metálicos (grãos, líquidos).']
    ] },
    { verbos: ['condicion', 'amplific', 'filtr', 'adequ', 'convert', 'digitaliz', 'trat'], objetos: ['sinal', 'leitura', 'medida', 'sensor', 'analog'], principios: [
        ['Amplificador operacional', 'Amplifica e adapta a faixa do sinal.'],
        ['Amplificador de instrumentação', 'Para sinais pequenos (célula de carga, termopar).'],
        ['Filtro RC / filtro ativo', 'Remove ruído antes da leitura.'],
        ['Conversor A/D externo (16–24 bits)', 'Mais resolução que o do microcontrolador.'],
        ['Transmissor 4–20 mA', 'Sinal robusto a longas distâncias.'],
        ['Filtro digital no software (média, Kalman)', 'Sem componentes extras.']
    ] },
    { verbos: ['process', 'calcul', 'decid', 'execut', 'control', 'gerenci', 'comput'], objetos: ['dado', 'sinal', 'informac', 'logica', 'algoritmo', 'leitura', 'process', 'malha'], principios: [
        ['Microcontrolador (ESP32, STM32, Arduino)', 'Barato, baixo consumo, tempo real.'],
        ['CLP (controlador lógico programável)', 'Robusto e padrão industrial.'],
        ['Computador de placa única (Raspberry Pi)', 'Processamento alto, visão e Linux.'],
        ['FPGA', 'Processamento paralelo muito rápido.'],
        ['Controle PID em software', 'Malha fechada simples e conhecida.'],
        ['Controle adaptativo / preditivo', 'Melhor desempenho com variações do processo; mais complexo.']
    ] },
    { verbos: ['comunic', 'transmit', 'envi', 'troc', 'conect', 'integr'], objetos: ['dado', 'sinal', 'informac', 'rede', 'nuvem', 'celular', 'trator', 'remot', 'mensag'], principios: [
        ['CAN / ISOBUS', 'Padrão em máquinas agrícolas e veículos.'],
        ['RS-485 com Modbus RTU', 'Robusto, longa distância, industrial.'],
        ['Ethernet / Modbus TCP', 'Alta taxa, redes industriais.'],
        ['Wi-Fi com MQTT', 'Envio à nuvem/IoT onde há rede.'],
        ['Bluetooth Low Energy', 'Ligação com o celular, curto alcance.'],
        ['LoRa / LoRaWAN', 'Longo alcance no campo, poucos dados.'],
        ['Rede celular 4G / NB-IoT', 'Cobertura ampla; custo de dados.']
    ] },
    { verbos: ['armazen', 'registr', 'grav', 'guard', 'salv'], objetos: ['dado', 'informac', 'registro', 'histor', 'leitura', 'medic'], principios: [
        ['Cartão SD', 'Grande capacidade, removível.'],
        ['Memória flash interna / EEPROM', 'Sem peças extras; pouca capacidade.'],
        ['Banco de dados em nuvem', 'Acesso remoto e histórico ilimitado; depende de conexão.'],
        ['Datalogger dedicado', 'Pronto para uso.']
    ] },
    { verbos: ['localiz', 'posicion', 'georreferenc', 'naveg', 'guiar', 'orient'], objetos: ['posic', 'local', 'gps', 'gnss', 'campo', 'maquina', 'trajet', 'coordenad'], principios: [
        ['Receptor GNSS (GPS)', 'Posição com erro de metros.'],
        ['GNSS RTK', 'Posição centimétrica; precisa de base/correção.'],
        ['Unidade inercial (IMU)', 'Orientação e movimento; deriva com o tempo.'],
        ['Encoder de roda (odometria)', 'Distância percorrida; erra com patinagem.'],
        ['Visão computacional', 'Segue linhas da cultura; sensível à luz.']
    ] },
    { verbos: ['diagnost', 'supervision', 'verific', 'detect', 'monitor'], objetos: ['falha', 'erro', 'defeito', 'funcionamento', 'estado'], principios: [
        ['Watchdog', 'Reinicia o controle se o software travar.'],
        ['Autodiagnóstico por software', 'Testa sensores e atuadores ao ligar.'],
        ['Registro de falhas (log)', 'Ajuda a manutenção a achar a causa.'],
        ['LED / buzzer de estado', 'Mostra o problema ao operador.'],
        ['Alerta no celular', 'Avisa à distância.']
    ] },
    { verbos: ['ved', 'sel', 'estanq'], objetos: [], principios: [
        ['Anel O-ring', 'Vedação estática simples.'],
        ['Retentor labial', 'Vedação de eixos girando.'],
        ['Selo mecânico', 'Vedação de bombas.'],
        ['Junta plana', 'Entre flanges.']
    ] }
];

/**
 * Modelos de estrutura de funções (cadeias típicas), inseridos no nível aberto do diagrama.
 * Cada função diz que fluxos da fronteira pode receber (recebe) e entregar (entrega), para a ligação automática.
 */
const MODELOS_ESTRUTURA = {
    automacao: { nome: 'Cadeia de automação (sensor → controle → atuador)', tipo: 'automacao', funcoes: [
        { nome: 'Captar o sinal do processo', recebe: ['material', 'sinal'] },
        { nome: 'Condicionar o sinal' },
        { nome: 'Processar e decidir', recebe: ['sinal'] },
        { nome: 'Acionar o atuador', entrega: ['energia', 'material'] },
        { nome: 'Informar o usuário', entrega: ['sinal'] },
        { nome: 'Comunicar os dados', entrega: ['sinal'] },
        { nome: 'Alimentar o sistema eletricamente', recebe: ['energia'] }
    ], ligacoes: [[0, 1, 'sinal', 'Sinal do sensor'], [1, 2, 'sinal', 'Sinal condicionado'], [2, 3, 'sinal', 'Comando'], [2, 4, 'sinal', 'Estado'], [2, 5, 'sinal', 'Dados'],
        [6, 2, 'energia', 'Energia elétrica'], [6, 3, 'energia', 'Energia de potência']] },
    eletrico: { nome: 'Sistema elétrico (alimentação → proteção → conversão → carga)', tipo: 'eletrico', funcoes: [
        { nome: 'Receber a energia elétrica', recebe: ['energia'] },
        { nome: 'Proteger o circuito' },
        { nome: 'Converter a tensão' },
        { nome: 'Distribuir a energia' },
        { nome: 'Acionar a carga', recebe: ['sinal'], entrega: ['energia', 'material'] },
        { nome: 'Medir o consumo', entrega: ['sinal'] }
    ], ligacoes: [[0, 1, 'energia', 'Energia da rede'], [1, 2, 'energia', 'Energia protegida'], [2, 3, 'energia', 'Tensão adequada'], [3, 4, 'energia', 'Energia para a carga'], [3, 5, 'sinal', 'Corrente e tensão']] },
    agricola: { nome: 'Aplicação de insumo (armazenar → dosar → depositar)', tipo: 'agricola', funcoes: [
        { nome: 'Armazenar o insumo', recebe: ['material'] },
        { nome: 'Dosar o insumo', recebe: ['sinal'] },
        { nome: 'Conduzir o insumo' },
        { nome: 'Abrir o sulco', recebe: ['energia'] },
        { nome: 'Depositar o insumo no solo', entrega: ['material'] },
        { nome: 'Cobrir e compactar o sulco', entrega: ['material'] },
        { nome: 'Acionar os mecanismos', recebe: ['energia'] }
    ], ligacoes: [[0, 1, 'material', 'Insumo'], [1, 2, 'material', 'Insumo dosado'], [2, 4, 'material', 'Insumo'], [3, 4, 'material', 'Sulco aberto'], [4, 5, 'material', 'Insumo no sulco'], [6, 1, 'energia', 'Rotação']] },
    mecanico: { nome: 'Sistema mecânico (receber → transmitir → atuar)', tipo: 'mecanico', funcoes: [
        { nome: 'Receber a energia de acionamento', recebe: ['energia'] },
        { nome: 'Transmitir o movimento' },
        { nome: 'Converter o movimento' },
        { nome: 'Atuar sobre o objeto', recebe: ['material'], entrega: ['material', 'energia'] },
        { nome: 'Sustentar os componentes', recebe: ['material'] },
        { nome: 'Comandar o sistema', recebe: ['sinal'], entrega: ['sinal'] }
    ], ligacoes: [[0, 1, 'energia', 'Torque'], [1, 2, 'energia', 'Rotação'], [2, 3, 'energia', 'Movimento útil'], [5, 1, 'sinal', 'Comando'], [4, 3, 'material', 'Apoio']] }
};

/** Modelos na ordem de interesse para o tipo de projeto. */
function modelosParaTipo(tipo) {
    const todos = Object.entries(MODELOS_ESTRUTURA);
    if (!tipo || tipo === 'misto') return todos;
    return todos.sort((a, b) => (b[1].tipo === tipo) - (a[1].tipo === tipo));
}

/** Fluxos típicos da função global por tipo de projeto (chips de sugestão). */
const FLUXOS_SUGERIDOS = {
    energia: ['Energia elétrica da rede', 'Energia da bateria', 'Energia solar', 'Torque do motor', 'Rotação da tomada de potência', 'Energia humana', 'Calor dissipado', 'Movimento útil', 'Energia hidráulica'],
    material: ['Insumo (sementes, adubo)', 'Produto a processar', 'Ar', 'Água', 'Peso suportado', 'Produto processado', 'Resíduos', 'Poeira e umidade do ambiente'],
    sinal: ['Comando do operador', 'Ajuste de dose / setpoint', 'Leitura do sensor', 'Sinal de GPS / velocidade', 'Dados enviados', 'Alarme / indicação', 'Estado do sistema', 'Ruído / vibração']
};

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
