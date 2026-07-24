"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, mediaSrc } from "@/lib/api";
import styles from "../studio.module.css";

const TYPE_META: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  pdf:   { icon: "ti-file-text", color: "var(--pink)",    bg: "var(--pink-light)",    label: "PDF" },
  image: { icon: "ti-photo",     color: "var(--success)", bg: "var(--success-light)", label: "Image" },
  ressource: { icon: "ti-paperclip", color: "var(--primary)", bg: "var(--primary-light)", label: "Ressource" },
};
const meta = (t: string) => TYPE_META[t] || TYPE_META.ressource;

interface ResRow { id: string; name: string; type: string; courseTitle: string; url: string }

export default function StudioRessourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<ResRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Ressources — Studio EduFlex Pro"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const all = await coursesApi.getAllCourses();
        const mine = all.filter((c: any) => c.instructor === user.name);
        const rows: ResRow[] = [];
        for (const c of mine) {
          for (const s of c.sections || []) {
            for (const u of s.courseUnits || []) {
              for (const r of u.resources || []) {
                if (r.type === "video") continue; // les vidéos ont leur propre page
                rows.push({ id: `${u.id}-${r.name}`, name: r.name || r.type, type: r.type, courseTitle: c.title, url: r.url });
              }
            }
          }
        }
        setResources(rows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ressources</h1>
          <p className={styles.sub}>Fichiers joints à vos unités : PDF, images, documents.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Ressources</span>
          <p className={styles.kpiVal}>{resources.length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>PDF</span>
          <p className={styles.kpiVal}>{resources.filter((r) => r.type === "pdf").length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Images</span>
          <p className={styles.kpiVal}>{resources.filter((r) => r.type === "image").length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Cours concernés</span>
          <p className={styles.kpiVal}>{new Set(resources.map((r) => r.courseTitle)).size}</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          {loading ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>Chargement…</p>
          ) : resources.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>Aucune ressource. Ajoutez une unité PDF/image à un cours.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Cours</th>
                  <th className={styles.tCenter}>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => {
                  const m = meta(r.type);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className={styles.cellCourse}>
                          <span className={styles.cellThumb} style={{ background: m.bg, color: m.color }} aria-hidden="true">
                            <i className={`ti ${m.icon}`} />
                          </span>
                          <span className={styles.cellTitle}>{r.name}</span>
                        </div>
                      </td>
                      <td className={styles.tMuted}>{r.courseTitle}</td>
                      <td className={styles.tCenter}><span className={`${styles.badge} ${styles.badgePurple}`}>{m.label}</span></td>
                      <td className={styles.tRight}>
                        {r.url ? (
                          <a className={styles.btnOutline} href={mediaSrc(r.url)} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${r.name}`}>
                            <i className="ti ti-external-link" aria-hidden="true" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
