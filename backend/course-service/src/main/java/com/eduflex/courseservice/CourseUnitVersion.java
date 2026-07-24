package com.eduflex.courseservice;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "CourseUnit_versions")
public class CourseUnitVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID courseUnitId;
    private String version;
    private String title;
    private double price;
    private String description;
    private int duration;
    private LocalDateTime createdAt;
    private String status;
}
