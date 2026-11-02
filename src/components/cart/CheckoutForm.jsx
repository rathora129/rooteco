'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { trackEvent } from '@/lib/tracking';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Button, ButtonLink, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 396px;
  gap: 48px;
  align-items: start;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: ${theme.colors.forest};
  margin-bottom: 22px;
  &:hover {
    text-decoration: underline;
  }
`;

const Steps = styled.form`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Block = styled.section`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 26px;
  @media (max-width: 560px) {
    padding: 20px;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    color: ${theme.colors.forest};
    margin-bottom: 6px;
    .n {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: ${theme.colors.forest};
      color: ${theme.colors.goldLight};
      font-family: ${theme.fonts.body};
      font-size: 12.5px;
      font-weight: 700;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
  }
  > p.lead {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    margin-bottom: 20px;
  }
`;

const Fields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const Full = styled.div`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: ${theme.colors.ink};
  span.req {
    color: ${theme.colors.sale};
    margin-left: 2px;
  }
  input,
  select,
  textarea {
    display: block;
    margin-top: 6px;
    width: 100%;
    padding: 11px 14px;
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.colors.line};
    background: ${theme.colors.white};
    font-size: 14px;
    font-weight: 400;
    color: ${theme.colors.ink};
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    &::placeholder {
      color: #9aa59d;
    }
    &:focus {
      border-color: ${theme.colors.green};
      box-shadow: 0 0 0 3px rgba(76, 122, 52, 0.12);
    }
  }
  textarea {
    resize: vertical;
    min-height: 78px;
  }
`;

const Payments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`;

const PayOption = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: ${theme.radius.md};
  border: 1.5px solid ${(p) => (p.$active ? theme.colors.forest : theme.colors.line)};
  background: ${(p) => (p.$active ? theme.colors.cream : '#fff')};
  cursor: pointer;
  transition: all 0.2s ease;
  input {
    accent-color: ${theme.colors.forest};
    width: 16px;
    height: 16px;
  }
  svg {
    color: ${theme.colors.forest};
    flex-shrink: 0;
  }
  .txt {
    display: flex;
    flex-direction: column;
    strong {
      font-size: 14px;
      font-weight: 600;
      color: ${theme.colors.ink};
    }
    span {
      font-size: 12px;
      color: ${theme.colors.muted};
    }
  }
  .demo {
    margin-left: auto;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${theme.colors.gold};
  }
`;

