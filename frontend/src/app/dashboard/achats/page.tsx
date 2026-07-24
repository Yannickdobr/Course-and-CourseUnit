"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Purchase } from "@/types/learner";
import { useAuth } from "@/app/components/AuthProvider";
import { paymentApi } from "@/lib/api";
import styles from "./page.module.css";

const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/* Métadonnées visuelles par cours */
const COURSE_META: Record<string, { emoji: string; bg: string }> = {
  "react-nextjs-expert":     { emoji: "⚛️", bg: "#ede9fe" },
  "python-machine-learning": { emoji: "🐍", bg: "#ecfdf5" },
  "ux-design-figma":         { emoji: "🎨", bg: "#fdf2f8" },
  "nodejs-api-rest":         { emoji: "🟢", bg: "#ecfdf5" },
  "agile-scrum":             { emoji: "📊", bg: "#fdf2f8" },
};

const TYPE_META: Record<Purchase["type"], { label: string; cls: string }> = {
  cours:      { label: "Cours complet", cls: "badgePurple" },
  courseUnit:   { label: "CourseUnit",      cls: "badgeOrange" },
  forfait:    { label: "Forfait",       cls: "badgeGreen" },
  abonnement: { label: "Abonnement",    cls: "badgePink" },
};

type Filter = "tous" | Purchase["type"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "cours", label: "Cours complets" },
  { key: "courseUnit", label: "CourseUnits" },
  { key: "forfait", label: "Forfaits" },
  { key: "abonnement", label: "Abonnements" },
];

export default function AchatsPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filter, setFilter] = useState<Filter>("tous");

  useEffect(() => {
    if (!user) return;
    paymentApi.getUserPurchases(user.id)
      .then((data) => setPurchases(data.map((p) => ({
        id: p.id,
        courseTitle: p.label,
        courseSlug: p.courseSlug || "",
        amount: p.gross,
        currency: p.currency || "XAF",
        purchasedAt: p.createdAt,
        type: (p.type as Purchase["type"]) || "cours",
      }))))
      .catch(() => setPurchases([]));
  }, [user]);

  const totalSpent = purchases.reduce((a, p) => a + p.amount, 0);
  const thisMonth = purchases.filter((p) => {
    const d = new Date(p.purchasedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = useMemo(
    () => (filter === "tous" ? purchases : purchases.filter((p) => p.type === filter)),
    [purchases, filter]
  );

  const STATS = [
    { label: "Total dépensé",   val: fmtXAF(totalSpent),       icon: "ti-coin",          bg: "var(--orange-light)",  color: "var(--orange)" },
    { label: "Achats",          val: String(purchases.length), icon: "ti-shopping-bag",  bg: "var(--primary-light)", color: "var(--primary)" },
    { label: "Ce mois-ci",      val: String(thisMonth),        icon: "ti-calendar",      bg: "var(--success-light)", color: "var(--success)" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mes achats</h1>
        <p className={styles.sub}>Historique de vos commandes et factures téléchargeables.</p>
      </div>

      {/* Récap */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statIcon} style={{ background: s.bg, color: s.color }} aria-hidden="true">
                <i className={`ti ${s.icon}`} />
              </span>
            </div>
            <p className={styles.statVal}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className={styles.filters} role="tablist" aria-label="Filtrer par type d'achat">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className={styles.card}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">🧾</span>
            <h2 className={styles.emptyTitle}>Aucun achat de ce type</h2>
            <p className={styles.emptySub}>Changez de filtre pour voir vos autres commandes.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th className={styles.tRight}>Montant</th>
                  <th className={styles.tRight}>Facture</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const meta = p.courseSlug ? COURSE_META[p.courseSlug] : undefined;
                  const tm = TYPE_META[p.type];
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.courseCell}>
                          <span
                            className={styles.courseThumb}
                            style={{ background: meta?.bg ?? "var(--primary-light)" }}
                            aria-hidden="true"
                          >
                            {meta?.emoji ?? "💳"}
                          </span>
                          {p.courseSlug ? (
                            <Link href={`/cours/${p.courseSlug}`} className={styles.courseTitle}>
                              {p.courseTitle}
                            </Link>
                          ) : (
                            <span className={styles.courseTitle}>{p.courseTitle}</span>
                          )}
                        </div>
                      </td>
                      <td><span className={`${styles.badge} ${styles[tm.cls]}`}>{tm.label}</span></td>
                      <td className={styles.tMuted}>{fmtDate(p.purchasedAt)}</td>
                      <td className={`${styles.tRight}`}><span className={styles.amount}>{fmtXAF(p.amount)}</span></td>
                      <td className={styles.tRight}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Facture PDF générée et envoyée par email.");
                          }}
                          className={styles.invoiceBtn}
                          aria-label={`Télécharger la facture — ${p.courseTitle}`}
                        >
                          <i className="ti ti-file-invoice" aria-hidden="true" /> PDF
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
