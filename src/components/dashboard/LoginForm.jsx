'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import theme from '@/styles/theme';

const Page = styled.div`
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: ${theme.colors.cream};
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const BrandPanel = styled.section`
  position: relative;
  overflow: hidden;
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  padding: 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  &::before {
    content: '';
    position: absolute;
    width: 620px;
    height: 620px;
    border-radius: 50%;
    right: -220px;
    top: -180px;
    background: radial-gradient(circle, rgba(201, 162, 74, 0.22), transparent 62%);
  }
  &::after {
    content: '';
    position: absolute;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    left: -260px;
    bottom: -220px;
    background: radial-gradient(circle, rgba(246, 241, 231, 0.1), transparent 65%);
  }
  > * {
    position: relative;
    z-index: 1;
  }
  @media (max-width: 960px) {
    display: none;
  }
`;

const Seal = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #fffdf7;
  padding: 7px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandCopy = styled.div`
  max-width: 440px;
  margin: 40px 0;
  h1 {
    font-family: ${theme.fonts.display};
    font-size: clamp(38px, 4vw, 54px);
    line-height: 1.08;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 18px 0 20px;
    em {
      font-style: italic;
      color: ${theme.colors.goldLight};
    }
  }
  > p {
    color: rgba(246, 241, 231, 0.72);
    font-size: 15px;
    line-height: 1.7;
    max-width: 380px;
  }
`;

const Kicker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.goldLight};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const Points = styled.ul`
  list-style: none;
  display: grid;
  gap: 14px;
  margin-top: 34px;
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    color: rgba(246, 241, 231, 0.82);
  }
  svg {
    width: 15px;
    height: 15px;
    color: ${theme.colors.goldLight};
  }
`;

const PanelFoot = styled.p`
  font-size: 12px;
  letter-spacing: 0.04em;
  color: rgba(246, 241, 231, 0.45);
`;

const FormSide = styled.section`
  display: grid;
  place-items: center;
  padding: 44px 24px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  .mobile-brand {
    display: none;
    justify-content: center;
    margin-bottom: 26px;
    @media (max-width: 960px) {
      display: flex;
    }
  }
  .mobile-brand span {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid ${theme.colors.line};
    padding: 6px;
    display: grid;
    place-items: center;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  h2 {
    font-family: ${theme.fonts.display};
    font-size: 34px;
    color: ${theme.colors.forest};
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  > p {
    font-size: 14px;
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin-bottom: 30px;
  }
`;

const Field = styled.label`
  display: block;
  margin-bottom: 16px;
  > span {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: ${theme.colors.ink};
    margin-bottom: 7px;
  }
  .control {
    position: relative;
    display: flex;
    align-items: center;
    background: #fff;
    border: 1.5px solid ${theme.colors.line};
    border-radius: ${theme.radius.md};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    &:focus-within {
      border-color: ${theme.colors.forest};
      box-shadow: 0 0 0 3px rgba(11, 61, 46, 0.08);
    }
    > svg {
      width: 17px;
      height: 17px;
      color: ${theme.colors.muted};
      margin-left: 14px;
      flex-shrink: 0;
    }
    input {
      flex: 1;
      border: 0;
      background: transparent;
      padding: 13px 12px;
      font-size: 14.5px;
      color: ${theme.colors.ink};
      outline: none;
      min-width: 0;
    }
    button {
      border: 0;
      background: transparent;
      padding: 0 14px;
      color: ${theme.colors.muted};
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    button:hover {
      color: ${theme.colors.forest};
    }
  }
`;

const Submit = styled.button`
  width: 100%;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 14px 20px;
  border: 0;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.forest};
  color: #fff;
  font-family: ${theme.fonts.body};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  &:hover:not(:disabled) {
    background: #0f4d3a;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  background: #fdf0ee;
  border: 1px solid #f2c7c0;
  color: #8f2a1c;
  border-radius: 10px;
  padding: 11px 13px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 18px;
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid ${theme.colors.line};
  font-size: 13px;
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${theme.colors.forest};
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
    svg {
      width: 14px;
      height: 14px;
    }
  }
  span {
    color: ${theme.colors.muted};
    font-size: 12px;
  }
`;

export default function LoginForm({ nextUrl = '/dashboard' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Unable to sign in.');
      }
      router.replace(nextUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Page>
      <BrandPanel>
        <Seal>
          <Image src="/images/rooteco-logo.png" alt="RootEco" width={1080} height={1058} priority />
        </Seal>
        <BrandCopy>
          <Kicker>
            <Leaf size={14} /> RootEco Owner
          </Kicker>
          <h1>
            Run the store, <em>beautifully.</em>
          </h1>
          <p>
            One calm workspace for products, orders, quotations, leads and everything the storefront
            publishes.
          </p>
          <Points>
            <li>
              <ShieldCheck /> Single-owner access with secure sessions
            </li>
            <li>
              <Leaf /> Content and catalogue changes go live immediately
            </li>
            <li>
              <Mail /> Quotes and enquiries consolidated in one CRM
            </li>
          </Points>
        </BrandCopy>
        <PanelFoot>RootEco — Premium Corporate Gifting</PanelFoot>
      </BrandPanel>

      <FormSide>
        <Card>
          <div className="mobile-brand">
            <span>
              <Image src="/images/rooteco-logo.png" alt="RootEco" width={1080} height={1058} priority />
            </span>
          </div>
          <h2>Owner sign in</h2>
          <p>Enter the owner credentials configured for this store.</p>

          {error && (
            <ErrorBox role="alert">
              <LockKeyhole />
              <span>{error}</span>
            </ErrorBox>
          )}

          <form onSubmit={onSubmit}>
            <Field>
              <span>Email address</span>
              <div className="control">
                <Mail />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@rooteco.in"
                />
              </div>
            </Field>

            <Field>
              <span>Password</span>
              <div className="control">
                <LockKeyhole />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <Submit type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowRight />}
            </Submit>
          </form>

          <Foot>
            <Link href="/">
              <ArrowLeft /> Back to storefront
            </Link>
            <span>No public registration</span>
          </Foot>
        </Card>
      </FormSide>
    </Page>
  );
}
