"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import styles from "./layout.module.css";

const MENU_ITEMS = [
  { href: "/admin",                 label: "Vue d'ensemble", icon: "ti-layout-grid" },
  { href: "/admin/utilisateurs",    label: "Utilisateurs",   icon: "ti-users" },
  { href: "/admin/cours",           label: "Catalogue Cours",icon: "ti-book" },
  { href: "/admin/aide-financiere", label: "Aides Financières", icon: "ti-gift" },
  { href: "/admin/coupons",         label: "Codes Promo",    icon: "ti-ticket" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    // Redirect if not admin / super-admin
    if (isAuthenticated && user && !isAdmin) {
      router.push("/");
    }
  }, [user, isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.loading}>
        <p>Veuillez vous connecter...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.unauthorizedBox}>
          <i className="ti ti-alert-triangle" />
          <h2>Accès non autorisé</h2>
          <p>Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.</p>
          <Link href="/" className={styles.btnHome}>Retourner à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar de navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <div className={styles.logo}>
            <i className="ti ti-books" />
            <span>EduFlex Admin</span>
          </div>
          <div className={styles.adminBadge}>{user.role === "superadmin" ? "Super Admin" : "Admin"}</div>
        </div>

        <nav className={styles.nav} aria-label="Menu administration">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <i className={`ti ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.footerUser}>{user.name}</p>
          <p className={styles.footerEmail}>{user.email}</p>
          <Link href="/" className={styles.btnBackSite}>
            <i className="ti ti-arrow-left" /> Retour au site
          </Link>
        </div>
      </aside>

      {/* Zone de contenu */}
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
