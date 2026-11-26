/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
let apiOrigin = "http://localhost:3001";
try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  apiOrigin = apiUrl.replace(/\/api\/?$/, "");
}

const scriptSrc = isProd
  ? "'self' 'unsafe-inline'"
  : "'self' 'unsafe-inline' 'unsafe-eval'";

const cspHeader = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: http: ${apiOrigin}`,
  "font-src 'self' data: https:",
  `connect-src 'self' ${apiOrigin}`,
  "frame-src 'self' blob:",
  "object-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig = {
  poweredByHeader: false,
  output: "standalone",
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      { key: "Content-Security-Policy", value: cspHeader },
    ];

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
