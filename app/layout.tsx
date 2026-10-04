import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  other: { "color-scheme": "only light" },
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
    <html lang="en" style={{ colorScheme: "only light", backgroundColor: "#fcfaf5" }}>
      <body className="antialiased" style={{ backgroundColor: "#fcfaf5", color: "#091222" }}>{children}</body>
    </html>
  );
}
