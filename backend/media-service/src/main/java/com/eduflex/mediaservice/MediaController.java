package com.eduflex.mediaservice;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/* Verifie la signature/validite d'un JWT (memes secret & algo HS512 que auth-service). */
@Component
class JwtVerifier {
    @Value("${jwt.secret:defaultSecretKeyWithAtLeast32CharactersLongToEnsureHS512SecurityRequirementIsMet1234567890}")
    private String jwtSecret;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    boolean isValid(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authHeader.substring(7));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

    private final StorageProvider storage;
    private final JwtVerifier jwtVerifier;

    /* Types autorises et taille max (octets) par famille. */
    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final Set<String> VIDEO_TYPES = Set.of("video/mp4", "video/webm", "video/ogg");
    private static final String PDF_TYPE = "application/pdf";
    private static final long MAX_IMAGE = 5L * 1024 * 1024;    // 5 Mo
    private static final long MAX_PDF   = 25L * 1024 * 1024;   // 25 Mo
    private static final long MAX_VIDEO = 500L * 1024 * 1024;  // 500 Mo

    public MediaController(StorageProvider storage, JwtVerifier jwtVerifier) {
        this.storage = storage;
        this.jwtVerifier = jwtVerifier;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                        @RequestHeader(value = "Authorization", required = false) String auth) {
        // 1) Authentification : seul un utilisateur connecte peut televerser.
        if (!jwtVerifier.isValid(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentification requise pour televerser un fichier."));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Fichier vide."));
        }

        // 2) Validation type + taille.
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        long size = file.getSize();
        String violation = validate(contentType, size);
        if (violation != null) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("message", violation));
        }

        // 3) Stockage sous un nom aleatoire (pas de nom utilisateur => pas d'injection de chemin).
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = original.contains(".") ? original.substring(original.lastIndexOf(".")).toLowerCase() : "";
        if (ext.contains("/") || ext.contains("\\") || ext.contains("..")) ext = "";
        String name = UUID.randomUUID() + ext;

        try {
            storage.store(file, name);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Echec du stockage du fichier."));
        }

        String route = "/api/media/files/" + name;
        String url = ServletUriComponentsBuilder.fromCurrentContextPath().path(route).toUriString();
        return ResponseEntity.ok(Map.of("route", route, "url", url, "fileName", name, "type", contentType));
    }

    /* Renvoie un message d'erreur si non conforme, sinon null. */
    private String validate(String contentType, long size) {
        if (IMAGE_TYPES.contains(contentType)) {
            return size > MAX_IMAGE ? "Image trop lourde (max 5 Mo)." : null;
        }
        if (PDF_TYPE.equals(contentType)) {
            return size > MAX_PDF ? "PDF trop lourd (max 25 Mo)." : null;
        }
        if (VIDEO_TYPES.contains(contentType) || contentType.startsWith("video/")) {
            return size > MAX_VIDEO ? "Video trop lourde (max 500 Mo)." : null;
        }
        return "Type de fichier non autorise : " + contentType + ". Acceptes : image (jpg/png/webp/gif), PDF, video (mp4/webm).";
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Resource resource = storage.load(fileName);
            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = "application/octet-stream";
            try {
                String probed = Files.probeContentType(resource.getFile().toPath());
                if (probed != null) contentType = probed;
            } catch (Exception ignored) { }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
