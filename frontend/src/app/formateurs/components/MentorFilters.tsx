"use client";

import { useState, useMemo } from "react";
import { Mentor } from "@/types/mentor";
import MentorCard from "./MentorCard";
import styles from "./MentorFilters.module.css";

const PER_PAGE = 9;

export default function MentorFilters({ mentors }: { mentors: Mentor[] }) {
  const [activeSpec, setActiveSpec] = useState("Tous");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const MENTOR_SPECIALITIES = useMemo(() => {
    const specs = Array.from(new Set(mentors.map((m) => m.speciality)));
    return ["Tous", ...specs];
  }, [mentors]);

  const filtered = mentors.filter((m) => {
    const matchSpec = activeSpec === "Tous" || m.speciality === activeSpec;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.speciality.toLowerCase().includes(q);
    return matchSpec && matchQuery;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilter(spec: string) {
    setActiveSpec(spec);
    setPage(1);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setPage(1);
  }

  return (
    <>
      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden>🔍</span>
          <input
            type="search"
            placeholder="Rechercher un formateur, une expertise…"
            value={query}
            onChange={handleSearch}
            className={styles.searchInput}
            aria-label="Rechercher un formateur"
          />
        </div>
        <p className={styles.resultCount}>
          <strong>{filtered.length}</strong> formateur{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow} role="tablist" aria-label="Filtrer par spécialité">
        {MENTOR_SPECIALITIES.map((spec) => (
          <button
            key={spec}
            role="tab"
            aria-selected={activeSpec === spec}
            onClick={() => handleFilter(spec)}
            className={`${styles.filterBtn} ${activeSpec === spec ? styles.filterActive : ""}`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className={styles.grid}>
          {paginated.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden>🔭</span>
          <p>Aucun formateur trouvé pour cette recherche.</p>
          <button className="btn-outline" onClick={() => { setQuery(""); setActiveSpec("Tous"); }}>
            Réinitialiser
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Page précédente"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ""}`}
              onClick={() => setPage(p)}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Page suivante"
          >
            →
          </button>
        </nav>
      )}
    </>
  );
}