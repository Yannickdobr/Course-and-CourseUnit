import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité — EduFlex Pro",
  description: "Comment EduFlex Pro collecte, utilise et protège vos données personnelles (conforme RGPD).",
};

const SECTIONS: LegalSection[] = [
  {
    id: "collecte", title: "Données que nous collectons",
    body: [
      "Nous collectons les données nécessaires au fonctionnement du service :",
      ["Données d'identité : nom, email, pays, langue.", "Données d'usage : cours consultés, progression, notes, certificats.", "Données techniques : adresse IP, type d'appareil, navigateur.", "Données de paiement : traitées par nos prestataires, jamais stockées en clair."],
    ],
  },
  {
    id: "utilisation", title: "Utilisation de vos données",
    body: [
      "Vos données servent à fournir et améliorer nos services :",
      ["Donner accès aux contenus achetés et suivre votre progression.", "Personnaliser les recommandations d'apprentissage.", "Émettre vos factures et certificats.", "Vous envoyer des notifications transactionnelles et, avec votre accord, marketing."],
    ],
  },
  {
    id: "base-legale", title: "Base légale",
    body: [
      "Nous traitons vos données sur la base de l'exécution du contrat (accès aux cours), de votre consentement (communications marketing, recommandations) et de notre intérêt légitime (sécurité, amélioration du service).",
    ],
  },
  {
    id: "partage", title: "Partage des données",
    body: [
      "Vos données ne sont jamais vendues. Elles ne sont partagées qu'avec des sous-traitants nécessaires (hébergement, paiement, emailing) liés par des engagements de confidentialité, et avec les autorités lorsque la loi l'exige.",
    ],
  },
  {
    id: "droits", title: "Vos droits (RGPD)",
    body: [
      "Conformément au RGPD, vous disposez des droits suivants :",
      ["Droit d'accès et de portabilité de vos données.", "Droit de rectification et d'effacement (« droit à l'oubli »).", "Droit de retirer votre consentement à tout moment.", "Droit d'opposition et de limitation du traitement."],
      "Vous pouvez exercer ces droits depuis vos paramètres ou en nous écrivant. Une demande d'export et de suppression est disponible dans la « Zone de danger » de vos paramètres.",
    ],
  },
  {
    id: "securite", title: "Sécurité",
    body: [
      "Vos données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). L'accès aux données sensibles est journalisé et restreint. Nous appliquons les recommandations OWASP et minimisons les données collectées.",
    ],
  },
  {
    id: "cookies", title: "Cookies",
    body: [
      "Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre consentement, des cookies de mesure d'audience. Vous pouvez gérer vos préférences à tout moment.",
    ],
  },
  {
    id: "conservation", title: "Conservation",
    body: [
      "Vos données sont conservées tant que votre compte est actif, puis archivées ou anonymisées conformément aux obligations légales (notamment comptables pour les factures).",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="5 juin 2026"
      intro="Votre vie privée compte. Ce document explique quelles données nous collectons, pourquoi, et comment vous gardez le contrôle."
      sections={SECTIONS}
    />
  );
}
