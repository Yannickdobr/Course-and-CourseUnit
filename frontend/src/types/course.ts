export type CourseLevel = "Débutant" | "Intermédiaire" | "Avancé";
export type CourseBadge = "Bestseller" | "Nouveau" | "Mis à jour" | "" | string;

export interface CourseUnit {
  id: string;
  title: string;
  price: number;        // 0 = gratuit
  duration: number;     // minutes
  isFree: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  language: string;
  emoji: string;
  thumbGradient: string;
  thumbUrl?: string;      // miniature uploadée (route média) — sinon dégradé + emoji
  badge: CourseBadge;
  badgeType: "promo" | "new" | "";
  price: number;          // prix du cours complet (XAF)
  priceUnit: number;      // prix minimal d'un courseUnit (XAF)
  rating: number;         // 1-5
  reviewCount: number;
  studentCount: number;
  courseUnitCount: number;
  totalDuration: number;  // minutes
  instructor: string;
  updatedAt: string;      // ISO date
  published?: boolean;    // false = désactivé (invisible au catalogue, accessible aux acheteurs)
  validationStatus?: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REJECTED";
  rejectReason?: string;
  courseUnits?: CourseUnit[];
}

export type SortOption = "popularity" | "price_asc" | "price_desc" | "rating" | "newest";

export interface CatalogueFilters {
  query: string;
  category: string;
  level: CourseLevel | "";
  sort: SortOption;
  maxPrice: number | null;
}
