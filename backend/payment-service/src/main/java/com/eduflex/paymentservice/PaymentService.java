package com.eduflex.paymentservice;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
class PaymentService {
    @Value("${stripe.api.key}")
    private String stripeApiKey;
    
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createCheckoutSession(UUID courseId, String userEmail, long priceInCents) throws Exception {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("https://eduflex.pro/payment/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("https://eduflex.pro/payment/cancel")
                .putMetadata("course_id", courseId.toString())
                .putMetadata("user_email", userEmail)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(priceInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Course Enrollment")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();
        Session session = Session.create(params);
        return session.getUrl();
    }

    // Remises groupÃ©es (Rule 3.28)
    public double calculateFinalPrice(List<BasketItem> items, double discountRate) {
        double subtotal = 0;
        for (BasketItem item : items) {
            subtotal += item.getPrice();
        }

        int n = items.size();
        int nMax = 10;
        double finalDiscountMultiplier = Math.pow(1.0 - discountRate, Math.min(n, nMax));
        return subtotal * finalDiscountMultiplier;
    }

    // RÃ©partition des revenus (Rule 3.35)
    // t = 0 (organique) -> 70% formateur, 30% plateforme
    // t = 1 (propre) -> 80% formateur, 20% plateforme
    public double getTrainerRevenue(double price, int trafficType) {
        double factor = 0.7 + 0.1 * trafficType;
        return price * factor;
    }
}

@Entity
@Table(name = "financial_aids")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class FinancialAid {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private UUID courseId;
    private double monthlyIncome;
    private boolean disadvantaged;
    private double motivationScore;
    private double auditHours;
    private double score;
    private String status; // EN_ATTENTE, APPROUVEE, REFUSEE, ANNULEE
    private LocalDateTime createdAt;
}

@Repository
interface FinancialAidRepository extends JpaRepository<FinancialAid, UUID> {
    List<FinancialAid> findByUserId(UUID userId);
}

@Data
class BasketItem {
    private UUID courseUnitId;
    private double price;
}

@Data
class BasketRequest {
    private List<BasketItem> items;
    private double discountRate = 0.05; // 5% par dÃ©faut
}

@Data
class FinancialAidRequest {
    private UUID userId;
    private UUID courseId;
    private double monthlyIncome;
    private boolean disadvantaged;
    private double motivationScore; // de 0 Ã  1
    private double auditHours;
}

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Coupon {
    @Id
    private String code;
    private double pct;
    private String label;
}

@Repository
interface CouponRepository extends JpaRepository<Coupon, String> {}

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private UUID courseId;
    private String courseSlug;
    private String label;
    private String type;        // cours | courseUnit | forfait | abonnement
    private String instructor;  // pour les revenus du formateur
    private double gross;       // montant payÃ©
    private double net;         // part reversÃ©e au formateur
    private String currency;
    private LocalDateTime createdAt;
}

@Repository
interface PurchaseRepository extends JpaRepository<Purchase, UUID> {
    List<Purchase> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Purchase> findByInstructorOrderByCreatedAtDesc(String instructor);
}

@Data
class PurchaseRequest {
    private UUID userId;
    private String userName;
    private String userEmail;
    private UUID courseId;
    private String courseSlug;
    private String label;
    private String type;
    private String instructor;
    private double gross;
    private int trafficType;    // 0 = organique (70%), 1 = propre (80%)
    private String currency;
}

/* ─── Transaction : l'enveloppe de paiement (statut PENDING -> PAID/FAILED) ─── */
@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID userId;
    private double amount;
    private String currency;
    private String method;       // mobile | carte | paypal
    private String provider;     // simulated | stripe | notchpay
    private String providerRef;  // id de session/paiement cote provider (rempli par la vraie API)
    private String status;       // PENDING | PAID | FAILED | CANCELLED
    @Column(length = 2000)
    private String itemsSummary; // resume des articles (JSON/texte)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Repository
interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    java.util.Optional<Transaction> findByProviderRef(String providerRef);
}

@Data
class CreateTransactionRequest {
    private UUID userId;
    private double amount;
    private String currency;
    private String method;
    private String itemsSummary;
}

/* Abstraction de fournisseur de paiement. Aujourd'hui = simule ; demain = Stripe / NotchPay,
   en ajoutant une implementation @ConditionalOnProperty(name="payment.provider", havingValue="stripe")
   et en passant payment.provider=stripe dans la config. Le controller ne change pas. */
interface PaymentProvider {
    String name();
    /** Initialise le paiement cote provider. Renvoie une reference (URL de redirection / session)
        ou null si le paiement est immediat (cas simule). */
    String begin(Transaction tx);
    /** Confirme/capture le paiement. true => PAID. */
    boolean confirm(Transaction tx);
}

/* Implementation simulee (defaut) : accepte tout, immediatement. Prete a etre remplacee. */
@org.springframework.stereotype.Component
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
        name = "payment.provider", havingValue = "simulated", matchIfMissing = true)
class SimulatedPaymentProvider implements PaymentProvider {
    public String name() { return "simulated"; }
    public String begin(Transaction tx) { return null; }
    public boolean confirm(Transaction tx) { return true; }
}

