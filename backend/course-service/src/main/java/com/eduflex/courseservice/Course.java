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

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "courses")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String slug;
    private String title;
    private String tagline;
    @Column(length = 2000)
    private String description;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_what_you_learn", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "item")
    @Builder.Default
    private List<String> whatYouLearn = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_requirements", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "requirement")
    @Builder.Default
    private List<String> requirements = new ArrayList<>();

    private String targetAudience;
    /* Objectifs du cours & compétences acquises (texte libre, une ligne = un item). */
    @Column(length = 3000)
    private String objectives;
    @Column(length = 3000)
    private String skills;
    private String category;
    private String level;
    private String language;
    private String emoji;
    private String thumbGradient;
    /* Miniature & vidéo d'aperçu : routes média (relatives) ou URLs externes. */
    @Column(length = 1000)
    private String thumbUrl;
    @Column(length = 1000)
    private String previewVideoUrl;
    private String badge;
    private String badgeType;
    private Double price;
    private Double priceUnit;
    private Double rating;
    private Integer reviewCount;
    private Integer studentCount;
    private Integer totalDuration;
    private String lastUpdated;
    private String instructor;
    private String instructorEmail;
    private String instructorSlug;
    private String instructorTitle;
    private String instructorAvatar;
    private String instructorAvatarGradient;
    private Double instructorRating;
    private Integer instructorStudents;
    private Integer instructorCourses;
    private Boolean hasCertificate;
    private Boolean hasDownload;
    private Boolean hasLifetimeAccess;
    private LocalDateTime updatedAt;
    private Boolean published;

    /* Workflow de validation : DRAFT, SUBMITTED, PUBLISHED, REJECTED */
    @Column(length = 20)
    private String validationStatus = "DRAFT";

    @Column(length = 1000)
    private String rejectReason;

    /* Admin (aléatoire) à qui la demande de validation est assignée. */
    private UUID assignedAdminId;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Section> sections = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    /* Nombre total d'unités de cours (lu par le frontend pour le catalogue). Calculé, non persisté. */
    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("courseUnitCount")
    public int getCourseUnitCount() {
        int n = 0;
        if (sections != null) {
            for (Section s : sections) {
                if (s.getCourseUnits() != null) n += s.getCourseUnits().size();
            }
        }
        return n;
    }
}
