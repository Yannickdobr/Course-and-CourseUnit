import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/components/marketing.module.css";
import BecomeInstructorCTA from "./BecomeInstructorCTA";

export const metadata: Metadata = {
  title: "Devenir formateur — EduFlex Pro",
  description:
    "Partagez votre expertise, fixez vos prix par courseUnit et gardez 70% de vos revenus. Outils studio, paiements Mobile Money.",
};

const PERKS = [
  { icon: "ti-coin",        bg: "var(--success-light)", color: "var(--success)", title: "Gardez 70% de vos revenus", desc: "Commission transparente de 30%, réduite à 20% pour les formateurs Premium. Versements Mobile Money." },
  { icon: "ti-discount",    bg: "var(--primary-light)", color: "var(--primary)", title: "Tarifez par courseUnit", desc: "Fixez librement le prix de chaque courseUnit, créez des packs et des promotions." },
  { icon: "ti-users",       bg: "var(--orange-light)",  color: "var(--orange)",  title: "Une audience qualifiée", desc: "Accédez à 12 400+ apprenants francophones activement à la recherche de compétences." },
  { icon: "ti-tools",       bg: "var(--pink-light)",    color: "var(--pink)",    title: "Studio complet", desc: "Éditeur de cours, upload vidéo, statistiques, revenus et retraits dans un seul espace." },
  { icon: "ti-refresh",     bg: "var(--primary-light)", color: "var(--primary)", title: "Mises à jour continues", desc: "Améliorez vos cours après publication ; vos élèves reçoivent les nouveautés automatiquement." },
  { icon: "ti-certificate", bg: "var(--success-light)", color: "var(--success)", title: "Crédibilité renforcée", desc: "Profil formateur vérifié, avis d'élèves et certificats délivrés en votre nom." },
];

const STEPS = [
  { title: "Créez votre compte", desc: "Inscrivez-vous comme formateur en quelques minutes." },
  { title: "Construisez votre cours", desc: "Ajoutez sections, courseUnits, vidéos et prix dans le studio." },
  { title: "Soumettez", desc: "Notre équipe valide votre cours sous 48h via la grille qualité." },
  { title: "Gagnez", desc: "Encaissez vos revenus et retirez-les vers Mobile Money ou votre banque." },
];

export default function DevenirFormateurPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroBadge}><i className="ti ti-chalkboard" aria-hidden="true" /> Devenir formateur</span>
            <h1 className={styles.heroTitle}>Transmettez votre savoir, <span>monétisez votre expertise</span></h1>
            <p className={styles.heroSub}>
              Créez vos cours, fixez vos prix par courseUnit et touchez une audience francophone
              engagée. Vous gardez 70% de chaque vente.
            </p>
            <div className={styles.heroActions}>
              <BecomeInstructorCTA />
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">🧑🏿‍🏫</div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.statRow}>
            <div className={styles.stat}><p className={styles.statNum}>70%</p><p className={styles.statLabel}>de revenus conservés</p></div>
            <div className={styles.stat}><p className={styles.statNum}>320+</p><p className={styles.statLabel}>formateurs actifs</p></div>
            <div className={styles.stat}><p className={styles.statNum}>48h</p><p className={styles.statLabel}>délai de validation</p></div>
            <div className={styles.stat}><p className={styles.statNum}>5 000</p><p className={styles.statLabel}>XAF retrait minimum</p></div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Pourquoi enseigner ici</p>
            <h2>Les meilleurs outils pour réussir</h2>
            <p className={styles.sectionSub}>Concentrez-vous sur votre contenu, on s&apos;occupe du reste.</p>
          </div>
          <div className={styles.grid3}>
            {PERKS.map((p) => (
              <div key={p.title} className={styles.featCard}>
                <div className={styles.featIcon} style={{ background: p.bg, color: p.color }} aria-hidden="true">
                  <i className={`ti ${p.icon}`} />
                </div>
                <h3 className={styles.featTitle}>{p.title}</h3>
                <p className={styles.featDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Comment démarrer</p>
            <h2>De l&apos;idée au premier revenu</h2>
          </div>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <div className={styles.stepNum} aria-hidden="true">{i + 1}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className={styles.ctaBanner}>
        <h2 className={styles.ctaTitle}>Lancez votre premier cours aujourd&apos;hui</h2>
        <p className={styles.ctaSub}>Rejoignez 320+ formateurs qui monétisent déjà leur expertise sur EduFlex Pro.</p>
        <div className={styles.ctaActions}>
          <Link href="/inscription?role=formateur" className={styles.ctaWhite}><i className="ti ti-rocket" aria-hidden="true" /> Créer mon compte formateur</Link>
          <Link href="/studio/aide" className={styles.ctaGhost}>Guide du formateur</Link>
        </div>
      </div>
    </main>
  );
}
