import axios from "axios";
import * as cheerio from 'cheerio';
import { calculateSeoScore } from "../helpers/seoscore.ts";
import { generateSeoInsights } from "./ai.service.ts";
import { saveAudit } from "../db/audit.repo.ts";


export class AuditService {
  async auditUrl(url: string) {
    try {
    console.log("Step 1: Fetching URL...");

     const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000
     });
    console.log("Step 2: Parsing HTML...");

     const $ = cheerio.load(data);

     const title = $('title').text();
     const metaEl = $('meta[name="description"]');
     const metaDescription = metaEl.length ? metaEl.attr('content') || '' : '';
     const h1 = $('h1').
        map((_, el) => $(el).text().trim())
        .get();
    
    const images = $('img');
    const imageCount = images.length;

    const imagesWithoutAlt = images.filter((_, el) => {
        return !$(el).attr('alt');
    }).length;

    const text = $('body').text();

    const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean) //it removes empty values from the array
    .length;

    const links = $('a');

    const internalLinks = links.filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.startsWith('/');
    }).length;

    const seoData = {
        url,
        title,
        metaDescription,
        h1,
        imageCount,
        imagesWithoutAlt,
        wordCount,
        internalLinks
    }
    console.log("Step 3: Calculating score...");

    const scoreResult = calculateSeoScore(seoData);

    console.log("Step 4: Generating AI insights...");

    const aiInsights = await generateSeoInsights({
        ...seoData,
        ...scoreResult
    })

    console.log("AI Insights:", JSON.stringify(aiInsights, null, 2));


    console.log("AI Insight", aiInsights);

    console.log("Step 5: Saving to DB...");


    const saved = await saveAudit({ ...seoData, ...scoreResult, ...aiInsights});
    console.log("Audit saved to DB Successfully", saved.id);

     return {
       success: true,
       ...seoData,
       ...scoreResult,
       ...aiInsights,
       recommendations: aiInsights.recommendations || aiInsights.recommendation || [],
       url,
       title,
       metaDescription,
       h1,
       imageCount,
       imagesWithoutAlt,
       wordCount,
       internalLinks
     };

   }

   
    catch (error: any) {
        console.log("Scrape error:", error)

        return {
            success: false,
            url,
            error: "Failed to fetch or parse URL",
            }
        }
   }
}