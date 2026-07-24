"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, initialsFromName, UserRole } from "../components/AuthProvider";
import { authApi } from "@/lib/api";
import styles from "./page.module.css";

const ILLUSTRATION_SRC = "/images/auth-illustration.png";

export default function InscriptionPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [terms, setTerms]     = useState(false);
  const [accountRole, setAccountRole] = useState<"apprenant" | "formateur">(() =>
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("role") === "formateur")
      ? "formateur" : "apprenant"
  );
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!terms) { setError("Veuillez accepter les conditions d'utilisation."); return; }
    setLoading(true);

    const form     = e.currentTarget;
    const name     = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email    = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await authApi.register(name, email, password, accountRole);
      const role: UserRole = res.role === "formateur" || accountRole === "formateur" ? "formateur" : "apprenant";
      login({
        id: res.id,
        name: res.name || name,
        email: res.email || email,
        initials: initialsFromName(res.name || name),
        role,
        token: res.token,
      });
      router.push(role === "formateur" ? "/studio" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.modal} role="dialog" aria-label="Inscription EduFlex Pro">

        {/* ── Colonne gauche blanche ── */}
        <div className={styles.left}>
          <div className={styles.leftTop}>
            <Link href="/" className={styles.leftLogo}>
              <div className={styles.leftLogoIcon} aria-hidden="true">
                <i className="ti ti-books" />
              </div>
              EduFlex Pro
            </Link>

            <h2>Rejoignez EduFlex Pro</h2>
            <p className={styles.leftSub}>
              Créez votre compte gratuitement et commencez à apprendre
              par courseUnit dès aujourd&apos;hui.
            </p>

            {/* ── Zone illustration ── */}
            <div className={styles.imgZone}>
              <Image
                src={ILLUSTRATION_SRC}
                alt="Illustration EduFlex Pro"
                fill
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>

          <div className={styles.dots}>
            <div className={styles.dot} />
            <div className={`${styles.dot} ${styles.dotActive}`} />
            <div className={styles.dot} />
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div className={styles.right}>
          <div className={styles.tabs} role="tablist">
            <Link href="/connexion" className={styles.tab} role="tab" aria-selected="false">
              Connexion
            </Link>
            <span className={`${styles.tab} ${styles.tabActive}`} role="tab" aria-selected="true">
              Inscription
            </span>
          </div>

          <button type="button" className={styles.googleBtn}>
            <span className={styles.googleIcon} aria-hidden="true">G</span>
            S&apos;inscrire avec Google
          </button>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>ou avec votre email</span>
            <div className={styles.dividerLine} />
          </div>

          {/* ── Choix du type de compte ── */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Je m&apos;inscris en tant que :
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {([
                { value: "apprenant", icon: "ti-school",      title: "Apprenant", sub: "J'achète et je suis des cours" },
                { value: "formateur", icon: "ti-chalkboard",  title: "Formateur", sub: "Je crée et je vends des cours" },
              ] as const).map((opt) => {
                const active = accountRole === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAccountRole(opt.value)}
                    aria-pressed={active}
                    style={{
                      flex: 1, textAlign: "left", cursor: "pointer",
                      padding: "10px 12px", borderRadius: "var(--radius-md)",
                      border: "1.5px solid " + (active ? "var(--primary)" : "var(--border)"),
                      background: active ? "var(--primary-light)" : "var(--bg-white)",
                      color: "var(--text)", fontFamily: "var(--font-body)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <i className={`ti ${opt.icon}`} style={{ fontSize: 20, color: "var(--primary)" }} aria-hidden="true" />
                    <span>
                      <span style={{ display: "block", fontWeight: 600, fontSize: "0.86rem" }}>{opt.title}</span>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>{opt.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 6 }}>
              C&apos;est gratuit, et vous pourrez basculer plus tard.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <p role="alert" className={styles.errorMsg}>
                <i className="ti ti-alert-circle" aria-hidden="true" />
                {error}
              </p>
            )}

            <div className={styles.field}>
              <label htmlFor="name">Nom complet</label>
              <div className={styles.inputWrap}>
                <i className="ti ti-user" aria-hidden="true" />
                <input id="name" name="name" type="text"
                  className={styles.input} placeholder="Votre nom complet"
                  required autoComplete="name" />
              </div>
            </div>

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
                  className={styles.input} placeholder="Min. 8 caractères"
                  required minLength={8} autoComplete="new-password" />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Masquer" : "Afficher le mot de passe"}>
                  <i className={`ti ${showPwd ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={styles.termsRow}>
              <input type="checkbox" id="terms"
                checked={terms} onChange={(e) => setTerms(e.target.checked)}
                style={{ accentColor: "var(--primary)" }} />
              <label htmlFor="terms" className={styles.termsText}>
                J&apos;accepte les{" "}
                <Link href="/conditions">Conditions d&apos;utilisation</Link>{" "}
                et la{" "}
                <Link href="/confidentialite">Politique de confidentialité</Link>
              </label>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Création du compte…" : "Créer mon compte"}
            </button>
          </form>

          <p className={styles.switchText}>
            Déjà un compte ?{" "}
            <Link href="/connexion">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  );
}