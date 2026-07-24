"use client";

import { useState, useMemo, useTransition } from "react";
import { Course, CatalogueFilters as FiltersType, SortOption } from "@/types/course";
import CourseCard from "./CourseCard";
import styles from "./CatalogueFilters.module.css";

const LEVELS = ["", "Débutant", "Intermédiaire", "Avancé"] as const;

const SORT_LABELS: Record<SortOption, string> = {
  popularity: "Popularité",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
  rating: "Meilleures notes",
  newest: "Plus récents",
};

function sortCourses(list: Course[], sort: SortOption): Course[] {
  const copy = [...list];
  switch (sort) {
    case "price_asc":   return copy.sort((a, b) => a.priceUnit - b.priceUnit);
    case "price_desc":  return copy.sort((a, b) => b.priceUnit - a.priceUnit);
    case "rating":      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":      return copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    default:            return copy.sort((a, b) => b.studentCount - a.studentCount);
  }
}

export default function CatalogueFilters({
  courses,
  initialCategory = "Tous",
}: {
  courses: Course[];
  initialCategory?: string;
}) {
  const [filters, setFilters] = useState<FiltersType>({
    query: "",
    category: initialCategory,
    level: "",
    sort: "popularity",
    maxPrice: null,
  });

  const CATEGORIES = useMemo(() => {
    const cats = Array.from(new Set(courses.map((c) => c.category)));
    return ["Tous", ...cats];
  }, [courses]);

  const [, startTransition] = useTransition();

  const update = <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => {
    startTransition(() => setFilters((f) => ({ ...f, [key]: value })));
  };

  const filtered = useMemo(() => {
    const list = courses.filter((c) => {
      const matchCat = filters.category === "Tous" || c.category === filters.category;
      const matchLevel = !filters.level || c.level === filters.level;
      const matchQuery =
        !filters.query ||
        c.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        c.instructor.toLowerCase().includes(filters.query.toLowerCase()) ||
        c.category.toLowerCase().includes(filters.query.toLowerCase());
      const matchPrice = !filters.maxPrice || c.priceUnit <= filters.maxPrice;
      return matchCat && matchLevel && matchQuery && matchPrice;
    });
    return sortCourses(list, filters.sort);
  }, [courses, filters]);

  return (
    <>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Rechercher un cours, un formateur…"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            aria-label="Rechercher un cours"
          />
        </div>

        {/* Sort */}
        <select
          className={styles.select}
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value as SortOption)}
          aria-label="Trier par"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((k) => (
            <option key={k} value={k}>{SORT_LABELS[k]}</option>
          ))}
        </select>

        {/* Level */}
        <select
          className={styles.select}
          value={filters.level}
          onChange={(e) => update("level", e.target.value as FiltersType["level"])}
          aria-label="Filtrer par niveau"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l || "Tous niveaux"}</option>
          ))}
        </select>
      </div>

      {/* ── Category tags ── */}
      <div className={styles.tagRow} aria-label="Filtrer par catégorie">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.tag} ${filters.category === cat ? styles.tagActive : ""}`}
            onClick={() => update("category", cat)}
            aria-pressed={filters.category === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Results bar ── */}
      <div className={styles.resultsBar}>
        <p className={styles.resultsCount} aria-live="polite">
          {filtered.length} cours trouvé{filtered.length !== 1 ? "s" : ""}
        </p>
        {(filters.query || filters.category !== "Tous" || filters.level) && (
          <button
            className={styles.clearBtn}
            onClick={() => setFilters({ query: "", category: "Tous", level: "", sort: "popularity", maxPrice: null })}
          >
            Réinitialiser les filtres ×
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun cours ne correspond à votre recherche.</p>
          <button
            className={styles.clearBtn}
            onClick={() => setFilters({ query: "", category: "Tous", level: "", sort: "popularity", maxPrice: null })}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <ul className={styles.grid} aria-label="Liste des cours">
          {filtered.map((course) => (
            <li key={course.id} className={styles.gridItem}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
