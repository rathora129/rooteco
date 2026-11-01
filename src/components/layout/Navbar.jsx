'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import categories from '@/data/categories';
import mainNav from '@/data/navigation';
import { useStore } from '@/lib/store';
import theme from '@/styles/theme';
import MegaMenu from './MegaMenu';
import SearchOverlay from '@/components/common/SearchOverlay';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 252, 248, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.line};
  transition: box-shadow 0.3s ease;
  &.scrolled {
    box-shadow: ${theme.shadow.soft};
  }
`;

const Inner = styled.div`
  max-width: ${theme.container};
  margin: 0 auto;
  padding: 0 24px;
  height: 74px;
  display: flex;
  align-items: center;
  gap: 24px;
  @media (max-width: 1024px) {
    height: 64px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  .chip {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid ${theme.colors.line};
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: 3px;
    img {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  }
  @media (max-width: 1024px) {
    .chip {
      width: 44px;
      height: 44px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavItem = styled.div`
  position: relative;
  > a,
  > button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 10px 13px;
    font-size: 14.5px;
    font-weight: 500;
    color: ${theme.colors.ink};
    border-radius: ${theme.radius.pill};
    transition: color 0.2s ease, background 0.2s ease;
    &.active {
      color: ${theme.colors.forest};
      font-weight: 600;
    }
    &:hover {
      color: ${theme.colors.forest};
      background: ${theme.colors.cream};
    }
  }
  &:hover .mega-panel {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
`;

const IconBtn = styled.button`
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${theme.colors.ink};
  transition: background 0.2s ease, color 0.2s ease;
  &:hover {
    background: ${theme.colors.cream};
    color: ${theme.colors.forest};
  }
  .count {
    position: absolute;
    top: 2px;
    right: 0;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 999px;
    background: ${theme.colors.gold};
    color: ${theme.colors.forest};
    font-size: 10.5px;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
`;

const QuoteCta = styled(Link)`
  margin-left: 8px;
  padding: 11px 20px;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.forest};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.25s ease;
  &:hover {
    background: ${theme.colors.green};
    transform: translateY(-1px);
  }
  @media (max-width: 1100px) {
    display: none;
  }
`;

const MobileToggle = styled.button`
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  place-items: center;
  color: ${theme.colors.ink};
  @media (max-width: 1024px) {
    display: grid;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: ${theme.colors.white};
  overflow-y: auto;
  padding: 18px 20px 40px;
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }
  h4 {
    font-family: ${theme.fonts.body};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    margin: 26px 0 10px;
  }
  a {
    display: block;
    padding: 10px 2px;
    font-size: 16px;
    color: ${theme.colors.ink};
    border-bottom: 1px solid ${theme.colors.line};
    &.cat {
      font-weight: 600;
      color: ${theme.colors.forest};
      border-bottom: none;
      padding-bottom: 4px;
    }
  }
  .sub {
    padding-left: 14px;
    a {
      font-size: 14.5px;
      border-bottom: none;
      padding: 7px 2px;
      color: ${theme.colors.muted};
    }
  }
`;

export default function Navbar() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMegaLeave = () => {
    closeTimer.current = setTimeout(() => {
      document.querySelectorAll('.mega-panel').forEach((el) => {
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
      });
    }, 150);
  };

  const handleMegaEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    document.querySelectorAll('.mega-panel').forEach((el) => {
      el.style.opacity = '';
      el.style.visibility = '';
    });
  };

  return (
    <>
      <Header className={scrolled ? 'scrolled' : ''}>
        <Inner>
          <Logo href="/" aria-label="RootEco home">
            <span className="chip">
              <Image
                src="/images/rooteco-logo.png"
                alt="RootEco logo"
                width={1040}
                height={780}
              />
            </span>
          </Logo>

          <Nav aria-label="Main navigation">
            {mainNav.map((item) =>
              item.mega ? (
                <NavItem
                  key={item.href}
                  onMouseEnter={handleMegaEnter}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={item.href}
                    className={pathname === item.href ? 'active' : ''}
                  >
                    {item.label} <ChevronDown size={15} />
                  </Link>
                  <MegaMenu />
                </NavItem>
              ) : (
                <NavItem key={item.href}>
                  <Link
                    href={item.href}
                    className={pathname === item.href ? 'active' : ''}
                  >
                    {item.label}
                  </Link>
                </NavItem>
              )
            )}
          </Nav>

          <Icons>
            <IconBtn onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </IconBtn>
            <IconBtn
              as={Link}
              href="/products?view=wishlist"
              aria-label="Wishlist"
              style={{ display: 'grid' }}
            >
              <Heart size={20} />
              {wishlist.length > 0 && <span className="count">{wishlist.length}</span>}
            </IconBtn>
            <IconBtn onClick={() => setCartOpen(true)} aria-label="Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </IconBtn>
            <QuoteCta href="/get-a-quote">Get a Quote</QuoteCta>
            <MobileToggle onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </MobileToggle>
          </Icons>
        </Inner>
      </Header>

      {mobileOpen && (
        <MobileMenu>
          <div className="top">
            <Logo href="/">
              <span className="chip">
                <Image
                  src="/images/rooteco-logo.png"
                  alt="RootEco logo"
                  width={1040}
                  height={780}
                />
              </span>
            </Logo>
            <MobileToggle onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={22} />
            </MobileToggle>
          </div>

          {mainNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/build-your-own-hamper">Build Your Own Hamper</Link>
          <Link href="/get-a-quote">Get a Quote</Link>

          <h4>Shop by Category</h4>
          {categories.map((cat) => (
            <div key={cat.slug}>
              <Link className="cat" href={`/categories/${cat.slug}`}>
                {cat.name}
              </Link>
              <div className="sub">
                {cat.subcategories.map((sub) => (
                  <Link key={sub.slug} href={`/categories/${cat.slug}/${sub.slug}`}>
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <h4>Support</h4>
          <Link href="/track-order">Track Order</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/wall-of-love">Wall of Love</Link>
        </MobileMenu>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
