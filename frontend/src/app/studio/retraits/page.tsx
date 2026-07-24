"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { paymentApi } from "@/lib/api";
import WithdrawForm from "./WithdrawForm";
import styles from "../studio.module.css";

const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const STATUS: Record<string, { label: string; cls: string }> = {
  termine:  { label: "Versé",     cls: "badgeGreen" },
  en_cours: { label: "En cours",  cls: "badgeAmber" },
  rejete:   { label: "Rejeté",    cls: "badgeRed" },
};

export default function StudioRetraitsPage() {
  const { user } = useAuth();
  const [withdrawals] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userName = user.name;
    paymentApi.getInstructorPurchases(userName)
      .then((purchases) => {
        const total = purchases.reduce((sum, p) => sum + p.net, 0);
        setAvailableBalance(total);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement des retraits...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Retraits</h1>
          <p className={styles.sub}>Transférez vos gains vers Mobile Money ou votre compte bancaire.</p>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Colonne gauche : solde + formulaire */}
        <div>
          {/* Solde disponible */}
          <section
            className={styles.card}
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", border: "none" }}
          >
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>Solde disponible au retrait</p>
            <p style={{ color: "#fff", fontSize: "2rem", fontWeight: 700, margin: "4px 0" }}>
              {fmtXAF(availableBalance)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.78rem" }}>
              + {fmtXAF(pendingRevenue)} en attente de validation (disponibles sous 7 jours)
            </p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><i className="ti ti-cash" aria-hidden="true" /> Nouvelle demande de retrait</h2>
            </div>
            <WithdrawForm balance={availableBalance} />
            <p className={styles.hint}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              Retrait minimum 5 000 XAF. Les versements Mobile Money sont traités sous 48h ouvrées, les virements bancaires sous 3 à 5 jours.
            </p>
          </section>
        </div>

        {/* Colonne droite : historique */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}><i className="ti ti-history" aria-hidden="true" /> Historique des retraits</h2>
          </div>
          <div className={styles.tableWrap}>
            {withdrawals.length === 0 ? (
              <p style={{ color: "var(--fg-muted)", padding: "2rem", textAlign: "center" }}>Aucun historique de retrait.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Méthode</th>
                    <th className={styles.tRight}>Montant</th>
                    <th className={styles.tCenter}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => {
                    const st = STATUS[w.status];
                    return (
                      <tr key={w.id}>
                        <td className={styles.tMuted}>{fmtDate(w.date)}</td>
                        <td>
                          <div className={styles.tStrong}>{w.method}</div>
                          <div className={styles.tMuted}>{w.account}</div>
                        </td>
                        <td className={`${styles.tRight} ${styles.tStrong}`}>{fmtXAF(w.amount)}</td>
                        <td className={styles.tCenter}>
                          <span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
