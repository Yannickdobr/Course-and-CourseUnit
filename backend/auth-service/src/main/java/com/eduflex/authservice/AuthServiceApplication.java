package com.eduflex.authservice;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}

@Entity
@Table(name = "users")
class AuthUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String password;
    private String name;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;
    @Column(columnDefinition = "boolean default false")
    private boolean hasActiveSubscription;

    /* Réinitialisation de mot de passe */
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    public AuthUser() {}
    public AuthUser(UUID id, String email, String password, String name, String role, boolean enabled, LocalDateTime createdAt, boolean hasActiveSubscription) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.hasActiveSubscription = hasActiveSubscription;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean getHasActiveSubscription() { return hasActiveSubscription; }
    public void setHasActiveSubscription(boolean hasActiveSubscription) { this.hasActiveSubscription = hasActiveSubscription; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }

    public static class AuthUserBuilder {
        private UUID id;
        private String email;
        private String password;
        private String name;
        private String role;
        private boolean enabled;
        private LocalDateTime createdAt;
        private boolean hasActiveSubscription;

        public AuthUserBuilder id(UUID id) { this.id = id; return this; }
        public AuthUserBuilder email(String email) { this.email = email; return this; }
        public AuthUserBuilder password(String password) { this.password = password; return this; }
        public AuthUserBuilder name(String name) { this.name = name; return this; }
        public AuthUserBuilder role(String role) { this.role = role; return this; }
        public AuthUserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public AuthUserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AuthUserBuilder hasActiveSubscription(boolean hasActiveSubscription) { this.hasActiveSubscription = hasActiveSubscription; return this; }

        public AuthUser build() {
            return new AuthUser(id, email, password, name, role, enabled, createdAt, hasActiveSubscription);
        }
    }

    public static AuthUserBuilder builder() {
        return new AuthUserBuilder();
    }
}

@Repository
interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {
    Optional<AuthUser> findByEmail(String email);
    Optional<AuthUser> findByResetToken(String resetToken);
}

/* Envoi d'e-mails transactionnels. Prêt pour Resend : si RESEND_API_KEY est défini,
   les mails partent réellement ; sinon ils sont journalisés (mode dev). */
@Service
class EmailService {
    @Value("${resend.api-key:}")
    private String apiKey;
    @Value("${resend.from:EduFlex Pro <onboarding@resend.dev>}")
    private String from;
    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public String getFrontendUrl() { return frontendUrl; }

    public void send(String to, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("[EMAIL:DEV] à=" + to + " | sujet=" + subject + "\n" + html);
            return;
        }
        try {
            String payload = "{"
                    + "\"from\":" + jsonStr(from) + ","
                    + "\"to\":[" + jsonStr(to) + "],"
                    + "\"subject\":" + jsonStr(subject) + ","
                    + "\"html\":" + jsonStr(html) + "}";
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload))
                    .build();
            client.sendAsync(req, java.net.http.HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) {
            System.out.println("[EMAIL] échec envoi à " + to + " : " + e.getMessage());
        }
    }

    private static String jsonStr(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }
}

class LoginRequest {
    private String email;
    private String password;

    public LoginRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;

    public RegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

class AuthResponse {
    private String id;
    private String token;
    private String name;
    private String email;
    private String role;
    private boolean hasActiveSubscription;

