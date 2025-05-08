package com.healthics.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "patient_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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