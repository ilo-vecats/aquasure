# Setup Guide
## AquaSure - Quick Start Instructions

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with:

```env
MONGO_URI=mongodb://localhost:27017/aquasure
PORT=5001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

For MongoDB Atlas (cloud):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aquasure?retryWrites=true&w=majority
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

For production (after deploying backend):
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

### Quick Start Commands

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start Backend** (in backend directory)
   ```bash
   npm run dev
   ```

4. **Start Frontend** (in frontend directory, new terminal)
   ```bash
   npm start
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/aquasure`

**Option 2: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in backend `.env`

### Testing the Application

1. Open http://localhost:3000
2. Navigate to "Submit Sample"
3. Enter sample data:
   - Location: "Test Location"
   - pH: 7.0
   - TDS: 300
   - Turbidity: 0.5
   - Chlorine: 0.3
4. Submit and check Dashboard for results

### Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify `.env` file exists and has correct `MONGO_URI`
- Check port 5001 is not in use

**Frontend can't connect to backend:**
- Verify backend is running on port 5001
- Check `REACT_APP_API_URL` in frontend `.env` (should be http://localhost:5001/api)
- Check CORS settings in backend

**Database connection errors:**
- Verify MongoDB is running (local) or cluster is accessible (Atlas)
- Check connection string format
- Ensure network allows MongoDB connections (for Atlas)

