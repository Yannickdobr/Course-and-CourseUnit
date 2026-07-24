"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, initialsFromName, UserRole } from "../components/AuthProvider";
import { authApi } from "@/lib/api";
import styles from "./page.module.css";

/* ── Remplacez ce chemin par votre vraie illustration ── */
const ILLUSTRATION_SRC = "/images/auth-illustration.png";

export default function ConnexionPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form     = e.currentTarget;
    const email    = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await authApi.login(email, password);
      const role: UserRole = ["admin", "superadmin", "formateur"].includes(res.role) ? (res.role as UserRole) : "apprenant";
      login({
        id: res.id,
        name: res.name || email,
        email: res.email,
        initials: initialsFromName(res.name || email),
        role,
        token: res.token,
      });
      if (role === "admin" || role === "superadmin") router.push("/admin");
      else if (role === "formateur") router.push("/studio");
      else router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.modal} role="dialog" aria-label="Connexion EduFlex Pro">

        {/* ── Colonne gauche blanche ── */}
        <div className={styles.left}>
          <div className={styles.leftTop}>
            <Link href="/" className={styles.leftLogo}>
              <div className={styles.leftLogoIcon} aria-hidden="true">
                <i className="ti ti-books" />
              </div>
              EduFlex Pro
            </Link>

            <h2>Bienvenue sur EduFlex Pro</h2>
            <p className={styles.leftSub}>
              La plateforme e-learning francophone flexible.
              Achetez par courseUnit, apprenez à votre rythme.
            </p>

            {/* ── Zone illustration ── */}
            <div className={styles.imgZone}>
              <Image
                src={ILLUSTRATION_SRC}
                alt="Illustration EduFlex Pro"
                fill
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  /* Masquer l'image si elle n'existe pas encore */
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Placeholder visible si l'image n'est pas encore ajoutée */}
              <div className={styles.imgZonePlaceholder}>
                <i className="ti ti-photo" aria-hidden="true" />
                <span>Votre illustration ici</span>
                <small>Placer dans public/images/auth-illustration.png</small>
              </div>
            </div>
          </div>

          <div className={styles.dots}>
            <div className={`${styles.dot} ${styles.dotActive}`} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div className={styles.right}>
          <div className={styles.tabs} role="tablist">
            <span className={`${styles.tab} ${styles.tabActive}`} role="tab" aria-selected="true">
              Connexion
            </span>
            <Link href="/inscription" className={styles.tab} role="tab" aria-selected="false">
              Inscription
            </Link>
          </div>

          <button type="button" className={styles.googleBtn}>
            <span className={styles.googleIcon} aria-hidden="true">G</span>
            Continuer avec Google
          </button>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>ou avec votre email</span>
            <div className={styles.dividerLine} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <p role="alert" className={styles.errorMsg}>
                <i className="ti ti-alert-circle" aria-hidden="true" />
                {error}
              </p>
            )}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrap}>
                <i className="ti ti-mail" aria-hidden="true" />
                <input id="email" name="email" type="email"
                  className={styles.input} placeholder="votre@email.com"
                  required autoComplete="email" />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Mot de passe</label>
              <div className={styles.inputWrap}>
                <i className="ti ti-lock" aria-hidden="true" />
                <input id="password" name="password"
                  type={showPwd ? "text" : "password"}
                  className={styles.input} placeholder="••••••••••••"
                  required autoComplete="current-password" />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Masquer" : "Afficher le mot de passe"}>
                  <i className={`ti ${showPwd ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} />
                Rester connecté
              </label>
              <Link href="/mot-de-passe-oublie" className={styles.forgotLink}>
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className={styles.switchText}>
            Pas encore de compte ?{" "}
            <Link href="/inscription">S&apos;inscrire</Link>
          </p>
        </div>
      </div>
    </main>
  );
}