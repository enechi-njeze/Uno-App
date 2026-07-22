# Going live with Unö

This puts Unö online: a live **web link** anyone can open, backed by a real
database — using the `render.yaml` blueprint in this repo. Everything is on
**free tiers**. Nothing here needs code changes.

> Prerequisite: this repo must be on GitHub (it is, if you're reading this
> there). Deploy platforms pull the code from GitHub.

## The stack that gets created

| Piece | What it is | Free tier note |
|-------|------------|----------------|
| `uno-db` | PostgreSQL database (with PostGIS) | Free for 90 days, then a small monthly cost |
| `uno-api` | The backend (NestJS) | Sleeps after 15 min idle; wakes on first request (~30s) |
| `uno-web` | The app as a website | Always-on static site |

## Steps (about 10 minutes, mostly waiting)

1. **Create a Render account** at <https://render.com> and connect your GitHub.
2. **New → Blueprint.** Pick the `uno-app` repository. Render reads
   `render.yaml` and shows the three services above. Click **Apply**.
3. **Wait for the first build.** `uno-api` runs database migrations and seeds
   the demo listings automatically on first boot (`SEED_ON_BOOT=true`).
4. **Copy the API URL.** On the `uno-api` service page, copy its URL
   (e.g. `https://uno-api.onrender.com`).
5. **Tell the web app where the API is.** Open `uno-web` → **Environment** →
   set `EXPO_PUBLIC_API_URL` to that URL **with `/api/v1` on the end**:
   `https://uno-api.onrender.com/api/v1`. Save → it redeploys.
6. **Open `uno-web`'s URL.** That's Unö, live. Share it, open it on your phone.

## After it's live

- **Every push auto-deploys.** Once we push new work to GitHub, Render rebuilds
  automatically — so you watch it update as we build.
- **Seeing it on a phone as a real app** (not just the website) comes a bit
  later via Expo — a separate, quick step when we want the true mobile demo.

## Things to know (honest caveats)

- The free API **sleeps** when idle; the first open after a while takes ~30s to
  wake. Fine for a demo; upgrade the plan later to keep it warm.
- Uploaded photos on the free API use local disk, which resets on redeploy. The
  seeded demo images regenerate on boot. Real, persistent media moves to
  Cloudflare R2 later (the storage layer is already swappable).
- Search runs on the built-in Postgres driver in this setup. Typesense is wired
  and can be switched on (`SEARCH_DRIVER=typesense`) when we add a Typesense
  node.

## Alternative hosts

The web build (`apps/mobile` → `npm run build:web`, output `dist/`) is a plain
static site — it also drops straight onto **Vercel** or **Netlify** if you
prefer those (set `EXPO_PUBLIC_API_URL` there instead). The API can likewise run
on Railway. Render-all-in-one is just the fewest accounts.
