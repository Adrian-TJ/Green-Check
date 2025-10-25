import type { Metadata } from "next";
import Providers from "./providers";
import { Montserrat } from "next/font/google";
import "./globals.css";

// ✅ Carga optimizada del font Montserrat
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ✅ Metadata del sitio
export const metadata: Metadata = {
  title: "GreenCheck", // Cambia aquí si deseas otro nombre
  description: "Portal de empresas sostenibles - Banorte Verde",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* ✅ Se aplica Montserrat globalmente */}
      <body className={montserrat.className}>
        {/* ✅ Se aplica el ThemeProvider desde Providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
