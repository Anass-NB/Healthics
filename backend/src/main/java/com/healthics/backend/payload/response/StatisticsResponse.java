package com.healthics.backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsResponse {
    private long totalPatients;
    private long totalDocuments;
    private long totalStorageUsed; // in bytes
    private long activeUsers;
    private long inactiveUsers;
    private long documentsUploadedToday;
    private long documentsUploadedThisMonth;
}