/* Envoi d'e-mails (reçus). Prêt pour Resend : si RESEND_API_KEY est défini, les mails
   partent réellement ; sinon ils sont journalisés (mode dev). */
@Service
class EmailService {
    @Value("${resend.api-key:}")
    private String apiKey;
    @Value("${resend.from:EduFlex Pro <onboarding@resend.dev>}")
    private String from;

    public void send(String to, String subject, String html) {
        if (to == null || to.isBlank()) return;
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("[EMAIL:DEV] a=" + to + " | sujet=" + subject);
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
            System.out.println("[EMAIL] echec envoi a " + to + " : " + e.getMessage());
        }
    }

    private static String jsonStr(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }
}

@Data
class ReceiptItem {
    private String label;
    private String type;
    private double price;
}

@Data
class ReceiptRequest {
    private String email;
    private String name;
    private String orderId;
    private String currency;
    private double total;
    private java.util.List<ReceiptItem> items;
}

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
class PaymentController {
    private final PaymentService paymentService;
    private final FinancialAidRepository financialAidRepository;
    private final CouponRepository couponRepository;
    private final PurchaseRepository purchaseRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentProvider paymentProvider;
    private final EmailService emailService;

    public PaymentController(PaymentService paymentService,
                             FinancialAidRepository financialAidRepository,
                             CouponRepository couponRepository,
                             PurchaseRepository purchaseRepository,
                             TransactionRepository transactionRepository,
                             PaymentProvider paymentProvider,
                             EmailService emailService) {
        this.paymentService = paymentService;
        this.financialAidRepository = financialAidRepository;
        this.couponRepository = couponRepository;
        this.purchaseRepository = purchaseRepository;
        this.transactionRepository = transactionRepository;
        this.paymentProvider = paymentProvider;
        this.emailService = emailService;
    }

    /* ─── Reçu d'achat par e-mail ─── */
    @PostMapping("/receipt")
    public java.util.Map<String, String> sendReceipt(@RequestBody ReceiptRequest req) {
        String cur = req.getCurrency() != null ? req.getCurrency() : "XAF";
        StringBuilder rows = new StringBuilder();
        if (req.getItems() != null) {
            for (ReceiptItem it : req.getItems()) {
                rows.append("<tr>")
                    .append("<td style=\"padding:6px 0;border-bottom:1px solid #eee;\">").append(escape(it.getLabel())).append("</td>")
                    .append("<td style=\"padding:6px 0;border-bottom:1px solid #eee;text-align:right;\">")
                    .append(fmt(it.getPrice())).append(" ").append(cur).append("</td>")
                    .append("</tr>");
            }
        }
        String html = "<div style=\"font-family:sans-serif;max-width:520px;\">"
                + "<h2 style=\"color:#6d28d9;\">Merci pour votre achat</h2>"
                + "<p>Bonjour " + escape(req.getName()) + ",</p>"
                + "<p>Voici le reçu de votre commande <strong>" + escape(req.getOrderId()) + "</strong> :</p>"
                + "<table style=\"width:100%;border-collapse:collapse;font-size:14px;\">" + rows
                + "<tr><td style=\"padding:10px 0;font-weight:700;\">Total</td>"
                + "<td style=\"padding:10px 0;font-weight:700;text-align:right;\">" + fmt(req.getTotal()) + " " + cur + "</td></tr>"
                + "</table>"
                + "<p style=\"margin-top:16px;\">Votre contenu est immédiatement accessible depuis votre tableau de bord.</p>"
                + "<p style=\"color:#888;font-size:12px;\">EduFlex Pro</p></div>";
        emailService.send(req.getEmail(), "Votre reçu EduFlex Pro — " + (req.getOrderId() != null ? req.getOrderId() : ""), html);
        return java.util.Map.of("status", "sent");
    }

    private static String fmt(double n) {
        return String.format(java.util.Locale.FRANCE, "%,.0f", n);
    }
    private static String escape(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    /* ─── Transactions de paiement ─── */
    @PostMapping("/transactions")
    public Transaction createTransaction(@RequestBody CreateTransactionRequest req) {
        Transaction tx = Transaction.builder()
                .userId(req.getUserId())
                .amount(req.getAmount())
                .currency(req.getCurrency() != null ? req.getCurrency() : "XAF")
                .method(req.getMethod())
                .provider(paymentProvider.name())
                .status("PENDING")
                .itemsSummary(req.getItemsSummary())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        tx.setProviderRef(paymentProvider.begin(tx)); // null en simule ; URL/session avec un vrai provider
        return transactionRepository.save(tx);
    }

    @PostMapping("/transactions/{id}/confirm")
    public Transaction confirmTransaction(@PathVariable UUID id) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction introuvable"));
        if (!"PENDING".equals(tx.getStatus())) return tx; // deja traitee
        boolean ok = paymentProvider.confirm(tx);
        tx.setStatus(ok ? "PAID" : "FAILED");
        tx.setUpdatedAt(LocalDateTime.now());
        return transactionRepository.save(tx);
    }

