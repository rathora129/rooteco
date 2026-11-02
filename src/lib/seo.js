function isLocal(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(value || '').trim());
}

export function siteUrl(settings) {
  const envUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const configured = settings?.seo?.canonicalBase;
  const candidates = [envUrl, configured, vercelUrl];
  const base =
    candidates.find((value) => value && !isLocal(value)) ||
    candidates.find(Boolean) ||
    'http://localhost:3000';
  return String(base).trim().replace(/\/+$/, '');
}

export function absoluteUrl(path, settings) {
  if (!path) return siteUrl(settings);
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl(settings)}${path.startsWith('/') ? path : `/${path}`}`;
}

export function jsonLdScript(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
