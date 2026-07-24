"use client";

import { useState } from "react";
import styles from "../studio.module.css";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const fmtNum = (n: number) => n.toLocaleString("fr-FR");

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  pdf:   { icon: "ti-file-text", color: "var(--pink)",    bg: "var(--pink-light)" },
  zip:   { icon: "ti-file-zip",      color: "var(--orange)",  bg: "var(--orange-light)" },
  lien:  { icon: "ti-link",          color: "var(--primary)", bg: "var(--primary-light)" },
  image: { icon: "ti-photo",         color: "var(--success)", bg: "var(--success-light)" },
};

export default function StudioRessourcesPage() {
  const [resources] = useState<any[]>([]);

  const totalDownloads = resources.reduce((a, r) => a + r.downloads, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ressources</h1>
          <p className={styles.sub}>Fichiers téléchargeables joints à vos courseUnits : slides, code source, exercices…</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Ressources</span>
          <p className={styles.kpiVal}>{resources.length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Téléchargements</span>
          <p className={styles.kpiVal}>{fmtNum(totalDownloads)}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Fichiers PDF</span>
          <p className={styles.kpiVal}>{resources.filter((r) => r.type === "pdf").length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Liens externes</span>
          <p className={styles.kpiVal}>{resources.filter((r) => r.type === "lien").length}</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          {resources.length === 0 ? (
            <p style={{ color: "var(--fg-muted)", padding: "2rem", textAlign: "center" }}>Aucune ressource ajoutée pour le moment.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Cours</th>
                  <th className={styles.tCenter}>Taille</th>
                  <th className={styles.tCenter}>Téléchargements</th>
                  <th>Ajoutée le</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => {
                  const m = TYPE_META[r.type];
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
                      <td className={`${styles.tCenter} ${styles.tMuted}`}>{r.size}</td>
                      <td className={`${styles.tCenter} ${styles.tStrong}`}>{fmtNum(r.downloads)}</td>
                      <td className={styles.tMuted}>{fmtDate(r.addedAt)}</td>
                      <td className={styles.tRight}>
                        <button className={styles.btnOutline} aria-label={`Options pour ${r.name}`}>
                          <i className="ti ti-dots" aria-hidden="true" />
                        </button>
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
