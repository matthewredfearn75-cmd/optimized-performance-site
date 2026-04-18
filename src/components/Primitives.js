// OPP primitives: Logo, Vial, Icon. All use currentColor / CSS vars so they
// adapt to the laboratory theme.

export function Logo({ size = 28, full = false }) {
  if (!full) {
    return (
      <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <polygon points="0,-42 36.4,-21 36.4,21 0,42 -36.4,21 -36.4,-21" opacity="0.35" />
          <polygon points="0,-26 22.5,-13 22.5,13 0,26 -22.5,13 -22.5,-13" opacity="0.7" />
          <circle cx="0" cy="0" r="3" fill="currentColor" stroke="none" />
        </g>
      </svg>
    );
  }
  // Full lockup: hex mark + "OPP" + wordmark
  return (
    <svg viewBox="-70 -70 140 190" width={size * 0.93} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <polygon points="0,-42 36.4,-21 36.4,21 0,42 -36.4,21 -36.4,-21" opacity="0.35" />
        <polygon points="0,-26 22.5,-13 22.5,13 0,26 -22.5,13 -22.5,-13" opacity="0.7" />
        <circle cx="0" cy="0" r="3" fill="currentColor" stroke="none" />
      </g>
      <line x1="-45" y1="60" x2="45" y2="60" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <text x="0" y="84" textAnchor="middle" fontFamily="var(--font-display)"
            fontSize="22" fontWeight="600" letterSpacing="10" fill="currentColor">OPP</text>
      <text x="0" y="102" textAnchor="middle" fontFamily="var(--font-mono)"
            fontSize="5" letterSpacing="2" fill="currentColor" opacity="0.6">
        OPTIMIZED  PERFORMANCE  PEPTIDES
      </text>
      <line x1="-35" y1="108" x2="35" y2="108" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
    </svg>
  );
}

