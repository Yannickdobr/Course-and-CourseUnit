package com.eduflex.courseservice;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.time.LocalDateTime;

@Repository
interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByPublishedTrue();
    List<Course> findByInstructor(String instructor);
}

@Repository
interface WishlistRepository extends JpaRepository<Wishlist, UUID> {
    List<Wishlist> findByUserId(UUID userId);
    java.util.Optional<Wishlist> findByUserIdAndCourseId(UUID userId, UUID courseId);
    void deleteByUserIdAndCourseId(UUID userId, UUID courseId);
}

@Repository
interface SectionRepository extends JpaRepository<Section, UUID> {}

@Repository
interface CourseUnitRepository extends JpaRepository<CourseUnit, UUID> {
    List<CourseUnit> findByParentId(UUID parentId);
}

@Repository
interface CourseUnitVersionRepository extends JpaRepository<CourseUnitVersion, UUID> {}

@Repository
interface UserCompletionRepository extends JpaRepository<UserCompletion, UUID> {
    List<UserCompletion> findByUserId(UUID userId);
    long countByUserIdAndCourseUnitIdIn(UUID userId, List<UUID> CourseUnitIds);
}

@Repository
interface CourseUnitOwnershipRepository extends JpaRepository<CourseUnitOwnership, UUID> {
    java.util.Optional<CourseUnitOwnership> findByUserIdAndCourseUnitIdAndVersion(UUID userId, UUID CourseUnitId, String version);
    List<CourseUnitOwnership> findByUserIdAndCourseUnitId(UUID userId, UUID CourseUnitId);
    List<CourseUnitOwnership> findByUserId(UUID userId);
    boolean existsByCourseUnitIdIn(List<UUID> courseUnitIds);
}

@Repository
interface CourseOwnershipRepository extends JpaRepository<CourseOwnership, UUID> {
    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);
    List<CourseOwnership> findByUserId(UUID userId);
}

@Service
class CourseService {
    private final CourseRepository courseRepository;
    private final UserCompletionRepository userCompletionRepository;
    private final CourseUnitOwnershipRepository CourseUnitOwnershipRepository;
    private final CourseUnitVersionRepository CourseUnitVersionRepository;
    private final CourseUnitRepository CourseUnitRepository;
    private final WishlistRepository wishlistRepository;
    private final CourseOwnershipRepository courseOwnershipRepository;
    private final EmailService emailService;

    public CourseService(CourseRepository courseRepository,
                         UserCompletionRepository userCompletionRepository,
                         CourseUnitOwnershipRepository CourseUnitOwnershipRepository,
                         CourseUnitVersionRepository CourseUnitVersionRepository,
                         CourseUnitRepository CourseUnitRepository,
                         WishlistRepository wishlistRepository,
                         CourseOwnershipRepository courseOwnershipRepository,
                         EmailService emailService) {
        this.courseRepository = courseRepository;
        this.userCompletionRepository = userCompletionRepository;
        this.CourseUnitOwnershipRepository = CourseUnitOwnershipRepository;
        this.CourseUnitVersionRepository = CourseUnitVersionRepository;
        this.CourseUnitRepository = CourseUnitRepository;
        this.wishlistRepository = wishlistRepository;
        this.courseOwnershipRepository = courseOwnershipRepository;
        this.emailService = emailService;
    }

    /* â”€â”€â”€ Liste de souhaits â”€â”€â”€ */
    public List<Course> getWishlistCourses(UUID userId) {
        List<Course> result = new ArrayList<>();
        for (Wishlist w : wishlistRepository.findByUserId(userId)) {
            courseRepository.findById(w.getCourseId()).ifPresent(result::add);
        }
        return result;
    }

    @Transactional
    public void addToWishlist(UUID userId, UUID courseId) {
        if (wishlistRepository.findByUserIdAndCourseId(userId, courseId).isEmpty()) {
            wishlistRepository.save(Wishlist.builder()
                    .userId(userId).courseId(courseId).addedAt(LocalDateTime.now()).build());
        }
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID courseId) {
        wishlistRepository.deleteByUserIdAndCourseId(userId, courseId);
    }

    /* â”€â”€â”€ Cours d'un formateur (studio) â”€â”€â”€ */
    public List<Course> getCoursesByInstructor(String instructor) {
        return courseRepository.findByInstructor(instructor);
    }
    
