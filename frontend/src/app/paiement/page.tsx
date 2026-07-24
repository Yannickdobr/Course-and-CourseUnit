"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, paymentApi, projectsApi } from "@/lib/api";
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

type Method = "mobile" | "carte" | "paypal";

const PROVIDERS = [
  { id: "orange", label: "Orange Money", icon: "ti-device-mobile" },
  { id: "mtn",    label: "MTN MoMo",     icon: "ti-device-mobile" },
  { id: "wave",   label: "Wave",         icon: "ti-wave-sine" },
  { id: "airtel", label: "Airtel Money", icon: "ti-device-mobile" },
];

export default function PaiementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, discount, total, coupon, clear } = useCart();

  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [method, setMethod] = useState<Method>("mobile");
  const [provider, setProvider] = useState("orange");
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", holder: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">🛒</span>
            <h1 className={styles.emptyTitle}>Aucun article à payer</h1>
            <Link href="/catalogue" className={styles.emptyBtn}>
              <i className="ti ti-search" aria-hidden="true" /> Explorer le catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Veuillez saisir un email valide pour recevoir votre facture.");
      return;
    }
    if (method === "mobile" && phone.trim().length < 8) {
      setError("Veuillez saisir un numéro Mobile Money valide.");
      return;
    }
    if (method === "carte" && (card.number.replace(/\s/g, "").length < 12 || card.cvc.length < 3)) {
      setError("Veuillez vérifier les informations de votre carte.");
      return;
    }

    setLoading(true);
    try {
      if (user) {
        // 1) Transaction de paiement. Avec une vraie API (Stripe/NotchPay), c'est ici qu'on
        //    redirigerait l'utilisateur et que la confirmation viendrait du webhook.
        const tx = await paymentApi.createTransaction({
          userId: user.id,
          amount: total,
          currency: "XAF",
          method,
          itemsSummary: items.map((i) => `${i.kind}:${i.label}`).join(" | "),
        });
        const confirmed = await paymentApi.confirmTransaction(tx.id);
        if (confirmed.status !== "PAID") {
          throw new Error("Le paiement n'a pas abouti. Veuillez réessayer.");
        }

        // 2) Paiement validé => on débloque le contenu et on enregistre les achats.
        for (const item of items) {
          const ci = item as Record<string, unknown> & typeof item;
          if (item.kind === "cours") {
            await coursesApi.enroll(user.id, ci.courseId as string | undefined, undefined);
          } else if (item.kind === "courseUnit") {
            await coursesApi.enroll(user.id, undefined, ci.courseUnitId as string | undefined);
          } else if (item.kind === "module") {
            await coursesApi.enroll(user.id, undefined, undefined, ci.moduleId as string | undefined);
          } else if (item.kind === "projet" && ci.projectId) {
            await projectsApi.purchase(ci.projectId as string, user.id);
          }
          await paymentApi.recordPurchase({
            userId: user.id,
            userName: user.name,
            userEmail: email,
            courseId: ci.courseId as string | undefined,
            courseSlug: ci.courseSlug as string | undefined,
            label: item.label,
            type: item.kind,
            instructor: ci.instructor as string | undefined,
            gross: item.unitPrice,
          });
        }
      }

      const order = {
        id: "EFP-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        email,
        name,
        method: method === "mobile" ? PROVIDERS.find((p) => p.id === provider)?.label : method === "carte" ? "Carte bancaire" : "PayPal",
        items,
        subtotal,
        discount,
        coupon: coupon?.code ?? null,
        total,
        date: new Date().toISOString(),
      };
      const existingOrders = JSON.parse(localStorage.getItem("eduflex-orders") || "[]");
      existingOrders.unshift(order);
      localStorage.setItem("eduflex-orders", JSON.stringify(existingOrders));
      localStorage.setItem("eduflex-last-order", JSON.stringify(order));

      // Reçu par e-mail (best-effort)
      await paymentApi.sendReceipt({
        email,
        name,
        orderId: order.id,
        currency: "XAF",
        total,
        items: items.map((i) => ({ label: i.label, type: i.kind, price: i.unitPrice })),
      });

      clear();
      router.push("/paiement/confirmation");
    } catch (err: any) {
      setError(err.message || "Le paiement a échoué. Veuillez réessayer.");
      setLoading(false);
    }
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
          <Link href="/panier" className={styles.backLink}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Retour au panier
          </Link>
        </div>

        <h1 className={styles.title}>Paiement sécurisé</h1>

        <form className={styles.grid} onSubmit={handlePay}>
          {/* Colonne formulaire */}
          <div>
            {/* Coordonnées */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.stepNum}>1</span> Vos coordonnées
              </h2>
              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="email" className={styles.label}>Email (pour la facture)</label>
                  <input id="email" type="email" className={styles.input} value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="name" className={styles.label}>Nom complet</label>
                  <input id="name" type="text" className={styles.input} value={name}
                    onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
                </div>
              </div>
            </section>

            {/* Méthode de paiement */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <span className={styles.stepNum}>2</span> Méthode de paiement
              </h2>

              <div className={styles.methodTabs} role="tablist">
                {([
                  { id: "mobile", label: "Mobile Money", icon: "ti-device-mobile" },
                  { id: "carte", label: "Carte bancaire", icon: "ti-credit-card" },
                  { id: "paypal", label: "PayPal", icon: "ti-brand-paypal" },
                ] as { id: Method; label: string; icon: string }[]).map((m) => (
                  <button type="button" key={m.id} role="tab" aria-selected={method === m.id}
                    className={`${styles.methodTab} ${method === m.id ? styles.methodTabActive : ""}`}
                    onClick={() => setMethod(m.id)}>
                    <i className={`ti ${m.icon}`} aria-hidden="true" />
                    {m.label}
                  </button>
                ))}
              </div>

              {method === "mobile" && (
                <>
                  <div className={styles.providers}>
                    {PROVIDERS.map((p) => (
                      <button type="button" key={p.id}
                        className={`${styles.provider} ${provider === p.id ? styles.providerActive : ""}`}
                        onClick={() => setProvider(p.id)} aria-pressed={provider === p.id}>
                        <i className={`ti ${p.icon}`} aria-hidden="true" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>Numéro Mobile Money</label>
                    <input id="phone" type="tel" className={styles.input} value={phone}
                      onChange={(e) => setPhone(e.target.value)} placeholder="Ex : 6 70 00 00 00" />
                  </div>
                </>
              )}

              {method === "carte" && (
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label htmlFor="cardNum" className={styles.label}>Numéro de carte</label>
                    <input id="cardNum" className={styles.input} value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" inputMode="numeric" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="exp" className={styles.label}>Expiration</label>
                    <input id="exp" className={styles.input} value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/AA" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="cvc" className={styles.label}>CVC</label>
                    <input id="cvc" className={styles.input} value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" inputMode="numeric" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label htmlFor="holder" className={styles.label}>Titulaire de la carte</label>
                    <input id="holder" className={styles.input} value={card.holder}
                      onChange={(e) => setCard({ ...card, holder: e.target.value })} placeholder="Nom sur la carte" />
                  </div>
                </div>
              )}

              {method === "paypal" && (
                <p className={styles.paypalNote}>
                  <i className="ti ti-info-circle" aria-hidden="true" />
                  Vous serez redirigé vers PayPal pour finaliser le paiement en toute sécurité après avoir cliqué sur « Payer ».
                </p>
              )}

              {error && (
                <p className={styles.errorMsg}>
                  <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
                </p>
              )}
            </section>
          </div>

          {/* Récapitulatif */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Votre commande</h2>
            <div className={styles.sumItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.sumItem}>
                  <span className={styles.sumThumb} style={{ background: item.thumbBg }} aria-hidden="true">{item.emoji}</span>
                  <div className={styles.sumInfo}>
                    <p className={styles.sumLabel}>{item.label}</p>
                    <p className={styles.sumKind}>{KIND_LABEL[item.kind]}</p>
                  </div>
                  <span className={styles.sumPrice}>{fmtXAF(item.unitPrice)}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider} />
            <div className={styles.row}><span>Sous-total</span><span>{fmtXAF(subtotal)}</span></div>
            {discount > 0 && (
              <div className={`${styles.row} ${styles.rowDiscount}`}>
                <span>Remise{coupon ? ` (${coupon.code})` : ""}</span><span>−{fmtXAF(discount)}</span>
              </div>
            )}
            <div className={styles.divider} />
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalVal}>{fmtXAF(total)}</span>
            </div>

            <button type="submit" className={styles.payBtn} disabled={loading}>
              <i className="ti ti-lock" aria-hidden="true" />
              {loading ? "Traitement…" : `Payer ${fmtXAF(total)}`}
            </button>
            <p className={styles.finePrint}>
              <span className={styles.secure}><i className="ti ti-shield-check" aria-hidden="true" /> Transaction chiffrée TLS 1.3</span>
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
