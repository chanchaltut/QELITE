// Build-time renderer: turns each public route into static HTML (see scripts/prerender.mjs),
// so search engines and AI crawlers get the full page without running JavaScript.
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Writable } from 'node:stream';
import App from './App.jsx';

export function render(url) {
  const helmetContext = {};
  const errors = [];
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _enc, done) {
        html += chunk.toString();
        done();
      },
      final(done) {
        resolve({ html, helmet: helmetContext.helmet, errors });
        done();
      },
    });
    const stream = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>,
      {
        // Wait for lazy-loaded pages so the HTML holds the real content, not the loader
        onAllReady() {
          stream.pipe(sink);
        },
        onShellError: reject,
        onError(err) {
          errors.push(err);
        },
      }
    );
  });
}
