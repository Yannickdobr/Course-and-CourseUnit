package com.eduflex.courseservice;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

/* Possession du COURS COMPLET. Donne accès à toutes les unités du cours,
   y compris celles ajoutées plus tard par le formateur (contrairement à l'achat
   à l'unité qui ne débloque que les unités précises achetées). */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "course_ownerships")
public class CourseOwnership {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private UUID courseId;
    private LocalDateTime purchasedAt;
}
