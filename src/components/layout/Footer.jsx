'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowRight, AtSign, Check, Globe, Mail, Share2 } from 'lucide-react';
import categories from '@/data/categories';
import { brand } from '@/data/navigation';
import theme from '@/styles/theme';

const Foot = styled.footer`
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  margin-top: 80px;
`;

const Top = styled.div`
  max-width: ${theme.container};
  margin: 0 auto;
  padding: 64px 24px 40px;
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 56px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const BrandCol = styled.div`
  .logo-chip {
    width: 76px;
    height: 76px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(255, 255, 255, 0.14);
    overflow: hidden;
    display: grid;
    place-items: center;
    margin-bottom: 18px;
    padding: 5px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  p {
    color: rgba(246, 241, 231, 0.78);
    max-width: 340px;
    margin-bottom: 24px;
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 10px;
  a {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid rgba(246, 241, 231, 0.25);
    display: grid;
    place-items: center;
    transition: all 0.25s ease;
    &:hover {
      background: ${theme.colors.gold};
      border-color: ${theme.colors.gold};
      color: ${theme.colors.forest};
      transform: translateY(-2px);
    }
  }
`;

const News = styled.form`
  margin-top: 26px;
  h5 {
    font-family: ${theme.fonts.body};
    font-size: 14px;
    margin-bottom: 10px;
  }
  .field {
    display: flex;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(246, 241, 231, 0.22);
    border-radius: ${theme.radius.pill};
    overflow: hidden;
    max-width: 380px;
    input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 12px 18px;
      color: ${theme.colors.cream};
      font-size: 14px;
      &::placeholder {
        color: rgba(246, 241, 231, 0.5);
      }
    }
    button {
      padding: 0 18px;
      background: ${theme.colors.gold};
      color: ${theme.colors.forest};
      display: grid;
      place-items: center;
    }
  }
  .ok {
    margin-top: 8px;
    font-size: 13px;
    color: ${theme.colors.goldLight};
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Col = styled.div`
  h4 {
    font-family: ${theme.fonts.body};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${theme.colors.goldLight};
    margin-bottom: 16px;
  }
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  a {
    font-size: 14px;
    color: rgba(246, 241, 231, 0.8);
    transition: color 0.2s ease, padding-left 0.2s ease;
    &:hover {
      color: ${theme.colors.goldLight};
      padding-left: 3px;
    }
  }
`;

const Bottom = styled.div`
  border-top: 1px solid rgba(246, 241, 231, 0.14);
  .inner {
    max-width: ${theme.container};
    margin: 0 auto;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 13px;
    color: rgba(246, 241, 231, 0.6);
  }
  /* Clearance for the fixed WhatsApp button. */
  @media (min-width: 641px) {
    .inner {
      padding-right: 108px;
    }
  }
  @media (max-width: 640px) {
    .inner {
      padding-bottom: 86px;
    }
  }
  .cats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    a:hover {
      color: ${theme.colors.goldLight};
    }
  }
`;

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <Foot>
      <Top>
        <BrandCol>
          <div className="logo-chip">
            <Image src="/images/rooteco-logo.png" alt="RootEco logo" width={1040} height={780} />
          </div>
          <p>{brand.tagline} Curated corporate gifting, festival hampers and branded merchandise — delivered pan India.</p>
          <Socials>
            <Link href="#" aria-label="Social profile (demo)"><AtSign size={17} /></Link>
            <Link href="#" aria-label="Website (demo)"><Globe size={17} /></Link>
            <Link href="#" aria-label="Share (demo)"><Share2 size={17} /></Link>
            <Link href="#" aria-label="Email us (demo)"><Mail size={17} /></Link>
          </Socials>
          <News
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
          >
            <h5>Gift ideas, in your inbox</h5>
            <div className="field">
              <input type="email" required placeholder="Work email" aria-label="Email for newsletter" />
              <button type="submit" aria-label="Subscribe">
                <ArrowRight size={17} />
              </button>
            </div>
            {subscribed && (
              <span className="ok">
                <Check size={14} /> Thanks — you&apos;re on the list.
              </span>
            )}
          </News>
        </BrandCol>

        <Cols>
          <Col>
            <h4>Company</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/categories/welcome-kits">Corporate Gifts</Link></li>
              <li><Link href="/wall-of-love">Reviews</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </Col>
          <Col>
            <h4>Solutions</h4>
            <ul>
              <li><Link href="/get-a-quote">Bulk Orders</Link></li>
              <li><Link href="/categories/festival-hampers">Event Gifting</Link></li>
              <li><Link href="/categories/customized-merchandise">Customized Merchandise</Link></li>
              <li><Link href="/build-your-own-hamper">Build Your Own Hamper</Link></li>
            </ul>
          </Col>
          <Col>
            <h4>Support</h4>
            <ul>
              <li><Link href="/track-order">Track Order</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </Col>
          <Col>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
              <li><Link href="/shipping-and-refund-policy">Return, Refund &amp; Shipping Policy</Link></li>
            </ul>
          </Col>
        </Cols>
      </Top>

      <Bottom>
        <div className="inner">
          <span>© 2026 RootEco. All rights reserved. Demo storefront — no real orders are processed.</span>
          <div className="cats">
            {categories.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`}>{c.name}</Link>
            ))}
          </div>
        </div>
      </Bottom>
    </Foot>
  );
}
