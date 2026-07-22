# DOBOJO — dobojo.ch

Website von **Doris Boschung-Johner** (Malerei, Keramik & Skulptur, Atelier Kerzers).
Astro-Rebuild des Designs in `../design_handoff_dobojo_website/` — Vermillion-Poster-Ästhetik,
GSAP-Animationen, 4 Sprachen (DE/EN/FR/IT), CMS für alle Inhalte.

## Entwickeln

```bash
npm install
npm run dev        # → http://localhost:5190
npm run build      # → dist/
```

## Inhalte ändern (CMS)

**https://www.dobojo.ch/admin** → «Login with GitHub».
Alles, was Doris ändern kann:

| Bereich | Datei |
|---|---|
| Werke-Galerie (Bilder, Titel, Technik) | `src/data/werke.json` |
| Seiten-Bilder (Collage, Karten, Porträts) + Kontaktdaten | `src/data/site.json` |
| Alle Texte in 4 Sprachen | `src/data/texts.json` |
| Lebenslauf-Stationen | `src/data/vita.json` |
| Ausstellungen (einzeln/gemeinsam) | `src/data/exhibitions.json` |
| Partner*innen | `src/data/partners.json` |

Speichern im CMS = Git-Commit → Vercel baut neu → nach ~1 Minute live.
Nav-/Button-Beschriftungen sind bewusst nicht im CMS (`src/data/ui.js`).

## Einmaliges Setup (CMS-Login) — noch zu tun

1. **GitHub OAuth App** erstellen: github.com → Settings → Developer settings →
   OAuth Apps → *New OAuth App*:
   - Homepage URL: `https://www.dobojo.ch`
   - Authorization callback URL: `https://www.dobojo.ch/api/callback`
2. Client-ID + neues Client-Secret kopieren.
3. Im Vercel-Projekt `dobojo` → Settings → Environment Variables (Production + Preview):
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. Redeploy → `/admin`-Login funktioniert.
5. Doris braucht einen GitHub-Account mit Schreibrecht auf das Repo
   (Repo → Settings → Collaborators → einladen).

## Kontaktformular

Ohne Schlüssel öffnet das Formular das E-Mail-Programm (mailto).
Für direkten Versand: Gratis-Key auf [web3forms.com](https://web3forms.com) holen
(E-Mail: doris@dobojo.ch) und im CMS unter **Seiten-Bilder & Kontakt → Web3Forms-Schlüssel** eintragen.

## Custom Domain (dobojo.ch)

Sobald die Domain zeigt: in Vercel Domain hinzufügen und
`site` in `astro.config.mjs`, `base_url`/`site_url` in `public/admin/config.yml`
sowie `robots.txt` auf `https://www.dobojo.ch` umstellen. Die OAuth-App-URLs ebenfalls.

## 3D-Skulpturen (Scaniverse / Polycam → Website)

Die Keramik-Werke können ein interaktives 3D-Modell haben («3D»-Badge, drehen/zoomen in der Lightbox).

**1. Scannen** (iPhone, App «Scaniverse» oder «Polycam», Photogrammetrie-Modus):
Skulptur auf einen Hocker, weiches gleichmässiges Licht, langsam in 3 Höhen umkreisen
(Augenhöhe / schräg oben / schräg unten). Die Skulptur nie bewegen — nur du bewegst dich.

**2. Exportieren:** in der App als **GLB** exportieren und in `models-inbox/` legen
(Ordner ist gitignored — Roh-Scans sind 50–300 MB und dürfen NIE direkt ins Repo/CMS).

**3. Aufbereiten:**
```bash
npm run model -- models-inbox/scan.glb blaue-vase
```
→ komprimiert Mesh (Draco) + Texturen (WebP, max 2048px) nach
`public/assets/models/blaue-vase.glb` (typisch 2–10 MB, ~15× kleiner).

**4. Einbinden** (eines von beiden):
- committen (`git add public/assets/models/… && git push`) und im CMS beim Werk
  unter «3D-Modell» den Pfad `/assets/models/blaue-vase.glb` eintragen, **oder**
- die aufbereitete GLB direkt im CMS-Feld «3D-Modell (GLB-Datei)» hochladen.

Nach ~1 Minute ist das Werk mit 3D-Badge live.
