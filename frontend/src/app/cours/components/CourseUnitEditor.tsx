"use client";

import { useState } from "react";
import { DraftCourseUnit } from "@/types/studio";
import { uploadCourseFile, coursesApi, type ReusableUnit } from "@/lib/api";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./CourseUnitEditor.module.css";

interface Props {
  courseUnits: DraftCourseUnit[];
  onChange: (courseUnits: DraftCourseUnit[]) => void;
}

const UNIT_TYPES = [
  { value: "module",     label: "Module",      icon: "ti-folder",     desc: "Contient d'autres unités" },
  { value: "chapitre",   label: "Chapitre",    icon: "ti-book",       desc: "Leçon générale" },
  { value: "paragraphe", label: "Paragraphe",  icon: "ti-align-left", desc: "Contenu texte" },
  { value: "video",      label: "Vidéo",       icon: "ti-video",      desc: "Fichier ou URL vidéo" },
  { value: "pdf",        label: "PDF",         icon: "ti-file-text",  desc: "Document PDF" },
  { value: "image",      label: "Image",       icon: "ti-photo",      desc: "Fichier image" },
  { value: "quiz",       label: "Quiz",        icon: "ti-help",       desc: "Évaluation" },
];
/* Types « feuille » dont le contenu est un fichier/URL */
const MEDIA_TYPES = ["video", "pdf", "image"];

function typeMeta(t?: string) {
  return UNIT_TYPES.find((x) => x.value === t) || UNIT_TYPES[1];
}

let counter = 0;
function makeUnit(type: string, parentId?: string): DraftCourseUnit {
  counter += 1;
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    price: 0,
    isFree: type === "module",
    status: "publie",
    order: 0,
    type,
    parentId,
    prerequisites: [],
    resources: [],
  };
}

/* Référence vers une unité autonome existante (réutilisation). */
function makeReusedUnit(lib: ReusableUnit, parentId?: string): DraftCourseUnit {
  counter += 1;
  return {
    id: crypto.randomUUID(),
    originId: lib.id,
    title: lib.title,
    description: lib.description || "",
    price: lib.price,
    isFree: lib.price <= 0,
    status: "publie",
    order: 0,
    duration: lib.duration,
    type: lib.type || "chapitre",
    parentId,
    prerequisites: [],
    resources: [],
  };
}

