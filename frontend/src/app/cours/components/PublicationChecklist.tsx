import { DraftCourse } from "@/types/studio";
import styles from "./PublicationChecklist.module.css";

interface CheckItem {
  label: string;
  ok: boolean;
}

function buildChecklist(course: DraftCourse): CheckItem[] {
  const allCourseUnits = course.sections.flatMap((s) => s.courseUnits);
  /* Une unité « prête » = elle a un titre. (Pas de workflow brouillon/publié par unité.) */
  const readyCourseUnits = allCourseUnits.filter((c) => c.title.trim().length > 0);

  return [
    { label: "Titre renseigné (min. 10 caractères)", ok: course.title.trim().length >= 10 },
    { label: "Description renseignée (min. 50 caractères)", ok: course.description.trim().length >= 50 },
    { label: "Catégorie et niveau définis", ok: !!course.category && !!course.level },
    { label: "Au moins 3 unités avec un titre", ok: readyCourseUnits.length >= 3 },
    { label: "Tous les courseUnits ont un titre", ok: allCourseUnits.length > 0 && allCourseUnits.every((c) => c.title.trim().length > 0) },
    { label: "Prix du cours complet défini", ok: course.priceFull > 0 },
    { label: "Miniature du cours uploadée", ok: !!course.thumbUrl },
    { label: "Vidéo d'aperçu (optionnel)", ok: !!course.previewVideoUrl },
  ];
}

export default function PublicationChecklist({ course }: { course: DraftCourse }) {
  const items = buildChecklist(course);
  const required = items.slice(0, 7); // les 7 premiers sont obligatoires
  const optional = items.slice(7);
  const allOk = required.every((i) => i.ok);

  return (
    <div className={styles.wrap}>
      <div className={styles.score}>
        <span className={styles.scoreNum}>
          {required.filter((i) => i.ok).length}/{required.length}
        </span>
        <span className={styles.scoreLabel}>critères obligatoires</span>
      </div>

      <ul className={styles.list} aria-label="Checklist de publication">
        {required.map((item) => (
          <li key={item.label} className={styles.item}>
            <i
              className={`ti ${item.ok ? "ti-check" : "ti-alert-triangle"} ${item.ok ? styles.ok : styles.warn}`}
              aria-hidden="true"
            />
            <span className={item.ok ? styles.textOk : styles.textWarn}>{item.label}</span>
          </li>
        ))}
        {optional.map((item) => (
          <li key={item.label} className={`${styles.item} ${styles.optional}`}>
            <i
              className={`ti ${item.ok ? "ti-check" : "ti-circle-dashed"} ${item.ok ? styles.ok : styles.muted}`}
              aria-hidden="true"
            />
            <span className={styles.textMuted}>{item.label}</span>
          </li>
        ))}
      </ul>

      {!allOk && (
        <p className={styles.warning}>
          Complétez les éléments manquants avant de soumettre.
        </p>
      )}
    </div>
  );
}