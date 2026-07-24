import Link from "next/link";
import { Course } from "@/types/course";
import { mediaSrc } from "@/lib/api";
import styles from "./CourseCard.module.css";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className={styles.stars} aria-label={`Note : ${rating} sur 5`}>
      {"★".repeat(full)}{half ? "½" : ""}{" "}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </span>
  );
}

function badgeClass(badgeType: string) {
  if (badgeType === "new" || badgeType === "promo") return styles.badgeOrange;
  if (badgeType === "green")                         return styles.badgeGreen;
  return styles.badgeDefault;
}

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/cours/${course.slug}`} className={styles.card}>
      <div
        className={styles.thumb}
        style={{ background: course.thumbGradient }}
        aria-hidden
      >
        {course.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc(course.thumbUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className={styles.thumbEmoji}>{course.emoji}</span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{course.category}</p>

        {course.badge && (
          <span className={`${styles.badge} ${badgeClass(course.badgeType)}`}>
            {course.badge}
          </span>
        )}

        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.instructor}>par {course.instructor}</p>

        <div className={styles.meta}>
          <StarRating rating={course.rating} />
          <span className={styles.students}>
            {course.studentCount.toLocaleString("fr-FR")} élèves
          </span>
        </div>

        <div className={styles.footer}>
          <div>
            <span className={styles.price}>
              dès {course.priceUnit.toLocaleString("fr-FR")} XAF
            </span>
            <span className={styles.priceNote}>/ courseUnit</span>
          </div>
          <span className={styles.level}>{course.level}</span>
        </div>
      </div>
    </Link>
  );
}