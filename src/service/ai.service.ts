import Groq from "groq-sdk";


export async function generateSeoInsights(data: any) {
    try {
        const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || ""
    });
    
    
        const prompt = `
        You are an expert SEO auditor.
    
        Analyze this SEO data and explain in simple terms:
        ${JSON.stringify(data, null, 2)}
    
        Return ONLY valid JSON:
        {
            "summary": string,
            "recommendations": ["string", "string"]
        }
        `;
    
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
    
        const content = response.choices[0]?.message.content || "{}";
    
        const cleaned = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    
        return JSON.parse(cleaned);
    } catch (error: any) {
        console.error("Groq error", error.message);
        return{
            summary: "Could not generate insights",
            recommendations: []
        }
        
    }
    
}