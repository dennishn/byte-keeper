import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
    poweredByHeader: false,
    // enable this if you need to debug production builds - dont forget to disable it again when you are done!
    // productionBrowserSourceMaps: true,
    reactStrictMode: true,
    reactCompiler: true,
    typedRoutes: true,
    experimental: {
        // report these metrics in the ReportWebVitals component
        webVitalsAttribution: ["FCP", "LCP", "CLS", "TTFB", "INP"],
    },
};

// Using @next/bundle-analyzer together with turbo will show a warning in the terminal.
// This is a known issue and can be ignored.
export default bundleAnalyzer(nextConfig);
