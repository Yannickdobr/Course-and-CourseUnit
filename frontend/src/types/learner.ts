export interface CourseProgress {
  id: string;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  thumbBg: string;
  currentCourseUnit: number;
  totalCourseUnits: number;
  progressPct: number;   /* 0-100 */
  completed: boolean;
  lastAccessedAt: string;
}

export interface Certificate {
  id: string;
  courseTitle: string;
  courseSlug: string;
  obtainedAt: string;    /* ISO date */
  verifyCode: string;
  pdfUrl?: string;
}

export interface WishlistItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  thumbBg: string;
  priceUnit: number;     /* XAF */
}

export interface Purchase {
  id: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
  currency: string;
  purchasedAt: string;
  type: "cours" | "courseUnit" | "forfait" | "abonnement";
}

export interface LearnerStats {
  coursesBought: number;
  courseUnitsCompleted: number;
  certificates: number;
  hoursLearned: number;
}

export interface LearnerDashboard {
  learner: {
    id: string;
    name: string;
    email: string;
    initials: string;
    avatarUrl?: string;
    joinedAt: string;
  };
  stats: LearnerStats;
  coursesInProgress: CourseProgress[];
  certificates: Certificate[];
  wishlist: WishlistItem[];
  recentPurchases: Purchase[];
}