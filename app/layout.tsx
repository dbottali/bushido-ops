import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bushido Ops | Digital self-defense for everyone",
  description: "Cybersecurity training without gatekeeping. Enter a pixel-art dojo, learn practical digital self-defense, and earn your belt.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
