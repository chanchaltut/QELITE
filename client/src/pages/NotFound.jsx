import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../lib/seo';
import Guilloche from '../components/ui/Guilloche';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" path="/404" noindex />
      <section className="relative isolate overflow-hidden bg-texture">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[48rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 text-ink-900/[0.06]">
          <Guilloche className="h-full w-full" />
        </div>
        <div className="container-site relative flex min-h-[62vh] flex-col items-center justify-center py-24 text-center">
          <p className="code text-sm font-medium tracking-[0.2em] text-brand-700">ERROR 404</p>
          <h1 className="h-display mt-5 text-[3rem] leading-[1] sm:text-[4.5rem]">This page <em className="italic text-brand-700">couldn’t be verified.</em></h1>
          <p className="mt-5 max-w-md text-lg text-ink-800">The page you’re looking for doesn’t exist or has moved.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-dark">Go to the homepage</Link>
            <Link to="/verify" className="btn-light"><i className="ri-shield-check-line" /> Verify a certificate</Link>
          </div>
        </div>
      </section>
    </>
  );
}
