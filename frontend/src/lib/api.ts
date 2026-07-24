/* ──────────────────────────────────────────────────────────────
   Couche d'accès à l'API backend (Spring Boot microservices).
   Les services exposent CORS "*", on les appelle donc directement.
   Surcharger les URLs via .env.local si besoin.
   ────────────────────────────────────────────────────────────── */

import { Course, CourseLevel } from "@/types/course";
import { CourseDetail } from "@/types/courseDetail";
import { Mentor } from "@/types/mentor";

export const AUTH_API =
  process.env.NEXT_PUBLIC_AUTH_API ?? "http://localhost:3001";
export const COURSE_API =
  process.env.NEXT_PUBLIC_COURSE_API ?? "http://localhost:3003";
export const MEDIA_API =
  process.env.NEXT_PUBLIC_MEDIA_API ?? "http://localhost:3004";
export const PAYMENT_API =
  process.env.NEXT_PUBLIC_PAYMENT_API ?? "http://localhost:3005";
export const CERTIFICATE_API =
  process.env.NEXT_PUBLIC_CERTIFICATE_API ?? "http://localhost:3009";

/* ─── Réponses backend ─── */
export interface ApiAuthResponse {
  id: string;
  token: string;
  name: string;
  email: string;
  role: string;
  hasActiveSubscription?: boolean;
}

interface ApiCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  language: string;
  emoji: string;
  thumbGradient: string;
  thumbUrl?: string | null;
  previewVideoUrl?: string | null;
  badge: string | null;
  badgeType: string | null;
  price: number;
  priceUnit: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  courseUnitCount: number;
  totalDuration: number;
  instructor: string;
  updatedAt: string | null;
  published?: boolean;
  validationStatus?: string;
  rejectReason?: string;
}

/* Erreur API typée (porte le code HTTP) */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  init: RequestInit,
  fallbackMessage: string
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError(
      "Impossible de contacter le serveur. Vérifiez que le backend est démarré.",
      0
    );
  }

  if (!res.ok) {
    // Spring masque souvent le message ; on tente quand même de le lire.
    let msg = fallbackMessage;
    try {
      const data = await res.json();
      if (data && typeof data.message === "string" && data.message && data.message !== "No message available") {
        msg = data.message;
      }
    } catch {
      /* corps non JSON */
    }
    throw new ApiError(msg, res.status);
  }

  return res.json() as Promise<T>;
}

function authHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/* Extrait le message d'erreur d'une réponse (Spring renvoie {message,...} sur 4xx). */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.message === "string" && data.message && data.message !== "No message available") {
      return data.message;
    }
  } catch {
    /* corps non JSON */
  }
  return fallback;
}

