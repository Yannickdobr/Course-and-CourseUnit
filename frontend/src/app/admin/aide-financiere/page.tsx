"use client";

import { useEffect, useState } from "react";
import { paymentApi } from "@/lib/api";
import styles from "./page.module.css";

export default function AdminFinancialAidPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  async function loadApplications() {
    try {
      setLoading(true);
      const data = await paymentApi.getAllFinancialAids();
      setApplications(data);
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger les demandes d'aide.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleUpdateStatus(id: string, newStatus: "APPROUVEE" | "REFUSEE") {
    try {
      await paymentApi.updateFinancialAidStatus(id, newStatus);
      showToast(`Demande de financement mise à jour : ${newStatus}`);
      loadApplications();
    } catch {
      showToast("Erreur lors de la mise à jour de la demande.", "error");
    }
  }

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
          <i className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} />
          {toast.msg}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Aides Financières</h1>
          <p className={styles.subtitle}>Examinez les dossiers d&apos;aide financière et accordez des bourses d&apos;études.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement des dossiers...</div>
      ) : (
        <div className={styles.grid}>
          {applications.length === 0 ? (
            <div className={styles.emptyCard}>
              <i className="ti ti-info-circle" />
              <p>Aucun dossier d&apos;aide financière à afficher.</p>
            </div>
          ) : (
            applications.map((aid) => (
              <div key={aid.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.cardUserTitle}>Candidat</h2>
                    <p className={styles.cardUserId}>ID de l&apos;étudiant : {aid.userId}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${aid.status === "APPROUVEE" ? styles.statusApproved : aid.status === "REFUSEE" ? styles.statusRejected : ""}`}>
                    {aid.status}
                  </span>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detail}>
                    <span className={styles.label}>Revenu mensuel</span>
                    <span className={styles.val}>{aid.monthlyIncome.toLocaleString("fr-FR")} XAF</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Zone défavorisée</span>
                    <span className={styles.val}>{aid.disadvantaged ? "Oui" : "Non"}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Heures auditées</span>
                    <span className={styles.val}>{aid.auditHours}h</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Score calculé</span>
                    <span className={styles.val}>{Math.round(aid.score * 100)}%</span>
                  </div>
                </div>

                <div className={styles.motivationSec}>
                  <h3 className={styles.motivationTitle}>Score de motivation</h3>
                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${aid.motivationScore * 100}%` }} />
                    </div>
                    <span>{aid.motivationScore.toFixed(2)} / 1.00</span>
                  </div>
                </div>

                {aid.status === "EN_ATTENTE" && (
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleUpdateStatus(aid.id, "APPROUVEE")}
                      className={styles.btnApprove}
                    >
                      <i className="ti ti-check" /> Accorder l&apos;aide
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(aid.id, "REFUSEE")}
                      className={styles.btnReject}
                    >
                      <i className="ti ti-x" /> Refuser
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
