"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, certificateApi, ApiCertificate } from "@/lib/api";
import { CourseDetail } from "@/types/courseDetail";
import styles from "./page.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDetail[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [certs, setCerts] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function loadData() {
      try {
        const [enrolled, completedIds, userCerts] = await Promise.all([
          coursesApi.getEnrolled(userId),
          coursesApi.getCompletions(userId),
          certificateApi.getByUserId(userId),
        ]);
        setEnrolledCourses(enrolled);
        setCompletions(completedIds);
        setCerts(userCerts);
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
        <p style={{ color: "var(--fg-muted)" }}>Chargement du tableau de bord...</p>
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];

  // Calculate dynamic stats
  const coursesBoughtCount = enrolledCourses.length;
  const courseUnitsCompletedCount = completions.length;
  const certificatesCount = certs.length;

  let totalMinutes = 0;
  enrolledCourses.forEach((c) => {
    (c.sections || []).forEach((s) => {
      (s.courseUnits || []).forEach((ch) => {
        if (completions.includes(ch.id)) {
          totalMinutes += ch.duration;
        }
      });
    });
  });
  const hoursLearned = Math.round(totalMinutes / 60);

  // Map courses in progress
  const coursesInProgress = enrolledCourses.map((c) => {
    const allChs = (c.sections || []).flatMap((s) => s.courseUnits || []);
    const totalCourseUnits = allChs.length;
    const completedCourseUnits = allChs.filter((ch) => completions.includes(ch.id)).length;
    const progressPct = totalCourseUnits > 0 ? Math.round((completedCourseUnits / totalCourseUnits) * 100) : 0;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      emoji: c.emoji,
      thumbBg: c.thumbGradient.includes("linear-gradient") ? "var(--primary-dark)" : c.thumbGradient || "#ede9fe",
      currentCourseUnit: Math.min(totalCourseUnits, completedCourseUnits + 1),
      totalCourseUnits,
      progressPct,
      completed: completedCourseUnits === totalCourseUnits && totalCourseUnits > 0,
    };
  });

  return (
    <main className={styles.page}>
      {/* ── Bienvenue ── */}
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Bonjour, {firstName} 👋</h1>
        <p className={styles.welcomeSub}>
          Continuez là où vous en étiez —{" "}
          {coursesInProgress.filter((c) => !c.completed).length} cours en cours.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsGrid} aria-label="Vos statistiques">
        {[
          { label: "Cours achetés",       val: coursesBoughtCount },
          { label: "CourseUnits terminés",  val: courseUnitsCompletedCount },
          { label: "Certificats obtenus", val: certificatesCount },
          { label: "Heures apprises",     val: `${hoursLearned}h` },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statVal}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* ── Cours en cours ── */}
      <section aria-labelledby="courses-heading">
        <div className={styles.sectionHeader}>
          <h2 id="courses-heading" className={styles.sectionTitle}>Cours en cours</h2>
          <Link href="/dashboard/mes-cours" className={styles.seeAll}>Voir tous →</Link>
        </div>

        {coursesInProgress.length === 0 ? (
          <div className={styles.emptyCard} style={{ padding: "2rem", textAlign: "center", background: "var(--bg-card)", borderRadius: "var(--radius-md)" }}>
            <p style={{ color: "var(--fg-muted)" }}>Vous n&apos;avez pas encore rejoint de cours.</p>
            <Link href="/catalogue" className={styles.seeAll} style={{ display: "inline-block", marginTop: "1rem" }}>Découvrir le catalogue</Link>
          </div>
        ) : (
          <ul className={styles.coursesList} aria-label="Vos cours en cours">
            {coursesInProgress.map((course) => (
              <li key={course.id}>
                <Link href={`/cours/${course.slug}/apprendre`} className={styles.courseRow}>
                  <div
                    className={styles.courseThumb}
                    style={{ background: course.thumbBg }}
                    aria-hidden="true"
                  >
                    {course.emoji}
                  </div>

                  <div className={styles.courseInfo}>
                    <p className={styles.courseTitle}>{course.title}</p>
                    <p className={styles.courseMeta}>
                      {course.completed
                        ? "Cours terminé"
                        : `CourseUnit ${course.currentCourseUnit} sur ${course.totalCourseUnits}`
                      } · {course.category}
                    </p>
                  </div>

                  <div className={styles.progressWrap}>
                    <div
                      className={styles.progressBar}
                      role="progressbar"
                      aria-valuenow={course.progressPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progression : ${course.progressPct}%`}
                    >
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${course.progressPct}%`,
                          background: course.completed ? "var(--success)" : "var(--primary)",
                        }}
                      />
                    </div>
                    {course.completed ? (
                      <span className={styles.progressDone}>
                        <i className="ti ti-check" aria-hidden="true" /> Terminé
                      </span>
                    ) : (
                      <span className={styles.progressPct}>{course.progressPct}%</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Grille inférieure : Certificats + Souhaits ── */}
      <div className={styles.bottomGrid}>

        {/* Certificats */}
        <section className={styles.card} aria-labelledby="certs-heading">
          <div className={styles.sectionHeader}>
            <h2 id="certs-heading" className={styles.sectionTitle}>Certificats obtenus</h2>
            <Link href="/dashboard/certificats" className={styles.seeAll}>Voir tous →</Link>
          </div>

          {certs.length === 0 ? (
            <p style={{ color: "var(--fg-muted)", padding: "1rem" }}>Aucun certificat obtenu pour le moment.</p>
          ) : (
            <ul className={styles.certsList} aria-label="Vos certificats">
              {certs.slice(0, 3).map((cert) => (
                <li key={cert.id} className={styles.certItem}>
                  <div className={styles.certIcon} aria-hidden="true">
                    <i className="ti ti-certificate" />
                  </div>
                  <div className={styles.certInfo}>
                    <p className={styles.certTitle}>{cert.courseTitle}</p>
                    <p className={styles.certDate}>Obtenu le {formatDate(cert.issuedAt)}</p>
                  </div>
                  <div className={styles.certActions}>
                    <a
                      href={certificateApi.downloadUrl(cert.id)}
                      className={styles.iconBtn}
                      aria-label={`Télécharger le certificat ${cert.courseTitle}`}
                      title="Télécharger"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="ti ti-download" aria-hidden="true" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Liste de souhaits (depuis localStorage) */}
        <section className={styles.card} aria-labelledby="wishlist-heading">
          <div className={styles.sectionHeader}>
            <h2 id="wishlist-heading" className={styles.sectionTitle}>Liste de souhaits</h2>
            <Link href="/dashboard/souhaits" className={styles.seeAll}>Voir tous →</Link>
          </div>

          <p style={{ color: "var(--fg-muted)", padding: "1rem" }}>Votre liste de souhaits est vide.</p>
        </section>
      </div>
    </main>
  );
}