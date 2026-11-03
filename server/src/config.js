// Environment configuration. Required values stop the server at start-up
// with a clear message, rather than failing later in a request.

const env = process.env;

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((k) => !env[k]);
if (missing.length) {
  console.error(`[config] Missing environment variables: ${missing.join(', ')}. See server/.env.example.`);
  process.exit(1);
}
if (env.JWT_SECRET.length < 32) {
  console.error('[config] JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}

// cloudinary://<api_key>:<api_secret>@<cloud_name>  (Cloudinary dashboard → "API environment variable")
function parseCloudinary(url) {
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec((url || '').trim());
  return m ? { apiKey: m[1], apiSecret: m[2], cloudName: m[3] } : null;
}

const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

export const config = {
  production: env.NODE_ENV === 'production',
  port: Number(env.PORT) || 4000,
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  siteUrl: (env.SITE_URL || 'https://www.qelite.com').replace(/\/$/, ''),
  // Extra origins allowed to post forms directly (only needed when VITE_API_URL is used)
  allowedOrigins: list(env.ALLOWED_ORIGINS),
  admin: {
    email: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: env.ADMIN_PASSWORD || '',
    resetPassword: env.RESET_ADMIN_PASSWORD || '',
  },
  cloudinary: parseCloudinary(env.CLOUDINARY_URL),
  email: {
    resendKey: env.RESEND_API_KEY || '',
    from: env.EMAIL_FROM || 'QELITE Website <onboarding@resend.dev>',
  },
  deployHookUrl: env.VERCEL_DEPLOY_HOOK_URL || '',
  // IndexNow key; the website serves it at /<key>.txt (client/public). Set INDEXNOW_KEY=off to disable.
  indexNowKey: env.INDEXNOW_KEY ?? '3ffb6c319ed601316a4e8458050ed836',
};

if (config.deployHookUrl && !/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\//.test(config.deployHookUrl)) {
  console.warn('[config] VERCEL_DEPLOY_HOOK_URL does not look like a Vercel deploy hook (https://api.vercel.com/v1/integrations/deploy/...).');
}
if (config.production && !config.deployHookUrl) {
  console.warn('[config] VERCEL_DEPLOY_HOOK_URL is not set — publishing from the admin panel will NOT update the website.');
}

if (env.CLOUDINARY_URL && !config.cloudinary) {
  console.warn('[config] CLOUDINARY_URL is not in the form cloudinary://key:secret@cloud — uploads are disabled.');
}
