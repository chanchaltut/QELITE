// The time pages are rendered at.
//
// Prerendered HTML (scripts/prerender.mjs) is built at a fixed moment, stored on
// <div id="root" data-time="…">. When the browser takes over that HTML, its first
// render must produce exactly the same output, so date-based content starts from the
// build time and switches to the real time straight after (useNow).

import { useEffect, useState } from 'react';
import { BUILD_TIME, initialNow } from './build-time.js';

export { initialNow };

/** Current time in ms for rendering: the build time on the first render, then the real time. */
export function useNow() {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    if (BUILD_TIME != null) setNow(Date.now());
  }, []);
  return now;
}
