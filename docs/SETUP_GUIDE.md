# Go-live setup — about 30 minutes

The code is complete. These steps create the accounts and connect them. Do them in this order. Each step says exactly what to copy where.

You need: the GitHub repo (pushed), access to the Vercel project, and an email address for the admin login.

---

## 1. MongoDB Atlas — database (free)

1. Sign up at **mongodb.com/atlas**. Create a **free M0** cluster. Choose provider **AWS**, region **Mumbai (ap-south-1)** or **Singapore**.
2. **Database Access** → *Add New Database User* → username `qelite-api`, click *Autogenerate Secure Password* and **copy it**.
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`). This is required because Render's free servers don't have fixed IPs.
4. **Database** → *Connect* → *Drivers* → copy the connection string. It looks like:
   ```
   mongodb+srv://qelite-api:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<db_password>` with the password from step 2. Then add the database name **`qelite`** right after `.net/`:
   ```
   mongodb+srv://qelite-api:PASSWORD@cluster0.abcde.mongodb.net/qelite?retryWrites=true&w=majority
   ```
   This is your **MONGODB_URI**.

## 2. Cloudinary — website image uploads (free, optional)

Only needed for uploading images for the website (logo, signature, seals, photos). Certificate PDFs are stored in MongoDB and do not need Cloudinary. Without it, you can paste image links instead.


1. Sign up at **cloudinary.com**.
2. Dashboard → **API Keys** (or *Programmable Media → Dashboard*) → copy the **API environment variable**. It looks like `cloudinary://123456789:abcDEF...@your-cloud-name`. This is your **CLOUDINARY_URL**. Copy it without the `CLOUDINARY_URL=` prefix.

## 3. Render — the API server

1. Sign up at **render.com** with GitHub.
2. **New → Web Service** → select this repository, with these settings (or use **New → Blueprint**, which reads them from `render.yaml`):
   | Setting | Value |
   |---|---|
   | Root Directory | leave blank (the API needs the `shared` folder, and Render hides anything outside the root directory) |
   | Build Command | `npm ci --prefix server` |
   | Start Command | `npm start --prefix server` |
   | Health Check Path | `/api/health` |
3. **Environment** — add:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | from step 1 |
   | `JWT_SECRET` | press *Generate*, or 40+ random letters and digits |
   | `ADMIN_EMAIL` | the email you'll sign in with |
   | `ADMIN_PASSWORD` | a strong password (10+ characters). You can change it later in the admin panel. |
   | `CLOUDINARY_URL` | from step 2 |
   | `NODE_ENV` | `production` |
   | `NODE_VERSION` | `22` |
   | `SITE_URL` | `https://www.qelite.com` |
4. Deploy. The first deploy takes 2–4 minutes.
5. Open **`https://qelite-api.onrender.com/api/health`**. It should show `{"ok":true,"db":"connected"}`.
   - If the service URL is different (shown at the top of the service page), use that URL everywhere below. Also put it in **`client/vercel.json`** (first line under `rewrites`) and commit.
   - If health shows an error, open the service's **Logs**. They say exactly which setting is wrong.

On its first start, the API copies all current website content into the database and creates your admin account.

## 4. Vercel — connect the website

In the Vercel project:

1. **Settings → Build and Deployment → Root Directory** → `client` (Framework: Vite). Save.
2. **Settings → Environment Variables** → add **`CONTENT_API_URL`** = `https://qelite-api.onrender.com` (Production + Preview).
   - **Deploying the website before the API?** Set `CONTENT_API_URL` = `builtin` for now. The site then builds with its built-in content, and the build doesn't fail because the API is missing. Change it to the Render URL once step 3 is done; until then the Verify page, forms and admin panel won't work.
3. **Settings → Git → Deploy Hooks** → name `admin-publish`, branch `main` → **Create** → copy the URL.
4. Back in **Render → your service → Environment** → add **`VERCEL_DEPLOY_HOOK_URL`** = that URL → *Save changes* (Render restarts the API).
5. **Vercel → Deployments** → on the latest deployment, click **⋯ → Redeploy**. Or push any commit.
6. **Settings → Domains** → keep `www.qelite.com` as the primary domain, with `qelite.com` redirecting to it. If the website address ever changes, update it in the same three places: Vercel domains, admin → *Site settings → Website address*, and `SITE_URL` on Render.

