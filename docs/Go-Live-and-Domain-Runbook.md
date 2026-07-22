# Go-Live & Domain Runbook — Unö

The locked-in process for putting Unö online and wiring its domain. Follow this
instead of re-deriving it. Companion to `DEPLOY.md` (which covers the first
deploy in plain terms); this file is the canonical, repeatable procedure and
includes the browser-agent prompt.

## The shape of it

- **Host:** Render, provisioned from `render.yaml` (Blueprint). Three resources:
  `uno-db` (Postgres/PostGIS), `uno-api` (NestJS), `uno-web` (Expo web static).
- **Domain:** `myunoapp.com`, registered at Namecheap.
  - **Canonical home:** the **apex** `myunoapp.com` → `uno-web`.
  - **`www`:** 301-redirects to the apex via a Namecheap **URL Redirect Record**
    (not served by Render).
  - **API:** `api.myunoapp.com` → `uno-api`.
- **Config source of truth:** `render.yaml`. It already declares the custom
  domains, points the web build at `https://api.myunoapp.com/api/v1`
  (`EXPO_PUBLIC_API_URL`), and locks `CORS_ORIGINS` to the live web origins.
  Changing the domain = change it here, not in the dashboard.

## DNS records (Namecheap → myunoapp.com → Advanced DNS)

Delete Namecheap's default `CNAME @ → parkingpage.namecheap.com` and any URL
Redirect on `@` first. Then:

| Type | Host | Value | Notes |
|------|------|-------|-------|
| A Record | `@` | `216.24.57.1` | Render's apex IP — always confirm against `uno-web` → Custom Domains |
| CNAME Record | `api` | `‹uno-api host›.onrender.com` | Copy the exact target from `uno-api` → Custom Domains |
| URL Redirect Record | `www` | `https://myunoapp.com` | Permanent (301), Unmasked |

Render's **Settings → Custom Domains** panel on each service is the source of
truth for the exact target values and any TXT verification record. Domains flip
to **Verified** and auto-get SSL once DNS propagates (minutes to ~1 hr).

> `www` HTTPS note: Namecheap auto-provisions SSL for URL Redirect records, but
> `https://www` may briefly warn until it finishes. If it lingers, point `www`
> at Render with a CNAME instead (add `www.myunoapp.com` back to `uno-web`'s
> `domains:` in `render.yaml`).

## First deploy (only needed once)

Render → **New → Blueprint → select `enechi-njeze/Uno-App` → name it `uno` →
Deploy Blueprint.** This creates all three services and attaches the domains
declared in `render.yaml`. After that, **every push to `main` auto-deploys** —
no manual step. (If the repo is private, authorize Render's GitHub access when
prompted; that is separate from the Claude GitHub App.)

## Guardrails for automated / browser-driven execution

An agent may click through the deploy and DNS saves. It must **stop and hand
back** only for: a login screen, a 2FA / identity ("sudo mode") check, or a
payment/billing prompt. It must never enter or request passwords, codes, or card
details. Account-permission changes (e.g. granting an app repo access) are always
the human's to perform.

## Reusable browser-agent prompt (Claude for Chrome)

Paste this to drive the whole thing. It assumes the operator completes any
login/2FA/payment steps themselves.

```
Wire the domain myunoapp.com end to end. You may click the buttons that commit
these changes (deploy the blueprint, save the DNS records). STOP and hand back
only for a login screen, a 2FA / identity check, or a payment/billing prompt.
Never enter or ask for my passwords, codes, or card details. Report after each part.

PART 0 — Deploy the Render blueprint:
1. Render → New + → Blueprint → select repo enechi-njeze/Uno-App.
2. Set Blueprint Name: uno. Confirm the plan lists exactly uno-db, uno-api,
   uno-web (and the domain adds). If anything else appears, STOP and describe it.
3. Click Deploy Blueprint. Wait for builds (uno-api runs migrations + seeds).
4. Report the uno-api and uno-web onrender.com URLs and whether uno-api's
   /api/v1/health is green.

PART A — Read exact DNS targets (source of truth = Render):
5. uno-api → Settings → Custom Domains → copy the record for api.myunoapp.com
   (CNAME to ‹...›.onrender.com), verbatim.
6. uno-web → Settings → Custom Domains → copy the record for myunoapp.com
   (A record IP, plus any TXT), verbatim.

PART B — Enter + save DNS in Namecheap:
7. Namecheap → Domain List → myunoapp.com → Manage → Advanced DNS.
8. Delete the default "CNAME @ parkingpage.namecheap.com" and any URL Redirect on @.
9. Add, using the exact values from Part A:
   - A Record            | @   | <apex IP, e.g. 216.24.57.1>          | Automatic
   - CNAME Record        | api | <uno-api onrender target>            | Automatic
   - URL Redirect Record | www | https://myunoapp.com | Permanent (301) | Unmasked
   - Any TXT verification record Render showed in step 6.
10. Click Save All Changes.

PART C — Report back the full final zone (type/host/value) and each domain's
Render status (Verified / Issuing / pending).
```

## Verify it's live

- `https://myunoapp.com` loads the app.
- `https://www.myunoapp.com` 301-redirects to the apex.
- `https://api.myunoapp.com/api/v1/health` returns OK.
- Render Custom Domains show **Verified** with SSL issued.
