import { cache } from 'react';
import prisma from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

async function loadSettings() {
  let rows = [];
  try {
    rows = await prisma.setting.findMany();
  } catch {
    rows = [];
  }

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.value && typeof row.value === 'object' && !Array.isArray(row.value)) {
      settings[row.key] = { ...(DEFAULT_SETTINGS[row.key] || {}), ...row.value };
    } else {
      settings[row.key] = row.value;
    }
  }
  return settings;
}

// Layout and page components both read settings; cache() collapses them into one query per request.
export const getSettings = cache(loadSettings);

export async function updateSettings(groups) {
  const updates = [];
  for (const [key, value] of Object.entries(groups)) {
    if (value === undefined) continue;
    updates.push(
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
  }
  await prisma.$transaction(updates);
  return loadSettings();
}

export function publicSettings(settings) {
  return {
    general: settings.general,
    contact: settings.contact,
    social: settings.social,
    footer: settings.footer,
    seo: settings.seo,
    payments: settings.payments,
    whatsapp: settings.whatsapp,
    marketing: {
      ga4Id: settings.marketing.ga4Id,
      metaPixelId: settings.marketing.metaPixelId,
      googleSiteVerification: settings.marketing.googleSiteVerification,
    },
  };
}

export function whatsappHref(settings, message) {
  const digits = String(settings?.whatsapp?.number || '').replace(/\D/g, '');
  if (!digits) return null;
  const text = message || settings?.whatsapp?.message || '';
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
