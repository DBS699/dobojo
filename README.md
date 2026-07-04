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

**https://dobojo.vercel.app/admin** → «Login with GitHub».
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
   - Homepage URL: `https://dobojo.vercel.app`
   - Authorization callback URL: `https://dobojo.vercel.app/api/callback`
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
