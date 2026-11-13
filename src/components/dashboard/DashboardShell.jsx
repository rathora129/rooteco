'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import {
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  CircleHelp,
  Command,
  ExternalLink,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  Newspaper,
  Package,
  PanelsTopLeft,
  Quote,
  Search,
  SearchX,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  TicketPercent,
  Users,
  X,
} from 'lucide-react';
import { ToastProvider } from '@/components/dashboard/ui';
import { apiRequest, getDashboardStats } from '@/components/dashboard/hooks';

const NAV = [
  {
    group: 'Overview',
    collapsible: false,
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    group: 'Website Studio',
    items: [
      { href: '/dashboard/website', label: 'Studio overview', icon: PanelsTopLeft },
      { href: '/dashboard/pages', label: 'Pages', icon: FileText },
      { href: '/dashboard/banners', label: 'Banners', icon: Megaphone },
      { href: '/dashboard/media', label: 'Media library', icon: ImageIcon },
      { href: '/dashboard/website/settings', label: 'Website settings', icon: Settings },
    ],
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
    group: 'Business',
    items: [
      { href: '/dashboard/leads', label: 'Leads', icon: Users },
      { href: '/dashboard/clients', label: 'Customers', icon: Tags },
      { href: '/dashboard/quotes', label: 'Quotations', icon: Package },
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { href: '/dashboard/marketing', label: 'Marketing overview', icon: Megaphone },
      { href: '/dashboard/seo', label: 'SEO & search', icon: Search },
      { href: '/dashboard/coupons', label: 'Coupons', icon: TicketPercent },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/blogs', label: 'Blog', icon: Newspaper },
      { href: '/dashboard/testimonials', label: 'Testimonials', icon: Quote },
      { href: '/dashboard/faqs', label: 'FAQs', icon: CircleHelp },
    ],
  },
  {
    group: 'Communication',
    items: [
      { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: MessageCircle },
      { href: '/dashboard/enquiries', label: 'Enquiries', icon: Inbox },
      { href: '/dashboard/newsletter', label: 'Newsletter', icon: Mail },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/dashboard/settings', label: 'General settings', icon: Settings },
      { href: '/dashboard/security', label: 'Account security', icon: ShieldCheck },
      { href: '/dashboard/help', label: 'Help centre', icon: LifeBuoy },
    ],
  },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/website': 'Website studio',
  '/dashboard/website/settings': 'Website settings',
  '/dashboard/pages': 'Pages',
  '/dashboard/banners': 'Banners',
  '/dashboard/media': 'Media library',
  '/dashboard/products': 'Products',
  '/dashboard/categories': 'Categories',
  '/dashboard/collections': 'Collections',
  '/dashboard/leads': 'Leads',
  '/dashboard/clients': 'Customers',
  '/dashboard/quotes': 'Quotations',
  '/dashboard/orders': 'Orders',
  '/dashboard/marketing': 'Marketing overview',
  '/dashboard/seo': 'SEO & search',
  '/dashboard/coupons': 'Coupons',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/blogs': 'Blog',
  '/dashboard/testimonials': 'Testimonials',
  '/dashboard/faqs': 'FAQs',
  '/dashboard/whatsapp': 'WhatsApp',
  '/dashboard/enquiries': 'Enquiries',
  '/dashboard/newsletter': 'Newsletter',
  '/dashboard/settings': 'General settings',
  '/dashboard/security': 'Account security',
  '/dashboard/help': 'Help centre',
};

const SIDEBAR_W = 262;
const SIDEBAR_COLLAPSED = 76;

const Shell = styled.div`
  min-height: 100dvh;
  background:
    radial-gradient(900px 380px at 72% -12%, rgba(233, 166, 78, 0.055), transparent 62%),
    var(--dash-bg);
`;

