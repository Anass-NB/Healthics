package com.healthics.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.healthics.backend.model.PatientProfile;
import com.healthics.backend.payload.response.MessageResponse;
import com.healthics.backend.payload.response.StatisticsResponse;
import com.healthics.backend.service.AdminService;
import com.healthics.backend.service.PatientProfileService;
import com.healthics.backend.service.UserService;

import java.util.List;

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
    
    @GetMapping("/patients")
    public ResponseEntity<List<PatientProfile>> getAllPatients() {
        List<PatientProfile> patients = patientProfileService.getAllProfiles();
        return ResponseEntity.ok(patients);
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> getSystemStatistics() {
        StatisticsResponse statistics = adminService.getSystemStatistics();
        return ResponseEntity.ok(statistics);
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
}