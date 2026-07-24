/* Ce layout remplace le layout parent pour /cours/[slug]/apprendre.
   Il supprime la Navbar globale et prend tout l'écran. */
   export default function ApprendreLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }