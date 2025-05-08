package com.healthics.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthics.backend.model.DocumentCategory;
import com.healthics.backend.repository.DocumentCategoryRepository;

@Service
public class DocumentCategoryService {
    
    @Autowired
    private DocumentCategoryRepository categoryRepository;
    
    public List<DocumentCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public DocumentCategory getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
    
    public DocumentCategory getCategoryByName(String name) {
        return categoryRepository.findByName(name).orElse(null);
    }
    
    public DocumentCategory createCategory(String name, String description) {
        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Category with this name already exists");
        }
        
        DocumentCategory category = new DocumentCategory();
        category.setName(name);
        category.setDescription(description);
        
        return categoryRepository.save(category);
    }
    
    public boolean deleteCategory(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}