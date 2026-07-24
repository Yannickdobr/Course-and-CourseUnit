package com.eduflex.courseservice;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "CourseUnits")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class CourseUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "CourseUnit_order")
    private Integer order;
    private String title;
    private Integer duration;
    private Double price;
    @com.fasterxml.jackson.annotation.JsonProperty("isFree")
    private Boolean isFree;
    @com.fasterxml.jackson.annotation.JsonProperty("isPreview")
    private Boolean isPreview;
    
    @com.fasterxml.jackson.annotation.JsonProperty("includedInSubscription")
    @Builder.Default
    private Boolean includedInSubscription = true;
    
    private String description;

    /* Objectifs de l'unité & compétences acquises (texte libre, une ligne = un item). */
    @Column(length = 2000)
    private String objectives;
    @Column(length = 2000)
    private String skills;

    /* Type d'unitÃƒÂ© de cours : courseUnit | video | module | paragraphe | quiz | ressource */
    @Builder.Default
    private String type = "courseUnit";

    /* UnitÃƒÂ© parente (un Ã‚Â« module Ã‚Â» contient des unitÃƒÂ©s). null = niveau racine de la section. */
    private UUID parentId;

    /* PrÃƒÂ©requis : ids d'autres unitÃƒÂ©s DU MÃƒÅ ME COURS. Mention informative, non bloquante. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "CourseUnit_prerequisites", joinColumns = @JoinColumn(name = "CourseUnit_id"))
    @Column(name = "prerequisite_id")
    @Builder.Default
    private java.util.List<UUID> prerequisites = new java.util.ArrayList<>();

    /* Débouchés : unités que CETTE unité aide à comprendre (inverse pédagogique). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "CourseUnit_outcomes", joinColumns = @JoinColumn(name = "CourseUnit_id"))
    @Column(name = "outcome_id")
    @Builder.Default
    private java.util.List<UUID> outcomes = new java.util.ArrayList<>();

    /* Chaîne séquentielle définie par le formateur : unité précédente / suivante. */
    private UUID previousUnitId;
    private UUID nextUnitId;

    /* Unité AUTONOME réutilisée : si non-null, cette ligne est une RÉFÉRENCE vers
       l'unité d'origine (originUnitId). La possession/achat se résout sur l'id
       canonique = originUnitId s'il existe, sinon id. Acheter l'unité une fois
       la débloque dans tous les cours où elle est réutilisée. */
    private UUID originUnitId;

    /* ── Champs transients (non persistés) pour la création/édition côté studio ──
       Le frontend envoie un id temporaire (clientId) et les prérequis par clientId ;
       le service les remappe vers les UUID réels après sauvegarde. */
    @Transient
    private String clientId;

    /* clientId de l'unité parente (module) — remappé vers parentId réel après save. */
    @Transient
    private String parentKey;

    @Transient
    @Builder.Default
    private java.util.List<String> prerequisiteKeys = new java.util.ArrayList<>();

    @Transient
    @Builder.Default
    private java.util.List<String> outcomeKeys = new java.util.ArrayList<>();

    @Transient
    private String previousKey;

    @Transient
    private String nextKey;

    @ManyToOne
    @JoinColumn(name = "section_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Section section;

    @OneToMany(mappedBy = "courseUnit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private java.util.List<CourseUnitResource> resources = new java.util.ArrayList<>();
}

