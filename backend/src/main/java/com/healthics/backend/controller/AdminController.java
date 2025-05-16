package com.healthics.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.healthics.backend.model.Document;
import com.healthics.backend.model.PatientProfile;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.response.DocumentResponse;
import com.healthics.backend.payload.response.MessageResponse;
import com.healthics.backend.payload.response.StatisticsResponse;
import com.healthics.backend.repository.PatientProfileRepository;
import com.healthics.backend.repository.UserRepository;
import com.healthics.backend.service.AdminService;
import com.healthics.backend.service.DocumentService;
import com.healthics.backend.service.FileStorageService;
import com.healthics.backend.service.PatientProfileService;
import com.healthics.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private PatientProfileService patientProfileService;

    @Autowired
    private UserService userService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @GetMapping("/patients")
    public ResponseEntity<List<PatientProfile>> getAllPatients() {
        List<PatientProfile> patients = patientProfileService.getAllProfiles();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPatientsIncludingIncomplete() {
        // This endpoint returns all users with ROLE_PATIENT, even those without profiles
        return ResponseEntity.ok(adminService.getAllPatientUsers());
    }

    @GetMapping("/patients/with-profiles")
    public ResponseEntity<List<Map<String, Object>>> getAllPatientsWithProfiles() {
        // This endpoint returns detailed patient information with profiles
        return ResponseEntity.ok(adminService.getAllPatientsWithProfiles());
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> getSystemStatistics() {
        StatisticsResponse statistics = adminService.getSystemStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/statistics/extended")
    public ResponseEntity<Map<String, Object>> getExtendedStatistics() {
        // Get extended statistics for charts and visualizations
        return ResponseEntity.ok(adminService.getExtendedStatistics());
    }

    @PutMapping("/patients/{id}/status")
    public ResponseEntity<?> updatePatientStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        try {
            boolean status = userService.updateUserActiveStatus(id, active);
            String statusText = status ? "activated" : "deactivated";
            return ResponseEntity.ok(new MessageResponse("User account has been " + statusText));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/patients/{id}/ban")
    public ResponseEntity<?> banPatient(
            @PathVariable Long id,
            @RequestParam boolean banned) {

        try {
            User updatedUser = adminService.banPatient(id, banned);
            String statusText = banned ? "banned" : "unbanned";
            return ResponseEntity.ok(new MessageResponse("Patient has been " + statusText));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all documents for a specific patient (Admin only)
     */
    @GetMapping("/patients/{id}/documents")
    public ResponseEntity<?> getPatientDocuments(@PathVariable Long id) {
        try {
            // First try to find the user directly
            User user = null;
            try {
                user = userRepository.findById(id).orElse(null);
            } catch (Exception e) {
                System.out.println("Error finding user by ID: " + e.getMessage());
                // Continue with other approaches
            }

            // If user not found, try to find by patient profile
            if (user == null) {
                try {
                    // Try to find patient profile with this ID
                    PatientProfile profile = patientProfileRepository.findById(id).orElse(null);
                    if (profile != null) {
                        user = profile.getUser();
                    }
                } catch (Exception e) {
                    System.out.println("Error finding patient profile by ID: " + e.getMessage());
                }
            }

            // If still not found, try direct document query
            if (user == null) {
                // If the user is not found, we can bypass the user lookup and directly
                // search for documents with this user ID
                List<Document> documents = documentService.getDocumentsByPatientId(id);

                if (!documents.isEmpty()) {
                    // If we found documents, convert and return them
                    List<DocumentResponse> responses = documents.stream()
                            .map(this::convertToResponse)
                            .collect(Collectors.toList());

                    return ResponseEntity.ok(responses);
                } else {
                    // No documents found for this ID
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new MessageResponse("Patient with ID " + id + " not found or has no documents"));
                }
            }

            // Get the documents using the found user
            List<Document> documents = documentService.getDocumentsByUser(user);
            List<DocumentResponse> responses = documents.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving patient documents: " + e.getMessage()));
        }
    }

    /**
     * Download a document as admin
     */
    @GetMapping("/documents/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id, HttpServletRequest request) {
        try {
            Document document = documentService.getDocumentById(id);

            if (document == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Document not found"));
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
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error downloading document: " + e.getMessage()));
        }
    }

    /**
     * Get all documents in the system (Admin only)
     */
    @GetMapping("/documents")
    public ResponseEntity<?> getAllDocuments() {
        try {
            List<Document> documents = documentService.getAllDocuments();
            List<DocumentResponse> responses = documents.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving all documents: " + e.getMessage()));
        }
    }

    /**
     * Helper method to convert Document to DocumentResponse
     */
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

        // Add user information
        response.setUserId(document.getUser().getId());
        response.setUsername(document.getUser().getUsername());

        // Generate download URL for admin route
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/admin/documents/")
                .path(document.getId().toString())
                .path("/download")
                .toUriString();
        response.setDownloadUrl(fileDownloadUri);

        return response;
    }
}