import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import { FlashProvider } from "@/components/fieldwork/Flash";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Fieldwork",
  description:
    "Discover roles matched to your résumé, track every application, and follow a prep schedule timed to your interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lora.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <FlashProvider>{children}</FlashProvider>
      </body>
    </html>
  );
}
