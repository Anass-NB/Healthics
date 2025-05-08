package com.healthics.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.healthics.backend.model.Document;
import com.healthics.backend.model.DocumentCategory;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.request.DocumentUpdateRequest;
import com.healthics.backend.payload.response.DocumentResponse;
import com.healthics.backend.payload.response.MessageResponse;
import com.healthics.backend.security.services.UserDetailsImpl;
import com.healthics.backend.service.DocumentCategoryService;
import com.healthics.backend.service.DocumentService;
import com.healthics.backend.service.FileStorageService;
import com.healthics.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private DocumentCategoryService categoryService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<DocumentResponse>> getPatientDocuments() {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userService.getUserById(userDetails.getId());
        
        List<Document> documents = documentService.getDocumentsByUser(user);
        List<DocumentResponse> responses = documents.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getDocumentById(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userService.getUserById(userDetails.getId());
        
        Document document = documentService.getDocumentById(id);
        
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Document not found"));
        }
        
        // Check if document belongs to current user or user is admin
        if (!document.getUser().getId().equals(user.getId()) && !userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You don't have permission to access this document"));
        }
        
        return ResponseEntity.ok(convertToResponse(document));
    }
    
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id, HttpServletRequest request) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userService.getUserById(userDetails.getId());
        
        Document document = documentService.getDocumentById(id);
        
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Document not found"));
        }
        
        // Check if document belongs to current user or user is admin
        if (!document.getUser().getId().equals(user.getId()) && !userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You don't have permission to access this document"));
        }
        
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(document.getFileName(), document.getUser().getId());
        
        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            System.out.println("Could not determine file type.");
        }
        
        // Fallback to the default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getTitle() + "\"")
                .body(resource);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "doctorName", required = false) String doctorName,
            @RequestParam(value = "hospitalName", required = false) String hospitalName,
            @RequestParam(value = "documentDate", required = false) String documentDate) {
        
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userService.getUserById(userDetails.getId());
        
        DocumentCategory category = null;
        if (categoryId != null) {
            category = categoryService.getCategoryById(categoryId);
            if (category == null) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Category not found"));
            }
        }
        
        try {
            String fileName = fileStorageService.storeFile(file, user.getId());
            
            Document document = new Document();
            document.setUser(user);
            document.setTitle(title);
            document.setDescription(description);
            document.setCategory(category);
            document.setFileName(fileName);
            document.setFilePath(user.getId() + "/" + fileName);
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setDoctorName(doctorName);
            document.setHospitalName(hospitalName);
            
            // Handle document date if provided
            if (documentDate != null && !documentDate.isEmpty()) {
                try {
                    LocalDateTime date = LocalDateTime.parse(documentDate);
                    document.setDocumentDate(date);
                } catch (Exception e) {
                    // If parsing fails, use current date
                    document.setDocumentDate(LocalDateTime.now());
                }
            } else {
                document.setDocumentDate(LocalDateTime.now());
            }
            
            document.setUploadDate(LocalDateTime.now());
            document.setLastModifiedDate(LocalDateTime.now());
            
            Document savedDocument = documentService.saveDocument(document);
            
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/documents/")
                    .path(savedDocument.getId().toString())
                    .path("/download")
                    .toUriString();
            
            DocumentResponse response = convertToResponse(savedDocument);
            response.setDownloadUrl(fileDownloadUri);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Could not upload document: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentUpdateRequest updateRequest) {
        
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userService.getUserById(userDetails.getId());
        
        Document document = documentService.getDocumentById(id);
        
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Document not found"));
        }
        
        // Check if document belongs to current user
        if (!document.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You don't have permission to update this document"));
        }
        
        DocumentCategory category = null;
        if (updateRequest.getCategoryId() != null) {
            category = categoryService.getCategoryById(updateRequest.getCategoryId());
            if (category == null) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Category not found"));
            }
        }
        
        document.setTitle(updateRequest.getTitle());
        document.setDescription(updateRequest.getDescription());
        document.setCategory(category);
        document.setDoctorName(updateRequest.getDoctorName());
        document.setHospitalName(updateRequest.getHospitalName());
        
        if (updateRequest.getDocumentDate() != null) {
            document.setDocumentDate(updateRequest.getDocumentDate());
        }
        
        document.setLastModifiedDate(LocalDateTime.now());
        
        Document updatedDocument = documentService.saveDocument(document);
        
        return ResponseEntity.ok(convertToResponse(updatedDocument));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userService.getUserById(userDetails.getId());
        
        Document document = documentService.getDocumentById(id);
        
        if (document == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Document not found"));
        }
        
        // Check if document belongs to current user
        if (!document.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You don't have permission to delete this document"));
        }
        
        try {
            // Delete file from storage
            fileStorageService.deleteFile(document.getFileName(), user.getId());
            
            // Delete document from database
            documentService.deleteDocument(id);
            
            return ResponseEntity.ok(new MessageResponse("Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Could not delete document: " + e.getMessage()));
        }
    }
    
    @GetMapping("/categories")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<List<DocumentCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    private UserDetailsImpl getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }
    
    private DocumentResponse convertToResponse(Document document) {
        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId());
        response.setTitle(document.getTitle());
        response.setDescription(document.getDescription());
        
        if (document.getCategory() != null) {
            response.setCategoryId(document.getCategory().getId());
            response.setCategoryName(document.getCategory().getName());
        }
        
        response.setFileType(document.getFileType());
        response.setFileSize(document.getFileSize());
        response.setDoctorName(document.getDoctorName());
        response.setHospitalName(document.getHospitalName());
        response.setDocumentDate(document.getDocumentDate());
        response.setUploadDate(document.getUploadDate());
        response.setLastModifiedDate(document.getLastModifiedDate());
        
        // Generate download URL
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/documents/")
                .path(document.getId().toString())
                .path("/download")
                .toUriString();
        response.setDownloadUrl(fileDownloadUri);
        
        return response;
    }
}