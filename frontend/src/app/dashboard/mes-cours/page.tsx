"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { coursesApi } from "@/lib/api";
import { CourseDetail } from "@/types/courseDetail";
import MesCoursList from "./MesCoursList";
import styles from "./page.module.css";

export default function MesCoursPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDetail[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function loadData() {
      try {
        const [enrolled, completedIds] = await Promise.all([
          coursesApi.getEnrolled(userId),
          coursesApi.getCompletions(userId),
        ]);
        setEnrolledCourses(enrolled);
        setCompletions(completedIds);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--fg-muted)" }}>Chargement de vos cours...</p>
      </div>
    );
  }

  // Map courses to CourseProgress type expected by MesCoursList
  const coursesProgress = enrolledCourses.map((c) => {
    const allChs = (c.sections || []).flatMap((s) => s.courseUnits || []);
    const totalCourseUnits = allChs.length;
    const completedCourseUnits = allChs.filter((ch) => completions.includes(ch.id)).length;
    const progressPct = totalCourseUnits > 0 ? Math.round((completedCourseUnits / totalCourseUnits) * 100) : 0;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      category: c.category,
      emoji: c.emoji,
      thumbBg: c.thumbGradient.includes("linear-gradient") ? "var(--primary-dark)" : c.thumbGradient || "#ede9fe",
      currentCourseUnit: Math.min(totalCourseUnits, completedCourseUnits + 1),
      totalCourseUnits,
      progressPct,
      completed: completedCourseUnits === totalCourseUnits && totalCourseUnits > 0,
      lastAccessedAt: new Date().toISOString(), // Default fallback
    };
  });

  return (
    <div className={styles.page}>
      {/* ── En-tête ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mes cours</h1>
          <p className={styles.sub}>
            Reprenez votre apprentissage là où vous l&apos;avez laissé.
          </p>
        </div>
        <Link href="/catalogue" className={styles.btnExplore}>
          <i className="ti ti-plus" aria-hidden="true" />
          Découvrir des cours
        </Link>
      </div>

      <MesCoursList courses={coursesProgress} />
    </div>
  );
}
