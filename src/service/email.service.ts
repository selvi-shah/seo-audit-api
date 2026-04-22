import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER || '';
const gmailPass = process.env.GMAIL_APP_PASSWORD || '';

console.log("User length:", gmailUser.length);
console.log("Pass length:", gmailPass.length);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: gmailUser,
        pass: gmailPass
    }
});


export async function sendAuditReport (to: string, auditData: any) {
    await transporter.verify();
    console.log("Transporter verified ✅");
    console.log("GMAIL_USER:", process.env.GMAIL_USER);
    console.log("GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD);
    try {
        await transporter.sendMail({
            from: `"SEO Auditor" <${process.env.GMAIL_USER}>`,
            to,
            subject: `SEO Audit Report - ${auditData.url}`,
            html: buildEmailTemplate(auditData)
        });
        console.log("Email Sent Successfully");
    } catch (error: any) {
        console.error("Email error:", error.message);
    }
}

function buildEmailTemplate(data: any): string {
      console.log("Building template with:", JSON.stringify(data, null, 2));

    const recommendations = data.recommendations || data.recommendation || [];

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">SEO Audit Report</h2>

      <p><strong>URL:</strong> ${data.url}</p>
      <p><strong>Score:</strong> ${data.score}/100</p>
      <p><strong>Summary:</strong> ${data.summary}</p>

      <h3>Recommendations</h3>
      <ul>
        ${data.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
      </ul>

      <h3>Page Details</h3>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td><strong>Title</strong></td><td>${data.title}</td></tr>
        <tr><td><strong>Word Count</strong></td><td>${data.wordCount}</td></tr>
        <tr><td><strong>Images Without Alt</strong></td><td>${data.imagesWithoutAlt}</td></tr>
        <tr><td><strong>Internal Links</strong></td><td>${data.internalLinks}</td></tr>
      </table>
    </div>
  `;
}

export async function sendComparisonReport(to: string, comaprsion: any) {
    try {
        await transporter.sendMail({
            from: `"SEO Audtior" <${process.env.GMAIL_USER}>`,
            to,
            subject: `SEO Competitor Analysis - ${comaprsion.urls.a} vs ${comaprsion.urls.b}`,
            html: buildComparisonTemplate(comaprsion)
        });
        console.log("Comparison email sent");
    } catch (error: any) {
        console.error("Comparison email error:", error.message);
    }
}

function buildComparisonTemplate(data: any): string {
    const { urls, metrics, overall } = data;

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">SEO Competitor Analysis</h2>
      
      <p><strong>${urls.a}</strong> vs <strong>${urls.b}</strong></p>

      <h3>Metrics Comparison</h3>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="background: #f4f4f4;">
          <th style="padding: 8px; text-align:left;">Metric</th>
          <th style="padding: 8px; text-align:center;">${urls.a}</th>
          <th style="padding: 8px; text-align:center;">${urls.b}</th>
          <th style="padding: 8px; text-align:center;">Winner</th>
        </tr>
        ${metrics.map((m: any) => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px;">${m.label}</td>
            <td style="padding: 8px; text-align:center;">${m.a}</td>
            <td style="padding: 8px; text-align:center;">${m.b}</td>
            <td style="padding: 8px; text-align:center;">
              ${m.winner === 'a' ? urls.a : m.winner === 'b' ? urls.b : 'Tie'}
            </td>
          </tr>
        `).join('')}
      </table>

      <h3>Overall Winner 🏆</h3>
      <p style="font-size: 18px; color: #27ae60;">
        <strong>${overall.winner}</strong>
      </p>
      <p>${urls.a}: ${overall.aWins} wins | ${urls.b}: ${overall.bWins} wins</p>
    </div>
  `;
}
