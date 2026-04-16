import axios from "axios";
import * as cheerio from 'cheerio';
import { calculateSeoScore } from "../helpers/seoscore.ts";


export class AuditService {
  async auditUrl(url: string) {
    try {
     const { data } = await axios.get(url);
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

     return {
       success: true,
       ...seoData,
       ...scoreResult,
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

   
    catch (error) {
        return {
            success: false,
            url,
            error: "Failed to fetch or parse URL",
            }
        }
   }
}