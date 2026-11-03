import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE } from '../data/site';
import { isPlaceholder } from './format';
import { pageOverride } from '../data/pages';
import { SHARE_IMAGE } from './site-head';

export const absUrl = (path = '/') => `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;

export const ORG_ID = `${SITE.url}/#organization`;

export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: absUrl(it.path),
  })),
});

export const faqLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

// Drop placeholder values so structured data never contains "[...]" text.
export const clean = (obj) =>
  JSON.parse(JSON.stringify(obj, (_, val) => (isPlaceholder(val) ? undefined : val)));

// Search results show about 60 characters of a title and 160 of a description.
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/** Cuts text at a word boundary so it fits in `max` characters, ending with "…". */
function fitText(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.—–-]+$/, '')}…`;
}

const INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter and JSON-LD.
 * Site-wide Organization / WebSite schema lives in index.html.
 */
export default function Seo(props) {
  const { path = '/', image = SITE.ogImage, type = 'website', jsonLd = [], children } = props;
  // Admin → "Pages & SEO" can override the title, description and indexing of any page
  const page = pageOverride(path);
  const title = page?.title || props.title;
  const description = fitText(page?.description || props.description || SITE.description, DESCRIPTION_MAX);
  const noindex = Boolean(page?.noindex || props.noindex);

  // The firm's name is added when it fits; otherwise the page's own words get the space
  const branded = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const fullTitle = !title || branded.length <= TITLE_MAX ? branded : title;
  const url = absUrl(path);
  const share = image || SITE.ogImage || '/og-image.jpg';
  const img = share.startsWith('http') ? share : absUrl(share);
  const isDefaultImage = share === (SITE.ogImage || '/og-image.jpg');
  const blocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, follow' : INDEX} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {isDefaultImage && <meta property="og:image:width" content={String(SHARE_IMAGE.width)} />}
      {isDefaultImage && <meta property="og:image:height" content={String(SHARE_IMAGE.height)} />}
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(clean(b))}</script>
      ))}
      {children}
    </Helmet>
  );
}