    @Cacheable(value = "courses", key = "#id")
    public Course getCourseById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
    }
    
    @Cacheable(value = "all_courses")
    public List<Course> getAllPublishedCourses() {
        return courseRepository.findByPublishedTrue();
    }
    
    @Transactional
    @CacheEvict(value = {"courses", "all_courses"}, allEntries = true)
    public Course createCourse(Course course) {
        course.setUpdatedAt(LocalDateTime.now());
        wireGraph(course);
        Course saved = courseRepository.save(course);
        return remapPrerequisites(saved);
    }

    @Transactional
    @CacheEvict(value = {"courses", "all_courses"}, allEntries = true)
    public Course updateCourse(UUID id, Course details) {
        /* IMPORTANT : charger une instance MANAGÉE (pas la version @Cacheable détachée),
           sinon courseRepository.save() ferait un merge() renvoyant une COPIE où les champs
           @Transient (clientId, prerequisiteKeys, …) sont perdus → le remap des prérequis
           échouerait silencieusement. */
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        course.setTitle(details.getTitle());
        course.setTagline(details.getTagline());
        course.setDescription(details.getDescription());
        course.setCategory(details.getCategory());
        course.setLevel(details.getLevel());
        course.setLanguage(details.getLanguage());
        course.setEmoji(details.getEmoji());
        course.setThumbGradient(details.getThumbGradient());
        course.setThumbUrl(details.getThumbUrl());
        course.setPreviewVideoUrl(details.getPreviewVideoUrl());
        course.setObjectives(details.getObjectives());
        course.setSkills(details.getSkills());
        if (details.getInstructorEmail() != null) course.setInstructorEmail(details.getInstructorEmail());
        course.setPrice(details.getPrice() != null ? details.getPrice() : 0.0);
        course.setPriceUnit(details.getPriceUnit() != null ? details.getPriceUnit() : 0.0);
        course.setTotalDuration(details.getTotalDuration() != null ? details.getTotalDuration() : 0);
        course.setHasCertificate(details.getHasCertificate() != null ? details.getHasCertificate() : false);
        course.setHasDownload(details.getHasDownload() != null ? details.getHasDownload() : false);
        course.setHasLifetimeAccess(details.getHasLifetimeAccess() != null ? details.getHasLifetimeAccess() : false);
        if (details.getPublished() != null) {
            course.setPublished(details.getPublished());
        }
        course.setUpdatedAt(LocalDateTime.now());
        
        if (details.getValidationStatus() != null) {
            course.setValidationStatus(details.getValidationStatus());
            // Si le cours est resoumis ou repassé en brouillon, on efface la raison du rejet
            if ("SUBMITTED".equals(details.getValidationStatus()) || "DRAFT".equals(details.getValidationStatus())) {
                course.setRejectReason(null);
            }
        }
        // Assignation de l'admin relecteur (choisi aléatoirement côté client lors de la soumission)
        if (details.getAssignedAdminId() != null) {
            course.setAssignedAdminId(details.getAssignedAdminId());
        }

        /* ── Synchronisation des unités EN PLACE (par id) ──
           Le studio renvoie chaque unité existante avec clientId = son UUID serveur.
           On met à jour l'unité existante SANS la recréer → les achats (CourseUnitOwnership)
           et la progression (UserCompletion) qui référencent son id sont préservés. */
        if (course.getSections() == null) {
            course.setSections(new java.util.ArrayList<>());
        }

        // Index des unités existantes par id (toutes sections confondues)
        java.util.Map<UUID, CourseUnit> existingById = new java.util.HashMap<>();
        for (Section sec : course.getSections()) {
            if (sec.getCourseUnits() == null) continue;
            for (CourseUnit u : sec.getCourseUnits()) existingById.put(u.getId(), u);
        }

        // Section hôte pour les NOUVELLES unités : on réutilise la 1re, sinon on en crée une
        Section host;
        java.util.List<Section> incomingSections = details.getSections();
        if (!course.getSections().isEmpty()) {
            host = course.getSections().get(0);
            if (incomingSections != null && !incomingSections.isEmpty() && incomingSections.get(0).getTitle() != null) {
                host.setTitle(incomingSections.get(0).getTitle());
            }
        } else {
            host = Section.builder().title("Contenu du cours").order(1).build();
            host.setCourse(course);
            course.getSections().add(host);
        }

        // Unités entrantes, à plat
        java.util.List<CourseUnit> incomingUnits = new java.util.ArrayList<>();
        if (incomingSections != null) {
            for (Section sec : incomingSections) {
                if (sec.getCourseUnits() != null) incomingUnits.addAll(sec.getCourseUnits());
            }
        }

        java.util.Set<UUID> keptIds = new java.util.HashSet<>();
        int order = 1;
        for (CourseUnit in : incomingUnits) {
            UUID exId = tryParseUuid(in.getClientId());
            CourseUnit existing = exId != null ? existingById.get(exId) : null;
            if (existing != null) {
                existing.setTitle(in.getTitle());
                existing.setOrder(in.getOrder() != null ? in.getOrder() : order);
                existing.setDuration(in.getDuration() != null ? in.getDuration() : 0);
                existing.setPrice(in.getPrice() != null ? in.getPrice() : 0.0);
                existing.setIsFree(in.getIsFree() != null ? in.getIsFree() : false);
                existing.setIsPreview(in.getIsPreview() != null ? in.getIsPreview() : false);
                existing.setIncludedInSubscription(in.getIncludedInSubscription() != null ? in.getIncludedInSubscription() : true);
                existing.setDescription(in.getDescription());
                existing.setObjectives(in.getObjectives());
                existing.setSkills(in.getSkills());
                existing.setType(in.getType());
                existing.setOriginUnitId(in.getOriginUnitId());
                // Clés du graphe (ré-résolues par remapPrerequisites)
                existing.setClientId(in.getClientId());
                existing.setParentKey(in.getParentKey());
                existing.setPrerequisiteKeys(in.getPrerequisiteKeys());
                existing.setOutcomeKeys(in.getOutcomeKeys());
                existing.setPreviousKey(in.getPreviousKey());
                existing.setNextKey(in.getNextKey());
                existing.setParentId(null);
                existing.setPreviousUnitId(null);
                existing.setNextUnitId(null);
                // Ressources : remplacement complet
                if (existing.getResources() == null) existing.setResources(new java.util.ArrayList<>());
                existing.getResources().clear();
                if (in.getResources() != null) {
                    for (CourseUnitResource r : in.getResources()) {
                        r.setId(null);
                        r.setCourseUnit(existing);
                        existing.getResources().add(r);
                    }
                }
                keptIds.add(exId);
            } else {
                in.setId(null);
                if (in.getOrder() == null) in.setOrder(order);
                if (in.getDuration() == null) in.setDuration(0);
                if (in.getPrice() == null) in.setPrice(0.0);
                if (in.getIsFree() == null) in.setIsFree(false);
                if (in.getIsPreview() == null) in.setIsPreview(false);
                if (in.getIncludedInSubscription() == null) in.setIncludedInSubscription(true);
                in.setSection(host);
                host.getCourseUnits().add(in);
            }
            order++;
        }

        // Suppression (orphanRemoval) des unités existantes absentes du payload
        for (Section sec : course.getSections()) {
            if (sec.getCourseUnits() == null) continue;
            sec.getCourseUnits().removeIf(u -> u.getId() != null && !keptIds.contains(u.getId()));
        }
        // Suppression des sections devenues vides (sauf l'hôte)
        final Section hostRef = host;
        course.getSections().removeIf(sec -> sec != hostRef && (sec.getCourseUnits() == null || sec.getCourseUnits().isEmpty()));

        wireGraph(course);
        /* saveAndFlush sur l'instance managée : les nouvelles unités reçoivent leur UUID
           (générateur pré-insert) sur LES MÊMES instances, qui conservent leur clientId. */
        courseRepository.saveAndFlush(course);
        return remapPrerequisites(course);
    }

    /* Parse un UUID, ou null si la chaîne n'en est pas un (ex : clientId temporaire "u-…"). */
    private static UUID tryParseUuid(String s) {
        if (s == null || s.isBlank()) return null;
        try { return UUID.fromString(s); } catch (IllegalArgumentException e) { return null; }
    }

    @Transactional
    @CacheEvict(value = {"courses", "all_courses"}, allEntries = true)
    public Course validateCourse(UUID id, String status, String reason) {
        Course course = getCourseById(id);
        course.setValidationStatus(status);
        if ("REJECTED".equals(status)) {
            course.setRejectReason(reason);
            course.setPublished(false);
        } else if ("PUBLISHED".equals(status)) {
            course.setRejectReason(null);
            course.setPublished(true);
        }
        course.setUpdatedAt(LocalDateTime.now());
        Course saved = courseRepository.save(course);

        // Notifie le formateur par e-mail du resultat de la validation.
        if ("REJECTED".equals(status)) {
            emailService.send(saved.getInstructorEmail(),
                    "Votre cours a ete refuse : " + saved.getTitle(),
                    "<p>Bonjour,</p><p>Votre cours <strong>" + saved.getTitle() + "</strong> n'a pas ete publie.</p>"
                    + "<p><strong>Motif :</strong> " + (reason != null ? reason : "(non precise)") + "</p>"
                    + "<p>Vous pouvez le corriger dans votre studio puis le resoumettre.</p>");
        } else if ("PUBLISHED".equals(status)) {
            emailService.send(saved.getInstructorEmail(),
                    "Votre cours est en ligne : " + saved.getTitle(),
                    "<p>Bonjour,</p><p>Bonne nouvelle : votre cours <strong>" + saved.getTitle()
                    + "</strong> a ete valide et est desormais visible au catalogue.</p>");
        }
        return saved;
    }

    /* Relie course → sections → unités → ressources avant persistance. */
    private void wireGraph(Course course) {
        if (course.getSections() == null) return;
        for (Section sec : course.getSections()) {
            sec.setCourse(course);
            if (sec.getCourseUnits() != null) {
                for (CourseUnit ch : sec.getCourseUnits()) {
                    ch.setSection(sec);
                    if (ch.getResources() != null) {
                        for (CourseUnitResource res : ch.getResources()) {
                            res.setCourseUnit(ch);
                        }
                    }
                }
            }
        }
    }

    /* Remappe les prérequis envoyés par clientId vers les UUID réels générés. */
    private Course remapPrerequisites(Course saved) {
        java.util.Map<String, UUID> idByClient = new java.util.HashMap<>();
        if (saved.getSections() != null) {
            for (Section sec : saved.getSections()) {
                if (sec.getCourseUnits() == null) continue;
                for (CourseUnit ch : sec.getCourseUnits()) {
                    if (ch.getClientId() != null && !ch.getClientId().isBlank()) {
                        idByClient.put(ch.getClientId(), ch.getId());
                    }
                }
            }
        }
        if (idByClient.isEmpty()) return saved;
        boolean changed = false;
        for (Section sec : saved.getSections()) {
            if (sec.getCourseUnits() == null) continue;
            for (CourseUnit ch : sec.getCourseUnits()) {
                java.util.List<String> keys = ch.getPrerequisiteKeys();
                if (keys != null && !keys.isEmpty()) {
                    java.util.List<UUID> resolved = new java.util.ArrayList<>();
                    for (String key : keys) {
                        UUID u = idByClient.get(key);
                        if (u != null) resolved.add(u);
                    }
                    ch.setPrerequisites(resolved);
                    changed = true;
                }
                // Débouchés
                java.util.List<String> oKeys = ch.getOutcomeKeys();
                if (oKeys != null && !oKeys.isEmpty()) {
                    java.util.List<UUID> resolved = new java.util.ArrayList<>();
                    for (String key : oKeys) {
                        UUID u = idByClient.get(key);
                        if (u != null) resolved.add(u);
                    }
                    ch.setOutcomes(resolved);
                    changed = true;
                }
                // Unité parente (module)
                if (ch.getParentKey() != null && !ch.getParentKey().isBlank()) {
                    UUID p = idByClient.get(ch.getParentKey());
                    if (p != null) { ch.setParentId(p); changed = true; }
                }
                // Chaîne séquentielle Avant / Après
                if (ch.getPreviousKey() != null && !ch.getPreviousKey().isBlank()) {
                    UUID p = idByClient.get(ch.getPreviousKey());
                    if (p != null) { ch.setPreviousUnitId(p); changed = true; }
                }
                if (ch.getNextKey() != null && !ch.getNextKey().isBlank()) {
                    UUID n = idByClient.get(ch.getNextKey());
                    if (n != null) { ch.setNextUnitId(n); changed = true; }
                }
            }
        }
        return changed ? courseRepository.save(saved) : saved;
    }

    public boolean hasAccessToCourseUnitVersion(UUID userId, UUID CourseUnitId, String version,
                                             boolean hasActiveSubscription, boolean hasB2bAccess, boolean isAuditMode) {
        if (isAuditMode) {
            return true;
        }

        if (hasB2bAccess) {
            return true;
        }

        /* Modèle marketplace : pas d'abonnement. Le contenu est accessible s'il est
           gratuit / en aperçu, ou s'il a été acheté (à l'unité / module / cours). */
        CourseUnit unit = CourseUnitRepository.findById(CourseUnitId).orElse(null);
        if (unit != null && (Boolean.TRUE.equals(unit.getIsFree()) || Boolean.TRUE.equals(unit.getIsPreview()))) {
            return true;
        }

        /* Possession du cours complet : débloque toutes ses unités (même futures). */
        if (unit != null && unit.getSection() != null && unit.getSection().getCourse() != null
                && courseOwnershipRepository.existsByUserIdAndCourseId(userId, unit.getSection().getCourse().getId())) {
            return true;
        }

        /* Résolution sur l'id canonique : une unité réutilisée hérite de l'achat de son origine. */
        UUID canon = canonicalUnitId(CourseUnitId);

        java.util.Optional<CourseUnitOwnership> ownership = CourseUnitOwnershipRepository.findByUserIdAndCourseUnitIdAndVersion(userId, canon, version);
        if (ownership.isPresent()) {
            return true;
        }

        List<CourseUnitOwnership> pastOwnerships = CourseUnitOwnershipRepository.findByUserIdAndCourseUnitId(userId, canon);
        if (!pastOwnerships.isEmpty()) {
            String majorVersion = version.split("\\.")[0];
            for (CourseUnitOwnership po : pastOwnerships) {
                if (po.getVersion().startsWith(majorVersion)) {
                    return true;
                }
            }
        }

        return false;
    }

    public double getCourseProgression(UUID userId, UUID courseId) {
        Course course = getCourseById(courseId);
        List<UUID> CourseUnitIds = new ArrayList<>();
        if (course.getSections() != null) {
            for (Section sec : course.getSections()) {
                if (sec.getCourseUnits() != null) {
                    for (CourseUnit ch : sec.getCourseUnits()) {
                        CourseUnitIds.add(ch.getId());
                    }
                }
            }
        }

        if (CourseUnitIds.isEmpty()) {
            return 0.0;
        }

        long completedCount = userCompletionRepository.countByUserIdAndCourseUnitIdIn(userId, CourseUnitIds);
        return (double) completedCount / CourseUnitIds.size();
    }

    @Transactional
    public void createCourseUnitVersion(UUID CourseUnitId, String versionNumber, String title, double price, String description, int duration) {
        CourseUnit ch = CourseUnitRepository.findById(CourseUnitId)
                .orElseThrow(() -> new RuntimeException("CourseUnit not found"));

        CourseUnitVersion cv = CourseUnitVersion.builder()
                .courseUnitId(CourseUnitId)
                .version(versionNumber)
                .title(title)
                .price(price)
                .description(description)
                .duration(duration)
                .createdAt(LocalDateTime.now())
                .status("VERSION_PUBLIEE")
                .build();

        CourseUnitVersionRepository.save(cv);

        ch.setTitle(title);
        ch.setPrice(price);
        ch.setDescription(description);
        ch.setDuration(duration);
        CourseUnitRepository.save(ch);
    }

    @Transactional
    public void toggleCourseUnitCompletion(UUID userId, UUID CourseUnitId, boolean completed) {
        java.util.List<UserCompletion> existing = userCompletionRepository.findByUserId(userId);
        UserCompletion found = null;
        for (UserCompletion uc : existing) {
            if (uc.getCourseUnitId().equals(CourseUnitId)) {
                found = uc;
                break;
            }
        }
        if (completed && found == null) {
            userCompletionRepository.save(UserCompletion.builder()
                    .userId(userId)
                    .courseUnitId(CourseUnitId)
                    .completedAt(LocalDateTime.now())
                    .build());
        } else if (!completed && found != null) {
            userCompletionRepository.delete(found);
        }
    }

    public java.util.List<UUID> getUserCompletions(UUID userId) {
        java.util.List<UUID> list = new java.util.ArrayList<>();
        for (UserCompletion uc : userCompletionRepository.findByUserId(userId)) {
            list.add(uc.getCourseUnitId());
        }
        return list;
    }

    /* Id canonique d'une unité : son origine si c'est une référence réutilisée, sinon elle-même.
       Toute possession/achat est stockée et vérifiée sur cet id, donc acheter l'unité une seule
       fois la débloque dans tous les cours où elle est réutilisée. */
    private UUID canonicalUnitId(CourseUnit u) {
        return u.getOriginUnitId() != null ? u.getOriginUnitId() : u.getId();
    }
    private UUID canonicalUnitId(UUID unitId) {
        return CourseUnitRepository.findById(unitId).map(this::canonicalUnitId).orElse(unitId);
    }

    /* Accorde la possession d'une unité (idempotent). */
    private void grantOwnership(UUID userId, UUID unitId) {
        if (CourseUnitOwnershipRepository.findByUserIdAndCourseUnitIdAndVersion(userId, unitId, "1.0").isEmpty()) {
            CourseUnitOwnershipRepository.save(CourseUnitOwnership.builder()
                    .userId(userId).courseUnitId(unitId).version("1.0")
                    .purchasedAt(LocalDateTime.now()).build());
        }
    }

    @Transactional
    public void enrollUser(UUID userId, UUID courseId, UUID courseUnitId, UUID moduleId) {
        if (courseId != null) {
            /* MODE 1 — cours complet : possession du COURS (couvre aussi les futures unités)
               + possession de chaque unité actuelle (sur leur id canonique). */
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            if (!courseOwnershipRepository.existsByUserIdAndCourseId(userId, courseId)) {
                courseOwnershipRepository.save(CourseOwnership.builder()
                        .userId(userId).courseId(courseId).purchasedAt(LocalDateTime.now()).build());
            }
            if (course.getSections() != null) {
                for (Section sec : course.getSections()) {
                    if (sec.getCourseUnits() != null) {
                        for (CourseUnit ch : sec.getCourseUnits()) grantOwnership(userId, canonicalUnitId(ch));
                    }
                }
            }
        } else if (moduleId != null) {
            /* MODE 3 — par module : le module + ses unités enfants */
            grantOwnership(userId, canonicalUnitId(moduleId));
            for (CourseUnit child : CourseUnitRepository.findByParentId(moduleId)) {
                grantOwnership(userId, canonicalUnitId(child));
            }
        } else if (courseUnitId != null) {
            /* MODE 2 — à l'unité (achat individuel, y compris unité autonome) */
            grantOwnership(userId, canonicalUnitId(courseUnitId));
        }
    }

    /* Carte d'accès de l'apprenant pour un cours : possède-t-il le cours complet,
       et quels ids d'unités (payantes) a-t-il achetés. Le frontend y ajoute les
       unités gratuites / en aperçu. */
    public java.util.Map<String, Object> getCourseAccess(UUID userId, UUID courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        boolean full = courseOwnershipRepository.existsByUserIdAndCourseId(userId, courseId);
        java.util.List<String> unitIds = new java.util.ArrayList<>();
        if (course != null && course.getSections() != null) {
            for (Section sec : course.getSections()) {
                if (sec.getCourseUnits() == null) continue;
                for (CourseUnit u : sec.getCourseUnits()) {
                    UUID canon = canonicalUnitId(u);
                    if (!CourseUnitOwnershipRepository.findByUserIdAndCourseUnitId(userId, canon).isEmpty()) {
                        unitIds.add(u.getId().toString());
                    }
                }
            }
        }
        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("fullCourse", full);
        res.put("unitIds", unitIds);
        return res;
    }

    /* Suppression : autorisée uniquement si aucune unité du cours n'a été achetée. */
    @Transactional
    @CacheEvict(value = {"courses", "all_courses"}, allEntries = true)
    public void deleteCourse(UUID id) {
        Course course = getCourseById(id);
        List<UUID> unitIds = new ArrayList<>();
        if (course.getSections() != null) {
            for (Section sec : course.getSections()) {
                if (sec.getCourseUnits() != null) {
                    for (CourseUnit ch : sec.getCourseUnits()) unitIds.add(ch.getId());
                }
            }
        }
        if (!unitIds.isEmpty() && CourseUnitOwnershipRepository.existsByCourseUnitIdIn(unitIds)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Ce cours a déjà été acheté : il ne peut pas être supprimé, seulement désactivé.");
        }
        courseRepository.deleteById(id);
    }

    public java.util.List<Course> getEnrolledCourses(UUID userId) {
        java.util.Set<UUID> ownedCourseUnitIds = new java.util.HashSet<>();
        for (CourseUnitOwnership co : CourseUnitOwnershipRepository.findByUserId(userId)) {
            ownedCourseUnitIds.add(co.getCourseUnitId());
        }
        
        java.util.List<Course> allCourses = courseRepository.findAll();
        java.util.List<Course> enrolled = new java.util.ArrayList<>();
        for (Course c : allCourses) {
            boolean hasOwnership = false;
            if (c.getSections() != null) {
                for (Section s : c.getSections()) {
                    if (s.getCourseUnits() != null) {
                        for (CourseUnit ch : s.getCourseUnits()) {
                            if (ownedCourseUnitIds.contains(canonicalUnitId(ch))) {
                                hasOwnership = true;
                                break;
                            }
                        }
                    }
                    if (hasOwnership) break;
                }
            }
            if (hasOwnership) {
                enrolled.add(c);
            }
        }
        return enrolled;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /* Bibliothèque d'unités réutilisables : unités originales (non-références) qu'un formateur
       peut réutiliser dans un autre cours. Construite à partir des cours existants — aucune
       dépendance de schéma. Filtrée par formateur si fourni. */
    public List<java.util.Map<String, Object>> getReusableUnits(String instructor) {
        List<java.util.Map<String, Object>> out = new ArrayList<>();
        for (Course c : courseRepository.findAll()) {
            if (instructor != null && !instructor.isBlank() && !instructor.equals(c.getInstructor())) continue;
            if (c.getSections() == null) continue;
            for (Section sec : c.getSections()) {
                if (sec.getCourseUnits() == null) continue;
                for (CourseUnit u : sec.getCourseUnits()) {
                    if (u.getOriginUnitId() != null) continue;   // ne lister que les originaux
                    if ("module".equals(u.getType())) continue;  // un module n'est pas une unité atomique réutilisable
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", u.getId());
                    m.put("title", u.getTitle());
                    m.put("type", u.getType());
                    m.put("price", u.getPrice());
                    m.put("duration", u.getDuration());
                    m.put("description", u.getDescription());
                    m.put("courseTitle", c.getTitle());
                    m.put("courseSlug", c.getSlug());
                    m.put("instructor", c.getInstructor());
                    out.add(m);
                }
            }
        }
        return out;
    }

    @Transactional
    public Course togglePublish(UUID id, boolean published) {
        Course course = getCourseById(id);
        course.setPublished(published);
        return courseRepository.save(course);
    }
}

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<Course> getCourses() {
        return courseService.getAllPublishedCourses();
    }

    @GetMapping("/{id}")
    public Course getCourse(@PathVariable UUID id) {
        return courseService.getCourseById(id);
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable UUID id, @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }

    @GetMapping("/progress")
    public double getProgress(@RequestParam UUID userId, @RequestParam UUID courseId) {
        return courseService.getCourseProgression(userId, courseId);
    }

    @GetMapping("/access")
    public boolean checkAccess(@RequestParam UUID userId,
                               @RequestParam UUID courseUnitId,
                               @RequestParam String version,
                               @RequestParam(defaultValue = "false") boolean hasActiveSubscription,
                               @RequestParam(defaultValue = "false") boolean hasB2bAccess,
                               @RequestParam(defaultValue = "false") boolean isAuditMode) {
        return courseService.hasAccessToCourseUnitVersion(userId, courseUnitId, version, hasActiveSubscription, hasB2bAccess, isAuditMode);
    }

    @PostMapping("/completions")
    public void toggleCompletion(@RequestParam UUID userId, @RequestParam UUID courseUnitId, @RequestParam boolean completed) {
        courseService.toggleCourseUnitCompletion(userId, courseUnitId, completed);
    }

    @GetMapping("/completions")
    public java.util.List<UUID> getCompletions(@RequestParam UUID userId) {
        return courseService.getUserCompletions(userId);
    }

    @PostMapping("/enroll")
    public void enrollUser(@RequestParam UUID userId,
                           @RequestParam(required = false) UUID courseId,
                           @RequestParam(required = false) UUID courseUnitId,
                           @RequestParam(required = false) UUID moduleId) {
        courseService.enrollUser(userId, courseId, courseUnitId, moduleId);
    }

    /* Carte d'accès de l'apprenant pour un cours (cours complet ? + unités achetées). */
    @GetMapping("/access-map")
    public java.util.Map<String, Object> accessMap(@RequestParam UUID userId, @RequestParam UUID courseId) {
        return courseService.getCourseAccess(userId, courseId);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
    }

    @GetMapping("/enrolled")
    public List<Course> getEnrolledCourses(@RequestParam UUID userId) {
        return courseService.getEnrolledCourses(userId);
    }

    @GetMapping("/all")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PutMapping("/{id}/publish")
    public Course togglePublish(@PathVariable UUID id, @RequestParam boolean published) {
        return courseService.togglePublish(id, published);
    }

    @PutMapping("/{id}/validate")
    public Course validateCourse(@PathVariable UUID id, @RequestParam String status, @RequestParam(required = false) String reason) {
        return courseService.validateCourse(id, status, reason);
    }

    /* â”€â”€â”€ Liste de souhaits â”€â”€â”€ */
    @GetMapping("/wishlist")
    public List<Course> getWishlist(@RequestParam UUID userId) {
        return courseService.getWishlistCourses(userId);
    }

    @PostMapping("/wishlist")
    public void addWishlist(@RequestParam UUID userId, @RequestParam UUID courseId) {
        courseService.addToWishlist(userId, courseId);
    }

    @DeleteMapping("/wishlist")
    public void removeWishlist(@RequestParam UUID userId, @RequestParam UUID courseId) {
        courseService.removeFromWishlist(userId, courseId);
    }

    /* â”€â”€â”€ Cours d'un formateur â”€â”€â”€ */
    @GetMapping("/instructor")
    public List<Course> getByInstructor(@RequestParam String name) {
        return courseService.getCoursesByInstructor(name);
    }

    /* â”€â”€â”€ BibliothÃ¨que d'unitÃ©s rÃ©utilisables (unitÃ©s autonomes) â”€â”€â”€ */
    @GetMapping("/units/library")
    public List<java.util.Map<String, Object>> getReusableUnits(@RequestParam(required = false) String instructor) {
        return courseService.getReusableUnits(instructor);
    }
}

