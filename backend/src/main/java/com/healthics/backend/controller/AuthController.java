// Fix for AuthController.java
// Focus on the login method to ensure it works properly

package com.healthics.backend.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.healthics.backend.model.ERole;
import com.healthics.backend.model.Role;
import com.healthics.backend.model.User;
import com.healthics.backend.payload.request.LoginRequest;
import com.healthics.backend.payload.request.SignupRequest;
import com.healthics.backend.payload.response.JwtResponse;
import com.healthics.backend.payload.response.MessageResponse;
import com.healthics.backend.repository.RoleRepository;
import com.healthics.backend.repository.UserRepository;
import com.healthics.backend.security.jwt.JwtUtils;
import com.healthics.backend.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Print debug info to diagnose the issue
            System.out.println("Login attempt for username: " + loginRequest.getUsername());

            // Check if user exists
            if (!userRepository.existsByUsername(loginRequest.getUsername())) {
                System.out.println("User does not exist: " + loginRequest.getUsername());
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: User does not exist!"));
            }

            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has roles
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                System.out.println("User has no roles: " + loginRequest.getUsername());

                // Fix: Assign PATIENT role if none exists
                Set<Role> roles = new HashSet<>();
                Role patientRole = roleRepository.findByName(ERole.ROLE_PATIENT)
                        .orElseThrow(() -> new RuntimeException("Role not found"));
                roles.add(patientRole);
                user.setRoles(roles);
                userRepository.save(user);

                System.out.println("Assigned PATIENT role to user: " + loginRequest.getUsername());
            }

            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            System.out.println("Login successful for: " + loginRequest.getUsername());
            System.out.println("User roles: " + roles);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles));
        } catch (Exception e) {
            System.out.println("Login error for " + loginRequest.getUsername() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            System.out.println("Registration attempt for username: " + signUpRequest.getUsername());

            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Username is already taken!"));
            }

            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            // Create new user's account
            User user = new User(signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    encoder.encode(signUpRequest.getPassword()));

            Set<String> strRoles = signUpRequest.getRole();
            Set<Role> roles = new HashSet<>();

            if (strRoles == null || strRoles.isEmpty()) {
                System.out.println("No role specified, assigning PATIENT role by default");
                Role patientRole = roleRepository.findByName(ERole.ROLE_PATIENT)
                        .orElseThrow(() -> new RuntimeException("Error: Role PATIENT is not found."));
                roles.add(patientRole);
            } else {
                strRoles.forEach(role -> {
                    System.out.println("Assigning role: " + role);
                    switch (role) {
                        case "admin":
                            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                    .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));
                            roles.add(adminRole);
                            break;
                        case "patient":
                        default:
                            Role patientRole = roleRepository.findByName(ERole.ROLE_PATIENT)
                                    .orElseThrow(() -> new RuntimeException("Error: Role PATIENT is not found."));
                            roles.add(patientRole);
                    }
                });
            }

            // Print roles for debugging
            System.out.println("Roles to be assigned: " + roles.size());
            for (Role role : roles) {
                System.out.println("Role: " + role.getName());
            }

            user.setRoles(roles);
            userRepository.save(user);

            System.out.println("User registered successfully: " + signUpRequest.getUsername());
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            System.out.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error during registration: " + e.getMessage()));
        }
    }
}