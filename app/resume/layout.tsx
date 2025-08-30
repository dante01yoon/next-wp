import "../globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";

const font = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Resume | Dante",
  description: "Professional resume and CV",
  robots: { index: true, follow: true },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <Analytics />
    </div>
  );
}
