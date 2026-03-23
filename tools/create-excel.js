const ExcelJS = require('exceljs');
const path = require('path');

async function createFinancialModel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ayola Foods KE';
  workbook.created = new Date();

  // Color constants
  const darkBlue = '1B4F72';
  const medBlue = '2E86C1';
  const lightBlue = 'AED6F1';
  const veryLightBlue = 'EBF5FB';
  const green = '27AE60';
  const red = 'E74C3C';
  const orange = 'F39C12';
  const white = 'FFFFFF';
  const darkGray = '2C3E50';

  // ── Helper functions ──

  function styleHeader(ws, row, cols) {
    for (let c = 1; c <= cols; c++) {
      const cell = ws.getRow(row).getCell(c);
      cell.font = { bold: true, color: { argb: white }, size: 11, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkBlue } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: darkBlue } },
        bottom: { style: 'thin', color: { argb: darkBlue } },
        left: { style: 'thin', color: { argb: darkBlue } },
        right: { style: 'thin', color: { argb: darkBlue } },
      };
    }
  }

  function styleDataRow(ws, row, cols, isAlt = false, isBold = false) {
    for (let c = 1; c <= cols; c++) {
      const cell = ws.getRow(row).getCell(c);
      cell.font = { bold: isBold, size: 10, name: 'Calibri', color: { argb: darkGray } };
      if (isAlt) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: veryLightBlue } };
      }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'D5D8DC' } },
        left: { style: 'thin', color: { argb: 'D5D8DC' } },
        right: { style: 'thin', color: { argb: 'D5D8DC' } },
      };
      cell.alignment = { vertical: 'middle' };
    }
  }

  function styleTotalRow(ws, row, cols) {
    for (let c = 1; c <= cols; c++) {
      const cell = ws.getRow(row).getCell(c);
      cell.font = { bold: true, size: 11, name: 'Calibri', color: { argb: darkBlue } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
      cell.border = {
        top: { style: 'double', color: { argb: darkBlue } },
        bottom: { style: 'double', color: { argb: darkBlue } },
      };
    }
  }

  function addTitle(ws, row, text, cols) {
    ws.mergeCells(row, 1, row, cols);
    const cell = ws.getRow(row).getCell(1);
    cell.value = text;
    cell.font = { bold: true, size: 14, color: { argb: darkBlue }, name: 'Calibri' };
    cell.alignment = { horizontal: 'center' };
  }

  function addSubtitle(ws, row, text, cols) {
    ws.mergeCells(row, 1, row, cols);
    const cell = ws.getRow(row).getCell(1);
    cell.value = text;
    cell.font = { bold: true, size: 12, color: { argb: medBlue }, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: veryLightBlue } };
  }

  function fmtKES(ws, row, startCol, endCol) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getRow(row).getCell(c);
      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0';
      }
    }
  }

  function fmtNeg(ws, row, startCol, endCol) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = ws.getRow(row).getCell(c);
      if (typeof cell.value === 'number' && cell.value < 0) {
        cell.font = { ...cell.font, color: { argb: red } };
      }
    }
  }

  // ==========================================
  // SHEET 1: EXECUTIVE SUMMARY
  // ==========================================
  const ws1 = workbook.addWorksheet('Executive Summary', { properties: { tabColor: { argb: darkBlue } } });
  ws1.columns = [
    { width: 30 }, { width: 22 }, { width: 22 }, { width: 22 }
  ];

  addTitle(ws1, 1, 'AYOLA FOODS KE — FINANCIAL MODEL', 4);
  addTitle(ws1, 2, 'Executive Summary', 4);

  addSubtitle(ws1, 4, 'KEY FINANCIAL METRICS', 4);
  ws1.getRow(5).values = ['Metric', 'Year 1 (Current)', 'Year 2', 'Year 3'];
  styleHeader(ws1, 5, 4);

  const summaryData = [
    ['Revenue (KES)', 4980000, 15000000, 38400000],
    ['Gross Margin', '58%', '64%', '66%'],
    ['EBITDA (KES)', 1054000, 2080000, 10344000],
    ['Net Profit (KES)', 738000, 1246000, 6820800],
    ['Net Margin', '15%', '8%', '18%'],
    ['Team Size', '3-5', '10-15', '20-30'],
    ['Sales Channels', 3, 6, '8+'],
    ['Packaged SKUs', 3, '8-10', '15+'],
  ];

  summaryData.forEach((row, idx) => {
    const r = 6 + idx;
    ws1.getRow(r).values = row;
    styleDataRow(ws1, r, 4, idx % 2 === 0, idx === 0 || idx === 2 || idx === 3);
    fmtKES(ws1, r, 2, 4);
  });

  // ==========================================
  // SHEET 2: PRODUCT PRICING & UNIT ECONOMICS
  // ==========================================
  const ws2 = workbook.addWorksheet('Product Pricing', { properties: { tabColor: { argb: green } } });
  ws2.columns = [{ width: 30 }, { width: 18 }, { width: 18 }, { width: 18 }];

  addTitle(ws2, 1, 'PRODUCT PRICING & UNIT ECONOMICS', 4);
  ws2.getRow(3).values = ['Product', 'Price (KES)', 'COGS (KES)', 'Gross Margin'];
  styleHeader(ws2, 3, 4);

  const products = [
    ['Pilau combo', 600, 240, '60%'],
    ['Rabbit wet fry combo', 800, 320, '60%'],
    ['Turkey eggs combo', 600, 215, '64%'],
    ['Breakfast options', 400, 140, '65%'],
    ['Plantain kvass', 200, 55, '73%'],
    ['Synbiotic porridge', 150, 40, '73%'],
    ['Goat milk tea', 150, 55, '63%'],
    ['Ugali blend (packaged)', 250, 90, '64%'],
    ['Uji blend (packaged)', 600, 200, '67%'],
  ];

  products.forEach((row, idx) => {
    const r = 4 + idx;
    ws2.getRow(r).values = row;
    styleDataRow(ws2, r, 4, idx % 2 === 0);
    fmtKES(ws2, r, 2, 3);
  });

  // Averages row
  const avgR = 4 + products.length;
  const avgPrice = Math.round(products.reduce((s, p) => s + p[1], 0) / products.length);
  const avgCOGS = Math.round(products.reduce((s, p) => s + p[2], 0) / products.length);
  const avgMargin = Math.round((1 - avgCOGS / avgPrice) * 100) + '%';
  ws2.getRow(avgR).values = ['AVERAGE', avgPrice, avgCOGS, avgMargin];
  styleTotalRow(ws2, avgR, 4);
  fmtKES(ws2, avgR, 2, 3);

  // ==========================================
  // SHEET 3: REVENUE PROJECTIONS
  // ==========================================
  const ws3 = workbook.addWorksheet('Revenue Projections', { properties: { tabColor: { argb: medBlue } } });
  ws3.columns = [{ width: 30 }, ...Array(12).fill({ width: 13 }), { width: 16 }];

  addTitle(ws3, 1, 'REVENUE PROJECTIONS', 14);

  // Year 1 monthly baseline
  addSubtitle(ws3, 3, 'YEAR 1 — Monthly Breakdown (Baseline ~KES 415K/month)', 14);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'TOTAL'];
  ws3.getRow(4).values = ['Channel', ...months];
  styleHeader(ws3, 4, 14);

  // Year 1: ~415K/month = 4,980,000 total, slight growth
  const y1Monthly = [380000, 385000, 390000, 400000, 410000, 415000, 420000, 425000, 430000, 435000, 440000, 450000];
  const y1Total = y1Monthly.reduce((a, b) => a + b, 0);
  ws3.getRow(5).values = ['Total Revenue (KES)', ...y1Monthly, y1Total];
  styleDataRow(ws3, 5, 14, false, true);
  fmtKES(ws3, 5, 2, 14);

  // Year 2 by channel
  const y2Start = 8;
  addSubtitle(ws3, y2Start, 'YEAR 2 — Revenue by Channel', 14);
  ws3.getRow(y2Start + 1).values = ['Channel', '', '', '', '', '', '', '', '', '', '', '', '', 'Annual Total (KES)'];
  styleHeader(ws3, y2Start + 1, 14);

  const y2Channels = [
    ['Restaurant (dine-in)', 3600000],
    ['WhatsApp delivery', 2400000],
    ['Glovo / Bolt Food', 3600000],
    ['Packaged (direct sales)', 1800000],
    ['Supermarket retail', 2400000],
    ['Website e-commerce', 1200000],
  ];

  y2Channels.forEach((row, idx) => {
    const r = y2Start + 2 + idx;
    ws3.getRow(r).getCell(1).value = row[0];
    ws3.getRow(r).getCell(14).value = row[1];
    styleDataRow(ws3, r, 14, idx % 2 === 0);
    ws3.getRow(r).getCell(14).numFmt = '#,##0';
  });

  const y2TotalR = y2Start + 2 + y2Channels.length;
  ws3.getRow(y2TotalR).getCell(1).value = 'YEAR 2 TOTAL';
  ws3.getRow(y2TotalR).getCell(14).value = 15000000;
  styleTotalRow(ws3, y2TotalR, 14);
  ws3.getRow(y2TotalR).getCell(14).numFmt = '#,##0';

  // Year 3 by channel
  const y3Start = y2TotalR + 2;
  addSubtitle(ws3, y3Start, 'YEAR 3 — Revenue by Channel', 14);
  ws3.getRow(y3Start + 1).values = ['Channel', '', '', '', '', '', '', '', '', '', '', '', '', 'Annual Total (KES)'];
  styleHeader(ws3, y3Start + 1, 14);

  const y3Channels = [
    ['Restaurant (dine-in)', 6000000],
    ['Delivery (all platforms)', 9600000],
    ['Packaged products (all)', 12000000],
    ['Beverages retail', 4800000],
    ['Corporate / catering', 2400000],
    ['E-commerce (website)', 3600000],
  ];

  y3Channels.forEach((row, idx) => {
    const r = y3Start + 2 + idx;
    ws3.getRow(r).getCell(1).value = row[0];
    ws3.getRow(r).getCell(14).value = row[1];
    styleDataRow(ws3, r, 14, idx % 2 === 0);
    ws3.getRow(r).getCell(14).numFmt = '#,##0';
  });

  const y3TotalR = y3Start + 2 + y3Channels.length;
  ws3.getRow(y3TotalR).getCell(1).value = 'YEAR 3 TOTAL';
  ws3.getRow(y3TotalR).getCell(14).value = 38400000;
  styleTotalRow(ws3, y3TotalR, 14);
  ws3.getRow(y3TotalR).getCell(14).numFmt = '#,##0';

  // ==========================================
  // SHEET 4: INCOME STATEMENT (3 YEARS)
  // ==========================================
  const ws4 = workbook.addWorksheet('Income Statement', { properties: { tabColor: { argb: green } } });
  ws4.columns = [{ width: 35 }, { width: 20 }, { width: 20 }, { width: 20 }];

  addTitle(ws4, 1, 'PROJECTED INCOME STATEMENT (3 YEARS)', 4);
  ws4.getRow(2).values = ['All amounts in KES', 'Year 1', 'Year 2', 'Year 3'];
  styleHeader(ws4, 2, 4);

  const plData = [
    { label: 'Revenue', values: [4980000, 15000000, 38400000], bold: true },
    { label: '', values: ['', '', ''] },
    { label: 'Cost of Goods Sold', values: [-2090000, -5400000, -13056000] },
    { label: 'GROSS PROFIT', values: [2890000, 9600000, 25344000], bold: true, total: true },
    { label: 'Gross Margin', values: ['58%', '64%', '66%'], italic: true },
    { label: '', values: ['', '', ''] },
    { label: 'OPERATING EXPENSES', values: ['', '', ''], bold: true },
    { label: '  Staff costs', values: [-600000, -2400000, -4800000] },
    { label: '  Rent & facilities', values: [-360000, -960000, -1800000] },
    { label: '  Marketing & advertising', values: [-300000, -1500000, -3000000] },
    { label: '  Delivery & logistics', values: [-240000, -1200000, -2400000] },
    { label: '  Platform commissions', values: [-120000, -600000, -1200000] },
    { label: '  Technology & software', values: [-96000, -360000, -720000] },
    { label: '  Insurance', values: [-60000, -240000, -480000] },
    { label: '  Other operating costs', values: [-60000, -260000, -600000] },
    { label: 'TOTAL OPERATING EXPENSES', values: [-1836000, -7520000, -15000000], bold: true, total: true },
    { label: '', values: ['', '', ''] },
    { label: 'EBITDA', values: [1054000, 2080000, 10344000], bold: true, total: true },
    { label: 'EBITDA Margin', values: ['21%', '14%', '27%'], italic: true },
    { label: '', values: ['', '', ''] },
    { label: 'Income Tax (30%)', values: [-316000, -534000, -2923200] },
    { label: '', values: ['', '', ''] },
    { label: 'NET PROFIT', values: [738000, 1246000, 6820800], bold: true, total: true },
    { label: 'Net Margin', values: ['15%', '8%', '18%'], italic: true },
  ];

  plData.forEach((row, idx) => {
    const r = 3 + idx;
    ws4.getRow(r).values = [row.label, ...row.values];
    if (row.total) {
      styleTotalRow(ws4, r, 4);
    } else {
      styleDataRow(ws4, r, 4, idx % 2 === 0, row.bold);
    }
    if (row.italic) {
      for (let c = 1; c <= 4; c++) {
        ws4.getRow(r).getCell(c).font = { ...ws4.getRow(r).getCell(c).font, italic: true };
      }
    }
    fmtKES(ws4, r, 2, 4);
    fmtNeg(ws4, r, 2, 4);
  });

  // ==========================================
  // SHEET 5: INVESTMENT USE OF FUNDS
  // ==========================================
  const ws5 = workbook.addWorksheet('Use of Funds', { properties: { tabColor: { argb: orange } } });
  ws5.columns = [{ width: 40 }, { width: 22 }, { width: 18 }];

  addTitle(ws5, 1, 'INVESTMENT — USE OF FUNDS (PHASE 1)', 3);
  ws5.getRow(2).getCell(1).value = '';

  ws5.getRow(3).values = ['Line Item', 'Amount (KES)', '% of Total'];
  styleHeader(ws5, 3, 3);

  const fundsData = [
    ['KEBS Certification & Regulatory', 350000, '6.4%'],
    ['Professional Packaging Design & Production', 450000, '8.2%'],
    ['Kitchen Equipment Upgrade', 750000, '13.6%'],
    ['Bottling & Beverage Equipment', 550000, '10.0%'],
    ['Marketing & Brand Launch', 750000, '13.6%'],
    ['Hiring & Salaries (6 months)', 750000, '13.6%'],
    ['Working Capital', 1100000, '20.0%'],
    ['Cold Chain & Storage', 350000, '6.4%'],
    ['Contingency (10%)', 450000, '8.2%'],
  ];

  fundsData.forEach((row, idx) => {
    const r = 4 + idx;
    ws5.getRow(r).values = row;
    styleDataRow(ws5, r, 3, idx % 2 === 0);
    ws5.getRow(r).getCell(2).numFmt = '#,##0';
  });

  const fundsTotalR = 4 + fundsData.length;
  ws5.getRow(fundsTotalR).values = ['TOTAL PHASE 1 INVESTMENT', 5500000, '100%'];
  for (let c = 1; c <= 3; c++) {
    const cell = ws5.getRow(fundsTotalR).getCell(c);
    cell.font = { bold: true, size: 12, color: { argb: white }, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkBlue } };
    cell.border = {
      top: { style: 'double', color: { argb: darkBlue } },
      bottom: { style: 'double', color: { argb: darkBlue } },
    };
  }
  ws5.getRow(fundsTotalR).getCell(2).numFmt = '#,##0';

  // ==========================================
  // SHEET 6: SCENARIO ANALYSIS
  // ==========================================
  const ws6 = workbook.addWorksheet('Scenario Analysis', { properties: { tabColor: { argb: red } } });
  ws6.columns = [{ width: 30 }, { width: 20 }, { width: 20 }];

  addTitle(ws6, 1, 'SCENARIO ANALYSIS', 3);

  // Bear Case
  addSubtitle(ws6, 3, 'BEAR CASE (Conservative)', 3);
  ws6.getRow(4).values = ['Metric', 'Year 2', 'Year 3'];
  styleHeader(ws6, 4, 3);

  const bearData = [
    ['Revenue (KES)', 10000000, 22000000],
    ['Gross Margin', '58%', '60%'],
    ['EBITDA (KES)', 800000, 4000000],
    ['Net Profit (KES)', 360000, 2400000],
    ['Net Margin', '4%', '11%'],
  ];

  bearData.forEach((row, idx) => {
    const r = 5 + idx;
    ws6.getRow(r).values = row;
    styleDataRow(ws6, r, 3, idx % 2 === 0);
    fmtKES(ws6, r, 2, 3);
  });

  // Base Case
  addSubtitle(ws6, 11, 'BASE CASE (Plan)', 3);
  ws6.getRow(12).values = ['Metric', 'Year 2', 'Year 3'];
  styleHeader(ws6, 12, 3);

  const baseData = [
    ['Revenue (KES)', 15000000, 38400000],
    ['Gross Margin', '64%', '66%'],
    ['EBITDA (KES)', 2080000, 10344000],
    ['Net Profit (KES)', 1246000, 6820800],
    ['Net Margin', '8%', '18%'],
  ];

  baseData.forEach((row, idx) => {
    const r = 13 + idx;
    ws6.getRow(r).values = row;
    styleDataRow(ws6, r, 3, idx % 2 === 0);
    fmtKES(ws6, r, 2, 3);
  });

  // Bull Case
  addSubtitle(ws6, 19, 'BULL CASE (Accelerated Growth)', 3);
  ws6.getRow(20).values = ['Metric', 'Year 2', 'Year 3'];
  styleHeader(ws6, 20, 3);

  const bullData = [
    ['Revenue (KES)', 22000000, 55000000],
    ['Gross Margin', '66%', '68%'],
    ['EBITDA (KES)', 4500000, 18000000],
    ['Net Profit (KES)', 2800000, 12000000],
    ['Net Margin', '13%', '22%'],
  ];

  bullData.forEach((row, idx) => {
    const r = 21 + idx;
    ws6.getRow(r).values = row;
    styleDataRow(ws6, r, 3, idx % 2 === 0);
    fmtKES(ws6, r, 2, 3);
  });

  // ==========================================
  // SHEET 7: KEY ASSUMPTIONS
  // ==========================================
  const ws7 = workbook.addWorksheet('Key Assumptions', { properties: { tabColor: { argb: '95A5A6' } } });
  ws7.columns = [{ width: 35 }, { width: 30 }, { width: 40 }];

  addTitle(ws7, 1, 'KEY ASSUMPTIONS', 3);
  ws7.getRow(2).values = ['Assumption', 'Value', 'Source / Basis'];
  styleHeader(ws7, 2, 3);

  const assumptions = [
    ['Currency', 'KES (Kenya Shillings)', 'Operating currency'],
    ['Average meal combo price', 'KES 400-800', 'Current menu pricing'],
    ['Average beverage price', 'KES 150-200', 'Current menu pricing'],
    ['Average packaged product price', 'KES 250-600', 'Current product range'],
    ['Blended gross margin Year 1', '58%', 'Weighted product mix analysis'],
    ['Blended gross margin Year 3', '66%', 'Scale economies + direct sourcing'],
    ['Monthly baseline revenue', '~KES 415,000', 'Current run rate (Year 1)'],
    ['Revenue growth Year 1 to Year 2', '3x (201% growth)', 'Channel expansion plan'],
    ['Revenue growth Year 2 to Year 3', '2.6x (156% growth)', 'Packaged products + corporate'],
    ['Staff cost Year 1', 'KES 600,000/year (3-5 people)', 'Current payroll'],
    ['Staff cost Year 3', 'KES 4,800,000/year (20-30 people)', 'Hiring plan'],
    ['Rent Year 1', 'KES 30,000/month', 'Current kitchen lease'],
    ['Marketing spend', '6-10% of revenue', 'Digital + sampling + delivery promos'],
    ['Platform commission (Glovo/Bolt)', '~15-20% of order value', 'Delivery platform terms'],
    ['Tax rate', '30% corporate income tax', 'KRA current rates'],
    ['KEBS certification timeline', '3-6 months', 'Regulatory process'],
    ['Supermarket entry', 'Year 2 (month 6+)', 'Post-KEBS certification'],
    ['Corporate catering channel', 'Year 3', 'Brand maturity required'],
    ['Working capital cycle', '30-45 days', 'Cash business + delivery platforms'],
    ['Packaged products launch', 'Year 1 (3 SKUs live)', 'Ugali, Uji, Porridge blends'],
    ['Inflation assumption', '6-8% annual', 'CBK target range'],
  ];

  assumptions.forEach((row, idx) => {
    const r = 3 + idx;
    ws7.getRow(r).values = row;
    styleDataRow(ws7, r, 3, idx % 2 === 0);
  });

  // ── Save ──
  const outputPath = path.join('C:/Users/Gkanja/Projects/Ayola Foods KE', 'Ayola_Foods_KE_Financial_Model.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`\nExcel financial model created successfully!`);
  console.log(`Location: ${outputPath}`);
  console.log(`\nSheets created:`);
  console.log(`  1. Executive Summary`);
  console.log(`  2. Product Pricing & Unit Economics`);
  console.log(`  3. Revenue Projections`);
  console.log(`  4. Income Statement (3 Years)`);
  console.log(`  5. Use of Funds (Phase 1)`);
  console.log(`  6. Scenario Analysis`);
  console.log(`  7. Key Assumptions`);
}

createFinancialModel().catch(console.error);
