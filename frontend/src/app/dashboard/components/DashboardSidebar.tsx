"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./DashboardSidebar.module.css";

const NAV = [
  {
    section: "Apprentissage",
    items: [
      { href: "/dashboard",            icon: "ti-layout-dashboard", label: "Tableau de bord" },
      { href: "/dashboard/mes-cours",  icon: "ti-book",             label: "Mes cours" },
      { href: "/dashboard/certificats",icon: "ti-certificate",      label: "Certificats" },
    ],
  },
  {
    section: "Compte",
    items: [
      { href: "/dashboard/souhaits",   icon: "ti-heart",    label: "Souhaits" },
      { href: "/dashboard/achats",     icon: "ti-receipt",  label: "Mes achats" },
      { href: "/dashboard/parametres", icon: "ti-settings", label: "Paramètres" },
    ],
  },
];

interface Props {
  name: string;
  initials: string;
  avatarUrl?: string;
}

export default function DashboardSidebar({ name, initials, avatarUrl }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const displayName = user?.name ?? name;
  const displayInitials = user?.initials ?? initials;

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={styles.bar} aria-label="Navigation du dashboard">
      {/* Profil */}
      <div className={styles.brand}>
        <div className={styles.avatar} aria-label={`Avatar de ${displayName}`}>
          {avatarUrl ? <img src={avatarUrl} alt={displayName} className={styles.avatarImg} /> : displayInitials}
        </div>
        <div className={styles.brandText}>
          <p className={styles.name}>{displayName}</p>
          <p className={styles.role}>Apprenant</p>
        </div>
      </div>

      {/* Dock central : icônes seules, libellés révélés au survol */}
      <nav className={styles.dock}>
        {NAV.map(({ section, items }, gi) => (
          <div className={styles.group} key={section}>
            {gi > 0 && <span className={styles.divider} aria-hidden="true" />}
            {items.map(({ href, icon, label }) => {
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
        <Link href="/catalogue" className={styles.item} title="Explorer le catalogue">
          <span className={styles.iconBox}><i className="ti ti-search" aria-hidden="true" /></span>
          <span className={styles.label}>Catalogue</span>
        </Link>
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
