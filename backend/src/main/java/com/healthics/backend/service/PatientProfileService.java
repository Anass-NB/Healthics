package com.healthics.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthics.backend.model.PatientProfile;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.request.PatientProfileRequest;
import com.healthics.backend.repository.PatientProfileRepository;

@Service
public class PatientProfileService {
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    public PatientProfile getProfileByUser(User user) {
        return patientProfileRepository.findByUser(user).orElse(null);
    }
    
    public PatientProfile getProfileById(Long id) {
        return patientProfileRepository.findById(id).orElse(null);
    }
    
    public List<PatientProfile> getAllProfiles() {
        return patientProfileRepository.findAll();
    }
    
    public PatientProfile createProfile(User user, PatientProfileRequest profileRequest) {
        PatientProfile profile = new PatientProfile();
        profile.setUser(user);
        updateProfileFields(profile, profileRequest);
        return patientProfileRepository.save(profile);
    }
    
    public PatientProfile updateProfile(PatientProfile profile, PatientProfileRequest profileRequest) {
        updateProfileFields(profile, profileRequest);
        return patientProfileRepository.save(profile);
    }
    
    private void updateProfileFields(PatientProfile profile, PatientProfileRequest request) {
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setAddress(request.getAddress());
        profile.setMedicalHistory(request.getMedicalHistory());
        profile.setAllergies(request.getAllergies());
        profile.setMedications(request.getMedications());
        profile.setEmergencyContact(request.getEmergencyContact());
    }
}