package com.healthics.backend.payload.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DocumentUpdateRequest {
    
    @NotBlank
    @Size(max = 100)
    private String title;
    
    @Size(max = 500)
    private String description;
    
    private Long categoryId;
    
    @Size(max = 100)
    private String doctorName;
    
    @Size(max = 100)
    private String hospitalName;
    
    private LocalDateTime documentDate;
}