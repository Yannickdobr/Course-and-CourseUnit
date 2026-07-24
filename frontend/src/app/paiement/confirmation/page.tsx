"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartItem } from "@/types/cart";
import styles from "./page.module.css";

interface Order {
  id: string;
  email: string;
  name?: string;
  method?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  coupon: string | null;
  total: number;
  date: string;
}

const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

export default function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("eduflex-last-order");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className={styles.page}>
        <div className={styles.card}><p className={styles.loading}>Chargement…</p></div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.checkWrap} style={{ background: "var(--primary-light)", color: "var(--primary)" }} aria-hidden="true">
            <i className="ti ti-receipt" />
          </div>
          <h1 className={styles.title}>Aucune commande récente</h1>
          <p className={styles.subtitle}>Vous n&apos;avez pas de commande à afficher.</p>
          <div className={styles.actions}>
            <Link href="/catalogue" className={styles.btnPrimary}>
              <i className="ti ti-search" aria-hidden="true" /> Explorer le catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* Cible « accès immédiat » : 1er article rattaché à un cours */
  const firstCourse = order.items.find((i) => i.courseSlug);
  const accessHref = firstCourse ? `/cours/${firstCourse.courseSlug}/apprendre` : "/dashboard/mes-cours";

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.checkWrap} aria-hidden="true">
          <i className="ti ti-circle-check" />
        </div>
        <h1 className={styles.title}>Paiement confirmé 🎉</h1>
        <p className={styles.subtitle}>
          Merci pour votre achat ! Votre commande <strong>{order.id}</strong> a bien été enregistrée.
        </p>

        {/* Récapitulatif commande */}
        <div className={styles.orderBox}>
          <div className={styles.orderHead}>
            <span className={styles.orderId}>Commande <strong>{order.id}</strong></span>
            <span className={styles.orderDate}>
              {new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <div className={styles.itemList}>
            {order.items.map((item) => (
              <div key={item.id} className={styles.item}>
                <span className={styles.itemThumb} style={{ background: item.thumbBg }} aria-hidden="true">{item.emoji}</span>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.itemPrice}>{fmtXAF(item.unitPrice)}</span>
              </div>
            ))}
          </div>

          <div className={styles.divider} />
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total payé</span>
            <span className={styles.totalVal}>{fmtXAF(order.total)}</span>
          </div>
          {order.method && <p className={styles.payMethod}>Payé via {order.method}</p>}
        </div>

        {/* Accès immédiat (RF-LRN-07) */}
        <div className={styles.accessNote}>
          <i className="ti ti-player-play" aria-hidden="true" />
          <div>
            <p><strong>Accès immédiat débloqué.</strong></p>
            <span>Votre contenu est disponible dès maintenant, à vie.</span>
          </div>
        </div>

        {/* Facture (RF-LRN-08) */}
        <p className={styles.invoiceNote}>
          <i className="ti ti-mail" aria-hidden="true" />
          Une facture a été envoyée à {order.email}
        </p>

        <div className={styles.actions}>
          <Link href={accessHref} className={styles.btnPrimary}>
            <i className="ti ti-player-play" aria-hidden="true" /> Commencer à apprendre
          </Link>
          <Link href="/dashboard/mes-cours" className={styles.btnOutline}>
            <i className="ti ti-book" aria-hidden="true" /> Mes cours
          </Link>
        </div>
      </div>
    </main>
  );
}
