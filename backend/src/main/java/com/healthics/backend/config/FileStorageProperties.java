package com.healthics.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "app.file.storage")
@Getter
@Setter
public class FileStorageProperties {
    private String location;
}