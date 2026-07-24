package com.eduflex.searchservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Document(indexName = "courses")
class CourseDocument {
    @Id
    private String id;
    @Field(type = FieldType.Text, analyzer = "french")
    private String title;
    @Field(type = FieldType.Text, analyzer = "french")
    private String description;
    @Field(type = FieldType.Keyword)
    private String authorName;
    @Field(type = FieldType.Double)
    private double price;
}

@Service
class AnalyticsListener {
    private static final Logger log = LoggerFactory.getLogger(AnalyticsListener.class);
    
    @KafkaListener(topics = "clickstream-events-topic", groupId = "analytics-group")
    public void consumeClickstream(String rawPayload) {
        log.debug("Analytics - Event clickstream received: {}", rawPayload);
        // Traitement de l'événement en temps réel et agrégation statistique
    }
}
