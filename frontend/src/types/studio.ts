import { CourseLevel } from "./course";

export type CourseUnitStatus = "brouillon" | "publie";
export type CourseStatus  = "brouillon" | "en_revision" | "approuve" | "publie" | "rejete";

export interface CourseUnitResource {
  id?: string;
  name: string;
  type: string;
  url: string;
}

export interface DraftCourseUnit {
  id: string;
  title: string;
  price: number;       // 0 = gratuit
  isFree: boolean;
  status: CourseUnitStatus;
  duration?: number;   // minutes (rempli après upload vidéo)
  videoUrl?: string;
  order: number;
  changeNote?: string; // note de mise à jour
  description?: string;
  objectives?: string;      // objectifs de l'unité (une ligne = un item)
  skills?: string;          // compétences acquises (une ligne = un item)
  resources?: CourseUnitResource[];
  type?: string;            // courseUnit | video | module | paragraphe | quiz | ressource
  parentId?: string;        // unité parente (module) — null = racine
  prerequisites?: string[]; // ce qu'il faut savoir avant (mention, non bloquant)
  outcomes?: string[];      // débouchés : unités que celle-ci aide à comprendre
  previousId?: string;      // chaîne séquentielle : unité « Avant »
  nextId?: string;          // chaîne séquentielle : unité « Après »
  originId?: string;        // unité autonome réutilisée : id de l'unité d'origine (réf. partagée)
}

export interface DraftSection {
  id: string;
  title: string;
  order: number;
  courseUnits: DraftCourseUnit[];
}

export interface DraftCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  language: string;
  tags: string[];
  thumbUrl?: string;
  previewVideoUrl?: string;
  status: CourseStatus;
  rejectReason?: string;
  objectives?: string;      // objectifs du cours (une ligne = un item)
  skills?: string;          // compétences acquises (une ligne = un item)

  /* Tarification */
  priceFull: number;        // prix cours complet (XAF)
  discountSubscriber: number; // % remise abonnés
  promoCode?: string;

  sections: DraftSection[];
  updatedAt: string;
}

/* Calculs dérivés utiles dans l'UI */
export function computeRevenue(priceFull: number, platformRate = 0.3): number {
  return Math.round(priceFull * (1 - platformRate));
}

export function computeSubscriberPrice(priceFull: number, discountPct: number): number {
  return Math.round(priceFull * (1 - discountPct / 100));
}

export function courseStatusLabel(status: CourseStatus): string {
  const map: Record<CourseStatus, string> = {
    brouillon:   "Brouillon",
    en_revision: "En révision",
    approuve:    "Approuvé",
    publie:      "Publié",
    rejete:      "Rejeté",
  };
  return map[status] ?? status;
}
