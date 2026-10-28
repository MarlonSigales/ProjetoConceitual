/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Código aberto; cópias permitidas desde que citadas.
 *
 * BANCO DA EQUIPE: COMPONENTES PADRONIZADOS, MATERIAIS E FORNECEDORES
 * Reis (2003), tarefa 3.2.1: preferir soluções padronizadas e de catálogo; cap. 8: a falta de dados de projetos anteriores
 * dificultou o preliminar. Este banco junta o que cada projeto usou — no navegador e na nuvem da equipe (MEGA, só com senha,
 * em SistemaProjetoConceitual/Cadastros/componentes.json) — sem repetir. Preço só com a data da cotação; nada é inventado.
 */

'use strict';

const COMP_CHAVE = 'pc_componentes';
const FORMATO_COMPONENTES = 'projeto-conceitual-componentes';
const TIPOS_CADASTRO = { componente: 'Componente comprado', material: 'Material' };

/** Lista inicial (sem preço: cotar). Nomes e normas usuais; a equipe completa com fornecedor e preço. */
const COMPONENTES_BASE = [
    ['componente', 'Fixação', 'Parafuso sextavado', 'ISO 4017 (DIN 933), aço classe 8.8 zincado', 'un'],
    ['componente', 'Fixação', 'Porca sextavada', 'ISO 4032 (DIN 934), classe 8', 'un'],
    ['componente', 'Fixação', 'Arruela lisa', 'ISO 7089 (DIN 125)', 'un'],
    ['componente', 'Fixação', 'Parafuso Allen cabeça cilíndrica', 'ISO 4762 (DIN 912)', 'un'],
    ['componente', 'Mancal', 'Rolamento rígido de esferas 6202-2RS', '15 × 35 × 11 mm, vedado', 'un'],
    ['componente', 'Mancal', 'Rolamento rígido de esferas 606ZZ', '6 × 17 × 6 mm, blindado', 'un'],
    ['componente', 'Mancal', 'Mancal com rolamento UCP 204', 'eixo 20 mm, ferro fundido', 'un'],
    ['componente', 'Vedação', 'Anel O-ring NBR 70', 'medida conforme AS568 ou ISO 3601', 'un'],
    ['componente', 'Vedação', 'Retentor radial', 'NBR, medida conforme o eixo', 'un'],
    ['componente', 'Transmissão', 'Corrente de rolos ASA 40', 'passo 1/2"', 'm'],
    ['componente', 'Transmissão', 'Correia em V perfil A', 'comprimento conforme o projeto', 'un'],
    ['componente', 'Transmissão', 'Engrenagem de dentes retos', 'módulo e número de dentes conforme o projeto', 'un'],
    ['componente', 'Acionamento', 'Motor CC com redução 12 V', 'torque e rotação conforme o projeto', 'un'],
    ['componente', 'Acionamento', 'Motor de passo NEMA 17', '1,8°/passo', 'un'],
    ['componente', 'Eletrônica', 'Microcontrolador ESP32', 'Wi-Fi/Bluetooth, 3,3 V', 'un'],
    ['componente', 'Eletrônica', 'Driver de motor (ponte H)', 'corrente conforme o motor', 'un'],
    ['componente', 'Eletrônica', 'Sensor indutivo de proximidade', 'PNP/NPN, 10–30 V', 'un'],
    ['componente', 'Eletrônica', 'Encoder incremental', 'pulsos por volta conforme a resolução', 'un'],
    ['componente', 'Eletrônica', 'Caixa de proteção IP65', 'policarbonato ou ABS', 'un'],
    ['componente', 'Eletrônica', 'Conector circular à prova d’água', 'IP67', 'un'],
    ['componente', 'Elétrica', 'Fusível automotivo de lâmina', 'corrente conforme o circuito', 'un'],
    ['componente', 'Elétrica', 'Cabo PP flexível', 'bitola conforme a corrente', 'm'],
    ['material', 'Aço', 'Aço SAE 1020', 'baixo carbono, soldável; chapas e barras', 'kg'],
    ['material', 'Aço', 'Aço SAE 1045', 'médio carbono; eixos e peças com esforço', 'kg'],
    ['material', 'Aço', 'Aço inox AISI 304', 'resistente à corrosão', 'kg'],
    ['material', 'Alumínio', 'Alumínio 6061-T6', 'leve, usinável', 'kg'],
    ['material', 'Plástico', 'PLA (impressão 3D)', 'protótipo; pouca resistência ao calor', 'kg'],
    ['material', 'Plástico', 'PETG (impressão 3D)', 'protótipo mais resistente que o PLA', 'kg'],
    ['material', 'Plástico', 'Nylon PA6', 'peças de desgaste, engrenagens', 'kg'],
    ['material', 'Plástico', 'Polipropileno (PP)', 'injeção; resistente a produtos químicos', 'kg'],
    ['material', 'Borracha', 'Borracha NBR', 'vedações; resiste a óleo', 'kg']
].map(([tipo, categoria, nome, especificacao, unidade]) => ({ tipo, categoria, nome, especificacao, unidade, preco: null, dataPreco: '', fornecedor: '', contato: '', cidade: '', prazo: '', obs: '', projeto: 'lista básica' }));

