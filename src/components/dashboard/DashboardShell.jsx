'use client';

import { useState } from 'react';
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
  background: ${theme.colors.cream};
`;

const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: 256px;
  z-index: 60;
  background: ${theme.colors.forest};
  color: rgba(246, 241, 231, 0.8);
  display: flex;
  flex-direction: column;
  padding: 20px 14px 16px;
  overflow-y: auto;
  @media (max-width: 1024px) {
    transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
    transition: transform 0.25s ease;
    box-shadow: ${(p) => (p.$open ? theme.shadow.lift : 'none')};
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
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #fffdf7;
    padding: 4px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .name {
    display: block;
    font-family: ${theme.fonts.display};
    font-size: 20px;
    color: #fff;
    line-height: 1.1;
  }
  .sub {
    display: block;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${theme.colors.goldLight};
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
  color: ${(p) => (p.$active ? '#fff' : 'rgba(246, 241, 231, 0.72)')};
  background: ${(p) => (p.$active ? 'rgba(201, 162, 39, 0.18)' : 'transparent')};
  border-left: 2px solid ${(p) => (p.$active ? theme.colors.gold : 'transparent')};
  transition: all 0.16s ease;
  svg {
    width: 16px;
    height: 16px;
    color: ${(p) => (p.$active ? theme.colors.goldLight : 'rgba(246, 241, 231, 0.55)')};
    flex-shrink: 0;
  }
  &:hover {
    background: rgba(246, 241, 231, 0.08);
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
  background: rgba(253, 252, 248, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${theme.colors.line};
  .menu {
    display: none;
    @media (max-width: 1024px) {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      border: 1px solid ${theme.colors.line};
      background: #fff;
      color: ${theme.colors.forest};
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
      color: ${theme.colors.muted};
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
    color: ${theme.colors.forest};
    padding: 7px 12px;
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radius.pill};
    background: #fff;
    &:hover {
      border-color: ${theme.colors.forest};
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
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: ${theme.colors.forest};
      color: ${theme.colors.goldLight};
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 700;
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
        background: ${theme.colors.cream};
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
      <Shell>
        <Sidebar $open={open}>
          <Brand href="/dashboard" onClick={() => setOpen(false)}>
            <span className="logo">
              <Image src="/images/rooteco-logo.png" alt="RootEco" width={120} height={118} />
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
