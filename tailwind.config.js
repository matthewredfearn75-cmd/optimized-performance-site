/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // OPP laboratory palette (served through CSS vars in globals.css)
        paper: 'var(--bg)',
        surface: 'var(--surface)',
        surfaceAlt: 'var(--surfaceAlt)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--inkSoft)',
          mute: 'var(--inkMute)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accentStrong)',
          soft: 'var(--accentSoft)',
          glow: 'var(--accentGlow)',
        },
        line: 'var(--border)',
        grid: 'var(--grid)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',

        // Legacy `brand-*` aliases mapped to the new tokens so any stray
        // references in shared components still render during migration.
        brand: {
          dark: 'var(--bg)',
          navy: 'var(--surfaceAlt)',
          surface: 'var(--surface)',
          cyan: 'var(--accentStrong)',
          'cyan-light': 'var(--accent)',
          'cyan-deep': 'var(--accentStrong)',
          platinum: 'var(--inkSoft)',
          cream: 'var(--ink)',
          muted: 'var(--inkMute)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        heading: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        premium: '0.08em',
        display: 'var(--display-tracking)',
      },
      maxWidth: {
        container: '1440px',
        narrow: '860px',
      },
      borderRadius: {
        opp: 'var(--radius)',
        'opp-lg': 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};
