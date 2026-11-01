import LegalPage from '@/components/pages/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'How the RootEco demo storefront handles enquiry details, cart and wishlist data stored in your browser, and your privacy choices.',
};

const sections = [
  {
    id: 'scope',
    heading: '1. Scope of this policy',
    body: [
      'This Privacy Policy explains how the RootEco demo storefront ("we", "us") handles information when you browse the site, submit an enquiry, build a hamper, or place a demonstration order.',
      'It applies to this website only. It does not cover third-party websites that we link to, including social platforms or payment providers.',
    ],
  },
  {
    id: 'information-we-collect',
    heading: '2. Information we collect',
    body: [
      'We keep data collection deliberately minimal. This demo frontend has no backend, database or analytics service connected.',
    ],
    list: [
      'Enquiry details you type into the quote, contact or newsletter forms — such as name, company, email, phone number, delivery city and gifting requirements.',
      'Demo order details you enter at checkout — such as shipping and billing address, contact details, payment method preference and gift notes.',
      'Cart, wishlist and last-demo-order data saved in your browser’s localStorage or sessionStorage so the interface behaves like a real store.',
      'Basic technical information your browser sends to any website, such as the page you requested and your approximate region.',
    ],
  },
  {
    id: 'how-we-use-information',
    heading: '3. How we use information',
    list: [
      'To show your cart, wishlist and hamper selections consistently while you browse.',
      'To generate a demo order reference and display the order confirmation and tracking screens.',
      'To return a sample quotation response after you submit the quote form (in a production build, this would be handled by a server endpoint).',
      'To respond to enquiries about products, customization and delivery timelines.',
      'To maintain the security and reliability of the site.',
    ],
  },
  {
    id: 'cookies-and-local-storage',
    heading: '4. Cookies and local storage',
    body: [
      'The demo uses browser storage instead of tracking cookies. Cart contents are stored under a RootEco cart key, wishlist items under a wishlist key, and your most recent demo order is kept in session storage for the confirmation and tracking pages.',
      'This data stays in your browser and is not transmitted to a server. Clearing your browser storage, or using the “Clear cart” button, removes it.',
      'If analytics or marketing tags are added in a production deployment, they should be disclosed here and gated behind consent where required.',
    ],
  },
  {
    id: 'sharing',
    heading: '5. Sharing and disclosure',
    body: [
      'Because this is a frontend-only demonstration, we do not sell, rent or share your information with third parties. In a live storefront, limited sharing would be necessary with service providers such as logistics partners, print and branding vendors, email providers and payment processors.',
      'Where a production launch is planned, those processors should be listed here with their purposes and any cross-border transfer safeguards.',
    ],
  },
  {
    id: 'retention',
    heading: '6. Retention',
    body: [
      'Form submissions in this demo are not persisted beyond the current tab unless you leave them in the page. Demo order details remain in session storage until the tab is closed.',
      'A production storefront should define retention periods for enquiries, quotations and invoices — for example, retaining commercial records for the period required by tax and accounting rules.',
    ],
  },
  {
    id: 'your-choices',
    heading: '7. Your choices and rights',
    list: [
      'You can clear cart, wishlist and order data at any time using the controls in the storefront or your browser settings.',
      'You can decline to provide optional form fields; only fields marked as required are needed to submit.',
      'You can request access to, correction of, or deletion of any enquiry details you have sent by emailing the address in the sidebar.',
      'You can unsubscribe from newsletter messages using the link in any email, once a real mailing service is connected.',
    ],
  },
  {
    id: 'security',
    heading: '8. Security',
    body: [
      'The site is served over HTTPS and does not ask for complete payment card numbers, CVV codes, UPI PINs or bank credentials. Demo payment forms collect only a method preference.',
      'No method of transmission or storage is completely secure. Do not enter confidential business information, artwork containing third-party secrets, or sensitive personal data into a demo form.',
    ],
  },
  {
    id: 'children',
    heading: '9. Children’s privacy',
    body: [
      'This storefront is intended for business buyers and is not directed to children. We do not knowingly collect information from children. If you believe a child has submitted information, contact us and it will be removed.',
    ],
  },
  {
    id: 'changes',
    heading: '10. Changes to this policy',
    body: [
      'We may update this policy as the storefront evolves. The “last updated” date at the top reflects the latest revision. Continued use of the site after a change indicates acceptance of the revised policy.',
    ],
  },
  {
    id: 'contact',
    heading: '11. Contact',
    body: [
      'For privacy questions, correction requests or deletion of enquiry details, email hello@rooteco.example.com. This is a demo address — it is not monitored and does not belong to a real company.',
    ],
  },
];

const related = [
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Return, Refund & Shipping Policy', href: '/shipping-and-refund-policy' },
];

export default function PrivacyPolicyRoute() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="What the demo collects, where it lives, and how you stay in control."
      updated="2 November 2026"
      intro="RootEco handles gifting programmes for teams, so privacy matters — recipient lists, corporate addresses and personal messages. This page explains exactly what this demonstration site stores, which is mostly in your own browser, and what a live deployment should cover."
      sections={sections}
      related={related}
    />
  );
}
