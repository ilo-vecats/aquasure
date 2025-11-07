# AquaSure - Drinking Water Quality Check System

**Team Name:** PureLogic  
**Project:** Total Quality Management Assignment  
**Duration:** September 1 - October 15, 2024 (1.5 months)

A comprehensive MERN stack web application for monitoring and managing drinking water quality, implementing Total Quality Management (TQM) principles.

---

## 🎯 Project Overview

AquaSure is a quality control software application designed to:
- Collect and analyze drinking water quality samples
- Calculate quality indices based on WHO/EPA standards
- Provide real-time dashboards with control charts
- Generate quality reports for audits
- Track corrective actions and maintain audit trails

### Key Features
- ✅ Sample submission with automatic quality index calculation
- ✅ Real-time dashboard with control charts
- ✅ Quality reports with CSV export
- ✅ Sample verification and audit trails
- ✅ Corrective action tracking
- ✅ TQM-focused process controls

---

## 🏗️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **CSS3** - Styling

---

## 📁 Project Structure

```
AquaSure/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── models/
│   │   ├── Sample.js          # Sample data model
│   │   ├── Location.js        # Location model
│   │   └── User.js            # User model
│   ├── controllers/
│   │   └── sampleController.js # Business logic
│   ├── routes/
│   │   ├── samples.js         # Sample routes
│   │   └── auth.js            # Authentication routes
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── SampleForm.jsx # Sample submission
│   │   │   └── Reports.jsx    # Reports page
│   │   ├── App.js             # Main app component
│   │   ├── api.js             # API client
│   │   └── index.js           # Entry point
│   └── package.json
├── docs/
│   ├── SRS.md                 # Software Requirements Spec
│   ├── QualityAudit.md        # Quality audit checklist
│   └── PROJECT_SCHEDULE.md    # Project timeline
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tqm
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create backend `.env` file**
   ```env
   MONGO_URI=mongodb://localhost:27017/aquasure
   PORT=5001
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Create frontend `.env` file**
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   ```

### Running the Application

1. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5001`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   App will open in browser at `http://localhost:3000`

---

## 📊 API Endpoints

### Samples
- `POST /api/samples` - Create new sample
- `GET /api/samples` - Get all samples (with optional filters)
- `GET /api/samples/:id` - Get sample by ID
- `PUT /api/samples/:id` - Update sample
- `DELETE /api/samples/:id` - Delete sample
- `GET /api/samples/stats` - Get statistics
- `PATCH /api/samples/:id/verify` - Verify sample
- `POST /api/samples/:id/corrective-actions` - Add corrective action

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Health Check
- `GET /api/health` - Server health check

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Seed Database with Sample Data
To populate the database with realistic Jaipur water quality samples for testing/demonstration:
```bash
cd backend
npm run seed
```

This will add 25 representative samples from various Jaipur locations. See [docs/DATA_SOURCE.md](./docs/DATA_SOURCE.md) for details.

---

## 📈 Quality Index Calculation

The quality index (0-100) is calculated based on:

- **pH:** Ideal 7.0, acceptable 6.5-8.5
- **TDS:** Ideal < 500 mg/L
- **Turbidity:** Ideal < 1 NTU
- **Chlorine:** Ideal 0.2-0.5 mg/L

**Status Determination:**
- **Safe:** QI ≥ 80
- **Borderline:** 50 ≤ QI < 80
- **Unsafe:** QI < 50

---

## 🎯 TQM Integration

### PDCA Cycle
- **Plan:** Requirements and design (Weeks 1-2)
- **Do:** Development and implementation (Weeks 3-5)
- **Check:** Testing and quality assurance (Week 6)
- **Act:** Deployment and documentation (Week 7)

### TQM Principles Demonstrated
1. **Customer Focus** - User-friendly interface, clear quality indicators
2. **Continuous Improvement** - Control charts, trend analysis, corrective actions
3. **Process Controls** - Input validation, data integrity checks
4. **Data-Driven Decisions** - Quality index algorithm, statistical analysis
5. **Audit Trail** - Sample verification, corrective action tracking

### SIPOC Diagram
- **Suppliers:** Water quality inspectors, laboratory equipment
- **Inputs:** Water quality parameters, location, timestamps
- **Process:** Sample collection → Data entry → Quality calculation → Storage → Reporting
- **Outputs:** Quality indices, status classifications, reports, audit trails
- **Customers:** Water quality management, regulatory bodies, public health officials

---

## 📅 Project Schedule

See [PROJECT_SCHEDULE.md](./PROJECT_SCHEDULE.md) for detailed weekly breakdown.

**Timeline:** September 1 - October 15, 2024 (6.5 weeks)

---

## 📚 Documentation

- [Software Requirements Specification](./docs/SRS.md)
- [Quality Audit Checklist](./docs/QualityAudit.md)
- [Project Schedule](./PROJECT_SCHEDULE.md)

---

## 🚢 Deployment

### Quick Deploy Guide

For detailed step-by-step instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Free Hosting Options

**Backend:**
- **Render** (recommended): https://render.com - Free tier available
- **Railway**: https://railway.app - Free tier available

**Frontend:**
- **Vercel** (recommended): https://vercel.com - Excellent free tier
- **Netlify**: https://netlify.com - Free tier available

**Database:**
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas - Free tier (512MB)

### Quick Steps

1. **Set up MongoDB Atlas** (free database)
2. **Deploy backend** to Render/Railway
3. **Deploy frontend** to Vercel
4. **Set environment variables** in each platform
5. **Seed database** with sample data

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

---

## 👥 Team Roles

- **Project Manager:** Overall coordination, documentation
- **Backend Lead:** API development, database design
- **Frontend Lead:** UI/UX development, React components
- **QA Lead:** Testing, quality assurance, TQM implementation

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data

---

## 🐛 Known Issues

None currently. All issues resolved before deployment.

---

## 🔮 Future Enhancements

- Automated email alerts for unsafe samples
- Role-based access control UI
- Batch sample upload
- Mobile app version
- Laboratory equipment API integration
- Advanced analytics and machine learning predictions

---

## 📄 License

This project is created for educational purposes as part of Total Quality Management course assignment.

---

## 🙏 Acknowledgments

- WHO Guidelines for Drinking-water Quality
- EPA Drinking Water Standards
- TQM principles and methodologies

---

## 📞 Contact

**Team:** PureLogic  
**Project:** AquaSure - Drinking Water Quality Check System

---

**Last Updated:** October 2024

