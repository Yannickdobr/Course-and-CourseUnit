export type MentorSpeciality =
  | "Dev Web"
  | "Data Science"
  | "Business"
  | "Design"
  | "Mobile"
  | "Cybersécurité"
  | "IA / ML"
  | "Tous";

export interface Mentor {
  id: string;
  slug: string;
  name: string;
  title: string;           // ex : "Formateur & Fondateur"
  speciality: MentorSpeciality;
  avatar: string;          // emoji utilisé comme avatar généré
  avatarGradient: string;  // fond de l'avatar
  bio: string;
  courseCount: number;
  studentCount: number;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  languages: string[];
  isVerified: boolean;
  badge?: string;          // ex : "Top Formateur"
}