export interface BlogPost {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  emoji: string;
  bg: string;
  author: string;
  authorBg: string;
  date: string;
  read: string;
  featured?: boolean;
  body: string[]; // paragraphes
}

export const BLOG_CATEGORIES = ["Tous", "Apprentissage", "Carrière", "Tech", "Formateurs", "Produit"];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "apprendre-par-courseunit-micro-learning",
    tag: "Apprentissage",
    title: "Apprendre par courseUnit : pourquoi le micro-learning change tout",
    excerpt:
      "L'achat à l'unité n'est pas qu'une question de prix. Découvrez comment le découpage en courseUnits améliore la rétention, la motivation et l'accessibilité.",
    emoji: "📚",
    bg: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    author: "Awa M.", authorBg: "#7C3AED", date: "5 juin 2026", read: "6 min",
    featured: true,
    body: [
      "Le micro-learning consiste à découper une formation en petites unités autonomes, chacune centrée sur un objectif précis. Sur EduFlex Pro, ces unités s'appellent des courseUnits, et vous pouvez les acheter à la carte plutôt que de payer un cours entier.",
      "Ce format n'est pas seulement plus abordable : il colle à la façon dont notre cerveau apprend. Des sessions courtes et ciblées améliorent la rétention et réduisent la surcharge cognitive. On termine une unité, on ressent une progression, et cette motivation nourrit la suivante.",
      "Côté budget, l'achat granulaire élimine le gaspillage : vous ne payez que ce dont vous avez besoin. Un développeur qui maîtrise déjà React peut n'acheter que l'unité « Server Actions » d'un cours Next.js, au lieu de tout le programme.",
      "En pratique, commencez par identifier une compétence précise, achetez l'unité correspondante, puis élargissez au module ou au cours complet si le sujet vous passionne. C'est l'apprentissage à votre rythme, sans engagement inutile.",
    ],
  },
  {
    slug: "5-competences-tech-afrique-francophone-2026",
    tag: "Carrière",
    title: "5 compétences tech les plus demandées en Afrique francophone en 2026",
    excerpt: "Du développement web à la data science, voici les domaines qui recrutent le plus.",
    emoji: "🚀",
    bg: "linear-gradient(135deg,#003d2a,#006644)",
    author: "Koffi M.", authorBg: "#059669", date: "2 juin 2026", read: "5 min",
    body: [
      "Le marché tech francophone accélère, et certaines compétences se démarquent nettement chez les recruteurs en 2026.",
      "1. Le développement web full-stack (React/Next.js côté front, Node ou Spring Boot côté back) reste la porte d'entrée la plus demandée. 2. La data science et le machine learning appliqués (Python, pandas, scikit-learn) explosent avec la digitalisation des entreprises.",
      "3. Le cloud et le DevOps (Docker, CI/CD) deviennent incontournables. 4. La cybersécurité, portée par la multiplication des services en ligne. 5. Le développement mobile, avec une forte demande sur Flutter et React Native.",
      "Le point commun ? Toutes s'apprennent par la pratique et par étapes. Ciblez une compétence, construisez un projet, puis capitalisez unité après unité.",
    ],
  },
  {
    slug: "rester-motive-apprentissage-en-ligne",
    tag: "Apprentissage",
    title: "Comment rester motivé quand on apprend en ligne",
    excerpt: "Des techniques concrètes pour tenir vos objectifs et finir vos cours.",
    emoji: "🎯",
    bg: "linear-gradient(135deg,#3a0030,#8b0050)",
    author: "Fatou N.", authorBg: "#db2777", date: "28 mai 2026", read: "4 min",
    body: [
      "Commencer un cours est facile ; le terminer l'est beaucoup moins. Voici ce qui fait la différence.",
      "Fixez des objectifs minuscules : « finir une unité aujourd'hui » plutôt que « maîtriser le cours ». Chaque unité terminée est une victoire visible qui entretient l'élan.",
      "Bloquez un créneau régulier, même court, et protégez-le. La régularité bat l'intensité. Célébrez les jalons, et n'hésitez pas à alterner les formats (vidéo, lecture, pratique) pour éviter la lassitude.",
      "Enfin, appliquez immédiatement : un mini-projet après chaque module ancre les acquis bien mieux que la relecture passive.",
    ],
  },
  {
    slug: "react-19-ce-qui-change",
    tag: "Tech",
    title: "React 19 : ce qui change pour les développeurs",
    excerpt: "Server Components, Actions et nouveautés à connaître pour rester à jour.",
    emoji: "⚛️",
    bg: "linear-gradient(135deg,#1a1060,#3b2fa0)",
    author: "Koffi M.", authorBg: "#7C3AED", date: "24 mai 2026", read: "8 min",
    body: [
      "React 19 consolide une évolution majeure amorcée avec les Server Components : déplacer une partie du rendu côté serveur pour des applications plus rapides et plus légères côté client.",
      "Les Actions simplifient la gestion des mutations et des formulaires : plus besoin d'orchestrer manuellement états de chargement et erreurs, le framework s'en charge.",
      "De nouveaux hooks accompagnent ce virage, et l'intégration avec des frameworks comme Next.js rend le tout cohérent de bout en bout.",
      "Pour monter à niveau efficacement, procédez par briques : comprenez d'abord la distinction Server/Client Components, puis les Actions, avant d'attaquer le streaming et le caching.",
    ],
  },
  {
    slug: "bien-tarifer-ses-courseunits",
    tag: "Formateurs",
    title: "Bien tarifer ses courseUnits : le guide complet",
    excerpt: "Trouvez le juste prix pour maximiser ventes et satisfaction de vos élèves.",
    emoji: "💰",
    bg: "linear-gradient(135deg,#1a1000,#4a3000)",
    author: "Béatrice Y.", authorBg: "#F97316", date: "20 mai 2026", read: "7 min",
    body: [
      "Fixer le prix de ses unités est un exercice d'équilibre entre valeur perçue, accessibilité et revenus.",
      "Partez de la valeur concrète apportée par chaque unité : une unité qui débloque une compétence directement monétisable justifie un prix plus élevé qu'une introduction générale.",
      "Pensez en modes d'achat : proposez l'unité, le module et le cours complet. Le cours complet doit offrir une remise nette par rapport à la somme des unités, pour récompenser l'engagement.",
      "Testez, mesurez, ajustez. Les statistiques du studio vous montrent ce qui se vend ; itérez sur les prix comme sur le contenu.",
    ],
  },
  {
    slug: "telechargement-hors-ligne-mobile",
    tag: "Produit",
    title: "Nouveauté : téléchargement hors-ligne sur mobile",
    excerpt: "Apprenez partout, même sans connexion, grâce à notre nouvelle fonctionnalité.",
    emoji: "📱",
    bg: "linear-gradient(135deg,#002040,#0055a0)",
    author: "Équipe EduFlex", authorBg: "#7C3AED", date: "15 mai 2026", read: "3 min",
    body: [
      "La connexion ne devrait jamais être un frein à l'apprentissage. C'est pourquoi vous pouvez désormais télécharger vos unités achetées pour les consulter hors-ligne.",
      "Téléchargez chez vous en Wi-Fi, puis apprenez dans les transports, en zone blanche ou en voyage. Votre progression se synchronise dès que vous retrouvez du réseau.",
      "La fonctionnalité respecte vos droits d'accès : seules les unités que vous possédez sont disponibles hors-ligne.",
    ],
  },
  {
    slug: "mobile-money-payer-sa-formation",
    tag: "Apprentissage",
    title: "Mobile Money : payer sa formation n'a jamais été aussi simple",
    excerpt: "Orange Money, MTN MoMo, Wave : on vous explique tout.",
    emoji: "💳",
    bg: "linear-gradient(135deg,#1a0000,#600010)",
    author: "Awa M.", authorBg: "#db2777", date: "10 mai 2026", read: "4 min",
    body: [
      "L'accès à la formation passe aussi par des moyens de paiement adaptés au continent. EduFlex Pro prend en charge le Mobile Money en plus de la carte.",
      "Orange Money, MTN MoMo, Wave : au moment du paiement, choisissez votre opérateur, saisissez votre numéro, validez sur votre téléphone. Le contenu se débloque instantanément.",
      "Pas de carte bancaire nécessaire, pas de frais cachés : le prix affiché est le prix payé.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
