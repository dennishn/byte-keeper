import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    // enable this if you need to debug production builds - dont forget to disable it again when you are done!
    // productionBrowserSourceMaps: true,
    reactStrictMode: true,
    reactCompiler: true,
    typedRoutes: true,
    // Cache Components: Enable explicit opt-in caching with "use cache" directive
    cacheComponents: true,
    experimental: {
        // report these metrics in the ReportWebVitals component
        webVitalsAttribution: ["FCP", "LCP", "CLS", "TTFB", "INP"],
    },
};

// Using @next/bundle-analyzer together with turbo will show a warning in the terminal.
// This is a known issue and can be ignored.
export default withWorkflow(nextConfig);
