/* ─── Données mock pour l'espace Studio Formateur ───
   À remplacer par des appels API réels (ex: GET /api/studio/analytics). */

export interface MonthPoint {
  month: string;   // "Jan", "Fév"…
  value: number;
}

export interface CourseStat {
  slug: string;
  title: string;
  emoji: string;
  thumbBg: string;
  students: number;
  views: number;
  completionPct: number;
  rating: number;
  revenue: number; // XAF
}

export interface Transaction {
  id: string;
  date: string;        // ISO
  courseTitle: string;
  type: "cours" | "courseUnit" | "forfait" | "abonnement";
  buyer: string;
  gross: number;       // XAF (montant payé par l'apprenant)
  net: number;         // XAF (part formateur, 70%)
}

export interface Withdrawal {
  id: string;
  date: string;        // ISO
  amount: number;      // XAF
  method: "Orange Money" | "MTN MoMo" | "Wave" | "Virement bancaire";
  account: string;     // numéro masqué
  status: "termine" | "en_cours" | "rejete";
}

export interface StudioVideo {
  id: string;
  title: string;
  courseTitle: string;
  duration: number;    // minutes
  size: string;        // ex "248 Mo"
  uploadedAt: string;  // ISO
  status: "publie" | "encodage" | "brouillon";
  views: number;
}

export interface StudioResource {
  id: string;
  name: string;
  courseTitle: string;
  type: "pdf" | "zip" | "lien" | "image";
  size: string;
  downloads: number;
  addedAt: string;
}

/* ─── KPIs globaux ─── */
export const STUDIO_KPIS = {
  totalStudents: 1240,
  studentsDelta: 8.4,        // % vs mois précédent
  totalViews: 48700,
  viewsDelta: 12.1,
  avgRating: 4.8,
  ratingDelta: 0.1,
  avgCompletion: 63,         // %
  completionDelta: -2.3,
  totalRevenue: 1875000,     // XAF cumulés
  monthRevenue: 412500,      // XAF ce mois
  pendingRevenue: 87500,     // XAF en attente de versement
  availableBalance: 325000,  // XAF disponible au retrait
};

/* ─── Séries temporelles (6 derniers mois) ─── */
export const STUDENTS_SERIES: MonthPoint[] = [
  { month: "Jan", value: 142 },
  { month: "Fév", value: 168 },
  { month: "Mar", value: 195 },
  { month: "Avr", value: 210 },
  { month: "Mai", value: 248 },
  { month: "Juin", value: 277 },
];

export const VIEWS_SERIES: MonthPoint[] = [
  { month: "Jan", value: 5200 },
  { month: "Fév", value: 6100 },
  { month: "Mar", value: 7400 },
  { month: "Avr", value: 8050 },
  { month: "Mai", value: 9600 },
  { month: "Juin", value: 12350 },
];

export const REVENUE_SERIES: MonthPoint[] = [
  { month: "Jan", value: 198000 },
  { month: "Fév", value: 242000 },
  { month: "Mar", value: 305000 },
  { month: "Avr", value: 287000 },
  { month: "Mai", value: 351000 },
  { month: "Juin", value: 412500 },
];

/* ─── Performance par cours ─── */
export const COURSE_STATS: CourseStat[] = [
  { slug: "react-nextjs-expert",       title: "React & Next.js — De zéro à expert", emoji: "⚛️", thumbBg: "#ede9fe", students: 480, views: 18900, completionPct: 71, rating: 5.0, revenue: 842000 },
  { slug: "nodejs-api-rest",           title: "Node.js & API REST complète",        emoji: "🟢", thumbBg: "#ecfdf5", students: 360, views: 14200, completionPct: 64, rating: 4.4, revenue: 521000 },
  { slug: "python-machine-learning",   title: "Python & Machine Learning pratique", emoji: "🐍", thumbBg: "#fff7ed", students: 250, views: 9800,  completionPct: 58, rating: 4.6, revenue: 318000 },
  { slug: "ux-design-figma",           title: "UI/UX Design avec Figma",            emoji: "🎨", thumbBg: "#fdf2f8", students: 150, views: 5800,  completionPct: 49, rating: 4.7, revenue: 194000 },
];