const DemoNote = styled.div`
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: ${theme.radius.sm};
  background: rgba(201, 162, 39, 0.12);
  font-size: 12.5px;
  line-height: 1.55;
  color: ${theme.colors.ink};
  svg {
    color: ${theme.colors.gold};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const Summary = styled.aside`
  position: sticky;
  top: 96px;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 26px;
  @media (max-width: 980px) {
    position: static;
  }
  h2 {
    font-size: 22px;
    color: ${theme.colors.forest};
    margin-bottom: 16px;
  }
  .items {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;
    margin-bottom: 18px;
  }
  .item {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .thumb {
    position: relative;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    background: ${theme.colors.cream};
    flex-shrink: 0;
    img {
      object-fit: cover;
    }
  }
  .info {
    min-width: 0;
    flex: 1;
    strong {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: ${theme.colors.ink};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    span {
      font-size: 12px;
      color: ${theme.colors.muted};
    }
  }
  .price {
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.ink};
    white-space: nowrap;
  }
  .line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 14px;
    color: ${theme.colors.muted};
    padding: 6px 0;
    strong {
      color: ${theme.colors.ink};
      font-weight: 600;
    }
  }
  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-top: 1px solid ${theme.colors.line};
    margin-top: 10px;
    padding-top: 14px;
    font-size: 16px;
    font-weight: 600;
    color: ${theme.colors.ink};
    strong {
      font-size: 24px;
      color: ${theme.colors.forest};
    }
  }
  .tax {
    font-size: 12px;
    color: ${theme.colors.muted};
    margin: 4px 0 18px;
  }
  .place {
    width: 100%;
    height: 50px;
  }
  .secure {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    color: ${theme.colors.muted};
    margin-top: 12px;
  }
  .terms {
    font-size: 11.5px;
    color: ${theme.colors.muted};
    margin-top: 14px;
    line-height: 1.6;
    a {
      color: ${theme.colors.forest};
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
  .perk {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12.5px;
    color: ${theme.colors.muted};
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid ${theme.colors.line};
    svg {
      color: ${theme.colors.green};
    }
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 70px 24px;
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  background: #fff;
  svg {
    color: ${theme.colors.green};
    margin-bottom: 12px;
  }
  h2 {
    font-size: 28px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    color: ${theme.colors.muted};
    max-width: 420px;
    margin: 0 auto 22px;
  }
`;

const PAYMENTS = [
  {
    id: 'bank-transfer',
    label: 'Bank transfer / proforma invoice',
    hint: 'We email a GST invoice; pay via NEFT or RTGS',
    icon: Landmark,
    tag: 'Recommended',
  },
  {
    id: 'cod',
    label: 'Cash on delivery',
    hint: 'Pay by cash or UPI when your gifts arrive',
    icon: Banknote,
    tag: 'Eligible pin codes',
  },
];

const ONLINE_PAYMENT = {
  id: 'online',
  label: 'Pay online',
  hint: 'Secure card, UPI or netbanking via Razorpay',
  icon: CreditCard,
  tag: 'Instant confirmation',
};

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the payment provider.'));
    document.body.appendChild(script);
  });
}

async function payOnline({ created, customerName, data }) {
  const createResponse = await fetch('/api/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: created.id }),
  });
  const createPayload = await createResponse.json().catch(() => null);
  if (!createResponse.ok || !createPayload?.success) {
    throw new Error(createPayload?.error?.message || 'Could not start the online payment.');
  }
  const payment = createPayload.data;

  await loadRazorpayScript();

  await new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'RootEco',
      description: `Order ${payment.orderNumber}`,
      order_id: payment.providerOrderId,
      prefill: {
        name: customerName,
        email: data.email,
        contact: data.phone,
      },
      notes: { orderId: created.id, orderNumber: payment.orderNumber },
      theme: { color: '#0b3d2e' },
      handler: async (response) => {
        try {
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: created.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyPayload = await verifyResponse.json().catch(() => null);
          if (!verifyResponse.ok || !verifyPayload?.success) {
            throw new Error(
              verifyPayload?.error?.message ||
                'Payment verification is pending. We will confirm it on the order.'
            );
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('The payment window was closed before payment was completed.')),
      },
    });
    checkout.on('payment.failed', (event) => {
      reject(new Error(event?.error?.description || 'The payment could not be completed.'));
    });
    checkout.open();
  });
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, cartSubtotal, cartCount, clearCart, setCartOpen, hydrated } = useStore();
  const [payment, setPayment] = useState('bank-transfer');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [onlinePayment, setOnlinePayment] = useState({ enabled: false, keyId: null });
  const trackedCheckout = useRef(false);

  useEffect(() => {
    let active = true;
    fetch('/api/payments/config')
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.success) return;
        setOnlinePayment({
          enabled: Boolean(payload.data?.onlineEnabled && payload.data?.keyId),
          keyId: payload.data?.keyId || null,
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCartOpen(false);
  }, [setCartOpen]);

  useEffect(() => {
    if (!hydrated || trackedCheckout.current || cart.length === 0) return;
    trackedCheckout.current = true;
    trackEvent('checkout_started', {
      path: '/checkout',
      metadata: { itemCount: cart.length, subtotal: cartSubtotal },
    });
  }, [hydrated, cart.length, cartSubtotal]);

  const shipping = cartSubtotal === 0 || cartSubtotal >= 2000 ? 0 : 150;
  const total = cartSubtotal + shipping;
  const paymentOptions = onlinePayment.enabled ? [ONLINE_PAYMENT, ...PAYMENTS] : PAYMENTS;

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!cart.length || placing) return;
    setError('');
    setPlacing(true);

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const customerName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          email: data.email,
          phone: data.phone,
          company: data.company || undefined,
          addressLine1: data.line1,
          addressLine2: data.line2 || undefined,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || 'India',
          notes: data.notes || undefined,
          paymentMethod: payment,
          items: cart.map((item) =>
            item.custom
              ? {
                  custom: true,
                  boxId: item.boxId,
                  brandingId: item.brandingId,
                  productSlugs: item.productSlugs,
                  qty: item.qty,
                  note: item.note || undefined,
                }
              : {
                  slug: item.slug,
                  qty: item.qty,
                  color: item.color || undefined,
                  variant: item.variant || undefined,
                  note: item.note || undefined,
                }
          ),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const details = payload?.error?.details;
        const detailText = Array.isArray(details)
          ? details.map((detail) => detail.message).filter(Boolean).join(' ')
          : '';
        throw new Error(detailText || payload?.error?.message || 'We could not place your order. Please try again.');
      }

      const created = payload.data;
      let paidOnline = false;
      if (payment === 'online') {
        try {
          await payOnline({ created, customerName, data });
          paidOnline = true;
        } catch (paymentError) {
          setError(
            `${paymentError.message} Your order ${created.number} is saved with payment pending — our team will follow up.`
          );
        }
      }

      const paymentLabel =
        payment === 'online'
          ? ONLINE_PAYMENT.label
          : PAYMENTS.find((p) => p.id === payment)?.label || payment;
      const order = {
        number: created.number,
        date: created.createdAt,
        payment: paymentLabel,
        paymentId: paidOnline ? 'razorpay' : created.paymentMethod || payment,
        paymentStatus: paidOnline ? 'paid' : created.paymentStatus || 'pending',
        status: created.status || 'pending',
        items: (created.items || []).map((item) => ({ ...item, price: Number(item.price) })),
        itemCount: (created.items || []).reduce((sum, item) => sum + item.qty, 0),
        subtotal: Number(created.subtotal),
        shipping: Number(created.shipping),
        discount: Number(created.discount || 0),
        total: Number(created.total),
        customer: {
          name: customerName,
          email: data.email,
          phone: data.phone,
          company: data.company || '',
        },
        address: {
          line1: data.line1,
          line2: data.line2 || '',
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || 'India',
        },
        notes: data.notes || '',
      };

      try {
        sessionStorage.setItem('rooteco-order', JSON.stringify(order));
      } catch {
        /* storage may be unavailable — the order still exists in the dashboard */
      }
      clearCart();
      setCartOpen(false);
      router.push('/order-confirmation');
    } catch (submitError) {
      setError(submitError.message || 'We could not place your order. Please try again.');
      setPlacing(false);
    }
  };

  if (!hydrated) {
    return (
      <Section>
        <Container>
          <p style={{ textAlign: 'center', color: theme.colors.muted }}>Preparing checkout…</p>
        </Container>
      </Section>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <PageHero
          eyebrow="Checkout"
          title="Checkout"
          crumbs={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]}
        />
        <Section>
          <Container>
            <Empty>
              <ShoppingBag size={40} />
              <h2>Your cart is empty</h2>
              <p>Add a few gifts before heading to checkout.</p>
              <ButtonLink href="/products">
                Browse gifts <ArrowRight size={16} />
              </ButtonLink>
            </Empty>
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Almost there"
        title="Checkout"
        subtitle="Add your details and choose how you'd like to settle your order. We'll confirm stock and share the invoice or delivery slot by email."
        crumbs={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]}
      />

      <Section>
        <Container>
          <Back href="/cart">
            <ArrowLeft size={15} /> Back to cart
          </Back>

          <Layout>
            <Steps id="checkout-form" onSubmit={onSubmit}>
              <Block>
                <h2>
                  <span className="n">1</span> Contact details
                </h2>
                <p className="lead">We&apos;ll use these to send order updates.</p>
                <Fields>
                  <Label>
                    Email address <span className="req">*</span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                    />
                  </Label>
                  <Label>
                    Phone number <span className="req">*</span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+91 90000 00000"
                    />
                  </Label>
                </Fields>
              </Block>

              <Block>
                <h2>
                  <span className="n">2</span> Shipping address
                </h2>
                <p className="lead">For multi-address gifting, reply to your order email with the recipient sheet.</p>
                <Fields>
                  <Label>
                    First name <span className="req">*</span>
                    <input name="firstName" required autoComplete="given-name" placeholder="First name" />
                  </Label>
                  <Label>
                    Last name <span className="req">*</span>
                    <input name="lastName" required autoComplete="family-name" placeholder="Last name" />
                  </Label>
                  <Full>
                    <Label>
                      Company (optional)
                      <input name="company" autoComplete="organization" placeholder="Company name" />
                    </Label>
                  </Full>
                  <Full>
                    <Label>
                      Address line 1 <span className="req">*</span>
                      <input name="line1" required autoComplete="address-line1" placeholder="Building, street, area" />
                    </Label>
                  </Full>
                  <Full>
                    <Label>
                      Address line 2 (optional)
                      <input name="line2" autoComplete="address-line2" placeholder="Landmark, apartment, suite" />
                    </Label>
                  </Full>
                  <Label>
                    City <span className="req">*</span>
                    <input name="city" required autoComplete="address-level2" placeholder="City" />
                  </Label>
                  <Label>
                    State <span className="req">*</span>
                    <input name="state" required autoComplete="address-level1" placeholder="State" />
                  </Label>
                  <Label>
                    PIN code <span className="req">*</span>
                    <input
                      name="pincode"
                      required
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{5,6}"
                      title="Enter a 5 or 6 digit PIN code"
                      placeholder="122001"
                    />
                  </Label>
                  <Label>
                    Country
                    <input name="country" defaultValue="India" autoComplete="country-name" />
                  </Label>
                  <Full>
                    <Label>
                      Delivery notes (optional)
                      <textarea name="notes" placeholder="Gift message instructions, delivery preferences…" />
                    </Label>
                  </Full>
                </Fields>
              </Block>

              <Block>
                <h2>
                  <span className="n">3</span> Payment
                </h2>
                <p className="lead">
                  Choose how you&apos;d like to settle your order.
                  {onlinePayment.enabled
                    ? ' Online payments are confirmed instantly by our payment provider; bank transfers and cash on delivery are confirmed by our team.'
                    : ' Online card payments are not enabled — our team confirms bank transfers and cash-on-delivery orders manually.'}
                </p>
                <Payments>
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <PayOption key={option.id} $active={payment === option.id}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.id}
                          checked={payment === option.id}
                          onChange={() => setPayment(option.id)}
                        />
                        <Icon size={19} />
                        <span className="txt">
                          <strong>{option.label}</strong>
                          <span>{option.hint}</span>
                        </span>
                        <span className="demo">{option.tag}</span>
                      </PayOption>
                    );
                  })}
                </Payments>

                <DemoNote>
                  <ShieldCheck size={15} />
                  <span>
                    {onlinePayment.enabled ? (
                      <>
                        <strong>Payments are processed by Razorpay.</strong> Card, UPI and netbanking
                        details are entered on the provider&apos;s secure checkout — RootEco never
                        stores them. An order is marked paid only after the provider confirms the
                        payment.
                      </>
                    ) : (
                      <>
                        <strong>No card details required.</strong> We never collect card numbers or UPI
                        PINs on this site. Your order is created with payment pending and our team
                        shares an invoice or confirms cash on delivery before dispatch.
                      </>
                    )}
                  </span>
                </DemoNote>
              </Block>
            </Steps>

            <Summary>
              <h2>Order summary</h2>
              <div className="items">
                {cart.map((item) => (
                  <div className="item" key={item.key}>
                    <span className="thumb">
                      <Image src={item.image} alt={item.name} fill sizes="56px" />
                    </span>
                    <span className="info">
                      <strong>{item.name}</strong>
                      <span>
                        Qty {item.qty}
                        {item.color ? ` · ${item.color}` : ''}
                        {item.variant ? ` · ${item.variant}` : ''}
                      </span>
                      {item.note && (
                        <span style={{ display: 'block', fontStyle: 'italic' }}>
                          Note: “{item.note}”
                        </span>
                      )}
                    </span>
                    <span className="price">{formatINR(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="line">
                <span>Subtotal ({cartCount} items)</span>
                <strong>{formatINR(cartSubtotal)}</strong>
              </div>
              <div className="line">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span style={{ color: theme.colors.green, fontWeight: 600 }}>Free</span>
                ) : (
                  <strong>{formatINR(shipping)}</strong>
                )}
              </div>
              <div className="total">
                <span>Total</span>
                <strong>{formatINR(total)}</strong>
              </div>
              <p className="tax">Inclusive of all taxes.</p>
              {error && (
                <p
                  role="alert"
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: theme.colors.sale,
                    background: 'rgba(176, 58, 46, 0.08)',
                    border: '1px solid rgba(176, 58, 46, 0.25)',
                    borderRadius: theme.radius.sm,
                    padding: '10px 12px',
                    marginBottom: 14,
                  }}
                >
                  {error}
                </p>
              )}
              <Button className="place" type="submit" form="checkout-form" disabled={placing}>
                {placing ? 'Placing order…' : 'Place order'} <ArrowRight size={16} />
              </Button>
              <div className="secure">
                <LockKeyhole size={13} /> Secure checkout · payment confirmed by our team
              </div>
              <p className="terms">
                By placing this order you agree to our{' '}
                <Link href="/terms-and-conditions">Terms &amp; Conditions</Link> and{' '}
                <Link href="/privacy-policy">Privacy Policy</Link>. Your order stays payment-pending
                until we confirm the transfer or collect cash on delivery.
              </p>
              <div className="perk">
                <Truck size={15} /> Estimated delivery in 5–7 working days after dispatch
              </div>
            </Summary>
          </Layout>
        </Container>
      </Section>
    </>
  );
}
