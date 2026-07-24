import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales — EduFlex Pro",
  description: "Mentions légales et informations sur l'éditeur de la plateforme EduFlex Pro.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "editeur", title: "Éditeur du site",
    body: [
      "Le site et les applications EduFlex Pro sont édités par :",
      ["EduFlex Pro SARL — capital social : 5 000 000 XAF", "Siège social : Rue 1.234, Bastos, Yaoundé, Cameroun", "RCCM : RC/YAO/2024/B/0000", "Email : contact@eduflex.pro — Téléphone : +237 6 00 00 00 00"],
    ],
  },
  {
    id: "directeur", title: "Directeur de la publication",
    body: [
      "La directrice de la publication est la représentante légale d'EduFlex Pro SARL.",
    ],
  },
  {
    id: "hebergement", title: "Hébergement",
    body: [
      "La plateforme est hébergée sur une infrastructure cloud redondante (multi-zones de disponibilité) opérée par des prestataires conformes aux standards de sécurité internationaux. Les contenus statiques et vidéo sont distribués via un réseau CDN mondial.",
    ],
  },
  {
    id: "propriete", title: "Propriété intellectuelle",
    body: [
      "La marque « EduFlex Pro », le logo, la charte graphique et les éléments d'interface sont la propriété exclusive d'EduFlex Pro SARL. Les contenus pédagogiques appartiennent à leurs auteurs respectifs. Toute reproduction non autorisée est interdite.",
    ],
  },
  {
    id: "donnees", title: "Données personnelles",
    body: [
      "Le traitement de vos données personnelles est décrit dans notre Politique de confidentialité. Vous pouvez exercer vos droits à tout moment depuis vos paramètres ou en nous contactant.",
    ],
  },
  {
    id: "cookies", title: "Cookies",
    body: [
      "Le site utilise des cookies pour assurer son bon fonctionnement et mesurer son audience. La gestion de vos préférences est accessible depuis le bandeau de consentement.",
    ],
  },
  {
    id: "litiges", title: "Droit applicable et litiges",
    body: [
      "Les présentes mentions sont régies par le droit en vigueur au Cameroun. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents seront ceux du siège social de l'éditeur.",
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updated="5 juin 2026"
      sections={SECTIONS}
    />
  );
}
