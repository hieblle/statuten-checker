/** @type {import('next').NextConfig} */
const nextConfig = {
  // mammoth & pdf-parse are CommonJS Node libs that must not be bundled by the
  // server compiler – keep them external so they load at runtime.
  experimental: {
    serverComponentsExternalPackages: ["mammoth", "pdf-parse"],
  },
};

export default nextConfig;