const Sidebar = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: ${(p) => (p.$collapsed ? `${SIDEBAR_COLLAPSED}px` : `${SIDEBAR_W}px`)};
  z-index: 70;
  background: var(--dash-shell);
  border-right: 1px solid var(--dash-line-soft);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease, transform 0.22s ease;
  @media (max-width: 1080px) {
    width: ${SIDEBAR_W}px;
    transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
    box-shadow: ${(p) => (p.$open ? '0 30px 80px rgba(0, 0, 0, 0.55)' : 'none')};
    transition: transform 0.22s ease;
  }
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 16px;
  min-height: 68px;
  .mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #f9f4e8;
    padding: 2px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .name {
    min-width: 0;
    line-height: 1.2;
    strong {
      display: block;
      font-size: 13.5px;
      font-weight: 700;
      color: var(--dash-ink);
      letter-spacing: -0.01em;
    }
    span {
      display: block;
      font-size: 10px;
      color: var(--dash-faint);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin-top: 3px;
    }
  }
  @media (max-width: 1080px) {
    padding-right: 52px;
  }
`;

const NavScroll = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 18px;
  scrollbar-width: thin;
  scrollbar-color: var(--dash-line) transparent;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: var(--dash-line); border-radius: 99px; }
`;

const Group = styled.div`
  margin-bottom: 4px;
`;

const GroupToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 8px 6px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--dash-faint);
  ${(p) => (p.$collapsed ? 'justify-content: center;' : '')}
  svg { width: 12px; height: 12px; transition: transform 0.16s ease; transform: rotate(${(p) => (p.$closed ? '-90deg' : '0deg')}); }
  span { ${(p) => (p.$collapsed ? 'display: none;' : '')} }
  &:hover { color: var(--dash-muted); }
`;

const NavItem = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 9px;
  margin-bottom: 1px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: ${(p) => (p.$active ? '650' : '500')};
  color: ${(p) => (p.$active ? 'var(--dash-ink)' : 'var(--dash-muted)')};
  background: ${(p) => (p.$active ? 'var(--dash-panel-2)' : 'transparent')};
  transition: background 0.14s ease, color 0.14s ease;
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: ${(p) => (p.$active ? 'var(--dash-accent)' : 'var(--dash-faint)')};
  }
  .label { ${(p) => (p.$collapsed ? 'display: none;' : '')} white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .count {
    margin-left: auto;
    font-size: 10px;
    font-weight: 650;
    padding: 1px 6px;
    border-radius: 5px;
    background: var(--dash-accent-soft);
    color: var(--dash-accent);
    ${(p) => (p.$collapsed ? 'display: none;' : '')}
  }
  &:hover { background: var(--dash-panel-2); color: var(--dash-ink); }
  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 7px;
    bottom: 7px;
    width: 2px;
    border-radius: 2px;
    background: ${(p) => (p.$active ? 'var(--dash-accent)' : 'transparent')};
  }
  @media (max-width: 1080px) {
    .label { display: block; }
    &::before { display: none; }
  }
`;

const SidebarFoot = styled.div`
  padding: 12px 12px 14px;
  border-top: 1px solid var(--dash-line-soft);
  .help {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 8px;
    border-radius: 8px;
    color: var(--dash-muted);
    font-size: 12px;
    &:hover { background: var(--dash-panel-2); color: var(--dash-ink); }
    svg { width: 15px; height: 15px; color: var(--dash-faint); }
  }
  .version {
    padding: 6px 8px 0;
    font-size: 9.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dash-faint);
    ${(p) => (p.$collapsed ? 'display: none;' : '')}
  }
`;

const Main = styled.div`
  margin-left: ${(p) => (p.$collapsed ? `${SIDEBAR_COLLAPSED}px` : `${SIDEBAR_W}px`)};
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.2s ease;
  @media (max-width: 1080px) {
    margin-left: 0;
  }
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 26px;
  background: rgba(8, 10, 9, 0.86);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--dash-line-soft);
  @media (max-width: 720px) {
    padding: 0 14px;
  }
`;

const Crumb = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--dash-faint);
  font-size: 11.5px;
  white-space: nowrap;
  .sep { opacity: 0.55; }
  strong {
    color: var(--dash-ink);
    font-weight: 600;
    font-size: 12.5px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 640px) {
    .root { display: none; }
    .sep { display: none; }
  }
`;

const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
  border: 1px solid transparent;
  position: relative;
  &:hover { background: var(--dash-panel-2); color: var(--dash-ink); border-color: var(--dash-line); }
  svg { width: 16px; height: 16px; }
`;

const CommandTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 9px 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dash-line);
  background: var(--dash-panel);
  color: var(--dash-faint);
  font-size: 12px;
  min-width: 190px;
  text-align: left;
  svg { width: 14px; height: 14px; }
  .keys {
    margin-left: auto;
    display: flex;
    gap: 3px;
    kbd {
      font-family: inherit;
      font-size: 9.5px;
      border: 1px solid var(--dash-line);
      border-radius: 4px;
      padding: 1px 4px;
      color: var(--dash-muted);
      background: var(--dash-panel-2);
    }
  }
  &:hover { border-color: rgba(233, 166, 78, 0.35); color: var(--dash-muted); }
  @media (max-width: 720px) {
    min-width: 0;
    width: 34px;
    padding: 0;
    justify-content: center;
    .placeholder, .keys { display: none; }
  }
`;

const Dot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 99px;
  background: var(--dash-accent);
  color: var(--dash-accent-ink);
  font-size: 8.5px;
  font-weight: 700;
  display: grid;
  place-items: center;
  border: 2px solid var(--dash-bg);
`;

const AvatarBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px 0 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  color: var(--dash-muted);
  &:hover { background: var(--dash-panel-2); border-color: var(--dash-line); }
  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: var(--dash-accent-soft);
    color: var(--dash-accent);
    font-size: 11px;
    font-weight: 700;
  }
  .who { text-align: left; line-height: 1.2; }
  .who strong { display: block; font-size: 11.5px; color: var(--dash-ink); font-weight: 600; }
  .who span { display: block; font-size: 9.5px; color: var(--dash-faint); }
  svg { width: 13px; height: 13px; }
  @media (max-width: 860px) {
    .who, svg { display: none; }
  }
`;

const Content = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 26px 30px 54px;
  @media (max-width: 1080px) {
    padding: 22px 20px 48px;
  }
  @media (max-width: 640px) {
    padding: 18px 14px 42px;
  }
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 65;
  background: rgba(3, 5, 4, 0.62);
  backdrop-filter: blur(2px);
  @media (min-width: 1081px) {
    display: none;
  }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(-4px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Popover = styled.div`
  position: absolute;
  top: 44px;
  right: 0;
  z-index: 90;
  width: ${(p) => (p.$wide ? '340px' : '230px')};
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 12px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: ${popIn} 0.14s ease;
  .pop-head {
    padding: 12px 14px;
    border-bottom: 1px solid var(--dash-line);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dash-faint);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pop-item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 9px 14px;
    font-size: 12.5px;
    color: var(--dash-muted);
    text-align: left;
    &:hover { background: var(--dash-panel-2); color: var(--dash-ink); }
    svg { width: 14px; height: 14px; }
  }
  .pop-empty { padding: 20px 14px; font-size: 12px; color: var(--dash-faint); text-align: center; }
  .divider { height: 1px; background: var(--dash-line); }
`;

const AlertRow = styled(Link)`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child { border-bottom: 0; }
  &:hover { background: var(--dash-panel-2); }
  .ic {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--dash-panel-2);
    color: var(--dash-accent);
    svg { width: 14px; height: 14px; }
  }
  .txt { min-width: 0; }
  strong { display: block; font-size: 12px; font-weight: 600; color: var(--dash-ink); }
  span { display: block; font-size: 10.5px; color: var(--dash-faint); margin-top: 2px; }
`;

const PalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 140;
  background: rgba(3, 5, 4, 0.72);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 16px 20px;
`;

const PalCard = styled.div`
  width: 100%;
  max-width: 560px;
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 14px;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  .searchline {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border-bottom: 1px solid var(--dash-line);
    svg { width: 16px; height: 16px; color: var(--dash-faint); }
    input {
      flex: 1;
      height: 50px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--dash-ink);
      font-size: 13.5px;
      &::placeholder { color: var(--dash-faint); }
    }
    kbd {
      font-family: inherit;
      font-size: 9.5px;
      border: 1px solid var(--dash-line);
      border-radius: 4px;
      padding: 2px 5px;
      color: var(--dash-muted);
    }
  }
  .results { max-height: 48vh; overflow-y: auto; padding: 6px; }
  .group-label {
    padding: 8px 9px 4px;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dash-faint);
  }
  .result {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 8px 9px;
    border-radius: 7px;
    font-size: 12.5px;
    color: var(--dash-muted);
    text-align: left;
    svg { width: 15px; height: 15px; color: var(--dash-faint); }
    &.active {
      background: var(--dash-panel-2);
      color: var(--dash-ink);
      svg { color: var(--dash-accent); }
    }
  }
  .hint { padding: 8px 12px; border-top: 1px solid var(--dash-line); font-size: 10px; color: var(--dash-faint); display: flex; gap: 10px; }
`;

