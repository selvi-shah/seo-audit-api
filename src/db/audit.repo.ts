import dbpool from "./client.ts";

export async function saveAudit(data: any) {
    const result = await dbpool.query(
        `Insert into audits
        (Url, title, meta_description, word_count, image_count, images_without_alt, internal_links, score, issues,
        warnings, recommendations, summary)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        returning *`,
        [
            data.url,
            data.title,
            data.metaDescription,
            data.wordCount,
            data.imageCount,    
            data.imagesWithoutAlt,
            data.internalLinks,
            data.score,
            JSON.stringify(data.issues),
            JSON.stringify(data.warnings),
            JSON.stringify(data.recommendations),
            data.summary
        ]
    );
    return result.rows[0];
}

export async function getAuditByUrl(Url :string) {
    const result = await dbpool.query(
        `select * from audits where url = $1 order by created_at desc`,
        [Url]
    );
    return result.rows;
}