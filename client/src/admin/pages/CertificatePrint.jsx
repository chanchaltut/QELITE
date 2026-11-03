// Full-page certificate for printing or "Save as PDF" (A4, no margins).
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../api';
import { Loading, Notice } from '../ui';
import { STATUS_INFO, effectiveStatus } from '../../../../shared/certificates.js';
import { CertificateDocument, CertificateFrame, useCertificateFonts } from '../../components/certificate/CertificateDocument';
import { useCertificateTemplate } from '../useCertificateTemplate';

export default function CertificatePrint() {
  const { id } = useParams();
  const { template, siteUrl } = useCertificateTemplate();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');
  const [specimen, setSpecimen] = useState(false);
  useCertificateFonts();

  useEffect(() => {
    api(`/admin/certificates/${id}`).then((r) => setCert(r.item)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="p-6"><Notice tone="error">{error}</Notice></div>;
  if (!cert) return <Loading />;

  const status = effectiveStatus(cert);
  const watermark = specimen ? 'Specimen' : status !== 'valid' ? STATUS_INFO[status]?.label : '';

  return (
    <div className="min-h-screen bg-paper-2 print:bg-white">
      <Helmet>
        <title>{`${cert.number} — ${cert.organisation}`}</title>
      </Helmet>
      <div className="no-print sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to={`/admin/certificates/${cert.id}`} className="btn-outline btn-sm"><i className="ri-arrow-left-line" /> Back</Link>
          <p className="code min-w-0 flex-1 truncate text-sm text-ink-900">{cert.number}</p>
          <label className="flex items-center gap-2 text-sm text-ink-900">
            <input type="checkbox" checked={specimen} onChange={(e) => setSpecimen(e.target.checked)} /> Mark as specimen
          </label>
          <button onClick={() => window.print()} className="btn-dark btn-sm"><i className="ri-printer-line" /> Print / save as PDF</button>
        </div>
        <p className="mx-auto max-w-5xl px-4 pb-3 text-xs text-muted">
          In the print dialog choose <strong>Save as PDF</strong>, paper size <strong>A4</strong>, margins <strong>None</strong>, and turn on <strong>Background graphics</strong>.
          {status !== 'valid' && <> This certificate is <strong>{STATUS_INFO[status]?.label.toLowerCase()}</strong>, so it prints with a watermark.</>}
        </p>
      </div>
      <div className="mx-auto max-w-[820px] px-4 py-8 print:p-0">
        <CertificateFrame>
          <CertificateDocument cert={cert} template={template} siteUrl={siteUrl} watermark={watermark} />
        </CertificateFrame>
      </div>
    </div>
  );
}
