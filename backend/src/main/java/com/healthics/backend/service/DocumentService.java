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