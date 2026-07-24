import type { Metadata } from "next";
import { authApi } from "@/lib/api";
import MentorFilters from "./components/MentorFilters";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Nos Formateurs — EduFlex Pro",
  description:
    "Découvrez nos formateurs experts. Professionnels certifiés, passionnés par l'enseignement et actifs dans leur domaine.",
};

async function getMentors() {
  try {
    return await authApi.getMentors();
  } catch {
    return [];
  }
}

export default async function FormateursPage() {
  const mentors = await getMentors();

  /* Quelques stats agrégées pour le hero */
  const totalStudents = mentors.reduce((acc, m) => acc + m.studentCount, 0);
  const avgRating = mentors.length > 0 ? (
    mentors.reduce((acc, m) => acc + m.rating, 0) / mentors.length
  ).toFixed(1) : "5.0";

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} container`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Formateurs</span>
            <h1>Des experts qui partagent leur passion</h1>
            <p className={styles.heroSub}>
              Nos formateurs sont des professionnels actifs, rigoureusement sélectionnés
              pour leur expertise et leur pédagogie. Apprenez des meilleurs.
            </p>
          </div>

          {/* Mini stats */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>{mentors.length}+</span>
              <span className={styles.heroStatLabel}>Formateurs experts</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>
                {(totalStudents / 1000).toFixed(0)}k+
              </span>
              <span className={styles.heroStatLabel}>Élèves formés</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>⭐ {avgRating}</span>
              <span className={styles.heroStatLabel}>Note moyenne</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filtres + Grille ── */}
      <section className={`${styles.content} container`}>
        <MentorFilters mentors={mentors} />
      </section>

      {/* ── Devenir formateur CTA ── */}
      <section className={styles.ctaSection}>
        <div className={`${styles.ctaInner} container`}>
          <div>
            <h2>Vous êtes expert dans votre domaine ?</h2>
            <p className={styles.ctaSub}>
              Rejoignez nos formateurs, partagez vos connaissances et monétisez votre expertise.
              Créez vos cours et courseUnits à votre rythme.
            </p>
          </div>
          <a href="/inscription?role=formateur" className="btn-primary">
            Devenir formateur →
          </a>
        </div>
      </section>
    </main>
  );
}