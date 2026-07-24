import styles from "./loading.module.css";

function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.thumb} />
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.short}`} />
        <div className={`${styles.line} ${styles.full}`} />
        <div className={`${styles.line} ${styles.mid}`} />
        <div className={`${styles.line} ${styles.short}`} />
      </div>
    </div>
  );
}

export default function CatalogueLoading() {
  return (
    <main aria-busy="true" aria-label="Chargement du catalogue…">
      <div className="container">
        <div className="skeleton-hero">
          <div className={`${styles.line} ${styles.labelLine}`} />
          <div className={`${styles.line} ${styles.titleLine}`} />
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
