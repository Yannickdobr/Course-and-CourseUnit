"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../components/CartProvider";
import { CartItem } from "@/types/cart";
import styles from "./page.module.css";

const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

const KIND_LABEL: Record<CartItem["kind"], string> = {
  cours: "Cours complet",
  courseUnit: "CourseUnit",
  module: "Module",
  projet: "Projet",
  forfait: "Forfait",
};

export default function PanierPage() {
  const { items, subtotal, discount, total, coupon, remove, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    const res = await applyCoupon(code);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) setCode("");
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon} aria-hidden="true"><i className="ti ti-books" /></span>
            EduFlex Pro
          </Link>
          <Link href="/catalogue" className={styles.continueLink}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Continuer mes achats
          </Link>
        </div>

        <h1 className={styles.title}>Mon panier</h1>
        <p className={styles.subtitle}>
          {items.length} article{items.length !== 1 ? "s" : ""} dans votre panier
        </p>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">🛒</span>
            <h2 className={styles.emptyTitle}>Votre panier est vide</h2>
            <p className={styles.emptySub}>
              Parcourez le catalogue et ajoutez des courseUnits, des cours complets ou des forfaits.
            </p>
            <Link href="/catalogue" className={styles.emptyBtn}>
              <i className="ti ti-search" aria-hidden="true" /> Explorer le catalogue
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Articles */}
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemThumb} style={{ background: item.thumbBg }} aria-hidden="true">
                    {item.emoji}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemKind}>{KIND_LABEL[item.kind]}</span>
                    <p className={styles.itemLabel}>{item.label}</p>
                    <p className={styles.itemCourse}>{item.courseTitle}</p>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>{fmtXAF(item.unitPrice)}</span>
                    {item.originalPrice && item.originalPrice > item.unitPrice && (
                      <span className={styles.itemOriginal}>{fmtXAF(item.originalPrice)}</span>
                    )}
                    <button className={styles.removeBtn} onClick={() => remove(item.id)}>
                      <i className="ti ti-trash" aria-hidden="true" /> Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Récapitulatif */}
            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>Récapitulatif</h2>

              {/* Coupon */}
              {coupon ? (
                <div className={styles.couponTag}>
                  <span><i className="ti ti-ticket" aria-hidden="true" /> {coupon.code} (−{coupon.pct}%)</span>
                  <button className={styles.couponRemove} onClick={() => { removeCoupon(); setMsg(null); }} aria-label="Retirer le coupon">
                    <i className="ti ti-x" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.promoRow}>
                    <input
                      className={styles.promoInput}
                      placeholder="Code promo"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
                      aria-label="Code promo"
                    />
                    <button className={styles.promoBtn} onClick={handleApply}>Appliquer</button>
                  </div>
                  {msg && (
                    <p className={`${styles.promoMsg} ${msg.ok ? styles.promoOk : styles.promoErr}`}>
                      <i className={`ti ${msg.ok ? "ti-check" : "ti-alert-circle"}`} aria-hidden="true" />
                      {msg.text}
                    </p>
                  )}
                  <p className={styles.itemCourse} style={{ marginBottom: "0.75rem" }}>
                    Essayez « LAUNCH30 » pour −30%.
                  </p>
                </>
              )}

              <div className={styles.divider} />

              <div className={styles.row}>
                <span>Sous-total</span>
                <span>{fmtXAF(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.row} ${styles.rowDiscount}`}>
                  <span>Remise{coupon ? ` (${coupon.code})` : ""}</span>
                  <span>−{fmtXAF(discount)}</span>
                </div>
              )}

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalVal}>{fmtXAF(total)}</span>
              </div>

              <Link href="/paiement" className={styles.checkoutBtn}>
                <i className="ti ti-lock" aria-hidden="true" /> Passer au paiement
              </Link>

              <div className={styles.guarantees}>
                <span className={styles.guarantee}><i className="ti ti-shield-check" aria-hidden="true" /> Paiement sécurisé SSL</span>
                <span className={styles.guarantee}><i className="ti ti-rotate" aria-hidden="true" /> Remboursement 30 jours</span>
                <span className={styles.guarantee}><i className="ti ti-infinity" aria-hidden="true" /> Accès à vie au contenu acheté</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
