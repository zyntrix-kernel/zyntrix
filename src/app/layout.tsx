import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
