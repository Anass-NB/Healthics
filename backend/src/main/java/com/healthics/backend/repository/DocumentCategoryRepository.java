package com.healthics.backend.repository;

import com.healthics.backend.model.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, Long> {
    Optional<DocumentCategory> findByName(String name);
    Boolean existsByName(String name);
}