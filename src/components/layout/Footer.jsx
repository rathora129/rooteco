'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowRight, AtSign, Check, Globe, Mail, Share2 } from 'lucide-react';
import theme from '@/styles/theme';

function InstagramIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20.4h3.38V8.5ZM5.25 3.6a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM20.44 13.6c0-3.3-1.76-4.84-4.11-4.84a3.54 3.54 0 0 0-3.2 1.76V8.5H9.75V20.4h3.38v-6.22c0-1.64.74-2.62 2.2-2.62 1.33 0 1.94.94 1.94 2.62v6.22h3.17v-6.8Z" />
    </svg>
  );
}

function FacebookIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.84.24-1.42 1.45-1.42h1.55V4.78c-.27-.04-1.19-.12-2.26-.12-2.24 0-3.78 1.37-3.78 3.88v2.17H8v2.9h2.46V21h3.04Z" />
    </svg>
  );
}

function YoutubeIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.83-1.84C18.2 4.93 12 4.93 12 4.93s-6.2 0-7.77.43A2.6 2.6 0 0 0 2.4 7.2 27.17 27.17 0 0 0 2 12a27.17 27.17 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.83 1.84c1.57.43 7.77.43 7.77.43s6.2 0 7.77-.43a2.6 2.6 0 0 0 1.83-1.84A27.17 27.17 0 0 0 22 12a27.17 27.17 0 0 0-.4-4.8ZM10.1 15.1V8.9L15.5 12l-5.4 3.1Z" />
    </svg>
  );
}

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
    border-radius: 50%;
    background: #fff;
    border: 1px solid rgba(255, 255, 255, 0.14);
    overflow: hidden;
    display: grid;
    place-items: center;
    margin-bottom: 18px;
    padding: 4px;
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
  .err {
    margin-top: 8px;
    font-size: 12.5px;
    color: #f0b8a9;
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

export default function Footer({ categories = [], settings = {} }) {
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState({ state: 'idle', message: '' });
  const general = settings.general || {};
  const contact = settings.contact || {};
  const footer = settings.footer || {};
  const social = settings.social || {};
  const logoUrl = general.logoUrl || '/images/rooteco-logo.png';
  const socialLinks = [
    social.instagram && { href: social.instagram, label: 'Instagram', icon: InstagramIcon },
    social.linkedin && { href: social.linkedin, label: 'LinkedIn', icon: LinkedinIcon },
    social.facebook && { href: social.facebook, label: 'Facebook', icon: FacebookIcon },
    social.youtube && { href: social.youtube, label: 'YouTube', icon: YoutubeIcon },
  ].filter(Boolean);

  return (
    <Foot>
      <Top>
        <BrandCol>
          <div className="logo-chip">
            <Image src={logoUrl} alt="RootEco logo" width={1080} height={1058} />
          </div>
          <p>
            {general.tagline ||
              'Thoughtful gifting for teams that care about people.'}{' '}
            {footer.description ||
              'Curated corporate gifting, festival hampers and branded merchandise — delivered pan India.'}
          </p>
          <Socials>
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <Icon size={17} />
              </a>
            ))}
            {!socialLinks.length && (
              <>
                <Link href="/contact" aria-label="Contact RootEco"><AtSign size={17} /></Link>
                <Link href="/" aria-label="RootEco home"><Globe size={17} /></Link>
                <Link href="/wall-of-love" aria-label="Reviews"><Share2 size={17} /></Link>
                <a href={`mailto:${contact.email || 'hello@rooteco.example.com'}`} aria-label="Email us"><Mail size={17} /></a>
              </>
            )}
          </Socials>
          <News
            onSubmit={async (e) => {
              e.preventDefault();
              setNewsletter({ state: 'loading', message: '' });
              try {
                const response = await fetch('/api/newsletter', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                });
                const payload = await response.json().catch(() => null);
                if (!response.ok || !payload?.success) {
                  throw new Error(payload?.error?.message || 'Could not subscribe right now.');
                }
                setNewsletter({ state: 'done', message: '' });
                setEmail('');
              } catch (error) {
                setNewsletter({ state: 'error', message: error.message });
              }
            }}
          >
            <h5>Gift ideas, in your inbox</h5>
            <div className="field">
              <input
                type="email"
                required
                placeholder="Work email"
                aria-label="Email for newsletter"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (newsletter.state === 'error') setNewsletter({ state: 'idle', message: '' });
                }}
                disabled={newsletter.state === 'loading'}
              />
              <button type="submit" aria-label="Subscribe" disabled={newsletter.state === 'loading'}>
                <ArrowRight size={17} />
              </button>
            </div>
            {newsletter.state === 'done' && (
              <span className="ok">
                <Check size={14} /> Thanks — you&apos;re on the list.
              </span>
            )}
            {newsletter.state === 'error' && <span className="err">{newsletter.message}</span>}
          </News>
        </BrandCol>

        <Cols>
          <Col>
            <h4>Company</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/categories/welcome-kits">Corporate Gifts</Link></li>
              <li><Link href="/collections">Collections</Link></li>
              <li><Link href="/blog">Journal</Link></li>
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
          <span>
            {footer.copyright ||
              `© ${new Date().getFullYear()} ${general.siteName || 'RootEco'}. All rights reserved.`}
          </span>
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
