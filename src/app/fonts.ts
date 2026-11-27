import { Raleway } from "next/font/google";
import localFont from "next/font/local";

// Fuentes de la web: las usan el layout raíz y global-error (que no pasa por el layout)
export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const antonCustom = localFont({
  src: "./fonts/AntonReversedR-Regular.ttf",
  variable: "--font-anton",
  display: "swap",
});

export const fontClasses = `${raleway.variable} ${antonCustom.variable}`;
