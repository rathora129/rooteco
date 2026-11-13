'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  BarChart3,
  BookOpen,
  Boxes,
  CalendarHeart,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Package,
  Quote,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
  Users,
  X,
} from 'lucide-react';
import theme from '@/styles/theme';
import { ToastProvider } from '@/components/dashboard/ui';

const NAV = [
  {
    group: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Catalogue',
    items: [
      { href: '/dashboard/products', label: 'Products', icon: Boxes },
      { href: '/dashboard/categories', label: 'Categories', icon: FolderTree },
      { href: '/dashboard/collections', label: 'Collections', icon: Layers },
    ],
  },
  {
    group: 'Content',
    items: [
      { href: '/dashboard/pages', label: 'Website pages', icon: FileText },
      { href: '/dashboard/banners', label: 'Banners & sliders', icon: ImageIcon },
      { href: '/dashboard/media', label: 'Media library', icon: ImageIcon },
      { href: '/dashboard/blogs', label: 'Blogs', icon: BookOpen },
      { href: '/dashboard/testimonials', label: 'Testimonials', icon: Quote },
      { href: '/dashboard/faqs', label: 'FAQs', icon: Search },
    ],
  },
  {
    group: 'Sales & CRM',
    items: [
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/dashboard/quotes', label: 'Quotes', icon: Package },
      { href: '/dashboard/leads', label: 'Leads & clients', icon: Users },
      { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: MessageCircle },
    ],
  },
  {
    group: 'Growth',
    items: [
      { href: '/dashboard/marketing', label: 'Marketing & SEO', icon: BarChart3 },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const PAGE_TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/products': 'Products',
  '/dashboard/categories': 'Categories',
  '/dashboard/collections': 'Collections',
  '/dashboard/pages': 'Website pages',
  '/dashboard/banners': 'Banners & sliders',
  '/dashboard/media': 'Media library',
  '/dashboard/blogs': 'Blogs',
  '/dashboard/testimonials': 'Testimonials',
  '/dashboard/faqs': 'FAQs',
  '/dashboard/orders': 'Orders',
  '/dashboard/quotes': 'Quotes',
  '/dashboard/leads': 'Leads & clients',
  '/dashboard/whatsapp': 'WhatsApp',
  '/dashboard/marketing': 'Marketing & SEO',
  '/dashboard/settings': 'Settings',
};

const Shell = styled.div`
  min-height: 100dvh;
  background:
    radial-gradient(1100px 520px at 78% -10%, rgba(240, 162, 59, 0.07), transparent 60%),
    ${theme.colors.cream};
`;

const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: 264px;
  z-index: 60;
  background: ${theme.colors.sidebar};
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(244, 240, 230, 0.76);
  display: flex;
  flex-direction: column;
  padding: 20px 14px 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  @media (max-width: 1024px) {
    transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
    transition: transform 0.25s ease;
    box-shadow: ${(p) => (p.$open ? '0 24px 60px rgba(0, 0, 0, 0.55)' : 'none')};
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 8px 20px;
  border-bottom: 1px solid rgba(246, 241, 231, 0.12);
  margin-bottom: 16px;
  .logo {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #fbf7ec;
    padding: 3px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(240, 162, 59, 0.4), 0 6px 18px rgba(0, 0, 0, 0.35);
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .name {
    display: block;
    font-family: ${theme.fonts.display};
    font-size: 20px;
    color: #fdfaf2;
    line-height: 1.1;
  }
  .sub {
    display: block;
    font-size: 9.5px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${theme.colors.accent};
    margin-top: 3px;
  }
`;

const Group = styled.div`
  margin-bottom: 14px;
  .group-label {
    display: block;
    padding: 0 10px;
    margin: 8px 0 5px;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(246, 241, 231, 0.4);
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  color: ${(p) => (p.$active ? '#fff' : 'rgba(244, 240, 230, 0.68)')};
  background: ${(p) => (p.$active ? 'rgba(240, 162, 59, 0.14)' : 'transparent')};
  border-left: 2px solid ${(p) => (p.$active ? theme.colors.accent : 'transparent')};
  transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;
  svg {
    width: 16px;
    height: 16px;
    color: ${(p) => (p.$active ? theme.colors.accent : 'rgba(244, 240, 230, 0.5)')};
    flex-shrink: 0;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
  }
`;

const SideFoot = styled.div`
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid rgba(246, 241, 231, 0.12);
  font-size: 10.5px;
  color: rgba(246, 241, 231, 0.35);
  padding-left: 10px;
`;

const Main = styled.div`
  margin-left: 256px;
  min-height: 100dvh;
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 26px;
  background: rgba(15, 21, 18, 0.72);
  backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid ${theme.colors.line};
  .menu {
    display: none;
    @media (max-width: 1024px) {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid ${theme.colors.line};
      background: rgba(255, 255, 255, 0.04);
      color: ${theme.colors.ink};
    }
  }
  .title {
    font-size: 15px;
    font-weight: 600;
    color: ${theme.colors.forest};
    display: flex;
    align-items: center;
    gap: 7px;
    svg {
      width: 13px;
      height: 13px;
      color: ${theme.colors.accent};
    }
  }
  @media (max-width: 480px) {
    padding: 0 16px;
    gap: 10px;
    .title {
      display: none;
    }
  }
  .spacer {
    flex: 1;
  }
  .site {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    font-weight: 600;
    color: ${theme.colors.ink};
    padding: 7px 12px;
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radius.pill};
    background: rgba(255, 255, 255, 0.04);
    transition: border-color 0.18s ease, background 0.18s ease;
    &:hover {
      border-color: rgba(240, 162, 59, 0.55);
      background: rgba(240, 162, 59, 0.08);
    }
    @media (max-width: 620px) {
      span {
        display: none;
      }
    }
  }
  .owner {
    display: flex;
    align-items: center;
    gap: 9px;
    padding-left: 12px;
    border-left: 1px solid ${theme.colors.line};
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(145deg, #f0a23b, #d07c1d);
      color: #1a1408;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(240, 162, 59, 0.25);
    }
    .who {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
      strong {
        font-size: 12px;
        color: ${theme.colors.ink};
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      span {
        font-size: 10px;
        color: ${theme.colors.muted};
      }
      @media (max-width: 760px) {
        display: none;
      }
    }
    button {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      color: ${theme.colors.muted};
      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: ${theme.colors.sale};
      }
    }
  }
`;

const Content = styled.main`
  padding: 26px;
  @media (max-width: 620px) {
    padding: 18px 14px 30px;
  }
`;

const Scrim = styled.button`
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(11, 32, 24, 0.45);
  display: ${(p) => (p.$open ? 'block' : 'none')};
  @media (min-width: 1025px) {
    display: none;
  }
`;

export default function DashboardShell({ owner, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const pageTitle =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith('/dashboard/clients')
      ? 'Client profile'
      : pathname.startsWith('/dashboard/leads')
        ? 'Leads & clients'
        : 'Dashboard');

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/login');
    router.refresh();
  }

  const initials = (owner?.name || owner?.email || 'R')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ToastProvider>
      <Shell className="dashboard-theme">
        <Sidebar $open={open}>
          <Brand href="/dashboard" onClick={() => setOpen(false)}>
            <span className="logo">
              <Image
                src="/images/rooteco-logo.png"
                alt="RootEco"
                width={92}
                height={90}
                sizes="46px"
                priority
              />
            </span>
            <span>
              <span className="name">RootEco</span>
              <span className="sub">Owner Studio</span>
            </span>
          </Brand>
          <nav>
            {NAV.map((section) => (
              <Group key={section.group}>
                <span className="group-label">{section.group}</span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      $active={isActive(item.href)}
                      onClick={() => setOpen(false)}
                    >
                      <Icon />
                      {item.label}
                      <ChevronRight style={{ marginLeft: 'auto', opacity: 0.35 }} />
                    </NavLink>
                  );
                })}
              </Group>
            ))}
          </nav>
          <SideFoot>RootEco owner workspace</SideFoot>
        </Sidebar>

        <Scrim $open={open} onClick={() => setOpen(false)} aria-label="Close navigation" />

        <Main>
          <Topbar>
            <button type="button" className="menu" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <div className="title">
              <Sparkles /> {pageTitle}
            </div>
            <div className="spacer" />
            <Link href="/" className="site" target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> <span>View storefront</span>
            </Link>
            <div className="owner">
              <span className="avatar">{initials}</span>
              <span className="who">
                <strong>{owner?.name || 'Owner'}</strong>
                <span>{owner?.email}</span>
              </span>
              <button type="button" onClick={logout} disabled={loggingOut} aria-label="Sign out" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          </Topbar>
          <Content>{children}</Content>
        </Main>
      </Shell>
    </ToastProvider>
  );
}
