# Gyanjyoti Foundation - Backend API

Backend server for the Gyanjyoti Foundation Admin Panel built with Node.js, Express, and MongoDB.

## Features

- RESTful API architecture
- JWT authentication & authorization
- Role-based access control (Admin & Teacher)
- MongoDB database with Mongoose ODM
- Secure password hashing with bcrypt
- CORS enabled
- Environment-based configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## Project Structure

```
server/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   └── authController.js     # Authentication logic
├── middleware/
│   └── authMiddleware.js     # Auth & authorization middleware
├── models/
│   ├── User.js              # User model
│   ├── Student.js           # Student model
│   ├── Attendance.js        # Attendance model
│   ├── Session.js           # Session model
│   └── File.js              # File model
├── routes/
│   ├── authRoutes.js        # Auth routes
│   ├── userRoutes.js        # User routes
│   ├── studentRoutes.js     # Student routes
│   ├── attendanceRoutes.js  # Attendance routes
│   ├── sessionRoutes.js     # Session routes
│   └── fileRoutes.js        # File routes
├── utils/
│   └── tokenUtils.js        # JWT token utilities
├── .env                     # Environment variables
├── .gitignore
├── index.js                 # Entry point
└── package.json
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` and update values
   - Set MongoDB URI
   - Set JWT secret

3. Start MongoDB server (if running locally)

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on `http://localhost:5000`

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gyanjyoti_admin
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users (Admin only)
- `GET /api/users` - Get all users

### Students
- `GET /api/students` - Get all students

### Attendance
- `GET /api/attendance` - Get attendance records

### Sessions
- `GET /api/sessions` - Get all sessions

### Files
- `GET /api/files` - Get all files

## Models

### User
- name, email, password, role (admin/teacher), subject, phoneNumber

### Student
- name, rollNo, class, section, gender, dateOfBirth, parentInfo

### Attendance
- student, date, status, session, markedBy, remarks

### Session
- title, subject, topic, date, time, duration, class, teacher

### File
- name, description, category, subject, fileUrl, uploadedBy

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes with middleware
- Role-based authorization
- CORS configuration
- Input validation

## Development

- Uses nodemon for auto-restart during development
- Error handling middleware
- Async/await pattern
- RESTful API design principles

## License

ISC
