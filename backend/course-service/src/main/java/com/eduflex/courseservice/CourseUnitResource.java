package com.eduflex.courseservice;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "CourseUnit_resources")
public class CourseUnitResource {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    
    private String type; // e.g., "video", "pdf", "image", "link"
    
    private String url;

    @ManyToOne
    @JoinColumn(name = "CourseUnit_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CourseUnit courseUnit;
}
