// Check and fix the DatabaseSeeder.java file
// Make sure this runs properly when the application starts

package com.healthics.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.healthics.backend.model.DocumentCategory;
import com.healthics.backend.model.ERole;
import com.healthics.backend.model.Role;
import com.healthics.backend.model.User;
import com.healthics.backend.repository.DocumentCategoryRepository;
import com.healthics.backend.repository.RoleRepository;
import com.healthics.backend.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentCategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing database with default roles and admin user...");

        // Initialize roles if they don't exist
        initRoles();

        // Initialize document categories if they don't exist
        initCategories();

        // Create admin user if it doesn't exist
        createAdminUser();

        System.out.println("Database initialization completed.");
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            System.out.println("Creating roles...");
            roleRepository.save(new Role(ERole.ROLE_PATIENT));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Roles initialized");
        } else {
            System.out.println("Roles already exist. Count: " + roleRepository.count());
            roleRepository.findAll().forEach(role -> {
                System.out.println("Role: " + role.getName());
            });
        }
    }

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            System.out.println("Creating document categories...");
            categoryRepository.save(new DocumentCategory(null, "Lab Results", "Laboratory test results"));
            categoryRepository.save(new DocumentCategory(null, "Prescriptions", "Medication prescriptions"));
            categoryRepository.save(new DocumentCategory(null, "Doctor Notes", "Clinical visit notes"));
            categoryRepository.save(new DocumentCategory(null, "Imaging", "X-rays, MRIs, CT scans, etc."));
            categoryRepository.save(new DocumentCategory(null, "Vaccination Records", "Immunization history"));
            categoryRepository.save(new DocumentCategory(null, "Insurance", "Insurance documents and claims"));
            categoryRepository.save(new DocumentCategory(null, "Hospital Records", "Hospitalization records"));
            categoryRepository.save(new DocumentCategory(null, "Surgical Records", "Surgery reports and follow-ups"));
            System.out.println("Document categories initialized");
        } else {
            System.out.println("Categories already exist");
        }
    }

    private void createAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            System.out.println("Creating admin user...");
            User admin = new User("admin", "admin@healthics.com", encoder.encode("admin123"));

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role not found."));
            roles.add(adminRole);

            admin.setRoles(roles);
            userRepository.save(admin);
            System.out.println("Admin user created");
        } else {
            System.out.println("Admin user already exists");
        }
    }
}