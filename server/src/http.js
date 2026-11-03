// Small helpers shared by all routes.

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

/** Wraps an async handler so rejected promises reach the error handler. */
export const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.too.large') return res.status(413).json({ ok: false, error: 'That is too much content to save at once.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ ok: false, error: 'Malformed request.' });
  const status = err.status || 500;
  if (!err.status) console.error('[error]', req.method, req.originalUrl, err);
  res.status(status).json({
    ok: false,
    error: err.status ? err.message : 'Something went wrong on the server. Please try again.',
    ...(err.extra || {}),
  });
}
