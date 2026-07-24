"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CourseProgress } from "@/types/learner";
import styles from "./page.module.css";

type StatusFilter = "tous" | "en_cours" | "termines";
type SortOption = "recent" | "progression" | "alpha";
type ViewMode = "liste" | "grille";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Récemment consultés",
  progression: "Progression",
  alpha: "Ordre alphabétique",
};

function statusStyle(completed: boolean) {
  return completed
    ? { background: "var(--success-light)", color: "var(--success)" }
    : { background: "var(--primary-light)", color: "var(--primary)" };
}

export default function MesCoursList({ courses }: { courses: CourseProgress[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("tous");
  const [sort, setSort] = useState<SortOption>("recent");
  const [view, setView] = useState<ViewMode>("liste");

  const counts = useMemo(
    () => ({
      tous: courses.length,
      en_cours: courses.filter((c) => !c.completed).length,
      termines: courses.filter((c) => c.completed).length,
    }),
    [courses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) => {
      const matchStatus =
        status === "tous" ||
        (status === "en_cours" && !c.completed) ||
        (status === "termines" && c.completed);
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "progression":
          return b.progressPct - a.progressPct;
        case "alpha":
          return a.title.localeCompare(b.title, "fr");
        default:
          return (
            new Date(b.lastAccessedAt).getTime() -
            new Date(a.lastAccessedAt).getTime()
          );
      }
    });
  }, [courses, query, status, sort]);

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "en_cours", label: "En cours" },
    { key: "termines", label: "Terminés" },
  ];

  function resetFilters() {
    setQuery("");
    setStatus("tous");
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Rechercher dans mes cours…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher dans mes cours"
          />
          {query && (
            <button
              className={styles.clearSearch}
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className={styles.toolbarRight}>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Trier mes cours"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
              <option key={k} value={k}>{SORT_LABELS[k]}</option>
            ))}
          </select>

          <div className={styles.viewToggle} role="group" aria-label="Mode d'affichage">
            <button
              className={`${styles.viewBtn} ${view === "liste" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("liste")}
              aria-pressed={view === "liste"}
              aria-label="Vue liste"
            >
              <i className="ti ti-list" aria-hidden="true" />
            </button>
            <button
              className={`${styles.viewBtn} ${view === "grille" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("grille")}
              aria-pressed={view === "grille"}
              aria-label="Vue grille"
            >
              <i className="ti ti-layout-grid" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className={styles.filters} role="tablist" aria-label="Filtrer par statut">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={status === key}
            className={`${styles.filterBtn} ${status === key ? styles.filterActive : ""}`}
            onClick={() => setStatus(key)}
          >
            {label}
            <span className={styles.filterCount}>{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* ── Résultats ── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">📚</span>
          <h2 className={styles.emptyTitle}>Aucun cours trouvé</h2>
          <p className={styles.emptySub}>
            {courses.length === 0
              ? "Vous n'avez pas encore commencé de cours."
              : "Aucun cours ne correspond à votre recherche."}
          </p>
          <button className={styles.btnReset} onClick={resetFilters}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : view === "liste" ? (
        /* ── Vue LISTE ── */
        <div className={styles.listContainer}>
          {filtered.map((course) => (
            <div key={course.id} className={styles.listRow}>
              <div
                className={styles.listThumb}
                style={{ background: course.thumbBg }}
                aria-hidden="true"
              >
                {course.emoji}
              </div>

              <div className={styles.listInfo}>
                <p className={styles.listCategory}>{course.category}</p>
                <p className={styles.listTitle}>{course.title}</p>
                <p className={styles.listMeta}>
                  {course.completed
                    ? "Cours terminé"
                    : `CourseUnit ${course.currentCourseUnit} / ${course.totalCourseUnits}`}
                </p>
              </div>

              <div className={styles.listProgress}>
                <div className={styles.listProgressBar}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${course.progressPct}%`,
                      background: course.completed ? "var(--success)" : "var(--primary)",
                    }}
                  />
                </div>
                <span className={styles.listProgressMeta}>{course.progressPct}% complété</span>
              </div>

              <span className={styles.listStatus} style={statusStyle(course.completed)}>
                {course.completed ? "Terminé" : "En cours"}
              </span>

              <div className={styles.listActions}>
                <Link href={`/cours/${course.slug}/apprendre`} className={styles.btnContinue}>
                  <i className="ti ti-player-play" aria-hidden="true" />
                  {course.completed ? "Revoir" : "Continuer"}
                </Link>
                <Link
                  href={`/cours/${course.slug}`}
                  className={styles.btnDetails}
                  aria-label={`Voir la fiche de ${course.title}`}
                >
                  <i className="ti ti-info-circle" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Vue GRILLE ── */
        <div className={styles.gridContainer}>
          {filtered.map((course) => (
            <div key={course.id} className={styles.gridCard}>
              <div className={styles.gridCardTop}>
                <div
                  className={styles.gridThumb}
                  style={{ background: course.thumbBg }}
                  aria-hidden="true"
                >
                  {course.emoji}
                </div>
                <span className={styles.statusChip} style={statusStyle(course.completed)}>
                  {course.completed ? "Terminé" : "En cours"}
                </span>
              </div>

              <p className={styles.gridCategory}>{course.category}</p>
              <h3 className={styles.gridTitle}>{course.title}</h3>

              <div className={styles.gridProgress}>
                <div className={styles.progressBarBg}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${course.progressPct}%`,
                      background: course.completed ? "var(--success)" : "var(--primary)",
                    }}
                  />
                </div>
                <span className={styles.progressLabel}>{course.progressPct}%</span>
              </div>

              <p className={styles.gridMeta}>
                {course.completed
                  ? "Cours terminé"
                  : `CourseUnit ${course.currentCourseUnit} / ${course.totalCourseUnits}`}
              </p>

              <div className={styles.gridActions}>
                <Link href={`/cours/${course.slug}/apprendre`} className={styles.btnContinue}>
                  <i className="ti ti-player-play" aria-hidden="true" />
                  {course.completed ? "Revoir" : "Continuer"}
                </Link>
                <Link
                  href={`/cours/${course.slug}`}
                  className={styles.btnDetails}
                  aria-label={`Voir la fiche de ${course.title}`}
                >
                  <i className="ti ti-info-circle" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bannière ── */}
      <div className={styles.bottomBanner}>
        <div className={styles.bottomBannerText}>
          <i className="ti ti-bulb" aria-hidden="true" />
          <span>Envie d&apos;apprendre quelque chose de nouveau ?</span>
        </div>
        <Link href="/catalogue" className={styles.bottomBannerBtn}>
          Explorer le catalogue →
        </Link>
      </div>
    </>
  );
}
