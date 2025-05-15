package com.healthics.backend.payload.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    // User information
    private Long userId;
    private String username;

    public DocumentResponse(Long id, String title, String description, String fileName, String fileType,
                            long fileSize, String categoryName, Long categoryId, String doctorName,
                            String hospitalName, LocalDateTime documentDate, LocalDateTime uploadDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.categoryName = categoryName;
        this.categoryId = categoryId;
        this.doctorName = doctorName;
        this.hospitalName = hospitalName;
        this.documentDate = documentDate;
        this.uploadDate = uploadDate;
    }
}