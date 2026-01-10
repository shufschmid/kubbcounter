import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kubb Counter",
  description: "Track hits and misses",
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
