package com.healthics.backend.repository;

import com.healthics.backend.model.PatientProfile;
import com.healthics.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUser(User user);
}