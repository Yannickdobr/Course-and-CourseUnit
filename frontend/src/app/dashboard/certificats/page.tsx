"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { certificateApi, ApiCertificate } from "@/lib/api";
import styles from "./page.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function CertificatsPage() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<ApiCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function loadCerts() {
      try {
        const data = await certificateApi.getByUserId(userId);
        setCerts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement de vos certificats...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── En-tête ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mes certificats</h1>
          <p className={styles.sub}>
            {certs.length} certificat{certs.length !== 1 ? "s" : ""} obtenu{certs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {certs.length === 0 ? (
        /* ── État vide ── */
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>🎓</div>
          <h2 className={styles.emptyTitle}>Aucun certificat pour l&apos;instant</h2>
          <p className={styles.emptySub}>
            Terminez un cours à 100% pour obtenir votre premier certificat vérifiable.
          </p>
          <Link href="/dashboard/mes-cours" className={styles.btnPrimary}>
            Voir mes cours en cours →
          </Link>
        </div>
      ) : (
        <>
          {/* ── Grille de certificats ── */}
          <div className={styles.grid}>
            {certs.map((cert) => {
              const verifyCode = `EFP-${cert.id.substring(0, 8).toUpperCase()}`;

              return (
                <div key={cert.id} className={styles.certCard}>
                  {/* Ruban décoratif */}
                  <div className={styles.certRibbon} aria-hidden>
                    <i className="ti ti-certificate" />
                  </div>

                  {/* En-tête carte */}
                  <div className={styles.certCardTop}>
                    <div
                      className={styles.certThumb}
                      style={{ background: "var(--primary-dark)" }}
                      aria-hidden
                    >
                      🎓
                    </div>
                    <div>
                      <span className={styles.certCategory}>Formation</span>
                      <p className={styles.certLabel}>Certificat de réussite</p>
                    </div>
                  </div>

                  {/* Corps */}
                  <div className={styles.certBody}>
                    <h3 className={styles.certTitle}>{cert.courseTitle}</h3>
                    <p className={styles.certRecipient}>
                      Délivré à <strong>{cert.studentName}</strong>
                    </p>
                    <p className={styles.certDate}>
                      <i className="ti ti-calendar" aria-hidden /> le {formatDate(cert.issuedAt)}
                    </p>
                  </div>

                  {/* Code de vérification */}
                  <div className={styles.certCode}>
                    <span className={styles.certCodeLabel}>Code de vérification</span>
                    <code className={styles.certCodeVal}>{verifyCode}</code>
                  </div>

                  {/* Actions */}
                  <div className={styles.certActions}>
                    <a
                      href={certificateApi.downloadUrl(cert.id)}
                      className={styles.btnDownload}
                      aria-label={`Télécharger le certificat ${cert.courseTitle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="ti ti-download" aria-hidden /> Télécharger
                    </a>
                    <button
                      className={styles.btnShare}
                      onClick={() => {
                        const verifyUrl = `${window.location.origin}/certificats/verification/${cert.id}`;
                        navigator.clipboard.writeText(verifyUrl);
                        alert("Lien de vérification copié dans le presse-papiers !");
                      }}
                      aria-label={`Copier le lien de vérification du certificat ${cert.courseTitle}`}
                    >
                      <i className="ti ti-link" aria-hidden /> Copier le lien
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── CTA continuer ── */}
          <div className={styles.cta}>
            <div className={styles.ctaText}>
              <i className="ti ti-trophy" aria-hidden />
              <span>Continuez votre parcours pour obtenir d&apos;autres certifications !</span>
            </div>
            <Link href="/catalogue" className={styles.btnPrimary}>
              Explorer le catalogue →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}