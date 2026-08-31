import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/reports/timesheets/[id]": [
      "./node_modules/pdfkit/js/standard-fonts/**/*",
      "./node_modules/pdfkit/js/data/**/*",
    ],
  },
};

export default nextConfig;
