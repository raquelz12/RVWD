import type { Metadata } from "next";
import { fontClasses } from "./fonts";
import "./globals.css";
import Header from "../../components/Header/Header";
import BottomNav from "../../components/BottomNav/BottomNav";
import Footer from "../../components/Footer/Footer";
import GlobalModals from "../../components/GlobalModal";
import { ModalProvider } from "@/context/ModalContext";
import RButton from "../../components/RButton/RButton";

export const metadata: Metadata = {
  title: "RVWD",
  description: "Red social para compartir tus gustos musicales y descubrir nueva música",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={fontClasses}
    >
      <body>
        <ModalProvider>
          <Header />
          {children}
          <BottomNav />
          <GlobalModals />
          <RButton />
          <Footer />
        </ModalProvider>
      </body>
    </html>
  );
}
