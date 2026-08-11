// Resolver hook: lets `node --experimental-strip-types` run the vault CLI
// (extensionless TS imports + the "@/*" -> "./src/*" alias).
// Needed because node_modules/esbuild is a darwin-arm64 build and cannot run
// on the Linux bridge VM. Added by Claude, 2026-08-10. Safe to delete.
import { registerHooks } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as pres } from 'node:path';

const ROOT = pres(fileURLToPath(import.meta.url), '../../..');
const CANDIDATES = ['.ts', '.mts', '/index.ts', '.js', '/index.js'];

function tryFiles(base) {
  if (existsSync(base) && !base.endsWith('/')) {
    try { if (!statSync(base).isDirectory()) return base; } catch {}
  }
  for (const ext of CANDIDATES) {
    const p = base + ext;
    if (existsSync(p)) return p;
  }
  return null;
}

registerHooks({
  resolve(spec, ctx, next) {
    const hasExt = /\.[cm]?[jt]sx?$/.test(spec);
    let base = null;
    if (spec.startsWith('@/')) base = pres(ROOT, 'src', spec.slice(2));
    else if (spec.startsWith('.') && !hasExt) {
      const from = ctx.parentURL ? dirname(fileURLToPath(ctx.parentURL)) : ROOT;
      base = pres(from, spec);
    }
    if (base) {
      const hit = tryFiles(base);
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
    }
    return next(spec, ctx);
  },
});
