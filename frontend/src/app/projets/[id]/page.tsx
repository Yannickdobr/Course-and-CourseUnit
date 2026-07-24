"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { projectsApi, type Project } from "@/lib/api";
import { useAuth } from "@/app/components/AuthProvider";
import { useCart } from "@/app/components/CartProvider";
import { CartItem } from "@/types/cart";
import styles from "../projets.module.css";

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

export default function ProjetDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { user } = useAuth();
  const { add, has } = useCart();
  const [project, setProject] = useState<Project | null>(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    projectsApi.getById(id)
      .then((p) => { setProject(p); document.title = `${p?.title ?? "Projet"} — EduFlex Pro`; })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    projectsApi.hasAccess(id, user.id).then(setOwned).catch(() => setOwned(false));
  }, [id, user]);

  if (loading) return <main className={styles.detail}><p style={{ color: "var(--text-muted)" }}>Chargement…</p></main>;
  if (!project) return <main className={styles.detail}><p>Projet introuvable.</p><Link href="/projets" className={styles.back}>← Retour</Link></main>;

  const free = project.price <= 0;
  const canSeeLinks = free || owned;
  const inCart = has(`projet:${project.id}`);

  return (
    <main className={styles.detail}>
      <Link href="/projets" className={styles.back}><i className="ti ti-arrow-left" aria-hidden="true" /> Marketplace de projets</Link>

      <span className={styles.typeBadge}><i className="ti ti-folder" aria-hidden="true" /> {typeLabel(project.type)}</span>
      <h1 className={styles.detailTitle}>{project.title}</h1>
      <div className={styles.detailMeta}>
        <span><i className="ti ti-user" aria-hidden="true" />{project.instructor}</span>
        {project.courseSlug && <span><i className="ti ti-book" aria-hidden="true" /><Link href={`/cours/${project.courseSlug}`} style={{ color: "inherit" }}>Cours lié</Link></span>}
        {project.unitIds?.length > 0 && <span><i className="ti ti-list" aria-hidden="true" />{project.unitIds.length} unité(s) associée(s)</span>}
      </div>

      {project.description && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Énoncé</h2>
          <p className={styles.prose}>{project.description}</p>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ressources & liens</h2>
        {!project.links || project.links.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Aucun lien fourni.</p>
        ) : canSeeLinks ? (
          <div className={styles.linkList}>
            {project.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className={styles.linkRow}>
                <i className="ti ti-external-link" aria-hidden="true" />
                <span>{l.label || l.url}</span>
                <span className={styles.linkUrl}>{l.url}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className={styles.locked}>
            <i className="ti ti-lock" aria-hidden="true" />
            <span>Les {project.links.length} lien(s) de ce projet sont débloqués après l&apos;achat.</span>
          </div>
        )}
      </section>

      {/* Barre d'achat */}
      {!canSeeLinks && (
        <div className={styles.buyBar}>
          <span className={styles.buyPrice}>{fmtXAF(project.price)}</span>
          {inCart ? (
            <Link href="/panier" className={styles.btnPrimary}><i className="ti ti-check" aria-hidden="true" /> Dans le panier — Voir</Link>
          ) : (
            <button type="button" className={styles.btnPrimary} onClick={() => add(projectCartItem(project))}>
              <i className="ti ti-shopping-cart" aria-hidden="true" /> Ajouter au panier
            </button>
          )}
        </div>
      )}
      {owned && (
        <p style={{ marginTop: "1.5rem", color: "var(--success)", fontWeight: 600 }}>
          <i className="ti ti-circle-check" aria-hidden="true" /> Vous possédez ce projet.
        </p>
      )}
    </main>
  );
}
