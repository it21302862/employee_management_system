# Employee Attendance Management System

## Overview

The Employee Attendance Management System is a web application designed to help organizations track employee attendance efficiently. It supports role-based access with Admin and Employee users. Employees can mark check-ins and check-outs, while admins can view and manage attendance records and reports.

## Features

### User Roles
- Admin: Manage employees and attendance data.
- Employee: Check-in/check-out and view own attendance logs.

### Authentication
- Secure JWT-based login and registration.
- Role-based route protection.

### Attendance Management
- Employees can mark daily check-in and check-out.
- Attendance logs include timestamps and optional notes.
- Admin dashboard to view all check in records and generate reports.
- Admin dashboard to to get monthly charts, manage members, and view attendance logs.

## Technology Stack

- Frontend: React, Material-UI (MUI)
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JSON Web Tokens (JWT)
- Testing: Jest and Supertest
- Utilities: Moment.js for date/time formatting

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
```
https://github.com/it21302862/employee_management_system.git
```

cd employee-attendance-system

2. Backend setup:
```
cd server
npm install
```
3. Create a `.env` file in the backend directory with:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
4. Run the backend server:
```
npm run dev
```

5. Frontend setup:
```
cd client
npm install
npm start
```

## Project Structure

### Backend
- `controllers/` — Request handlers
- `models/` — MongoDB schemas
- `middleware/` — Auth and authorization
- `routes/` — API routes
- `test/` — Unit test cases
- `mock/` — mock for testing

### Frontend
- `components/` — React UI components
- `context/` — Auth Context Provider
- `routes/` — Protected routes
- `pages/` — Application pages
- `scenes/` — Sider bar navigation sub components

## Docker Setup (Optional)
If you’ve containerized your backend and/or frontend using Docker, this section will guide users on how to build and run the application using Docker.

Requirements
Docker

Docker Compose (if using a multi-container setup)

Docker Commands
Build and run the containers:
```
docker-compose up --build
```

## Running Tests
To run unit tests for the backend:

Navigate to the backend folder:
```
cd server
```

Run tests:
```
npm test
```