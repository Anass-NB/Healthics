package com.healthics.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.healthics.backend.model.PatientProfile;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.request.PatientProfileRequest;
import com.healthics.backend.payload.response.MessageResponse;
import com.healthics.backend.security.services.UserDetailsImpl;
import com.healthics.backend.service.PatientProfileService;
import com.healthics.backend.service.UserService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/patients")
public class PatientController {
    
    @Autowired
    private PatientProfileService patientProfileService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getPatientProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userService.getUserById(userDetails.getId());
        PatientProfile profile = patientProfileService.getProfileByUser(user);
        
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Profile not found. Please create one."));
        }
        
        return ResponseEntity.ok(profile);
    }
    
    @PostMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createPatientProfile(@Valid @RequestBody PatientProfileRequest profileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userService.getUserById(userDetails.getId());
        
        // Check if profile already exists
        if (patientProfileService.getProfileByUser(user) != null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Profile already exists. Use PUT to update."));
        }
        
        PatientProfile profile = patientProfileService.createProfile(user, profileRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }
    
    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> updatePatientProfile(@Valid @RequestBody PatientProfileRequest profileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userService.getUserById(userDetails.getId());
        
        // Check if profile exists
        PatientProfile existingProfile = patientProfileService.getProfileByUser(user);
        if (existingProfile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Profile not found. Please create one first."));
        }
        
        PatientProfile updatedProfile = patientProfileService.updateProfile(existingProfile, profileRequest);
        return ResponseEntity.ok(updatedProfile);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        PatientProfile profile = patientProfileService.getProfileById(id);
        
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Patient profile not found"));
        }
        
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPatients() {
        return ResponseEntity.ok(patientProfileService.getAllProfiles());
    }
}