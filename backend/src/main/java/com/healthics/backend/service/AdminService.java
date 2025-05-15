package com.healthics.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthics.backend.model.Document;
import com.healthics.backend.model.ERole;
import com.healthics.backend.model.PatientProfile;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.response.StatisticsResponse;
import com.healthics.backend.repository.DocumentRepository;
import com.healthics.backend.repository.PatientProfileRepository;
import com.healthics.backend.repository.RoleRepository;
import com.healthics.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private DocumentRepository documentRepository;

    public StatisticsResponse getSystemStatistics() {
        StatisticsResponse statistics = new StatisticsResponse();

        // Get all users with PATIENT role
        List<User> patients = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == ERole.ROLE_PATIENT))
                .collect(Collectors.toList());

        statistics.setTotalPatients(patients.size());

        // Count active/inactive patients
        statistics.setActiveUsers(patients.stream().filter(User::isActive).count());
        statistics.setInactiveUsers(patients.stream().filter(user -> !user.isActive()).count());

        // Get all documents
        List<Document> allDocuments = documentRepository.findAll();
        statistics.setTotalDocuments(allDocuments.size());

        // Calculate total storage used
        long totalStorageBytes = allDocuments.stream()
                .mapToLong(Document::getFileSize)
                .sum();
        statistics.setTotalStorageUsed(totalStorageBytes);

        // Get today's uploads
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        long todayUploads = allDocuments.stream()
                .filter(doc -> doc.getUploadDate().isAfter(startOfDay) && doc.getUploadDate().isBefore(endOfDay))
                .count();
        statistics.setDocumentsUploadedToday(todayUploads);

        // Get this month's uploads
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = LocalDateTime.of(currentMonth.atDay(1), LocalTime.MIN);
        LocalDateTime endOfMonth = LocalDateTime.of(currentMonth.atEndOfMonth(), LocalTime.MAX);

        long monthUploads = allDocuments.stream()
                .filter(doc -> doc.getUploadDate().isAfter(startOfMonth) && doc.getUploadDate().isBefore(endOfMonth))
                .count();
        statistics.setDocumentsUploadedThisMonth(monthUploads);

        return statistics;
    }

    /**
     * Get all patient users, including those without profiles
     * @return List of all patient users with basic info
     */
    public List<Map<String, Object>> getAllPatientUsers() {
        // Get all users with PATIENT role
        List<User> patientUsers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == ERole.ROLE_PATIENT))
                .collect(Collectors.toList());

        // Convert to a list of maps with user info
        return patientUsers.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            userMap.put("active", user.isActive());
            userMap.put("banned", user.isBanned());

            // Check if user has a profile
            Optional<PatientProfile> profile = patientProfileRepository.findByUser(user);
            if (profile.isPresent()) {
                PatientProfile p = profile.get();
                userMap.put("hasProfile", true);
                userMap.put("firstName", p.getFirstName());
                userMap.put("lastName", p.getLastName());
                userMap.put("profileId", p.getId());
            } else {
                userMap.put("hasProfile", false);
            }

            // Count documents for this user
            long documentCount = documentRepository.findByUser(user).size();
            userMap.put("documentCount", documentCount);

            return userMap;
        }).collect(Collectors.toList());
    }

    /**
     * Get all patients with their profiles
     * @return List of patients with complete profile info
     */
    public List<Map<String, Object>> getAllPatientsWithProfiles() {
        List<PatientProfile> profiles = patientProfileRepository.findAll();

        return profiles.stream().map(profile -> {
            Map<String, Object> patientMap = new HashMap<>();
            patientMap.put("id", profile.getId());
            patientMap.put("firstName", profile.getFirstName());
            patientMap.put("lastName", profile.getLastName());
            patientMap.put("dateOfBirth", profile.getDateOfBirth());
            patientMap.put("phoneNumber", profile.getPhoneNumber());
            patientMap.put("address", profile.getAddress());
            patientMap.put("medicalHistory", profile.getMedicalHistory());
            patientMap.put("allergies", profile.getAllergies());
            patientMap.put("medications", profile.getMedications());
            patientMap.put("emergencyContact", profile.getEmergencyContact());

            User user = profile.getUser();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            userMap.put("active", user.isActive());
            userMap.put("banned", user.isBanned());

            patientMap.put("user", userMap);

            // Count documents for this user
            long documentCount = documentRepository.findByUser(user).size();
            patientMap.put("documentCount", documentCount);

            return patientMap;
        }).collect(Collectors.toList());
    }

    /**
     * Update patient's ban status
     * @param userId The user ID
     * @param banned The ban status to set
     * @return The updated User entity
     */
    public User banPatient(Long userId, boolean banned) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.setBanned(banned);

        // If banning, also set active to false
        if (banned) {
            user.setActive(false);
        }

        return userRepository.save(user);
    }

    /**
     * Get extended statistics for admin dashboard
     * @return Map containing various statistics for charts and visualizations
     */
    public Map<String, Object> getExtendedStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Get all users with PATIENT role
        List<User> patients = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == ERole.ROLE_PATIENT))
                .collect(Collectors.toList());

        // Get all documents
        List<Document> allDocuments = documentRepository.findAll();

        // Basic counts
        stats.put("totalPatients", patients.size());
        stats.put("totalDocuments", allDocuments.size());
        stats.put("activePatients", patients.stream().filter(User::isActive).count());
        stats.put("inactivePatients", patients.stream().filter(user -> !user.isActive()).count());
        stats.put("bannedPatients", patients.stream().filter(User::isBanned).count());
        stats.put("patientsWithoutProfiles", patients.stream()
                .filter(user -> !patientProfileRepository.findByUser(user).isPresent())
                .count());

        // Calculate total storage used
        long totalStorageBytes = allDocuments.stream()
                .mapToLong(Document::getFileSize)
                .sum();
        stats.put("totalStorageUsed", totalStorageBytes);

        // Monthly document uploads for the last 6 months
        Map<String, Long> monthlyUploads = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            YearMonth yearMonth = YearMonth.of(date.getYear(), date.getMonth());

            LocalDateTime startOfMonth = LocalDateTime.of(yearMonth.atDay(1), LocalTime.MIN);
            LocalDateTime endOfMonth = LocalDateTime.of(yearMonth.atEndOfMonth(), LocalTime.MAX);

            long count = allDocuments.stream()
                    .filter(doc -> doc.getUploadDate().isAfter(startOfMonth) &&
                            doc.getUploadDate().isBefore(endOfMonth))
                    .count();

            monthlyUploads.put(date.getMonth().toString(), count);
        }
        stats.put("monthlyUploads", monthlyUploads);

        // Document types distribution
        Map<String, Long> documentTypes = allDocuments.stream()
                .filter(doc -> doc.getCategory() != null)
                .collect(Collectors.groupingBy(
                        doc -> doc.getCategory().getName(),
                        Collectors.counting()
                ));
        stats.put("documentTypes", documentTypes);

        // Patient registration over time (by month for the last 6 months)
        Map<String, Long> patientRegistrations = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            YearMonth yearMonth = YearMonth.of(date.getYear(), date.getMonth());

            LocalDateTime startOfMonth = LocalDateTime.of(yearMonth.atDay(1), LocalTime.MIN);
            LocalDateTime endOfMonth = LocalDateTime.of(yearMonth.atEndOfMonth(), LocalTime.MAX);

            long count = patients.stream()
                    .filter(user -> user.getCreatedAt().isAfter(startOfMonth) &&
                            user.getCreatedAt().isBefore(endOfMonth))
                    .count();

            patientRegistrations.put(date.getMonth().toString(), count);
        }
        stats.put("patientRegistrations", patientRegistrations);

        return stats;
    }
}