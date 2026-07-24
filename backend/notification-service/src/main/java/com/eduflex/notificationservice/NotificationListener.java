package com.eduflex.notificationservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
class NotificationListener {
    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);
    private final JavaMailSender mailSender;

    public NotificationListener(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @KafkaListener(topics = "user-registered-topic", groupId = "notification-group")
    public void handleUserRegistration(String email) {
        log.info("Received Kafka message: User registered with email: {}", email);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Bienvenue sur EduFlex !");
            helper.setText("<h1>Bienvenue sur notre plateforme d'apprentissage innovante !</h1>", true);
            mailSender.send(message);
            log.info("Welcome email sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", email, e);
        }
    }
}