// Laboratory-style vial — technical exploded diagram
export function Vial({ label = '—', dosage = '', size = 220, purity, kit = false }) {
  if (kit) {
    // Multi-vial arrangement for kit products
    return (
      <svg viewBox="0 0 280 300" width={size} height={(size * 300) / 280} style={{ display: 'block' }}>
        <defs>
          <pattern id="vgridKit" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="var(--grid)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="vglassKit" x1="0" x2="1">
            <stop offset="0" stopColor="var(--surface)" stopOpacity="0.3" />
            <stop offset="0.5" stopColor="var(--surface)" stopOpacity="0.7" />
            <stop offset="1" stopColor="var(--surfaceAlt)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect width="280" height="300" fill="url(#vgridKit)" opacity="0.6" />
        <text x="20" y="28" fontSize="8" fill="var(--inkSoft)" fontFamily="var(--font-mono)" letterSpacing="1">KIT · 10 VIALS</text>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 28 + i * 48;
          return (
            <g key={`row1-${i}`}>
              <rect x={x + 10} y={60} width="20" height="10" fill="var(--ink)" />
              <rect x={x + 6} y={70} width="28" height="90" fill="url(#vglassKit)" stroke="var(--ink)" strokeWidth="0.8" />
              <rect x={x + 8} y={130} width="24" height="28" fill="var(--accent)" opacity="0.2" />
              <text x={x + 20} y={98} textAnchor="middle" fontSize="6" fill="var(--ink)" fontFamily="var(--font-mono)">{dosage}</text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 28 + i * 48;
          return (
            <g key={`row2-${i}`}>
              <rect x={x + 10} y={180} width="20" height="10" fill="var(--ink)" />
              <rect x={x + 6} y={190} width="28" height="90" fill="url(#vglassKit)" stroke="var(--ink)" strokeWidth="0.8" />
              <rect x={x + 8} y={250} width="24" height="28" fill="var(--accent)" opacity="0.2" />
              <text x={x + 20} y={218} textAnchor="middle" fontSize="6" fill="var(--ink)" fontFamily="var(--font-mono)">{dosage}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 300" width={size} height={(size * 300) / 200} style={{ display: 'block' }}>
      <defs>
        <pattern id="vgrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="var(--grid)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="vglass" x1="0" x2="1">
          <stop offset="0" stopColor="var(--surface)" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="var(--surface)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--surfaceAlt)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill="url(#vgrid)" opacity="0.6" />
      <line x1="20" y1="50" x2="68" y2="50" stroke="var(--ink)" strokeWidth="0.5" opacity="0.4" />
      <text x="18" y="48" textAnchor="end" fontSize="7" fill="var(--inkSoft)" fontFamily="var(--font-mono)">CAP</text>
      <line x1="20" y1="150" x2="58" y2="150" stroke="var(--ink)" strokeWidth="0.5" opacity="0.4" />
      <text x="18" y="148" textAnchor="end" fontSize="7" fill="var(--inkSoft)" fontFamily="var(--font-mono)">LYO</text>
      <line x1="182" y1="220" x2="140" y2="220" stroke="var(--ink)" strokeWidth="0.5" opacity="0.4" />
      <text x="184" y="218" fontSize="7" fill="var(--inkSoft)" fontFamily="var(--font-mono)">2ML</text>

      <g>
        <rect x="75" y="40" width="50" height="22" fill="var(--ink)" />
        <rect x="72" y="60" width="56" height="6" fill="var(--borderStrong)" opacity="0.2" />
        <rect x="68" y="64" width="64" height="175" fill="url(#vglass)" stroke="var(--ink)" strokeWidth="1" />
        <rect x="70" y="190" width="60" height="47" fill="var(--accent)" opacity="0.18" />
        <line x1="70" y1="190" x2="130" y2="190" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" />
        <rect x="74" y="95" width="52" height="68" fill="var(--surface)" stroke="var(--ink)" strokeWidth="0.5" />
        <text x="100" y="108" textAnchor="middle" fontSize="6" fill="var(--inkSoft)" fontFamily="var(--font-mono)" letterSpacing="1">OPTIMIZED / PERFORMANCE</text>
        <line x1="78" y1="114" x2="122" y2="114" stroke="var(--ink)" strokeWidth="0.3" opacity="0.3" />
        <text x="100" y="134" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-body)">{label}</text>
        <text x="100" y="148" textAnchor="middle" fontSize="8" fill="var(--accentStrong)" fontFamily="var(--font-mono)" fontWeight="600">{dosage}</text>
        <text x="100" y="158" textAnchor="middle" fontSize="5" fill="var(--inkMute)" fontFamily="var(--font-mono)">LYOPHILIZED · RUO</text>
        <rect x="68" y="239" width="64" height="4" fill="var(--ink)" opacity="0.6" />
      </g>
      {purity && (
        <g transform="translate(160 272)">
          <circle r="22" fill="none" stroke="var(--accent)" strokeWidth="0.8" />
          <text textAnchor="middle" y="-2" fontSize="6" fill="var(--inkSoft)" fontFamily="var(--font-mono)">PURITY</text>
          <text textAnchor="middle" y="8" fontSize="10" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-mono)">{purity}%</text>
        </g>
      )}
    </svg>
  );
}

const iconPaths = {
  shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>),
  truck: (<><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>),
  lock: (<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  flask: (<><path d="M9 3h6" /><path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" /></>),
  doc: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>),
  chevron: <path d="m9 18 6-6-6-6" />,
  chevDown: <path d="m6 9 6 6 6-6" />,
  chevLeft: <path d="m15 18-6-6 6-6" />,
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  minus: <path d="M5 12h14" />,
  x: (<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  cart: (<><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: (<><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>),
  download: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>),
  dot: <circle cx="12" cy="12" r="3" fill="currentColor" />,
  beaker: (<><path d="M4.5 3h15" /><path d="M6 3v7L3 20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2l-3-10V3" /><path d="M6 14h12" /></>),
  temp: <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />,
  info: (<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>),
  filter: <path d="M3 6h18M7 12h10M10 18h4" />,
  card: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  menu: (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>),
  trash: (<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>),
  edit: (<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>),
  refresh: (<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>),
};

export function Icon({ name, size = 18, stroke = 1.5, className = '' }) {
  const path = iconPaths[name] || null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}