@org.springframework.context.annotation.Configuration
class CourseDataSeeder {
    @org.springframework.context.annotation.Bean
    org.springframework.boot.CommandLineRunner initData(CourseRepository repository, CourseUnitRepository CourseUnitRepo) {
        return args -> {
            if (repository.count() == 0) {
                Course reactCourse = Course.builder()
                        .slug("react-nextjs-expert")
                        .title("React & Next.js â€” De zÃ©ro Ã  expert")
                        .tagline("MaÃ®trisez le duo React 18 + Next.js 14 et dÃ©ployez des apps production-ready.")
                        .description("Ce cours vous emmÃ¨ne de la comprÃ©hension des bases de React jusqu'au dÃ©ploiement d'applications full-stack avec Next.js 14 App Router. Vous apprendrez les Server Components, le streaming, les Server Actions et les meilleures pratiques de performance.")
                        .category("Dev Web")
                        .level("IntermÃ©diaire")
                        .language("FranÃ§ais")
                        .emoji("âš›ï¸ ")
                        .thumbGradient("linear-gradient(135deg,#1a1060,#3b2fa0)")
                        .badge("Bestseller")
                        .badgeType("")
                        .price(25000.0)
                        .priceUnit(2500.0)
                        .rating(5.0)
                        .reviewCount(847)
                        .studentCount(3200)
                        .totalDuration(1440)
                        .lastUpdated("2025-04-10")
                        .instructor("Koffi Mensah")
                        .instructorSlug("koffi-mensah")
                        .instructorTitle("Expert React & Node.js")
                        .instructorAvatar("ðŸ‘¨ðŸ ¿â€ ðŸ’»")
                        .instructorAvatarGradient("linear-gradient(135deg,#1a1060,#3b2fa0)")
                        .instructorRating(4.9)
                        .instructorStudents(4500)
                        .instructorCourses(5)
                        .hasCertificate(true)
                        .hasDownload(true)
                        .hasLifetimeAccess(true)
                        .published(true)
                        .updatedAt(LocalDateTime.now())
                        .whatYouLearn(java.util.List.of(
                            "Comprendre le modÃ¨le mental de React 18 et ses nouveaux hooks",
                            "MaÃ®triser le systÃ¨me de routage App Router de Next.js 14",
                            "CrÃ©er des Server Components et des Client Components efficacement",
                            "ImplÃ©menter l'authentification avec NextAuth.js",
                            "Optimiser les performances avec les images, fonts et le caching",
                            "DÃ©ployer sur Vercel avec CI/CD automatique"
                        ))
                        .requirements(java.util.List.of(
                            "Connaissances de base en HTML, CSS et JavaScript ES6+",
                            "Notions de base en programmation (variables, fonctions, boucles)"
                        ))
                        .targetAudience("DÃ©veloppeurs web juniors souhaitant monter en compÃ©tence sur l'Ã©cosystÃ¨me React/Next.js.")
                        .build();

                Section s1 = Section.builder().title("Fondamentaux React 18").order(1).course(reactCourse).build();
                s1.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("Introduction & mise en place").duration(12).price(0.0).isFree(true).isPreview(true).description("Installation de Node.js, VS Code, et crÃ©ation de votre premier projet React.").section(s1).build(),
                    CourseUnit.builder().order(2).title("JSX & composants fonctionnels").duration(28).price(2500.0).isFree(false).isPreview(true).description("La syntaxe JSX, les rÃ¨gles des composants, et le rendu conditionnel.").section(s1).build(),
                    CourseUnit.builder().order(3).title("Props & communication entre composants").duration(22).price(2500.0).isFree(false).isPreview(false).section(s1).build(),
                    CourseUnit.builder().order(4).title("useState & gestion d'Ã©tat local").duration(35).price(2500.0).isFree(false).isPreview(false).section(s1).build(),
                    CourseUnit.builder().order(5).title("useEffect & cycles de vie").duration(40).price(2500.0).isFree(false).isPreview(false).section(s1).build(),
                    CourseUnit.builder().order(6).title("useContext & Ã©tat global lÃ©ger").duration(30).price(2500.0).isFree(false).isPreview(false).section(s1).build()
                ));

                Section s2 = Section.builder().title("Next.js 14 App Router").order(2).course(reactCourse).build();
                s2.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("Architecture App Router vs Pages Router").duration(18).price(2500.0).isFree(false).isPreview(false).section(s2).build(),
                    CourseUnit.builder().order(2).title("Server Components vs Client Components").duration(45).price(3000.0).isFree(false).isPreview(false).description("La distinction fondamentale qui change tout dans Next.js 14.").section(s2).build(),
                    CourseUnit.builder().order(3).title("Layouts imbriquÃ©s & templates").duration(25).price(2500.0).isFree(false).isPreview(false).section(s2).build(),
                    CourseUnit.builder().order(4).title("Route handlers & API routes").duration(30).price(2500.0).isFree(false).isPreview(false).section(s2).build(),
                    CourseUnit.builder().order(5).title("Server Actions & mutations").duration(50).price(3000.0).isFree(false).isPreview(false).section(s2).build(),
                    CourseUnit.builder().order(6).title("Streaming & Suspense").duration(35).price(3000.0).isFree(false).isPreview(false).section(s2).build()
                ));

                Section s3 = Section.builder().title("Authentification & SÃ©curitÃ©").order(3).course(reactCourse).build();
                s3.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("NextAuth.js v5 â€” configuration").duration(40).price(3000.0).isFree(false).isPreview(false).section(s3).build(),
                    CourseUnit.builder().order(2).title("OAuth Google & GitHub").duration(35).price(3000.0).isFree(false).isPreview(false).section(s3).build(),
                    CourseUnit.builder().order(3).title("Middleware & protection des routes").duration(28).price(2500.0).isFree(false).isPreview(false).section(s3).build()
                ));

                Section s4 = Section.builder().title("Performance & DÃ©ploiement").order(4).course(reactCourse).build();
                s4.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("Optimisation images avec next/image").duration(20).price(2500.0).isFree(false).isPreview(false).section(s4).build(),
                    CourseUnit.builder().order(2).title("StratÃ©gies de caching avancÃ©es").duration(45).price(3000.0).isFree(false).isPreview(false).section(s4).build(),
                    CourseUnit.builder().order(3).title("DÃ©ploiement Vercel â€” CI/CD complet").duration(30).price(2500.0).isFree(false).isPreview(false).section(s4).build()
                ));

                reactCourse.setSections(java.util.List.of(s1, s2, s3, s4));
                reactCourse.setReviews(java.util.List.of(
                    Review.builder().author("Nadia Ouédraogo").initials("NO").avatarGradient("linear-gradient(135deg,#3a0030,#8b0050)").rating(5).date("2025-05-15").comment("Cours absolument exceptionnel. La progression est parfaite et les explications sur les Server Components m'ont enfin aidée à comprendre ce concept.").helpful(48).course(reactCourse).build(),
                    Review.builder().author("Jean-Baptiste Kaboré").initials("JK").avatarGradient("linear-gradient(135deg,#002040,#0055a0)").rating(5).date("2025-04-28").comment("Koffi explique avec une clarté rare. Chaque chapitre est bien dosé. La partie Server Actions m'a sauvé des heures de galère.").helpful(34).course(reactCourse).build(),
                    Review.builder().author("Meriem Bensalem").initials("MB").avatarGradient("linear-gradient(135deg,#001a2a,#004060)").rating(4).date("2025-04-10").comment("Très bon cours dans l'ensemble. Le format par chapitre est une vraie bonne idée.").helpful(19).course(reactCourse).build()
                ));
                repository.save(reactCourse);

                /* DÃ©mo unitÃ©s de cours : typer quelques unitÃ©s + un prÃ©requis intra-cours (mention). */
                {
                    java.util.UUID introId = null, jsxId = null, propsId = null;
                    for (Section sec : reactCourse.getSections()) {
                        for (CourseUnit ch : sec.getCourseUnits()) {
                            if (ch.getTitle().startsWith("Introduction")) { ch.setType("video"); introId = ch.getId(); }
                            if (ch.getTitle().startsWith("JSX")) jsxId = ch.getId();
                            if (ch.getTitle().startsWith("Props")) propsId = ch.getId();
                        }
                    }
                    for (Section sec : reactCourse.getSections()) {
                        for (CourseUnit ch : sec.getCourseUnits()) {
                            // "Props & communication" requiert "JSX & composants" et "Introduction"
                            if (propsId != null && ch.getId().equals(propsId)) {
                                java.util.List<java.util.UUID> pre = new java.util.ArrayList<>();
                                if (jsxId != null) pre.add(jsxId);
                                if (introId != null) pre.add(introId);
                                ch.setPrerequisites(pre);
                            }
                            CourseUnitRepo.save(ch);
                        }
                    }
                }

                Course pythonCourse = Course.builder()
                        .slug("python-machine-learning")
                        .title("Python & Machine Learning pratique")
                        .tagline("De NumPy Ã  scikit-learn : construisez et dÃ©ployez vos premiers modÃ¨les ML.")
                        .description("Une formation complÃ¨te et pratique pour maÃ®triser le Machine Learning avec Python. Vous travaillerez sur des datasets rÃ©els et apprenrez Ã  entraÃ®ner, Ã©valuer et dÃ©ployer des modÃ¨les en production.")
                        .category("Data Science")
                        .level("IntermÃ©diaire")
                        .language("FranÃ§ais")
                        .emoji("ðŸ  ")
                        .thumbGradient("linear-gradient(135deg,#003d2a,#006644)")
                        .badge("Mis Ã  jour")
                        .badgeType("new")
                        .price(18000.0)
                        .priceUnit(1800.0)
                        .rating(4.6)
                        .reviewCount(523)
                        .studentCount(2800)
                        .totalDuration(1080)
                        .lastUpdated("2025-05-01")
                        .instructor("Amina Diallo")
                        .instructorSlug("amina-diallo")
                        .instructorTitle("Data Scientist & ML Engineer")
                        .instructorAvatar("ðŸ‘©ðŸ ¾â€ ðŸ”¬")
                        .instructorAvatarGradient("linear-gradient(135deg,#003d2a,#006644)")
                        .instructorRating(4.7)
                        .instructorStudents(2800)
                        .instructorCourses(3)
                        .hasCertificate(true)
                        .hasDownload(true)
                        .hasLifetimeAccess(true)
                        .published(true)
                        .updatedAt(LocalDateTime.now())
                        .whatYouLearn(java.util.List.of(
                            "Manipuler des donnÃ©es avec NumPy, Pandas et Matplotlib",
                            "ImplÃ©menter les algorithmes ML classiques avec scikit-learn",
                            "Ã‰valuer et optimiser des modÃ¨les (cross-validation, Grid Search)",
                            "Construire des pipelines ML robustes et reproductibles",
                            "DÃ©ploiement avec FastAPI et Docker"
                        ))
                        .requirements(java.util.List.of(
                            "Bases en Python (fonctions, listes, dictionnaires)",
                            "Notions de mathÃ©matiques lycÃ©e (algÃ¨bre linÃ©aire basique)"
                        ))
                        .targetAudience("DÃ©veloppeurs Python souhaitant entrer dans le monde de la data science.")
                        .build();

                Section ps1 = Section.builder().title("Python pour la Data Science").order(1).course(pythonCourse).build();
                ps1.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("Environnement Anaconda & Jupyter").duration(15).price(0.0).isFree(true).isPreview(true).section(ps1).build(),
                    CourseUnit.builder().order(2).title("NumPy â€” arrays & opÃ©rations").duration(40).price(1800.0).isFree(false).isPreview(true).section(ps1).build(),
                    CourseUnit.builder().order(3).title("Pandas â€” DataFrames & nettoyage").duration(55).price(1800.0).isFree(false).isPreview(false).section(ps1).build(),
                    CourseUnit.builder().order(4).title("Visualisation avec Matplotlib").duration(35).price(1800.0).isFree(false).isPreview(false).section(ps1).build()
                ));

                Section ps2 = Section.builder().title("Algorithmes ML SupervisÃ©").order(2).course(pythonCourse).build();
                ps2.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("RÃ©gression linÃ©aire & logistique").duration(50).price(1800.0).isFree(false).isPreview(false).section(ps2).build(),
                    CourseUnit.builder().order(2).title("Arbres de dÃ©cision & Random Forest").duration(45).price(1800.0).isFree(false).isPreview(false).section(ps2).build(),
                    CourseUnit.builder().order(3).title("SVM & KNN").duration(40).price(1800.0).isFree(false).isPreview(false).section(ps2).build()
                ));

                Section ps3 = Section.builder().title("Ã‰valuation & DÃ©ploiement").order(3).course(pythonCourse).build();
                ps3.setCourseUnits(java.util.List.of(
                    CourseUnit.builder().order(1).title("MÃ©triques & validation croisÃ©e").duration(35).price(1800.0).isFree(false).isPreview(false).section(ps3).build(),
                    CourseUnit.builder().order(2).title("Pipeline scikit-learn").duration(40).price(1800.0).isFree(false).isPreview(false).section(ps3).build(),
                    CourseUnit.builder().order(3).title("DÃ©ploiement FastAPI + Docker").duration(60).price(1800.0).isFree(false).isPreview(false).section(ps3).build()
                ));

                pythonCourse.setSections(java.util.List.of(ps1, ps2, ps3));
                pythonCourse.setReviews(java.util.List.of(
                    Review.builder().author("Ibrahima Sow").initials("IS").avatarGradient("linear-gradient(135deg,#003d2a,#006644)").rating(5).date("2025-05-10").comment("Amina est une pÃ©dagogue hors pair. La progression est idÃ©ale et le projet final de dÃ©ploiement est exactement ce que les recruteurs attendent.").helpful(31).course(pythonCourse).build(),
                    Review.builder().author("Fatima Zahra").initials("FZ").avatarGradient("linear-gradient(135deg,#3a0030,#8b0050)").rating(4).date("2025-04-20").comment("TrÃ¨s bon cours. Les notebooks Jupyter fournis sont super.").helpful(15).course(pythonCourse).build()
                ));
                repository.save(pythonCourse);
            }
        };
    }
}



