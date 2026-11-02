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
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    overflow: hidden;
    img {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  }
  @media (max-width: 1024px) {
    .chip {
      width: 48px;
      height: 48px;
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
    svg {
      transition: transform 0.2s ease;
    }
  }
  &.mega-open > a svg {
    transform: rotate(180deg);
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
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef(null);
  const suppressFocusOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!megaOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      suppressFocusOpen.current = true;
      setMegaOpen(false);
      document.querySelector('[data-mega-trigger]')?.focus();
      window.setTimeout(() => {
        suppressFocusOpen.current = false;
      }, 0);
    };
    const onPointerDown = (event) => {
      if (!document.querySelector('header')?.contains(event.target)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [megaOpen]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const closeMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(false);
  };

  const scheduleMegaClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 250);
  };

  const onMegaClick = (event) => {
    const isTouchWide =
      typeof window !== 'undefined' &&
      window.innerWidth > 1024 &&
      window.matchMedia('(hover: none)').matches;
    if (isTouchWide) {
      event.preventDefault();
      setMegaOpen((open) => !open);
    } else {
      closeMega();
    }
  };

  const onMegaKeyDown = (event) => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    openMega();
    window.requestAnimationFrame(() => {
      document.querySelector('#mega-menu a')?.focus();
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
                width={1080}
                height={1058}
              />
            </span>
          </Logo>

          <Nav aria-label="Main navigation">
            {mainNav.map((item) =>
              item.mega ? (
                <NavItem
                  key={item.href}
                  className={megaOpen ? 'mega-open' : ''}
                  onMouseEnter={openMega}
                  onMouseLeave={scheduleMegaClose}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      scheduleMegaClose();
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    data-mega-trigger
                    className={pathname === item.href ? 'active' : ''}
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                    aria-controls="mega-menu"
                    onFocus={() => {
                      if (
                        !suppressFocusOpen.current &&
                        window.matchMedia('(hover: hover)').matches
                      ) {
                        openMega();
                      }
                    }}
                    onClick={onMegaClick}
                    onKeyDown={onMegaKeyDown}
                  >
                    {item.label} <ChevronDown size={15} />
                  </Link>
                  <MegaMenu
                    open={megaOpen}
                    onClose={closeMega}
                    onEnter={openMega}
                    onLeave={scheduleMegaClose}
                  />
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
                  width={1080}
                  height={1058}
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
