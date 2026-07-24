import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { coursesApi } from "@/lib/api";
import LearnerPlayer from "./LearnerPlayer";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await coursesApi.getDetailBySlug(slug);
  if (!course) return {};
  return {
    title: `Apprendre · ${course.title} — EduFlex Pro`,
    description: `Lecteur de cours : ${course.title}`,
  };
}

export default async function ApprendrePage({ params }: Props) {
  const { slug } = await params;
  const course = await coursesApi.getDetailBySlug(slug);
  if (!course) notFound();

  /* Tous les courseUnits à plat pour la navigation */
  const allCourseUnits = course.sections.flatMap((s) =>
    s.courseUnits.map((ch) => ({ ...ch, sectionTitle: s.title, sectionOrder: s.order }))
  );

  return <LearnerPlayer course={course} allCourseUnits={allCourseUnits} />;
}