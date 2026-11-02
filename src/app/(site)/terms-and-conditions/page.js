import LegalPage from '@/components/pages/LegalPage';

export const metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms of use for the RootEco demo corporate gifting storefront, covering site use, quotations, customization, delivery and liability.',
};

const sections = [
  {
    id: 'about-these-terms',
    heading: '1. About these terms',
    body: [
      'These Terms & Conditions govern your use of the RootEco corporate gifting storefront. By browsing, submitting a form or placing a demonstration order, you agree to them.',
      'If you are agreeing on behalf of a company, you confirm you have authority to bind that company to these terms.',
    ],
  },
  {
    id: 'demo-storefront',
    heading: '2. This is a demonstration storefront',
    body: [
      'RootEco here is a demo brand. Products, prices, lead times, testimonials, logos, office addresses, certifications and policies are illustrative only and are not offers capable of acceptance.',
      'The cart, checkout, quote form, newsletter form, hamper builder and order tracking are simulated in the browser. No payment is taken, no order is fulfilled, and no goods will be dispatched.',
    ],
  },
  {
    id: 'use-of-the-site',
    heading: '3. Acceptable use',
    list: [
      'Use the site only for lawful purposes and in line with these terms.',
      'Do not attempt to disrupt the site, probe its infrastructure, or bypass access controls.',
      'Do not scrape, republish or resell site content, product photography or brand assets without permission.',
      'Do not upload artwork or content you do not have the right to use.',
      'Do not misrepresent a demo enquiry or demonstration order as a real purchase order.',
    ],
  },
  {
    id: 'products-and-availability',
    heading: '4. Products and availability',
    body: [
      'Product pages describe indicative items, materials, dimensions and customization options. Colours on screen may differ from physical products, and natural materials such as bamboo, jute and wood vary in grain and tone.',
      'A live storefront would confirm stock and substitution options at quotation stage. Equivalent-value substitutions may be proposed when an item is unavailable, subject to your approval.',
    ],
  },
  {
    id: 'quotes-orders-and-payment',
    heading: '5. Quotations, orders and payment',
    body: [
      'Quotations are prepared for the quantities, customization and delivery destinations stated in your enquiry. Changes to scope may change pricing and lead time.',
      'For bulk programmes, the described process applies: purchase order, procurement, advance payment, proforma invoice, sample approval, production, quality check and final delivery.',
      'The demo checkout does not process payments. In a live engagement, advance payment terms and the balance due before dispatch would be recorded on the proforma invoice.',
    ],
  },
  {
    id: 'pricing-and-taxes',
    heading: '6. Pricing and taxes',
    body: [
      'Prices shown are in Indian rupees and, unless stated otherwise, exclude taxes, branding charges, packaging upgrades and freight. A consolidated quotation would itemise these components.',
      'Demo prices are placeholders for interface testing and do not reflect market rates.',
    ],
  },
  {
    id: 'customization-and-artwork',
    heading: '7. Customization and artwork',
    body: [
      'You are responsible for supplying correct, print-ready artwork and for holding the rights to any logo, typeface or image you provide. We would not knowingly reproduce third-party marks without authorization.',
      'Mock-ups are shared for approval before production. Once a mock-up, sample or personalization list is approved, it becomes the production standard. Minor variation in engraving depth, foil coverage and colour registration is normal.',
      'Spelling and personalization errors present in approved artwork or recipient lists are the client’s responsibility once approval is given.',
    ],
  },
  {
    id: 'delivery-and-title',
    heading: '8. Delivery',
    body: [
      'Lead times run from sample approval and receipt of the agreed advance, not from enquiry. Festival and peak-season timelines should be confirmed in writing.',
      'Risk passes on delivery to the address you nominate. Where multi-address distribution is used, you are responsible for the accuracy of the recipient list and addresses.',
    ],
  },
  {
    id: 'returns-and-cancellations',
    heading: '9. Returns and cancellations',
    body: [
      'Customized and personalized items are generally non-returnable once production has begun, except where an item arrives damaged or materially different from the approved sample.',
      'Cancellations and refund eligibility are described in the Return, Refund & Shipping Policy.',
    ],
  },
  {
    id: 'intellectual-property',
    heading: '10. Intellectual property',
    body: [
      'Site design, copy, product arrangement and the RootEco name and logo are the property of the brand owner. You may not copy or reuse them without written permission.',
      'Your artwork remains yours. You grant us a limited licence to reproduce it solely for producing the approved order.',
    ],
  },
  {
    id: 'limitation-of-liability',
    heading: '11. Limitation of liability',
    body: [
      'The demo is provided “as is”, without warranties of any kind. To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of this demonstration site.',
      'Nothing in these terms excludes liability that cannot lawfully be excluded.',
    ],
  },
  {
    id: 'governing-law',
    heading: '12. Governing law',
    body: [
      'These terms are intended to be governed by the laws of India, with courts in Haryana having jurisdiction. This clause is sample wording for a demo and should be reviewed by qualified counsel before any live launch.',
    ],
  },
  {
    id: 'contact',
    heading: '13. Contact',
    body: [
      'Questions about these terms can be sent to hello@rooteco.example.com. The address is fictional and used only for demonstration.',
    ],
  },
];

const related = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Return, Refund & Shipping Policy', href: '/shipping-and-refund-policy' },
];

export default function TermsRoute() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="The ground rules for using this demo storefront and requesting a gifting programme."
      updated="2 November 2026"
      intro="These terms set out how the RootEco demo storefront may be used and how a real corporate gifting engagement would be structured — from quotation and sample approval to production and delivery. Because this is a demonstration build, nothing here creates a binding commercial contract."
      sections={sections}
      related={related}
    />
  );
}
