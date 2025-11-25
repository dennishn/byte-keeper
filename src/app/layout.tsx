import type { ReactNode } from "react";
import type { Metadata } from "next";

import "@/styles/theme.css";
import { ReportWebVitals } from "@/components/web-vitals";

export const metadata: Metadata = {
    title: "Byte Keeper",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <main>{children}</main>

                <ReportWebVitals />
            </body>
        </html>
    );
}