function lerComponentes() {
    try { const b = JSON.parse(localStorage.getItem(COMP_CHAVE) || 'null'); if (b && Array.isArray(b.itens)) return b; } catch (e) { /* recomeça */ }
    return { formato: FORMATO_COMPONENTES, versao: 1, itens: COMPONENTES_BASE.map(x => Object.assign({}, x)) };
}
/** Fornecedores do banco: { nome, contato, cidade, fornece, prazo, condicoes, avaliacao (1–5), obs }. Juntar pelo nome. */
const CAMPOS_FORN = [['nome', 'Fornecedor'], ['contato', 'Contato (telefone, e-mail, site)'], ['cidade', 'Cidade'], ['fornece', 'O que fornece'], ['prazo', 'Prazo'], ['condicoes', 'Condições'], ['avaliacao', 'Avaliação (1–5)'], ['obs', 'Observações']];
function itemFornecedor(f) { const o = {}; CAMPOS_FORN.forEach(([k]) => { o[k] = txt(f[k] ?? '', 300); }); o.nome = o.nome.trim(); return o; }
function juntarFornecedores(b, lst) {
    b.fornecedores = lista(b.fornecedores);
    let novos = 0;
    lista(lst).forEach(bruto => {
        if (!bruto || !String(bruto.nome || '').trim()) return;
        const f = itemFornecedor(bruto), ja = b.fornecedores.find(x => semAcento(x.nome) === semAcento(f.nome));
        if (!ja) { b.fornecedores.push(f); novos++; return; }
        CAMPOS_FORN.forEach(([k]) => { if (!String(ja[k] || '').trim() && f[k]) ja[k] = f[k]; });
    });
    // quem aparece como fornecedor de algum item também entra na lista
    b.itens.forEach(i => { if (i.fornecedor && !b.fornecedores.some(x => semAcento(x.nome) === semAcento(i.fornecedor))) { b.fornecedores.push(itemFornecedor({ nome: i.fornecedor, cidade: i.cidade, contato: i.contato, prazo: i.prazo })); novos++; } });
    return novos;
}
function cotacoesDe(b, nome) { return b.itens.filter(i => i.fornecedor && semAcento(i.fornecedor) === semAcento(nome) && i.preco !== null); }

function gravarComponentes(b) { try { localStorage.setItem(COMP_CHAVE, JSON.stringify(b)); return true; } catch (e) { return false; } }

const chaveComp = i => `${i.tipo}|${semAcento(i.nome)}|${semAcento(i.especificacao || '')}`;

/** Normaliza um item vindo de projeto, arquivo, nuvem ou IA. */
function itemComponente(i) {
    const preco = i.preco === '' || i.preco === undefined || i.preco === null ? null : +String(i.preco).replace(',', '.');
    return {
        tipo: TIPOS_CADASTRO[i.tipo] ? i.tipo : 'componente', categoria: txt(i.categoria, 60), nome: txt(i.nome, 140).trim(),
        especificacao: txt(i.especificacao, 300), unidade: txt(i.unidade || 'un', 12), preco: isFinite(preco) ? preco : null,
        dataPreco: txt(i.dataPreco, 20), fornecedor: txt(i.fornecedor, 160), contato: txt(i.contato, 160), cidade: txt(i.cidade, 80),
        prazo: txt(i.prazo, 60), obs: txt(i.obs, 400), projeto: txt(i.projeto, 160), fonte: txt(i.fonte, 400)
    };
}

