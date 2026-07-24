import type { Metadata } from "next";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { CartProvider } from "./components/CartProvider";
import SiteChrome from "./components/SiteChrome";
import CartButton from "./components/CartButton";

export const metadata: Metadata = {
  title: "EduFlex Pro — Apprenez par courseUnit",
  description: "La plateforme e-learning francophone qui vous permet d'acheter uniquement les courseUnits dont vous avez besoin.",
  openGraph: {
    title: "EduFlex Pro",
    description: "Apprentissage flexible, tarification granulaire.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <CartProvider>
            <SiteChrome />
            {children}
            <CartButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
