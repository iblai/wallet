// ibl.ai: Node.js 22+ localStorage polyfill (missing getItem/setItem in SSR)
if (typeof window === "undefined" && typeof localStorage !== "undefined" && typeof localStorage.getItem !== "function") {
  const _s = {};
  globalThis.localStorage = {
    getItem: (k) => (_s[k] ?? null),
    setItem: (k, v) => { _s[k] = String(v); },
    removeItem: (k) => { delete _s[k]; },
    clear: () => { for (const k in _s) delete _s[k]; },
    get length() { return Object.keys(_s).length; },
    key: (i) => Object.keys(_s)[i] ?? null,
  };
}

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */

const require = createRequire(import.meta.url);
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a package to its root directory so the bundler never loads
 * duplicate copies (can happen in npm/pnpm hoisting with differing peer deps).
 * Without this, @reduxjs/toolkit may be duplicated and SDK components get a
 * different ReactReduxContext — RTK Query hooks silently return undefined.
 *
 * Returns the absolute path. For Turbopack, convert with `toProjectRel`
 * since Turbopack treats `/abs/path` as a server-relative path.
 */
function dedup(packageName) {
  try {
    const entry = require.resolve(packageName);
    const marker = `node_modules/${packageName}`;
    const idx = entry.lastIndexOf(marker);
    if (idx !== -1) return entry.slice(0, idx + marker.length);
    return undefined;
  } catch {
    return undefined;
  }
}

function toProjectRel(abs) {
  if (!abs) return abs;
  const rel = path.relative(PROJECT_ROOT, abs);
  return rel.startsWith(".") ? rel : `./${rel}`;
}

const webpackAliases = {};
const turbopackAliases = {};
for (const pkg of ["@iblai/data-layer", "@reduxjs/toolkit", "react-redux"]) {
  const abs = dedup(pkg);
  if (!abs) continue;
  webpackAliases[pkg] = abs;
  turbopackAliases[pkg] = toProjectRel(abs);
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'recharts'],
  },
  // Turbopack dedup (Next 16 default builder). Without this the SDK
  // resolves its own @reduxjs/toolkit / react-redux copy and gets a
  // different ReactReduxContext — RTK Query hooks then silently return undefined.
  turbopack: {
    resolveAlias: turbopackAliases,
  },
  // Webpack fallback (kept for `next build --webpack`); applies the same
  // dedup plus the fs:false client fallback that Turbopack handles natively.
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...config.resolve.alias, ...webpackAliases }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig
