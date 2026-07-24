"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { CourseDetail, DetailCourseUnit } from "@/types/courseDetail";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, mediaSrc } from "@/lib/api";
import styles from "./LearnerPlayer.module.css";

/* ─── Types ─── */
interface FlatCourseUnit extends DetailCourseUnit {
  sectionTitle: string;
  sectionOrder: number;
}

interface Props {
  course: CourseDetail;
  allCourseUnits: FlatCourseUnit[];
}

type PanelTab = "notes" | "ressources" | "forum";

/* ─── Helpers ─── */
function fmt(min: number) {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}` : `${h}h`;
}

const UNIT_TYPE_META: Record<string, { label: string; icon: string }> = {
  video:      { label: "Vidéo",      icon: "ti-player-play" },
  paragraphe: { label: "Lecture",    icon: "ti-align-left" },
  pdf:        { label: "Document",   icon: "ti-file-text" },
  image:      { label: "Image",      icon: "ti-photo" },
  quiz:       { label: "Quiz",       icon: "ti-help" },
  module:     { label: "Module",     icon: "ti-folder" },
  courseUnit: { label: "Unité",      icon: "ti-book" },
  chapitre:   { label: "Chapitre",   icon: "ti-book" },
};
const unitMeta = (t?: string) => UNIT_TYPE_META[t || "courseUnit"] || UNIT_TYPE_META.courseUnit;

/* Mode d'affichage de la zone centrale selon le type d'unité (et ses ressources). */
function stageMode(u: DetailCourseUnit): "video" | "pdf" | "image" | "article" {
  const res = u.resources || [];
  if (u.type === "video") return "video";
  if (u.type === "pdf") return "pdf";
  if (u.type === "image") return "image";
  if (u.type === "paragraphe") return "article";
  if (res.some((r) => r.type === "video")) return "video";
  if (res.some((r) => r.type === "pdf")) return "pdf";
  if (res.some((r) => r.type === "image")) return "image";
  return "article";
}

/* ─── Barre de progression du courseUnit ─── */
function CourseUnitProgress({ pct }: { pct: number }) {
  return (
    <div className={styles.chProgressBar} aria-label={`${pct}% visionnés`}>
      <div className={styles.chProgressFill} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Item de courseUnit dans la sidebar ─── */
function CourseUnitItem({
  courseUnit,
  index,
  isActive,
  isCompleted,
  isLocked,
  progress,
  onClick,
}: {
  courseUnit: FlatCourseUnit;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`${styles.courseUnitItem} ${isActive ? styles.courseUnitActive : ""} ${isLocked ? styles.courseUnitLocked : ""}`}
      onClick={onClick}
      disabled={isLocked}
      aria-current={isActive ? "true" : undefined}
      aria-label={`${isLocked ? "CourseUnit verrouillé : " : ""}${courseUnit.title}`}
    >
      <div className={styles.courseUnitStatusIcon} aria-hidden>
        {isCompleted ? (
          <span className={styles.iconDone}><i className="ti ti-circle-check" /></span>
        ) : isActive ? (
          <span className={styles.iconPlaying}><i className="ti ti-player-play" /></span>
        ) : isLocked ? (
          <span className={styles.iconLocked}><i className="ti ti-lock" /></span>
        ) : (
          <span className={styles.iconLocked}><i className={`ti ${unitMeta(courseUnit.type).icon}`} /></span>
        )}
      </div>

      <div className={styles.courseUnitMeta}>
        <p className={styles.courseUnitTitle}>{courseUnit.title}</p>
        <p className={styles.courseUnitDuration}>
          <i className={`ti ${unitMeta(courseUnit.type).icon}`} aria-hidden /> {unitMeta(courseUnit.type).label} · {fmt(courseUnit.duration)}
        </p>
        {isActive && progress > 0 && <CourseUnitProgress pct={progress} />}
      </div>
    </button>
  );
}

/* ─── Panneau de notes ─── */
function NotesPanel({ courseUnitTitle }: { courseUnitTitle: string }) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<{ time: string; text: string }[]>([]);

  function saveNote() {
    if (!note.trim()) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setSaved((prev) => [{ time: now, text: note.trim() }, ...prev]);
    setNote("");
  }

  return (
    <div className={styles.notesPanel}>
      <p className={styles.panelCourseUnitLabel}>{courseUnitTitle}</p>

      <textarea
        className={styles.noteInput}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Prendre une note pour ce courseUnit…"
        rows={4}
        onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") saveNote(); }}
      />
      <button className={styles.btnSaveNote} onClick={saveNote} disabled={!note.trim()}>
        <i className="ti ti-plus" aria-hidden /> Ajouter la note
      </button>

      {saved.length > 0 && (
        <ul className={styles.noteList}>
          {saved.map((n, i) => (
            <li key={i} className={styles.noteItem}>
              <span className={styles.noteTime}>{n.time}</span>
              <p className={styles.noteText}>{n.text}</p>
            </li>
          ))}
        </ul>
      )}

      {saved.length === 0 && (
        <p className={styles.emptyHint}>
          <i className="ti ti-notes" aria-hidden /> Vos notes apparaîtront ici.
        </p>
      )}
    </div>
  );
}

/* ─── Panneau ressources (réelles, servies par le serveur média) ─── */
const RES_ICON: Record<string, string> = {
  video: "ti-player-play", pdf: "ti-file-text", image: "ti-photo", ressource: "ti-paperclip",
};
function RessourcesPanel({ courseUnit }: { courseUnit: FlatCourseUnit }) {
  const items = courseUnit.resources || [];
  return (
    <div className={styles.ressourcesPanel}>
      <p className={styles.panelCourseUnitLabel}>{courseUnit.title}</p>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.5rem 0" }}>
          Aucune ressource jointe à cette unité.
        </p>
      ) : (
        <ul className={styles.resList}>
          {items.map((r, i) => (
            <li key={i} className={styles.resItem}>
              <i className={`ti ${RES_ICON[r.type] || "ti-file"}`} aria-hidden />
              <span className={styles.resLabel}>{r.name || r.type}</span>
              <span className={styles.resSize}>{r.type}</span>
              <a className={styles.resBtn} href={mediaSrc(r.url)} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${r.name || r.type}`}>
                <i className="ti ti-external-link" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Panneau forum ─── */
function ForumPanel() {
  const [question, setQuestion] = useState("");
  const questions = [
    { author: "Nadia O.", time: "il y a 2j", text: "Pourquoi utiliser useCallback ici plutôt que useMemo ?", replies: 3 },
    { author: "Jean K.",  time: "il y a 5j", text: "Le code du repo ne correspond pas à la vidéo, quelqu'un a le lien à jour ?", replies: 1 },
  ];
  return (
    <div className={styles.forumPanel}>
      <textarea
        className={styles.noteInput}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poser une question sur ce courseUnit…"
        rows={3}
      />
      <button className={styles.btnSaveNote} onClick={() => setQuestion("")} disabled={!question.trim()}>
        <i className="ti ti-send" aria-hidden /> Envoyer
      </button>
      <ul className={styles.qList}>
        {questions.map((q, i) => (
          <li key={i} className={styles.qItem}>
            <div className={styles.qHeader}>
              <span className={styles.qAuthor}>{q.author}</span>
              <span className={styles.qTime}>{q.time}</span>
            </div>
            <p className={styles.qText}>{q.text}</p>
            <button className={styles.qReplies}>
              <i className="ti ti-message-circle" aria-hidden /> {q.replies} réponse{q.replies > 1 ? "s" : ""}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════ */
export default function LearnerPlayer({ course, allCourseUnits }: Props) {
  const { user } = useAuth();
  const [activeIdx, setActiveIdx]         = useState(0);
  const [completed, setCompleted]         = useState<Set<string>>(new Set());
  const [progress, setProgress]           = useState<Record<string, number>>({});
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [panelTab, setPanelTab]           = useState<PanelTab>("notes");
  const [fullCourse, setFullCourse]       = useState(false);
  const [ownedUnitIds, setOwnedUnitIds]   = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Accès granulé : une unité est consultable si gratuite/aperçu, ou si l'apprenant
     a acheté le cours complet, ou précisément cette unité. */
  const isAccessible = useCallback(
    (u: DetailCourseUnit) => !!(u.isFree || u.isPreview || fullCourse || ownedUnitIds.has(u.id)),
    [fullCourse, ownedUnitIds]
  );

  const activeCourseUnit = allCourseUnits[activeIdx];
  const totalCourseUnits = allCourseUnits.length;
  const completedCount = completed.size;
  const overallPct = Math.round((completedCount / totalCourseUnits) * 100);

  /* Charger les complétions depuis le backend */
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function loadCompletions() {
      try {
        const completedIds = await coursesApi.getCompletions(userId);
        setCompleted(new Set(completedIds));
        const prog: Record<string, number> = {};
        completedIds.forEach((id) => {
          prog[id] = 100;
        });
        setProgress(prog);
      } catch (e) {
        console.error(e);
      }
    }
    loadCompletions();
  }, [user]);

  /* Charger la carte d'accès (cours complet + unités achetées) et ouvrir la 1re unité accessible. */
  useEffect(() => {
    if (!user || !course.id) return;
    let active = true;
    coursesApi.getCourseAccess(user.id, course.id).then((acc) => {
      if (!active) return;
      setFullCourse(acc.fullCourse);
      const owned = new Set(acc.unitIds);
      setOwnedUnitIds(owned);
      const firstOk = allCourseUnits.findIndex(
        (u) => u.isFree || u.isPreview || acc.fullCourse || owned.has(u.id)
      );
      if (firstOk > 0) setActiveIdx(firstOk);
    });
    return () => { active = false; };
  }, [user, course.id, allCourseUnits]);

  /* Groupe les courseUnits par section pour la sidebar */
  const sections = course.sections.map((s) => ({
    ...s,
    flatCourseUnits: allCourseUnits.filter((ch) => ch.sectionOrder === s.order),
  }));

  function goToCourseUnit(idx: number) {
    const target = allCourseUnits[idx];
    if (target && !isAccessible(target)) return; // unité verrouillée : pas de navigation
    setActiveIdx(idx);
  }

  async function markDone() {
    const chId = activeCourseUnit.id;
    setCompleted((prev) => new Set([...prev, chId]));
    setProgress((prev) => ({ ...prev, [chId]: 100 }));
    if (user) {
      try {
        await coursesApi.toggleCompletion(user.id, chId, true);
      } catch (e) {
        console.error(e);
      }
    }
    if (activeIdx < totalCourseUnits - 1) goToCourseUnit(activeIdx + 1);
  }

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (!duration) return;
    const pct = Math.round((currentTime / duration) * 100);
    setProgress((prev) => ({ ...prev, [activeCourseUnit.id]: pct }));
    if (pct >= 90) {
      setCompleted((prev) => {
        if (prev.has(activeCourseUnit.id)) return prev;
        const next = new Set(prev);
        next.add(activeCourseUnit.id);
        if (user) {
          coursesApi.toggleCompletion(user.id, activeCourseUnit.id, true).catch(console.error);
        }
        return next;
      });
    }
  }, [activeCourseUnit.id, user]);

  /* Rendu de la zone centrale selon le type d'unité. */
  function renderStage() {
    const u = activeCourseUnit;
    const res = u.resources || [];
    const mode = stageMode(u);

    if (mode === "video") {
      const src = mediaSrc(res.find((r) => r.type === "video")?.url);
      return (
        <div className={styles.videoStage}>
          {src ? (
            <video
              ref={videoRef}
              className={styles.videoEl}
              controls
              src={src}
              onTimeUpdate={handleTimeUpdate}
              onEnded={markDone}
              aria-label={u.title}
            />
          ) : (
            <div className={styles.videoMissing}>
              <div className={styles.videoMissingBg} style={{ background: course.thumbGradient }} />
              <div className={styles.videoMissingInner}>
                <i className="ti ti-video-off" style={{ fontSize: "2rem" }} aria-hidden />
                <p>La vidéo de cette unité n&apos;est pas encore disponible.</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === "pdf") {
      const pdf = res.find((r) => r.type === "pdf");
      const src = mediaSrc(pdf?.url);
      if (!src) return <div className={styles.articleStage}><p className={styles.emptyStage}>Aucun document PDF joint à cette unité.</p></div>;
      return (
        <div className={styles.pdfStage}>
          <iframe className={styles.pdfFrame} src={src} title={u.title} />
          <div className={styles.pdfBar}>
            <span style={{ fontSize: ".82rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-file-text" aria-hidden /> {pdf?.name || "Document PDF"}
            </span>
            <a className={styles.resBtn} href={src} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir / télécharger le PDF">
              <i className="ti ti-download" aria-hidden />
            </a>
          </div>
        </div>
      );
    }

    if (mode === "image") {
      const src = mediaSrc(res.find((r) => r.type === "image")?.url);
      if (!src) return <div className={styles.articleStage}><p className={styles.emptyStage}>Aucune image jointe à cette unité.</p></div>;
      // eslint-disable-next-line @next/next/no-img-element
      return <div className={styles.imageStage}><img className={styles.imageEl} src={src} alt={u.title} /></div>;
    }

    /* article / paragraphe / fallback */
    const text = (u.description || "").trim();
    return (
      <div className={styles.articleStage}>
        {text ? (
          <div className={styles.prose}>
            {text.split("\n").map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))}
          </div>
        ) : (
          <p className={styles.emptyStage}>Cette unité n&apos;a pas encore de contenu.</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.shell}>

      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <Link href={`/cours/${course.slug}`} className={styles.backBtn} aria-label="Retour au cours">
            <i className="ti ti-arrow-left" aria-hidden />
          </Link>
          <div
            className={styles.topThumb}
            style={{ background: course.thumbGradient }}
            aria-hidden
          >
            {course.thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaSrc(course.thumbUrl)} alt="" />
            ) : (
              course.emoji
            )}
          </div>
          <div className={styles.topInfo}>
            <p className={styles.topTitle}>{course.title}</p>
            <p className={styles.topMeta}>{completedCount}/{totalCourseUnits} courseUnits · {overallPct}%</p>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className={styles.topProgress} aria-label={`Progression globale : ${overallPct}%`}>
          <div className={styles.topProgressFill} style={{ width: `${overallPct}%` }} />
        </div>

        <div className={styles.topRight}>
          <button
            className={styles.topBtn}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Masquer le programme" : "Afficher le programme"}
          >
            <i className={`ti ${sidebarOpen ? "ti-layout-sidebar-right-collapse" : "ti-layout-sidebar-right"}`} aria-hidden />
            <span>Programme</span>
          </button>
        </div>
      </header>

      {/* ── Corps principal ── */}
      <div className={`${styles.body} ${!sidebarOpen ? styles.bodyFull : ""}`}>

        {/* ── Zone lecteur ── */}
        <main className={styles.player}>

          {/* En-tête d'unité */}
          <div className={styles.stageHeader}>
            <span className={styles.typeBadge}>
              <i className={`ti ${unitMeta(activeCourseUnit.type).icon}`} aria-hidden /> {unitMeta(activeCourseUnit.type).label}
            </span>
            {completed.has(activeCourseUnit.id) && (
              <span className={styles.typeBadge} style={{ color: "var(--success)", background: "var(--success-light)" }}>
                <i className="ti ti-circle-check" aria-hidden /> Terminé
              </span>
            )}
            <h1 className={styles.stageTitle}>{activeCourseUnit.title}</h1>
            <p className={styles.stageMeta}>{activeCourseUnit.sectionTitle} · {fmt(activeCourseUnit.duration)}</p>
          </div>

          {/* Zone de contenu (verrouillée si non achetée) */}
          {!isAccessible(activeCourseUnit) ? (
            <div className={styles.stage}>
              <div className={styles.lockedStage} aria-label="Contenu verrouillé">
                <div className={styles.lockedBg} style={{ background: course.thumbGradient }} />
                <div className={styles.lockedInner}>
                  <i className="ti ti-lock" style={{ fontSize: "2.4rem" }} aria-hidden />
                  <p>Cette unité fait partie du contenu payant. Achetez-la à l&apos;unité, par module, ou le cours complet pour y accéder.</p>
                  <Link href={`/cours/${course.slug}`} className={styles.certBtn}>
                    <i className="ti ti-shopping-cart" aria-hidden /> Débloquer cette unité
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.stage}>{renderStage()}</div>
          )}

          {/* Barre d'action : précédent / terminé / suivant */}
          <div className={styles.actionBar}>
            <button
              className={styles.actionBtn}
              onClick={() => goToCourseUnit(activeIdx - 1)}
              disabled={activeIdx === 0}
            >
              <i className="ti ti-arrow-left" aria-hidden /> Précédent
            </button>
            <div className={styles.actionSpacer} />
            {isAccessible(activeCourseUnit) && (
              completed.has(activeCourseUnit.id) ? (
                <span className={`${styles.actionBtn} ${styles.actionBtnDone}`}>
                  <i className="ti ti-circle-check" aria-hidden /> Terminé
                </span>
              ) : (
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={markDone}>
                  <i className="ti ti-circle-check" aria-hidden /> Marquer comme terminé
                </button>
              )
            )}
            <button
              className={styles.actionBtn}
              onClick={() => goToCourseUnit(activeIdx + 1)}
              disabled={activeIdx >= totalCourseUnits - 1}
            >
              Suivant <i className="ti ti-arrow-right" aria-hidden />
            </button>
          </div>

          {/* ── Recommandations entre unités (prérequis / débouchés) ── */}
          {(() => {
            const titleById = new Map(allCourseUnits.map((u) => [u.id, u.title]));
            const resolve = (ids?: (string | null)[] | null) =>
              (ids || []).map((id) => (id ? titleById.get(id) : undefined)).filter(Boolean) as string[];
            const prereqs = resolve(activeCourseUnit.prerequisites);
            const outcomes = resolve(activeCourseUnit.outcomes);
            if (prereqs.length === 0 && outcomes.length === 0) return null;
            return (
              <div className={styles.recoBox}>
                {prereqs.length > 0 && (
                  <p className={styles.recoLine}>
                    <i className="ti ti-arrow-back-up" aria-hidden style={{ color: "var(--orange)" }} />
                    <span><strong>Pour mieux comprendre, suivez d&apos;abord :</strong> {prereqs.join(", ")} <em style={{ color: "var(--text-muted)" }}>(recommandé, non obligatoire)</em></span>
                  </p>
                )}
                {outcomes.length > 0 && (
                  <p className={styles.recoLine}>
                    <i className="ti ti-arrow-up-right" aria-hidden style={{ color: "var(--success)" }} />
                    <span><strong>Ce contenu vous prépare à :</strong> {outcomes.join(", ")}</span>
                  </p>
                )}
              </div>
            );
          })()}

          {/* ── Panneau inférieur (notes / ressources / forum) ── */}
          <div className={styles.bottomPanel}>
            <div className={styles.panelTabs} role="tablist">
              {(["notes", "ressources", "forum"] as PanelTab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={panelTab === t}
                  className={`${styles.panelTab} ${panelTab === t ? styles.panelTabActive : ""}`}
                  onClick={() => setPanelTab(t)}
                >
                  <i className={`ti ${t === "notes" ? "ti-notes" : t === "ressources" ? "ti-paperclip" : "ti-message-circle"}`} aria-hidden />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.panelContent}>
              {panelTab === "notes"      && <NotesPanel courseUnitTitle={activeCourseUnit.title} />}
              {panelTab === "ressources" && <RessourcesPanel courseUnit={activeCourseUnit} />}
              {panelTab === "forum"      && <ForumPanel />}
            </div>
          </div>
        </main>

        {/* ── Sidebar programme ── */}
        {sidebarOpen && (
          <aside className={styles.sidebar} aria-label="Programme du cours">
            <div className={styles.sidebarHead}>
              <p className={styles.sidebarTitle}>Programme</p>
              <p className={styles.sidebarMeta}>{completedCount}/{totalCourseUnits} terminés</p>
            </div>

            {/* Progression globale */}
            <div className={styles.sidebarProgress}>
              <div className={styles.sidebarProgressFill} style={{ width: `${overallPct}%` }} />
            </div>

            <div className={styles.sidebarBody}>
              {sections.map((section) => (
                <div key={section.id} className={styles.sectionGroup}>
                  <p className={styles.sectionLabel}>
                    {section.order}. {section.title}
                  </p>
                  {section.flatCourseUnits.map((ch) => {
                    const globalIdx = allCourseUnits.findIndex((c) => c.id === ch.id);
                    return (
                      <CourseUnitItem
                        key={ch.id}
                        courseUnit={ch}
                        index={globalIdx}
                        isActive={globalIdx === activeIdx}
                        isCompleted={completed.has(ch.id)}
                        isLocked={!isAccessible(ch)}
                        progress={progress[ch.id] ?? 0}
                        onClick={() => goToCourseUnit(globalIdx)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Certificat CTA si tout est terminé */}
            {completedCount === totalCourseUnits && (
              <div className={styles.certCTA}>
                <i className="ti ti-certificate" aria-hidden />
                <p>Félicitations ! Cours terminé.</p>
                <Link href="/dashboard/certificats" className={styles.certBtn}>
                  Voir mon certificat →
                </Link>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
