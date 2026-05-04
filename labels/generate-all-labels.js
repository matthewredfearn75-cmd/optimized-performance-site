const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const labelsDir = path.join(__dirname);

const peptides = [
  { file: 'glp-3-10mg', name: 'GLP-3', desc: 'Triple Agonist Peptide', dosage: '10 mg', sku: 'OP-GLP3-10MG' },
  { file: 'glp-3-20mg', name: 'GLP-3', desc: 'Triple Agonist Peptide', dosage: '20 mg', sku: 'OP-GLP3-20MG' },
  { file: 'bpc-157-5mg', name: 'BPC-157', desc: 'Body Protection Compound', dosage: '5 mg', sku: 'OP-BPC-5MG' },
  { file: 'bpc-157-10mg', name: 'BPC-157', desc: 'Body Protection Compound', dosage: '10 mg', sku: 'OP-BPC-10MG' },
  { file: 'tb-500-5mg', name: 'TB-500', desc: 'Thymosin Beta-4 Fragment', dosage: '5 mg', sku: 'OP-TB500-5MG' },
  { file: 'tb-500-10mg', name: 'TB-500', desc: 'Thymosin Beta-4 Fragment', dosage: '10 mg', sku: 'OP-TB500-10MG' },
  { file: 'combo-bpc-tb-ghk', name: 'BPC+TB+GHK', desc: 'Triple Peptide Stack', dosage: '70 mg', sku: 'OP-COMBO-70MG' },
  { file: 'ipamorelin-5mg', name: 'Ipamorelin', desc: 'GH Secretagogue', dosage: '5 mg', sku: 'OP-IPA-5MG' },
  { file: 'hgh-191aa-10iu', name: 'HGH 191AA', desc: 'Somatropin 191AA', dosage: '10 IU', sku: 'OP-HGH-10IU' },
  { file: 'mt2-5mg', name: 'MT-2', desc: 'Melanotan II', dosage: '5 mg', sku: 'OP-MT2-5MG' },
  { file: 'nad-500mg', name: 'NAD+', desc: 'Nicotinamide Adenine Dinucleotide', dosage: '500 mg', sku: 'OP-NAD-500MG' },
];

const DEFAULT_VIAL = '3 mL vial';