/**
 * Junta itens sem repetir (mesmo tipo + nome + especificação). Se o item já existe, completa os campos vazios e fica
 * com o preço de cotação mais recente. Devolve { novos, atualizados }.
 */
function juntarComponentes(b, itens) {
    const mapa = new Map(b.itens.map(i => [chaveComp(i), i]));
    let novos = 0, atualizados = 0;
    itens.forEach(bruto => {
        if (!bruto || !String(bruto.nome || '').trim()) return;
        const i = itemComponente(bruto), k = chaveComp(i), ja = mapa.get(k);
        if (!ja) { b.itens.push(i); mapa.set(k, i); novos++; return; }
        let mudou = false;
        Object.keys(i).forEach(c => { if ((ja[c] === '' || ja[c] === null || ja[c] === undefined) && i[c] !== '' && i[c] !== null) { ja[c] = i[c]; mudou = true; } });
        if (i.preco !== null && i.dataPreco && (!ja.dataPreco || i.dataPreco > ja.dataPreco)) { ja.preco = i.preco; ja.dataPreco = i.dataPreco; if (i.fornecedor) ja.fornecedor = i.fornecedor; mudou = true; }
        if (mudou) atualizados++;
    });
    return { novos, atualizados };
}

/** O que o projeto usou: peças compradas (componentes) e materiais das peças fabricadas, com fornecedor e custo. */
function componentesDoProjeto(p) {
    const pl = p.preliminar || {}, hoje = new Date().toISOString().slice(0, 10), out = [];
    lista(pl.portadores).forEach(x => {
        if (x.origem === 'comprado' && x.nome) out.push({ tipo: 'componente', categoria: x.papel === 'auxiliar' ? 'Função auxiliar' : '', nome: x.nome, especificacao: x.parametro, unidade: 'un',
            preco: x.custo, dataPreco: x.custo !== null && x.custo !== '' ? hoje : '', fornecedor: x.fornecedor, projeto: p.projeto.nome || '' });
        if (x.material) out.push({ tipo: 'material', nome: x.material, especificacao: '', unidade: 'kg', projeto: p.projeto.nome || '' });
    });
    return out;
}

/** Sugestões do banco para um texto (nome de função, portador ou material). */
function sugerirComponentes(texto, tipo, limite = 6) {
    const b = lerComponentes(), t = semAcento(texto || '');
    return b.itens.filter(i => (!tipo || i.tipo === tipo) && (palavrasEmComum(texto, i.nome + ' ' + i.categoria + ' ' + i.especificacao) >= 1 || (t && semAcento(i.categoria) && t.includes(semAcento(i.categoria)))))
        .slice(0, limite);
}
function acharComponente(nome) { const n = semAcento(nome || ''); return lerComponentes().itens.find(i => semAcento(i.nome) === n) || null; }

/** Listas para autocompletar (datalist) nos campos de nome, material e fornecedor. */
function htmlListasComponentes() {
    const b = lerComponentes();
    const fornecedores = [...new Set(b.itens.map(i => i.fornecedor).concat(lista(b.fornecedores).map(f => f.nome)).filter(Boolean))];
    return `<datalist id="dl-componentes">${b.itens.filter(i => i.tipo === 'componente').map(i => `<option value="${escAttr(i.nome)}">${esc(i.especificacao)}</option>`).join('')}</datalist>
        <datalist id="dl-materiais">${b.itens.filter(i => i.tipo === 'material').map(i => `<option value="${escAttr(i.nome)}">${esc(i.especificacao)}</option>`).join('')}</datalist>
        <datalist id="dl-fornecedores">${fornecedores.map(f => `<option value="${escAttr(f)}">`).join('')}</datalist>`;
}

// ---------------------------------------------------------------- nuvem (MEGA, só com senha)

async function pastaCadastros() { const { raiz } = await pastasBase(); return pasta(raiz, 'Cadastros'); }

