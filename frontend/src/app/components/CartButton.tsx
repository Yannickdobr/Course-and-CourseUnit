"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import styles from "./CartButton.module.css";

export default function CartButton() {
  const pathname = usePathname();
  const { count } = useCart();

  /* Masqué là où il n'a pas de sens : panier, paiement, lecteur de cours */
  const hidden =
    count === 0 ||
    pathname === "/panier" ||
    pathname.startsWith("/paiement") ||
    pathname.endsWith("/apprendre");

  if (hidden) return null;

  return (
    <Link href="/panier" className={styles.cartButton} aria-label={`Voir le panier (${count} article${count > 1 ? "s" : ""})`}>
      <i className="ti ti-shopping-cart" aria-hidden="true" />
      <span className={styles.label}>Panier</span>
      <span className={styles.badge}>{count}</span>
    </Link>
  );
}
