# Sistema de Projeto Conceitual

Ferramenta web (só navegador, sem instalação) para o **projeto conceitual** de produtos, continuação do
[Sistema QFD](https://github.com/MarlonSigales/QFD). Segue o modelo de Spagnolo (2011), que integra
Pahl et al. (2005) e Reis (2003).

**Usar:** https://marlonsigales.github.io/ProjetoConceitual/ (ou abra `index.html` por um servidor local:
`python3 -m http.server`).

## Feito para ser simples

1. **Importe o backup do QFD** → a ferramenta monta um rascunho de **todas** as etapas (abstração, funções ligadas,
   princípios do catálogo e das ideias do QFD, 3 concepções, perguntas e critérios da seleção) e lista no Início o que
   fez, para revisar. Nunca apaga o que você já preencheu.
2. Escolha o **tipo de projeto** (mecânico, elétrico, automação/eletrônico, máquina agrícola, misto): muda o catálogo, os
   **modelos prontos de estrutura** e as sugestões de fluxos.
3. **Pesquisa com IA (multiagente)**: baixe o pacote (pedido pronto + fotos + contexto), cole numa IA (ChatGPT, Claude,
   Gemini…) e cole a resposta de volta — princípios dos concorrentes, de patentes e da literatura entram na matriz
   morfológica, com maturidade, fontes e concepções sugeridas.
4. **Análises e TRL**: o que falta, especificação → função, maturidade de cada solução (TRL provável) e concorrentes.
5. **Sem arquivos no mesmo navegador**: o QFD e o Gestão de Projetos ficam no mesmo endereço; "Usar este QFD" aqui e
   "Usar o projeto conceitual deste navegador" no Gestão trazem tudo sem baixar nada.
6. **Fotos, câmera e esboço com o dedo** nos princípios e na concepção; **custo** por princípio e custo estimado das
   concepções; **FMEA** da concepção; **biblioteca da equipe** (princípios de projetos anteriores, sem servidor);
   **busca de patentes** por princípio; **tour** na primeira visita.
7. **Nuvem da equipe (MEGA)**: cada equipe usa a sua conta MEGA, protegida por senha (lembrada pelo gerenciador de senhas
   do navegador; nada fica público). Salva os projetos com versões e mantém a biblioteca da equipe com os princípios de
   todos os projetos. Não há servidor nosso: os dados vão do navegador direto para a conta da equipe, criptografados pelo MEGA.
8. **Gestão de Projetos**: baixe o arquivo "…-para-gestao.json" (ou use o ZIP) e importe na fase conceitual do Gestão: as
   funções viram a árvore TRL.

## Etapas

| # | Etapa | O que tem |
|---|-------|-----------|
| 1 | Escopo do problema | Especificações vindas do QFD (metas, pesos, sentido), marcação de custo, função relacionada a cada especificação, necessidades, restrições, abstração orientada em 5 passos (pré-preenchível) e formulação sem solução |
| 2 | Função global | Entradas e saídas de energia, material e sinal; caixa-preta; cria a estrutura funcional a partir dela |
| 3 | Estrutura funcional | Editor de diagrama de blocos: funções, **blocos laterais** (usuário, fonte de potência, ambiente…), **ligações de energia (linha simples), material (linha dupla) e sinal (tracejada)** com rótulo, fronteira do sistema, níveis (abrir uma função para desdobrá-la; os fluxos de cima viram portas na fronteira), organização automática, exportação SVG. Estruturas alternativas e seleção pela matriz de Ferreira (1997): IDT, IDC e IDT/IDC |
| 4 | Princípios de solução | Para cada função elementar: princípios com **foto/esboço**, descrição, método de busca (Quadro 1 — convencionais, intuitivos, discursivos) e ordem de adequação. **Pré-preenchimento pelo catálogo** (mecânica, elétrica, controle e máquinas agrícolas) |
| 5 | Matriz morfológica | Matriz com fotos, concepções coloridas ligadas por linhas, incompatibilidades, número de combinações, combinações compatíveis sugeridas e montagem automática de 3 concepções diferentes |
| 6 | Seleção da concepção | As 4 técnicas de Reis (2003) em sequência: viabilidade, disponibilidade de tecnologia, passa/não passa (das necessidades) e matriz de avaliação com referência |
| 7 | Concepção selecionada | Princípios escolhidos, descrição (rascunho automático), esboços e fotos, complementos de outras concepções, próximos passos |
| 8 | Análises e TRL | O que falta (com link para a etapa), desdobramento especificação → função, maturidade das soluções da concepção (TRL provável), concorrentes; exportação para o Gestão de Projetos |
| 9 | Relatório | Mesmo design do Gestão de Projetos e do QFD; imprimir/PDF, HTML único ou dentro do ZIP |

### Fluxo simplificado (elétrico, eletrônico, embarcado e automação)

Escolhido no Início para os tipos Elétrico, Automação/eletrônico e Misto. Segue o fluxo simplificado de Marwedel:
especificação → função global → **diagrama de blocos** → **soluções dos blocos** → concepção e **plano de testes** → análises → relatório.
Para cada bloco, o sistema procura uma solução que **já existe** (biblioteca da equipe, com os projetos anteriores, e módulos
prontos do mercado) e sugere usá-la: o bloco reaproveitado só precisa do **teste de integração**. Os blocos que não têm solução
pronta são desenvolvidos em hardware, software ou os dois, com a plataforma. A concepção é montada sozinha, e o plano de testes
segue o Modelo V (unidade, integração, sistema e aceitação, com uso e mau uso).

