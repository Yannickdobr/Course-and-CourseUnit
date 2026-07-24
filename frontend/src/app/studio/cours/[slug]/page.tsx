"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, type AuthUser } from "@/app/components/AuthProvider";
import { DraftCourse, DraftCourseUnit } from "@/types/studio";
import { coursesApi, authApi } from "@/lib/api";
import CourseEditor from "@/app/cours/components/CourseEditor";

function slugify(s: string): string {
  return (
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `cours-${Date.now()}`
  );
}

function emptyDraft(): DraftCourse {
  return {
    id: "nouveau",
    title: "",
    description: "",
    category: "Dev Web",
    level: "Débutant",
    language: "Français",
    tags: [],
    status: "brouillon",
    priceFull: 0,
    discountSubscriber: 20,
    promoCode: "",
    sections: [{ id: "s-1", title: "Contenu du cours", order: 1, courseUnits: [] }],
    updatedAt: new Date().toISOString(),
  };
}

/* CourseDetail (backend) -> DraftCourse (éditeur) */
function detailToDraft(d: any): DraftCourse {
  const units: DraftCourseUnit[] = [];
  (d.sections || []).forEach((s: any) =>
    (s.courseUnits || []).forEach((u: any) =>
      units.push({
        id: u.id,
        title: u.title,
        price: u.price ?? 0,
        isFree: !!u.isFree,
        status: "publie",
        order: u.order ?? units.length + 1,
        duration: u.duration ?? 0,
        description: u.description ?? "",
        type: u.type || "courseUnit",
        objectives: u.objectives || "",
        skills: u.skills || "",
        parentId: u.parentId || undefined,
        prerequisites: u.prerequisites || [],
        outcomes: u.outcomes || [],
        previousId: u.previousId || undefined,
        nextId: u.nextId || undefined,
        originId: u.originId || undefined,
        resources: u.resources || [],
      })
    )
  );
  return {
    id: d.id,
    title: d.title || "",
    description: d.description || "",
    category: d.category || "Dev Web",
    level: d.level || "Débutant",
    language: d.language || "Français",
    tags: [],
    status: (d.validationStatus as any) || "brouillon",
    rejectReason: d.rejectReason,
    thumbUrl: d.thumbUrl || undefined,
    previewVideoUrl: d.previewVideoUrl || undefined,
    objectives: d.objectives || "",
    skills: d.skills || "",
    priceFull: d.price ?? 0,
    discountSubscriber: 20,
    promoCode: "",
    sections: [{ id: "s-1", title: "Contenu du cours", order: 1, courseUnits: units }],
    updatedAt: new Date().toISOString(),
  };
}

/* DraftCourse -> payload backend (Course) */
function buildPayload(course: DraftCourse, user: AuthUser, slug: string, validationStatus: string, assignedAdminId?: string) {
  const units = course.sections.flatMap((s) => s.courseUnits);
  const paid = units.filter((u) => !u.isFree && u.price > 0).map((u) => u.price);
  const priceUnit = paid.length ? Math.min(...paid) : 0;
  const totalDuration = units.reduce((a, u) => a + (u.duration || 0), 0);

  return {
    slug,
    title: course.title,
    tagline: (course.description || course.title).slice(0, 140),
    description: course.description,
    category: course.category,
    level: course.level,
    language: course.language,
    emoji: "📘",
    thumbGradient: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    thumbUrl: course.thumbUrl || null,
    previewVideoUrl: course.previewVideoUrl || null,
    objectives: course.objectives || "",
    skills: course.skills || "",
    badge: "",
    badgeType: "",
    price: course.priceFull || 0,
    priceUnit: priceUnit || 0,
    rating: 0,
    reviewCount: 0,
    studentCount: 0,
    totalDuration: totalDuration || 0,
    lastUpdated: new Date().toISOString().slice(0, 10),
    instructor: user.name,
    instructorEmail: user.email,
    instructorSlug: slugify(user.name),
    instructorTitle: "Formateur",
    instructorAvatar: user.initials,
    instructorAvatarGradient: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    instructorRating: 0,
    instructorStudents: 0,
    instructorCourses: 0,
    hasCertificate: true,
    hasDownload: true,
    hasLifetimeAccess: true,
    published: validationStatus === "PUBLISHED",
    validationStatus: validationStatus,
    assignedAdminId: assignedAdminId || null,
    sections: course.sections.map((s, si) => ({
      title: s.title,
      order: si + 1,
      courseUnits: s.courseUnits.map((u, ui) => ({
        clientId: u.id,
        title: u.title,
        order: ui + 1,
        duration: u.duration || 0,
        price: u.isFree ? 0 : (u.price || 0),
        isFree: u.isFree || false,
        isPreview: false,
        description: u.description || "",
        type: u.type || "courseUnit",
        objectives: u.objectives || "",
        skills: u.skills || "",
        parentKey: u.parentId || null,
        prerequisiteKeys: u.prerequisites || [],
        outcomeKeys: u.outcomes || [],
        previousKey: u.previousId || null,
        nextKey: u.nextId || null,
        originUnitId: u.originId || null,
        resources: (u.resources || []).map((r) => ({ name: r.name, type: r.type, url: r.url })),
      })),
    })),
  };
}

