import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletProvider";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn Mint — Learn to Earn on Stellar",
  description:
    "Watch educational content, pass quizzes, and earn LEARN tokens on the Stellar blockchain. A decentralized learn-to-earn platform powered by Soroban smart contracts.",
  keywords: ["Stellar", "Soroban", "Learn to Earn", "Blockchain", "Education", "LEARN Token"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          <NavBar />
          <main className="flex-1 pt-16">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