Os blocos a desenvolver passam pela etapa **Desenvolvimento dos blocos**: circuito pelo ciclo de Nilsson e Riedel (modelo,
simulação, protótipo com componentes pelos limites de trabalho, pico e falha, bancada; repetir ou voltar ao modelo),
controle pelos 6 passos de Nise e software com testes de unidade.

**Projeto misto:** duas abas — Mecânica (fluxo completo) e Elétrica e automação (fluxo simplificado). Cada especificação é
marcada como mecânica, elétrica ou das duas. **Parte elétrica no Gestão:** só a equipe da área elétrica edita (fora as
especificações); o coordenador e o gestor aceitam ou recusam cada etapa.

## Arquivo do projeto

- Tudo fica guardado **no navegador** (dados no `localStorage`, fotos no IndexedDB).
- **Baixar ZIP completo**: `projeto-conceitual.json`, `imagens/`, `diagramas/*.svg` (todos os níveis de
  todas as estruturas), `relatorio.html` (com `img/`) e `LEIA-ME.txt`.
- **Abrir projeto**: aceita o ZIP, o JSON do projeto ou o backup do QFD.
- **Importar do QFD**: use o backup JSON do Sistema QFD (Backup & Export → Exportar backup). Traz
  especificações, necessidades, abstração, formulação, função global e requisitos formadores de função.
  Reimportar atualiza o que veio do QFD e mantém o que foi feito aqui.
- **Exemplo**: roda de bicicleta urbana (continuação do exemplo do QFD), com todas as etapas.

## Estrutura do código

```
index.html          casca da aplicação (rotas por #/etapa)
css/style.css       identidade visual (Gestão de Projetos / QFD), responsivo
js/dados.js         modelo, armazenamento, imagens, importação do QFD, cálculos, ZIP
js/catalogo.js      catálogo de princípios, verbos de função, modelos prontos de estrutura e fluxos sugeridos
js/assistente.js    preenchimento automático a partir do QFD
js/esboco.js        desenho à mão (dedo, caneta, mouse)
js/biblioteca.js    biblioteca da equipe e links de busca de patentes
js/fmea.js          FMEA da concepção
js/desenvolvimento.js desenvolvimento dos blocos (Nilsson e Riedel; Nise)
js/misto.js         projeto misto em duas abas
js/aceite.js        aceite da parte elétrica (equipe, coordenador e gestor)
js/simplificado.js  fluxo simplificado (Marwedel): blocos, reuso, hardware × software e plano de testes do Modelo V
js/tour.js          tour da primeira visita
js/nuvem.js         nuvem da equipe (conta MEGA; biblioteca megajs carregada só quando a nuvem é usada)
js/ia.js            pacote e pedido para IA multiagente; importação da resposta
js/analises.js      análises (pendências, desdobramento, maturidade/TRL, concorrentes) e exportação para o Gestão
js/diagrama.js      editor e desenho da estrutura de funções (SVG)
js/relatorio.js     relatório (prévia, PDF e HTML)
js/exemplo.js       projeto de exemplo
js/app.js           menu, rotas, salvar automático, ligação campo↔dado, arquivo do projeto, início
js/etapas.js        páginas das etapas
lib/jszip.min.js    JSZip 3.10.1 (MIT) — local, funciona sem internet
tests/testes.html   testes automáticos (abrir pelo servidor)
todoQA.txt          diretrizes, próximos passos e o que já foi feito
```

## Referências

- BACK, N. et al. *Projeto integrado de produtos*. Manole, 2008.
- FERREIRA, M. G. G. *Utilização de modelos para a representação de produtos no projeto conceitual*. UFSC, 1997.
- MARWEDEL, P. *Embedded system design*. 4. ed. Springer, 2021.
- NILSSON, J. W.; RIEDEL, S. A. *Circuitos elétricos*. 10. ed. Pearson, 2016.
- NISE, N. S. *Engenharia de sistemas de controle*. 7. ed. LTC, 2017.
- PAHL, G.; BEITZ, W.; FELDHUSEN, J.; GROTE, K.-H. *Projeto na engenharia*. 6. ed. Blücher, 2005.
- REIS, A. V. *Desenvolvimento de concepções para a dosagem e deposição de precisão para sementes miúdas*. UFSC, 2003.
- ROOZENBURG, N. F. M.; EEKELS, J. *Product design: fundamentals and methods*. Wiley, 1995.
- SPAGNOLO, R. T. *Integração da qualidade no projeto conceitual de máquinas agrícolas*. UFPel, 2011.

## Créditos

Desenvolvedor: Marlon Soares Sigales.
Equipe de projeto: Roger Toscan Spagnolo, Ângelo Vieira dos Reis, Ádamo de Sousa Araújo, Gizele Ingrid
Gadotti, Eduardo Walker, Giusepe Stefanello, Fabrício Ardais — Equipe Inova Agro - UFPel - EMBRAPII.

© 2026 Marlon Sigales. Todos os direitos reservados. Copiar, reproduzir ou alterar o código exige autorização do autor; veja [LICENSE](LICENSE). A biblioteca JSZip em `lib/` segue sua própria licença (MIT).