/* ─── Auth ─── */
export const authApi = {
  login: (email: string, password: string) =>
    request<ApiAuthResponse>(
      `${AUTH_API}/api/auth/login`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify({ email, password }) },
      "Email ou mot de passe incorrect."
    ),

  register: (name: string, email: string, password: string, role?: string) =>
    request<ApiAuthResponse>(
      `${AUTH_API}/api/auth/register`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify({ name, email, password, role }) },
      "Inscription impossible. Cet email est peut-être déjà utilisé."
    ),

  becomeInstructor: (userId: string) =>
    request<ApiAuthResponse>(
      `${AUTH_API}/api/auth/users/${userId}/become-instructor`,
      { method: "POST", headers: authHeaders() },
      "Impossible de devenir formateur."
    ),

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch(`${AUTH_API}/api/auth/password/forgot`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }), cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return data.message || "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.";
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const res = await fetch(`${AUTH_API}/api/auth/password/reset`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }), cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Lien invalide ou expiré."));
    const data = await res.json().catch(() => ({}));
    return data.message || "Mot de passe réinitialisé.";
  },

  async getMentors(): Promise<Mentor[]> {
    try {
      const res = await fetch(`${AUTH_API}/api/auth/mentors`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json() as any[];
      return data.map((u: any) => {
        const initials = u.name ? u.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "F";
        const slug = u.name ? u.name.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "") : u.id;
        return {
          id: u.id,
          slug: slug,
          name: u.name || "Formateur Anonyme",
          title: "Formateur Certifié EduFlex Pro",
          speciality: "Dev Web",
          avatar: initials,
          avatarGradient: "linear-gradient(135deg, #1a1060, #3b2fa0)",
          bio: "Formateur passionné sur la plateforme EduFlex Pro.",
          courseCount: 0,
          studentCount: 0,
          rating: 5.0,
          reviewCount: 0,
          experienceYears: 1,
          languages: ["Français"],
          isVerified: true,
          badge: "Nouveau",
        };
      });
    } catch {
      return [];
    }
  },

  async getAllUsers(): Promise<any[]> {
    try {
      const res = await fetch(`${AUTH_API}/api/auth/users`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async updateUserRole(id: string, role: string, actingUserId?: string): Promise<any> {
    const params = new URLSearchParams({ role });
    if (actingUserId) params.append("actingUserId", actingUserId);
    const res = await fetch(`${AUTH_API}/api/auth/users/${id}/role?${params.toString()}`, {
      method: "PUT",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Impossible de modifier le rôle"));
    return res.json();
  },

  async deleteUser(id: string, actingUserId?: string): Promise<void> {
    const params = new URLSearchParams();
    if (actingUserId) params.append("actingUserId", actingUserId);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${AUTH_API}/api/auth/users/${id}${qs}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Impossible de supprimer l'utilisateur"));
  }
};

/* ─── Courses ─── */
const LEVELS: CourseLevel[] = ["Débutant", "Intermédiaire", "Avancé"];

function toCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description ?? "",
    category: c.category ?? "Autre",
    level: LEVELS.includes(c.level as CourseLevel) ? (c.level as CourseLevel) : "Débutant",
    language: c.language ?? "Français",
    emoji: c.emoji ?? "📚",
    thumbGradient: c.thumbGradient ?? "linear-gradient(135deg,#1a1060,#3b2fa0)",
    thumbUrl: c.thumbUrl ?? undefined,
    badge: c.badge ?? "",
    badgeType: (c.badgeType as any) || "",
    price: c.price ?? 0,
    priceUnit: c.priceUnit ?? 0,
    rating: c.rating ?? 0,
    reviewCount: c.reviewCount ?? 0,
    studentCount: c.studentCount ?? 0,
    courseUnitCount: c.courseUnitCount ?? 0,
    totalDuration: c.totalDuration ?? 0,
    instructor: c.instructor ?? "Inconnu",
    updatedAt: c.updatedAt ?? new Date().toISOString(),
    published: c.published ?? false,
    validationStatus: (c.validationStatus as any) ?? "DRAFT",
    rejectReason: c.rejectReason,
  };
}

export function toCourseDetail(found: any): CourseDetail {
  return {
    id: found.id,
    slug: found.slug,
    title: found.title,
    tagline: found.tagline || found.title,
    description: found.description || "",
    whatYouLearn: found.whatYouLearn || [],
    requirements: found.requirements || [],
    targetAudience: found.targetAudience || "",
    objectives: found.objectives || "",
    skills: found.skills || "",
    category: found.category || "Autre",
    level: found.level || "Débutant",
    language: found.language || "Français",
    emoji: found.emoji || "📚",
    thumbGradient: found.thumbGradient || "",
    thumbUrl: found.thumbUrl || undefined,
    previewVideoUrl: found.previewVideoUrl || undefined,
    badge: found.badge || "",
    badgeType: found.badgeType || "",
    price: found.price || 0,
    priceUnit: found.priceUnit || 0,
    rating: found.rating || 0,
    reviewCount: found.reviewCount || 0,
    studentCount: found.studentCount || 0,
    totalDuration: found.totalDuration || 0,
    lastUpdated: found.lastUpdated || new Date().toISOString(),
    instructor: found.instructor || "",
    instructorSlug: found.instructorSlug || "",
    instructorTitle: found.instructorTitle || "",
    instructorAvatar: found.instructorAvatar || "",
    instructorAvatarGradient: found.instructorAvatarGradient || "",
    instructorRating: found.instructorRating || 0,
    instructorStudents: found.instructorStudents || 0,
    instructorCourses: found.instructorCourses || 0,
    hasCertificate: found.hasCertificate || false,
    hasDownload: found.hasDownload || false,
    hasLifetimeAccess: found.hasLifetimeAccess || false,
    sections: (found.sections || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      courseUnits: (s.courseUnits || []).map((ch: any) => ({
        id: ch.id,
        order: ch.order,
        title: ch.title,
        duration: ch.duration,
        price: ch.price,
        isFree: ch.isFree,
        isPreview: ch.isPreview,
        description: ch.description || "",
        objectives: ch.objectives || "",
        skills: ch.skills || "",
        type: ch.type || "courseUnit",
        parentId: ch.parentId ?? null,
        prerequisites: ch.prerequisites || [],
        outcomes: ch.outcomes || [],
        previousId: ch.previousUnitId ?? null,
        nextId: ch.nextUnitId ?? null,
        originId: ch.originUnitId ?? null,
        resources: (ch.resources || []).map((r: any) => ({ name: r.name, type: r.type, url: r.url })),
      })).sort((a: any, b: any) => a.order - b.order)
    })).sort((a: any, b: any) => a.order - b.order),
    reviews: found.reviews || []
  };
}

