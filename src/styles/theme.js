// RootEco design tokens — palette extracted from the official logo.
const theme = {
  colors: {
    forest: '#0B3D2E',
    emerald: '#10513C',
    green: '#4C7A34',
    leaf: '#7CB342',
    cream: '#F6F1E7',
    creamDark: '#EDE5D3',
    white: '#FDFCF8',
    gold: '#C9A227',
    goldLight: '#E3C766',
    ink: '#15221B',
    muted: '#5C6B62',
    line: '#E3DCCB',
    sale: '#B3402A',
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
