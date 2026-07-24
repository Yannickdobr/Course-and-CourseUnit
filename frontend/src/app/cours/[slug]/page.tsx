import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { coursesApi } from "@/lib/api";
import CourseInteractive from "../components/CourseInteractive";
import styles from "./page.module.css";

interface Props { params: Promise<{ slug: string }> }

/* ── Metadata ── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await coursesApi.getDetailBySlug(slug);
  if (!course) return {};
  return {
    title: `${course.title} — EduFlex Pro`,
    description: course.tagline,
  };
}

/* ── Helpers ── */
function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}
function stars(n: number) {
  return "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "½" : "");
}

/* ── Page ── */
export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await coursesApi.getDetailBySlug(slug);
  if (!course) notFound();

  const totalCourseUnits = course.sections.reduce((a, s) => a + s.courseUnits.length, 0);
  const freeCourseUnits  = course.sections.flatMap((s) => s.courseUnits).filter((c) => c.isFree).length;

  const badgeColor =
    course.badgeType === "promo" ? styles.badgeOrange :
    course.badgeType === "new"   ? styles.badgeOrange :
    styles.badgeDefault;

  return (
    <main>
      {/* ── Hero Banner ── */}
      <div className={styles.hero}>
        <div className={`${styles.heroInner} container`}>

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden>/</span>
            <Link href="/catalogue">Catalogue</Link>
            <span aria-hidden>/</span>
            <Link href={`/catalogue?cat=${encodeURIComponent(course.category)}`}>
              {course.category}
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{course.title}</span>
          </nav>

          {/* Title block */}
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              {course.badge && (
                <span className={`${styles.badge} ${badgeColor}`}>{course.badge}</span>
              )}
              <h1 className={styles.heroTitle}>{course.title}</h1>
              <p className={styles.heroTagline}>{course.tagline}</p>

              {/* Meta row */}
              <div className={styles.heroMeta}>
                <span className={styles.rating} aria-label={`Note ${course.rating} sur 5`}>
                  <span className={styles.ratingStars}>{stars(course.rating)}</span>
                  <strong>{course.rating.toFixed(1)}</strong>
                  <span className={styles.ratingCount}>({course.reviewCount} avis)</span>
                </span>
                <span className={styles.metaSep} aria-hidden>·</span>
                <span>
                  <strong>{course.studentCount.toLocaleString("fr-FR")}</strong> élèves
                </span>
                <span className={styles.metaSep} aria-hidden>·</span>
                <span>{course.level}</span>
                <span className={styles.metaSep} aria-hidden>·</span>
                <span>{course.language}</span>
              </div>

              {/* Instructor line */}
              <p className={styles.heroInstructor}>
                Cours créé par{" "}
                <Link href={`/formateurs/${course.instructorSlug}`} className={styles.instructorLink}>
                  {course.instructor}
                </Link>
              </p>

              {/* Quick facts */}
              <div className={styles.quickFacts}>
                <span><i className="ti ti-clock" aria-hidden /> {fmt(course.totalDuration)} de contenu</span>
                <span><i className="ti ti-book" aria-hidden /> {totalCourseUnits} courseUnits</span>
                <span><i className="ti ti-eye" aria-hidden /> {freeCourseUnits} aperçu{freeCourseUnits > 1 ? "s" : ""} gratuits</span>
                <span><i className="ti ti-refresh" aria-hidden /> Mis à jour{" "}
                  {new Date(course.lastUpdated).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div
              className={styles.heroThumb}
              style={{ background: course.thumbGradient }}
              aria-hidden
            >
              <span className={styles.heroEmoji}>{course.emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`${styles.body} container`}>

        {/* Ce que vous apprendrez */}
        <section className={styles.learnBox} aria-labelledby="learn-heading">
          <h2 id="learn-heading" className={styles.learnTitle}>
            <i className="ti ti-sparkles" aria-hidden /> Ce que vous apprendrez
          </h2>
          <ul className={styles.learnList}>
            {course.whatYouLearn.map((item, i) => (
              <li key={i} className={styles.learnItem}>
                <span className={styles.learnCheck} aria-hidden>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Objectifs du cours (renseignés par le formateur) */}
        {course.objectives?.trim() && (
          <section className={styles.learnBox} aria-labelledby="obj-heading">
            <h2 id="obj-heading" className={styles.learnTitle}>
              <i className="ti ti-target" aria-hidden /> Objectifs du cours
            </h2>
            <ul className={styles.learnList}>
              {course.objectives.split("\n").map((l) => l.trim()).filter(Boolean).map((item, i) => (
                <li key={i} className={styles.learnItem}>
                  <span className={styles.learnCheck} aria-hidden>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Compétences acquises */}
        {course.skills?.trim() && (
          <section className={styles.learnBox} aria-labelledby="skills-heading">
            <h2 id="skills-heading" className={styles.learnTitle}>
              <i className="ti ti-award" aria-hidden /> Compétences acquises
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {course.skills.split("\n").map((l) => l.trim()).filter(Boolean).map((s, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: "var(--radius-full)",
                  background: "var(--primary-light)", color: "var(--primary)",
                  fontSize: "0.82rem", fontWeight: 600,
                }}>
                  <i className="ti ti-check" aria-hidden /> {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Description + prérequis */}
        <section className={styles.descSection}>
          <div className={styles.descBlock}>
            <h2 className={styles.descTitle}>Description</h2>
            <p className={styles.descText}>{course.description}</p>
            <p className={styles.descText}>{course.targetAudience}</p>
          </div>

          <div className={styles.reqBlock}>
            <h3 className={styles.reqTitle}>Prérequis</h3>
            <ul className={styles.reqList}>
              {course.requirements.map((r, i) => (
                <li key={i}><span aria-hidden>→</span> {r}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Interactive: programme + avis + formateur + panel achat */}
        <CourseInteractive course={course} />

        {/* Autres cours recommandés */}
        <section className={styles.related} aria-labelledby="related-heading">
          <h2 id="related-heading" className={styles.relatedTitle}>
            D&apos;autres cours en {course.category}
          </h2>
          <Link href={`/catalogue?cat=${encodeURIComponent(course.category)}`} className="btn-outline">
            Voir tous les cours en {course.category} →
          </Link>
        </section>
      </div>
    </main>
  );
}