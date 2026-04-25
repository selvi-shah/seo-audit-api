
export function calculateSeoScore(data: any) {
    let score = 100;

    const issues: string[] = [];
    const warnings: string[] = [];

    if(!data.metaDescription) {
        score -= 10;
        issues.push("Missing meta description");
    }

    if(!data.title) {
        score -= 10;
        issues.push("Missing meta title");
    }

    if(!data.h1 || data.h1.length === 0) {
        score -= 10;
        issues.push("Missing H1");
    }

    if(data.wordCount < 300) {
        score -= 20;
        warnings.push("Low word count");
    }

    if(data.internalLinks < 5) {
        score -= 10;
        warnings.push("Low interenal links")
    }

    return {
        score: Math.max(score, 0),
        issues,
        warnings
    }
}
