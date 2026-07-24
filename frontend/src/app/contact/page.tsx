"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import styles from "./page.module.css";

const INFOS = [
  { icon: "ti-mail",     bg: "var(--primary-light)", color: "var(--primary)", title: "Email", val: <a href="mailto:contact@eduflex.pro">contact@eduflex.pro</a> },
  { icon: "ti-phone",    bg: "var(--success-light)", color: "var(--success)", title: "Téléphone", val: <a href="tel:+237600000000">+237 6 00 00 00 00</a> },
  { icon: "ti-map-pin",  bg: "var(--orange-light)",  color: "var(--orange)",  title: "Adresse", val: "Rue 1.234, Bastos, Yaoundé, Cameroun" },
  { icon: "ti-clock",    bg: "var(--pink-light)",    color: "var(--pink)",    title: "Horaires", val: "Lun – Ven, 8h – 18h (GMT+1)" },
];

const SUBJECTS = ["Question générale", "Support technique", "Devenir formateur", "Partenariat / B2B", "Presse", "Autre"];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || form.message.trim().length < 10) {
      setError("Merci de renseigner votre nom, un email valide et un message d'au moins 10 caractères.");
      return;
    }
    setLoading(true);
    try {
      await authApi.contact(form);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}><i className="ti ti-message-2" aria-hidden="true" /> Contact</span>
          <h1 className={styles.heroTitle}>Parlons de votre projet</h1>
          <p className={styles.heroSub}>
            Une question, un partenariat ou besoin d&apos;aide ? Notre équipe vous répond sous 24h ouvrées.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Infos */}
          <div className={styles.infoCards}>
            {INFOS.map((info) => (
              <div key={info.title} className={styles.infoCard}>
                <div className={styles.infoIcon} style={{ background: info.bg, color: info.color }} aria-hidden="true">
                  <i className={`ti ${info.icon}`} />
                </div>
                <div>
                  <p className={styles.infoTitle}>{info.title}</p>
                  <p className={styles.infoVal}>{info.val}</p>
                </div>
              </div>
            ))}
            <div className={styles.socials}>
              {["ti-brand-facebook", "ti-brand-twitter", "ti-brand-linkedin", "ti-brand-instagram", "ti-brand-whatsapp"].map((s) => (
                <a key={s} href="#" className={styles.social} aria-label={s.replace("ti-brand-", "")}>
                  <i className={`ti ${s}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className={styles.formCard}>
            {sent ? (
              <div className={styles.success}>
                <div className={styles.successIcon} aria-hidden="true"><i className="ti ti-circle-check" /></div>
                <h2 className={styles.successTitle}>Message envoyé !</h2>
                <p className={styles.successSub}>
                  Merci {form.name.split(" ")[0]}, nous avons bien reçu votre message et reviendrons
                  vers vous très vite à l&apos;adresse <strong>{form.email}</strong>.
                </p>
                <button className={styles.successBtn} onClick={() => { setSent(false); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); }}>
                  <i className="ti ti-arrow-left" aria-hidden="true" /> Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.formTitle}>Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit} noValidate>
                  {error && (
                    <p className={styles.error}><i className="ti ti-alert-circle" aria-hidden="true" /> {error}</p>
                  )}
                  <div className={styles.fieldGrid}>
                    <div className={styles.field}>
                      <label htmlFor="name" className={styles.label}>Nom complet</label>
                      <input id="name" className={styles.input} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Votre nom" required />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>Email</label>
                      <input id="email" type="email" className={styles.input} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="votre@email.com" required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="subject" className={styles.label}>Sujet</label>
                    <select id="subject" className={styles.select} value={form.subject} onChange={(e) => update("subject", e.target.value)}>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="message" className={styles.label}>Message</label>
                    <textarea id="message" className={styles.textarea} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Comment pouvons-nous vous aider ?" required />
                  </div>
                  <button type="submit" className={styles.submit} disabled={loading}>
                    <i className="ti ti-send" aria-hidden="true" />
                    {loading ? "Envoi en cours…" : "Envoyer le message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
