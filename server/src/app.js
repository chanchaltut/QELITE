import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { authRouter, requireUser, requireAdminHeader } from './auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler } from './http.js';

export function createApp() {
  const app = express();
  // Requests arrive through Vercel's /api forwarding and Render's load balancer: trust those two hops
  app.set('trust proxy', 2);
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));

  // Forms may be posted directly from the website's own origin(s)
  const origins = new Set([config.siteUrl, config.siteUrl.replace('://', '://www.'), ...config.allowedOrigins]);
  app.use('/api/public', (req, res, next) => {
    const origin = req.get('Origin');
    if (origin && origins.has(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Allow-Methods', 'GET, POST');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/api/health', (req, res) => {
    const db = mongoose.connection.readyState === 1;
    res.status(db ? 200 : 503).json({ ok: db, db: db ? 'connected' : 'disconnected' });
  });

  app.use('/api/public', publicRouter);
  app.use('/api/auth', authRouter);
  app.use(
    '/api/admin',
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 1500, standardHeaders: 'draft-7', legacyHeaders: false }),
    requireAdminHeader,
    requireUser,
    (req, res, next) => {
      res.set('Cache-Control', 'no-store');
      next();
    },
    adminRouter
  );

  app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Not found.' }));
  app.get('/', (req, res) => res.type('text').send('QELITE website API. Admin panel: ' + config.siteUrl + '/admin'));
  app.use(errorHandler);
  return app;
}
