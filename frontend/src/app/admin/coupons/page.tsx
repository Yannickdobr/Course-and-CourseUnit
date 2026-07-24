"use client";

import { useEffect, useState } from "react";
import { paymentApi } from "@/lib/api";
import styles from "./page.module.css";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(10);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await paymentApi.getAllCoupons();
      setCoupons(data);
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger les codes promo.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAddCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !label.trim()) {
      showToast("Le code et le libellé sont requis.", "error");
      return;
    }

    try {
      setSubmitting(true);
      await paymentApi.createCoupon({
        code: code.toUpperCase().trim(),
        pct,
        label: label.trim(),
      });
      showToast("Code promo créé avec succès !");
      setCode("");
      setLabel("");
      setPct(10);
      loadCoupons();
    } catch {
      showToast("Erreur lors de la création du code promo.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCoupon(couponCode: string) {
    if (!confirm(`Voulez-vous supprimer le code promo ${couponCode} ?`)) return;
    try {
      await paymentApi.deleteCoupon(couponCode);
      showToast("Code promo supprimé.");
      loadCoupons();
    } catch {
      showToast("Erreur lors de la suppression.", "error");
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
          <h1 className={styles.title}>Codes de réduction</h1>
          <p className={styles.subtitle}>Créez de nouveaux coupons ou gérez les réductions actives.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Formulaire de création */}
        <section className={styles.formCard}>
          <h2>Nouveau coupon</h2>
          <form onSubmit={handleAddCoupon} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="code">Code promo</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: WELCOME50"
                maxLength={20}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="pct">Pourcentage de réduction (%)</label>
              <input
                id="pct"
                type="number"
                value={pct}
                onChange={(e) => setPct(Math.max(1, Math.min(100, parseInt(e.target.value) || 0)))}
                min={1}
                max={100}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="label">Libellé d&apos;affichage</label>
              <input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Offre de rentrée -50%"
                maxLength={50}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={submitting} className={styles.btnSubmit}>
              {submitting ? "Création..." : "Ajouter le code promo"}
            </button>
          </form>
        </section>

        {/* Liste des coupons existants */}
        <section className={styles.listCard}>
          <h2>Coupons actifs</h2>
          {loading ? (
            <div className={styles.loading}>Chargement des codes...</div>
          ) : coupons.length === 0 ? (
            <p className={styles.empty}>Aucun code promo actif.</p>
          ) : (
            <div className={styles.couponList}>
              {coupons.map((c) => (
                <div key={c.code} className={styles.couponRow}>
                  <div className={styles.couponInfo}>
                    <code className={styles.code}>{c.code}</code>
                    <p className={styles.couponLabel}>{c.label}</p>
                  </div>
                  <div className={styles.couponMeta}>
                    <span className={styles.pctBadge}>-{c.pct}%</span>
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className={styles.btnDelete}
                      aria-label={`Supprimer ${c.code}`}
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
