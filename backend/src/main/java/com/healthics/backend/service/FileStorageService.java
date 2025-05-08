package com.healthics.backend.service;

import com.healthics.backend.config.FileStorageProperties;
import com.healthics.backend.exception.FileStorageException;
import com.healthics.backend.exception.FileNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    @Autowired
    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getLocation())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, Long userId) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Check if the file's name contains invalid characters
            if(originalFileName.contains("..")) {
                throw new FileStorageException("Filename contains invalid path sequence " + originalFileName);
            }
            
            // Generate unique filename to prevent overwriting
            String fileExtension = "";
            if(originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = userId + "_" + UUID.randomUUID().toString() + fileExtension;
            
            // Create user directory if it doesn't exist
            Path userDirectory = this.fileStorageLocation.resolve(userId.toString());
            if (!Files.exists(userDirectory)) {
                Files.createDirectories(userDirectory);
            }
            
            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = userDirectory.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName, Long userId) {
        try {
            Path filePath = this.fileStorageLocation.resolve(userId.toString()).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new FileNotFoundException("File not found " + fileName, ex);
        }
    }
    
    public void deleteFile(String fileName, Long userId) {
        try {
            Path filePath = this.fileStorageLocation.resolve(userId.toString()).resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file " + fileName, ex);
        }
    }
}