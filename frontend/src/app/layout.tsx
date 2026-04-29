import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletProvider";
import { ToastProvider } from "@/components/Toast";
import NavBar from "@/components/NavBar";
import FilmGrain from "@/components/FilmGrain";
import BottomTicker from "@/components/BottomTicker";

export const metadata: Metadata = {
  title: "LEARN MINT — WEB3 LEARNING PROTOCOL",
  description:
    "Watch educational content, pass quizzes, and earn LEARN tokens on the Stellar blockchain. A decentralized learn-to-earn platform powered by Soroban smart contracts.",
  keywords: [
    "Stellar",
    "Soroban",
    "Learn to Earn",
    "Blockchain",
    "Education",
    "LEARN Token",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* SVG filter for chromatic aberration */}
        <svg
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            overflow: "hidden",
          }}
        >
          <defs>
            <filter
              id="chromatic"
              x="-5%"
              y="-5%"
              width="110%"
              height="110%"
            >
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="1 0 0 0 0.02  0 1 0 0 0  0 0 1 0 -0.02  0 0 0 1 0"
                result="red"
              />
              <feOffset in="red" dx="2" dy="0" result="roffset" />
              <feBlend
                in="SourceGraphic"
                in2="roffset"
                mode="screen"
                result="blend"
              />
            </filter>
          </defs>
        </svg>

        <FilmGrain />

        <WalletProvider>
          <ToastProvider>
            <BottomTicker />
            <NavBar />
            <main>{children}</main>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