    public AuthResponse() {}
    public AuthResponse(String id, String token, String name, String email, String role, boolean hasActiveSubscription) {
        this.id = id;
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
        this.hasActiveSubscription = hasActiveSubscription;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean getHasActiveSubscription() { return hasActiveSubscription; }
    public void setHasActiveSubscription(boolean hasActiveSubscription) { this.hasActiveSubscription = hasActiveSubscription; }
}

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
class AuthController {
    private final AuthUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthController(AuthUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    /* ─── Mot de passe oublié ─── */
    @PostMapping("/password/forgot")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email != null) {
            userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
                String token = UUID.randomUUID().toString().replace("-", "");
                user.setResetToken(token);
                user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
                userRepository.save(user);
                String link = emailService.getFrontendUrl() + "/reinitialiser-mot-de-passe?token=" + token;
                String html = "<p>Bonjour " + (user.getName() != null ? user.getName() : "") + ",</p>"
                        + "<p>Vous avez demandé à réinitialiser votre mot de passe EduFlex Pro.</p>"
                        + "<p><a href=\"" + link + "\">Cliquez ici pour choisir un nouveau mot de passe</a> "
                        + "(lien valable 1 heure).</p>"
                        + "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>";
                emailService.send(user.getEmail(), "Réinitialisation de votre mot de passe", html);
            });
        }
        // Réponse générique (ne révèle pas si l'email existe)
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
        return res;
    }

    @PostMapping("/password/reset")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");
        if (token == null || newPassword == null || newPassword.length() < 8) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Lien invalide ou mot de passe trop court (min. 8 caractères).");
        }
        AuthUser user = userRepository.findByResetToken(token)
                .filter(u -> u.getResetTokenExpiry() != null && u.getResetTokenExpiry().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Lien de réinitialisation invalide ou expiré."));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Mot de passe réinitialisé. Vous pouvez vous connecter.");
        return res;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé.");
        }
        
        String requested = request.getRole() != null ? request.getRole() : "apprenant";

        /* Inscription publique gratuite : apprenant ou formateur. admin/superadmin restent
           réservés au superadmin (création via token). */
        String role = "formateur".equals(requested) ? "formateur" : "apprenant";
        if ("admin".equals(requested) || "superadmin".equals(requested)) {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Accès refusé. Seul un superadmin peut créer un administrateur.");
            }
            String token = authHeader.substring(7);
            String creatorRole = jwtService.extractRole(token);
            if (!"superadmin".equals(creatorRole)) {
                throw new RuntimeException("Accès refusé. Seul un superadmin peut créer un administrateur.");
            }
            role = requested;
        }

        
        AuthUser user = AuthUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .hasActiveSubscription(false)
                .build();
        userRepository.save(user);
        // E-mail de bienvenue (notification transactionnelle)
        emailService.send(user.getEmail(), "Bienvenue sur EduFlex Pro",
                "<p>Bonjour " + (user.getName() != null ? user.getName() : "") + ",</p>"
                + "<p>Votre compte EduFlex Pro est prêt. Explorez le catalogue et achetez exactement "
                + "les unités de cours dont vous avez besoin.</p>"
                + "<p><a href=\"" + emailService.getFrontendUrl() + "/catalogue\">Explorer le catalogue</a></p>");
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user.getId().toString(), token, user.getName(), user.getEmail(), user.getRole(), user.getHasActiveSubscription());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        AuthUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect."));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect.");
        }
        
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user.getId().toString(), token, user.getName(), user.getEmail(), user.getRole(), user.getHasActiveSubscription());
    }

    @GetMapping("/mentors")
    public java.util.List<AuthUser> getMentors() {
        return userRepository.findAll().stream()
                .filter(user -> "formateur".equalsIgnoreCase(user.getRole()))
                .toList();
    }

    @GetMapping("/users")
    public java.util.List<AuthUser> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}/role")
    public AuthUser updateUserRole(@PathVariable UUID id, @RequestParam String role,
                                   @RequestParam(required = false) UUID actingUserId) {
        AuthUser actor = requireAdminActor(actingUserId);
        AuthUser target = userRepository.findById(id)
                .orElseThrow(() -> forbidden("Utilisateur non trouvé"));
        String newRole = role.toLowerCase().trim();

        // Le super-administrateur est unique et protégé.
        if ("superadmin".equals(target.getRole())) {
            throw forbidden("Le super-administrateur ne peut pas être modifié.");
        }
        if ("superadmin".equals(newRole)) {
            throw forbidden("Le rôle super-administrateur ne peut pas être attribué.");
        }
        // Gérer un administrateur (cible admin OU promotion vers admin) exige le super-admin.
        boolean adminScope = "admin".equals(target.getRole()) || "admin".equals(newRole);
        if (adminScope && !"superadmin".equals(actor.getRole())) {
            throw forbidden("Seul le super-administrateur peut créer ou modifier des administrateurs.");
        }
        target.setRole(newRole);
        return userRepository.save(target);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable UUID id,
                           @RequestParam(required = false) UUID actingUserId) {
        AuthUser actor = requireAdminActor(actingUserId);
        AuthUser target = userRepository.findById(id)
                .orElseThrow(() -> forbidden("Utilisateur non trouvé"));
        if ("superadmin".equals(target.getRole())) {
            throw forbidden("Le super-administrateur ne peut pas être supprimé.");
        }
        if ("admin".equals(target.getRole()) && !"superadmin".equals(actor.getRole())) {
            throw forbidden("Seul le super-administrateur peut supprimer un administrateur.");
        }
        userRepository.deleteById(id);
    }

    /* L'acteur est identifié par son id en base (rôle non usurpable côté client). */
    private AuthUser requireAdminActor(UUID actingUserId) {
        if (actingUserId == null) throw forbidden("Action réservée aux administrateurs.");
        AuthUser actor = userRepository.findById(actingUserId)
                .orElseThrow(() -> forbidden("Acteur inconnu."));
        if (!"admin".equals(actor.getRole()) && !"superadmin".equals(actor.getRole())) {
            throw forbidden("Droits administrateur requis.");
        }
        return actor;
    }

    private org.springframework.web.server.ResponseStatusException forbidden(String msg) {
        return new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, msg);
    }

    @PostMapping("/users/{id}/subscribe")
    public AuthResponse subscribeUser(@PathVariable UUID id) {
        AuthUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setHasActiveSubscription(true);
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user.getId().toString(), token, user.getName(), user.getEmail(), user.getRole(), user.getHasActiveSubscription());
    }

    /* Devenir formateur : self-service et gratuit (il suffit d'être inscrit).
       Ne touche pas aux rôles admin/superadmin. */
    @PostMapping("/users/{id}/become-instructor")
    public AuthResponse becomeInstructor(@PathVariable UUID id) {
        AuthUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if ("admin".equals(user.getRole()) || "superadmin".equals(user.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Un compte administrateur ne peut pas devenir formateur.");
        }
        user.setRole("formateur");
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user.getId().toString(), token, user.getName(), user.getEmail(), user.getRole(), user.getHasActiveSubscription());
    }
}

