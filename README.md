# Healthics - Healthcare Data Management System

Healthics is a secure web application designed to store and manage patient medical data with disease prediction capabilities through external API integration. Built on Spring Boot with MySQL database and React frontend, the platform provides a centralized repository for patient medical documents and offers robust security through role-based access control.

## Project Structure

This project consists of two main components:

- **Backend**: Spring Boot application with MySQL database
- **Frontend**: React application with TypeScript and Material UI

## Key Features

- **Role-Based Access Control**: Separate interfaces for patients and administrators
- **Patient Document Repository**: Centralized storage for all medical documents
- **Disease Prediction**: Integration with external APIs for disease prediction
- **Administrative Dashboard**: Analytics and patient statistics for administrators
- **Secure Data Management**: Complete patient profiles with medical history

## Getting Started

### Prerequisites

- Java 17+ for backend
- Node.js 14+ for frontend
- MySQL database
- Maven

### Backend Setup

1. Navigate to the backend directory:
```bash
cd healthics/backend
```

2. Configure the database connection in `src/main/resources/application.properties`

3. Build and run the application:
```bash
mvn spring-boot:run
```

The backend server will start at http://localhost:8080.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd healthics/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend application will be available at http://localhost:3000.

## Default Credentials

- Admin User:
  - Username: admin
  - Password: admin123

## User Roles

### Administrator

- View patient statistics and aggregated data
- Access system-wide analytics
- Manage user accounts
- Monitor system performance

### Patient

- Secure personal account access
- Upload and manage medical documents
- View personal health data and predictions
- Track health metrics over time

## Technology Stack

### Backend

- Framework: Spring Boot 3.x
- Security: Spring Security with role-based authentication
- Database: MySQL
- ORM: Spring Data JPA, Hibernate
- API: RESTful architecture
- Document Storage: File system with metadata in MySQL

### Frontend

- Framework: React.js with TypeScript
- State Management: React Context and Hooks
- UI Components: Material UI
- Data Visualization: Chart.js
- API Communication: Axios

## Documentation

- For backend documentation, see [backend/README.md](backend/README.md)
- For frontend documentation, see [frontend/README.md](frontend/README.md)