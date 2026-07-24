import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/components/marketing.module.css";

export const metadata: Metadata = {
  title: "Partenaires — EduFlex Pro",
  description:
    "Devenez partenaire d'EduFlex Pro : entreprises, écoles, programmes d'affiliation et intégrations technologiques.",
};

const TYPES = [
  { icon: "ti-building-skyscraper", bg: "var(--primary-light)", color: "var(--primary)", title: "Entreprises (B2B)", desc: "Formez vos équipes à grande échelle avec un dashboard RH, des licences groupées et un reporting détaillé." },
  { icon: "ti-school",              bg: "var(--orange-light)",  color: "var(--orange)",  title: "Écoles & universités", desc: "Complétez vos cursus avec nos contenus certifiants et offrez un accès privilégié à vos étudiants." },
  { icon: "ti-affiliate",           bg: "var(--success-light)", color: "var(--success)", title: "Affiliés & créateurs", desc: "Recommandez EduFlex Pro et touchez une commission sur chaque inscription via votre lien unique." },
  { icon: "ti-plug-connected",      bg: "var(--pink-light)",    color: "var(--pink)",    title: "Partenaires tech", desc: "Intégrez notre API ou nos contenus (SCORM, xAPI) dans votre propre plateforme LMS." },
];

const BENEFITS = [
  "Tarifs négociés et licences volume",
  "Tableau de bord et rapports de progression dédiés",
  "Accompagnement par un responsable de compte",
  "Contenus en marque blanche disponibles",
  "Facturation centralisée et intégration LMS",
  "Accès anticipé aux nouvelles fonctionnalités",
];

const PARTNERS = ["Orange", "MTN", "Wave", "Vercel", "AWS", "GitHub"];

export default function PartenairesPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroBadge}><i className="ti ti-heart-handshake" aria-hidden="true" /> Partenariats</span>
            <h1 className={styles.heroTitle}>Construisons l&apos;avenir de la <span>formation</span> ensemble</h1>
            <p className={styles.heroSub}>
              Entreprises, écoles, créateurs ou partenaires technologiques : rejoignez l&apos;écosystème
              EduFlex Pro et formez la prochaine génération de talents francophones.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className="btn-primary">Devenir partenaire</Link>
              <Link href="/contact" className="btn-outline">Voir l&apos;offre entreprise</Link>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">🤝</div>
        </div>
      </section>

      {/* Types de partenariat */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Types de partenariat</p>
            <h2>Une collaboration adaptée à votre structure</h2>
          </div>
          <div className={styles.grid4}>
            {TYPES.map((t) => (
              <div key={t.title} className={styles.featCard}>
                <div className={styles.featIcon} style={{ background: t.bg, color: t.color }} aria-hidden="true">
                  <i className={`ti ${t.icon}`} />
                </div>
                <h3 className={styles.featTitle}>{t.title}</h3>
                <p className={styles.featDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.grid2} style={{ alignItems: "center" }}>
            <div>
              <p className="section-label">Avantages partenaires</p>
              <h2 style={{ marginBottom: "1.25rem" }}>Ce que vous y gagnez</h2>
              <div className={styles.checkList}>
                {BENEFITS.map((b) => (
                  <div key={b} className={styles.checkItem}>
                    <i className="ti ti-circle-check" aria-hidden="true" /> {b}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.statRow} style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className={styles.stat}><p className={styles.statNum}>50+</p><p className={styles.statLabel}>entreprises partenaires</p></div>
              <div className={styles.stat}><p className={styles.statNum}>12 400+</p><p className={styles.statLabel}>apprenants touchés</p></div>
              <div className={styles.stat}><p className={styles.statNum}>15%</p><p className={styles.statLabel}>commission d&apos;affiliation</p></div>
              <div className={styles.stat}><p className={styles.statNum}>24h</p><p className={styles.statLabel}>réponse commerciale</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ils nous font confiance */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2>Ils nous accompagnent</h2>
            <p className={styles.sectionSub}>Des partenaires de paiement et technologiques de confiance.</p>
          </div>
          <div className={styles.grid3} style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
            {PARTNERS.map((p) => (
              <div key={p} className={styles.featCard} style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 70, fontWeight: 700, color: "var(--text-secondary)" }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className={styles.ctaBanner}>
        <h2 className={styles.ctaTitle}>Parlons de votre projet</h2>
        <p className={styles.ctaSub}>Notre équipe partenariats vous recontacte sous 24h pour étudier la meilleure collaboration.</p>
        <div className={styles.ctaActions}>
          <Link href="/contact" className={styles.ctaWhite}><i className="ti ti-mail" aria-hidden="true" /> Nous contacter</Link>
        </div>
      </div>
    </main>
  );
}
