package com.healthics.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 100)
    private String title;

    @Size(max = 500)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private DocumentCategory category;

    @NotBlank
    private String fileName;

    private String filePath;

    private String fileType;

    private long fileSize;

    @Size(max = 100)
    private String doctorName;

    @Size(max = 100)
    private String hospitalName;

    private LocalDateTime documentDate;

    private LocalDateTime uploadDate;

    private LocalDateTime lastModifiedDate;
}