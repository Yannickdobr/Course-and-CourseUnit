"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";

/* Routes qui gèrent leur propre chrome (sidebar, plein écran, modale) :
   on n'y affiche PAS la barre de navigation globale. */
const HIDE_PREFIXES = ["/dashboard", "/studio", "/connexion", "/inscription", "/mot-de-passe-oublie", "/panier", "/paiement"];

export default function SiteChrome() {
  const pathname = usePathname();
  if (pathname.endsWith("/apprendre")) return null;           // lecteur de cours (immersif)
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))) return null;
  return <SiteHeader />;
}
