"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import styles from "./page.module.css";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      // Réponse générique volontaire : on affiche l'écran de confirmation quoi qu'il arrive.
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true"><i className="ti ti-books" /></span>
          EduFlex Pro
        </Link>

        {!sent ? (
          <>
            <div className={styles.iconWrap} aria-hidden="true"><i className="ti ti-lock" /></div>
            <h1 className={styles.title}>Mot de passe oublié ?</h1>
            <p className={styles.subtitle}>
              Saisissez l&apos;email associé à votre compte. Nous vous enverrons un lien
              sécurisé pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <p className={styles.error}>
                  <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
                </p>
              )}
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Adresse email</label>
                <div className={styles.inputWrap}>
                  <i className="ti ti-mail" aria-hidden="true" />
                  <input id="email" type="email" className={styles.input} value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com"
                    autoComplete="email" required />
                </div>
              </div>
              <button type="submit" className={styles.submit} disabled={loading}>
                <i className="ti ti-send" aria-hidden="true" />
                {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
              </button>
            </form>

            <Link href="/connexion" className={styles.back}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <div className={styles.successIcon} aria-hidden="true"><i className="ti ti-mail-opened" /></div>
            <h1 className={styles.title}>Vérifiez votre boîte mail</h1>
            <p className={styles.subtitle}>
              Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien
              de réinitialisation dans quelques instants.
            </p>
            <p className={styles.successNote}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              Pensez à vérifier vos spams. Le lien est valable 1 heure.
            </p>
            <p className={styles.subtitle} style={{ marginBottom: 0 }}>
              Vous n&apos;avez rien reçu ?{" "}
              <button className={styles.resend} onClick={() => setSent(false)}>Réessayer</button>
            </p>
            <Link href="/connexion" className={styles.back}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
