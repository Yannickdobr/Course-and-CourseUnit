package com.eduflex.courseservice;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

/* Projet pédagogique : un formateur associe un projet (énoncé + liens externes + type)
   à une ou plusieurs unités de cours. Peut être publié sur la marketplace de projets (#8). */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Column(length = 2000)
    private String description;

    /* Type de projet : guide | libre | etude_cas | challenge | groupe ... (libre) */
    private String type;

    private String instructor;

    /* Cours d'origine (optionnel) */
    private UUID courseId;
    private String courseSlug;

    /* Marketplace de projets (#8) */
    private double price;
    private boolean published;
    private int purchaseCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /* Liens externes (dépôt Git, énoncé, démo, dataset...). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_links", joinColumns = @JoinColumn(name = "project_id"))
    @Builder.Default
    private List<ProjectLink> links = new ArrayList<>();

    /* Unités de cours associées à ce projet. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_units", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "unit_id")
    @Builder.Default
    private List<UUID> unitIds = new ArrayList<>();
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ProjectLink {
    private String label;
    @Column(length = 1000)
    private String url;
}
