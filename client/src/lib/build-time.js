// The moment a prerendered page was built (scripts/prerender.mjs stores it on
// <div id="root" data-time="…">). No React here: data modules and the API import it.

const readBuildTime = () => {
  if (typeof document === 'undefined') return Number(globalThis.__PRERENDER_TIME__) || null;
  return Number(document.getElementById('root')?.dataset.time) || null;
};

export const BUILD_TIME = readBuildTime();

/** Build time on a prerendered page, otherwise now. For sample data computed once at load. */
export const initialNow = () => BUILD_TIME ?? Date.now();