    @GetMapping("/transactions/{id}")
    public Transaction getTransaction(@PathVariable UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction introuvable"));
    }

    /* Webhook prêt pour la vraie API (Stripe/NotchPay) : le provider POSTera ici pour
       confirmer/annuler le paiement de facon asynchrone. En simule, non utilise. */
    @PostMapping("/transactions/webhook/{provider}")
    public java.util.Map<String, String> webhook(@PathVariable String provider, @RequestBody(required = false) String payload) {
        // TODO (vraie API) : verifier la signature, retrouver la transaction via providerRef,
        // passer son statut a PAID/FAILED. Laisse en place pour brancher le provider.
        return java.util.Map.of("status", "received");
    }

    /* â”€â”€â”€ Achats (historique apprenant + revenus formateur) â”€â”€â”€ */
    @PostMapping("/purchases")
    public Purchase recordPurchase(@RequestBody PurchaseRequest req) {
        double net = paymentService.getTrainerRevenue(req.getGross(), req.getTrafficType());
        Purchase p = Purchase.builder()
                .userId(req.getUserId())
                .userName(req.getUserName())
                .userEmail(req.getUserEmail())
                .courseId(req.getCourseId())
                .courseSlug(req.getCourseSlug())
                .label(req.getLabel())
                .type(req.getType())
                .instructor(req.getInstructor())
                .gross(req.getGross())
                .net(net)
                .currency(req.getCurrency() != null ? req.getCurrency() : "XAF")
                .createdAt(LocalDateTime.now())
                .build();
        return purchaseRepository.save(p);
    }

    @GetMapping("/purchases")
    public List<Purchase> getUserPurchases(@RequestParam UUID userId) {
        return purchaseRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/purchases/instructor")
    public List<Purchase> getInstructorPurchases(@RequestParam String name) {
        return purchaseRepository.findByInstructorOrderByCreatedAtDesc(name);
    }

    @PostMapping("/calculate")
    public double calculateBasketPrice(@RequestBody BasketRequest request) {
        return paymentService.calculateFinalPrice(request.getItems(), request.getDiscountRate());
    }

    @GetMapping("/revenue-split")
    public double getRevenueSplit(@RequestParam double price, @RequestParam int trafficType) {
        return paymentService.getTrainerRevenue(price, trafficType);
    }

    @PostMapping("/financial-aid/apply")
    public FinancialAid applyForFinancialAid(@RequestBody FinancialAidRequest request) {
        double x1 = Math.max(0.0, (1000000.0 - request.getMonthlyIncome()) / 1000000.0);
        double x2 = request.isDisadvantaged() ? 1.0 : 0.0;
        double x3 = request.getMotivationScore();
        double x4 = Math.min(1.0, request.getAuditHours() / 10.0);

        double score = 0.25 * x1 + 0.25 * x2 + 0.25 * x3 + 0.25 * x4;
        double threshold = 0.5;
        String status = score >= threshold ? "APPROUVEE" : "REFUSEE";

        FinancialAid aid = FinancialAid.builder()
                .userId(request.getUserId())
                .courseId(request.getCourseId())
                .monthlyIncome(request.getMonthlyIncome())
                .disadvantaged(request.isDisadvantaged())
                .motivationScore(request.getMotivationScore())
                .auditHours(request.getAuditHours())
                .score(score)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        return financialAidRepository.save(aid);
    }

    @GetMapping("/coupons/validate")
    public Coupon validateCoupon(@RequestParam String code) {
        return couponRepository.findById(code.toUpperCase().trim())
                .orElseThrow(() -> new RuntimeException("Coupon non valide ou expirÃ©"));
    }

    @GetMapping("/coupons")
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @PostMapping("/coupons")
    public Coupon createCoupon(@RequestBody Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase().trim());
        return couponRepository.save(coupon);
    }

    @DeleteMapping("/coupons/{code}")
    public void deleteCoupon(@PathVariable String code) {
        couponRepository.deleteById(code.toUpperCase().trim());
    }

    @GetMapping("/financial-aid")
    public List<FinancialAid> getAllFinancialAids() {
        return financialAidRepository.findAll();
    }

    @PutMapping("/financial-aid/{id}/status")
    public FinancialAid updateFinancialAidStatus(@PathVariable UUID id, @RequestParam String status) {
        FinancialAid aid = financialAidRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvÃ©e"));
        aid.setStatus(status.toUpperCase().trim());
        return financialAidRepository.save(aid);
    }
}

@org.springframework.context.annotation.Configuration
class PaymentDataSeeder {
    @org.springframework.context.annotation.Bean
    org.springframework.boot.CommandLineRunner initPaymentData(CouponRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(Coupon.builder().code("LAUNCH30").pct(30.0).label("Offre de lancement âˆ’30%").build());
                repository.save(Coupon.builder().code("EDU2025").pct(15.0).label("RentrÃ©e 2025 âˆ’15%").build());
                repository.save(Coupon.builder().code("WELCOME10").pct(10.0).label("Bienvenue âˆ’10%").build());
            }
        };
    }
}



