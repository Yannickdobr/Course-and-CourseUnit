"use client";

import { useState } from "react";
import styles from "./page.module.css";

const PAYOUT_METHODS = ["Orange Money", "MTN MoMo", "Wave", "Virement bancaire"];

export default function StudioParametresPage() {
  const [toast, setToast] = useState(false);

  /* Profil public */
  const [name, setName] = useState("Koffi Mensah");
  const [title, setTitle] = useState("Expert React & Node.js");
  const [bio, setBio] = useState(
    "Développeur fullstack avec 8 ans d'expérience. Passionné par l'enseignement et les architectures modernes."
  );
  const [website, setWebsite] = useState("https://koffi.dev");

  /* Versements */
  const [payoutMethod, setPayoutMethod] = useState("Orange Money");
  const [payoutAccount, setPayoutAccount] = useState("•••• 4821");
  const [autoWithdraw, setAutoWithdraw] = useState(false);

  /* Notifications */
  const [notifSale, setNotifSale] = useState(true);
  const [notifReview, setNotifReview] = useState(true);
  const [notifPayout, setNotifPayout] = useState(true);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <form className={styles.page} onSubmit={save}>
      {toast && (
        <div className={styles.toast}>
          <i className="ti ti-circle-check" aria-hidden="true" /> Modifications enregistrées !
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Paramètres du formateur</h1>
        <p className={styles.sub}>Gérez votre profil public, vos versements et vos notifications.</p>
      </div>

      {/* Profil public */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}><i className="ti ti-user-circle" aria-hidden="true" /> Profil public</h2>

        <div className={styles.avatarRow}>
          <div className={styles.avatar} style={{ background: "linear-gradient(135deg,#1a1060,#3b2fa0)" }} aria-hidden="true">
            👨🏿‍💻
          </div>
          <div>
            <p className={styles.avatarName}>{name}</p>
            <p className={styles.avatarMeta}>Formateur vérifié · 5 cours publiés</p>
            <button type="button" className={styles.btnGhost}>
              <i className="ti ti-upload" aria-hidden="true" /> Changer la photo
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Nom affiché</label>
            <input id="name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>Titre / spécialité</label>
            <input id="title" className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="bio" className={styles.label}>Bio</label>
            <textarea id="bio" className={styles.textarea} value={bio} maxLength={280} onChange={(e) => setBio(e.target.value)} />
            <span className={styles.hint}>{bio.length}/280 caractères</span>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="website" className={styles.label}>Site web / portfolio</label>
            <input id="website" className={styles.input} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </div>
        </div>
      </section>

      {/* Versements */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}><i className="ti ti-wallet" aria-hidden="true" /> Méthode de versement par défaut</h2>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="payout" className={styles.label}>Méthode</label>
            <select id="payout" className={styles.select} value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
              {PAYOUT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="account" className={styles.label}>Compte / numéro</label>
            <input id="account" className={styles.input} value={payoutAccount} onChange={(e) => setPayoutAccount(e.target.value)} />
          </div>
        </div>
        <div className={styles.toggleRow} style={{ marginTop: "0.75rem" }}>
          <div>
            <p className={styles.toggleLabel}>Retrait automatique mensuel</p>
            <p className={styles.toggleDesc}>Verser automatiquement votre solde le 1er de chaque mois (min. 50 000 XAF).</p>
          </div>
          <button type="button" role="switch" aria-checked={autoWithdraw}
            className={`${styles.toggle} ${autoWithdraw ? styles.toggleOn : ""}`}
            onClick={() => setAutoWithdraw((v) => !v)}>
            <span className={styles.toggleThumb} />
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}><i className="ti ti-bell" aria-hidden="true" /> Notifications</h2>
        {[
          { label: "Nouvelle vente", desc: "Recevez un email à chaque achat d'un de vos cours ou courseUnits.", value: notifSale, set: setNotifSale },
          { label: "Nouvel avis", desc: "Soyez notifié quand un apprenant laisse un avis.", value: notifReview, set: setNotifReview },
          { label: "Versement effectué", desc: "Confirmation à chaque retrait traité.", value: notifPayout, set: setNotifPayout },
        ].map((n) => (
          <div key={n.label} className={styles.toggleRow}>
            <div>
              <p className={styles.toggleLabel}>{n.label}</p>
              <p className={styles.toggleDesc}>{n.desc}</p>
            </div>
            <button type="button" role="switch" aria-checked={n.value}
              className={`${styles.toggle} ${n.value ? styles.toggleOn : ""}`}
              onClick={() => n.set((v) => !v)}>
              <span className={styles.toggleThumb} />
            </button>
          </div>
        ))}
      </section>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary}>
          <i className="ti ti-device-floppy" aria-hidden="true" /> Enregistrer les modifications
        </button>
      </div>
    </form>
  );
}
