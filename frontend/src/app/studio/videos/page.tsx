"use client";

import { useState } from "react";
import styles from "../studio.module.css";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const fmtDur = (min: number) => `${min} min`;
const fmtViews = (n: number) => n.toLocaleString("fr-FR");

const STATUS: Record<string, { label: string; cls: string }> = {
  publie:    { label: "Publié",    cls: "badgeGreen" },
  encodage:  { label: "Encodage…", cls: "badgeAmber" },
  brouillon: { label: "Brouillon", cls: "badgeGray" },
};

export default function StudioVideosPage() {
  const [videos] = useState<any[]>([]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mes vidéos</h1>
          <p className={styles.sub}>Gérez les vidéos de vos courseUnits. Formats MP4/WebM, max 2 Go par fichier.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Vidéos</span>
          <p className={styles.kpiVal}>{videos.length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Publiées</span>
          <p className={styles.kpiVal}>{videos.filter((v) => v.status === "publie").length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>En encodage</span>
          <p className={styles.kpiVal}>{videos.filter((v) => v.status === "encodage").length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Stockage utilisé</span>
          <p className={styles.kpiVal}>0 Go</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          {videos.length === 0 ? (
            <p style={{ color: "var(--fg-muted)", padding: "2rem", textAlign: "center" }}>Aucune vidéo téléversée pour le moment.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vidéo</th>
                  <th>Cours</th>
                  <th className={styles.tCenter}>Durée</th>
                  <th className={styles.tCenter}>Taille</th>
                  <th className={styles.tCenter}>Vues</th>
                  <th className={styles.tCenter}>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => {
                  const st = STATUS[v.status];
                  return (
                    <tr key={v.id}>
                      <td>
                        <div className={styles.cellCourse}>
                          <span className={styles.cellThumb} style={{ background: "var(--primary-light)", color: "var(--primary)" }} aria-hidden="true">
                            <i className="ti ti-player-play" />
                          </span>
                          <span className={styles.cellTitle}>{v.title}</span>
                        </div>
                      </td>
                      <td className={styles.tMuted}>{v.courseTitle}</td>
                      <td className={styles.tCenter}>{fmtDur(v.duration)}</td>
                      <td className={`${styles.tCenter} ${styles.tMuted}`}>{v.size}</td>
                      <td className={styles.tCenter}>{v.status === "publie" ? fmtViews(v.views) : "—"}</td>
                      <td className={styles.tCenter}><span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span></td>
                      <td className={styles.tRight}>
                        <button className={styles.btnOutline} aria-label={`Options pour ${v.title}`}>
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
