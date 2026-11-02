import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { slugify } from '@/lib/utils';

const MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export function mediaDriver() {
  const preferred = String(process.env.MEDIA_DRIVER || '').trim().toLowerCase();
  const cloudinaryReady = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
  const supabaseReady = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (preferred === 'cloudinary') return cloudinaryReady ? 'cloudinary' : 'local';
  if (preferred === 'supabase') return supabaseReady ? 'supabase' : 'local';
  if (cloudinaryReady) return 'cloudinary';
  if (supabaseReady) return 'supabase';
  return 'local';
}

function extensionFor(file) {
  const fromName = path.extname(file.name || '').toLowerCase();
  if (fromName && fromName.length <= 6) return fromName;
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  };
  return map[file.type] || '.bin';
}

export async function uploadImage(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('No file was provided.');
  }
  if (!IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, WebP, GIF or AVIF images are supported.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Images must be 8 MB or smaller.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionFor(file);
  const base = slugify(path.basename(file.name || 'image', path.extname(file.name || ''))) || 'image';
  const filename = `${Date.now()}-${base}${ext}`;
  const driver = mediaDriver();

  if (driver === 'local' && process.env.NODE_ENV === 'production') {
    throw new Error(
      'Media storage is not configured. Set Cloudinary or Supabase credentials for production uploads.'
    );
  }

  if (driver === 'cloudinary') {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_FOLDER || 'rooteco';
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: file.type }), filename);
    form.append('api_key', process.env.CLOUDINARY_API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message || 'Cloudinary upload failed.');
    }
    return {
      url: payload.secure_url,
      filename,
      width: payload.width || null,
      height: payload.height || null,
      size: payload.bytes || buffer.length,
      mime: file.type,
      provider: 'cloudinary',
    };
  }

  if (driver === 'supabase') {
    const bucket = process.env.SUPABASE_BUCKET || 'media';
    const objectPath = `${new Date().getFullYear()}/${filename}`;
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: buffer,
      }
    );
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Supabase storage upload failed.');
    }
    return {
      url: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`,
      filename,
      width: null,
      height: null,
      size: buffer.length,
      mime: file.type,
      provider: 'supabase',
    };
  }

  const folder = new Date().toISOString().slice(0, 7);
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${folder}/${filename}`,
    filename,
    width: null,
    height: null,
    size: buffer.length,
    mime: file.type,
    provider: 'local',
  };
}

export function storageStatus() {
  const driver = mediaDriver();
  return {
    driver,
    persistent: driver !== 'local',
    localFallback: driver === 'local',
  };
}
