const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, PageBreak } = require('docx');

const files = [
  { input: '01_Market_Research_Report.md', output: '01_Market_Research_Report.docx' },
  { input: '02_Business_Plan.md', output: '02_Business_Plan.docx' },
  { input: '03_Feasibility_Study.md', output: '03_Feasibility_Study.docx' },
  { input: '04_Financial_Projections.md', output: '04_Financial_Projections.docx' },
];

function parseMarkdownToDocx(mdContent) {
  const lines = mdContent.split('\n');
  const children = [];
  let inTable = false;
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    try {
      const colCount = tableRows[0].length;
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows.map((row, rowIdx) =>
          new TableRow({
            children: row.map(cell =>
              new TableCell({
                width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
                children: [new Paragraph({
                  children: [new TextRun({
                    text: cell.trim(),
                    bold: rowIdx === 0,
                    size: 20,
                    font: 'Calibri',
                  })],
                  spacing: { before: 40, after: 40 },
                })],
              })
            ),
          })
        ),
      });
      children.push(table);
      children.push(new Paragraph({ children: [] }));
    } catch (e) {
      // If table creation fails, add as text
      tableRows.forEach(row => {
        children.push(new Paragraph({
          children: [new TextRun({ text: row.join(' | '), size: 20, font: 'Calibri' })],
        }));
      });
    }
    tableRows = [];
    inTable = false;
  }

  function flushCode() {
    if (codeLines.length === 0) return;
    codeLines.forEach(line => {
      children.push(new Paragraph({
        children: [new TextRun({
          text: line,
          font: 'Consolas',
          size: 18,
        })],
        spacing: { before: 20, after: 20 },
      }));
    });
    children.push(new Paragraph({ children: [] }));
    codeLines = [];
    inCodeBlock = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
      } else {
        if (inTable) flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Table separator rows (|---|---|)
    if (/^\|[\s\-:|]+\|$/.test(line.trim())) {
      continue;
    }

    // Table rows
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.trim().split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    }

    // If we were in a table and this line isn't a table row, flush
    if (inTable) {
      flushTable();
    }

    // Empty lines
    if (line.trim() === '') {
      children.push(new Paragraph({ children: [] }));
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^# /, '').replace(/\*\*/g, ''), bold: true, size: 36, font: 'Calibri', color: '1B4F72' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }));
      continue;
    }
    if (line.startsWith('## ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^## /, '').replace(/\*\*/g, ''), bold: true, size: 30, font: 'Calibri', color: '1B4F72' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }));
      continue;
    }
    if (line.startsWith('### ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^### /, '').replace(/\*\*/g, ''), bold: true, size: 26, font: 'Calibri', color: '2E86C1' })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
      continue;
    }
    if (line.startsWith('#### ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/^#### /, '').replace(/\*\*/g, ''), bold: true, size: 24, font: 'Calibri', color: '2E86C1' })],
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 150, after: 80 },
      }));
      continue;
    }

    // Horizontal rules
    if (/^---+$/.test(line.trim())) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '' })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
        spacing: { before: 100, after: 100 },
      }));
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const indent = line.search(/\S/);
      const text = line.trim().replace(/^[-*] /, '');
      const runs = parseInlineFormatting(text);
      children.push(new Paragraph({
        children: runs,
        bullet: { level: Math.min(Math.floor(indent / 2), 3) },
        spacing: { before: 40, after: 40 },
      }));
      continue;
    }

    // Numbered lists
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const text = numberedMatch[2];
      const runs = parseInlineFormatting(text);
      children.push(new Paragraph({
        children: [new TextRun({ text: `${numberedMatch[1]}. `, bold: true, size: 22, font: 'Calibri' }), ...runs],
        spacing: { before: 40, after: 40 },
        indent: { left: 360 },
      }));
      continue;
    }

    // Regular paragraph
    const runs = parseInlineFormatting(line);
    children.push(new Paragraph({
      children: runs,
      spacing: { before: 60, after: 60 },
    }));
  }

  if (inTable) flushTable();
  if (inCodeBlock) flushCode();

  return children;
}

function parseInlineFormatting(text) {
  const runs = [];
  // Simple regex to handle **bold** and *italic* text
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        size: 22,
        font: 'Calibri',
      }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true,
        size: 22,
        font: 'Calibri',
      }));
    } else {
      runs.push(new TextRun({
        text: part,
        size: 22,
        font: 'Calibri',
      }));
    }
  }
  return runs;
}

async function convertFile(inputFile, outputFile) {
  const dir = path.dirname(inputFile);
  const mdContent = fs.readFileSync(inputFile, 'utf-8');
  const docChildren = parseMarkdownToDocx(mdContent);

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: docChildren,
    }],
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFile, buffer);
  console.log(`Created: ${outputFile}`);
}

async function main() {
  const baseDir = 'c:/Users/Gkanja/Projects/Ayola Foods KE';
  for (const file of files) {
    await convertFile(
      path.join(baseDir, file.input),
      path.join(baseDir, file.output)
    );
  }
  console.log('All DOCX files created successfully!');
}

main().catch(console.error);
