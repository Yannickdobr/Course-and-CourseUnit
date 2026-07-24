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

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function BarChart({ data, orange }: { data: MonthPoint[]; orange?: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={styles.chart} role="img" aria-label="Graphique en barres">
      {data.map((d) => (
        <div key={d.month} className={styles.barCol}>
          <span className={styles.barValue}>{fmt(d.value)}</span>
          <div
            className={`${styles.bar} ${orange ? styles.barOrange : ""}`}
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className={styles.barLabel}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudioStatsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchases, setPurchases] = useState<ApiPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userName = user.name;
    async function loadStats() {
      try {
        const [mine, allPurchases] = await Promise.all([
          coursesApi.byInstructor(userName),
          paymentApi.getInstructorPurchases(userName)
        ]);
        setCourses(mine);
        setPurchases(allPurchases);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement des statistiques...</p>
      </div>
    );
  }

  // Stats réelles à partir des achats et des cours du formateur.
  const totalStudentsCount = new Set(purchases.map(p => p.userId)).size; // apprenants uniques
  const totalSales = purchases.length;                                   // nombre de ventes
  const totalRevenue = purchases.reduce((sum, p) => sum + p.net, 0);     // revenu net formateur
  const avgRating = courses.length > 0 ? (courses.reduce((a, c) => a + c.rating, 0) / courses.length) : 0.0;

  const KPIS = [
    { label: "Apprenants uniques", val: fmt(totalStudentsCount), icon: "ti-users",     bg: "var(--primary-light)", color: "var(--primary)" },
    { label: "Ventes",             val: fmt(totalSales),          icon: "ti-shopping-cart", bg: "var(--orange-light)",  color: "var(--orange)" },
    { label: "Revenu (net)",       val: `${fmt(Math.round(totalRevenue))} XAF`, icon: "ti-coin", bg: "var(--success-light)", color: "var(--success)" },
    { label: "Note moyenne",       val: `${avgRating.toFixed(1)} ★`, icon: "ti-star",   bg: "var(--pink-light)",    color: "var(--pink)" },
  ];

  // Séries mensuelles réelles (apprenants uniques + revenu net) sur 6 mois.
  const monthlyLearners: MonthPoint[] = [];
  const monthlyRevenue: MonthPoint[] = [];
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mName = monthNames[d.getMonth()];
    const mNum = d.getMonth();
    const yNum = d.getFullYear();

    const monthPurchases = purchases.filter((p) => {
      const pDate = new Date(p.createdAt);
      return pDate.getMonth() === mNum && pDate.getFullYear() === yNum;
    });

    monthlyLearners.push({ month: mName, value: new Set(monthPurchases.map(p => p.userId)).size });
    monthlyRevenue.push({ month: mName, value: Math.round(monthPurchases.reduce((s, p) => s + p.net, 0)) });
  }

  // Course performance list
  const coursePerformance = courses.map((c) => {
    const revenue = purchases
      .filter((p) => p.courseSlug === c.slug)
      .reduce((sum, p) => sum + p.net, 0);
    const enrolled = new Set(purchases.filter(p => p.courseSlug === c.slug).map(p => p.userId)).size;

    return {
      id: c.id,
      title: c.title,
      emoji: c.emoji,
      thumbGradient: c.thumbGradient,
      rating: c.rating,
      students: enrolled || c.studentCount, // Fallback to course entity student count
      revenue: revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Statistiques</h1>
          <p className={styles.sub}>Suivez l&apos;audience, l&apos;engagement et la performance de vos cours.</p>
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

      {/* Charts */}
      <div className={styles.grid2}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><i className="ti ti-chart-bar" aria-hidden="true" /> Nouveaux apprenants</h2>
          </div>
          <BarChart data={monthlyLearners} />
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><i className="ti ti-coin" aria-hidden="true" /> Revenu net (XAF)</h2>
          </div>
          <BarChart data={monthlyRevenue} orange />
        </section>
      </div>

      {/* Top courses */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}><i className="ti ti-list" aria-hidden="true" /> Performance par cours</h2>
        </div>
        <div className={styles.tableWrap}>
          {coursePerformance.length === 0 ? (
            <p style={{ color: "var(--fg-muted)", padding: "2rem", textAlign: "center" }}>Aucun cours publié pour le moment.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cours</th>
                  <th className={styles.tRight}>Élèves</th>
                  <th className={styles.tRight}>Note</th>
                  <th className={styles.tRight}>Revenus</th>
                </tr>
              </thead>
              <tbody>
                {coursePerformance.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className={styles.courseCell}>
                        <span className={styles.courseThumb} style={{ background: course.thumbGradient }}>
                          {course.emoji}
                        </span>
                        <span className={styles.courseTitle}>{course.title}</span>
                      </div>
                    </td>
                    <td className={styles.tRight}><strong>{fmt(course.students)}</strong></td>
                    <td className={styles.tRight}><strong>{course.rating.toFixed(1)}</strong> ★</td>
                    <td className={styles.tRight} style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {fmt(course.revenue)} XAF
                    </td>
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
