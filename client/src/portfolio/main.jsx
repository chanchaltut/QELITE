// Entry point of the certification portfolio PDF (portfolio.html, built by
// scripts/build-portfolio.mjs). It is not part of the website build.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import Portfolio from './Portfolio';

createRoot(document.getElementById('portfolio')).render(<Portfolio />);
