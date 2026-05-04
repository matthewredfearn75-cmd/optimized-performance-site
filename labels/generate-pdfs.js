// Generate Avery WePrint-ready vector PDFs from the SVG color labels.
// Matches AveryWePrint1.500x0.750RectangleLabelsonRolls.ai template:
// 1.625" x 0.875" page = 1.5" x 0.75" trim + 0.0625" (1/16") bleed each side.
// Vector content, base-14 Helvetica (auto-embedded), no rasterization.

const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const path = require('path');

const labelsDir = __dirname;
const outDir = path.join(labelsDir, 'avery-pdfs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Dimensions in points (72pt = 1in)
const TRIM_W = 1.5 * 72;     // 108 pt
const TRIM_H = 0.75 * 72;    // 54 pt
const BLEED = 0.0625 * 72;   // 4.5 pt (1/16") — matches Avery template
const PAGE_W = TRIM_W + 2 * BLEED;  // 117 pt = 1.625"
const PAGE_H = TRIM_H + 2 * BLEED;  // 63 pt  = 0.875"

// Background colors for the bleed area (must match the SVG's outer fill).
const COLOR_NAVY = '#0D1B2A';
const COLOR_WHITE = '#FFFFFF';

const variants = [
  { suffix: 'color-label', bg: COLOR_NAVY },
];

const skus = [
  'glp-3-10mg', 'glp-3-20mg',
  'bpc-157-5mg', 'bpc-157-10mg',
  'tb-500-5mg', 'tb-500-10mg',
  'combo-bpc-tb-ghk',
  'ipamorelin-5mg',
  'hgh-191aa-10iu',
  'mt2-5mg',
  'nad-500mg',
];

function buildPdf(svgPath, pdfPath, bgColor, sku, variant) {
  const svg = fs.readFileSync(svgPath, 'utf8');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PAGE_W, PAGE_H],
      margin: 0,
      info: {
        Title: `OPP ${sku} ${variant}`,
        Author: 'Optimized Performance Peptides',
        Producer: 'OPP Label Generator',
        Creator: 'pdfkit + svg-to-pdfkit',
      },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Fill the entire bleed area with the SVG's outer color so any over-cut
    // by the printer leaves a clean color edge, not white paper.
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(bgColor);

    // Place SVG inset by the bleed amount on each side. The SVG's own outer
    // rounded rect now sits at the trim line; rounded corners cut cleanly.
    SVGtoPDF(doc, svg, BLEED, BLEED, {
      width: TRIM_W,
      height: TRIM_H,
      preserveAspectRatio: 'xMidYMid meet',
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function generate() {
  let count = 0;
  for (const sku of skus) {
    for (const v of variants) {
      const svgPath = path.join(labelsDir, `${sku}-${v.suffix}.svg`);
      if (!fs.existsSync(svgPath)) {
        console.warn(`  skip ${sku}-${v.suffix} (no SVG)`);
        continue;
      }
      const pdfPath = path.join(outDir, `${sku}-${v.suffix}.pdf`);
      await buildPdf(svgPath, pdfPath, v.bg, sku, v.suffix);
      console.log(`  ${path.basename(pdfPath)}`);
      count++;
    }
  }
  console.log(`\nDone — ${count} PDFs written to ${outDir}`);
  console.log(`Page size: 1.625" x 0.875" (1.5" x 0.75" trim + 0.0625" bleed)`);
}

generate().catch(err => { console.error(err); process.exit(1); });
