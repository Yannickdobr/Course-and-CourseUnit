import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/components/marketing.module.css";

export const metadata: Metadata = {
  title: "À propos — EduFlex Pro",
  description:
    "EduFlex Pro rend la formation en ligne flexible et abordable pour le marché francophone africain : achat par courseUnit, Mobile Money, certificats vérifiables.",
};

const VALUES = [
  { icon: "ti-accessible",  bg: "var(--primary-light)", color: "var(--primary)", title: "Accessibilité", desc: "Une formation de qualité accessible à tous, à partir de 500 XAF le courseUnit." },
  { icon: "ti-adjustments",  bg: "var(--orange-light)", color: "var(--orange)",  title: "Flexibilité", desc: "Achetez exactement ce dont vous avez besoin, apprenez à votre rythme." },
  { icon: "ti-shield-check", bg: "var(--success-light)", color: "var(--success)", title: "Confiance", desc: "Formateurs vérifiés, certificats authentifiables et paiements sécurisés." },
  { icon: "ti-world",        bg: "var(--pink-light)",   color: "var(--pink)",    title: "Ancrage local", desc: "Pensé pour l'Afrique francophone : Mobile Money, contenus et prix adaptés." },
];

const TEAM = [
  { name: "Awa Mbaye",     role: "CEO & Cofondatrice", emoji: "👩🏿‍💼", bg: "linear-gradient(135deg,#3a0030,#8b0050)" },
  { name: "Koffi Mensah",  role: "CTO & Cofondateur",  emoji: "👨🏿‍💻", bg: "linear-gradient(135deg,#1a1060,#3b2fa0)" },
  { name: "Amina Diallo",  role: "Responsable Contenu", emoji: "👩🏾‍🔬", bg: "linear-gradient(135deg,#003d2a,#006644)" },
  { name: "Serge Akoto",   role: "Responsable Sécurité", emoji: "🧑🏿‍🔧", bg: "linear-gradient(135deg,#1a0000,#600010)" },
];

export default function AProposPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroBadge}><i className="ti ti-heart" aria-hidden="true" /> Notre histoire</span>
            <h1 className={styles.heroTitle}>Démocratiser la formation <span>en Afrique francophone</span></h1>
            <p className={styles.heroSub}>
              EduFlex Pro est né d&apos;un constat simple : la formation en ligne reste trop chère
              et trop rigide. Nous avons créé une plateforme où l&apos;on paie uniquement ce qu&apos;on
              apprend, avec les moyens de paiement locaux.
            </p>
            <div className={styles.heroActions}>
              <Link href="/catalogue" className="btn-primary">Explorer le catalogue</Link>
              <Link href="/devenir-formateur" className="btn-outline">Devenir formateur</Link>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">🌍</div>
        </div>
      </section>

      {/* Mission / stats */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Notre mission</p>
            <h2>Rendre chaque compétence atteignable</h2>
            <p className={styles.sectionSub}>
              Nous voulons qu&apos;un étudiant à Yaoundé, Dakar ou Abidjan puisse se former
              aux compétences les plus demandées du marché, sans barrière de prix ni de format.
            </p>
          </div>
          <div className={styles.statRow}>
            <div className={styles.stat}><p className={styles.statNum}>2024</p><p className={styles.statLabel}>Année de création</p></div>
            <div className={styles.stat}><p className={styles.statNum}>12 400+</p><p className={styles.statLabel}>Apprenants</p></div>
            <div className={styles.stat}><p className={styles.statNum}>320+</p><p className={styles.statLabel}>Formateurs</p></div>
            <div className={styles.stat}><p className={styles.statNum}>15+</p><p className={styles.statLabel}>Pays couverts</p></div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Nos valeurs</p>
            <h2>Ce qui nous guide</h2>
          </div>
          <div className={styles.grid4}>
            {VALUES.map((v) => (
              <div key={v.title} className={styles.featCard}>
                <div className={styles.featIcon} style={{ background: v.bg, color: v.color }} aria-hidden="true">
                  <i className={`ti ${v.icon}`} />
                </div>
                <h3 className={styles.featTitle}>{v.title}</h3>
                <p className={styles.featDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">L&apos;équipe</p>
            <h2>Les visages derrière EduFlex Pro</h2>
          </div>
          <div className={styles.grid4}>
            {TEAM.map((t) => (
              <div key={t.name} className={styles.featCard} style={{ textAlign: "center" }}>
                <div
                  style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", background: t.bg }}
                  aria-hidden="true"
                >
                  {t.emoji}
                </div>
                <h3 className={styles.featTitle}>{t.name}</h3>
                <p className={styles.featDesc}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className={styles.ctaBanner}>
        <h2 className={styles.ctaTitle}>Rejoignez l&apos;aventure</h2>
        <p className={styles.ctaSub}>Apprenant ou formateur, vous avez votre place dans la communauté EduFlex Pro.</p>
        <div className={styles.ctaActions}>
          <Link href="/inscription" className={styles.ctaWhite}><i className="ti ti-rocket" aria-hidden="true" /> Commencer gratuitement</Link>
          <Link href="/contact" className={styles.ctaGhost}>Nous contacter</Link>
        </div>
      </div>
    </main>
  );
}
