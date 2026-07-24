"use client";

import React, { useEffect, useState } from "react";
import { coursesApi } from "@/lib/api";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./page.module.css";

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await coursesApi.getAllCourses();
      setCourses(data);
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger le catalogue.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleValidateCourse(courseId: string, status: string, reason?: string) {
    try {
      await coursesApi.validateCourse(courseId, status, reason);
      showToast(status === "PUBLISHED" ? "Cours publié avec succès !" : "Cours rejeté avec succès.");
      setRejectingCourseId(null);
      setRejectReason("");
      loadCourses();
    } catch {
      showToast("Erreur lors du changement de statut.", "error");
    }
  }

  const isSuperadmin = user?.role === "superadmin";
  const filteredCourses = courses.filter((c) => {
    if (c.validationStatus === "DRAFT") return false;
    // Un admin ne voit que les demandes qui lui sont assignées ; le superadmin voit tout.
    if (!isSuperadmin && user && c.assignedAdminId && c.assignedAdminId !== user.id) return false;
    const q = search.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.instructor && c.instructor.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
          <i className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} />
          {toast.msg}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gouvernance du Catalogue</h1>
          <p className={styles.subtitle}>Supervisez les cours créés par vos formateurs et validez leur publication.</p>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className="ti ti-search" />
          <input
            type="text"
            placeholder="Rechercher par titre, formateur ou catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={loadCourses} className={styles.btnRefresh} title="Actualiser le catalogue">
          <i className="ti ti-refresh" />
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement du catalogue...</div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Cours</th>
                  <th scope="col">Catégorie</th>
                  <th scope="col">Auteur</th>
                  <th scope="col">Prix Complet</th>
                  <th scope="col">Étudiants</th>
                  <th scope="col">Statut</th>
                  <th scope="col" style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.tableEmpty}>
                      Aucun cours trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <React.Fragment key={c.id}>
                      <tr>
                        <td>
                        <div className={styles.courseCell}>
                          <div className={styles.emoji} aria-hidden>{c.emoji || "📚"}</div>
                          <div>
                            <p className={styles.courseTitle}>{c.title}</p>
                            <small className={styles.courseCourseUnits}>{c.courseUnitCount || 0} courseUnits</small>
                          </div>
                        </div>
                      </td>
                      <td>{c.category}</td>
                      <td>{c.instructor}</td>
                      <td>{c.price ? c.price.toLocaleString("fr-FR") + " XAF" : "Gratuit"}</td>
                      <td>{c.studentCount || 0}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${c.validationStatus === 'PUBLISHED' ? styles.statusPub : c.validationStatus === 'REJECTED' ? styles.statusDraft : styles.statusDraft}`}>
                          {c.validationStatus === "PUBLISHED" ? "Publié" : c.validationStatus === "REJECTED" ? "Rejeté" : "En attente"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {c.validationStatus !== "PUBLISHED" && (
                          <button
                            onClick={() => handleValidateCourse(c.id, "PUBLISHED")}
                            className={`${styles.btnAction} ${styles.btnPublish}`}
                            title="Publier ce cours"
                          >
                            <i className="ti ti-check" />
                            <span>Publier</span>
                          </button>
                        )}
                        {c.validationStatus !== "REJECTED" && (
                          <button
                            onClick={() => setRejectingCourseId(c.id)}
                            className={`${styles.btnAction} ${styles.btnUnpublish}`}
                            style={{ marginLeft: "0.5rem" }}
                            title="Rejeter ce cours"
                          >
                            <i className="ti ti-x" />
                            <span>Rejeter</span>
                          </button>
                        )}
                      </td>
                    </tr>
                    {rejectingCourseId === c.id && (
                      <tr key={`reject-${c.id}`}>
                        <td colSpan={7}>
                          <div style={{ display: "flex", gap: "1rem", padding: "1rem", backgroundColor: "#f9f9f9" }}>
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Motif du rejet..."
                              style={{ flex: 1, padding: "0.5rem" }}
                            />
                            <button onClick={() => handleValidateCourse(c.id, "REJECTED", rejectReason)}>Confirmer le rejet</button>
                            <button onClick={() => setRejectingCourseId(null)}>Annuler</button>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
