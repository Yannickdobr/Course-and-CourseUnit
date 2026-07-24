"use client";

import { useEffect, useState, useCallback, type CSSProperties } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { projectsApi, coursesApi, type Project, type ProjectLink } from "@/lib/api";
import { Course } from "@/types/course";
import styles from "../studio.module.css";

const PROJECT_TYPES = [
  { value: "guide",     label: "Projet guidé" },
  { value: "libre",     label: "Projet libre" },
  { value: "etude_cas", label: "Étude de cas" },
  { value: "challenge", label: "Challenge" },
  { value: "groupe",    label: "Projet de groupe" },
];
const typeLabel = (t: string) => PROJECT_TYPES.find((x) => x.value === t)?.label || t || "Projet";

interface UnitOpt { id: string; title: string; type: string }

function blankProject(instructor: string): Project {
  return {
    title: "", description: "", type: "guide", instructor,
    courseId: null, courseSlug: null, price: 0, published: false,
    links: [], unitIds: [],
  };
}

export default function StudioProjetsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [units, setUnits] = useState<UnitOpt[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Projets — Studio EduFlex Pro"; }, []);

  const reload = useCallback(async () => {
    if (!user) return;
    const [ps, cs] = await Promise.all([
      projectsApi.list(user.name),
      coursesApi.byInstructor(user.name),
    ]);
    setProjects(ps);
    setCourses(cs);
    setLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  /* Charge les unités d'un cours pour l'association. */
  const loadUnits = useCallback(async (courseId?: string | null) => {
    if (!courseId) { setUnits([]); return; }
    const course = courses.find((c) => c.id === courseId);
    if (!course) { setUnits([]); return; }
    const detail = await coursesApi.getDetailBySlug(course.slug);
    const flat: UnitOpt[] = [];
    detail?.sections.forEach((s) =>
      s.courseUnits.forEach((u) => flat.push({ id: u.id, title: u.title, type: u.type || "courseUnit" }))
    );
    setUnits(flat);
  }, [courses]);

  function openNew() {
    if (!user) return;
    setEditing(blankProject(user.name));
    setUnits([]);
  }

  async function openEdit(p: Project) {
    setEditing({ ...p, links: [...(p.links || [])], unitIds: [...(p.unitIds || [])] });
    await loadUnits(p.courseId);
  }

  function patch(part: Partial<Project>) {
    setEditing((e) => (e ? { ...e, ...part } : e));
  }

  async function onCourseChange(courseId: string) {
    const course = courses.find((c) => c.id === courseId);
    patch({ courseId: courseId || null, courseSlug: course?.slug || null, unitIds: [] });
    await loadUnits(courseId || null);
  }

  function toggleUnit(id: string) {
    setEditing((e) => {
      if (!e) return e;
      const has = e.unitIds.includes(id);
      return { ...e, unitIds: has ? e.unitIds.filter((u) => u !== id) : [...e.unitIds, id] };
    });
  }

  function setLink(i: number, part: Partial<ProjectLink>) {
    setEditing((e) => e ? { ...e, links: e.links.map((l, idx) => idx === i ? { ...l, ...part } : l) } : e);
  }
  function addLink() { setEditing((e) => e ? { ...e, links: [...e.links, { label: "", url: "" }] } : e); }
  function removeLink(i: number) { setEditing((e) => e ? { ...e, links: e.links.filter((_, idx) => idx !== i) } : e); }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) { alert("Le titre du projet est requis."); return; }
    setBusy(true);
    try {
      const payload: Project = {
        ...editing,
        links: editing.links.filter((l) => l.url.trim()),
      };
      if (editing.id) await projectsApi.update(editing.id, payload);
      else await projectsApi.create(payload);
      setEditing(null);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Échec de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Project) {
    if (!p.id) return;
    if (!window.confirm(`Supprimer le projet « ${p.title} » ?`)) return;
    setBusy(true);
    try {
      await projectsApi.remove(p.id);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }

  const courseTitle = (id?: string | null) => courses.find((c) => c.id === id)?.title || "—";

  if (loading || !user) {
    return <div className={styles.page}><p style={{ color: "var(--text-muted)" }}>Chargement des projets…</p></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projets</h1>
          <p className={styles.sub}>Associez des projets pratiques (énoncé, liens externes, type) à vos unités de cours. Publiez-les sur la marketplace de projets.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={openNew}>
            <i className="ti ti-circle-plus" aria-hidden="true" /> Nouveau projet
          </button>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Projets</span>
          <p className={styles.kpiVal}>{projects.length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Sur la marketplace</span>
          <p className={styles.kpiVal}>{projects.filter((p) => p.published).length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Liens externes</span>
          <p className={styles.kpiVal}>{projects.reduce((a, p) => a + (p.links?.length || 0), 0)}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Unités associées</span>
          <p className={styles.kpiVal}>{projects.reduce((a, p) => a + (p.unitIds?.length || 0), 0)}</p>
        </div>
      </div>

      {/* ── Éditeur (inline) ── */}
      {editing && (
        <section className={styles.card} style={{ marginBottom: "1.25rem", border: "1.5px solid var(--primary)" }}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>
              <i className="ti ti-folder" aria-hidden="true" /> {editing.id ? "Modifier le projet" : "Nouveau projet"}
            </span>
            <button className={styles.btnOutline} onClick={() => setEditing(null)} disabled={busy}>Annuler</button>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12 }}>
              <div>
                <label className={styles.kpiLabel}>Titre du projet *</label>
                <input style={inputBox} value={editing.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Ex : Construire un dashboard analytics" />
              </div>
              <div>
                <label className={styles.kpiLabel}>Type</label>
                <select style={inputBox} value={editing.type} onChange={(e) => patch({ type: e.target.value })}>
                  {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={styles.kpiLabel}>Énoncé / description</label>
              <textarea style={{ ...inputBox, minHeight: 90, resize: "vertical" }} value={editing.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Objectifs, livrables attendus, critères d'évaluation…" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className={styles.kpiLabel}>Cours associé</label>
                <select style={inputBox} value={editing.courseId || ""} onChange={(e) => onCourseChange(e.target.value)}>
                  <option value="">— Aucun (projet autonome) —</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10, alignItems: "end" }}>
                <div>
                  <label className={styles.kpiLabel}>Prix (XAF)</label>
                  <input type="number" min={0} step={500} style={inputBox} value={editing.price} onChange={(e) => patch({ price: Math.max(0, Number(e.target.value)) })} />
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.84rem", paddingBottom: 8 }}>
                  <input type="checkbox" checked={editing.published} onChange={(e) => patch({ published: e.target.checked })} />
                  Publier sur la marketplace
                </label>
              </div>
            </div>

            {/* Association d'unités */}
            {editing.courseId && (
              <div>
                <label className={styles.kpiLabel}>Unités associées {units.length > 0 && `(${editing.unitIds.length}/${units.length})`}</label>
                {units.length === 0 ? (
                  <p className={styles.tMuted} style={{ marginTop: 4 }}>Ce cours n&apos;a pas encore d&apos;unités.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 6 }}>
                    {units.map((u) => (
                      <label key={u.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.82rem", cursor: "pointer" }}>
                        <input type="checkbox" checked={editing.unitIds.includes(u.id)} onChange={() => toggleUnit(u.id)} />
                        {u.title}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Liens externes */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label className={styles.kpiLabel}>Liens externes (dépôt Git, énoncé, dataset, démo…)</label>
                <button className={styles.btnOutline} onClick={addLink} type="button"><i className="ti ti-plus" /> Ajouter un lien</button>
              </div>
              {editing.links.length === 0 && <p className={styles.tMuted} style={{ marginTop: 4 }}>Aucun lien.</p>}
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {editing.links.map((l, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: 8 }}>
                    <input style={inputBox} placeholder="Libellé" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} />
                    <input style={inputBox} placeholder="https://…" value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} />
                    <button className={styles.btnOutline} type="button" onClick={() => removeLink(i)} aria-label="Retirer le lien"><i className="ti ti-trash" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className={styles.btnPrimary} onClick={save} disabled={busy}>
                <i className="ti ti-device-floppy" aria-hidden="true" /> Enregistrer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Liste ── */}
      <section className={styles.card}>
        {projects.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">🗂️</span>
            <p className={styles.emptyTitle}>Aucun projet</p>
            <p className={styles.emptySub}>Créez votre premier projet pratique et associez-le à vos unités de cours.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Type</th>
                  <th>Cours</th>
                  <th className={styles.tCenter}>Unités</th>
                  <th className={styles.tCenter}>Liens</th>
                  <th className={styles.tCenter}>Marketplace</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.tStrong}>{p.title}</span>
                      {p.price > 0 && <span className={styles.tMuted}> · {p.price.toLocaleString("fr-FR")} XAF</span>}
                    </td>
                    <td><span className={`${styles.badge} ${styles.badgePurple}`}>{typeLabel(p.type)}</span></td>
                    <td className={styles.tMuted}>{courseTitle(p.courseId)}</td>
                    <td className={`${styles.tCenter} ${styles.tStrong}`}>{p.unitIds?.length || 0}</td>
                    <td className={`${styles.tCenter} ${styles.tStrong}`}>{p.links?.length || 0}</td>
                    <td className={styles.tCenter}>
                      <span className={`${styles.badge} ${p.published ? styles.badgeGreen : styles.badgeGray}`}>
                        {p.published ? "Publié" : "Privé"}
                      </span>
                    </td>
                    <td className={styles.tRight}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button className={styles.btnOutline} onClick={() => openEdit(p)} disabled={busy}><i className="ti ti-edit" /> Modifier</button>
                        <button className={styles.btnOutline} onClick={() => remove(p)} disabled={busy} style={{ color: "var(--pink)" }}><i className="ti ti-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* Style d'input réutilisé (cohérent avec les autres formulaires studio). */
const inputBox: CSSProperties = {
  width: "100%",
  marginTop: 4,
  padding: "8px 11px",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg-white)",
  fontSize: "0.86rem",
  fontFamily: "var(--font-body)",
  color: "var(--text)",
};
