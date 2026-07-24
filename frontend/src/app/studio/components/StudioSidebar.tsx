"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./StudioSidebar.module.css";

/* Groupes d'outils du studio — dock horizontal, icônes seules, libellés au survol. */
const NAV = [
  [
    { href: "/studio",               icon: "ti-layout-grid",  label: "Tableau de bord" },
    { href: "/studio/cours/nouveau", icon: "ti-circle-plus",  label: "Nouveau cours" },
  ],
  [
    { href: "/studio/videos",     icon: "ti-video",   label: "Mes vidéos" },
    { href: "/studio/ressources", icon: "ti-file",    label: "Ressources" },
    { href: "/studio/projets",    icon: "ti-folder",  label: "Projets" },
  ],
  [
    { href: "/studio/stats",    icon: "ti-chart-bar",   label: "Statistiques" },
    { href: "/studio/revenus",  icon: "ti-coin",        label: "Revenus" },
    { href: "/studio/retraits", icon: "ti-credit-card", label: "Retraits" },
  ],
  [
    { href: "/studio/parametres", icon: "ti-settings", label: "Paramètres" },
    { href: "/studio/aide",       icon: "ti-help",     label: "Aide" },
  ],
];

export default function StudioSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const instructorName = user?.name || "Formateur";

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/studio" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={styles.bar} aria-label="Navigation du studio">
      {/* Marque à gauche */}
      <Link href="/studio" className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden="true"><i className="ti ti-books" /></span>
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>Studio</span>
          <span className={styles.brandSub}>{instructorName}</span>
        </span>
      </Link>

      {/* Dock central */}
      <nav className={styles.dock}>
        {NAV.map((group, gi) => (
          <div className={styles.group} key={gi}>
            {gi > 0 && <span className={styles.divider} aria-hidden="true" />}
            {group.map(({ href, icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.item} ${active ? styles.active : ""}`}
                  aria-current={active ? "page" : undefined}
                  title={label}
                >
                  <span className={styles.iconBox}><i className={`ti ${icon}`} aria-hidden="true" /></span>
                  <span className={styles.label}>{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Actions */}
      <div className={styles.actions}>
        <Link href="/" className={styles.item} title="Accueil du site">
          <span className={styles.iconBox}><i className="ti ti-home" aria-hidden="true" /></span>
          <span className={styles.label}>Accueil</span>
        </Link>
        <button onClick={handleLogout} className={`${styles.item} ${styles.logout}`} title="Déconnexion" type="button">
          <span className={styles.iconBox}><i className="ti ti-logout" aria-hidden="true" /></span>
          <span className={styles.label}>Quitter</span>
        </button>
      </div>
    </header>
  );
}
