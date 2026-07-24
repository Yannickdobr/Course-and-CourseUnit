"use client";

import { useState, useTransition } from "react";
import { DraftCourse, DraftCourseUnit, courseStatusLabel } from "@/types/studio";
import { uploadCourseFile, mediaSrc } from "@/lib/api";
import CourseUnitEditor from "./CourseUnitEditor";
import PricingPanel from "./PricingPanel";
import PublicationChecklist from "./PublicationChecklist";
import styles from "./CourseEditor.module.css";

const CATEGORIES = ["Dev Web","Data Science","Business","Design","Mobile","Cybersécurité","IA / ML"];
const LEVELS     = ["Débutant","Intermédiaire","Avancé"] as const;
const LANGUAGES  = ["Français","Anglais","Arabe","Espagnol"];

interface Props {
  initial: DraftCourse;
  onSave: (course: DraftCourse) => Promise<void>;
  onSubmit: (course: DraftCourse) => Promise<void>;
}

export default function CourseEditor({ initial, onSave, onSubmit }: Props) {
  const [course, setCourse] = useState<DraftCourse>(initial);
  const [saved, setSaved]   = useState(false);
  const [isPending, startTransition] = useTransition();
  const [extraCats, setExtraCats] = useState<string[]>([]);

  const allCats = Array.from(new Set([...CATEGORIES, ...extraCats, course.category].filter(Boolean)));

  function handleCategoryChange(value: string) {
    if (value === "__add__") {
      const name = window.prompt("Nom du nouveau domaine métier :")?.trim();
      if (name) {
        setExtraCats((prev) => Array.from(new Set([...prev, name])));
        patch({ category: name });
      }
      return;
    }
    patch({ category: value });
  }

  const patch = (p: Partial<DraftCourse>) => {
    setSaved(false);
    setCourse((c) => ({ ...c, ...p }));
  };

  const handleSave = () => {
    startTransition(async () => {
      await onSave(course);
      setSaved(true);
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      await onSubmit(course);
    });
  };

  const allCourseUnits = course.sections.flatMap((s) => s.courseUnits);

  /* Mettre à jour les courseUnits de la première section (MVP flat structure) */
  const handleCourseUnitsChange = (courseUnits: DraftCourseUnit[]) => {
    patch({
      sections: course.sections.length
        ? [{ ...course.sections[0], courseUnits }, ...course.sections.slice(1)]
        : [{ id: crypto.randomUUID(), title: "Contenu du cours", order: 1, courseUnits }],
    });
  };

  const statusClass =
    course.status === "publie"      ? styles.statusGreen  :
    course.status === "en_revision" ? styles.statusAmber  :
    course.status === "rejete"      ? styles.statusRed    : styles.statusGray;

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <h1 className={styles.pageTitle}>
            {course.title || "Nouveau cours"}
          </h1>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {courseStatusLabel(course.status)}
          </span>
        </div>
        <div className={styles.topActions}>
          {saved && <span className={styles.savedMsg}><i className="ti ti-check" aria-hidden="true" /> Sauvegardé</span>}
          <button className={styles.btnOutline} onClick={handleSave} disabled={isPending}>
            <i className="ti ti-device-floppy" aria-hidden="true" />
            Sauvegarder
          </button>
          {course.id !== "nouveau" && (
            <a href={`/cours/${course.id}`} target="_blank" rel="noopener noreferrer" className={styles.btnOutline}>
              <i className="ti ti-eye" aria-hidden="true" />
              Aperçu
            </a>
          )}
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={isPending || course.status === "en_revision"}
          >
            <i className="ti ti-send" aria-hidden="true" />
            Soumettre pour validation
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>

          {/* ── Informations générales ── */}
          <section className={styles.card} aria-labelledby="info-heading">
            <h2 id="info-heading" className={styles.cardTitle}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              Informations générales
            </h2>

            <div className={styles.fieldRow}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="courseTitle" className={styles.label}>Titre du cours</label>
                <input
                  id="courseTitle"
                  type="text"
                  className={styles.input}
                  value={course.title}
                  placeholder="Un titre clair et accrocheur…"
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="courseDesc" className={styles.label}>Description courte</label>
                <textarea
                  id="courseDesc"
                  className={styles.textarea}
                  value={course.description}
                  placeholder="Ce que l'apprenant va maîtriser après ce cours…"
                  rows={3}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="courseObjectives" className={styles.label}>Objectifs du cours <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(un objectif par ligne)</span></label>
                <textarea
                  id="courseObjectives"
                  className={styles.textarea}
                  value={course.objectives ?? ""}
                  placeholder={"Comprendre les Server Components\nDéployer sur Vercel\n…"}
                  rows={3}
                  onChange={(e) => patch({ objectives: e.target.value })}
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="courseSkills" className={styles.label}>Compétences acquises <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(une compétence par ligne)</span></label>
                <textarea
                  id="courseSkills"
                  className={styles.textarea}
                  value={course.skills ?? ""}
                  placeholder={"React 18\nNext.js App Router\nAuthentification\n…"}
                  rows={3}
                  onChange={(e) => patch({ skills: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="cat" className={styles.label}>Domaine métier <span style={{ color: "var(--pink)" }}>*</span></label>
                <select
                  id="cat"
                  className={styles.select}
                  value={course.category}
                  required
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__add__">➕ Ajouter une nouvelle catégorie…</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="level" className={styles.label}>Niveau</label>
                <select id="level" className={styles.select} value={course.level} onChange={(e) => patch({ level: e.target.value as DraftCourse["level"] })}>
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="lang" className={styles.label}>Langue</label>
                <select id="lang" className={styles.select} value={course.language} onChange={(e) => patch({ language: e.target.value })}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="tags" className={styles.label}>Tags (séparés par virgule)</label>
                <input
                  id="tags"
                  type="text"
                  className={styles.input}
                  value={course.tags.join(", ")}
                  placeholder="React, Next.js, TypeScript…"
                  onChange={(e) => patch({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                />
              </div>
            </div>
          </section>

          {/* ── Tarification ── */}
          <section className={styles.card} aria-labelledby="pricing-heading">
            <h2 id="pricing-heading" className={styles.cardTitle}>
              <i className="ti ti-discount" aria-hidden="true" />
              Tarification
            </h2>
            <PricingPanel
              priceFull={course.priceFull}
              promoCode={course.promoCode ?? ""}
              onChange={(p) => patch(p)}
            />
          </section>

          {/* ── CourseUnits ── */}
          <section className={styles.card} aria-labelledby="courseUnits-heading">
            <h2 id="courseUnits-heading" className={styles.cardTitle}>
              <i className="ti ti-list" aria-hidden="true" />
              CourseUnits &amp; prix individuels
              <span className={styles.courseUnitCount}>{allCourseUnits.length} courseUnit{allCourseUnits.length !== 1 ? "s" : ""}</span>
            </h2>
            <CourseUnitEditor
              courseUnits={allCourseUnits}
              onChange={handleCourseUnitsChange}
            />
          </section>

          {/* ── Médias ── */}
          <section className={styles.card} aria-labelledby="media-heading">
            <h2 id="media-heading" className={styles.cardTitle}>
              <i className="ti ti-photo" aria-hidden="true" />
              Miniature &amp; vidéo d&apos;aperçu
            </h2>
            <div className={styles.mediaGrid}>
              <div>
                <p className={styles.label} style={{ marginBottom: 8 }}>Miniature du cours</p>
                <label className={styles.uploadZone} htmlFor="thumbUpload">
                  <i className="ti ti-upload" aria-hidden="true" />
                  <span>{course.thumbUrl ? "Modifier la miniature" : "Glisser-déposer ou cliquer"}</span>
                  <small>JPG, PNG · max 2 Mo · 1280×720 px recommandé</small>
                  <input
                    id="thumbUpload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.hiddenInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const data = await uploadCourseFile(file);
                            patch({ thumbUrl: data.route });
                          } catch (error) {
                            console.error("Upload failed", error);
                          }
                        }
                      }}
                  />
                </label>
                {course.thumbUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaSrc(course.thumbUrl)} alt="Miniature" className={styles.thumbPreview} />
                )}
              </div>
              <div>
                <p className={styles.label} style={{ marginBottom: 8 }}>Vidéo d&apos;aperçu (optionnel)</p>
                <label className={styles.uploadZone} htmlFor="previewUpload">
                  <i className="ti ti-video" aria-hidden="true" />
                  <span>{course.previewVideoUrl ? "Modifier la vidéo" : "Glisser-déposer ou cliquer"}</span>
                  <small>MP4 · max 200 Mo · max 3 minutes</small>
                  <input
                    id="previewUpload"
                    type="file"
                    accept="video/mp4,video/webm"
                    className={styles.hiddenInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const data = await uploadCourseFile(file);
                            patch({ previewVideoUrl: data.route });
                          } catch (error) {
                            console.error("Upload failed", error);
                          }
                        }
                      }}
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar droite : checklist ── */}
        <aside className={styles.aside}>
          <div className={styles.card} style={{ position: "sticky", top: "80px" }}>
            <h2 className={styles.cardTitle}>
              <i className="ti ti-circle-check" aria-hidden="true" />
              Checklist de publication
            </h2>
            <PublicationChecklist course={course} />
          </div>
        </aside>
      </div>
    </div>
  );
}