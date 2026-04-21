import axios from "axios";
import * as cheerio from 'cheerio';
import { calculateSeoScore } from "../helpers/seoscore.ts";
import { generateSeoInsights } from "./ai.service.ts";


export class AuditService {
  async auditUrl(url: string) {
    try {
     const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000
     });
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

    const scoreResult = calculateSeoScore(seoData);

    const aiInsights = await generateSeoInsights({
        ...seoData,
        ...scoreResult
    })

     return {
       success: true,
       ...seoData,
       ...scoreResult,
       ...aiInsights,
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
        console.log("Scrape error:", error.message)

        return {
            success: false,
            url,
            error: "Failed to fetch or parse URL",
            }
        }
   }
}