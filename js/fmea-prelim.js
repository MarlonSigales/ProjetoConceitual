/**
 * © 2026 Sistema de Projeto Conceitual — Inova Agro UFPel EMBRAPII. Todos os direitos reservados; copiar, reproduzir ou alterar exige autorização do autor (ver LICENSE).
 *
 * FMEA ↔ PROJETO PRELIMINAR (a cada salvamento):
 * - A verificação de segurança do preliminar (P4) acompanha os modos de falha críticos da FMEA (sem repetir), enquanto
 *   o texto for o gerado; se a equipe escrever o seu, ele fica.
 * - Rodadas de teste reprovadas ou "ajustar e testar de novo" com especificação fora da meta viram linhas da FMEA
 *   (origem "rodada"); quando uma rodada seguinte atende a meta, a ação registra que foi resolvido. Notas e textos
 *   que a equipe mudar nessas linhas ficam.
 */

'use strict';

const PREFIXO_VERIF_FMEA = 'Da FMEA da concepção: ';

function atualizarVerificacaoFmea(p) {
    const pl = p.preliminar; if (!pl || !pl.verificacao) return;
    const atual = (pl.verificacao.seguranca || {}).acao || '';
    if (atual && !atual.startsWith(PREFIXO_VERIF_FMEA)) return; // a equipe escreveu o seu
    const vistos = new Set(), itens = [];
    (p.fmea || []).filter(l => fmeaCritico(l) && String(l.modo || '').trim()).sort((a, b) => rpn(b) - rpn(a)).forEach(l => {
        const k = semAcento(l.modo).trim(); if (vistos.has(k)) return; vistos.add(k);
        itens.push(`${l.modo}${l.acao ? ' → ' + l.acao : ''}`);
    });
    const novo = itens.length ? PREFIXO_VERIF_FMEA + itens.join('; ') : '';
    if (novo !== atual) pl.verificacao.seguranca = Object.assign({ r: '' }, pl.verificacao.seguranca || {}, { acao: novo });
}

function sincronizarFmeaRodadas(p) {
    const R = (p.preliminar && p.preliminar.prototipo && p.preliminar.prototipo.rodadas) || [];
    if (!R.length || typeof atendeMeta !== 'function') return;
    const esp = typeof especsUsadas === 'function' ? especsUsadas(p) : p.especificacoes;
    p.fmea = p.fmea || [];
    R.forEach((r, i) => {
        if (!['reprovado', 'ajustar'].includes(r.conclusao)) return;
        (r.resultados || []).forEach(x => {
            const e = esp.find(y => y.id === x.especId);
            if (!e || !String(x.valor || '').trim() || atendeMeta(e, x.valor) !== false) return;
            const id = `fm_rd_${r.id}_${x.especId}`;
            let l = p.fmea.find(y => y.id === id);
            const efeito = `Medido ${x.valor}${x.condicao ? ` (${x.condicao})` : ''}; meta ${e.meta || '—'}`;
            if (!l) {
                l = { id, funcId: (e.funcoesIds || [])[0] || '', origem: 'rodada', rodadaId: r.id, rodadaNome: r.nome, especId: e.id,
                    modo: `${e.descricao} fora da meta${x.obs ? ' — ' + x.obs : ''}`, efeito, causa: r.observacoes || 'A investigar',
                    s: 7, o: 6, d: 2, acao: (R[i + 1] && R[i + 1].modificacoes) || '', sugerido: true };
                p.fmea.push(l);
            } else { l.efeito = efeito; l.rodadaNome = r.nome; if (!l.acao && R[i + 1] && R[i + 1].modificacoes) l.acao = R[i + 1].modificacoes; }
            // resolvido numa rodada seguinte?
            const depois = R.slice(i + 1).find(y => (y.resultados || []).some(z => z.especId === e.id && String(z.valor || '').trim() && atendeMeta(e, z.valor) === true));
            const marca = depois ? `✓ atendido na ${depois.nome}` : '';
            if (marca && !String(l.acao).includes(marca)) l.acao = (l.acao ? l.acao + ' — ' : '') + marca;
        });
    });
}

{
    const salvarAntesFmea = PC.salvar;
    PC.salvar = function (motivo) {
        try { if (this.p) { sincronizarFmeaRodadas(this.p); atualizarVerificacaoFmea(this.p); } } catch (e) { console.warn('FMEA ↔ preliminar', e); }
        return salvarAntesFmea.apply(this, arguments);
    };
}
