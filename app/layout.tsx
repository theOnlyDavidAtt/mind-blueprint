import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind & Potential Architect",
  description: "Big Five personality and workspace blueprint with a personal AI report.",
};

export const viewport: Viewport = { colorScheme: "light", themeColor: "#f6f5fb" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${jakarta.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
