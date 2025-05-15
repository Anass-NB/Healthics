package com.healthics.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthics.backend.model.Document;
import com.healthics.backend.model.DocumentCategory;
import com.healthics.backend.model.User;
import com.healthics.backend.repository.DocumentRepository;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    /**
     * Get all documents sorted by upload date (newest first)
     * @return List of all documents
     */
    public List<Document> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadDateDesc();
    }

    /**
     * Get documents by patient ID
     * @param userId The user ID
     * @return List of documents for that user
     */
    public List<Document> getDocumentsByPatientId(Long userId) {
        return documentRepository.findByUserIdOrderByUploadDateDesc(userId);
    }

    public List<Document> getDocumentsByUser(User user) {
        return documentRepository.findByUserOrderByUploadDateDesc(user);
    }

    public List<Document> getDocumentsByUserAndCategory(User user, DocumentCategory category) {
        return documentRepository.findByUserAndCategory(user, category);
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id).orElse(null);
    }

    public Document saveDocument(Document document) {
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }
}