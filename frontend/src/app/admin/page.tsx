"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authApi, coursesApi, paymentApi } from "@/lib/api";
import styles from "./page.module.css";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    usersCount: 0,
    trainersCount: 0,
    coursesCount: 0,
    couponsCount: 0,
    pendingAidsCount: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentAids, setRecentAids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [users, courses, coupons, aids] = await Promise.all([
          authApi.getAllUsers(),
          coursesApi.getAllCourses(),
          paymentApi.getAllCoupons(),
          paymentApi.getAllFinancialAids(),
        ]);

        const trainers = users.filter((u) => u.role === "formateur");
        const pendingAids = aids.filter((a) => a.status === "EN_ATTENTE");

        setStats({
          usersCount: users.length,
          trainersCount: trainers.length,
          coursesCount: courses.length,
          couponsCount: coupons.length,
          pendingAidsCount: pendingAids.length,
        });

        // Sorted lists
        setRecentUsers(users.slice(-5).reverse());
        setRecentAids(aids.slice(-5).reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Administration</h1>
        <p className={styles.subtitle}>Vue globale de l&apos;activité de la plateforme EduFlex Pro.</p>
      </div>

      {/* Grid des statistiques */}
      <div className={styles.statsGrid}>
        {[
          { label: "Utilisateurs inscrits", val: stats.usersCount, icon: "ti-users", link: "/admin/utilisateurs" },
          { label: "Formateurs certifiés", val: stats.trainersCount, icon: "ti-school", link: "/admin/utilisateurs" },
          { label: "Cours au catalogue", val: stats.coursesCount, icon: "ti-book", link: "/admin/cours" },
          { label: "Aides financières en attente", val: stats.pendingAidsCount, icon: "ti-gift", link: "/admin/aide-financiere", highlight: stats.pendingAidsCount > 0 },
          { label: "Codes de réduction actifs", val: stats.couponsCount, icon: "ti-ticket", link: "/admin/coupons" },
        ].map((s) => (
          <Link href={s.link} key={s.label} className={`${styles.statCard} ${s.highlight ? styles.statCardHighlight : ""}`}>
            <div className={styles.statIcon} aria-hidden>
              <i className={`ti ${s.icon}`} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statVal}>{s.val}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Tables d'activités récentes */}
      <div className={styles.tablesGrid}>
        {/* Nouveaux inscrits */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Derniers inscrits</h2>
            <Link href="/admin/utilisateurs" className={styles.seeAll}>Gérer</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className={styles.empty}>Aucun utilisateur enregistré.</p>
          ) : (
            <ul className={styles.list}>
              {recentUsers.map((u) => (
                <li key={u.id} className={styles.listItem}>
                  <div className={styles.userInitials}>{u.name ? u.name.substring(0, 2).toUpperCase() : "U"}</div>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{u.name}</p>
                    <p className={styles.userEmail}>{u.email}</p>
                  </div>
                  <span className={`${styles.roleBadge} ${u.role === "admin" ? styles.roleAdmin : u.role === "formateur" ? styles.roleTrainer : ""}`}>
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Demandes d'aide récentes */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Aides financières récentes</h2>
            <Link href="/admin/aide-financiere" className={styles.seeAll}>Traiter</Link>
          </div>
          {recentAids.length === 0 ? (
            <p className={styles.empty}>Aucune demande d&apos;aide financière.</p>
          ) : (
            <ul className={styles.list}>
              {recentAids.map((aid) => (
                <li key={aid.id} className={styles.listItem}>
                  <div className={styles.aidInfo}>
                    <p className={styles.aidAmount}>Revenu : {aid.monthlyIncome.toLocaleString("fr-FR")} XAF</p>
                    <p className={styles.aidMeta}>Score : {Math.round(aid.score * 100)}%</p>
                  </div>
                  <span className={`${styles.statusBadge} ${aid.status === "APPROUVEE" ? styles.statusApproved : aid.status === "REFUSEE" ? styles.statusRejected : ""}`}>
                    {aid.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