/** Lê o cadastro da nuvem, junta itens (deste navegador e do projeto) e regrava uma única cópia. */
async function sincronizarComponentesNuvem(itensExtras = []) {
    const dir = await pastaCadastros();
    const atual = filhosDe(dir).find(f => !f.directory && f.name === 'componentes.json');
    const nuvem = { formato: FORMATO_COMPONENTES, versao: 1, itens: [] };
    let fornNuvem = [];
    if (atual) { try { const d = JSON.parse(await (await baixar(atual)).text()); juntarComponentes(nuvem, lista(d.itens)); fornNuvem = lista(d.fornecedores); } catch (e) { /* ilegível: recomeça */ } }
    const local = lerComponentes();
    const r = juntarComponentes(nuvem, local.itens.concat(itensExtras));
    juntarFornecedores(nuvem, fornNuvem); const fn = juntarFornecedores(nuvem, local.fornecedores);
    if (fn) r.atualizados++;
    nuvem.geradoEm = new Date().toISOString();
    if (r.novos || r.atualizados || !atual) {
        await enviar(dir, 'componentes.json', new Blob([JSON.stringify(nuvem, null, 2)], { type: 'application/json' }));
        if (atual) { try { await atual.delete(true); } catch (e) { /* fica a anterior também */ } }
    }
    juntarComponentes(local, nuvem.itens); juntarFornecedores(local, nuvem.fornecedores); gravarComponentes(local);
    return { total: nuvem.itens.length, novosNaNuvem: r.novos, fornecedores: nuvem.fornecedores.length };
}

// ---------------------------------------------------------------- tela

function htmlCartaoComponentes(p) {
    const b = lerComponentes(), doProj = componentesDoProjeto(p);
    const comPreco = b.itens.filter(i => i.preco !== null).length;
    return `<section class="card cartao-componentes" id="banco-componentes">
        <div class="card-topo"><h2>🗄 Banco da equipe: componentes, materiais e fornecedores</h2></div>
        <p class="nota">${b.itens.length} item(ns) no banco (${comPreco} com preço cotado). Os campos de nome, material e fornecedor já sugerem o que está aqui; escolha da lista em vez de digitar. Preço só com a data da cotação.</p>
        <div class="botoes">
            <button type="button" class="btn btn-primary btn-sm" data-acao="comp-guardar">Guardar os deste projeto (${doProj.length})</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="comp-nuvem">☁ Juntar com a nuvem da equipe</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="comp-exportar">⬇ Baixar arquivo</button>
            <button type="button" class="btn btn-secondary btn-sm" data-acao="comp-importar">⇪ Juntar arquivo de outra pessoa</button>
        </div>
        <details><summary>Ver o banco</summary>
            <div class="tabela-rolagem"><table class="tabela tabela-comp"><thead><tr><th>Tipo</th><th>Nome</th><th>Especificação</th><th>Preço</th><th>Fornecedor</th><th>Projeto</th></tr></thead>
            <tbody>${b.itens.map(i => `<tr><td>${esc(TIPOS_CADASTRO[i.tipo])}</td><td>${esc(i.nome)}</td><td>${esc(i.especificacao)}</td><td class="col-num">${i.preco !== null ? 'R$ ' + i.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + (i.dataPreco ? `<small> (${esc(i.dataPreco)})</small>` : '') : '<small>cotar</small>'}</td><td>${esc(i.fornecedor)}${i.cidade ? ` <small>${esc(i.cidade)}</small>` : ''}</td><td><small>${esc(i.projeto)}</small></td></tr>`).join('')}</tbody></table></div>
        </details>
        ${htmlFornecedores(b)}
    </section>`;
}