## 5. Test it (2 minutes)

1. Open **https://www.qelite.com/admin** and sign in.
2. **Site settings** → turn on the *Announcement bar*, type a message → **Save changes** → **Publish** (top right).
3. Wait for *"Your changes are live on the website"* (about 1–2 minutes). Check the site, then turn the bar off and publish again.
4. Submit the **Contact** form on the website. It appears in **Inbox**.
5. **Certificate register:** add a test certificate (e.g. number `TEST/0001`), open `https://www.qelite.com/verify?cert=TEST/0001`, and check that it shows as valid. Then delete it (owner account) before entering the real certificates.

## 6. Keep the API awake (free) — recommended

Render's free plan sleeps after 15 minutes without visitors, and the first request after that takes about 50 seconds. Forms still work, because the site waits, but it's slow. Pick one:
- **Free:** at **uptimerobot.com**, add an *HTTP(s)* monitor for `https://qelite-api.onrender.com/api/health` every **5 minutes**. This keeps the server awake and emails you if it goes down.
- **Paid ($7/month):** Render → your service → *Settings → Instance type → Starter*. It's always on.

## 7. Email alerts for new enquiries (optional, 5 minutes)

Everything is always saved in the admin **Inbox**. Email alerts are an extra.

1. Sign up at **resend.com** with the email address that should receive alerts.
2. **API Keys → Create** → copy the key → Render → **Environment** → add `RESEND_API_KEY`.
3. In the admin panel → **Form settings** → put that same email address → Save.

Without a verified domain, Resend only delivers to the email you signed up with. To send alerts to other addresses as well:
1. In Resend, go to **Domains → Add** `qelite.com` and add the DNS records it shows.
2. On Render, set `EMAIL_FROM` = `QELITE <website@qelite.com>`.

---

## Handover checklist

- [ ] Sign in works at `/admin`. Create the client's own account in **Users** (Owner), and give them **docs/ADMIN_GUIDE.md**.
- [ ] Publish → "live" works (step 5).
- [ ] Contact form → appears in Inbox (and email, if step 7 is done).
- [ ] Test certificate verifies on /verify, then is deleted.
- [ ] Real certificates entered in production only, each with its PDF.
- [ ] UptimeRobot monitor or Starter plan (step 6).
- [ ] Remaining client details from `docs/CLIENT_INPUTS.md` can now be filled in by the client in the admin panel.

## If something goes wrong

| Symptom | Fix |
|---|---|
| Admin shows "Can't reach the server" | Open `…onrender.com/api/health`. If it's asleep, wait a minute. Check `client/vercel.json` has the right Render URL, then redeploy Vercel. |
| Publish says "rebuild isn't set up" | `VERCEL_DEPLOY_HOOK_URL` is missing on Render (step 4.2–4.3). |
| A Vercel build failed after publishing | The live site is unaffected — Vercel keeps the previous version. The build log shows the reason (usually the API was down). In the admin panel → *Publish history → Rebuild website*. |
| Owner forgot their password | Render → Environment → add `RESET_ADMIN_PASSWORD` = a new password (10+ characters), with `ADMIN_EMAIL` set to their email. Save, sign in, then **delete** `RESET_ADMIN_PASSWORD`. |
| Bad content was published | Admin → *Publish history* → **Restore** an earlier version. |
| Uploads fail | Check `CLOUDINARY_URL` on Render (format `cloudinary://key:secret@cloud`). You can always paste an image link instead. |

## Costs

| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby | Free |
| Render | Free (or Starter for always-on) | Free / $7 per month |
| MongoDB Atlas | M0 | Free (512 MB, enough for well over a hundred certificate PDFs). Upgrade to a paid tier for automatic backups once the register holds real certificates. |
| Cloudinary | Free | Free (25 credits/month) |
| Resend | Free | Free (3,000 emails/month) |