export const coursesApi = {
  /** Liste des cours publiés. Lève ApiError si le backend est injoignable. */
  async list(): Promise<Course[]> {
    const data = await request<ApiCourse[]>(
      `${COURSE_API}/api/courses`,
      { method: "GET", headers: authHeaders(), cache: "no-store" },
      "Impossible de charger les cours."
    );
    return data.map(toCourse);
  },

  async enroll(userId: string, courseId?: string, courseUnitId?: string, moduleId?: string): Promise<void> {
    const params = new URLSearchParams();
    params.append("userId", userId);
    if (courseId) params.append("courseId", courseId);
    if (courseUnitId) params.append("courseUnitId", courseUnitId);
    if (moduleId) params.append("moduleId", moduleId);

    await fetch(`${COURSE_API}/api/courses/enroll?${params.toString()}`, {
      method: "POST",
      cache: "no-store",
    });
  },

  async deleteCourse(id: string): Promise<void> {
    const res = await fetch(`${COURSE_API}/api/courses/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) throw new Error(await errorMessage(res, "Suppression impossible."));
  },

  async getEnrolled(userId: string): Promise<CourseDetail[]> {
    try {
      const res = await fetch(`${COURSE_API}/api/courses/enrolled?userId=${userId}`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json() as any[];
      return data.map(toCourseDetail);
    } catch {
      return [];
    }
  },

  async getCourseAccess(userId: string, courseId: string): Promise<{ fullCourse: boolean; unitIds: string[] }> {
    try {
      const params = new URLSearchParams({ userId, courseId });
      const res = await fetch(`${COURSE_API}/api/courses/access-map?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return { fullCourse: false, unitIds: [] };
      const data = await res.json();
      return { fullCourse: !!data.fullCourse, unitIds: Array.isArray(data.unitIds) ? data.unitIds : [] };
    } catch {
      return { fullCourse: false, unitIds: [] };
    }
  },

  async getCompletions(userId: string): Promise<string[]> {
    try {
      const res = await fetch(`${COURSE_API}/api/courses/completions?userId=${userId}`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async toggleCompletion(userId: string, courseUnitId: string, completed: boolean): Promise<void> {
    const params = new URLSearchParams({ userId, courseUnitId, completed: String(completed) });
    await fetch(`${COURSE_API}/api/courses/completions?${params.toString()}`, {
      method: "POST",
      cache: "no-store",
    });
  },

  async getDetailBySlug(slug: string): Promise<CourseDetail | null> {
    try {
      const res = await fetch(`${COURSE_API}/api/courses/all`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json() as any[];
      const found = data.find((c) => c.slug === slug);
      if (!found) return null;
      return toCourseDetail(found);
    } catch {
      return null;
    }
  },

  async getAllCourses(): Promise<any[]> {
    try {
      const res = await fetch(`${COURSE_API}/api/courses/all`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async togglePublish(id: string, published: boolean): Promise<any> {
    const params = new URLSearchParams({ published: String(published) });
    const res = await fetch(`${COURSE_API}/api/courses/${id}/publish?${params.toString()}`, {
      method: "PUT",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Impossible de modifier le statut de publication");
    return res.json();
  },

  async createCourse(payload: unknown): Promise<{ id: string; slug: string }> {
    const res = await fetch(`${COURSE_API}/api/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Impossible de créer le cours."));
    return res.json();
  },

  async updateCourse(id: string, payload: unknown): Promise<{ id: string; slug: string }> {
    const res = await fetch(`${COURSE_API}/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Impossible de mettre à jour le cours."));
    return res.json();
  },

  async validateCourse(id: string, status: string, reason?: string): Promise<Course> {
    const params = new URLSearchParams();
    params.append("status", status);
    if (reason) params.append("reason", reason);
    
    const res = await fetch(`${COURSE_API}/api/courses/${id}/validate?${params.toString()}`, {
      method: "PUT",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Impossible de valider le cours."));
    return toCourse(await res.json() as ApiCourse);
  },

  async getWishlist(userId: string): Promise<Course[]> {
    const res = await fetch(`${COURSE_API}/api/courses/wishlist?userId=${userId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json() as ApiCourse[]).map(toCourse);
  },

  async addWishlist(userId: string, courseId: string): Promise<void> {
    await fetch(`${COURSE_API}/api/courses/wishlist?userId=${userId}&courseId=${courseId}`, { method: "POST", cache: "no-store" });
  },

  async removeWishlist(userId: string, courseId: string): Promise<void> {
    await fetch(`${COURSE_API}/api/courses/wishlist?userId=${userId}&courseId=${courseId}`, { method: "DELETE", cache: "no-store" });
  },

  async byInstructor(name: string): Promise<Course[]> {
    const res = await fetch(`${COURSE_API}/api/courses/instructor?name=${encodeURIComponent(name)}`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json() as ApiCourse[]).map(toCourse);
  },

  /* Bibliothèque d'unités autonomes réutilisables (filtrée par formateur si fourni). */
  async getReusableUnits(instructor?: string): Promise<ReusableUnit[]> {
    const qs = instructor ? `?instructor=${encodeURIComponent(instructor)}` : "";
    const res = await fetch(`${COURSE_API}/api/courses/units/library${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },
};

export interface ReusableUnit {
  id: string;
  title: string;
  type: string;
  price: number;
  duration: number;
  description: string;
  courseTitle: string;
  courseSlug: string;
  instructor: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  type: string;
  instructor: string;
  courseId?: string | null;
  courseSlug?: string | null;
  price: number;
  published: boolean;
  purchaseCount?: number;
  createdAt?: string;
  updatedAt?: string;
  links: ProjectLink[];
  unitIds: string[];
}

export const projectsApi = {
  async list(instructor?: string): Promise<Project[]> {
    const qs = instructor ? `?instructor=${encodeURIComponent(instructor)}` : "";
    const res = await fetch(`${COURSE_API}/api/projects${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },
  async marketplace(): Promise<Project[]> {
    const res = await fetch(`${COURSE_API}/api/projects/marketplace`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },
  async byCourse(courseId: string): Promise<Project[]> {
    const res = await fetch(`${COURSE_API}/api/projects/course/${courseId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },
  async create(p: Project): Promise<Project> {
    const res = await fetch(`${COURSE_API}/api/projects`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p), cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Création du projet impossible."));
    return res.json();
  },
  async update(id: string, p: Project): Promise<Project> {
    const res = await fetch(`${COURSE_API}/api/projects/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p), cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Mise à jour du projet impossible."));
    return res.json();
  },
  async remove(id: string): Promise<void> {
    const res = await fetch(`${COURSE_API}/api/projects/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) throw new Error(await errorMessage(res, "Suppression du projet impossible."));
  },
  async getById(id: string): Promise<Project | null> {
    const res = await fetch(`${COURSE_API}/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  },
  async purchase(id: string, userId: string): Promise<void> {
    const res = await fetch(`${COURSE_API}/api/projects/${id}/purchase?userId=${userId}`, { method: "POST", cache: "no-store" });
    if (!res.ok) throw new Error(await errorMessage(res, "Achat du projet impossible."));
  },
  async hasAccess(id: string, userId: string): Promise<boolean> {
    const res = await fetch(`${COURSE_API}/api/projects/${id}/access?userId=${userId}`, { cache: "no-store" });
    if (!res.ok) return false;
    return res.json();
  },
  async owned(userId: string): Promise<Project[]> {
    const res = await fetch(`${COURSE_API}/api/projects/owned?userId=${userId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },
};

export interface ApiPurchase {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string | null;
  courseSlug: string | null;
  label: string;
  type: string;
  instructor: string;
  gross: number;
  net: number;
  currency: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  providerRef?: string | null;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  itemsSummary?: string;
}

export const paymentApi = {
  /* Crée une transaction de paiement (statut PENDING). Avec une vraie API, providerRef
     contiendrait l'URL/session à laquelle rediriger l'utilisateur. */
  async createTransaction(req: { userId: string; amount: number; currency?: string; method: string; itemsSummary?: string }): Promise<PaymentTransaction> {
    const res = await fetch(`${PAYMENT_API}/api/payments/transactions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: "XAF", ...req }), cache: "no-store",
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Impossible d'initier le paiement."));
    return res.json();
  },

  /* Confirme (capture) la transaction. En simulé => PAID. Avec une vraie API, la
     confirmation viendrait plutôt du webhook. */
  async confirmTransaction(id: string): Promise<PaymentTransaction> {
    const res = await fetch(`${PAYMENT_API}/api/payments/transactions/${id}/confirm`, { method: "POST", cache: "no-store" });
    if (!res.ok) throw new Error(await errorMessage(res, "Paiement non confirmé."));
    return res.json();
  },

  /* Envoie le reçu par e-mail (best-effort : n'interrompt pas le tunnel si ça échoue). */
  async sendReceipt(req: {
    email: string; name?: string; orderId: string; currency?: string; total: number;
    items: { label: string; type: string; price: number }[];
  }): Promise<void> {
    try {
      await fetch(`${PAYMENT_API}/api/payments/receipt`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "XAF", ...req }), cache: "no-store",
      });
    } catch { /* silencieux */ }
  },

  async recordPurchase(req: {
    userId: string; userName?: string; userEmail?: string;
    courseId?: string; courseSlug?: string; label: string; type: string;
    instructor?: string; gross: number; trafficType?: number; currency?: string;
  }): Promise<void> {
    await fetch(`${PAYMENT_API}/api/payments/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trafficType: 0, currency: "XAF", ...req }),
      cache: "no-store",
    });
  },

  async getUserPurchases(userId: string): Promise<ApiPurchase[]> {
    try {
      const res = await fetch(`${PAYMENT_API}/api/payments/purchases?userId=${userId}`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  async getInstructorPurchases(name: string): Promise<ApiPurchase[]> {
    try {
      const res = await fetch(`${PAYMENT_API}/api/payments/purchases/instructor?name=${encodeURIComponent(name)}`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },
  async validateCoupon(code: string): Promise<{ code: string; pct: number; label: string }> {
    const res = await fetch(`${PAYMENT_API}/api/payments/coupons/validate?code=${encodeURIComponent(code)}`);
    if (!res.ok) {
      throw new Error("Code promo invalide ou expiré.");
    }
    return res.json();
  },

  async getAllCoupons(): Promise<any[]> {
    try {
      const res = await fetch(`${PAYMENT_API}/api/payments/coupons`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async createCoupon(coupon: { code: string; pct: number; label: string }): Promise<any> {
    const res = await fetch(`${PAYMENT_API}/api/payments/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Impossible de créer le code promo");
    return res.json();
  },

  async deleteCoupon(code: string): Promise<void> {
    const res = await fetch(`${PAYMENT_API}/api/payments/coupons/${code}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Impossible de supprimer le code promo");
  },

  async getAllFinancialAids(): Promise<any[]> {
    try {
      const res = await fetch(`${PAYMENT_API}/api/payments/financial-aid`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async updateFinancialAidStatus(id: string, status: string): Promise<any> {
    const params = new URLSearchParams({ status });
    const res = await fetch(`${PAYMENT_API}/api/payments/financial-aid/${id}/status?${params.toString()}`, {
      method: "PUT",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Impossible de modifier le statut de l'aide financière");
    return res.json();
  },

  async applyForFinancialAid(data: {
    userId: string;
    courseId: string;
    monthlyIncome: number;
    disadvantaged: boolean;
    motivationScore: number;
    auditHours: number;
  }): Promise<any> {
    const res = await fetch(`${PAYMENT_API}/api/payments/financial-aid/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Impossible de soumettre la demande d'aide financière");
    return res.json();
  }
};

export interface ApiCertificate {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  status: string;
  issuedAt: string;
}

export const certificateApi = {
  async getByUserId(userId: string): Promise<ApiCertificate[]> {
    try {
      const res = await fetch(`${CERTIFICATE_API}/api/certificates/user/${userId}`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },
  downloadUrl(id: string): string {
    return `${CERTIFICATE_API}/api/certificates/download/${id}`;
  }
};

/* Lit le token JWT stocké par l'AuthProvider (localStorage "eduflex-auth"). */
function storedToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("eduflex-auth");
    return raw ? (JSON.parse(raw).token as string | undefined) : undefined;
  } catch {
    return undefined;
  }
}

export async function uploadCourseFile(file: File): Promise<{ url: string; route: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = storedToken();
  const headers: Record<string, string> = {};
  // Pas de Content-Type : le navigateur pose le multipart/form-data + boundary.
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${MEDIA_API}/api/media/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let msg = "Erreur lors de l'upload";
    try {
      const data = await res.json();
      if (data.message) msg = data.message;
    } catch {}
    throw new ApiError(msg, res.status);
  }

  const data = await res.json();
  // On privilégie la route relative (stockée en base) ; fallback sur l'url absolue.
  return { url: data.url, route: data.route ?? data.url };
}

/* Résout une ressource stockée vers une URL chargeable :
   - URL externe (http…) collée par le formateur : renvoyée telle quelle ;
   - route relative (/api/media/files/…) : préfixée par le serveur média courant
     (PC local aujourd'hui via MEDIA_API, cloud demain en changeant l'env). */
export function mediaSrc(value?: string | null): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value;
  return `${MEDIA_API}${value.startsWith("/") ? "" : "/"}${value}`;
}
