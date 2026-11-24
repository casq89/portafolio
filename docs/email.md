# Email (`contacto@casq89.com`)

The domain has a working address, `contacto@casq89.com`, without running a mail server. Two external services split the work, and everything is read and answered from a personal Gmail inbox.

| Service | Role | Plan |
|---|---|---|
| Cloudflare Email Routing | Receives mail for `contacto@casq89.com` and forwards it to Gmail | Free |
| Resend | Sends mail as `casq89.com`: the contact form (HTTP API) and replies from Gmail (SMTP) | Free: 100 emails/day, 3,000/month |

```
someone writes to contacto@casq89.com ──> Cloudflare Email Routing ──> Gmail
contact form ──> backend POST /api/contact ──> Resend API ──> Gmail  (Reply-To: visitor)
reply from Gmail "Send mail as" ──> Resend SMTP ──> recipient sees contacto@casq89.com
```

This repo is public: never write API keys or the contents of any `.env` here. DNS records are fine, they are public anyway.

## Cloudflare

### Email Routing

Dashboard → `casq89.com` → Email → Email Routing.

- **Destination address**: `casq89@gmail.com` (verified from the email Cloudflare sends).
- **Custom address**: `contacto@casq89.com` → Send to an email → `casq89@gmail.com`.
- Subaddressing (`contacto+tag@`) is off; it is not needed.
- The Overview tab only shows stats; it stays empty until mail arrives.

### DNS records

Dashboard → `casq89.com` → DNS → Records. In the Name field, write only the subdomain part (`send`, not `send.casq89.com`).

| Type | Name | Content | Added by |
|---|---|---|---|
| MX | `casq89.com` | Cloudflare's `route*.mx.cloudflare.net` servers | Email Routing (automatic) |
| TXT | `casq89.com` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Email Routing (automatic) |
| TXT | `resend._domainkey` | `p=MIGfMA0...` (Resend's DKIM public key, copy it from Resend) | Resend |
| CNAME | `rsend` | `rsend-sae1.forge.rmta.net`, **DNS only** | Resend |
| CNAME | `send` | `send.forge.rmta.net`, **DNS only** | Resend |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | Manual |

- The two CNAMEs must be **DNS only** (grey cloud). Cloudflare proxies new CNAMEs by default, and Resend cannot verify them if they are proxied.
- There can only be one SPF record on `casq89.com` and one `_dmarc` record.
- Before email was set up, the domain may show Cloudflare's "this domain sends no email" records (`v=spf1 -all`, an empty `*._domainkey`, `_dmarc` with `p=reject`). They block email and must not be added back.

## Resend

resend.com → Domains → `casq89.com`: all records **Verified** and **Enable Sending** on.

### API keys

All with **Sending access**, restricted to `casq89.com`:

| Name | Used by | Where it lives |
|---|---|---|
| `portafolio-local` | Local development | `backend/.env` (gitignored) |
| `portafolio-backend` | Production backend | `/etc/backend.env` on the VPS |
| `gmail-smtp` | Gmail "Send mail as" | Gmail settings |

If a key leaks, delete it in Resend → API Keys, create a new one and update only the place that used it.

## Backend (contact form)

- Route: `POST /api/contact` in `backend/src/contact.ts`, called by `frontend/src/screens/Home/components/Contact` with `fetch`.
- Sends a plain-text email from `CONTACT_FROM` to `CONTACT_TO` with `Reply-To` set to the visitor, so replying from Gmail answers them directly.
- Validates the payload, ignores bots that fill the hidden `website` honeypot field and allows at most 5 messages per IP per hour (in memory, no Redis).
- Configuration: `RESEND_API_KEY`, `CONTACT_TO`, optional `CONTACT_FROM`. Locally in `backend/.env` (copy `backend/.env.example`), in production in `/etc/backend.env` (see `docs/server.md`).

## Gmail "Send mail as" (reply as `contacto@casq89.com`)

Gmail → Settings → See all settings → Accounts and Import → Send mail as → Add another email address:

- Name: your name; Email: `contacto@casq89.com`
- SMTP server: `smtp.resend.com`, port `465` (SSL)
- Username: `resend`; Password: the `gmail-smtp` API key
- Gmail sends a confirmation code to `contacto@casq89.com`, which Email Routing forwards back to Gmail.

When replying, pick `contacto@casq89.com` in the "From" field. These emails count towards the Resend daily limit.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Form shows "Something went wrong" | Check the backend logs (`npm run dev` console locally, `journalctl -u backend -f` on the VPS) |
| `503 not_configured` / "Contact form is not configured" | `RESEND_API_KEY` or `CONTACT_TO` missing: `backend/.env` not loaded, or `/etc/backend.env` missing |
| `Resend responded 401/403` | Wrong or deleted API key, or the key is not allowed for `casq89.com` |
| `Resend responded 422` | Domain not verified in Resend, or an invalid `from` address |
| A Resend record stays "Failed" | Name typed with the domain (`send.casq89.com`), CNAME proxied (orange cloud), or DKIM value copied incompletely |
| Mail to `contacto@` never arrives | Gmail destination not verified, the routing rule is off, or the email was sent from the same Gmail (Gmail can hide it) |
| Email lands in spam | Normal at first with `p=none`; mark it "Not spam" |

## Pending

- Configure Gmail "Send mail as" (section above).
- Once everything has worked for a few weeks, tighten DMARC to `p=quarantine` and later `p=reject` to protect the domain from spoofing.
- Optionally show `contacto@casq89.com` instead of the Gmail address on the site (`frontend/src/data/portfolio.ts`).
