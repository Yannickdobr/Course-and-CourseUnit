package com.eduflex.courseservice;

import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByInstructor(String instructor);
    List<Project> findByPublishedTrue();
    List<Project> findByCourseId(UUID courseId);
}

@Repository
interface ProjectOwnershipRepository extends JpaRepository<ProjectOwnership, UUID> {
    List<ProjectOwnership> findByUserId(UUID userId);
    boolean existsByUserIdAndProjectId(UUID userId, UUID projectId);
}

@Service
class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectOwnershipRepository projectOwnershipRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectOwnershipRepository projectOwnershipRepository) {
        this.projectRepository = projectRepository;
        this.projectOwnershipRepository = projectOwnershipRepository;
    }

    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    public List<Project> getByInstructor(String instructor) {
        return projectRepository.findByInstructor(instructor);
    }

    public List<Project> getMarketplace() {
        return projectRepository.findByPublishedTrue();
    }

    public List<Project> getByCourse(UUID courseId) {
        return projectRepository.findByCourseId(courseId);
    }

    public Project getById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    @Transactional
    public Project create(Project p) {
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(p);
    }

    @Transactional
    public Project update(UUID id, Project details) {
        Project p = getById(id);
        p.setTitle(details.getTitle());
        p.setDescription(details.getDescription());
        p.setType(details.getType());
        p.setCourseId(details.getCourseId());
        p.setCourseSlug(details.getCourseSlug());
        p.setPrice(details.getPrice());
        p.setPublished(details.isPublished());
        p.setUpdatedAt(LocalDateTime.now());
        p.getLinks().clear();
        if (details.getLinks() != null) p.getLinks().addAll(details.getLinks());
        p.getUnitIds().clear();
        if (details.getUnitIds() != null) p.getUnitIds().addAll(details.getUnitIds());
        return projectRepository.save(p);
    }

    @Transactional
    public void delete(UUID id) {
        projectRepository.deleteById(id);
    }

    /* ─── Achat marketplace ─── */
    @Transactional
    public void purchase(UUID projectId, UUID userId) {
        Project p = getById(projectId);
        if (!projectOwnershipRepository.existsByUserIdAndProjectId(userId, projectId)) {
            projectOwnershipRepository.save(ProjectOwnership.builder()
                    .userId(userId).projectId(projectId).purchasedAt(LocalDateTime.now()).build());
            p.setPurchaseCount(p.getPurchaseCount() + 1);
            projectRepository.save(p);
        }
    }

    public boolean isOwned(UUID projectId, UUID userId) {
        return projectOwnershipRepository.existsByUserIdAndProjectId(userId, projectId);
    }

    public List<Project> getOwned(UUID userId) {
        List<Project> out = new java.util.ArrayList<>();
        for (ProjectOwnership o : projectOwnershipRepository.findByUserId(userId)) {
            projectRepository.findById(o.getProjectId()).ifPresent(out::add);
        }
        return out;
    }
}

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<Project> list(@RequestParam(required = false) String instructor) {
        return (instructor != null && !instructor.isBlank())
                ? projectService.getByInstructor(instructor)
                : projectService.getAll();
    }

    @GetMapping("/marketplace")
    public List<Project> marketplace() {
        return projectService.getMarketplace();
    }

    @GetMapping("/course/{courseId}")
    public List<Project> byCourse(@PathVariable UUID courseId) {
        return projectService.getByCourse(courseId);
    }

    @GetMapping("/{id}")
    public Project get(@PathVariable UUID id) {
        return projectService.getById(id);
    }

    @PostMapping
    public Project create(@RequestBody Project project) {
        return projectService.create(project);
    }

    @PutMapping("/{id}")
    public Project update(@PathVariable UUID id, @RequestBody Project project) {
        return projectService.update(id, project);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        projectService.delete(id);
    }

    /* ─── Marketplace : achat & possession ─── */
    @PostMapping("/{id}/purchase")
    public void purchase(@PathVariable UUID id, @RequestParam UUID userId) {
        projectService.purchase(id, userId);
    }

    @GetMapping("/{id}/access")
    public boolean access(@PathVariable UUID id, @RequestParam UUID userId) {
        return projectService.isOwned(id, userId);
    }

    @GetMapping("/owned")
    public List<Project> owned(@RequestParam UUID userId) {
        return projectService.getOwned(userId);
    }
}
