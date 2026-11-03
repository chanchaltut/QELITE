# QELITE — Website & Certificate Register

The public website, admin panel and online certificate register for QELITE (www.qelite.com), a management system certification body. Built by Code Hyphen for Mishra and Associates.

## What it does
- **Website**: home, certification programmes (one page per standard), accreditation & policies, about, contact & quotes, FAQs and legal pages. All of it is editable from the admin panel.
- **Certificate verification (`/verify`)**: a visitor enters a certificate number, or scans the QR code printed on the certificate. They see its live status (Valid, Suspended, Withdrawn or Expired), the organisation, the standard, the scope and the cycle dates, plus the certificate PDF or a digital certificate.
- **Admin panel (`/admin`)**:
  - The **certificate register**: add, edit, suspend and withdraw certificates; upload PDFs; print the QELITE certificate design; export CSV; see audits due.
  - **Website management**, the inbox and users.

## Project structure
```
client/    Website + admin panel (React, Vite, Tailwind) — Vercel (Root Directory: client)
server/    API: website management + certificate register (Node, Express, MongoDB) — Render (Root Directory: server)
shared/    schema.js (website content model) and certificates.js (certificate rules), used by both
docs/      Setup guide, admin guide, client inputs, reference notes
ReferencePDFDesigns/  The client's reference certificates (layout reference only — not deployed)
```

## Scripts (from the repository root)
```bash
npm run install:all   # installs client/ and server/ dependencies
npm run dev           # website on :5173; /api is proxied to :4000
npm run dev:server    # API on :4000 — needs server/.env (copy server/.env.example) and a MongoDB
npm run build         # client production build: fetch content → sitemap/robots → build → prerender
npm run lint
```

## How the two kinds of data work
| | Website content | Certificates |
|---|---|---|
| Edited in | Admin → Website / Certification pages / Company | Admin → Certificate register |
| Goes live | When you press **Publish** (the site rebuilds in 1–2 minutes) | **Immediately** on save |
| Stored | MongoDB, then bundled into the static site at build time | MongoDB only; never in the build |
| Read by visitors | Prerendered HTML (fast, works if the API is down) | `GET /api/public/certificates?number=…` (one exact number, rate-limited) |

### Certificate register: safety by design
- A lookup matches **one exact number**. Spaces, slashes, hyphens and letter case are ignored, so `qms 26q 00001` finds `QMS/26Q00001`. There is no listing, no search by company name and no autocomplete, and each IP is limited to 40 checks per 10 minutes. Nobody can browse the client list.
- **PDFs** are stored in MongoDB, not on a public CDN. They are served only through the verify endpoint, and only while the certificate is valid.
- **Expired** is calculated automatically from the re-certification date. **Suspended** and **Withdrawn** are set by an editor, and the website never shows the PDF for them.
- **Deleting** a certificate is owner-only. Editors withdraw a certificate instead, which keeps the public record honest.
- Every create, edit, status change and upload is written to the audit log.

### Certificate design
`client/src/components/certificate/CertificateDocument.jsx` draws the QELITE certificate as an A4 page, following the layout of the reference certificates, with a QR code to `/verify?cert=…`. Wording, signatory, signature, seals and small print are edited in Admin → Certificate design. Admin → a certificate → **Print / save as PDF** produces the printable file.

## SEO
Every public page is prerendered to static HTML with its own title, description, canonical URL and structured data (`client/scripts/prerender.mjs`). Verification results are never indexed. At the client's request, `robots.txt` blocks AI-training crawlers and no `llms.txt` is published.

## Placeholders
Any string wrapped in `[square brackets]` is a placeholder. It is hidden on the live site; turn on "Review mode" in Site settings to highlight them. What's still needed from the client is listed in **[docs/CLIENT_INPUTS.md](docs/CLIENT_INPUTS.md)**.

Deployment: **[docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** · Using the admin panel: **[docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)** · Background: **[docs/REFERENCE_NOTES.md](docs/REFERENCE_NOTES.md)**