function htmlFornecedores(b) {
    juntarFornecedores(b, []);
    const F = b.fornecedores;
    return `<details ${App.verForn ? 'open' : ''} data-forn-painel><summary>Fornecedores (${F.length})</summary>
        <p class="nota">Cadastro da equipe (vale para todos os projetos). As cotações vêm dos itens do banco com esse fornecedor e preço.</p>
        <div class="tabela-rolagem"><table class="tabela tabela-partes tabela-forn"><thead><tr>${CAMPOS_FORN.map(([, t]) => `<th>${esc(t)}</th>`).join('')}<th>Cotações</th><th></th></tr></thead><tbody>
        ${F.map((f, i) => `<tr>${CAMPOS_FORN.map(([k, t]) => `<td data-rotulo="${escAttr(t)}">${k === 'avaliacao' ? `<select data-forn="${i}" data-forn-campo="${k}" aria-label="${escAttr(t)}"><option value="">—</option>${[1, 2, 3, 4, 5].map(n => `<option ${String(f[k]) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}</select>` : `<input type="text" data-forn="${i}" data-forn-campo="${k}" value="${escAttr(f[k] || '')}" maxlength="300" aria-label="${escAttr(t)}">`}</td>`).join('')}
            <td data-rotulo="Cotações" class="pequeno">${cotacoesDe(b, f.nome).map(c => `${esc(c.nome)}: R$ ${c.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${c.dataPreco ? ' (' + esc(c.dataPreco) + ')' : ''}`).join('<br>') || '—'}</td>
            <td class="col-acao"><button type="button" class="btn-icone" data-acao="forn-del" data-i="${i}" aria-label="Excluir">✕</button></td></tr>`).join('') || `<tr><td colspan="${CAMPOS_FORN.length + 2}">Nenhum fornecedor ainda.</td></tr>`}</tbody></table></div>
        <div class="botoes"><button type="button" class="btn btn-secondary btn-sm" data-acao="forn-add">+ Fornecedor</button></div>
    </details>`;
}
document.addEventListener('change', e => {
    const el = e.target;
    if (!el || !el.dataset || el.dataset.forn === undefined) return;
    const b = lerComponentes(); juntarFornecedores(b, []);
    const f = b.fornecedores[+el.dataset.forn];
    if (!f) return;
    f[el.dataset.fornCampo] = txt(el.value, 300);
    gravarComponentes(b);
});
document.addEventListener('toggle', e => { if (e.target && e.target.matches && e.target.matches('[data-forn-painel]')) App.verForn = e.target.open; }, true);

Object.assign(ACOES, {
    'forn-add': () => { const b = lerComponentes(); juntarFornecedores(b, []); b.fornecedores.push(itemFornecedor({ nome: '' })); gravarComponentes(b); App.verForn = true; renderPagina(true); },
    'forn-del': b0 => { const b = lerComponentes(); juntarFornecedores(b, []); const f = b.fornecedores[+b0.dataset.i];
        const usados = f && f.nome ? b.itens.filter(i => semAcento(i.fornecedor || '') === semAcento(f.nome)).length : 0;
        if (usados) { avisar(`"${f.nome}" é o fornecedor de ${usados} item(ns) do banco: troque o fornecedor desses itens antes de excluir.`, 'erro', 8000); return; }
        if (f && f.nome && !confirm(`Excluir o fornecedor "${f.nome}" do banco da equipe?`)) return; b.fornecedores.splice(+b0.dataset.i, 1); gravarComponentes(b); renderPagina(true); },
    'comp-guardar': () => {
        const b = lerComponentes(), r = juntarComponentes(b, componentesDoProjeto(PC.p));
        gravarComponentes(b); renderPagina(true);
        avisar(r.novos || r.atualizados ? `Banco da equipe: ${r.novos} novo(s), ${r.atualizados} atualizado(s). Use "Juntar com a nuvem" para a equipe ver.` : 'Nada novo: marque peças como "comprado" ou preencha materiais na lista de partes.');
    },
    'comp-nuvem': async () => {
        if (typeof nuvemGarantir !== 'function') return;
        const r = await comAviso('Juntando o banco de componentes com a nuvem da equipe…', () => sincronizarComponentesNuvem(componentesDoProjeto(PC.p)));
        renderPagina(true);
        avisar(`Banco da equipe na nuvem: ${r.total} item(ns) (${r.novosNaNuvem} novo(s)).`, 'ok', 7000);
    },
    'comp-exportar': () => {
        const b = lerComponentes(); b.geradoEm = new Date().toISOString();
        baixarArquivo(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' }), 'componentes-da-equipe.json');
    },
    'comp-importar': async () => {
        const arq = await escolherArquivo('#arq-abrir');
        if (!arq) return;
        let d; try { d = JSON.parse((await arq.text()).replace(/^﻿/, '')); } catch (e) { avisar('Arquivo ilegível: use o "componentes-da-equipe.json" baixado por aqui.', 'erro'); return; }
        const b = lerComponentes(), r = juntarComponentes(b, lista(d.itens)); juntarFornecedores(b, d.fornecedores);
        gravarComponentes(b); renderPagina(true);
        avisar(`${r.novos} item(ns) novo(s), ${r.atualizados} atualizado(s).`);
    }
});
