"use client";

import Link from "next/link";
import { Mentor } from "@/types/mentor";
import styles from "./MentorCard.module.css";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`Note : ${rating} sur 5`}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}{" "}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <Link href={`/formateurs/${mentor.slug}`} className={styles.card}>
      {/* Badge */}
      {mentor.badge && (
        <span
          className={`${styles.badge} ${
            mentor.badge === "Top Formateur"
              ? styles.badgeTop
              : styles.badgeNew
          }`}
        >
          {mentor.badge === "Top Formateur" ? "⭐ " : "✨ "}
          {mentor.badge}
        </span>
      )}

      {/* Avatar */}
      <div
        className={styles.avatar}
        style={{ background: mentor.avatarGradient }}
        aria-hidden
      >
        <span className={styles.avatarEmoji}>{mentor.avatar}</span>
        {mentor.isVerified && (
          <span className={styles.verifiedBadge} title="Formateur vérifié">✓</span>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{mentor.name}</h3>
        <p className={styles.title}>{mentor.title}</p>
        <span className={styles.speciality}>{mentor.speciality}</span>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statVal}>{mentor.courseCount}</span>
          <span className={styles.statLabel}>cours</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statVal}>
            {mentor.studentCount >= 1000
              ? `${(mentor.studentCount / 1000).toFixed(1)}k`
              : mentor.studentCount}
          </span>
          <span className={styles.statLabel}>élèves</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statVal}>{mentor.experienceYears} ans</span>
          <span className={styles.statLabel}>expérience</span>
        </div>
      </div>

      {/* Rating */}
      <div className={styles.ratingRow}>
        <StarRating rating={mentor.rating} />
        <span className={styles.reviewCount}>({mentor.reviewCount} avis)</span>
      </div>

      {/* Languages */}
      <div className={styles.langs}>
        {mentor.languages.map((l) => (
          <span key={l} className={styles.langChip}>{l}</span>
        ))}
      </div>

      {/* CTA */}
      <span className={styles.cta}>Voir le profil →</span>
    </Link>
  );
}