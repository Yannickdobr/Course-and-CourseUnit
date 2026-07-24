import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — EduFlex Pro",
  description: "Les conditions générales d'utilisation de la plateforme EduFlex Pro.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "objet", title: "Objet",
    body: [
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme EduFlex Pro, accessible en ligne et via ses applications mobiles. En créant un compte ou en utilisant nos services, vous acceptez sans réserve les présentes conditions.",
    ],
  },
  {
    id: "compte", title: "Compte utilisateur",
    body: [
      "Pour accéder aux contenus payants, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre compte.",
      ["Vous devez avoir au moins 16 ans pour créer un compte.", "Un compte est strictement personnel et non cessible.", "Vous vous engagez à ne pas partager vos accès à des contenus payants."],
    ],
  },
  {
    id: "achats", title: "Achats et accès au contenu",
    body: [
      "EduFlex Pro propose l'achat de courseUnits à l'unité, de forfaits, de cours complets et d'abonnements. Les prix sont indiqués en francs CFA (XAF), toutes taxes comprises.",
      "L'accès au contenu acheté est immédiat après confirmation du paiement et reste disponible à vie pour les achats à l'unité, tant que le compte est actif.",
    ],
  },
  {
    id: "paiement", title: "Paiement",
    body: [
      "Les paiements sont traités par des prestataires sécurisés (Mobile Money, carte bancaire, PayPal). EduFlex Pro ne stocke aucune donnée bancaire complète.",
    ],
  },
  {
    id: "remboursement", title: "Remboursement",
    body: [
      "Vous disposez d'un délai de 30 jours à compter de l'achat pour demander un remboursement, sauf si plus de 50% du contenu acheté a été consulté. Les demandes se font depuis votre espace « Mes achats ».",
    ],
  },
  {
    id: "formateurs", title: "Obligations des formateurs",
    body: [
      "Les formateurs garantissent détenir les droits sur les contenus publiés et s'engagent à fournir un contenu conforme à la grille qualité d'EduFlex Pro. La plateforme prélève une commission de 30% sur chaque vente (20% pour les formateurs Premium).",
    ],
  },
  {
    id: "propriete", title: "Propriété intellectuelle",
    body: [
      "Les contenus restent la propriété de leurs auteurs. L'achat confère un droit d'accès personnel et non exclusif ; toute reproduction, revente ou diffusion non autorisée est interdite et protégée par filigrane dynamique.",
    ],
  },
  {
    id: "responsabilite", title: "Responsabilité",
    body: [
      "EduFlex Pro met tout en œuvre pour assurer la disponibilité du service (objectif 99,9%) mais ne saurait être tenu responsable des interruptions indépendantes de sa volonté ni du contenu publié par les formateurs.",
    ],
  },
  {
    id: "modification", title: "Modification des CGU",
    body: [
      "EduFlex Pro peut modifier les présentes conditions à tout moment. Les utilisateurs sont informés des changements significatifs par email ou notification in-app.",
    ],
  },
];

export default function ConditionsPage() {
  return (
    <LegalPage
      title="Conditions d'utilisation"
      updated="5 juin 2026"
      intro="Bienvenue sur EduFlex Pro. Merci de lire attentivement les conditions ci-dessous qui encadrent l'utilisation de nos services."
      sections={SECTIONS}
    />
  );
}
