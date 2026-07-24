"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const QUICK_LINKS = [
  { icon: "ti-book-2",   bg: "var(--primary-light)", color: "var(--primary)", title: "Guide du formateur", desc: "Créer et publier un cours", href: "#" },
  { icon: "ti-video",    bg: "var(--orange-light)",  color: "var(--orange)",  title: "Tutoriels vidéo",    desc: "Studio en pratique",      href: "#" },
  { icon: "ti-messages", bg: "var(--success-light)", color: "var(--success)", title: "Communauté",         desc: "Échanger avec vos pairs", href: "#" },
];

const FAQS = [
  {
    q: "Comment publier un nouveau cours ?",
    a: "Depuis le tableau de bord, cliquez sur « Nouveau cours ». Remplissez les informations générales, ajoutez vos courseUnits avec leur prix individuel, téléversez vos vidéos, puis soumettez le cours pour validation. Notre équipe le révise sous 48h avant publication.",
  },
  {
    q: "Comment fonctionne la tarification par courseUnit ?",
    a: "Chaque courseUnit peut avoir son propre prix (ou être gratuit). Les apprenants peuvent acheter un courseUnit seul, un pack de courseUnits à prix réduit, ou le cours complet. Vous fixez librement vos prix dans l'éditeur de cours, section « Tarification ».",
  },
  {
    q: "Quelle commission prélève la plateforme ?",
    a: "EduFlex Pro prélève 30% sur chaque vente ; vous conservez 70%. Les formateurs Premium (plus de 1000 ventes) bénéficient d'un taux réduit à 20% de commission, soit 80% de revenus.",
  },
  {
    q: "Quand et comment suis-je payé ?",
    a: "Vos revenus sont disponibles au retrait 7 jours après chaque vente (période anti-fraude). Vous pouvez retirer à tout moment vers Orange Money, MTN MoMo, Wave ou par virement bancaire, dès 5 000 XAF, depuis l'onglet « Retraits ».",
  },
  {
    q: "Puis-je mettre à jour un cours déjà publié ?",
    a: "Oui. Vous pouvez modifier ou ajouter des courseUnits à tout moment. Les apprenants ayant acheté le cours reçoivent automatiquement les mises à jour gratuitement, et un badge « Mis à jour » s'affiche sur les courseUnits modifiés.",
  },
  {
    q: "Comment sont calculées mes statistiques ?",
    a: "Les statistiques (vues, taux de complétion, notes) sont mises à jour toutes les heures. Le taux de complétion correspond au pourcentage moyen de courseUnits terminés par vos apprenants inscrits.",
  },
];

export default function StudioAidePage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Centre d&apos;aide</h1>
        <p className={styles.sub}>Tout ce qu&apos;il faut savoir pour réussir en tant que formateur sur EduFlex Pro.</p>
      </div>

      {/* Quick links */}
      <div className={styles.quickGrid}>
        {QUICK_LINKS.map((q) => (
          <Link key={q.title} href={q.href} className={styles.quickCard}>
            <span className={styles.quickIcon} style={{ background: q.bg, color: q.color }} aria-hidden="true">
              <i className={`ti ${q.icon}`} />
            </span>
            <p className={styles.quickTitle}>{q.title}</p>
            <p className={styles.quickDesc}>{q.desc}</p>
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <h2 className={styles.sectionTitle}>Questions fréquentes</h2>
      <div className={styles.faqList}>
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqQ}
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                {faq.q}
                <i className={`ti ti-chevron-down ${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ""}`} aria-hidden="true" />
              </button>
              {isOpen && <p className={styles.faqA}>{faq.a}</p>}
            </div>
          );
        })}
      </div>

      {/* Contact */}
      <div className={styles.contact}>
        <div className={styles.contactText}>
          <h3>Vous ne trouvez pas votre réponse ?</h3>
          <p>Notre équipe support formateurs vous répond sous 24h.</p>
        </div>
        <a href="mailto:formateurs@eduflex.pro" className={styles.contactBtn}>
          <i className="ti ti-mail" aria-hidden="true" /> Contacter le support
        </a>
      </div>
    </div>
  );
}
