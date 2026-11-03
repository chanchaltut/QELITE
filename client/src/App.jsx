import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FloatingActions from './components/layout/FloatingActions';
import PreviewBar from './components/layout/PreviewBar';
import SafeSection from './components/SafeSection';
import Home from './pages/Home';
import { SITE } from './data/site';

const Verify = lazy(() => import('./pages/Verify'));
const Certifications = lazy(() => import('./pages/Certifications'));
const StandardDetail = lazy(() => import('./pages/StandardDetail'));
const Accreditation = lazy(() => import('./pages/Accreditation'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import('./pages/Legal').then((m) => ({ default: m.TermsConditions })));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

const PageLoader = () => (
  <div className="grid min-h-[60vh] place-items-center bg-white">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-900 border-t-seal" />
  </div>
);

// Shown instead of a blank screen if a page fails to render
function PageError() {
  return (
    <div className="container-site grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="font-serif text-[2.25rem] leading-tight text-ink-900">This page couldn’t be displayed.</p>
        <p className="mt-3 text-ink-800">
          Please refresh, or email us at <a href={`mailto:${SITE.email}`} className="text-link">{SITE.email}</a>.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  // The admin panel is a separate lazy chunk; visitors never download it
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <PreviewBar />
      <SafeSection><Header /></SafeSection>
      <main id="main">
        <SafeSection resetKey={pathname} fallback={<PageError />}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/verify" element={<Verify />} />
              <Route path="/verify-certificate" element={<Navigate to="/verify" replace />} />

              <Route path="/certifications" element={<Certifications />} />
              <Route path="/certifications/:slug" element={<StandardDetail />} />
              <Route path="/services" element={<Navigate to="/certifications" replace />} />

              <Route path="/accreditation" element={<Accreditation />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQ />} />
              <Route path="/faq" element={<Navigate to="/faqs" replace />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SafeSection>
      </main>
      <SafeSection><Footer /></SafeSection>
      {SITE.features?.floatingButtons !== false && <FloatingActions />}
    </>
  );
}
