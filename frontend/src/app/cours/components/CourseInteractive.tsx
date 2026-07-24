"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CourseDetail, DetailSection, DetailCourseUnit } from "@/types/courseDetail";
import { CartItem } from "@/types/cart";
import { useCart } from "@/app/components/CartProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi, mediaSrc } from "@/lib/api";
import FinancialAidModal from "@/app/components/FinancialAidModal";
import styles from "./CourseInteractive.module.css";

/* ─── helpers ─── */
function fmt(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}
function fmtXAF(n: number) {
  return n.toLocaleString("fr-FR") + " XAF";
}
function stars(n: number) {
  return "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "½" : "");
}

/* Métadonnées d'affichage des types d'unité de cours */
const UNIT_TYPE_META: Record<string, { label: string; icon: string }> = {
  courseUnit:   { label: "CourseUnit",   icon: "ti-book" },
  video:      { label: "Vidéo",      icon: "ti-player-play" },
  module:     { label: "Module",     icon: "ti-folder" },
  paragraphe: { label: "Paragraphe", icon: "ti-align-left" },
  quiz:       { label: "Quiz",       icon: "ti-help" },
  ressource:  { label: "Ressource",  icon: "ti-paperclip" },
};

/* ─── Constructeurs d'articles panier ─── */
function courseCartItem(course: CourseDetail): CartItem {
  const sum = course.sections.flatMap((s) => s.courseUnits).reduce((a, c) => a + c.price, 0);
  return {
    id: `cours:${course.slug}`,
    kind: "cours",
    courseSlug: course.slug,
    courseTitle: course.title,
    label: "Cours complet — " + course.title,
    emoji: course.emoji,
    thumbBg: course.thumbGradient,
    unitPrice: course.price,
    originalPrice: sum > course.price ? sum : undefined,
    courseId: course.id,
    instructor: course.instructor,
  };
}
function courseUnitCartItem(course: CourseDetail, ch: DetailCourseUnit): CartItem {
  return {
    id: `courseUnit:${course.slug}:${ch.id}`,
    kind: "courseUnit",
    courseSlug: course.slug,
    courseTitle: course.title,
    label: ch.title,
    emoji: course.emoji,
    thumbBg: course.thumbGradient,
    unitPrice: ch.price,
    courseId: course.id,
    courseUnitId: ch.id,
    instructor: course.instructor,
  };
}

function moduleCartItem(course: CourseDetail, mod: DetailCourseUnit, price: number): CartItem {
  return {
    id: `module:${course.slug}:${mod.id}`,
    kind: "module",
    courseSlug: course.slug,
    courseTitle: course.title,
    label: "Module — " + mod.title,
    emoji: course.emoji,
    thumbBg: course.thumbGradient,
    unitPrice: price,
    courseId: course.id,
    moduleId: mod.id,
    instructor: course.instructor,
  };
}

/* Bouton compact d'achat d'un module entier (module + ses unités enfants) */
function ModuleAddButton({ course, module: mod }: { course: CourseDetail; module: DetailCourseUnit }) {
  const { add, has } = useCart();
  const { user } = useAuth();
  const children = course.sections
    .flatMap((s) => s.courseUnits)
    .filter((c) => c.parentId === mod.id);
  const price = (mod.price || 0) + children.reduce((a, c) => a + (c.isFree ? 0 : c.price), 0);
  const id = `module:${course.slug}:${mod.id}`;
  const inCart = has(id);
  const canPurchase = user?.role === "apprenant"; // seuls les apprenants achètent

  if (price <= 0) return null;

  if (!canPurchase) {
    if (!user) {
      return (
        <Link href="/connexion" style={{ fontSize: "0.74rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }} title="Connectez-vous pour acheter">
          <i className="ti ti-lock" aria-hidden="true" /> Module {fmtXAF(price)}
        </Link>
      );
    }
    return (
      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }} title="Réservé aux apprenants">
        <i className="ti ti-lock" aria-hidden="true" /> Module {fmtXAF(price)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !inCart && add(moduleCartItem(course, mod, price))}
      disabled={inCart}
      aria-label={inCart ? "Module dans le panier" : `Acheter le module « ${mod.title} »`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 11px", borderRadius: "var(--radius-sm)",
        border: "1.5px solid " + (inCart ? "var(--success)" : "var(--primary)"),
        background: inCart ? "var(--success-light)" : "var(--primary-light)",
        color: inCart ? "var(--success)" : "var(--primary)",
        fontSize: "0.74rem", fontWeight: 700, cursor: inCart ? "default" : "pointer",
        fontFamily: "var(--font-body)", whiteSpace: "nowrap",
      }}
    >
      <i className={`ti ${inCart ? "ti-check" : "ti-folder"}`} aria-hidden="true" />
      {inCart ? "Module ajouté" : `Module ${fmtXAF(price)}`}
    </button>
  );
}

