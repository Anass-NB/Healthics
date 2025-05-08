package com.healthics.backend.payload.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PatientProfileRequest {
    
    @NotBlank
    @Size(max = 50)
    private String firstName;
    
    @NotBlank
    @Size(max = 50)
    private String lastName;
    
    private LocalDate dateOfBirth;
    
    @Size(max = 20)
    private String phoneNumber;
    
    @Size(max = 200)
    private String address;
    
    @Size(max = 1000)
    private String medicalHistory;
    
    @Size(max = 500)
    private String allergies;
    
    @Size(max = 500)
    private String medications;
    
    @Size(max = 500)
    private String emergencyContact;
}