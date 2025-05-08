package com.healthics.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthics.backend.model.Document;
import com.healthics.backend.model.ERole;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.response.StatisticsResponse;
import com.healthics.backend.repository.DocumentRepository;
import com.healthics.backend.repository.PatientProfileRepository;
import com.healthics.backend.repository.RoleRepository;
import com.healthics.backend.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
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
}