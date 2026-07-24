"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Course } from "@/types/course";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi } from "@/lib/api";
import styles from "./page.module.css";

export default function SouhaitsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    coursesApi.getWishlist(user.id).then(setItems).catch(() => setItems([]));
  }, [user]);

  const remove = (courseId: string) => {
    if (!user) return;
    coursesApi.removeWishlist(user.id, courseId);
    setItems((prev) => prev.filter((i) => i.id !== courseId));
  };
  const total = items.reduce((a, i) => a + i.priceUnit, 0);
  const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

  return (
    <div className={styles.page}>
      {/* En-tête */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Liste de souhaits</h1>
          <p className={styles.sub}>
            {items.length} cours sauvegardé{items.length !== 1 ? "s" : ""} pour plus tard.
          </p>
        </div>
        <Link href="/catalogue" className={styles.btnExplore}>
          <i className="ti ti-plus" aria-hidden="true" />
          Ajouter des cours
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">💜</span>
          <h2 className={styles.emptyTitle}>Votre liste est vide</h2>
          <p className={styles.emptySub}>
            Parcourez le catalogue et cliquez sur le cœur pour sauvegarder les cours
            qui vous intéressent.
          </p>
          <Link href="/catalogue" className={styles.btnExplore}>
            <i className="ti ti-search" aria-hidden="true" /> Explorer le catalogue
          </Link>
        </div>
      ) : (
        <>
          {/* Récap */}
          <div className={styles.summary}>
            <p className={styles.summaryText}>
              Total estimé (à l&apos;unité) : <strong>{fmtXAF(total)}</strong>
            </p>
            <button className={styles.btnBuyAll}>
              <i className="ti ti-shopping-cart" aria-hidden="true" /> Tout ajouter au panier
            </button>
          </div>

          {/* Grille */}
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.thumb} style={{ background: item.thumbGradient }} aria-hidden="true">
                  {item.emoji}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => remove(item.id)}
                  aria-label={`Retirer ${item.title} de la liste`}
                  title="Retirer de la liste"
                >
                  <i className="ti ti-heart" aria-hidden="true" />
                </button>

                <div className={styles.body}>
                  <p className={styles.category}>{item.category}</p>
                  <Link href={`/cours/${item.slug}`} className={styles.cardTitle}>
                    {item.title}
                  </Link>

                  <div className={styles.footer}>
                    <div>
                      <span className={styles.price}>dès {fmtXAF(item.priceUnit)}</span>
                      <span className={styles.priceNote}>/ courseUnit</span>
                    </div>
                    <Link href={`/cours/${item.slug}`} className={styles.btnBuy}>
                      <i className="ti ti-shopping-cart" aria-hidden="true" /> Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
