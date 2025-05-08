package com.healthics.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthics.backend.model.User;
import com.healthics.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    public boolean updateUserActiveStatus(Long userId, boolean active) {
        User user = getUserById(userId);
        user.setActive(active);
        userRepository.save(user);
        return user.isActive();
    }
}