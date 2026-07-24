"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const CATEGORIES = [
  { icon: "ti-shopping-cart", bg: "var(--primary-light)", color: "var(--primary)", title: "Achats & paiement", count: 8 },
  { icon: "ti-player-play",   bg: "var(--orange-light)",  color: "var(--orange)",  title: "Suivre un cours", count: 6 },
  { icon: "ti-certificate",   bg: "var(--success-light)", color: "var(--success)", title: "Certificats", count: 4 },
  { icon: "ti-user",          bg: "var(--pink-light)",    color: "var(--pink)",    title: "Mon compte", count: 5 },
  { icon: "ti-chalkboard",    bg: "var(--primary-light)", color: "var(--primary)", title: "Formateurs", count: 7 },
  { icon: "ti-refresh",       bg: "var(--orange-light)",  color: "var(--orange)",  title: "Remboursements", count: 3 },
];

const FAQS = [
  { cat: "Achats", q: "Comment fonctionne l'achat par courseUnit ?", a: "Chaque cours est découpé en courseUnits ayant leur propre prix. Vous pouvez acheter un courseUnit seul, un pack de courseUnits à prix réduit, ou le cours complet. Ajoutez simplement les éléments souhaités au panier depuis la page du cours." },
  { cat: "Paiement", q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons le Mobile Money (Orange Money, MTN MoMo, Wave, Airtel Money), les cartes bancaires (Visa, Mastercard) et PayPal." },
  { cat: "Cours", q: "Quand puis-je accéder à mon cours après achat ?", a: "Immédiatement ! Dès la confirmation du paiement, le contenu est débloqué dans votre espace « Mes cours », accessible à vie." },
  { cat: "Certificats", q: "Mon certificat est-il reconnu ?", a: "À la fin d'un cours terminé à 100%, vous obtenez un certificat avec un QR Code et un code de vérification unique, partageable sur LinkedIn et vérifiable en ligne par n'importe qui." },
  { cat: "Compte", q: "Comment réinitialiser mon mot de passe ?", a: "Depuis la page de connexion, cliquez sur « Mot de passe oublié ? » et saisissez votre email. Vous recevrez un lien sécurisé valable 30 minutes." },
  { cat: "Remboursements", q: "Quelle est votre politique de remboursement ?", a: "Vous disposez de 30 jours pour demander un remboursement si le contenu ne vous convient pas, depuis votre espace « Mes achats »." },
  { cat: "Cours", q: "Puis-je télécharger les cours pour les regarder hors-ligne ?", a: "Oui, via l'application mobile, si le formateur a activé cette option pour son cours. Les vidéos restent protégées et liées à votre compte." },
  { cat: "Formateurs", q: "Comment devenir formateur sur EduFlex Pro ?", a: "Inscrivez-vous comme formateur, créez votre cours dans le studio, et soumettez-le pour validation. Notre équipe le révise sous 48h. Vous gardez 70% de vos revenus." },
];

export default function AidePage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className={styles.page}>
      {/* Hero + recherche */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Comment pouvons-nous vous aider ?</h1>
          <p className={styles.heroSub}>Trouvez des réponses ou contactez notre équipe support.</p>
          <div className={styles.searchBox}>
            <i className="ti ti-search" aria-hidden="true" />
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Rechercher une question…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher dans l'aide"
            />
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {/* Catégories */}
        {!query && (
          <div className={styles.catGrid}>
            {CATEGORIES.map((c) => (
              <Link key={c.title} href="/aide" className={styles.catCard}>
                <span className={styles.catIcon} style={{ background: c.bg, color: c.color }} aria-hidden="true">
                  <i className={`ti ${c.icon}`} />
                </span>
                <p className={styles.catTitle}>{c.title}</p>
                <p className={styles.catCount}>{c.count} articles</p>
              </Link>
            ))}
          </div>
        )}

        {/* FAQ */}
        <h2 className={styles.sectionTitle}>
          {query ? `Résultats pour « ${query} »` : "Questions fréquentes"}
        </h2>
        {filtered.length === 0 ? (
          <div className={styles.faqList}>
            <p className={styles.empty}>Aucun résultat. Essayez d&apos;autres mots-clés ou contactez-nous.</p>
          </div>
        ) : (
          <div className={styles.faqList}>
            {filtered.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.q} className={styles.faqItem}>
                  <button className={styles.faqQ} onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    <span><span className={styles.faqCat}>{faq.cat}</span>{faq.q}</span>
                    <i className={`ti ti-chevron-down ${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ""}`} aria-hidden="true" />
                  </button>
                  {isOpen && <p className={styles.faqA}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Contact */}
        <div className={styles.contact}>
          <div className={styles.contactText}>
            <h3>Vous n&apos;avez pas trouvé votre réponse ?</h3>
            <p>Notre équipe support vous répond sous 24h ouvrées.</p>
          </div>
          <Link href="/contact" className={styles.contactBtn}>
            <i className="ti ti-mail" aria-hidden="true" /> Contacter le support
          </Link>
        </div>
      </div>
    </main>
  );
}
