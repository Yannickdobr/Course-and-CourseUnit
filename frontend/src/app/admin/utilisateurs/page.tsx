"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./page.module.css";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const isSuper = me?.role === "superadmin";
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger les utilisateurs.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await authApi.updateUserRole(userId, newRole, me?.id);
      showToast(`Rôle mis à jour avec succès : ${newRole}`);
      loadUsers();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur lors de la modification du rôle.", "error");
    }
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${name} ?`)) return;
    try {
      await authApi.deleteUser(userId, me?.id);
      showToast("Utilisateur supprimé avec succès.");
      loadUsers();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur lors de la suppression.", "error");
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
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
          <h1 className={styles.title}>Gestion des utilisateurs</h1>
          <p className={styles.subtitle}>Gérez les comptes, changez les rôles ou révoquez des accès.</p>
          {!isSuper && (
            <p className={styles.subtitle} style={{ color: "var(--orange)", marginTop: 4 }}>
              <i className="ti ti-info-circle" /> Seul le super-administrateur peut créer, modifier ou supprimer d&apos;autres administrateurs.
            </p>
          )}
        </div>
      </div>

      {/* Barre d'outils */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className="ti ti-search" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={loadUsers} className={styles.btnRefresh} title="Actualiser la liste">
          <i className="ti ti-refresh" />
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement des comptes...</div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Utilisateur</th>
                  <th scope="col">Email</th>
                  <th scope="col">Rôle</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.tableEmpty}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {u.name ? u.name.substring(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className={styles.userName}>{u.name || "—"}</p>
                            <small className={styles.userId}>ID: {u.id.substring(0, 8)}...</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {u.role === "superadmin" ? (
                          <span className={`${styles.roleSelect} ${styles.roleAdmin}`} style={{ display: "inline-block", fontWeight: 600 }}>
                            Super Admin
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.role === "admin" && !isSuper}
                            className={`${styles.roleSelect} ${u.role === "admin" ? styles.roleAdmin : u.role === "formateur" ? styles.roleTrainer : ""}`}
                            aria-label={`Rôle pour ${u.name}`}
                          >
                            <option value="apprenant">Apprenant</option>
                            <option value="formateur">Formateur</option>
                            <option value="admin" disabled={!isSuper}>Administrateur</option>
                          </select>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {u.role === "superadmin" ? (
                          <span title="Compte protégé" style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            <i className="ti ti-shield-lock" /> Protégé
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className={styles.btnDelete}
                            disabled={u.role === "admin" && !isSuper}
                            style={u.role === "admin" && !isSuper ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                            aria-label={`Supprimer ${u.name}`}
                          >
                            <i className="ti ti-trash" />
                          </button>
                        )}
                      </td>
                    </tr>
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
