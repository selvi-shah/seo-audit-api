
function compareMetric(label: string, a: number, b: number, lowerIsBetter = false) {
    const winner = lowerIsBetter
    ? (a < b ? 'a' : a > b ? 'b' : 'tie')
    : (a > b ? 'a' : a < b ? 'b' : 'tie');

    return {
        label, 
        a,
        b, 
        winner
    };
}

export function compareCompetitors(urlA: string, auditA: any, urlB: string, auditB: any) {
    const metrics = [
        compareMetric('Score', auditA.score, auditB.score),
        compareMetric('Word Count', auditA.wordCount, auditB.wordCount),
        compareMetric('Internal Links', auditA.internalLinks, auditB.internalLinks),
        compareMetric('Images Without Alt', auditA.imagesWithoutAlt, auditB.imagesWithoutAlt)
    ];

    const aWins = metrics.filter(m => m.winner === 'a').length;
    const bWins = metrics.filter(m => m.winner === 'b').length;

    return {
        urls: { a: urlA, b: urlB},
        metrics,
        overall: {
            winner: aWins > bWins ? urlA : bWins > aWins ? urlB : 'tie',
            aWins,
            bWins
        }
    }
}