function useLocalState(key, initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch {
      // ignore storage failures
    }
  }, [key]);
  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore storage failures
        }
        return resolved;
      });
    },
    [key]
  );
  return [value, update];
}

function initials(name) {
  return String(name || 'Owner')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function DashboardShell({ owner, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useLocalState('rooteco:dash:collapsed', false);
  const [closedGroups, setClosedGroups] = useLocalState('rooteco:dash:groups', []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const paletteInputRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setUserOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  useEffect(() => {
    let active = true;
    const load = () =>
      getDashboardStats()
        .then((payload) => {
          if (active) setStats(payload.data);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 120000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        setPaletteQuery('');
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false);
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (paletteOpen) setTimeout(() => paletteInputRef.current?.focus(), 20);
  }, [paletteOpen]);

  useEffect(() => {
    const onClick = (event) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (userOpen && userRef.current && !userRef.current.contains(event.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [notifOpen, userOpen]);

  const alerts = useMemo(() => {
    if (!stats?.counts) return [];
    const rows = [];
    if (stats.counts.pendingOrders) {
      rows.push({
        href: '/dashboard/orders',
        icon: ShoppingBag,
        title: `${stats.counts.pendingOrders} order${stats.counts.pendingOrders === 1 ? '' : 's'} awaiting confirmation`,
        meta: 'Review payment and dispatch',
      });
    }
    if (stats.counts.activeLeads) {
      rows.push({
        href: '/dashboard/leads',
        icon: Users,
        title: `${stats.counts.activeLeads} active lead${stats.counts.activeLeads === 1 ? '' : 's'}`,
        meta: 'Follow up before they go cold',
      });
    }
    if (stats.counts.newQuotes) {
      rows.push({
        href: '/dashboard/quotes',
        icon: Package,
        title: `${stats.counts.newQuotes} new quote request${stats.counts.newQuotes === 1 ? '' : 's'}`,
        meta: 'Prepare a quotation',
      });
    }
    if (stats.counts.lowStock) {
      rows.push({
        href: '/dashboard/products',
        icon: Boxes,
        title: `${stats.counts.lowStock} product${stats.counts.lowStock === 1 ? '' : 's'} low on stock`,
        meta: 'Restock before orders come in',
      });
    }
    return rows;
  }, [stats]);

  const title = useMemo(() => {
    if (pathname.startsWith('/dashboard/pages/') && pathname.endsWith('/sections')) return 'Page sections';
    if (pathname.startsWith('/dashboard/pages/')) return 'Page builder';
    if (pathname.startsWith('/dashboard/clients/')) return 'Customer profile';
    if (pathname.startsWith('/dashboard/website/settings')) return 'Website settings';
    const match = Object.keys(PAGE_TITLES)
      .filter((key) => key !== '/dashboard' && pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];
    return PAGE_TITLES[match] || PAGE_TITLES[pathname] || 'Dashboard';
  }, [pathname]);

  const flatNav = useMemo(() => NAV.flatMap((group) => group.items.map((item) => ({ ...item, group: group.group }))), []);

  const results = useMemo(() => {
    const needle = paletteQuery.trim().toLowerCase();
    const items = needle
      ? flatNav.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(needle))
      : flatNav;
    return items.slice(0, 12);
  }, [flatNav, paletteQuery]);

  const isActive = useCallback(
    (item) => {
      if (item.exact) return pathname === item.href;
      if (item.href === '/dashboard/website') return pathname === '/dashboard/website';
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    },
    [pathname]
  );

  const toggleGroup = (group) => {
    setClosedGroups((prev) => (prev.includes(group) ? prev.filter((name) => name !== group) : [...prev, group]));
  };

  const go = (href) => {
    setPaletteOpen(false);
    router.push(href);
  };

  const onPaletteKey = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setPaletteIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setPaletteIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && results[paletteIndex]) {
      event.preventDefault();
      go(results[paletteIndex].href);
    }
  };

  async function logout() {
    setLoggingOut(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Even if the network fails, return to login; the session cookie clears server-side.
    }
    router.replace('/login');
    router.refresh();
  }

  return (
    <ToastProvider>
      <Shell className="dashboard-theme">
        {mobileOpen && <Scrim onClick={() => setMobileOpen(false)} />}
        <Sidebar $collapsed={collapsed} $open={mobileOpen}>
          <BrandRow>
            <Link href="/dashboard" className="mark" aria-label="RootEco dashboard">
              <Image src="/images/rooteco-logo.png" alt="RootEco" width={34} height={34} style={{ objectFit: 'contain' }} />
            </Link>
            {!collapsed && (
              <div className="name">
                <strong>RootEco</strong>
                <span>Owner console</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="mobile-only"
              style={{ marginLeft: 'auto', color: 'var(--dash-muted)', display: 'none' }}
            >
              <X size={18} />
            </button>
          </BrandRow>

          <NavScroll>
            {NAV.map((group, groupIndex) => {
              const closed = closedGroups.includes(group.group);
              if (collapsed) {
                return (
                  <Group key={group.group}>
                    {groupIndex > 0 && <div style={{ height: 1, background: 'var(--dash-line-soft)', margin: '9px 8px' }} />}
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavItem key={item.href} href={item.href} $active={isActive(item)} $collapsed title={item.label}>
                          <Icon />
                          <span className="label">{item.label}</span>
                        </NavItem>
                      );
                    })}
                  </Group>
                );
              }
              return (
                <Group key={group.group}>
                  {group.collapsible === false ? (
                    <GroupToggle $collapsed={collapsed} $closed={false} style={{ cursor: 'default' }} as="div">
                      <span>{group.group}</span>
                    </GroupToggle>
                  ) : (
                    <GroupToggle
                      type="button"
                      $collapsed={collapsed}
                      $closed={closed}
                      onClick={() => toggleGroup(group.group)}
                      aria-expanded={!closed}
                    >
                      <span>{group.group}</span>
                      <ChevronDown />
                    </GroupToggle>
                  )}
                  {!closed &&
                    group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item);
                      const count =
                        item.href === '/dashboard/orders'
                          ? stats?.counts?.pendingOrders
                          : item.href === '/dashboard/leads'
                            ? stats?.counts?.activeLeads
                            : item.href === '/dashboard/quotes'
                              ? stats?.counts?.newQuotes
                              : 0;
                      return (
                        <NavItem
                          key={item.href}
                          href={item.href}
                          $active={active}
                          $collapsed={collapsed}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon />
                          <span className="label">{item.label}</span>
                          {count ? <span className="count">{count > 99 ? '99+' : count}</span> : null}
                        </NavItem>
                      );
                    })}
                </Group>
              );
            })}
          </NavScroll>

          <SidebarFoot $collapsed={collapsed}>
            <Link href="/dashboard/help" className="help">
              <LifeBuoy />
              {!collapsed && <span>Help centre</span>}
            </Link>
            <Link href="/" target="_blank" rel="noreferrer" className="help">
              <Store />
              {!collapsed && <span>View storefront</span>}
              {!collapsed && <ExternalLink size={12} style={{ marginLeft: 'auto' }} />}
            </Link>
            {!collapsed && <div className="version">RootEco v2 · Owner</div>}
          </SidebarFoot>
        </Sidebar>

        <Main $collapsed={collapsed}>
          <Topbar>
            <IconBtn type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" style={{ display: 'none' }} className="mobile-menu">
              <Menu />
            </IconBtn>
            <IconBtn
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="desktop-collapse"
            >
              <Menu />
            </IconBtn>
            <Crumb>
              <span className="root">Owner console</span>
              <span className="sep">/</span>
              <strong>{title}</strong>
            </Crumb>
            <div style={{ flex: 1 }} />
            <CommandTrigger type="button" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
              <Command />
              <span className="placeholder">Search or jump to…</span>
              <span className="keys"><kbd>⌘</kbd><kbd>K</kbd></span>
            </CommandTrigger>
            <IconBtn as="a" href="/" target="_blank" rel="noreferrer" aria-label="View storefront" title="View storefront">
              <ExternalLink />
            </IconBtn>
            <div style={{ position: 'relative' }} ref={notifRef}>
              <IconBtn type="button" onClick={() => setNotifOpen((open) => !open)} aria-label="Notifications">
                <Bell />
                {alerts.length > 0 && <Dot>{alerts.length}</Dot>}
              </IconBtn>
              {notifOpen && (
                <Popover $wide>
                  <div className="pop-head">
                    <span>Attention needed</span>
                    <Link href="/dashboard" style={{ color: 'var(--dash-accent)', fontSize: 10.5 }}>Open overview</Link>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="pop-empty">You are all caught up.</div>
                  ) : (
                    alerts.map((alert) => {
                      const Icon = alert.icon;
                      return (
                        <AlertRow key={alert.title} href={alert.href} onClick={() => setNotifOpen(false)}>
                          <span className="ic"><Icon /></span>
                          <span className="txt">
                            <strong>{alert.title}</strong>
                            <span>{alert.meta}</span>
                          </span>
                        </AlertRow>
                      );
                    })
                  )}
                </Popover>
              )}
            </div>
            <div style={{ position: 'relative' }} ref={userRef}>
              <AvatarBtn type="button" onClick={() => setUserOpen((open) => !open)} aria-label="Account menu">
                <span className="avatar">{initials(owner?.name || owner?.email)}</span>
                <span className="who">
                  <strong>{owner?.name || 'Owner'}</strong>
                  <span>{owner?.email || ''}</span>
                </span>
                <ChevronDown />
              </AvatarBtn>
              {userOpen && (
                <Popover>
                  <div className="pop-head">{owner?.email || 'Owner account'}</div>
                  <Link href="/dashboard/security" className="pop-item" onClick={() => setUserOpen(false)}>
                    <ShieldCheck /> Account security
                  </Link>
                  <Link href="/dashboard/help" className="pop-item" onClick={() => setUserOpen(false)}>
                    <BookOpen /> Help centre
                  </Link>
                  <div className="divider" />
                  <button type="button" className="pop-item" onClick={logout} disabled={loggingOut}>
                    <LogOut /> {loggingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </Popover>
              )}
            </div>
          </Topbar>
          <Content>{children}</Content>
        </Main>

        {paletteOpen && (
          <PalOverlay onMouseDown={(event) => event.target === event.currentTarget && setPaletteOpen(false)}>
            <PalCard role="dialog" aria-modal="true" aria-label="Command palette">
              <div className="searchline">
                <Search />
                <input
                  ref={paletteInputRef}
                  value={paletteQuery}
                  onChange={(event) => {
                    setPaletteQuery(event.target.value);
                    setPaletteIndex(0);
                  }}
                  onKeyDown={onPaletteKey}
                  placeholder="Search dashboard, pages and actions…"
                  aria-label="Search dashboard"
                />
                <kbd>ESC</kbd>
              </div>
              <div className="results">
                {results.length === 0 ? (
                  <div style={{ padding: '26px 12px', textAlign: 'center', color: 'var(--dash-faint)', fontSize: 12.5 }}>
                    <SearchX size={20} style={{ marginBottom: 6 }} />
                    <div>No matching destination.</div>
                  </div>
                ) : (
                  results.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        className={`result${index === paletteIndex ? ' active' : ''}`}
                        onMouseEnter={() => setPaletteIndex(index)}
                        onClick={() => go(item.href)}
                      >
                        <Icon />
                        <span>{item.label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--dash-faint)' }}>{item.group}</span>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="hint">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>⌘K toggle</span>
              </div>
            </PalCard>
          </PalOverlay>
        )}
      </Shell>
      <style jsx global>{`
        @media (max-width: 1080px) {
          .mobile-menu {
            display: inline-flex !important;
          }
          .desktop-collapse {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </ToastProvider>
  );
}
