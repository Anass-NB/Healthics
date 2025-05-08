package com.healthics.backend.payload.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DocumentResponse {
    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String fileType;
    private long fileSize;
    private String doctorName;
    private String hospitalName;
    private LocalDateTime documentDate;
    private LocalDateTime uploadDate;
    private LocalDateTime lastModifiedDate;
    private String downloadUrl;
}