// Single source of truth for all page content.
// CMS-editable data lives in the JSON files (Sveltia commits to them);
// UI strings live in ui.js (dev-managed). I18N merges both per language.
import siteData from './site.json';
import werkeData from './werke.json';
import vitaData from './vita.json';
import exhibitionsData from './exhibitions.json';
import partnersData from './partners.json';
import textsData from './texts.json';
import { UI } from './ui.js';

export const SITE = siteData;
export const MALEREI = werkeData.malerei;
export const KERAMIK = werkeData.keramik;
export const EX_SOLO = exhibitionsData.solo;
export const EX_GROUP = exhibitionsData.group;
export const PARTNERS = partnersData.partners;

export const LANGS = ['de', 'en', 'fr', 'it'];
export const DEFAULT_LANG = 'de';

const pick = (v, fallback) => (v && String(v).trim() ? v : fallback);

// Merged per-language dictionary consumed by the data-i18n switcher.
export const I18N = Object.fromEntries(
  LANGS.map((lang) => {
    const texts = textsData[lang] || textsData[DEFAULT_LANG];
    return [
      lang,
      {
        ...UI[lang],
        ...Object.fromEntries(
          Object.entries(texts).map(([k, v]) => [k, pick(v, textsData[DEFAULT_LANG][k])])
        ),
        vita: vitaData.vita.map((v) => ({ y: v.y, x: pick(v[lang], v.de) })),
        partners: PARTNERS.map((p) => ({
          tag: pick(p[`tag_${lang}`], p.tag_de),
          desc: pick(p[`desc_${lang}`], p.desc_de),
        })),
      },
    ];
  })
);

export const T = I18N[DEFAULT_LANG]; // German build-time render

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
export const roman = (i) => ROMAN[i] || String(i + 1);

// The Werke hero orbit derives from the works themselves — no extra CMS fields.
const img = (w) => w && w.image;
export const ORBIT_CENTER = img(KERAMIK[0]) || img(MALEREI[0]);
export const ORBIT_ITEMS = [
  img(MALEREI[0]), img(KERAMIK[1]), img(MALEREI[1]), img(KERAMIK[2]), img(KERAMIK[4] || KERAMIK[3] || MALEREI[2]),
].filter(Boolean).slice(0, 5);
