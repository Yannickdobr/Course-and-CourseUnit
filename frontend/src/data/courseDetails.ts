import { CourseDetail } from "@/types/courseDetail";

export const MOCK_COURSE_DETAILS: CourseDetail[] = [
  {
    id: "1",
    slug: "react-nextjs-expert",
    title: "React & Next.js — De zéro à expert",
    tagline: "Maîtrisez le duo React 18 + Next.js 14 et déployez des apps production-ready.",
    description:
      "Ce cours vous emmène de la compréhension des bases de React jusqu'au déploiement d'applications full-stack avec Next.js 14 App Router. Vous apprendrez les Server Components, le streaming, les Server Actions et les meilleures pratiques de performance.",
    whatYouLearn: [
      "Comprendre le modèle mental de React 18 et ses nouveaux hooks",
      "Maîtriser le système de routage App Router de Next.js 14",
      "Créer des Server Components et des Client Components efficacement",
      "Implémenter l'authentification avec NextAuth.js",
      "Optimiser les performances avec les images, fonts et le caching",
      "Déployer sur Vercel avec CI/CD automatique",
    ],
    requirements: [
      "Connaissances de base en HTML, CSS et JavaScript ES6+",
      "Notions de base en programmation (variables, fonctions, boucles)",
    ],
    targetAudience:
      "Développeurs web juniors souhaitant monter en compétence sur l'écosystème React/Next.js et décrocher leur premier poste frontend.",
    category: "Dev Web",
    level: "Intermédiaire",
    language: "Français",
    emoji: "⚛️",
    thumbGradient: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    badge: "Bestseller",
    badgeType: "",
    price: 25000,
    priceUnit: 2500,
    rating: 5.0,
    reviewCount: 847,
    studentCount: 3200,
    totalDuration: 1440,
    lastUpdated: "2025-04-10",
    instructor: "Koffi Mensah",
    instructorSlug: "koffi-mensah",
    instructorTitle: "Expert React & Node.js",
    instructorAvatar: "👨🏿‍💻",
    instructorAvatarGradient: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    instructorRating: 4.9,
    instructorStudents: 4500,
    instructorCourses: 5,
    hasCertificate: true,
    hasDownload: true,
    hasLifetimeAccess: true,
    sections: [
      {
        id: "s1", title: "Fondamentaux React 18", order: 1,
        courseUnits: [
          { id: "c1",  order: 1,  title: "Introduction & mise en place",          duration: 12, price: 0,    isFree: true,  isPreview: true,  description: "Installation de Node.js, VS Code, et création de votre premier projet React." },
          { id: "c2",  order: 2,  title: "JSX & composants fonctionnels",          duration: 28, price: 2500, isFree: false, isPreview: true,  description: "La syntaxe JSX, les règles des composants, et le rendu conditionnel." },
          { id: "c3",  order: 3,  title: "Props & communication entre composants", duration: 22, price: 2500, isFree: false, isPreview: false },
          { id: "c4",  order: 4,  title: "useState & gestion d'état local",        duration: 35, price: 2500, isFree: false, isPreview: false },
          { id: "c5",  order: 5,  title: "useEffect & cycles de vie",              duration: 40, price: 2500, isFree: false, isPreview: false },
          { id: "c6",  order: 6,  title: "useContext & état global léger",         duration: 30, price: 2500, isFree: false, isPreview: false },
        ],
      },
      {
        id: "s2", title: "Next.js 14 App Router", order: 2,
        courseUnits: [
          { id: "c7",  order: 1,  title: "Architecture App Router vs Pages Router", duration: 18, price: 2500, isFree: false, isPreview: false },
          { id: "c8",  order: 2,  title: "Server Components vs Client Components",  duration: 45, price: 3000, isFree: false, isPreview: false, description: "La distinction fondamentale qui change tout dans Next.js 14." },
          { id: "c9",  order: 3,  title: "Layouts imbriqués & templates",           duration: 25, price: 2500, isFree: false, isPreview: false },
          { id: "c10", order: 4,  title: "Route handlers & API routes",             duration: 30, price: 2500, isFree: false, isPreview: false },
          { id: "c11", order: 5,  title: "Server Actions & mutations",              duration: 50, price: 3000, isFree: false, isPreview: false },
          { id: "c12", order: 6,  title: "Streaming & Suspense",                   duration: 35, price: 3000, isFree: false, isPreview: false },
        ],
      },
      {
        id: "s3", title: "Authentification & Sécurité", order: 3,
        courseUnits: [
          { id: "c13", order: 1,  title: "NextAuth.js v5 — configuration",        duration: 40, price: 3000, isFree: false, isPreview: false },
          { id: "c14", order: 2,  title: "OAuth Google & GitHub",                 duration: 35, price: 3000, isFree: false, isPreview: false },
          { id: "c15", order: 3,  title: "Middleware & protection des routes",    duration: 28, price: 2500, isFree: false, isPreview: false },
        ],
      },
      {
        id: "s4", title: "Performance & Déploiement", order: 4,
        courseUnits: [
          { id: "c16", order: 1,  title: "Optimisation images avec next/image",  duration: 20, price: 2500, isFree: false, isPreview: false },
          { id: "c17", order: 2,  title: "Stratégies de caching avancées",       duration: 45, price: 3000, isFree: false, isPreview: false },
          { id: "c18", order: 3,  title: "Déploiement Vercel — CI/CD complet",   duration: 30, price: 2500, isFree: false, isPreview: false },
        ],
      },
    ],
    reviews: [
      {
        id: "r1", author: "Nadia Ouédraogo", initials: "NO",
        avatarGradient: "linear-gradient(135deg,#3a0030,#8b0050)",
        rating: 5, date: "2025-05-15",
        comment: "Cours absolument exceptionnel. La progression est parfaite et les explications sur les Server Components m'ont enfin aidée à comprendre ce concept. J'ai décroché mon premier job frontend deux semaines après avoir terminé ce cours !",
        helpful: 48,
      },
      {
        id: "r2", author: "Jean-Baptiste Kaboré", initials: "JK",
        avatarGradient: "linear-gradient(135deg,#002040,#0055a0)",
        rating: 5, date: "2025-04-28",
        comment: "Koffi explique avec une clarté rare. Chaque courseUnit est bien dosé, pas trop long. La partie Server Actions m'a sauvé des heures de galère. Je recommande sans hésiter.",
        helpful: 34,
      },
      {
        id: "r3", author: "Meriem Bensalem", initials: "MB",
        avatarGradient: "linear-gradient(135deg,#001a2a,#004060)",
        rating: 4, date: "2025-04-10",
        comment: "Très bon cours dans l'ensemble. J'aurais aimé plus d'exercices pratiques sur les hooks personnalisés, mais le contenu sur le routage est excellent. Le format par courseUnit est une vraie bonne idée.",
        helpful: 19,
      },
      {
        id: "r4", author: "Sékou Traoré", initials: "ST",
        avatarGradient: "linear-gradient(135deg,#1a0040,#5c0090)",
        rating: 5, date: "2025-03-22",
        comment: "La meilleure formation React/Next.js en français que j'ai trouvée. Koffi va droit au but, les exemples sont réalistes et directement applicables en entreprise.",
        helpful: 27,
      },
    ],
  },

  {
    id: "2",
    slug: "python-machine-learning",
    title: "Python & Machine Learning pratique",
    tagline: "De NumPy à scikit-learn : construisez et déployez vos premiers modèles ML.",
    description:
      "Une formation complète et pratique pour maîtriser le Machine Learning avec Python. Vous travaillerez sur des datasets réels et apprendrez à entraîner, évaluer et déployer des modèles en production.",
    whatYouLearn: [
      "Manipuler des données avec NumPy, Pandas et Matplotlib",
      "Implémenter les algorithmes ML classiques avec scikit-learn",
      "Évaluer et optimiser des modèles (cross-validation, Grid Search)",
      "Construire des pipelines ML robustes et reproductibles",
      "Déployer un modèle avec FastAPI et Docker",
    ],
    requirements: [
      "Bases en Python (fonctions, listes, dictionnaires)",
      "Notions de mathématiques lycée (algèbre linéaire basique)",
    ],
    targetAudience:
      "Développeurs Python souhaitant entrer dans le monde de la data science et du Machine Learning.",
    category: "Data Science",
    level: "Intermédiaire",
    language: "Français",
    emoji: "🐍",
    thumbGradient: "linear-gradient(135deg,#003d2a,#006644)",
    badge: "Mis à jour",
    badgeType: "new",
    price: 18000,
    priceUnit: 1800,
    rating: 4.6,
    reviewCount: 523,
    studentCount: 2800,
    totalDuration: 1080,
    lastUpdated: "2025-05-01",
    instructor: "Amina Diallo",
    instructorSlug: "amina-diallo",
    instructorTitle: "Data Scientist & ML Engineer",
    instructorAvatar: "👩🏾‍🔬",
    instructorAvatarGradient: "linear-gradient(135deg,#003d2a,#006644)",
    instructorRating: 4.7,
    instructorStudents: 2800,
    instructorCourses: 3,
    hasCertificate: true,
    hasDownload: true,
    hasLifetimeAccess: true,
    sections: [
      {
        id: "s1", title: "Python pour la Data Science", order: 1,
        courseUnits: [
          { id: "c1", order: 1, title: "Environnement Anaconda & Jupyter",   duration: 15, price: 0,    isFree: true,  isPreview: true },
          { id: "c2", order: 2, title: "NumPy — arrays & opérations",        duration: 40, price: 1800, isFree: false, isPreview: true },
          { id: "c3", order: 3, title: "Pandas — DataFrames & nettoyage",    duration: 55, price: 1800, isFree: false, isPreview: false },
          { id: "c4", order: 4, title: "Visualisation avec Matplotlib",      duration: 35, price: 1800, isFree: false, isPreview: false },
        ],
      },
      {
        id: "s2", title: "Algorithmes ML Supervisé", order: 2,
        courseUnits: [
          { id: "c5", order: 1, title: "Régression linéaire & logistique",   duration: 50, price: 1800, isFree: false, isPreview: false },
          { id: "c6", order: 2, title: "Arbres de décision & Random Forest", duration: 45, price: 1800, isFree: false, isPreview: false },
          { id: "c7", order: 3, title: "SVM & KNN",                          duration: 40, price: 1800, isFree: false, isPreview: false },
        ],
      },
      {
        id: "s3", title: "Évaluation & Déploiement", order: 3,
        courseUnits: [
          { id: "c8",  order: 1, title: "Métriques & validation croisée",    duration: 35, price: 1800, isFree: false, isPreview: false },
          { id: "c9",  order: 2, title: "Pipeline scikit-learn",             duration: 40, price: 1800, isFree: false, isPreview: false },
          { id: "c10", order: 3, title: "Déploiement FastAPI + Docker",      duration: 60, price: 1800, isFree: false, isPreview: false },
        ],
      },
    ],
    reviews: [
      {
        id: "r1", author: "Ibrahima Sow", initials: "IS",
        avatarGradient: "linear-gradient(135deg,#003d2a,#006644)",
        rating: 5, date: "2025-05-10",
        comment: "Amina est une pédagogue hors pair. La progression est idéale et le projet final de déploiement est exactement ce que les recruteurs attendent. Merci !",
        helpful: 31,
      },
      {
        id: "r2", author: "Fatima Zahra", initials: "FZ",
        avatarGradient: "linear-gradient(135deg,#3a0030,#8b0050)",
        rating: 4, date: "2025-04-20",
        comment: "Très bon cours. J'aurais aimé une section sur les réseaux de neurones, mais pour le ML classique c'est parfait. Les notebooks Jupyter fournis sont super.",
        helpful: 15,
      },
    ],
  },
];

// Lookup helper
export function getCourseDetail(slug: string): CourseDetail | undefined {
  return MOCK_COURSE_DETAILS.find((c) => c.slug === slug);
}
