# Reference notes — what QELITE inherits

QELITE started from the Mishra and Associates codebase (same agency, Code Hyphen; same client). The Mishra-specific pages, data and images were removed. These notes record what was kept, what changed, and what we learned from MQA Certification, the site the client pointed to.

## 1. Kept from Mishra and Associates

### Architecture (unchanged)
- **client/**: React 18 + Vite + Tailwind + React Router + react-helmet-async, on Vercel. Every public route is prerendered to static HTML at build time (`scripts/prerender.mjs`) and hydrated in the browser.
- **server/**: Node + Express + MongoDB (Mongoose), on Render. Handles auth (JWT in an httpOnly cookie, lockout after 5 failed attempts, CSRF header), content drafts and publishing, the form inbox, the media library (Cloudinary), users and the audit log.
- **shared/schema.js**: one content model. It drives the admin forms, the API validation and the build-time validation. Add a field there and the admin form appears automatically.
- **Publish flow**: an editor saves drafts and presses **Publish**. The API stores a versioned snapshot and calls the Vercel deploy hook. The build fetches and validates the snapshot, then bundles it into the site. If anything fails, the previous deployment stays live. Every publish can be rolled back.
- **Fallbacks**: every value is merged field by field over the defaults in `client/src/data/` (`lib/content.js → conform()`). Every page section sits in an error boundary (`SafeSection`). `[Bracketed]` text is a placeholder: it is hidden on the live site and highlighted in Review mode.

### Design language (kept as the agency's "feel")
- Serif display headlines with italic accent words. Sans body text. Generous whitespace. `max-w-site` (80rem) container.
- Pill buttons with a 1 px outline that lift onto a solid "edge" on hover (`.btn-*` in `index.css`).
- Sticky white header with a hover mega-menu on desktop and a right-hand drawer on mobile. Ctrl/⌘+K opens site search.
- Inner pages open with a textured hero band and breadcrumbs (`PageHero`).
- Alternating sections (white, dark ink, textured), scroll-reveal, and `prefers-reduced-motion` respected.
- Footer: a contact column, link columns, then a bottom bar with **Team login** and **"Designed & developed by Code Hyphen"** (codehyphen.in).
- Colours are RGB channels on `:root` (`index.css`), mapped in `tailwind.config.js`, so a re-theme touches one file.

### What changed for QELITE
- **New palette and type.** Deep navy ink with a "verified" emerald and a mint seal accent replaces Mishra's warm peppercorn and gold. Instrument Serif (display), Geist (text) and Geist Mono (certificate numbers) replace Newsreader and Hanken Grotesk.
- **New content model** (`shared/schema.js`): settings, menus, home, standards, accreditation, certificate template, about, FAQs, pages & SEO, legal and form settings.
- **New: certificate register.** This is a runtime database feature and is never part of the build snapshot (see section 3).
- **Removed:** tenders, trademark search, compliance calendar, notifications, news, blog, countries and the newsletter, along with their API form types.
- **AI crawlers:** the client is wary of AI, so `robots.txt` blocks AI-training crawlers and no `llms.txt` is generated. Ordinary search engines are allowed. The project has no AI services or SDKs.

## 2. MQA Certification (mqacertification.com): what the client means by "similar"

- **Menu:** Home · About · Services (≈8–25 standards) · Accreditation · Verify Clients · Contact.
- **Home:** banner, about blurb, six service cards, counters, a testimonial, a newsletter box.
- **Verify Clients (`/verify/`):** a "Search Certificate" box. You enter a certificate number and see the record or the certificate file.
- **Accreditation page:** text about the accreditor, impartiality and use of marks.
- **Weaknesses we avoid:** it is a generic WordPress theme, it has typos, the menus disagree with the home page, the counters are empty, accreditation claims can't be checked, and verification shows no clear status.

## 3. Certificate design (ReferencePDFDesigns/*.pdf)

All three are A4 portrait, made in Word, and use the same layout:
1. The issuer's logo, top centre, with a globe watermark top left.
2. A script title: "Certificate of Registration" (ISO 9001, ISO 45001) or "Certificate of Compliance" (ISO 13485).
3. "This is to certify that", then the **organisation name** (large bold serif) and the **address** (small caps, bold).
4. "Has been assessed and certified by … As meeting the requirements of:"
5. The **standard** (e.g. ISO 9001:2015) in large type, then the **standard title** in brackets.
6. "For the Following Scope of Activities:", then the **scope** in bold caps.
7. **:: Certificate No ::** prefix/number (e.g. QMS/26M07667, OHSAS/2607668, MDQMS/26M07669).
8. A dates table:
   - Date of initial registration
   - First surveillance on or before (+1 year − 1 day)
   - Second surveillance on or before (+2 years − 1 day)
   - Re-certification due (+3 years − 1 day)
9. "This certificate is property of … and remains valid subject to satisfactory surveillance audits."
10. Signature, "Authorized Signatory", the issuer's name and address. Accreditation seals at the bottom right, with the accreditation code.
11. "To check validity of the certificate please visit …", then the accreditation disclaimer.

QELITE renders this same structure in its own branding (`client/src/components/certificate/CertificateDocument.jsx`). MQA's logo, name, address and accreditation marks are not reused. Accreditation details are placeholders until the client provides real ones.

## 4. Data-safety decisions (client asked for minimal exposure)

- Certificates live only in MongoDB and are never bundled into the website build. Each lookup is a rate-limited API call that matches one **exact** certificate number. There is no listing, no search by company name, and no autocomplete, so nobody can enumerate the client list.
- Certificate PDFs are stored in MongoDB, not on a public CDN. They are served only through the verification endpoint, and only while the certificate is **valid**.
- The admin panel is a separate lazy-loaded chunk, marked noindex, behind a sign-in with lockout.
- The 10–15 real certificates are entered only after go-live, directly in the production admin panel. The development database holds sample data only.
