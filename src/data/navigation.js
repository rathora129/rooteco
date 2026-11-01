// Demo "trusted by" logos — fictional placeholders, not real partnerships.
export const trustedBy = [
  { name: 'Northwind', initials: 'NW' },
  { name: 'HexaPay', initials: 'HX' },
  { name: 'Brightloop', initials: 'BL' },
  { name: 'Cobalt', initials: 'CB' },
  { name: 'Meridian', initials: 'MD' },
  { name: 'Greenfield', initials: 'GF' },
  { name: 'Sunrise', initials: 'SR' },
  { name: 'Atlas', initials: 'AT' },
  { name: 'Quartzly', initials: 'QZ' },
  { name: 'Vantage', initials: 'VT' },
];

export const brand = {
  name: 'RootEco',
  tagline: 'Thoughtful gifting for teams that care about people.',
  email: 'hello@rooteco.example.com',
  phone: '+91 90000 00000',
  hours: 'Mon–Sat, 10:00–19:00 IST',
  address: 'Demo Office — Gurugram, Haryana, India',
};

// WhatsApp click-to-chat configuration.
// ACTION REQUIRED: no official RootEco WhatsApp number is available yet.
// Replace the placeholder below with the real business number in international
// format, digits only (country code + number, no '+', spaces or dashes),
// e.g. '919876543210'. The placeholder reuses the demo phone number shown
// elsewhere on this demo storefront — it is not a live WhatsApp line.
export const WHATSAPP_NUMBER = '919000000000';
export const WHATSAPP_MESSAGE =
  'Hi RootEco, I am interested in your corporate gifting products. Please share more details.';

export const mainNav = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/categories', mega: true },
  { label: 'Corporate Gifts', href: '/categories/welcome-kits' },
  { label: 'Festival Gifts', href: '/categories/festival-hampers' },
  { label: 'New Arrivals', href: '/products?sort=newest' },
  { label: 'Best Sellers', href: '/products?sort=best-selling' },
];

export const processSteps = [
  {
    title: 'Purchase Order (PO) Received',
    description:
      'The client shares the official Purchase Order confirming order details, quantities, specifications, pricing and delivery timelines.',
  },
  {
    title: 'Procurement Initiation',
    description:
      'Our procurement team initiates sourcing and coordinates with vendors to arrange products and materials as per approved specifications.',
  },
  {
    title: 'Advance Payment from Client',
    description:
      'The client makes the agreed advance payment of 50% or 100%, as per mutually agreed payment terms.',
  },
  {
    title: 'Proforma Invoice (PI) Issuance',
    description:
      'The Proforma Invoice is shared with the client, detailing order value, payment terms and other commercial details.',
  },
  {
    title: 'Sample / Product Approval',
    description:
      'Final product samples, mock-ups, branding, packaging and customization details are shared with the client for approval.',
  },
  {
    title: 'Final Production',
    description:
      'Production begins only after the client approves the final product, including all requested changes and customizations.',
  },
  {
    title: 'Quality Check & Final Inspection',
    description:
      'Finished products undergo quality inspection to ensure approved specifications, branding, quantity and packaging are met.',
  },
  {
    title: 'Final Delivery',
    description:
      'The order is packed and dispatched to the client as per the agreed delivery schedule and shipping instructions.',
  },
];

export const features = [
  {
    icon: 'BadgeCheck',
    title: 'Custom Branding',
    description: 'Engraving, embroidery, UV print and foil — your logo, beautifully applied.',
  },
  {
    icon: 'Boxes',
    title: 'Bulk Ordering',
    description: 'From 10 to 10,000 units with transparent timelines and dedicated handling.',
  },
  {
    icon: 'Heart',
    title: 'Personalized Gifting',
    description: 'Name engravings, custom cards and individual messages at scale.',
  },
  {
    icon: 'Gift',
    title: 'Gift Box Customization',
    description: 'Rigid boxes, sleeves, ribbons and inserts designed around your brand.',
  },
  {
    icon: 'Truck',
    title: 'Pan India Delivery',
    description: 'Single or multi-address doorstep delivery across every serviceable pincode.',
  },
  {
    icon: 'Headset',
    title: 'Dedicated Support',
    description: 'One point of contact from quotation to delivery, with proactive updates.',
  },
];

// Demo office data — fictional addresses until real locations are provided.
export const offices = [
  { city: 'Gurugram', label: 'Head Office (Demo)', detail: 'Demo address — Sector 62, Gurugram, Haryana' },
  { city: 'Bengaluru', label: 'South Office (Demo)', detail: 'Demo address — Indiranagar, Bengaluru, Karnataka' },
  { city: 'Mumbai', label: 'West Office (Demo)', detail: 'Demo address — Powai, Mumbai, Maharashtra' },
];

export default mainNav;
