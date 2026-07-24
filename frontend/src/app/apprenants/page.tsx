import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/app/components/marketing.module.css";

export const metadata: Metadata = {
  title: "Pour les apprenants — EduFlex Pro",
  description:
    "Apprenez à votre rythme, payez uniquement les courseUnits dont vous avez besoin. Certificats vérifiables, mobile et Mobile Money.",
};

const BENEFITS = [
  { icon: "ti-package",     bg: "var(--primary-light)", color: "var(--primary)", title: "Payez ce qui compte", desc: "Achetez un courseUnit, un pack ou le cours complet. Aucun engagement, accès à vie." },
  { icon: "ti-certificate", bg: "var(--success-light)", color: "var(--success)", title: "Certificats vérifiables", desc: "Obtenez un certificat avec QR Code, partageable sur LinkedIn dès le cours terminé." },
  { icon: "ti-device-mobile", bg: "var(--orange-light)", color: "var(--orange)", title: "Apprenez partout", desc: "Application mobile et téléchargement hors-ligne pour apprendre sans connexion." },
  { icon: "ti-credit-card", bg: "var(--pink-light)", color: "var(--pink)", title: "Mobile Money inclus", desc: "Payez par Orange Money, MTN MoMo, Wave, carte ou PayPal — partout en Afrique." },
  { icon: "ti-refresh",     bg: "var(--primary-light)", color: "var(--primary)", title: "Toujours à jour", desc: "Vos cours sont mis à jour gratuitement par les formateurs, à vie." },
  { icon: "ti-notes",       bg: "var(--success-light)", color: "var(--success)", title: "Outils d'apprentissage", desc: "Prise de notes horodatées, vitesse de lecture, sous-titres et forum par courseUnit." },
];

const STEPS = [
  { title: "Explorez", desc: "Parcourez le catalogue et prévisualisez jusqu'à 2 courseUnits gratuitement." },
  { title: "Choisissez", desc: "Ajoutez les courseUnits, packs ou cours qui vous intéressent au panier." },
  { title: "Payez", desc: "Réglez en quelques secondes par Mobile Money, carte ou PayPal." },
  { title: "Apprenez", desc: "Accédez immédiatement au contenu et progressez à votre rythme." },
];

export default function ApprenantsPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.heroBadge}><i className="ti ti-school" aria-hidden="true" /> Pour les apprenants</span>
            <h1 className={styles.heroTitle}>Montez en compétences, <span>un courseUnit à la fois</span></h1>
            <p className={styles.heroSub}>
              EduFlex Pro vous laisse acheter exactement ce dont vous avez besoin. Flexible,
              abordable et pensé pour le marché francophone africain.
            </p>
            <div className={styles.heroActions}>
              <Link href="/inscription" className="btn-orange">Commencer gratuitement</Link>
              <Link href="/catalogue" className="btn-outline">Explorer le catalogue</Link>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">🎓</div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.statRow}>
            <div className={styles.stat}><p className={styles.statNum}>12 400+</p><p className={styles.statLabel}>Apprenants actifs</p></div>
            <div className={styles.stat}><p className={styles.statNum}>840</p><p className={styles.statLabel}>Cours disponibles</p></div>
            <div className={styles.stat}><p className={styles.statNum}>dès 500</p><p className={styles.statLabel}>XAF / courseUnit</p></div>
            <div className={styles.stat}><p className={styles.statNum}>4.8 ★</p><p className={styles.statLabel}>Note moyenne</p></div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Avantages</p>
            <h2>Tout pour réussir votre apprentissage</h2>
            <p className={styles.sectionSub}>Une expérience flexible, abordable et complète.</p>
          </div>
          <div className={styles.grid3}>
            {BENEFITS.map((b) => (
              <div key={b.title} className={styles.featCard}>
                <div className={styles.featIcon} style={{ background: b.bg, color: b.color }} aria-hidden="true">
                  <i className={`ti ${b.icon}`} />
                </div>
                <h3 className={styles.featTitle}>{b.title}</h3>
                <p className={styles.featDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className="section-label">Comment ça marche</p>
            <h2>Commencez en 4 étapes</h2>
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
        <h2 className={styles.ctaTitle}>Prêt à apprendre autrement ?</h2>
        <p className={styles.ctaSub}>Créez votre compte gratuitement et recevez 2 courseUnits offerts à l&apos;inscription.</p>
        <div className={styles.ctaActions}>
          <Link href="/inscription" className={styles.ctaWhite}><i className="ti ti-rocket" aria-hidden="true" /> Commencer gratuitement</Link>
          <Link href="/catalogue" className={styles.ctaGhost}>Explorer le catalogue</Link>
        </div>
      </div>
    </main>
  );
}
