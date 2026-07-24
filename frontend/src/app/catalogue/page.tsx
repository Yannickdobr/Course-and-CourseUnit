import type { Metadata } from "next";
import { coursesApi } from "@/lib/api";
import CatalogueFilters from "./components/CatalogueFilters";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Catalogue des cours — EduFlex Pro",
  description:
    "Explorez des centaines de cours en ligne. Achetez par courseUnit ou en pack, choisissez votre niveau et votre budget.",
};

async function getCourses() {
  try {
    return await coursesApi.list();
  } catch {
    return [];
  }
}

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function CataloguePage({ searchParams }: Props) {
  const courses = await getCourses();
  const { cat } = await searchParams;
  const initialCategory = cat || "Tous";

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} container`}>
          <div>
            <span className={styles.heroBadge}>Catalogue</span>
            <h1>Explorez nos cours</h1>
            <p className={styles.heroSub}>
              Des centaines de courseUnits à acheter à l&apos;unité ou en pack.
              Filtrez par catégorie, niveau ou budget et commencez en quelques minutes.
            </p>
          </div>
          <div className={styles.heroIcon} aria-hidden="true">
            <i className="ti ti-books" />
          </div>
        </div>
      </section>

      {/* ── Filtres + Grille ── */}
      <section className={`${styles.content} container`}>
        <CatalogueFilters courses={courses} initialCategory={initialCategory} />
      </section>
    </main>
  );
}