/* ─── Transactions récentes ─── */
export const TRANSACTIONS: Transaction[] = [
  { id: "t-1", date: "2025-06-08", courseTitle: "React & Next.js — De zéro à expert", type: "cours",     buyer: "Awa Mbaye",        gross: 25000, net: 17500 },
  { id: "t-2", date: "2025-06-08", courseTitle: "Node.js & API REST complète",        type: "courseUnit",  buyer: "Sékou Traoré",     gross: 1200,  net: 840 },
  { id: "t-3", date: "2025-06-07", courseTitle: "React & Next.js — De zéro à expert", type: "forfait",   buyer: "Nadia Ouédraogo",  gross: 12000, net: 8400 },
  { id: "t-4", date: "2025-06-07", courseTitle: "Python & Machine Learning pratique", type: "abonnement",buyer: "Jean-Baptiste K.", gross: 9900,  net: 6930 },
  { id: "t-5", date: "2025-06-06", courseTitle: "Node.js & API REST complète",        type: "cours",     buyer: "Meriem Bensalem",  gross: 12000, net: 8400 },
  { id: "t-6", date: "2025-06-05", courseTitle: "UI/UX Design avec Figma",            type: "courseUnit",  buyer: "Ibrahim Touré",    gross: 1500,  net: 1050 },
  { id: "t-7", date: "2025-06-04", courseTitle: "React & Next.js — De zéro à expert", type: "courseUnit",  buyer: "Chloé Asante",     gross: 2500,  net: 1750 },
];

/* ─── Historique des retraits ─── */
export const WITHDRAWALS: Withdrawal[] = [
  { id: "w-1", date: "2025-05-28", amount: 300000, method: "Orange Money",      account: "•••• 4821", status: "termine" },
  { id: "w-2", date: "2025-04-30", amount: 250000, method: "MTN MoMo",          account: "•••• 7390", status: "termine" },
  { id: "w-3", date: "2025-06-01", amount: 150000, method: "Wave",              account: "•••• 1205", status: "en_cours" },
  { id: "w-4", date: "2025-03-29", amount: 180000, method: "Virement bancaire", account: "•••• 0042", status: "termine" },
];

/* ─── Vidéos ─── */
export const STUDIO_VIDEOS: StudioVideo[] = [
  { id: "v-1", title: "Introduction & mise en place",          courseTitle: "React & Next.js", duration: 12, size: "184 Mo", uploadedAt: "2025-05-20", status: "publie",   views: 4200 },
  { id: "v-2", title: "Server Components vs Client Components", courseTitle: "React & Next.js", duration: 45, size: "612 Mo", uploadedAt: "2025-05-22", status: "publie",   views: 3100 },
  { id: "v-3", title: "Server Actions & mutations",            courseTitle: "React & Next.js", duration: 50, size: "705 Mo", uploadedAt: "2025-06-07", status: "encodage", views: 0 },
  { id: "v-4", title: "Déploiement Vercel — CI/CD complet",    courseTitle: "React & Next.js", duration: 30, size: "398 Mo", uploadedAt: "2025-06-08", status: "brouillon",views: 0 },
];

/* ─── Ressources ─── */
export const STUDIO_RESOURCES: StudioResource[] = [
  { id: "r-1", name: "Slides — Fondamentaux React.pdf", courseTitle: "React & Next.js", type: "pdf",   size: "2.4 Mo", downloads: 1820, addedAt: "2025-05-20" },
  { id: "r-2", name: "Code source — projet final.zip",  courseTitle: "React & Next.js", type: "zip",   size: "8.1 Mo", downloads: 1450, addedAt: "2025-05-21" },
  { id: "r-3", name: "Repo GitHub (lien)",              courseTitle: "Node.js & API REST", type: "lien",  size: "—",      downloads: 980,  addedAt: "2025-04-12" },
  { id: "r-4", name: "Cheatsheet — Pandas.pdf",         courseTitle: "Python & ML",     type: "pdf",   size: "1.1 Mo", downloads: 720,  addedAt: "2025-03-30" },
];
