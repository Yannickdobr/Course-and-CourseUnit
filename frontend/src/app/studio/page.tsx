"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, paymentApi, mediaSrc } from "@/lib/api";
import { Course } from "@/types/course";
import styles from "./page.module.css";

export default function StudioDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Tableau de bord Formateur — Studio EduFlex Pro";
  }, []);

  useEffect(() => {
    if (!user) return;
    const instructorName = user.name;
    async function loadStudioData() {
      try {
        const [mine, purchases] = await Promise.all([
          coursesApi.byInstructor(instructorName),
          paymentApi.getInstructorPurchases(instructorName)
        ]);
        setCourses(mine);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthRevenue = purchases
          .filter((p) => {
            const date = new Date(p.createdAt);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + p.net, 0);
        setMonthlyRevenue(thisMonthRevenue);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStudioData();
  }, [user]);

  async function handleTogglePublish(course: Course) {
    const next = !(course.published ?? true);
    setBusyId(course.id);
    try {
      await coursesApi.togglePublish(course.id, next);
      setCourses((cs) => cs.map((c) => (c.id === course.id ? { ...c, published: next } : c)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(`Supprimer définitivement « ${course.title} » ? Cette action est irréversible.`)) return;
    setBusyId(course.id);
    try {
      await coursesApi.deleteCourse(course.id);
      setCourses((cs) => cs.filter((c) => c.id !== course.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement du studio...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mes cours</h1>
          <p className={styles.sub}>Gérez, mettez à jour et publiez vos cours.</p>
        </div>
        <Link href="/studio/cours/nouveau" className={styles.btnPrimary}>
          <i className="ti ti-circle-plus" aria-hidden="true" />
          Nouveau cours
        </Link>
      </div>

      {/* Stats rapides */}
      <div className={styles.stats}>
        {[
          { label: "Cours publiés", val: String(courses.filter((c) => c.published ?? true).length) },
          { label: "Apprenants",    val: courses.reduce((a, c) => a + c.studentCount, 0).toLocaleString("fr-FR") },
          { label: "Revenus (mois)", val: monthlyRevenue.toLocaleString("fr-FR") + " XAF" },
          { label: "Note moyenne",   val: courses.length > 0 ? (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1) + " ★" : "—" },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statVal}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Liste des cours */}
      <div className={styles.courseList}>
        {courses.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--fg-muted)" }}>Vous n&apos;avez pas encore créé de cours.</p>
            <Link href="/studio/cours/nouveau" className={styles.btnPrimary} style={{ display: "inline-block", marginTop: "1rem" }}>
              Créer votre premier cours
            </Link>
          </div>
        ) : (
          courses.map((course) => {
            const vs = course.validationStatus || (course.published ? "PUBLISHED" : "DRAFT");
            const isActive = vs === "PUBLISHED" && (course.published ?? true);
            const busy = busyId === course.id;
            const badge =
              vs === "PUBLISHED" ? (course.published ?? true)
                ? { label: "Publié",     style: { background: "#d1f7e0", color: "#0a7d40", border: "1px solid #34c77b" } }
                : { label: "Désactivé",  style: { background: "#eee",    color: "#777",    border: "1px solid #ccc" } }
              : vs === "SUBMITTED" ? { label: "En attente", style: { background: "#fff3cd", color: "#856404", border: "1px solid #ffc107" } }
              : vs === "REJECTED"  ? { label: "Rejeté",     style: { background: "#fde2e1", color: "#c0392b", border: "1px solid #e74c3c" } }
              : { label: "Brouillon", style: { background: "#eef", color: "#556", border: "1px solid #ccd" } };
            return (
            <div key={course.id} className={styles.courseRow} style={isActive ? undefined : { opacity: 0.8 }}>
              <div
                className={styles.thumb}
                style={{ background: course.thumbGradient, overflow: "hidden" }}
                aria-hidden
              >
                {course.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaSrc(course.thumbUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  course.emoji
                )}
              </div>
              <div className={styles.info}>
                <p className={styles.courseTitle}>{course.title}</p>
                <p className={styles.courseMeta}>
                  {course.category} · {course.level} ·{" "}
                  {course.courseUnitCount} unités
                </p>
                {vs === "REJECTED" && course.rejectReason && (
                  <p style={{ fontSize: "0.78rem", color: "#c0392b", marginTop: 4 }}>
                    <i className="ti ti-alert-triangle" aria-hidden="true" /> Motif : {course.rejectReason}
                  </p>
                )}
                {vs === "SUBMITTED" && (
                  <p style={{ fontSize: "0.78rem", color: "#856404", marginTop: 4 }}>
                    <i className="ti ti-clock" aria-hidden="true" /> En cours de relecture par un administrateur.
                  </p>
                )}
              </div>
              <div className={styles.coursePricing}>
                <p className={styles.price}>
                  {course.price.toLocaleString("fr-FR")} XAF
                </p>
                <p className={styles.priceNote}>cours complet</p>
              </div>
              <div className={styles.courseStudents}>
                <p className={styles.studentsVal}>
                  {course.studentCount.toLocaleString("fr-FR")}
                </p>
                <p className={styles.studentsLabel}>apprenants</p>
              </div>
              <span className={styles.statusBadge} style={badge.style}>
                {badge.label}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link
                  href={`/studio/cours/${course.slug}`}
                  className={styles.editBtn}
                  aria-label={`Modifier ${course.title}`}
                >
                  <i className="ti ti-edit" aria-hidden="true" />
                  Modifier
                </Link>
                {vs === "PUBLISHED" && (
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleTogglePublish(course)}
                    disabled={busy}
                    aria-label={isActive ? `Désactiver ${course.title}` : `Réactiver ${course.title}`}
                  >
                    <i className={`ti ${isActive ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
                    {isActive ? "Désactiver" : "Réactiver"}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleDelete(course)}
                  disabled={busy}
                  style={{ color: "var(--danger, #d33)", borderColor: "var(--danger, #d33)" }}
                  aria-label={`Supprimer ${course.title}`}
                >
                  <i className="ti ti-trash" aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}