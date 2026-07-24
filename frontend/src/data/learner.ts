import { LearnerDashboard } from "@/types/learner";

export const MOCK_DASHBOARD: LearnerDashboard = {
  learner: {
    id: "u-1",
    name: "Awa Mbaye",
    email: "awa.mbaye@example.com",
    initials: "AM",
    joinedAt: "2024-09-01",
  },
  stats: {
    coursesBought: 5,
    courseUnitsCompleted: 34,
    certificates: 2,
    hoursLearned: 18,
  },
  coursesInProgress: [
    {
      id: "c-1", slug: "react-nextjs-expert",
      title: "React & Next.js — De zéro à expert",
      category: "Dev Web", emoji: "⚛️", thumbBg: "#ede9fe",
      currentCourseUnit: 7, totalCourseUnits: 24, progressPct: 29, completed: false,
      lastAccessedAt: "2025-05-26",
    },
    {
      id: "c-2", slug: "python-machine-learning",
      title: "Python & Machine Learning pratique",
      category: "Data Science", emoji: "🐍", thumbBg: "#ecfdf5",
      currentCourseUnit: 12, totalCourseUnits: 18, progressPct: 67, completed: false,
      lastAccessedAt: "2025-05-25",
    },
    {
      id: "c-3", slug: "ux-design-figma",
      title: "UI/UX Design avec Figma",
      category: "Design", emoji: "🎨", thumbBg: "#fdf2f8",
      currentCourseUnit: 20, totalCourseUnits: 20, progressPct: 100, completed: true,
      lastAccessedAt: "2025-05-12",
    },
  ],
  certificates: [
    {
      id: "cert-1", courseTitle: "UI/UX Design avec Figma",
      courseSlug: "ux-design-figma", obtainedAt: "2025-05-12",
      verifyCode: "EFP-2025-UX-001",
    },
    {
      id: "cert-2", courseTitle: "Gestion de projet Agile & Scrum",
      courseSlug: "agile-scrum", obtainedAt: "2025-03-03",
      verifyCode: "EFP-2025-AG-002",
    },
  ],
  wishlist: [
    { id: "w-1", slug: "deep-learning-tensorflow", title: "Deep Learning avec TensorFlow", category: "IA / ML", emoji: "🤖", thumbBg: "#ede9fe", priceUnit: 2900 },
    { id: "w-2", slug: "flutter-dart", title: "Flutter & Dart — Apps mobiles", category: "Mobile", emoji: "📱", thumbBg: "#eff6ff", priceUnit: 2200 },
    { id: "w-3", slug: "cybersecurite-dev", title: "Cybersécurité pour développeurs", category: "Cybersécurité", emoji: "🔐", thumbBg: "#fef2f2", priceUnit: 3500 },
  ],
  recentPurchases: [
    { id: "p-1", courseTitle: "React & Next.js — De zéro à expert", courseSlug: "react-nextjs-expert", amount: 25000, currency: "XAF", purchasedAt: "2025-05-26", type: "cours" },
    { id: "p-2", courseTitle: "Python & ML — Pack courseUnits 1 à 5", courseSlug: "python-machine-learning", amount: 9000, currency: "XAF", purchasedAt: "2025-05-10", type: "forfait" },
    { id: "p-3", courseTitle: "UI/UX Design avec Figma", courseSlug: "ux-design-figma", amount: 15000, currency: "XAF", purchasedAt: "2025-04-18", type: "cours" },
    { id: "p-4", courseTitle: "Node.js & API REST — CourseUnit « JWT & Auth »", courseSlug: "nodejs-api-rest", amount: 1200, currency: "XAF", purchasedAt: "2025-04-02", type: "courseUnit" },
    { id: "p-5", courseTitle: "Abonnement mensuel EduFlex Pro", courseSlug: "", amount: 9900, currency: "XAF", purchasedAt: "2025-03-20", type: "abonnement" },
    { id: "p-6", courseTitle: "Gestion de projet Agile & Scrum", courseSlug: "agile-scrum", amount: 30000, currency: "XAF", purchasedAt: "2025-02-28", type: "cours" },
  ],
};