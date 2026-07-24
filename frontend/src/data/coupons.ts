import { Coupon } from "@/types/cart";

/* Coupons de réduction mock (RF-PRC-06). À remplacer par une vérification API. */
export const COUPONS: Coupon[] = [
  { code: "LAUNCH30", pct: 30, label: "Offre de lancement −30%" },
  { code: "EDU2025",  pct: 15, label: "Rentrée 2025 −15%" },
  { code: "WELCOME10", pct: 10, label: "Bienvenue −10%" },
];

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}
