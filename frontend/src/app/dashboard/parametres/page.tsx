"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./page.module.css";

/* ─── types locaux ─── */
type Tab = "profil" | "securite" | "notifications" | "danger";

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  desc?: string;
}

/* ─── Toggle switch ─── */
function Toggle({ id, checked, onChange, label, desc }: ToggleProps) {
  return (
    <label htmlFor={id} className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        {desc && <span className={styles.toggleDesc}>{desc}</span>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
        type="button"
      >
        <span className={styles.toggleThumb} />
      </button>
    </label>
  );
}

/* ─── Champ de formulaire ─── */
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}
function Field({ label, id, type = "text", value, onChange, placeholder, hint, disabled }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${disabled ? styles.inputDisabled : ""}`}
      />
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

/* ─── Toast notification ─── */
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`${styles.toast} ${type === "error" ? styles.toastError : ""}`}>
      <i className={`ti ${type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} aria-hidden />
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
export default function ParaametresPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("profil");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* ── Profil ── */
  const [name,     setName]     = useState(user?.name ?? "");
  const [email,    setEmail]    = useState(user?.email ?? "");
  const [bio,      setBio]      = useState("Passionné par l'apprentissage et le développement professionnel sur EduFlex Pro.");
  const [country,  setCountry]  = useState("Sénégal");
  const [language, setLanguage] = useState("Français");
 
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  /* ── Sécurité ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwds,   setShowPwds]   = useState(false);
  const [twoFactor,  setTwoFactor]  = useState(false);

  /* ── Notifications ── */
  const [notifNewCourse,   setNotifNewCourse]   = useState(true);
  const [notifUpdate,      setNotifUpdate]       = useState(true);
  const [notifPromo,       setNotifPromo]        = useState(false);
  const [notifCertif,      setNotifCertif]       = useState(true);
  const [notifNewsletter,  setNotifNewsletter]   = useState(false);
  const [notifPush,        setNotifPush]         = useState(true);

  /* ── Helpers ── */
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function saveProfile() {
    if (!name.trim() || !email.trim()) {
      showToast("Le nom et l'email sont obligatoires.", "error"); return;
    }
    showToast("Profil mis à jour avec succès !");
  }

  function savePassword() {
    if (!currentPwd) { showToast("Saisissez votre mot de passe actuel.", "error"); return; }
    if (newPwd.length < 8) { showToast("Le nouveau mot de passe doit avoir 8 caractères minimum.", "error"); return; }
    if (newPwd !== confirmPwd) { showToast("Les mots de passe ne correspondent pas.", "error"); return; }
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    showToast("Mot de passe modifié avec succès !");
  }

  function saveNotifications() {
    showToast("Préférences de notification enregistrées !");
  }

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: "profil",        icon: "ti-user",         label: "Profil" },
    { key: "securite",      icon: "ti-lock",         label: "Sécurité" },
    { key: "notifications", icon: "ti-bell",         label: "Notifications" },
    { key: "danger",        icon: "ti-alert-triangle", label: "Zone de danger" },
  ];

  if (!user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* En-tête */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Paramètres</h1>
          <p className={styles.sub}>Gérez votre profil, votre sécurité et vos préférences.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── Sidebar de navigation ── */}
        <nav className={styles.tabNav} aria-label="Sections des paramètres">
          {TABS.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`${styles.tabNavItem} ${tab === key ? styles.tabNavActive : ""} ${key === "danger" ? styles.tabNavDanger : ""}`}
              aria-current={tab === key ? "page" : undefined}
            >
              <i className={`ti ${icon}`} aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Contenu ── */}
        <div className={styles.content}>

          {/* ════ PROFIL ════ */}
          {tab === "profil" && (
            <section className={styles.section} aria-labelledby="profil-heading">
              <div className={styles.sectionHead}>
                <h2 id="profil-heading" className={styles.sectionTitle}>Informations personnelles</h2>
                <p className={styles.sectionSub}>Ces informations sont visibles sur votre profil apprenant.</p>
              </div>

              {/* Avatar */}
              <div className={styles.avatarRow}>
                <div className={styles.avatarCircle} aria-label="Avatar actuel">
                  {user.initials}
                </div>
                <div>
                  <p className={styles.avatarName}>{user.name}</p>
                  <p className={styles.avatarMeta}>Membre de la plateforme EduFlex Pro</p>
                  <button className={styles.btnGhost} type="button">
                    <i className="ti ti-upload" aria-hidden /> Changer la photo
                  </button>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <Field label="Nom complet"  id="name"     value={name}     onChange={setName}     placeholder="Votre nom" />
                <Field label="Email"         id="email"    value={email}    onChange={setEmail}    placeholder="votre@email.com" type="email"
                  hint="Un email de confirmation vous sera envoyé si vous changez votre adresse." />
                <Field label="Pays"           id="country"  value={country}  onChange={setCountry}  placeholder="Votre pays" />
                <Field label="Langue"         id="language" value={language} onChange={setLanguage} placeholder="Français" />
              </div>

              <div className={styles.fieldFull}>
                <label htmlFor="bio" className={styles.fieldLabel}>Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={styles.textarea}
                  placeholder="Parlez-nous de vous…"
                  rows={3}
                  maxLength={300}
                />
                <p className={styles.fieldHint}>{bio.length}/300 caractères</p>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnPrimary} type="button" onClick={saveProfile}>
                  <i className="ti ti-device-floppy" aria-hidden /> Enregistrer
                </button>
              </div>
            </section>
          )}

          {/* ════ SÉCURITÉ ════ */}
          {tab === "securite" && (
            <section className={styles.section} aria-labelledby="securite-heading">
              <div className={styles.sectionHead}>
                <h2 id="securite-heading" className={styles.sectionTitle}>Sécurité du compte</h2>
                <p className={styles.sectionSub}>Gérez votre mot de passe et les paramètres d&apos;accès.</p>
              </div>

              {/* Changer le mot de passe */}
              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Changer le mot de passe</h3>
                <div className={styles.fieldsGrid}>
                  <Field
                    label="Mot de passe actuel"
                    id="current-pwd"
                    type={showPwds ? "text" : "password"}
                    value={currentPwd}
                    onChange={setCurrentPwd}
                    placeholder="••••••••"
                  />
                  <div /> {/* spacer */}
                  <Field
                    label="Nouveau mot de passe"
                    id="new-pwd"
                    type={showPwds ? "text" : "password"}
                    value={newPwd}
                    onChange={setNewPwd}
                    placeholder="8 caractères minimum"
                    hint="Utilisez au moins une majuscule, un chiffre et un symbole."
                  />
                  <Field
                    label="Confirmer le nouveau mot de passe"
                    id="confirm-pwd"
                    type={showPwds ? "text" : "password"}
                    value={confirmPwd}
                    onChange={setConfirmPwd}
                    placeholder="••••••••"
                  />
                </div>

                {/* Indicateur de force */}
                {newPwd.length > 0 && (
                  <div className={styles.strengthRow}>
                    <div className={styles.strengthBars}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`${styles.strengthBar} ${
                            newPwd.length >= i * 3
                              ? newPwd.length >= 12 ? styles.strengthStrong
                              : newPwd.length >= 6  ? styles.strengthMedium
                              : styles.strengthWeak
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className={styles.strengthLabel}>
                      {newPwd.length < 6 ? "Faible" : newPwd.length < 10 ? "Moyen" : newPwd.length < 14 ? "Fort" : "Très fort"}
                    </span>
                  </div>
                )}

                <label className={styles.showPwdLabel}>
                  <input
                    type="checkbox"
                    checked={showPwds}
                    onChange={() => setShowPwds((v) => !v)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Afficher les mots de passe
                </label>

                <div className={styles.actions}>
                  <button className={styles.btnPrimary} type="button" onClick={savePassword}>
                    <i className="ti ti-lock" aria-hidden /> Mettre à jour
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Double authentification (2FA)</h3>
                <Toggle
                  id="2fa"
                  checked={twoFactor}
                  onChange={() => setTwoFactor((v) => !v)}
                  label="Activer la 2FA par email"
                  desc="Un code vous sera envoyé à chaque connexion pour renforcer la sécurité de votre compte."
                />
                {twoFactor && (
                  <p className={styles.infoBox}>
                    <i className="ti ti-info-circle" aria-hidden /> La 2FA sera activée à votre prochaine connexion. Un code de vérification vous sera envoyé à <strong>{user.email}</strong>.
                  </p>
                )}
              </div>

              {/* Sessions */}
              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Sessions actives</h3>
                <div className={styles.sessionList}>
                  {[
                    { device: "Chrome · macOS", location: "Yaoundé, CM", current: true,  time: "Maintenant" },
                    { device: "Safari · iPhone", location: "Douala, CM",  current: false, time: "Il y a 2 jours" },
                  ].map((s) => (
                    <div key={s.device} className={styles.sessionRow}>
                      <div className={styles.sessionIcon} aria-hidden>
                        <i className={`ti ${s.device.includes("iPhone") ? "ti-device-mobile" : "ti-device-laptop"}`} />
                      </div>
                      <div className={styles.sessionInfo}>
                        <p className={styles.sessionDevice}>{s.device}</p>
                        <p className={styles.sessionMeta}>{s.location} · {s.time}</p>
                      </div>
                      {s.current
                        ? <span className={styles.sessionCurrent}>Session actuelle</span>
                        : <button className={styles.btnDanger} type="button">Révoquer</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ════ NOTIFICATIONS ════ */}
          {tab === "notifications" && (
            <section className={styles.section} aria-labelledby="notif-heading">
              <div className={styles.sectionHead}>
                <h2 id="notif-heading" className={styles.sectionTitle}>Préférences de notification</h2>
                <p className={styles.sectionSub}>Choisissez les communications que vous souhaitez recevoir.</p>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Apprentissage</h3>
                <div className={styles.toggleList}>
                  <Toggle id="notif-new-course"  checked={notifNewCourse}  onChange={() => setNotifNewCourse(v => !v)}
                    label="Nouveaux cours" desc="Alertes quand un formateur que vous suivez publie un nouveau cours." />
                  <Toggle id="notif-update"      checked={notifUpdate}     onChange={() => setNotifUpdate(v => !v)}
                    label="Mises à jour de cours" desc="Notifications quand un cours acheté est mis à jour par son formateur." />
                  <Toggle id="notif-certif"      checked={notifCertif}     onChange={() => setNotifCertif(v => !v)}
                    label="Certificats" desc="Rappels pour finaliser un cours et obtenir votre certificat." />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Offres & communication</h3>
                <div className={styles.toggleList}>
                  <Toggle id="notif-promo"       checked={notifPromo}      onChange={() => setNotifPromo(v => !v)}
                    label="Promotions & réductions" desc="Codes promo, offres limitées et forfaits avantageux." />
                  <Toggle id="notif-newsletter"  checked={notifNewsletter} onChange={() => setNotifNewsletter(v => !v)}
                    label="Newsletter" desc="Conseils d'apprentissage et actualités EduFlex Pro (max 1 par semaine)." />
                </div>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>Canaux</h3>
                <div className={styles.toggleList}>
                  <Toggle id="notif-push" checked={notifPush} onChange={() => setNotifPush(v => !v)}
                    label="Notifications push" desc="Notifications dans le navigateur ou l'application mobile." />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnPrimary} type="button" onClick={saveNotifications}>
                  <i className="ti ti-device-floppy" aria-hidden /> Enregistrer
                </button>
              </div>
            </section>
          )}

          {/* ════ DANGER ZONE ════ */}
          {tab === "danger" && (
            <section className={styles.section} aria-labelledby="danger-heading">
              <div className={styles.sectionHead}>
                <h2 id="danger-heading" className={`${styles.sectionTitle} ${styles.dangerTitle}`}>
                  <i className="ti ti-alert-triangle" aria-hidden /> Zone de danger
                </h2>
                <p className={styles.sectionSub}>Ces actions sont irréversibles. Procédez avec prudence.</p>
              </div>

              <div className={styles.dangerList}>
                {/* Export des données */}
                <div className={styles.dangerRow}>
                  <div className={styles.dangerInfo}>
                    <h3 className={styles.dangerRowTitle}>Exporter mes données</h3>
                    <p className={styles.dangerRowDesc}>
                      Téléchargez une archive de toutes vos données personnelles, cours achetés et certificats (format ZIP).
                    </p>
                  </div>
                  <button className={styles.btnOutline} type="button">
                    <i className="ti ti-download" aria-hidden /> Exporter
                  </button>
                </div>

                {/* Désactiver le compte */}
                <div className={styles.dangerRow}>
                  <div className={styles.dangerInfo}>
                    <h3 className={styles.dangerRowTitle}>Désactiver temporairement le compte</h3>
                    <p className={styles.dangerRowDesc}>
                      Votre profil sera masqué et vous ne recevrez plus de notifications. Vous pourrez réactiver votre compte à tout moment.
                    </p>
                  </div>
                  <button className={styles.btnWarning} type="button">
                    <i className="ti ti-eye-off" aria-hidden /> Désactiver
                  </button>
                </div>

                {/* Supprimer le compte */}
                <div className={`${styles.dangerRow} ${styles.dangerRowFinal}`}>
                  <div className={styles.dangerInfo}>
                    <h3 className={`${styles.dangerRowTitle} ${styles.dangerRed}`}>Supprimer définitivement le compte</h3>
                    <p className={styles.dangerRowDesc}>
                      Toutes vos données, cours, certificats et historique seront supprimés de façon permanente. Cette action est <strong>irréversible</strong>.
                    </p>
                  </div>
                  <button className={styles.btnDeleteFinal} type="button">
                    <i className="ti ti-trash" aria-hidden /> Supprimer le compte
                  </button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}