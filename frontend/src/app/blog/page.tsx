import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogPost } from "@/data/blog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog — EduFlex Pro",
  description:
    "Conseils d'apprentissage, tendances tech, témoignages et actualités de la plateforme e-learning EduFlex Pro.",
};

function PostMeta({ author, authorBg, date, read }: Pick<BlogPost, "author" | "authorBg" | "date" | "read">) {
  return (
    <div className={styles.meta}>
      <span className={styles.metaAvatar} style={{ background: authorBg }} aria-hidden="true">
        {author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
      </span>
      {author}
      <span className={styles.metaDot}>·</span> {date}
      <span className={styles.metaDot}>·</span> {read}
    </div>
  );
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const active = cat && BLOG_CATEGORIES.includes(cat) ? cat : "Tous";

  const featured = BLOG_POSTS.find((p) => p.featured);
  const rest = BLOG_POSTS.filter((p) => !p.featured);
  const posts = active === "Tous" ? rest : rest.filter((p) => p.tag === active);
  const showFeatured = featured && (active === "Tous" || featured.tag === active);

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}><i className="ti ti-news" aria-hidden="true" /> Le blog</span>
          <h1 className={styles.heroTitle}>Conseils, tendances & actualités</h1>
          <p className={styles.heroSub}>
            Tout pour apprendre mieux, enseigner plus efficacement et suivre l&apos;évolution de la tech.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Catégories */}
        <div className={styles.cats}>
          {BLOG_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={c === "Tous" ? "/blog" : `/blog?cat=${encodeURIComponent(c)}`}
              className={`${styles.catChip} ${c === active ? styles.catActive : ""}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Article à la une */}
        {showFeatured && featured && (
          <Link href={`/blog/${featured.slug}`} className={styles.featured} style={{ textDecoration: "none" }}>
            <div className={styles.featuredThumb} style={{ background: featured.bg }} aria-hidden="true">
              {featured.emoji}
            </div>
            <div className={styles.featuredBody}>
              <span className={styles.featuredTag}>À la une</span>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <PostMeta {...featured} />
            </div>
          </Link>
        )}

        {/* Grille d'articles */}
        <div className={styles.grid}>
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
              <div className={styles.cardThumb} style={{ background: p.bg }} aria-hidden="true">{p.emoji}</div>
              <div className={styles.cardBody}>
                <span className={styles.cardTag}>{p.tag}</span>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardExcerpt}>{p.excerpt}</p>
                <PostMeta {...p} />
              </div>
            </Link>
          ))}
          {posts.length === 0 && !showFeatured && (
            <p style={{ color: "var(--text-muted)", padding: "2rem 0" }}>Aucun article dans cette catégorie pour l&apos;instant.</p>
          )}
        </div>
      </div>
    </main>
  );
}
