"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import styles from "../mot-de-passe-oublie/page.module.css";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!token) { setError("Lien invalide : jeton manquant."); return; }
    if (pwd.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (pwd !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, pwd);
      setDone(true);
      setTimeout(() => router.push("/connexion"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lien invalide ou expiré.");
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

        {done ? (
          <>
            <div className={styles.successIcon} aria-hidden="true"><i className="ti ti-circle-check" /></div>
            <h1 className={styles.title}>Mot de passe mis à jour</h1>
            <p className={styles.subtitle}>Vous allez être redirigé vers la connexion…</p>
            <Link href="/connexion" className={styles.back}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Aller à la connexion
            </Link>
          </>
        ) : (
          <>
            <div className={styles.iconWrap} aria-hidden="true"><i className="ti ti-lock" /></div>
            <h1 className={styles.title}>Nouveau mot de passe</h1>
            <p className={styles.subtitle}>Choisissez un nouveau mot de passe pour votre compte.</p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <p className={styles.error}>
                  <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
                </p>
              )}
              <div className={styles.field}>
                <label htmlFor="pwd" className={styles.label}>Nouveau mot de passe</label>
                <div className={styles.inputWrap}>
                  <i className="ti ti-lock" aria-hidden="true" />
                  <input id="pwd" type={showPwd ? "text" : "password"} className={styles.input} value={pwd}
                    onChange={(e) => setPwd(e.target.value)} placeholder="Min. 8 caractères"
                    autoComplete="new-password" required minLength={8} />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? "Masquer" : "Afficher"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <i className={`ti ${showPwd ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="confirm" className={styles.label}>Confirmer</label>
                <div className={styles.inputWrap}>
                  <i className="ti ti-lock-check" aria-hidden="true" />
                  <input id="confirm" type={showPwd ? "text" : "password"} className={styles.input} value={confirm}
                    onChange={(e) => setConfirm(e.target.value)} placeholder="Retapez le mot de passe"
                    autoComplete="new-password" required />
                </div>
              </div>
              <button type="submit" className={styles.submit} disabled={loading}>
                <i className="ti ti-check" aria-hidden="true" />
                {loading ? "Mise à jour…" : "Réinitialiser mon mot de passe"}
              </button>
            </form>

            <Link href="/connexion" className={styles.back}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
