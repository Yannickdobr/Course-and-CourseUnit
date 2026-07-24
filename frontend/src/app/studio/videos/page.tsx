"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, mediaSrc } from "@/lib/api";
import styles from "../studio.module.css";

const fmtDur = (min: number) => `${min} min`;

interface VideoRow { id: string; title: string; courseTitle: string; duration: number; url: string }

export default function StudioVideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Mes vidéos — Studio EduFlex Pro"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const all = await coursesApi.getAllCourses();
        const mine = all.filter((c: any) => c.instructor === user.name);
        const rows: VideoRow[] = [];
        for (const c of mine) {
          for (const s of c.sections || []) {
            for (const u of s.courseUnits || []) {
              const vid = (u.resources || []).find((r: any) => r.type === "video");
              if (u.type === "video" || vid) {
                rows.push({ id: u.id, title: u.title, courseTitle: c.title, duration: u.duration || 0, url: vid?.url || "" });
              }
            }
          }
        }
        setVideos(rows);
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
          <h1 className={styles.title}>Mes vidéos</h1>
          <p className={styles.sub}>Les vidéos rattachées aux unités de vos cours.</p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Vidéos</span>
          <p className={styles.kpiVal}>{videos.length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Avec fichier</span>
          <p className={styles.kpiVal}>{videos.filter((v) => v.url).length}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Durée totale</span>
          <p className={styles.kpiVal}>{fmtDur(videos.reduce((a, v) => a + v.duration, 0))}</p>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Cours concernés</span>
          <p className={styles.kpiVal}>{new Set(videos.map((v) => v.courseTitle)).size}</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          {loading ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>Chargement…</p>
          ) : videos.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>Aucune vidéo. Ajoutez une unité de type « Vidéo » à un cours et téléversez le fichier.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vidéo</th>
                  <th>Cours</th>
                  <th className={styles.tCenter}>Durée</th>
                  <th className={styles.tCenter}>Fichier</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
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
                    <td className={styles.tCenter}>
                      <span className={`${styles.badge} ${v.url ? styles.badgeGreen : styles.badgeGray}`}>{v.url ? "Présent" : "Manquant"}</span>
                    </td>
                    <td className={styles.tRight}>
                      {v.url ? (
                        <a className={styles.btnOutline} href={mediaSrc(v.url)} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${v.title}`}>
                          <i className="ti ti-external-link" aria-hidden="true" />
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
