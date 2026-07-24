import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog — EduFlex Pro",
  description:
    "Conseils d'apprentissage, tendances tech, témoignages et actualités de la plateforme e-learning EduFlex Pro.",
};

const CATEGORIES = ["Tous", "Apprentissage", "Carrière", "Tech", "Formateurs", "Produit"];

const FEATURED = {
  tag: "À la une",
  title: "Apprendre par courseUnit : pourquoi le micro-learning change tout",
  excerpt:
    "L'achat à l'unité n'est pas qu'une question de prix. Découvrez comment le découpage en courseUnits améliore la rétention, la motivation et l'accessibilité de la formation en ligne.",
  emoji: "📚",
  bg: "linear-gradient(135deg,#1a1060,#3b2fa0)",
  author: "Awa M.", authorBg: "#7C3AED", date: "5 juin 2026", read: "6 min",
};

const POSTS = [
  { tag: "Carrière", title: "5 compétences tech les plus demandées en Afrique francophone en 2026", excerpt: "Du développement web à la data science, voici les domaines qui recrutent le plus.", emoji: "🚀", bg: "linear-gradient(135deg,#003d2a,#006644)", author: "Koffi M.", authorBg: "#059669", date: "2 juin 2026", read: "5 min" },
  { tag: "Apprentissage", title: "Comment rester motivé quand on apprend en ligne", excerpt: "Des techniques concrètes pour tenir vos objectifs et finir vos cours.", emoji: "🎯", bg: "linear-gradient(135deg,#3a0030,#8b0050)", author: "Fatou N.", authorBg: "#db2777", date: "28 mai 2026", read: "4 min" },
  { tag: "Tech", title: "React 19 : ce qui change pour les développeurs", excerpt: "Server Components, Actions et nouveautés à connaître pour rester à jour.", emoji: "⚛️", bg: "linear-gradient(135deg,#1a1060,#3b2fa0)", author: "Koffi M.", authorBg: "#7C3AED", date: "24 mai 2026", read: "8 min" },
  { tag: "Formateurs", title: "Bien tarifer ses courseUnits : le guide complet", excerpt: "Trouvez le juste prix pour maximiser ventes et satisfaction de vos élèves.", emoji: "💰", bg: "linear-gradient(135deg,#1a1000,#4a3000)", author: "Béatrice Y.", authorBg: "#F97316", date: "20 mai 2026", read: "7 min" },
  { tag: "Produit", title: "Nouveauté : téléchargement hors-ligne sur mobile", excerpt: "Apprenez partout, même sans connexion, grâce à notre nouvelle fonctionnalité.", emoji: "📱", bg: "linear-gradient(135deg,#002040,#0055a0)", author: "Équipe EduFlex", authorBg: "#7C3AED", date: "15 mai 2026", read: "3 min" },
  { tag: "Apprentissage", title: "Mobile Money : payer sa formation n'a jamais été aussi simple", excerpt: "Orange Money, MTN MoMo, Wave : on vous explique tout.", emoji: "💳", bg: "linear-gradient(135deg,#1a0000,#600010)", author: "Awa M.", authorBg: "#db2777", date: "10 mai 2026", read: "4 min" },
];

function PostMeta({ author, authorBg, date, read }: { author: string; authorBg: string; date: string; read: string }) {
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

export default function BlogPage() {
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
          {CATEGORIES.map((c, i) => (
            <Link key={c} href="/blog" className={`${styles.catChip} ${i === 0 ? styles.catActive : ""}`}>
              {c}
            </Link>
          ))}
        </div>

        {/* Article à la une */}
        <article className={styles.featured}>
          <div className={styles.featuredThumb} style={{ background: FEATURED.bg }} aria-hidden="true">
            {FEATURED.emoji}
          </div>
          <div className={styles.featuredBody}>
            <span className={styles.featuredTag}>{FEATURED.tag}</span>
            <h2 className={styles.featuredTitle}>{FEATURED.title}</h2>
            <p className={styles.featuredExcerpt}>{FEATURED.excerpt}</p>
            <PostMeta {...FEATURED} />
          </div>
        </article>

        {/* Grille d'articles */}
        <div className={styles.grid}>
          {POSTS.map((p) => (
            <Link key={p.title} href="/blog" className={styles.card}>
              <div className={styles.cardThumb} style={{ background: p.bg }} aria-hidden="true">{p.emoji}</div>
              <div className={styles.cardBody}>
                <span className={styles.cardTag}>{p.tag}</span>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardExcerpt}>{p.excerpt}</p>
                <PostMeta {...p} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
