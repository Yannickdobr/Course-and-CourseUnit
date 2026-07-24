/* Types du panier — fonctionnalité centrale « achat par courseUnit » (RF-LRN-05, RF-PRC-10) */

export type CartItemKind = "cours" | "courseUnit" | "module" | "projet" | "forfait";

export interface CartItem {
  id: string;             // identifiant unique : `${kind}:${courseSlug}:${ref}`
  kind: CartItemKind;
  courseSlug: string;
  courseTitle: string;
  label: string;          // ex : « Cours complet », titre du courseUnit, « Pack 5 courseUnits »
  emoji: string;
  thumbBg: string;
  unitPrice: number;      // prix unitaire en XAF
  originalPrice?: number; // prix barré éventuel (remise cours complet / pack)
  courseId?: string;
  courseUnitId?: string;
  moduleId?: string;
  projectId?: string;
  instructor?: string;
}

export interface Coupon {
  code: string;
  pct: number;            // pourcentage de remise (0-100)
  label: string;
}
