import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { User, audit } from './models.js';
import { asyncRoute, HttpError } from './http.js';

const COOKIE = 'qe_session';
const SESSION_DAYS = 7;
const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;
// Compared against when the email is unknown, so both cases take the same time
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 12);

export const hashPassword = (password) => bcrypt.hash(password, 12);

export function checkPasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 10) return 'Password must be at least 10 characters.';
  if (password.length > 200) return 'Password is too long.';
  return null;
}

function setSession(res, user) {
  const token = jwt.sign({ sub: String(user._id), v: user.tokenVersion }, config.jwtSecret, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: config.production,
    sameSite: 'lax',
    path: '/api',
    maxAge: SESSION_DAYS * 24 * 3600 * 1000,
  });
}

const clearSession = (res) => res.clearCookie(COOKIE, { path: '/api', httpOnly: true, secure: config.production, sameSite: 'lax' });

/** Loads the signed-in user into req.user, or answers 401. */
export const requireUser = asyncRoute(async (req, res, next) => {
  const token = req.cookies?.[COOKIE];
  if (!token) throw new HttpError(401, 'Please sign in.');
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    clearSession(res);
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  }
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.v) {
    clearSession(res);
    throw new HttpError(401, 'Please sign in again.');
  }
  req.user = user;
  next();
});

export const requireOwner = (req, res, next) => {
  if (req.user?.role !== 'owner') return next(new HttpError(403, 'Only the owner account can do this.'));
  next();
};

// Cross-site forms can't add custom headers, so requiring one blocks CSRF on cookie-authenticated requests
export const requireAdminHeader = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'qe-admin') return next(new HttpError(403, 'Request blocked.'));
  next();
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many sign-in attempts. Please wait 15 minutes.' },
});

export const authRouter = express.Router();
authRouter.use(requireAdminHeader);

authRouter.post(
  '/login',
  loginLimiter,
  asyncRoute(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = await User.findOne({ email });
    const invalid = new HttpError(401, 'Email or password is incorrect.');
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      throw invalid;
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpError(429, `Too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}.`);
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      user.failedLogins += 1;
      if (user.failedLogins >= LOCK_AFTER) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLogins = 0;
        audit(user, 'login-locked');
      }
      await user.save();
      throw invalid;
    }
    user.failedLogins = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();
    setSession(res, user);
    audit(user, 'login');
    res.json({ ok: true, user: user.toPublic() });
  })
);

authRouter.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireUser, (req, res) => res.json({ ok: true, user: req.user.toPublic() }));

authRouter.post(
  '/password',
  requireUser,
  asyncRoute(async (req, res) => {
    const { current, next } = req.body || {};
    if (!(await bcrypt.compare(String(current || ''), req.user.passwordHash))) throw new HttpError(400, 'Current password is incorrect.');
    const weak = checkPasswordStrength(next);
    if (weak) throw new HttpError(400, weak);
    req.user.passwordHash = await hashPassword(next);
    req.user.tokenVersion += 1; // signs out other devices
    await req.user.save();
    setSession(res, req.user);
    audit(req.user, 'password-changed');
    res.json({ ok: true });
  })
);
