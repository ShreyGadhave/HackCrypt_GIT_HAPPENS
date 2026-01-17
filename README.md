# UniVerify - Automatic and Smart Student Attendance System

[![GitHub Stars](https://img.shields.io/github/stars/ShreyGadhave/HackCrypt_GIT_HAPPENS?style=social)](https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/ShreyGadhave/HackCrypt_GIT_HAPPENS?style=social)](https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/ShreyGadhave/HackCrypt_GIT_HAPPENS)](https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS/issues)
[![GitHub License](https://img.shields.io/github/license/ShreyGadhave/HackCrypt_GIT_HAPPENS)](https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS/blob/main/LICENSE)

An intelligent, automated student attendance system that leverages machine learning and modern web technologies to streamline attendance tracking in educational institutions. UniVerify eliminates manual attendance processes, reduces proxy attendance, and provides real-time analytics for administrators and faculty.

## 🌟 Features

### Core Functionality
- **Automated Attendance Tracking**: Utilizes ML-based recognition for accurate student identification
- **Real-time Processing**: Instant attendance recording and verification
- **Multi-Platform Support**: Web admin panel and mobile application
- **Proxy Detection**: Advanced algorithms to detect and prevent fraudulent attendance
- **Analytics Dashboard**: Comprehensive reports and insights for attendance patterns

### User Roles
- **Admin Panel**: Complete system management, user administration, and analytics
- **Student Interface**: View attendance records and personal statistics
- **Faculty Dashboard**: Mark and manage attendance for classes

### Technical Highlights
- Machine learning models for intelligent recognition
- RESTful API architecture
- Secure authentication and authorization
- Real-time data synchronization
- Export functionality (CSV, PDF reports)

## 🏗️ Project Structure

```
HackCrypt_GIT_HAPPENS/
│
├── UniVerify-App/          # Mobile application (React Native/Flutter)
│   ├── src/
│   ├── assets/
│   └── package.json
│
├── admin/                  # Admin dashboard (React/Next.js)
│   ├── components/
│   ├── pages/
│   └── styles/
│
├── server/                 # Backend API (Node.js/Express)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
│
├── ml-models/             # Machine Learning models (Python)
│   ├── training/
│   ├── models/
│   └── preprocessing/
│
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **Languages**: JavaScript (50.2%), TypeScript (31.3%), CSS (1.1%)
- **Frameworks**: React.js / Next.js
- **Mobile**: React Native / Flutter

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB / PostgreSQL / MySQL

### Machine Learning
- **Language**: Python (17.2%)
- **Libraries**: TensorFlow / PyTorch / OpenCV
- **Models**: Face Recognition / Image Processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **MongoDB** 
- **Git**

### For Mobile App Development
- **React Native CLI** or **Flutter SDK**
- **Android Studio** (for Android)
- **Xcode** (for iOS, macOS only)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS.git
cd HackCrypt_GIT_HAPPENS
```

### 2. Backend Setup

```bash
cd server
npm install

# Create environment variables file
cp .env.example .env

# Configure your database and API keys in .env
# Start the server
npm start
```

### 3. Admin Dashboard Setup

```bash
cd admin
npm install

# Configure API endpoints in config
npm run dev
```

### 4. Mobile App Setup

```bash
cd UniVerify-App
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 5. ML Models Setup

```bash
cd ml-models
pip install -r requirements.txt

# Train or load pre-trained models
python train_model.py
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=27017
DB_NAME=univerify
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# API Keys
ML_API_ENDPOINT=http://localhost:8000
STORAGE_BUCKET=your_cloud_storage_bucket

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

## 📱 Usage

### Admin Panel

1. Navigate to `http://localhost:3000` (or your deployed URL)
2. Login with admin credentials
3. Add students, faculty, and courses
4. Configure classes and schedules
5. View attendance reports and analytics

### Mobile App (Students/Faculty)

1. Download and install the UniVerify app
2. Login with provided credentials
3. Students can view their attendance records
4. Faculty can mark attendance for their classes
5. Receive notifications for attendance updates

### API Endpoints

```
POST   /api/auth/login              # User authentication
POST   /api/auth/register           # User registration
GET    /api/students                # Get all students
POST   /api/attendance/mark         # Mark attendance
GET    /api/attendance/report       # Get attendance reports
GET    /api/analytics/dashboard     # Dashboard analytics
```

## 🤖 ML Model Information

The system uses machine learning models for:

- **Face Recognition**: Identify students automatically
- **Image Processing**: Preprocess and enhance images
- **Proxy Detection**: Identify suspicious patterns
- **Analytics**: Predict attendance trends

### Model Training

```bash
cd ml-models
python train_model.py --dataset ./data --epochs 100 --batch-size 32
```

## 📊 Features in Detail

### Attendance Marking
- Multiple methods: Face recognition, QR codes, manual entry
- Geolocation verification (optional)
- Time-stamp recording
- Automatic notifications

### Reports and Analytics
- Daily, weekly, monthly attendance reports
- Student-wise attendance percentage
- Class-wise statistics
- Trend analysis and predictions
- Export to PDF, CSV, Excel

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Encrypted data transmission
- Secure storage of sensitive information
- Proxy detection algorithms

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Contributors

- **Shrey Gadhave** - [@ShreyGadhave](https://github.com/ShreyGadhave)
- And other amazing contributors

## 📧 Contact

For questions, suggestions, or support:

- **Email**: [Contact through GitHub](https://github.com/ShreyGadhave)
- **Issues**: [GitHub Issues](https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS/issues)

## 🙏 Acknowledgments

- Thanks to all contributors who helped build this project
- Special thanks to the open-source community
- Inspired by modern attendance management systems

## 🚦 Project Status

This project is actively maintained and under development. Check the [Issues](https://github.com/ShreyGadhave/HackCrypt_GIT_HAPPENS/issues) page for ongoing work and future features.

---

**Note**: This project was created for educational purposes and can be adapted for use in schools, colleges, and other educational institutions.

⭐ If you find this project useful, please consider giving it a star on GitHub!
