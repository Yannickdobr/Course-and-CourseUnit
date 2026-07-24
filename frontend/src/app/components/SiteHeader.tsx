"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import styles from "./SiteHeader.module.css";

const NAV = [
  { href: "/catalogue",  label: "Catalogue" },
  { href: "/projets",    label: "Projets" },
  { href: "/formateurs", label: "Formateurs" },
  { href: "/blog",       label: "Blog" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push("/");
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="EduFlex Pro — Accueil">
          <span className={styles.logoIcon} aria-hidden="true"><i className="ti ti-books" /></span>
          EduFlex Pro
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.navLink} ${isActive(n.href) ? styles.navActive : ""}`}
              aria-current={isActive(n.href) ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated && user ? (
            <>
              <Link href={isAdmin ? "/admin" : user.role === "formateur" ? "/studio" : "/dashboard"} className={styles.spaceLink}>
                <i className="ti ti-layout-dashboard" aria-hidden="true" />
                Mon espace
              </Link>

              <div className={styles.accountWrap}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Menu du compte"
                >
                  <span className={styles.avatar} aria-hidden="true">{user.initials}</span>
                  <span className={styles.avatarName}>{user.name}</span>
                  <i className="ti ti-chevron-down" aria-hidden="true" />
                </button>

                {menuOpen && (
                  <>
                    <button className={styles.backdrop} aria-hidden="true" tabIndex={-1} onClick={() => setMenuOpen(false)} />
                    <div className={styles.menu} role="menu">
                      <div className={styles.menuHead}>
                        <p className={styles.menuName}>{user.name}</p>
                        <p className={styles.menuEmail}>{user.email}</p>
                        <span className={styles.menuRole}>
                          {user.role === "superadmin" ? "Super Admin" : user.role === "admin" ? "Administrateur" : user.role === "formateur" ? "Formateur" : "Apprenant"}
                        </span>
                      </div>
                      <div className={styles.menuList}>
                        {isAdmin ? (
                          <Link href="/admin" className={styles.menuItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                            <i className="ti ti-settings" aria-hidden="true" /> Administration
                          </Link>
                        ) : (
                          <>
                            <Link href="/dashboard" className={styles.menuItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                              <i className="ti ti-layout-dashboard" aria-hidden="true" /> Tableau de bord
                            </Link>
                            <Link href="/dashboard/mes-cours" className={styles.menuItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                              <i className="ti ti-book" aria-hidden="true" /> Mes cours
                            </Link>
                          </>
                        )}
                        {user.role === "formateur" && (
                          <Link href="/studio" className={styles.menuItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                            <i className="ti ti-chalkboard" aria-hidden="true" /> Studio formateur
                          </Link>
                        )}
                        <Link href="/dashboard/parametres" className={styles.menuItem} role="menuitem" onClick={() => setMenuOpen(false)}>
                          <i className="ti ti-settings" aria-hidden="true" /> Paramètres
                        </Link>
                        <div className={styles.menuDivider} />
                        <button className={`${styles.menuItem} ${styles.menuDanger}`} role="menuitem" onClick={handleLogout}>
                          <i className="ti ti-logout" aria-hidden="true" /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/connexion" className={`${styles.btnGhost} ${styles.hideSm}`}>Connexion</Link>
              <Link href="/inscription" className={styles.btnPrimary}>S&apos;inscrire</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