export default function CourseUnitEditor({ courseUnits, onChange }: Props) {
  const { user } = useAuth();
  /* picker ouvert pour ajouter une unité (au niveau racine ou dans un module) */
  const [picker, setPicker] = useState<{ parentId?: string } | null>(null);
  /* picker de réutilisation : bibliothèque d'unités autonomes */
  const [reuse, setReuse] = useState<{ parentId?: string } | null>(null);
  const [library, setLibrary] = useState<ReusableUnit[] | null>(null);
  const [libLoading, setLibLoading] = useState(false);

  const update = (id: string, patch: Partial<DraftCourseUnit>) =>
    onChange(courseUnits.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addUnit = (type: string, parentId?: string) => {
    onChange([...courseUnits, makeUnit(type, parentId)]);
    setPicker(null);
  };

  const openReuse = (parentId?: string) => {
    setReuse({ parentId });
    if (library === null && !libLoading) {
      setLibLoading(true);
      coursesApi.getReusableUnits(user?.name)
        .then(setLibrary)
        .catch(() => setLibrary([]))
        .finally(() => setLibLoading(false));
    }
  };

  const addReused = (lib: ReusableUnit, parentId?: string) => {
    onChange([...courseUnits, makeReusedUnit(lib, parentId)]);
    setReuse(null);
  };

  const removeUnit = (id: string) => {
    const toRemove = new Set<string>([id]);
    courseUnits.forEach((c) => { if (c.parentId === id) toRemove.add(c.id); });
    onChange(courseUnits.filter((c) => !toRemove.has(c.id)));
  };

  const topLevel = courseUnits.filter((c) => !c.parentId);
  const childrenOf = (pid: string) => courseUnits.filter((c) => c.parentId === pid);
  const prereqCandidates = (selfId: string) =>
    courseUnits.filter((c) => c.id !== selfId && c.type !== "module" && c.title.trim());

  /* ─── Sélecteur de type (à l'ajout) ─── */
  function TypePicker({ parentId, inModule }: { parentId?: string; inModule?: boolean }) {
    const opts = inModule ? UNIT_TYPES.filter((t) => t.value !== "module") : UNIT_TYPES;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0.75rem", border: "1.5px dashed var(--border)", borderRadius: "var(--radius-md)", marginTop: 8 }}>
        <span style={{ width: "100%", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>
          Choisissez le type de l&apos;unité :
        </span>
        {opts.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => addUnit(t.value, parentId)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-white)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "var(--font-body)" }}
            title={t.desc}
          >
            <i className={`ti ${t.icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
        <button type="button" onClick={() => setPicker(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem" }}>
          Annuler
        </button>
      </div>
    );
  }

  /* ─── Sélecteur de réutilisation (bibliothèque d'unités autonomes) ─── */
  function ReusePicker({ parentId }: { parentId?: string }) {
    const usedOrigins = new Set(courseUnits.map((c) => c.originId).filter(Boolean) as string[]);
    const list = (library || []).filter((l) => !usedOrigins.has(l.id));
    return (
      <div style={{ padding: "0.85rem", border: "1.5px dashed var(--primary)", borderRadius: "var(--radius-md)", marginTop: 8, background: "var(--primary-light)" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)" }}>
            <i className="ti ti-recycle" aria-hidden="true" /> Réutiliser une unité autonome existante
          </span>
          <button type="button" onClick={() => setReuse(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem" }}>
            Annuler
          </button>
        </div>
        {libLoading && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Chargement de votre bibliothèque…</p>}
        {!libLoading && list.length === 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Aucune unité réutilisable disponible. Les unités que vous créez dans vos cours deviennent automatiquement réutilisables ici.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
          {list.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => addReused(l, parentId)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-white)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}
              title={`Réutiliser « ${l.title} » (depuis ${l.courseTitle})`}
            >
              <i className={`ti ${typeMeta(l.type).icon}`} style={{ color: "var(--primary)" }} aria-hidden="true" />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600 }}>{l.title}</span>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {typeMeta(l.type).label} · {l.price > 0 ? `${l.price.toLocaleString("fr-FR")} XAF` : "Gratuit"} · issu de « {l.courseTitle} »
                </span>
              </span>
              <i className="ti ti-plus" style={{ color: "var(--primary)" }} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Contenu / ressource d'une unité feuille ─── */
  function LeafContent({ u }: { u: DraftCourseUnit }) {
    if (u.type === "paragraphe") {
      return (
        <div style={{ marginTop: 8 }}>
          <label className={styles.resourcesTitle} style={{ margin: "0 0 4px" }}>Contenu du paragraphe</label>
          <textarea
            className={styles.titleInput}
            style={{ width: "100%", minHeight: 90, resize: "vertical" }}
            placeholder="Saisissez le texte du paragraphe…"
            value={u.description || ""}
            onChange={(e) => update(u.id, { description: e.target.value })}
          />
        </div>
      );
    }
    if (MEDIA_TYPES.includes(u.type || "")) {
      const res = u.resources?.[0];
      const accept = u.type === "video" ? "video/*" : u.type === "image" ? "image/*" : "application/pdf";
      const setUrl = (url: string, name?: string) =>
        update(u.id, { resources: [{ name: name ?? (res?.name || u.title || u.type || "ressource"), type: u.type || "video", url }] });
      return (
        <div style={{ marginTop: 8 }}>
          <label className={styles.resourcesTitle} style={{ margin: "0 0 4px" }}>
            {u.type === "video" ? "Vidéo" : u.type === "pdf" ? "Document PDF" : "Image"} (fichier ou URL)
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              className={styles.titleInput}
              style={{ flex: 1, minWidth: 200 }}
              placeholder="https://… ou téléversez un fichier"
              value={res?.url || ""}
              onChange={(e) => setUrl(e.target.value)}
            />
            <label className={styles.uploadBtnLabel} title="Téléverser un fichier">
              <i className="ti ti-upload" /> Téléverser
              <input
                type="file"
                accept={accept}
                className={styles.hiddenInput}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const data = await uploadCourseFile(file);
                    setUrl(data.route, file.name); // on stocke la route relative (cloud-ready)
                  } catch (err) {
                    alert("Erreur de téléversement : " + (err as Error).message);
                  }
                }}
              />
            </label>
          </div>
          {res?.url && <p style={{ fontSize: "0.74rem", color: "var(--success)", marginTop: 4 }}><i className="ti ti-check" /> Ressource renseignée</p>}
        </div>
      );
    }
    return null; // chapitre / quiz : description seule
  }

  /* ─── Prérequis ─── */
  function Prereqs({ u }: { u: DraftCourseUnit }) {
    const cands = prereqCandidates(u.id);
    if (cands.length === 0) return null;
    return (
      <div style={{ marginTop: 10 }}>
        <label className={styles.resourcesTitle} style={{ margin: "0 0 4px" }}>
          Prérequis conseillés <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(mention, non bloquant)</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
          {cands.map((o) => (
            <label key={o.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.82rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={(u.prerequisites || []).includes(o.id)}
                onChange={(e) => {
                  const cur = u.prerequisites || [];
                  update(u.id, { prerequisites: e.target.checked ? [...cur, o.id] : cur.filter((x) => x !== o.id) });
                }}
              />
              {o.title}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Débouchés (ce que cette unité prépare) ─── */
  function Outcomes({ u }: { u: DraftCourseUnit }) {
    const cands = prereqCandidates(u.id);
    if (cands.length === 0) return null;
    return (
      <div style={{ marginTop: 10 }}>
        <label className={styles.resourcesTitle} style={{ margin: "0 0 4px" }}>
          Débouchés <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(ce que cette unité aide à comprendre)</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
          {cands.map((o) => (
            <label key={o.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.82rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={(u.outcomes || []).includes(o.id)}
                onChange={(e) => {
                  const cur = u.outcomes || [];
                  update(u.id, { outcomes: e.target.checked ? [...cur, o.id] : cur.filter((x) => x !== o.id) });
                }}
              />
              {o.title}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Chaîne séquentielle Avant / Après ─── */
  function Chain({ u }: { u: DraftCourseUnit }) {
    const opts = courseUnits.filter((c) => c.id !== u.id && c.type !== "module" && c.title.trim());
    return (
      <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label className={styles.resourcesTitle} style={{ margin: 0 }}><i className="ti ti-arrow-left" /> Unité précédente (Avant)</label>
          <select className={styles.statusSelect} value={u.previousId || ""} onChange={(e) => update(u.id, { previousId: e.target.value || undefined })}>
            <option value="">— Aucune —</option>
            {opts.filter((o) => o.id !== u.nextId).map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label className={styles.resourcesTitle} style={{ margin: 0 }}>Unité suivante (Après) <i className="ti ti-arrow-right" /></label>
          <select className={styles.statusSelect} value={u.nextId || ""} onChange={(e) => update(u.id, { nextId: e.target.value || undefined })}>
            <option value="">— Aucune —</option>
            {opts.filter((o) => o.id !== u.previousId).map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </div>
      </div>
    );
  }

  /* ─── Carte d'édition d'une unité ─── */
  function UnitCard({ u, child }: { u: DraftCourseUnit; child?: boolean }) {
    const meta = typeMeta(u.type);
    const isModule = u.type === "module";
    const isReused = !!u.originId;
    return (
      <div key={u.id} style={{ border: isReused ? "1.5px solid var(--primary)" : "1.5px solid var(--border)", borderRadius: "var(--radius-md)", padding: "0.9rem 1rem", background: child ? "var(--bg)" : "var(--bg-white)", marginBottom: 10 }}>
        {/* En-tête : type + titre + supprimer */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 9px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>
            <i className={`ti ${meta.icon}`} aria-hidden="true" /> {meta.label}
          </span>
          {isReused && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", fontWeight: 700, color: "var(--success)", background: "var(--success-light)", padding: "3px 9px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }} title="Unité autonome réutilisée : le contenu et le prix proviennent de l'unité d'origine">
              <i className="ti ti-recycle" aria-hidden="true" /> Réutilisée
            </span>
          )}
          <select
            className={styles.statusSelect}
            value={u.type || "chapitre"}
            onChange={(e) => update(u.id, { type: e.target.value })}
            aria-label="Type d'unité"
            style={{ maxWidth: 130 }}
            disabled={isReused}
          >
            {(child ? UNIT_TYPES.filter((t) => t.value !== "module") : UNIT_TYPES).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            className={styles.titleInput}
            style={{ flex: 1 }}
            placeholder={isModule ? "Titre du module…" : "Titre de l'unité…"}
            value={u.title}
            onChange={(e) => update(u.id, { title: e.target.value })}
            disabled={isReused}
          />
          <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => removeUnit(u.id)} title="Retirer du cours" aria-label="Retirer l'unité du cours">
            <i className="ti ti-trash" aria-hidden="true" />
          </button>
        </div>

        {/* Description (sauf paragraphe où le contenu est la description) */}
        {u.type !== "paragraphe" && !isReused && (
          <textarea
            className={styles.titleInput}
            style={{ width: "100%", marginTop: 8, minHeight: 56, resize: "vertical" }}
            placeholder="Description courte de l'unité…"
            value={u.description || ""}
            onChange={(e) => update(u.id, { description: e.target.value })}
          />
        )}

        {/* Objectifs & compétences de l'unité (une ligne = un item) */}
        {!isReused && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div>
              <label className={styles.resourcesTitle} style={{ margin: "0 0 4px" }}>Objectifs de l&apos;unité</label>
              <textarea
                className={styles.titleInput}
                style={{ width: "100%", minHeight: 52, resize: "vertical" }}
                placeholder={"Un objectif par ligne…"}
                value={u.objectives || ""}
                onChange={(e) => update(u.id, { objectives: e.target.value })}
              />
            </div>
            <div>
              <label className={styles.resourcesTitle} style={{ margin: "0 0 4px" }}>Compétences acquises</label>
              <textarea
                className={styles.titleInput}
                style={{ width: "100%", minHeight: 52, resize: "vertical" }}
                placeholder={"Une compétence par ligne…"}
                value={u.skills || ""}
                onChange={(e) => update(u.id, { skills: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Unité réutilisée : contenu/prix gérés sur l'unité d'origine */}
        {isReused && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 8 }}>
            <i className="ti ti-info-circle" aria-hidden="true" /> Contenu et prix ({u.price > 0 ? `${u.price.toLocaleString("fr-FR")} XAF` : "Gratuit"}) hérités de l&apos;unité d&apos;origine. L&apos;achat est partagé : un apprenant qui l&apos;a déjà achetée la retrouve ici.
          </p>
        )}

        {/* Tarification (unités achetables = non-module, non réutilisées) */}
        {!isModule && !isReused && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <div className={styles.priceWrap}>
              <input
                type="number" className={styles.priceInput} min={0} step={100}
                value={u.isFree ? 0 : u.price}
                disabled={u.isFree}
                onChange={(e) => update(u.id, { price: Math.max(0, Number(e.target.value)) })}
                aria-label="Prix de l'unité"
              />
              <span className={styles.currency}>XAF</span>
            </div>
            <label className={styles.freeToggle}>
              <input type="checkbox" checked={u.isFree} onChange={(e) => update(u.id, { isFree: e.target.checked, price: 0 })} />
              <span>Gratuit / aperçu</span>
            </label>
          </div>
        )}

        {/* Contenu / ressource des feuilles (non réutilisées) */}
        {!isModule && !isReused && LeafContent({ u })}

        {/* Prérequis / Débouchés / Chaîne */}
        {!isModule && Prereqs({ u })}
        {!isModule && Outcomes({ u })}
        {!isModule && Chain({ u })}

        {/* Module : unités internes */}
        {isModule && (
          <div style={{ marginTop: 10, paddingLeft: 14, borderLeft: "2px solid var(--border)" }}>
            {childrenOf(u.id).map((c) => UnitCard({ u: c, child: true }))}
            {picker?.parentId === u.id && TypePicker({ parentId: u.id, inModule: true })}
            {reuse?.parentId === u.id && ReusePicker({ parentId: u.id })}
            {picker?.parentId !== u.id && reuse?.parentId !== u.id && (
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <button className={styles.addBtn} onClick={() => setPicker({ parentId: u.id })}>
                  <i className="ti ti-plus" aria-hidden="true" /> Ajouter une unité
                </button>
                <button className={styles.addBtn} onClick={() => openReuse(u.id)}>
                  <i className="ti ti-recycle" aria-hidden="true" /> Réutiliser une unité
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {topLevel.length === 0 && !picker && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 10 }}>
          Aucune unité pour l&apos;instant. Ajoutez un module ou une unité (chapitre, vidéo, PDF, paragraphe…).
        </p>
      )}

      {topLevel.map((u) => UnitCard({ u }))}

      {picker && !picker.parentId && TypePicker({})}
      {reuse && !reuse.parentId && ReusePicker({})}
      {!(picker && !picker.parentId) && !(reuse && !reuse.parentId) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className={styles.addBtn} onClick={() => setPicker({})}>
            <i className="ti ti-plus" aria-hidden="true" /> Ajouter une unité
          </button>
          <button className={styles.addBtn} onClick={() => openReuse()}>
            <i className="ti ti-recycle" aria-hidden="true" /> Réutiliser une unité existante
          </button>
        </div>
      )}
    </div>
  );
}