@Service
class JwtService {
    @Value("${jwt.secret:defaultSecretKeyWithAtLeast32CharactersLongToEnsureHS512SecurityRequirementIsMet1234567890}")
    private String jwtSecret;
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;
    @Value("${jwt.refresh-expiration:604800000}")
    private long jwtRefreshExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    public String extractRole(String token) {
        String roleStr = extractAllClaims(token).get("role", String.class);
        if (roleStr != null && roleStr.startsWith("ROLE_")) {
            return roleStr.substring(5).toLowerCase();
        }
        return roleStr != null ? roleStr.toLowerCase() : null;
    }
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_" + role.toUpperCase());
        return buildToken(claims, username, jwtExpiration);
    }
    public String generateRefreshToken(String username) {
        return buildToken(new HashMap<>(), username, jwtRefreshExpiration);
    }
    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }
    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username)) && !isTokenExpired(token);
    }
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

@Configuration
class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 1, 65536, 10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

@Configuration
class AuthDataSeeder {
    @Bean
    org.springframework.boot.CommandLineRunner seedUsers(AuthUserRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (!repo.findByEmail("admin@eduflex.pro").isPresent()) {
                repo.save(AuthUser.builder()
                        .name("Admin EduFlex").email("admin@eduflex.pro")
                        .password(encoder.encode("admin123")).role("superadmin")
                        .enabled(true).createdAt(LocalDateTime.now())
                        .hasActiveSubscription(true).build());
            } else {
                AuthUser admin = repo.findByEmail("admin@eduflex.pro").get();
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("superadmin");
                repo.save(admin);
            }
        };
    }
}

