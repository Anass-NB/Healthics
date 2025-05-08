package com.healthics.backend.repository;

import com.healthics.backend.model.Document;
import com.healthics.backend.model.DocumentCategory;
import com.healthics.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUser(User user);
    List<Document> findByUserAndCategory(User user, DocumentCategory category);
    List<Document> findByUserOrderByUploadDateDesc(User user);
}