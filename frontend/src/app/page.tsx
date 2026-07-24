import Link from "next/link";
import type { Metadata } from "next";
import { coursesApi } from "@/lib/api";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "EduFlex Pro — Apprenez par courseUnit, payez ce qui compte",
  description:
    "La plateforme e-learning francophone qui vous permet d'acheter uniquement les courseUnits dont vous avez besoin.",
};

/* `cat` correspond aux catégories canoniques du catalogue (data/courses.ts) */
const CATEGORIES = [
  { name: "Développement Web", cat: "Dev Web",       count: 142, icon: "ti-code",       bg: "var(--primary-light)", color: "var(--primary)" },
  { name: "Data Science",       cat: "Data Science",  count: 98,  icon: "ti-chart-dots", bg: "var(--orange-light)",  color: "var(--orange)" },
  { name: "Business",           cat: "Business",      count: 76,  icon: "ti-trending-up",bg: "var(--success-light)", color: "var(--success)" },
  { name: "Design UI/UX",       cat: "Design",        count: 64,  icon: "ti-palette",    bg: "var(--pink-light)",    color: "var(--pink)" },
  { name: "Mobile",             cat: "Mobile",        count: 51,  icon: "ti-device-mobile", bg: "var(--primary-light)", color: "var(--primary)" },
  { name: "Cybersécurité",      cat: "Cybersécurité", count: 38,  icon: "ti-shield",     bg: "var(--orange-light)",  color: "var(--orange)" },
  { name: "IA / ML",            cat: "IA / ML",       count: 45,  icon: "ti-brain",      bg: "var(--success-light)", color: "var(--success)" },
  { name: "Cloud & DevOps",     cat: "Dev Web",       count: 29,  icon: "ti-cloud",      bg: "var(--pink-light)",    color: "var(--pink)" },
];

const STATS = [
  { num: "12 400+", label: "Apprenants actifs" },
  { num: "840",     label: "Cours publiés" },
  { num: "320",     label: "Formateurs experts" },
  { num: "4.8 ★",  label: "Note moyenne" },
];


const FEATURES = [
  { icon: "ti-package",       bg: "var(--primary-light)", color: "var(--primary)", title: "Achat par courseUnit",       desc: "Achetez uniquement les courseUnits qui vous intéressent, sans payer l'intégralité du cours." },
  { icon: "ti-refresh",       bg: "var(--orange-light)",  color: "var(--orange)",  title: "Contenu toujours à jour",  desc: "Les formateurs mettent à jour leurs cours après publication. Vous recevez les nouvelles versions automatiquement." },
  { icon: "ti-certificate",   bg: "var(--success-light)", color: "var(--success)", title: "Certificats vérifiables",  desc: "Obtenez un certificat avec QR Code partageable directement sur LinkedIn à la fin de chaque cours." },
  { icon: "ti-device-mobile", bg: "var(--pink-light)",    color: "var(--pink)",    title: "Mobile-first",             desc: "Application iOS & Android avec téléchargement hors-ligne pour apprendre partout." },
  { icon: "ti-credit-card",   bg: "var(--primary-light)", color: "var(--primary)", title: "Mobile Money inclus",      desc: "Paiement par carte, PayPal et Mobile Money (Orange, MTN, Wave…) pour toute l'Afrique." },
  { icon: "ti-award",         bg: "var(--orange-light)",  color: "var(--orange)",  title: "Forfaits intelligents",    desc: "Des packs de courseUnits à prix réduit pour optimiser votre budget." },
];

function badgeClass(badge: string) {
  return badge === "Bestseller" ? styles.badgeDefault : styles.badgeOrange;
}

