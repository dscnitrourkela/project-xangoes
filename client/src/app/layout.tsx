import "aos/dist/aos.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Project Xangoes",
    description: "Project Xangoes",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
