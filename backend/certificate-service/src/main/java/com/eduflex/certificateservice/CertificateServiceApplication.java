package com.eduflex.certificateservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;

@SpringBootApplication
public class CertificateServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CertificateServiceApplication.class, args);
    }
}

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private UUID courseId;
    private String studentName;
    private String courseTitle;
    private String status; // NON_ELIGIBLE, ELIGIBLE, EMIS, REVOQUE
    private LocalDateTime issuedAt;
}

@Repository
interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByUserIdAndCourseId(UUID userId, UUID courseId);
    java.util.List<Certificate> findByUserId(UUID userId);
}

@Data
class IssueCertificateRequest {
    private UUID userId;
    private UUID courseId;
    private String studentName;
    private String courseTitle;
    private double progress; // 1.0 = 100%
    private double averageGrade; // de 0 à 1 (e.g. 0.65 = 65%)
}

@Data
@AllArgsConstructor
class VerificationResponse {
    private boolean valid;
    private String studentName;
    private String courseTitle;
    private String status;
    private String issuedAt;
}

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "*")
class CertificateController {
    private final CertificateRepository certificateRepository;
    private final PdfService pdfService;

    public CertificateController(CertificateRepository certificateRepository, PdfService pdfService) {
        this.certificateRepository = certificateRepository;
        this.pdfService = pdfService;
    }

    // Émettre un certificat (Rule 3.41)
    @PostMapping("/issue")
    public Certificate issueCertificate(@RequestBody IssueCertificateRequest request) {
        // Condition d'éligibilité : progression = 100% et note >= 0.6 (60%)
        double progressThreshold = 1.0;
        double gradeThreshold = 0.6;

        if (request.getProgress() < progressThreshold || request.getAverageGrade() < gradeThreshold) {
            throw new RuntimeException("L'apprenant ne remplit pas les critères de réussite (progression de 100% et note moyenne >= 60% requises).");
        }

        // Vérifier s'il en existe déjà un
        Optional<Certificate> existing = certificateRepository.findByUserIdAndCourseId(request.getUserId(), request.getCourseId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Certificate cert = Certificate.builder()
                .userId(request.getUserId())
                .courseId(request.getCourseId())
                .studentName(request.getStudentName())
                .courseTitle(request.getCourseTitle())
                .status("EMIS") // transition d'état automatique
                .issuedAt(LocalDateTime.now())
                .build();

        return certificateRepository.save(cert);
    }

    // Vérification publique du certificat (Rule 3.43)
    @GetMapping("/verify/{id}")
    public VerificationResponse verifyCertificate(@PathVariable UUID id) {
        Optional<Certificate> certOpt = certificateRepository.findById(id);
        if (certOpt.isEmpty()) {
            return new VerificationResponse(false, "", "", "NON_EXISTANT", "");
        }

        Certificate cert = certOpt.get();
        boolean isValid = "EMIS".equalsIgnoreCase(cert.getStatus());
        return new VerificationResponse(
                isValid,
                cert.getStudentName(),
                cert.getCourseTitle(),
                cert.getStatus(),
                cert.getIssuedAt().toString()
        );
    }

    // Télécharger le PDF généré
    @GetMapping("/download/{id}")
    public @ResponseBody byte[] downloadPdf(@PathVariable UUID id) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificat introuvable"));

        if (!"EMIS".equalsIgnoreCase(cert.getStatus())) {
            throw new RuntimeException("Certificat révoqué ou non émis.");
        }

        return pdfService.generatePdfCertificate(cert.getStudentName(), cert.getCourseTitle());
    }

    @GetMapping("/user/{userId}")
    public java.util.List<Certificate> getCertificatesByUserId(@PathVariable UUID userId) {
        return certificateRepository.findByUserId(userId);
    }
}

