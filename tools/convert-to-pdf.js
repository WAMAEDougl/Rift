const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

const files = [
  { input: '01_Market_Research_Report.md', output: '01_Market_Research_Report.pdf' },
  { input: '02_Business_Plan.md', output: '02_Business_Plan.pdf' },
  { input: '03_Feasibility_Study.md', output: '03_Feasibility_Study.pdf' },
  { input: '04_Financial_Projections.md', output: '04_Financial_Projections.pdf' },
];

const cssStyles = `
  <style>
    @page {
      margin: 2cm;
      @bottom-center {
        content: counter(page);
      }
    }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #2c3e50;
      max-width: 100%;
      padding: 0;
      margin: 0;
    }
    h1 {
      color: #1B4F72;
      font-size: 24pt;
      border-bottom: 3px solid #1B4F72;
      padding-bottom: 10px;
      margin-top: 30px;
      page-break-after: avoid;
    }
    h2 {
      color: #1B4F72;
      font-size: 18pt;
      border-bottom: 1px solid #AED6F1;
      padding-bottom: 6px;
      margin-top: 25px;
      page-break-after: avoid;
    }
    h3 {
      color: #2E86C1;
      font-size: 14pt;
      margin-top: 20px;
      page-break-after: avoid;
    }
    h4 {
      color: #2E86C1;
      font-size: 12pt;
      margin-top: 15px;
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th {
      background-color: #1B4F72;
      color: white;
      font-weight: bold;
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #1B4F72;
    }
    td {
      padding: 6px 10px;
      border: 1px solid #D5D8DC;
    }
    tr:nth-child(even) {
      background-color: #F2F4F4;
    }
    tr:hover {
      background-color: #EBF5FB;
    }
    code {
      background-color: #F4F6F6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
    }
    pre {
      background-color: #F4F6F6;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #2E86C1;
      overflow-x: auto;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #2E86C1;
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #EBF5FB;
      color: #1B4F72;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 4px 0;
    }
    strong {
      color: #1B4F72;
    }
    hr {
      border: none;
      border-top: 2px solid #AED6F1;
      margin: 25px 0;
    }
    p {
      margin: 8px 0;
    }
    a {
      color: #2E86C1;
      text-decoration: none;
    }
    .page-header {
      text-align: center;
      padding: 40px 0;
      border-bottom: 3px solid #1B4F72;
      margin-bottom: 30px;
    }
  </style>
`;

async function convertToPdf(inputFile, outputFile) {
  const mdContent = fs.readFileSync(inputFile, 'utf-8');
  const htmlContent = marked(mdContent);

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${cssStyles}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputFile,
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8pt; color: #999; width: 100%; text-align: center; padding: 5px 0;">
        AYOLA FOODS KE — CONFIDENTIAL
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8pt; color: #999; width: 100%; text-align: center; padding: 5px 0;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
  });

  await browser.close();
  console.log(`Created: ${outputFile}`);
}

async function main() {
  const baseDir = 'c:/Users/Gkanja/Projects/Ayola Foods KE';

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  await browser.close();
  console.log('Puppeteer browser verified.');

  for (const file of files) {
    await convertToPdf(
      path.join(baseDir, file.input),
      path.join(baseDir, file.output)
    );
  }
  console.log('All PDF files created successfully!');
}

main().catch(console.error);
