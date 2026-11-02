import LegalPage from '@/components/pages/LegalPage';

export const metadata = {
  title: 'Return, Refund & Shipping Policy',
  description:
    'Demo shipping coverage, lead times, multi-address delivery, damage reporting, returns, refunds and cancellations for RootEco corporate gifting.',
};

const sections = [
  {
    id: 'coverage',
    heading: '1. Delivery coverage',
    body: [
      'Orders are designed for pan-India delivery, including single-address drops to an office and multi-address distribution to individual employees or clients. Serviceability depends on the courier network for each pincode.',
      'Remote or restricted locations may require an alternate address, a longer transit window, or a local handover arrangement. These cases would be flagged during quotation.',
    ],
  },
  {
    id: 'lead-times',
    heading: '2. Lead times',
    list: [
      'Standard, non-customized items: approximately 5–10 working days after order confirmation.',
      'Branded or engraved items: approximately 8–15 working days after sample approval.',
      'Custom packaging, printed sleeves and hamper assembly: approximately 12–20 working days after artwork approval.',
      'Festival and peak-season programmes: place orders 3–4 weeks in advance; exact cut-offs are confirmed in writing.',
      'Multi-address distribution adds transit time per destination; metro cities are typically faster than tier-3 locations.',
    ],
  },
  {
    id: 'shipping-charges',
    heading: '3. Shipping charges',
    body: [
      'In this demo cart, shipping is free for merchandise totals of ₹2,000 and above; below that a flat ₹150 is shown. These figures exist to demonstrate the interface and are not commercial rates.',
      'For bulk programmes, freight is quoted based on volumetric weight, destination count, packaging type and delivery mode, and would be itemised on the proforma invoice.',
    ],
  },
  {
    id: 'multi-address',
    heading: '4. Multi-address distribution',
    body: [
      'Share recipient details in the agreed template — name, address, pincode, phone and any gift note. Address data is used only for fulfilment.',
      'Individual packing and labelling is available so each recipient receives a sealed, branded hamper with the correct note or card. Address corrections after dispatch may incur re-shipping charges.',
    ],
  },
  {
    id: 'tracking',
    heading: '5. Tracking',
    body: [
      'Once dispatched, consignment and tracking references would be shared by email, with a consolidated status sheet for multi-address programmes.',
      'The Track Order page in this demo simulates a six-stage journey using the most recent demonstration order stored in your browser. It is not connected to a courier network.',
    ],
  },
  {
    id: 'damaged-or-missing',
    heading: '6. Damaged, short or missing items',
    body: [
      'Report transit damage, shortages or incorrect items within 48 hours of delivery, with photographs of the outer carton, inner packaging and affected product.',
      'Where a claim is validated, the remedy is replacement of the affected units, a credit note, or a refund of those units — at our discretion and subject to stock. Replacements are dispatched on the original delivery timeline.',
      'Products with natural variation in grain, tone or weave are not considered defective. Custom engraving or printing that matches the approved mock-up is also not treated as a defect.',
    ],
  },
  {
    id: 'returns',
    heading: '7. Returns',
    body: [
      'Unused, non-personalized stock items in original packaging may be accepted for return within 7 days of delivery, subject to written approval and a restocking deduction for freight and handling.',
      'Personalized, engraved, printed, perishable and custom-packaged items cannot be returned unless they are damaged or materially different from the approved sample.',
    ],
  },
  {
    id: 'refunds',
    heading: '8. Refunds',
    body: [
      'Approved refunds are processed to the original payment method within 7–10 working days of approval. Bank details or payment references may be requested to complete the transfer.',
      'Freight, branding charges and customization costs already incurred are generally non-refundable. Where a full order is cancelled before procurement, the advance is refunded after deducting any verified third-party costs.',
    ],
  },
  {
    id: 'cancellations',
    heading: '9. Cancellations',
    body: [
      'Cancellation requests must be made in writing. Orders cancelled before procurement begins can usually be closed with a full refund of the advance.',
      'Once procurement, printing or production has started, cancellation is subject to the costs already committed. Customized orders cannot be cancelled after sample approval.',
    ],
  },
  {
    id: 'demo-limitation',
    heading: '10. Demo limitation',
    body: [
      'No shipment will be created from a demonstration order and no refund can be processed, because no payment is collected. This policy illustrates the structure a live storefront would use and is not a commercial commitment.',
    ],
  },
  {
    id: 'contact',
    heading: '11. Contact',
    body: [
      'For delivery or return questions, email hello@rooteco.example.com with your order reference and photographs where relevant. The address is fictional and used only for demonstration.',
    ],
  },
];

const related = [
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

export default function ShippingRefundRoute() {
  return (
    <LegalPage
      title="Return, Refund & Shipping Policy"
      subtitle="How gifting programmes are packed, dispatched, tracked and made right."
      updated="2 November 2026"
      intro="Corporate gifting lives or dies on delivery day. This policy describes the coverage, lead times and remedies a RootEco programme is designed around — and clearly marks which parts are simulated in this demonstration storefront."
      sections={sections}
      related={related}
    />
  );
}
