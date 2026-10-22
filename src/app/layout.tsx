import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BotttomNav";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const antonCustom = localFont({
  src: "./fonts/AntonReversedR-Regular.ttf",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RVWD",
  description: "Red social para compartir tus gustos musicales y descubrir nueva música",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${raleway.variable} ${antonCustom.variable}`}
    >
      <body>
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
