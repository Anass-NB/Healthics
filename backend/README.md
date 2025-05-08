# Healthics Backend

Healthics is a healthcare document management system that allows patients to securely store and organize their medical documents while providing administrators with tools to manage users and system statistics.

## Features

- **User Authentication**: Secure login/registration with JWT tokens and role-based access control
- **Patient Profile Management**: Patients can create and manage their personal and medical information
- **Document Management**: Upload, categorize, organize, and retrieve medical documents
- **Admin Dashboard**: System statistics and user management for administrators

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** with JWT for authentication
- **Spring Data JPA** for data persistence
- **MySQL** database
- **Maven** for dependency management

## Getting Started

### Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthics-backend.git
cd healthics-backend
```

2. Configure database in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/healthics?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

4. The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new patient
- `POST /api/auth/login` - Login for patients and admins

### Patient Profile
- `GET /api/patients/profile` - Get current patient profile
- `POST /api/patients/profile` - Create patient profile
- `PUT /api/patients/profile` - Update patient profile

### Document Management
- `GET /api/documents` - Get all documents for current patient
- `GET /api/documents/{id}` - Get document details
- `POST /api/documents` - Upload new document
- `PUT /api/documents/{id}` - Update document details
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/{id}/download` - Download document file
- `GET /api/documents/categories` - Get document categories

### Admin Endpoints
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/statistics` - Get system statistics
- `PUT /api/admin/patients/{id}/status` - Update patient account status

## Default Admin Account

Username: admin  
Password: admin123  
Email: admin@healthics.com

## Future Enhancements

- Machine learning integration for document classification
- Integration with external healthcare systems
- Enhanced analytics and reporting
- Mobile application support