/* Bouton compact d'ajout d'un courseUnit au panier */
function CourseUnitAddButton({ course, courseUnit }: { course: CourseDetail; courseUnit: DetailCourseUnit }) {
  const { add, has } = useCart();
  const { user } = useAuth();
  const id = `courseUnit:${course.slug}:${courseUnit.id}`;
  const inCart = has(id);
  const canPurchase = user?.role === "apprenant"; // seuls les apprenants suivent/achètent

  if (courseUnit.isFree) {
    return <span className={styles.courseUnitPrice} style={{ color: "var(--success)" }}>Gratuit</span>;
  }

  if (!canPurchase) {
    if (!user) {
      return (
        <Link href="/connexion" style={{ fontSize: "0.74rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }} title="Connectez-vous pour acheter">
          <i className="ti ti-lock" aria-hidden="true" /> {fmtXAF(courseUnit.price)}
        </Link>
      );
    }
    /* Formateur / admin : peut consulter mais pas acheter */
    return (
      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }} title="Réservé aux apprenants">
        <i className="ti ti-lock" aria-hidden="true" /> {fmtXAF(courseUnit.price)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !inCart && add(courseUnitCartItem(course, courseUnit))}
      disabled={inCart}
      aria-label={inCart ? "CourseUnit dans le panier" : `Ajouter « ${courseUnit.title} » au panier`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 11px", borderRadius: "var(--radius-sm)",
        border: "1.5px solid " + (inCart ? "var(--success)" : "var(--primary)"),
        background: inCart ? "var(--success-light)" : "transparent",
        color: inCart ? "var(--success)" : "var(--primary)",
        fontSize: "0.74rem", fontWeight: 600, cursor: inCart ? "default" : "pointer",
        fontFamily: "var(--font-body)", whiteSpace: "nowrap",
      }}
    >
      <i className={`ti ${inCart ? "ti-check" : "ti-plus"}`} aria-hidden="true" />
      {inCart ? "Ajouté" : fmtXAF(courseUnit.price)}
    </button>
  );
}

