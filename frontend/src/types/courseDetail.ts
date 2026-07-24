import { CourseLevel } from "./course";

export type UnitType =
  | "courseUnit" | "video" | "module" | "paragraphe" | "quiz" | "ressource"
  | "pdf" | "image" | "chapitre";

export interface UnitResource {
  name: string;
  type: string;       // video | pdf | image | …
  url: string;        // route relative (/api/media/files/…) ou URL externe
}

export interface DetailCourseUnit {
  id: string;
  order: number;
  title: string;
  duration: number;   // minutes
  price: number;      // 0 = gratuit
  isFree: boolean;
  isPreview: boolean; // aperçu dispo sans achat
  description?: string;
  objectives?: string; // objectifs de l'unité (une ligne = un item)
  skills?: string;     // compétences acquises (une ligne = un item)
  type?: UnitType;        // type d'unité de cours
  parentId?: string | null; // unité parente (module) — null = racine
  prerequisites?: string[]; // ids d'unités prérequises (même cours) — mention non bloquante
  outcomes?: string[];      // débouchés : unités que celle-ci aide à comprendre
  previousId?: string | null; // chaîne séquentielle : unité « Avant »
  nextId?: string | null;     // chaîne séquentielle : unité « Après »
  originId?: string | null;   // unité autonome réutilisée : id de l'unité d'origine
  resources?: UnitResource[]; // fichiers/ressources (vidéo, pdf, image…) portés par l'unité
}

export interface DetailSection {
  id: string;
  title: string;
  order: number;
  courseUnits: DetailCourseUnit[];
}

export interface Review {
  id: string;
  author: string;
  initials: string;
  avatarGradient: string;
  rating: number;
  date: string;       // ISO
  comment: string;
  helpful: number;
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  whatYouLearn: string[];
  requirements: string[];
  targetAudience: string;
  objectives?: string; // objectifs du cours (une ligne = un item)
  skills?: string;     // compétences acquises (une ligne = un item)
  category: string;
  level: CourseLevel;
  language: string;
  emoji: string;
  thumbGradient: string;
  thumbUrl?: string;          // miniature uploadée (route média)
  previewVideoUrl?: string;   // vidéo d'aperçu (route média)
  badge: string;
  badgeType: "promo" | "new" | "";
  price: number;          // cours complet XAF
  priceUnit: number;      // courseUnit le moins cher
  rating: number;
  reviewCount: number;
  studentCount: number;
  totalDuration: number;  // minutes total
  lastUpdated: string;    // ISO
  instructor: string;
  instructorSlug: string;
  instructorTitle: string;
  instructorAvatar: string;
  instructorAvatarGradient: string;
  instructorRating: number;
  instructorStudents: number;
  instructorCourses: number;
  sections: DetailSection[];
  reviews: Review[];
  hasCertificate: boolean;
  hasDownload: boolean;
  hasLifetimeAccess: boolean;
}
