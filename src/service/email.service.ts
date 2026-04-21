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