/* ─── Programme accordion ─── */
function SectionAccordion({ section, defaultOpen, course }: { section: DetailSection; defaultOpen: boolean; course: CourseDetail }) {
  const [open, setOpen] = useState(defaultOpen);
  const total = section.courseUnits.reduce((a, c) => a + c.duration, 0);
  /* Résolution des titres de prérequis (même cours) */
  const unitTitle = new Map<string, string>();
  course.sections.forEach((s) => s.courseUnits.forEach((c) => unitTitle.set(c.id, c.title)));

  return (
    <div className={styles.section}>
      <button
        className={styles.sectionHead}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.sectionToggle} aria-hidden>{open ? "▾" : "▸"}</span>
        <span className={styles.sectionTitle}>{section.order}. {section.title}</span>
        <span className={styles.sectionMeta}>
          {section.courseUnits.length} courseUnits · {fmt(total)}
        </span>
      </button>

      {open && (
        <ul className={styles.courseUnitList}>
          {section.courseUnits.map((ch) => {
            const meta = UNIT_TYPE_META[ch.type || "courseUnit"] || UNIT_TYPE_META.courseUnit;
            const isModule = ch.type === "module";
            const prereqTitles = (ch.prerequisites || [])
              .map((pid) => unitTitle.get(pid))
              .filter(Boolean) as string[];
            const outcomeTitles = (ch.outcomes || [])
              .map((oid) => unitTitle.get(oid))
              .filter(Boolean) as string[];
            return (
              <li
                key={ch.id}
                className={styles.courseUnitRow}
                style={ch.parentId ? { paddingLeft: "2.25rem" } : undefined}
              >
                <span className={styles.courseUnitIcon} aria-hidden>
                  <i className={`ti ${isModule ? "ti-folder" : ch.isFree || ch.isPreview ? "ti-player-play" : meta.icon}`} />
                </span>
                <div className={styles.courseUnitInfo}>
                  <span className={styles.courseUnitTitle}>
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.04em", color: "var(--primary)",
                        background: "var(--primary-light)", padding: "1px 7px",
                        borderRadius: "var(--radius-full)", marginRight: 8, verticalAlign: "middle",
                      }}
                    >
                      <i className={`ti ${meta.icon}`} aria-hidden /> {meta.label}
                    </span>
                    {ch.title}
                  </span>
                  {ch.description && (
                    <span className={styles.courseUnitDesc}>{ch.description}</span>
                  )}

                  {(prereqTitles.length > 0 || outcomeTitles.length > 0) && (
                    <div className={styles.unitReco}>
                      {prereqTitles.length > 0 && (
                        <p className={styles.unitRecoLine}>
                          <i className="ti ti-arrow-back-up" style={{ color: "var(--orange)" }} aria-hidden />
                          <span><strong>À suivre d&apos;abord :</strong> {prereqTitles.join(", ")} <em className={styles.unitRecoHint}>(recommandé, non obligatoire)</em></span>
                        </p>
                      )}
                      {outcomeTitles.length > 0 && (
                        <p className={styles.unitRecoLine}>
                          <i className="ti ti-arrow-up-right" style={{ color: "var(--success)" }} aria-hidden />
                          <span><strong>Prépare à :</strong> {outcomeTitles.join(", ")}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {(ch.objectives?.trim() || ch.skills?.trim()) && (
                    <div className={styles.unitMeta}>
                      {ch.objectives?.trim() && (
                        <div className={styles.unitMetaBlock}>
                          <span className={styles.unitMetaLabel}><i className="ti ti-target" aria-hidden /> Objectifs</span>
                          <ul className={styles.unitMetaList}>
                            {ch.objectives.split("\n").map((l) => l.trim()).filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
                          </ul>
                        </div>
                      )}
                      {ch.skills?.trim() && (
                        <div className={styles.unitMetaBlock}>
                          <span className={styles.unitMetaLabel}><i className="ti ti-award" aria-hidden /> Compétences</span>
                          <div className={styles.unitChips}>
                            {ch.skills.split("\n").map((l) => l.trim()).filter(Boolean).map((s, i) => <span key={i} className={styles.unitChip}>{s}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.courseUnitRight}>
                  {(ch.isFree || ch.isPreview) && (
                    <span className={styles.previewBadge}>Aperçu</span>
                  )}
                  <span className={styles.courseUnitDuration}>{fmt(ch.duration)}</span>
                  {isModule
                    ? <ModuleAddButton course={course} module={ch} />
                    : <CourseUnitAddButton course={course} courseUnit={ch} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Reviews ─── */
function ReviewsTab({ course }: { course: CourseDetail }) {
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: course.reviews.filter((r) => Math.round(r.rating) === n).length,
  }));
  const max = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div className={styles.reviews}>
      {/* Rating summary */}
      <div className={styles.ratingBox}>
        <div className={styles.ratingBig}>
          <span className={styles.ratingNum}>{course.rating.toFixed(1)}</span>
          <span className={styles.ratingStars}>{stars(course.rating)}</span>
          <span className={styles.ratingCount}>{course.reviewCount} avis</span>
        </div>
        <div className={styles.ratingBars}>
          {dist.map(({ n, count }) => (
            <div key={n} className={styles.ratingBarRow}>
              <span className={styles.ratingBarLabel}>{n}★</span>
              <div className={styles.ratingBarBg}>
                <div
                  className={styles.ratingBarFill}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className={styles.ratingBarCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className={styles.reviewList}>
        {course.reviews.map((r) => (
          <div key={r.id} className={styles.reviewCard}>
            <div
              className={styles.reviewAvatar}
              style={{ background: r.avatarGradient }}
              aria-hidden
            >
              {r.initials}
            </div>
            <div className={styles.reviewBody}>
              <div className={styles.reviewMeta}>
                <span className={styles.reviewAuthor}>{r.author}</span>
                <span className={styles.reviewStars}>{stars(r.rating)}</span>
                <span className={styles.reviewDate}>
                  {new Date(r.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
              </div>
              <p className={styles.reviewText}>{r.comment}</p>
              <button className={styles.helpfulBtn} aria-label="Marquer comme utile">
                👍 Utile ({r.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sticky purchase panel ─── */
function PurchasePanel({ course }: { course: CourseDetail }) {
  const [selected, setSelected] = useState<"complet" | "courseUnit">("complet");
  const { add, has, items } = useCart();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showAidModal, setShowAidModal] = useState(false);

  const courseId = `cours:${course.slug}`;
  const courseInCart = has(courseId);
  const courseUnitsInCart = items.filter(
    (i) => i.kind === "courseUnit" && i.courseSlug === course.slug
  ).length;
  
  const canPurchase = user?.role === "apprenant"; // seuls les apprenants suivent/achètent

  useEffect(() => {
    if (!user || !course.id) return;
    coursesApi.getWishlist(user.id)
      .then((items) => {
        setIsWishlisted(items.some((item) => item.id === course.id));
      })
      .catch((err) => console.error("Error loading wishlist state", err));
  }, [user, course.id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour ajouter ce cours à votre liste de souhaits.");
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await coursesApi.removeWishlist(user.id, course.id);
        setIsWishlisted(false);
      } else {
        await coursesApi.addWishlist(user.id, course.id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <aside className={styles.purchasePanel} aria-label="Options d'achat">
      {/* Visual header */}
      <div
        className={styles.panelThumb}
        style={{ background: course.thumbGradient }}
        aria-hidden
      >
        {course.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc(course.thumbUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className={styles.panelEmoji}>{course.emoji}</span>
        )}
      </div>

      {!canPurchase ? (
        user ? (
          /* Formateur / admin : consultation libre, mais pas d'achat */
          <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
            <i className="ti ti-eye" style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.5rem" }} />
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.2rem", color: "var(--text-dark)" }}>Mode consultation</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              En tant que {user.role === "formateur" ? "formateur" : "administrateur"}, vous pouvez explorer ce cours mais l&apos;achat et le suivi sont réservés aux comptes apprenants.
            </p>
          </div>
        ) : (
        <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
          <i className="ti ti-user-plus" style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.5rem" }} />
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1.2rem", color: "var(--text-dark)" }}>Connectez-vous pour acheter</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            La consultation du catalogue est libre. Créez un compte gratuit pour acheter et suivre ce cours, à l&apos;unité, par module ou en entier.
          </p>
          <Link href="/connexion" className={styles.btnBuy}>
            Se connecter / s&apos;inscrire
          </Link>
        </div>
        )
      ) : (
        <>
          {/* Toggle complet / courseUnit */}
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${selected === "complet" ? styles.toggleActive : ""}`}
              onClick={() => setSelected("complet")}
            >
              Cours complet
            </button>
            <button
              className={`${styles.toggleBtn} ${selected === "courseUnit" ? styles.toggleActive : ""}`}
              onClick={() => setSelected("courseUnit")}
            >
              Par courseUnit
            </button>
          </div>

      {selected === "complet" ? (
        <>
          <p className={styles.panelPrice}>{fmtXAF(course.price)}</p>
          <p className={styles.panelPriceSub}>Accès à vie · {course.sections.reduce((a, s) => a + s.courseUnits.length, 0)} courseUnits</p>
          {courseInCart ? (
            <Link href="/panier" className={styles.btnBuy} style={{ background: "var(--success)" }}>
              <i className="ti ti-check" aria-hidden /> Dans le panier — Voir
            </Link>
          ) : (
            <button type="button" className={styles.btnBuy} onClick={() => add(courseCartItem(course))}>
              <i className="ti ti-shopping-cart" aria-hidden /> Ajouter au panier
            </button>
          )}
          <button
            type="button"
            className={styles.btnWish}
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
          >
            <i className={`ti ${isWishlisted ? "ti-heart-filled" : "ti-heart"}`} aria-hidden />{" "}
            {isWishlisted ? "Dans vos souhaits" : "Ajouter aux souhaits"}
          </button>
        </>
      ) : (
        <>
          <p className={styles.panelPrice}>dès {fmtXAF(course.priceUnit)}</p>
          <p className={styles.panelPriceSub}>par courseUnit · achetez uniquement ce dont vous avez besoin</p>
          <p className={styles.panelCourseUnitNote}>
            ↓ Ajoutez les courseUnits souhaités depuis le programme ci-dessous
          </p>
          {courseUnitsInCart > 0 ? (
            <Link href="/panier" className={styles.btnBuy}>
              <i className="ti ti-shopping-cart" aria-hidden /> Voir le panier ({courseUnitsInCart})
            </Link>
          ) : (
            <a href="#programme" className={styles.btnBuy}>
              <i className="ti ti-list-check" aria-hidden /> Choisir mes courseUnits
            </a>
          )}
        </>
      )}
        </>
      )}

      {/* Garanties */}
      <ul className={styles.guarantees}>
        {course.hasLifetimeAccess && <li><i className="ti ti-infinity" /> Accès à vie</li>}
        {course.hasCertificate   && <li><i className="ti ti-certificate" /> Certificat vérifiable</li>}
        {course.hasDownload      && <li><i className="ti ti-download" /> Téléchargement offline</li>}
        <li><i className="ti ti-rotate" /> Remboursement 30 jours</li>
      </ul>

      {user && (
        <button
          className={styles.aidBtn}
          onClick={() => setShowAidModal(true)}
          style={{ width: "100%", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1rem", textDecoration: "underline", cursor: "pointer", transition: "color 0.3s" }}
          onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"}
          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          Besoin d'une aide financière ?
        </button>
      )}

      {showAidModal && user && (
        <FinancialAidModal
          courseId={course.id}
          userId={user.id}
          onClose={() => setShowAidModal(false)}
        />
      )}
    </aside>
  );
}

/* ─── Tab bar ─── */
type Tab = "programme" | "avis" | "formateur";

/* ─── Main exported component ─── */
export default function CourseInteractive({ course }: { course: CourseDetail }) {
  const [tab, setTab] = useState<Tab>("programme");
  const totalCourseUnits = course.sections.reduce((a, s) => a + s.courseUnits.length, 0);

  return (
    <div className={styles.wrapper}>
      {/* ── Left: tabs + content ── */}
      <div className={styles.main} id="programme">
        {/* Tab bar */}
        <div className={styles.tabs} role="tablist">
          {(["programme", "avis", "formateur"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "programme" ? `Programme (${totalCourseUnits})` :
               t === "avis"      ? `Avis (${course.reviewCount})` :
               "Formateur"}
            </button>
          ))}
        </div>

        {/* Programme */}
        {tab === "programme" && (
          <div className={styles.programme}>
            <p className={styles.programmeStats}>
              <strong>{totalCourseUnits} courseUnits</strong> ·{" "}
              <strong>{fmt(course.totalDuration)}</strong> de contenu ·{" "}
              2 courseUnits en aperçu gratuit
            </p>
            {course.sections.map((s, i) => (
              <SectionAccordion key={s.id} section={s} defaultOpen={i === 0} course={course} />
            ))}
          </div>
        )}

        {/* Avis */}
        {tab === "avis" && <ReviewsTab course={course} />}

        {/* Formateur */}
        {tab === "formateur" && (
          <div className={styles.instructorTab}>
            <div className={styles.instructorHeader}>
              <div
                className={styles.instructorAvatar}
                style={{ background: course.instructorAvatarGradient }}
                aria-hidden
              >
                {course.instructorAvatar}
              </div>
              <div>
                <h3 className={styles.instructorName}>{course.instructor}</h3>
                <p className={styles.instructorTitle}>{course.instructorTitle}</p>
                <div className={styles.instructorStats}>
                  <span>⭐ {course.instructorRating}</span>
                  <span>👥 {course.instructorStudents.toLocaleString("fr-FR")} élèves</span>
                  <span>📚 {course.instructorCourses} cours</span>
                </div>
              </div>
            </div>
            <p className={styles.instructorBio}>
              Formateur expert passionné par la transmission de connaissances pratiques.
              Ses cours sont reconnus pour leur clarté, leur progression pédagogique et
              leur ancrage dans les réalités du marché africain de la tech.
            </p>
            <Link href={`/formateurs/${course.instructorSlug}`} className={styles.instructorLink}>
              Voir le profil complet →
            </Link>
          </div>
        )}
      </div>

      {/* ── Right: sticky purchase panel ── */}
      <PurchasePanel course={course} />
    </div>
  );
}
