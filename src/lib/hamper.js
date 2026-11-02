export const HAMPER_BOXES = [
  {
    id: 'kraft',
    name: 'Kraft Keepsake Box',
    desc: 'Recycled kraft board, jute ribbon, stamped logo.',
    price: 199,
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'signature',
    name: 'Signature Green Box',
    desc: 'Rigid box, magnetic close, gold foil branding.',
    price: 399,
    capacity: 6,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'luxe',
    name: 'Luxe Wooden Crate',
    desc: 'Reusable wooden crate with a printed lid.',
    price: 699,
    capacity: 8,
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=900&q=80&auto=format&fit=crop',
  },
];

export const HAMPER_BRANDING = [
  { id: 'none', name: 'No branding', desc: 'Plain packaging, gift-ready.', price: 0 },
  {
    id: 'sleeve',
    name: 'Logo on box sleeve',
    desc: 'One-colour logo printed on the sleeve.',
    price: 149,
  },
  {
    id: 'full',
    name: 'Full custom packaging',
    desc: 'Custom colours, sleeve, ribbon and card.',
    price: 399,
  },
];

export const HAMPER_ITEM_SLUGS = [
  'sustain-steel-bottle',
  'scribe-premium-notebook',
  'ceramic-mug-set',
  'bloom-desk-plant',
  'nectar-honey-jar',
  'aroma-candle-duo',
  'legacy-pen-set',
  'journey-tote-bag',
  'bamboo-cutlery-set',
  'volt-powerbank-10k',
  'comfort-cotton-tee',
  'terrazzo-thermal-flask',
];

export function findHamperBox(id) {
  return HAMPER_BOXES.find((box) => box.id === id) || null;
}

export function findHamperBranding(id) {
  return HAMPER_BRANDING.find((branding) => branding.id === id) || null;
}
