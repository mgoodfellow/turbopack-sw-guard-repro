// Finds the compiled Probe effect in the client chunks and reports whether the
// `if (!navigator.serviceWorker)` branch survived the production build.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.next/static/chunks';
const files = readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.js'));
for (const f of files) {
  const src = readFileSync(join(dir, f), 'utf8');
  const i = src.indexOf('service worker supported');
  if (i === -1) continue;
  console.log(`${f}:\n  ...${src.slice(Math.max(0, i - 200), i + 30)}...\n`);
  console.log(
    src.includes('guard ran')
      ? 'guard PRESENT: the !navigator.serviceWorker branch is in the bundle'
      : 'guard MISSING: the !navigator.serviceWorker branch was removed at build time',
  );
}
