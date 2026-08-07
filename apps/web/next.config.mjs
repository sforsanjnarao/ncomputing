/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // @repo/types ships pre-compiled CommonJS (from `tsc -b`), not raw source, so
  // it needs no transpilation — listing it in transpilePackages actually breaks
  // dev mode, because Next then runs its Fast Refresh instrumentation over the
  // already-compiled file and injects `import.meta.webpackHot`, which is
  // invalid syntax in a CommonJS module.
};

export default nextConfig;
