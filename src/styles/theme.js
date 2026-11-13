// RootEco design tokens — palette extracted from the official logo.
// Colors resolve from CSS variables so the storefront keeps its light brand
// palette while the owner dashboard can run a dark, premium workspace.
const theme = {
  colors: {
    forest: 'var(--re-forest)',
    emerald: 'var(--re-emerald)',
    green: 'var(--re-green)',
    leaf: 'var(--re-leaf)',
    cream: 'var(--re-cream)',
    creamDark: 'var(--re-cream-dark)',
    track: 'var(--re-track)',
    white: 'var(--re-white)',
    gold: 'var(--re-gold)',
    goldLight: 'var(--re-gold-light)',
    ink: 'var(--re-ink)',
    muted: 'var(--re-muted)',
    line: 'var(--re-line)',
    sale: 'var(--re-sale)',
    accent: 'var(--re-accent)',
    accentInk: 'var(--re-accent-ink)',
    sidebar: 'var(--re-sidebar)',
  },
  fonts: {
    display: 'var(--font-display), Georgia, serif',
    body: 'var(--font-body), system-ui, sans-serif',
  },
  radius: { sm: '8px', md: '14px', lg: '22px', pill: '999px' },
  shadow: {
    soft: '0 6px 24px rgba(11, 61, 46, 0.08)',
    card: '0 10px 34px rgba(11, 61, 46, 0.12)',
    lift: '0 18px 48px rgba(11, 61, 46, 0.18)',
  },
  container: '1240px',
  breakpoints: { md: '900px', lg: '1100px' },
};

export default theme;
