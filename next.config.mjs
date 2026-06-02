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

/** @type {import('next').NextConfig} */

const require = createRequire(import.meta.url);

/**
 * Resolve a package to its root directory so webpack never loads duplicate
 * copies (can happen in npm/pnpm hoisting with differing peer deps).
 * Without this, @reduxjs/toolkit may be duplicated and SDK components get
 * a different ReactReduxContext — RTK Query hooks silently return undefined.
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

const resolveAliases = {};
const dataLayerDir = dedup("@iblai/data-layer");
if (dataLayerDir) resolveAliases["@iblai/data-layer"] = dataLayerDir;
const rtkDir = dedup("@reduxjs/toolkit");
if (rtkDir) resolveAliases["@reduxjs/toolkit"] = rtkDir;
const reactReduxDir = dedup("react-redux");
if (reactReduxDir) resolveAliases["react-redux"] = reactReduxDir;

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  webpack: (config, { isServer }) => {
    // Apply the dedup aliases computed above. Without this the SDK resolves
    // its own @reduxjs/toolkit / react-redux copy and gets a different
    // ReactReduxContext — RTK Query hooks then silently return undefined.
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...config.resolve.alias, ...resolveAliases }
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
