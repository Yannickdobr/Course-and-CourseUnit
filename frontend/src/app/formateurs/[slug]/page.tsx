import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { coursesApi, authApi } from "@/lib/api";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mentors = await authApi.getMentors();
  const mentor = mentors.find((m) => m.slug === slug);
  if (!mentor) return {};
  return {
    title: `${mentor.name} — Formateur EduFlex Pro`,
    description: mentor.bio,
  };
}

export default async function MentorDetailPage({ params }: Props) {
  const { slug } = await params;
  const mentors = await authApi.getMentors();
  const mentor = mentors.find((m) => m.slug === slug);
  if (!mentor) notFound();

  let courses: any[] = [];
  try {
    const apiCourses = await coursesApi.list();
    courses = apiCourses.filter((c) => c.instructor === mentor.name);
  } catch {
    // Empty if error
  }

  return (
    <main className={styles.page}>
      {/* Breadcrumb */}
      <div className={`${styles.breadcrumb} container`}>
        <Link href="/">Accueil</Link>
        <span>/</span>
        <Link href="/formateurs">Formateurs</Link>
        <span>/</span>
        <span>{mentor.name}</span>
      </div>

      {/* Hero */}
      <section className={`${styles.hero} container`}>
        <div
          className={styles.avatarLg}
          style={{ background: mentor.avatarGradient }}
          aria-hidden
        >
          <span>{mentor.avatar}</span>
          {mentor.isVerified && (
            <span className={styles.verifiedBig} title="Formateur vérifié">✓</span>
          )}
        </div>

        <div className={styles.heroInfo}>
          <div className={styles.nameLine}>
            <h1 className={styles.name}>{mentor.name}</h1>
            {mentor.badge && (
              <span className={styles.badge}>{mentor.badge}</span>
            )}
          </div>
          <p className={styles.title}>{mentor.title}</p>
          <p className={styles.bio}>{mentor.bio}</p>

          <div className={styles.chips}>
            <span className={styles.chip}>📚 {mentor.courseCount} cours</span>
            <span className={styles.chip}>
              👥{" "}
              {mentor.studentCount >= 1000
                ? `${(mentor.studentCount / 1000).toFixed(1)}k`
                : mentor.studentCount}{" "}
              élèves
            </span>
            <span className={styles.chip}>⭐ {mentor.rating} ({mentor.reviewCount} avis)</span>
            <span className={styles.chip}>🏅 {mentor.experienceYears} ans d&apos;expérience</span>
            {mentor.languages.map((l) => (
              <span key={l} className={styles.chipLang}>🌐 {l}</span>
            ))}
          </div>

          <Link href="/connexion" className="btn-primary" style={{ marginTop: "1rem" }}>
            Contacter le formateur
          </Link>
        </div>
      </section>

      {/* Courses by this mentor */}
      {courses.length > 0 && (
        <section className={`${styles.courses} container`}>
          <h2>Cours de {mentor.name}</h2>
          <div className={styles.courseGrid}>
            {courses.map((c) => (
              <Link key={c.id} href={`/cours/${c.slug}`} className={styles.courseCard}>
                <div
                  className={styles.courseThumb}
                  style={{ background: c.thumbGradient }}
                >
                  <span>{c.emoji}</span>
                </div>
                <div className={styles.courseBody}>
                  <p className={styles.courseCategory}>{c.category}</p>
                  <h3 className={styles.courseTitle}>{c.title}</h3>
                  <div className={styles.courseMeta}>
                    <span>⭐ {c.rating}</span>
                    <span>{c.courseUnitCount} courseUnits</span>
                    <span className={styles.coursePrice}>
                      dès {c.priceUnit.toLocaleString("fr-FR")} XAF
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div className={`${styles.backRow} container`}>
        <Link href="/formateurs" className="btn-outline">← Retour aux formateurs</Link>
      </div>
    </main>
  );
}