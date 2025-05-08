# Healthics Frontend

A React+Vite frontend application for the Healthics medical document management system.

## Features

- User authentication (login/register) for patients
- Patient profile management
- Medical document upload and management
- Admin dashboard for system statistics and patient management

## Technologies Used

- React 18
- TypeScript
- Vite
- React Router for navigation
- Mantine UI for components and styling
- Axios for API requests
- React Hook Form for form handling

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running at `http://localhost:8080`

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   
This will start the application at `http://localhost:8001`

## API Endpoints

The application connects to the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new patient
- `POST /api/auth/login` - Login user and get JWT token

### Patient Profile
- `POST /api/patients/profile` - Create patient profile
- `GET /api/patients/profile` - Get current patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/:id` - Get patient by ID (Admin only)

### Document Management
- `GET /api/documents/categories` - Get document categories
- `POST /api/documents` - Upload a document
- `GET /api/documents` - Get all patient documents
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Admin
- `GET /api/admin/patients` - Get all patients (Admin only)
- `GET /api/admin/statistics` - Get system statistics (Admin only)
- `PUT /api/admin/patients/:id/status` - Update patient status (Admin only)

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create optimized production files in the `dist` directory.