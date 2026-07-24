"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectsApi, type Project } from "@/lib/api";
import { useCart } from "@/app/components/CartProvider";
import { CartItem } from "@/types/cart";
import styles from "./projets.module.css";

const TYPE_LABEL: Record<string, string> = {
  guide: "Projet guidé", libre: "Projet libre", etude_cas: "Étude de cas",
  challenge: "Challenge", groupe: "Projet de groupe",
};
const typeLabel = (t: string) => TYPE_LABEL[t] || t || "Projet";
const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

function projectCartItem(p: Project): CartItem {
  return {
    id: `projet:${p.id}`,
    kind: "projet",
    courseSlug: p.courseSlug || "projet",
    courseTitle: p.title,
    label: "Projet — " + p.title,
    emoji: "🗂️",
    thumbBg: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    unitPrice: p.price,
    projectId: p.id,
    instructor: p.instructor,
  };
}

export default function ProjetsMarketplacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { add, has } = useCart();

  useEffect(() => { document.title = "Marketplace de projets — EduFlex Pro"; }, []);

  useEffect(() => {
    projectsApi.marketplace()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Marketplace de projets</h1>
        <p className={styles.heroSub}>
          Des projets pratiques conçus par nos formateurs pour mettre vos compétences à l&apos;épreuve : énoncés, dépôts, datasets et démos.
        </p>
      </header>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Chargement des projets…</p>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">🗂️</span>
          <p>Aucun projet disponible pour le moment. Revenez bientôt !</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => {
            const inCart = has(`projet:${p.id}`);
            const free = p.price <= 0;
            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.typeBadge}><i className="ti ti-folder" aria-hidden="true" /> {typeLabel(p.type)}</span>
                  <span className={`${styles.priceTag} ${free ? styles.free : ""}`}>{free ? "Gratuit" : fmtXAF(p.price)}</span>
                </div>
                <h2 className={styles.cardTitle}>{p.title}</h2>
                {p.description && <p className={styles.cardDesc}>{p.description}</p>}
                <div className={styles.cardMeta}>
                  <span><i className="ti ti-user" aria-hidden="true" />{p.instructor}</span>
                  {p.unitIds?.length > 0 && <span><i className="ti ti-list" aria-hidden="true" />{p.unitIds.length} unité{p.unitIds.length > 1 ? "s" : ""}</span>}
                  {p.links?.length > 0 && <span><i className="ti ti-link" aria-hidden="true" />{p.links.length} lien{p.links.length > 1 ? "s" : ""}</span>}
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/projets/${p.id}`} className={styles.btnOutline}>Détails</Link>
                  {free ? (
                    <Link href={`/projets/${p.id}`} className={styles.btnPrimary}><i className="ti ti-eye" aria-hidden="true" /> Accéder</Link>
                  ) : inCart ? (
                    <Link href="/panier" className={styles.btnPrimary}><i className="ti ti-check" aria-hidden="true" /> Dans le panier</Link>
                  ) : (
                    <button type="button" className={styles.btnPrimary} onClick={() => add(projectCartItem(p))}>
                      <i className="ti ti-shopping-cart" aria-hidden="true" /> Ajouter
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
