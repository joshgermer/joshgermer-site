# Josh Germer — life · projects · ideas

Personal site for **joshgermer.netlify.app**. Vite + React + three.js. Static, client-side only — no backend, no accounts.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serve the built site at http://localhost:4173
```

Node 18+ (20 recommended).

## Routes

| Route | Page |
|---|---|
| `/` | Home — intro, links to Life / Projects / Companies |
| `/life` | Life overview — 5 area cards |
| `/life/finance` `/life/faith` `/life/family` `/life/friends` `/life/vision` | One page per area: summary, next step, why it matters, right now, prev/next |
| `/projects` | Projects index + ideas queue |
| `/projects/clothing-mockups` | 3D clothing mockup tool |
| `/companies` | Company concepts — stub with a template |
| anything else | 404 page |

## Editing content

- Life areas: `src/content/life.js` (title, summary, why, now[], next). Add an entry → new page appears automatically.
- Projects list: `src/content/projects.js`.
- Colors / fonts: CSS variables at the top of `src/styles.css`.

## Clothing Mockups (`src/mockup/`)

- Garments: T-shirt, Hoodie (with hood, pocket, drawstrings), Jacket (zip, collar, chest pockets).
- Color: 12 presets + custom color picker.
- Material: Cotton, Fleece, Denim, Nylon, Leather, Metallic (procedural fabric bump + shine; no image assets).
- Print: upload a logo (PNG/JPG/SVG/WebP) or type text (4 fonts, any color). Placement: Center chest, Left chest, Full front, Back. Size and position sliders.
- Viewer: drag to rotate, scroll to zoom, Spin / Front / Back, Download PNG (transparent background).
- Garment shapes live in `src/mockup/garments.js` as simple point lists (right half, mirrored) — tweak to change silhouettes.
- Uploads stay in the browser; nothing is sent anywhere or saved between visits.

## Deploy to Netlify

`netlify.toml` already sets build command `npm run build`, publish dir `dist`, Node 20, and the SPA redirect (`/*` → `/index.html`) so deep links like `/life/faith` work on refresh. `public/_redirects` does the same for drag-and-drop deploys.

### Option A — GitHub (recommended, auto-deploys on push)

1. Create a GitHub repo (e.g. `joshgermer-site`) and push this folder:
   ```bash
   git init && git add . && git commit -m "Initial site"
   git branch -M main
   git remote add origin git@github.com:<your-account>/joshgermer-site.git
   git push -u origin main
   ```
2. Netlify → **Add new site → Import an existing project → GitHub** → pick the repo.
3. Build settings auto-fill from `netlify.toml` (build `npm run build`, publish `dist`). Deploy.
4. **Site configuration → Change site name** → `joshgermer` → live at https://joshgermer.netlify.app.

### Option B — Drag and drop (no Git)

1. `npm install && npm run build`
2. Netlify → **Add new site → Deploy manually** → drag the `dist/` folder in.
3. Rename the site to `joshgermer`.
4. To update later: rebuild and drag `dist/` onto the site's **Deploys** tab.

### Option C — Netlify CLI

```bash
npm i -g netlify-cli
netlify login
netlify init            # or: netlify deploy --build --prod
```

Custom domain later (e.g. joshgermer.com): Netlify → **Domain management → Add a domain**.