function makeSvg({ name, desc, dosage, sku, vial = DEFAULT_VIAL }) {
  const fontSize = name.length > 10 ? 22 : name.length > 7 ? 26 : 28;
  const lyoX = dosage.length > 5 ? 185 : 170;
  const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeDesc = desc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1.5in" height="0.75in" viewBox="0 0 432 216">
  <rect x="2" y="2" width="428" height="212" rx="6" ry="6" fill="none" stroke="#0D1B2A" stroke-width="2"/>
  <line x1="100" y1="14" x2="100" y2="202" stroke="#0D1B2A" stroke-width="1" opacity="0.4"/>
  <g transform="translate(52, 70)">
    <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="none" stroke="#0D1B2A" stroke-width="1.5" opacity="0.3"/>
    <polygon points="0,-19.5 16.9,-9.75 16.9,9.75 0,19.5 -16.9,9.75 -16.9,-9.75" fill="none" stroke="#0D1B2A" stroke-width="1.5" opacity="0.6"/>
    <polygon points="0,-10.5 9.1,-5.25 9.1,5.25 0,10.5 -9.1,5.25 -9.1,-5.25" fill="none" stroke="#0D1B2A" stroke-width="1.5" opacity="0.85"/>
    <circle cx="0" cy="-30" r="2" fill="#0D1B2A"/>
    <circle cx="26" cy="-15" r="2" fill="#0D1B2A" opacity="0.85"/>
    <circle cx="26" cy="15" r="2" fill="#0D1B2A" opacity="0.85"/>
    <circle cx="0" cy="30" r="2" fill="#0D1B2A"/>
    <circle cx="-26" cy="15" r="2" fill="#0D1B2A" opacity="0.85"/>
    <circle cx="-26" cy="-15" r="2" fill="#0D1B2A" opacity="0.85"/>
    <circle cx="0" cy="0" r="3" fill="#0D1B2A"/>
    <circle cx="0" cy="0" r="1.5" fill="white"/>
    <polygon points="0,-26 6,-19 -6,-19" fill="none" stroke="#0D1B2A" stroke-width="1" opacity="0.7"/>
    <polygon points="0,26 6,19 -6,19" fill="none" stroke="#0D1B2A" stroke-width="1" opacity="0.7"/>
  </g>
  <text x="52" y="124" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="700" fill="#0D1B2A" letter-spacing="1.5">OPTIMIZED</text>
  <text x="52" y="136" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="6.5" font-weight="400" fill="#0D1B2A" letter-spacing="2" opacity="0.7">PERFORMANCE</text>
  <text x="52" y="147" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="6.5" font-weight="400" fill="#0D1B2A" letter-spacing="2" opacity="0.7">PEPTIDES</text>

  <text x="118" y="46" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="#0D1B2A" letter-spacing="1.5">${safeName}</text>
  <line x1="118" y1="54" x2="320" y2="54" stroke="#0D1B2A" stroke-width="0.75" opacity="0.35"/>
  <text x="118" y="72" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="400" fill="#0D1B2A" opacity="0.65" letter-spacing="0.5">${safeDesc}</text>
  <text x="118" y="92" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="700" fill="#0D1B2A" letter-spacing="0.5">${dosage}</text>
  <text x="${lyoX}" y="92" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="400" fill="#0D1B2A" opacity="0.6">Lyophilized Powder</text>
  <text x="118" y="109" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9" font-weight="600" fill="#0D1B2A" opacity="0.8" letter-spacing="0.3">Purity per COA</text>
  <text x="220" y="109" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="400" fill="#0D1B2A" opacity="0.6">Store at -20&#xB0;C</text>
  <line x1="118" y1="119" x2="420" y2="119" stroke="#0D1B2A" stroke-width="0.5" opacity="0.25"/>

  <!-- RUO header (red on white) -->
  <text x="118" y="134" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="700" fill="#C8102E" letter-spacing="0.8">FOR RESEARCH USE ONLY</text>
  <!-- RUO supporting -->
  <text x="118" y="147" font-family="'Helvetica Neue', Arial, sans-serif" font-size="6.5" font-weight="500" fill="#C8102E" opacity="0.85" letter-spacing="0.2">Not for human consumption. Not a drug, food, or cosmetic.</text>

  <!-- Lot / MFG / EXP -->
  <text x="118" y="170" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="400" fill="#0D1B2A" opacity="0.55">Lot: _______</text>
  <text x="215" y="170" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="400" fill="#0D1B2A" opacity="0.55">MFG: _______</text>
  <text x="315" y="170" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="400" fill="#0D1B2A" opacity="0.55">EXP: _______</text>

  <!-- Footer -->
  <text x="118" y="190" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" font-weight="500" fill="#0D1B2A" opacity="0.7" letter-spacing="0.3">optimizedperformancepeptides.com</text>
  <text x="420" y="190" text-anchor="end" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" font-weight="400" fill="#0D1B2A" opacity="0.5">${sku} | ${vial}</text>
</svg>`;
}

async function generate() {
  for (const p of peptides) {
    const svg = makeSvg(p);
    const svgPath = path.join(labelsDir, `${p.file}-vial-label.svg`);
    const jpgPath = path.join(labelsDir, `${p.file}-vial-label.jpg`);

    fs.writeFileSync(svgPath, svg);

    await sharp(Buffer.from(svg), { density: 300 })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 95 })
      .toFile(jpgPath);

    console.log(`Created: ${p.file}-vial-label .svg + .jpg`);
  }
  console.log(`\nDone — ${peptides.length} labels generated.`);
}

generate().catch(console.error);