export default function CourseEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const slugParam = params?.slug ?? "nouveau";
  const isNew = slugParam === "nouveau";

  const [draft, setDraft] = useState<DraftCourse | null>(null);
  const [realSlug, setRealSlug] = useState<string>("");
  const [notFoundErr, setNotFoundErr] = useState(false);

  useEffect(() => {
    let active = true;
    if (isNew) {
      setDraft(emptyDraft());
      return;
    }
    coursesApi.getDetailBySlug(slugParam).then((d) => {
      if (!active) return;
      if (!d) { setNotFoundErr(true); return; }
      setRealSlug(d.slug);
      setDraft(detailToDraft(d));
    });
    return () => { active = false; };
  }, [slugParam, isNew]);

  /* Persiste et renvoie le slug réel du cours (créé ou mis à jour). */
  async function persist(course: DraftCourse, validationStatus: string, assignedAdminId?: string): Promise<string> {
    if (!user) { router.push("/connexion"); return ""; }
    const slug = isNew ? slugify(course.title || "cours") : (realSlug || slugify(course.title));
    const payload = buildPayload(course, user, slug, validationStatus, assignedAdminId);
    if (isNew) {
      const created = await coursesApi.createCourse(payload);
      return created.slug || slug;
    }
    await coursesApi.updateCourse(course.id, payload);
    return realSlug || slug;
  }

  /* Choisit aléatoirement un admin à qui adresser la demande de validation. */
  async function pickRandomAdmin(): Promise<string | undefined> {
    try {
      const users = await authApi.getAllUsers();
      const admins = users.filter((u) => u.role === "admin" || u.role === "superadmin");
      if (!admins.length) return undefined;
      return admins[Math.floor(Math.random() * admins.length)].id as string;
    } catch {
      return undefined;
    }
  }

  /* Sauvegarder : reste en brouillon (non publié). Après la 1ʳᵉ création, on bascule
     sur la route du cours pour éviter les doublons et permettre de reprendre plus tard. */
  async function handleSave(course: DraftCourse) {
    try {
      const slug = await persist(course, "DRAFT");
      if (isNew && slug) router.replace(`/studio/cours/${slug}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Échec de la sauvegarde.");
    }
  }

  /* Soumettre pour validation : la demande part vers un admin aléatoire qui décidera. */
  async function handleSubmit(course: DraftCourse) {
    try {
      const adminId = await pickRandomAdmin();
      await persist(course, "SUBMITTED", adminId);
      router.push("/studio");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Échec de la soumission.");
    }
  }

  if (notFoundErr) {
    return <div style={{ padding: "3rem", textAlign: "center" }}>Cours introuvable.</div>;
  }
  if (!draft) {
    return <div style={{ padding: "3rem", textAlign: "center" }}>Chargement de l&apos;éditeur…</div>;
  }

  return (
    <>
      {draft.rejectReason && (
        <div style={{ padding: "1rem", backgroundColor: "#ffcccc", color: "#cc0000", textAlign: "center", fontWeight: "bold" }}>
          Ce cours a été rejeté. Motif : {draft.rejectReason}
        </div>
      )}
      <CourseEditor initial={draft} onSave={handleSave} onSubmit={handleSubmit} />
    </>
  );
}
