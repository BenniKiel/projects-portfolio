import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell"; // Importiert unsere neue Shell

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Benjamin Kiel | Projects Lab",
  description: "Interactive Project Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body className={cn(inter.className, "bg-neutral-900 text-white")}>
        {/* Hier wird die Client-Logik geladen */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}