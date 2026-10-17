import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Zyntrix — Material 3 Theme Studio for Kubuntu",
  description:
    "Zyntrix generates a complete Material You / Material 3 theme for Kubuntu (KDE Plasma): color schemes, wallpapers, Konsole schemes and an installer — all from a single source color.",
  keywords: [
    "Zyntrix",
    "Kubuntu",
    "KDE Plasma",
    "Material 3",
    "Material You",
    "theme",
    "color scheme",
    "dynamic color",
  ],
  authors: [{ name: "Zyntrix" }],
  icons: {
    icon: [
      { url: "/zyntrix/web/favicon.ico", sizes: "48x48" },
      { url: "/zyntrix/web/favicon.svg", type: "image/svg+xml" },
      {
        url: "/zyntrix/web/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: "/zyntrix/web/apple-touch-icon.png",
  },
};

/* The studio defaults to a deep M3 dark surface; keep the browser chrome in sync */
export const viewport: Viewport = {
  themeColor: "#141218",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* Dark from the very first paint: the class is static, so SSR and the
       client agree — no flash, no hydration mismatch, ever. */
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