export default async function Home() {
  let featuredCourses: any[] = [];
  try {
    const apiCourses = await coursesApi.list();
    featuredCourses = apiCourses.slice(0, 3);
  } catch (e) {
    // Empty if error
  }

  return (
    <>
      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={`${styles.heroInner} container`}>
            <div>
              <div className={styles.heroBadge}>
                <i className="ti ti-star" aria-hidden="true" />
                Plateforme #1 francophone
              </div>
              <h1>
                Apprenez par <span>courseUnit</span>,<br />
                payez ce qui compte
              </h1>
              <p className={styles.heroSub}>
                La seule plateforme e-learning qui vous permet d&apos;acheter exactement
                les courseUnits dont vous avez besoin. Flexible, abordable, toujours à jour.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/inscription" className="btn-orange">
                  Commencer gratuitement
                </Link>
                <Link href="/catalogue" className="btn-outline">
                  Explorer le catalogue
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <i className="ti ti-device-laptop" style={{ fontSize: "6rem", color: "var(--primary)" }} />
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className={styles.statsBar} aria-label="Chiffres clés">
          <div className="container">
            <div className={styles.statsGrid}>
              {STATS.map((s) => (
                <div key={s.label} className={styles.statItem}>
                  <div className={styles.statNum}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Catégories ── */}
        <section className={styles.section} aria-labelledby="cats-heading">
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Catégories</p>
              <h2 id="cats-heading">Explorez par domaine</h2>
              <p className={styles.sectionSub}>
                Des centaines de cours dans les domaines les plus demandés du marché francophone.
              </p>
            </div>
            <div className={styles.catsGrid}>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/catalogue?cat=${encodeURIComponent(cat.cat)}`}
                  className={styles.catCard}
                >
                  <div
                    className={styles.catIcon}
                    style={{ background: cat.bg }}
                    aria-hidden="true"
                  >
                    <i className={`ti ${cat.icon}`} style={{ color: cat.color, fontSize: 22 }} />
                  </div>
                  <p className={styles.catName}>{cat.name}</p>
                  <p className={styles.catCount}>{cat.count} cours</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cours populaires ── */}
        <section className={styles.sectionAlt} aria-labelledby="courses-heading">
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Cours populaires</p>
              <h2 id="courses-heading">Les plus appréciés</h2>
              <p className={styles.sectionSub}>
                Achetez par courseUnit ou cours complet — vous choisissez votre rythme.
              </p>
            </div>
            <div className={styles.coursesGrid}>
              {featuredCourses.map((course) => (
                <Link key={course.id} href={`/cours/${course.slug}`} className={styles.courseCard}>
                  <div
                    className={styles.courseThumb}
                    style={{ background: course.thumbGradient }}
                    aria-hidden="true"
                  >
                    {course.emoji}
                  </div>
                  <div className={styles.courseBody}>
                    <p className={styles.courseCat}>{course.category}</p>
                    {course.badge && (
                      <span className={`${styles.courseBadge} ${badgeClass(course.badge)}`}>
                        {course.badge}
                      </span>
                    )}
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <p className={styles.courseInstructor}>par {course.instructor}</p>
                    <div className={styles.courseFooter}>
                      <span className={styles.coursePrice}>
                        dès {course.priceUnit.toLocaleString("fr-FR")} XAF
                      </span>
                      <span className={styles.courseRating} aria-label={`Note ${course.rating}`}>
                        {"★".repeat(Math.floor(course.rating))} {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles.centerLink} style={{ marginTop: "2rem" }}>
              <Link href="/catalogue" className="btn-outline">
                Voir tous les cours →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section className={styles.section} aria-labelledby="feats-heading">
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="section-label">Pourquoi EduFlex Pro</p>
              <h2 id="feats-heading">Ce que les autres ne font pas</h2>
              <p className={styles.sectionSub}>
                Pensé pour le marché francophone avec une flexibilité tarifaire unique.
              </p>
            </div>
            <div className={styles.featsGrid}>
              {FEATURES.map((f) => (
                <div key={f.title} className={styles.featCard}>
                  <div
                    className={styles.featIcon}
                    style={{ background: f.bg }}
                    aria-hidden="true"
                  >
                    <i className={`ti ${f.icon}`} style={{ color: f.color }} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA inscription ── */}
        <div className={styles.ctaBanner}>
          <div className="container">
            <h2>Prêt à apprendre autrement ?</h2>
            <p>Créez votre compte gratuitement et achetez exactement les courseUnits dont vous avez besoin.</p>
            <div className={styles.ctaInputRow}>
              <Link href="/inscription" className="btn-orange">Commencer gratuitement</Link>
              <Link href="/catalogue" className="btn-outline">Explorer le catalogue</Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon} aria-hidden="true">
                  <i className="ti ti-books" />
                </div>
                EduFlex Pro
              </Link>
              <p className={styles.footerBrand}>
                La plateforme e-learning francophone flexible et abordable.<br />
                © 2025 EduFlex Pro. Tous droits réservés.
              </p>
            </div>
            <div className={styles.footerCol}>
              <h4>Cours</h4>
              <Link href="/catalogue?cat=Dev+Web">Dev Web</Link>
              <Link href="/catalogue?cat=Data+Science">Data Science</Link>
              <Link href="/catalogue?cat=Business">Business</Link>
              <Link href="/catalogue?cat=Design">Design UI/UX</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Communauté</h4>
              <Link href="/apprenants">Apprenants</Link>
              <Link href="/devenir-formateur">Formateurs</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/partenaires">Partenaires</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Liens rapides</h4>
              <Link href="/">Accueil</Link>
              <Link href="/catalogue">Catalogue</Link>
              <Link href="/projets">Projets</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Plus</h4>
              <Link href="/a-propos">À propos</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/confidentialite">Confidentialité</Link>
              <Link href="/aide">Aide</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            Fait avec soin pour le marché francophone africain.
          </div>
        </div>
      </footer>
    </>
  );
}