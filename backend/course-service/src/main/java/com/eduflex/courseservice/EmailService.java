package com.eduflex.courseservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/* Envoi d'e-mails (notifications de validation). Prêt pour Resend : si RESEND_API_KEY
   est défini, les mails partent réellement ; sinon ils sont journalisés (mode dev). */
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
