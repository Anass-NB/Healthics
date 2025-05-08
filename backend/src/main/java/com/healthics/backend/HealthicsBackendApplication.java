package com.healthics.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.healthics.backend.config.FileStorageProperties;

@SpringBootApplication
@EnableConfigurationProperties({
    FileStorageProperties.class
})
public class HealthicsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthicsBackendApplication.class, args);
    }
}