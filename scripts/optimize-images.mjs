#!/usr/bin/env node
// Bild-Optimierung — läuft automatisch vor jedem Build (auch auf Vercel, siehe package.json).
//
// 1) Originale in public/assets/uploads + public/assets/works werden IN PLACE verkleinert:
//    max. 1600 px lange Kante, JPEG-Qualität 82, EXIF-Drehung eingebacken, Metadaten entfernt.
//    → iPhone-Fotos aus dem CMS (3–5 MB, 4000 px) werden ~200–400 KB. Bereits kleine Bilder
//      bleiben unangetastet (idempotent).
// 2) Thumbnails (max. 900 px) nach public/assets/thumbs/<uploads|works>/… für die Galerie-Kacheln.
//    Vollbild (Lightbox) nutzt weiterhin das Original.
//
// Manuell: `npm run images`
import sharp from 'sharp';
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['uploads', 'works'];
const ASSETS = path.join(ROOT, 'public/assets');
const THUMBS = path.join(ASSETS, 'thumbs');
const MAX_FULL = 1600;
const MAX_THUMB = 900;
const MAX_BYTES = 600 * 1024;
const IMG = /\.(jpe?g|png|webp)$/i;

const fmt = (n) => `${(n / 1024).toFixed(0)} KB`;

function encode(pipeline, file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return pipeline.png({ compressionLevel: 9, palette: false });
  if (ext === '.webp') return pipeline.webp({ quality: 82 });
  return pipeline.jpeg({ quality: 82, mozjpeg: true });
}

async function shrinkInPlace(file) {
  const { size } = await stat(file);
  const meta = await sharp(file).metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);
  const hasExifRotation = (meta.orientation || 1) !== 1;
  if (longest <= MAX_FULL && size <= MAX_BYTES && !hasExifRotation) return null;

  const buf = await encode(
    sharp(file).rotate().resize({ width: MAX_FULL, height: MAX_FULL, fit: 'inside', withoutEnlargement: true }),
    file,
  ).toBuffer();
  // Nur schreiben, wenn es sich lohnt — sonst würde ein bereits optimiertes Bild bei jedem Build
  // erneut kodiert und Qualität verlieren.
  if (longest <= MAX_FULL && !hasExifRotation && buf.length > size * 0.85) return null;
  await writeFile(file, buf);
  return `${fmt(size)} → ${fmt(buf.length)}`;
}

async function thumb(file, dir) {
  const out = path.join(THUMBS, dir, path.basename(file));
  await mkdir(path.dirname(out), { recursive: true });
  await encode(
    sharp(file).rotate().resize({ width: MAX_THUMB, height: MAX_THUMB, fit: 'inside', withoutEnlargement: true }),
    file,
  ).toFile(out);
}

let shrunk = 0, thumbs = 0, failed = 0;
for (const dir of DIRS) {
  const abs = path.join(ASSETS, dir);
  let files = [];
  try { files = (await readdir(abs)).filter((f) => IMG.test(f)); } catch { continue; }
  for (const f of files) {
    const file = path.join(abs, f);
    try {
      const r = await shrinkInPlace(file);
      if (r) { shrunk++; console.log(`  ↓ ${dir}/${f}: ${r}`); }
      await thumb(file, dir);
      thumbs++;
    } catch (e) {
      failed++;
      console.warn(`  ! ${dir}/${f}: ${e.message}`);
    }
  }
}
console.log(`optimize-images: ${shrunk} verkleinert, ${thumbs} Thumbnails, ${failed} Fehler`);
