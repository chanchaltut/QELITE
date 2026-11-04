// Builds the certification portfolio PDF from portfolio.html.
//   npm run portfolio            → ../docs/QELITE-Certification-Portfolio.pdf
//   npm run portfolio -- out.pdf → a path of your choice
// Needs Google Chrome or Chromium on this machine, and internet access for the fonts.
import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(process.argv[2] || path.join(clientDir, '../docs/QELITE-Certification-Portfolio.pdf'));
const browser = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));
if (!browser) throw new Error('Chrome was not found. Set CHROME_PATH to its location.');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Sets the document properties and optimises the file for viewing online. Needs qpdf;
// without it the PDF is still complete and only keeps Chrome's default properties.
function finishPdf(file) {
  const dir = mkdtempSync(path.join(tmpdir(), 'qelite-pdf-'));
  try {
    const { qpdf: [header, objects] } = JSON.parse(execFileSync('qpdf', ['--json', '--json-key=qpdf', file], { maxBuffer: 1 << 30 }).toString());
    const infoKey = `obj:${objects.trailer.value['/Info']}`;
    const text = (v) => `u:${v}`;
    const patch = {
      qpdf: [header, {
        [infoKey]: {
          value: {
            ...objects[infoKey].value,
            '/Title': text('QELITE Certification Portfolio'),
            '/Author': text('QELITE Certification Services'),
            '/Subject': text('Certifications offered by QELITE, with a specimen certificate for each standard'),
            '/Creator': text('QELITE Certification Services'),
            '/Producer': text('QELITE Certification Services'),
          },
        },
      }],
    };
    const patchFile = path.join(dir, 'patch.json');
    const finished = path.join(dir, 'out.pdf');
    writeFileSync(patchFile, JSON.stringify(patch));
    execFileSync('qpdf', [file, finished, `--update-from-json=${patchFile}`, '--linearize', '--object-streams=generate']);
    copyFileSync(finished, file);
  } catch (err) {
    console.warn(`Kept Chrome's default PDF properties (${err.message.split('\n')[0]})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const vite = await createServer({ root: clientDir, server: { port: 5199, strictPort: false }, logLevel: 'error' });
await vite.listen();
const pageUrl = `http://localhost:${vite.config.server.port}/portfolio.html`;

const profile = mkdtempSync(path.join(tmpdir(), 'qelite-portfolio-'));
const chrome = spawn(browser, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

try {
  const wsBrowser = await new Promise((resolve, reject) => {
    let log = '';
    chrome.stderr.on('data', (d) => {
      log += d;
      const m = /DevTools listening on (ws:\S+)/.exec(log);
      if (m) resolve(m[1]);
    });
    chrome.on('exit', () => reject(new Error(`Chrome exited early:\n${log}`)));
  });

  const { port } = new URL(wsBrowser);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });

  let nextId = 0;
  const pending = new Map();
  const problems = [];
  socket.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      problems.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    } else if (msg.method === 'Network.loadingFailed' && !msg.params.canceled) {
      problems.push(`Could not load a resource: ${msg.params.errorText}`);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.navigate', { url: pageUrl });

  // Wait until React has rendered, the fonts are in and every image has loaded.
  const ready = `(async () => {
    while (!document.querySelector('.sheet')) await new Promise((r) => setTimeout(r, 100));
    await document.fonts.ready;
    await Promise.all(['"EB Garamond"', '"Pinyon Script"', 'Geist'].map((f) => document.fonts.load('16px ' + f)));
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    return document.querySelectorAll('.sheet').length;
  })()`;
  const { result } = await send('Runtime.evaluate', { expression: ready, awaitPromise: true, returnByValue: true });
  await wait(500);
  if (problems.length) throw new Error(`The page reported problems:\n${problems.join('\n')}`);

  const { data } = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    generateDocumentOutline: true,
    generateTaggedPDF: true,
  });
  writeFileSync(output, Buffer.from(data, 'base64'));
  finishPdf(output);
  console.log(`Wrote ${output} (${result.value} pages expected)`);
  socket.close();
} finally {
  chrome.kill();
  await vite.close();
  await wait(300);
  rmSync(profile, { recursive: true, force: true });
}
