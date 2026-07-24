"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, paymentApi, ApiPurchase } from "@/lib/api";
import { Course } from "@/types/course";
import styles from "../studio.module.css";

interface MonthPoint {
  month: string;
  value: number;
}

const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const TYPE_LABELS: Record<string, string> = {
  cours: "Cours complet",
  courseUnit: "CourseUnit",
  forfait: "Forfait",
  abonnement: "Abonnement",
};

function RevenueChart({ data }: { data: MonthPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={styles.chart} role="img" aria-label="Revenus mensuels">
      {data.map((d) => (
        <div key={d.month} className={styles.barCol}>
          <span className={styles.barValue}>{Math.round(d.value / 1000)}k</span>
          <div className={`${styles.bar} ${styles.barOrange}`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span className={styles.barLabel}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudioRevenusPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchases, setPurchases] = useState<ApiPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userName = user.name;
    async function loadData() {
      try {
        const [allCourses, allPurchases] = await Promise.all([
          coursesApi.list(),
          paymentApi.getInstructorPurchases(userName)
        ]);
        const mine = allCourses.filter((c) => c.instructor === userName);
        setCourses(mine);
        setPurchases(allPurchases);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement des revenus...</p>
      </div>
    );
  }

  // Calculate stats
  const cumul = purchases.reduce((sum, p) => sum + p.net, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const ceMois = purchases
    .filter((p) => {
      const date = new Date(p.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.net, 0);

  const disponible = cumul; // Total net is available for withdrawal
  const enAttente = 0; // Standard balance has no delay in this config

  const KPIS = [
    { label: "Revenus cumulés",   val: fmtXAF(cumul),      icon: "ti-coin",            bg: "var(--success-light)", color: "var(--success)" },
    { label: "Ce mois-ci",        val: fmtXAF(ceMois),     icon: "ti-calendar-dollar", bg: "var(--primary-light)", color: "var(--primary)" },
    { label: "En attente",        val: fmtXAF(enAttente),  icon: "ti-clock",           bg: "var(--orange-light)",  color: "var(--orange)" },
    { label: "Disponible",        val: fmtXAF(disponible), icon: "ti-wallet",          bg: "var(--pink-light)",    color: "var(--pink)" },
  ];

  // Last 6 months chart data
  const chartData: MonthPoint[] = [];
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mName = monthNames[d.getMonth()];
    const mNum = d.getMonth();
    const yNum = d.getFullYear();
    const val = purchases
      .filter((p) => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === mNum && pDate.getFullYear() === yNum;
      })
      .reduce((sum, p) => sum + p.net, 0);
    chartData.push({ month: mName, value: val });
  }

  // Course breakdown
  const courseBreakdown = courses.map((c) => {
    const rev = purchases
      .filter((p) => p.courseSlug === c.slug)
      .reduce((sum, p) => sum + p.net, 0);
    const pct = cumul > 0 ? (rev / cumul) * 100 : 0;
    return {
      id: c.id,
      title: c.title,
      revenue: rev,
      percentage: pct,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Revenus</h1>
          <p className={styles.sub}>Vos gains après la commission de 30% de la plateforme.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/studio/retraits" className={styles.btnPrimary}>
            <i className="ti ti-cash" aria-hidden="true" /> Demander un retrait
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {KPIS.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <span className={styles.kpiIcon} style={{ background: kpi.bg, color: kpi.color }} aria-hidden="true">
                <i className={`ti ${kpi.icon}`} />
              </span>
            </div>
            <p className={styles.kpiVal}>{kpi.val}</p>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        {/* Chart */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><i className="ti ti-chart-area" aria-hidden="true" /> Revenus mensuels</h2>
            <span className={styles.tMuted}>en XAF</span>
          </div>
          <RevenueChart data={chartData} />
        </section>

        {/* Breakdown by course */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><i className="ti ti-chart-pie" aria-hidden="true" /> Répartition par cours</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {courseBreakdown.length === 0 ? (
              <p style={{ color: "var(--fg-muted)", padding: "1rem" }}>Aucun cours publié pour le moment.</p>
            ) : (
              courseBreakdown.map((item) => (
                <div key={item.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "0.86rem" }}>
                    <span style={{ fontWeight: 500 }}>{item.title}</span>
                    <span className={styles.tMuted}>{item.percentage.toFixed(0)}% ({fmtXAF(item.revenue)})</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-main)", borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${item.percentage}%`, background: "var(--primary)", borderRadius: "3px" }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Transactions */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}><i className="ti ti-receipt" aria-hidden="true" /> Ventes récentes</h2>
        </div>
        <div className={styles.tableWrap}>
          {purchases.length === 0 ? (
            <p style={{ color: "var(--fg-muted)", padding: "2rem", textAlign: "center" }}>Aucune vente récente.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Article</th>
                  <th>Type</th>
                  <th className={styles.tRight}>Total Brut</th>
                  <th className={styles.tRight}>Ma part Net (70% - 80%)</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 15).map((p) => (
                  <tr key={p.id}>
                    <td className={styles.tMuted}>{fmtDate(p.createdAt)}</td>
                    <td className={styles.tStrong}>{p.label}</td>
                    <td>
                      <span className={styles.badge} style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                        {TYPE_LABELS[p.type] || p.type}
                      </span>
                    </td>
                    <td className={styles.tRight}>{fmtXAF(p.gross)}</td>
                    <td className={styles.tRight} style={{ color: "var(--success)", fontWeight: 600 }}>{fmtXAF(p.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
