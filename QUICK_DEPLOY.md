# Quick Deployment Checklist
## Deploy AquaSure in 15 Minutes

### ✅ Step-by-Step Checklist

#### 1. MongoDB Atlas Setup (5 min)
- [ ] Sign up at https://www.mongodb.com/cloud/atlas
- [ ] Create free cluster (M0 Sandbox)
- [ ] Create database user (save password!)
- [ ] Whitelist IP: `0.0.0.0/0` (allow all)
- [ ] Copy connection string
- [ ] Replace `<password>` and `<dbname>` in connection string

#### 2. Push to GitHub (2 min)
- [ ] Create GitHub repository
- [ ] Push your code:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/yourusername/aquasure.git
  git push -u origin main
  ```

#### 3. Deploy Backend - Render (5 min)
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] New → Web Service
- [ ] Connect repository
- [ ] Settings:
  - Build: `cd backend && npm install`
  - Start: `cd backend && npm start`
- [ ] Add env vars:
  - `MONGO_URI` = your MongoDB connection string
  - `JWT_SECRET` = any random string
  - `NODE_ENV` = `production`
- [ ] Deploy (wait 5-10 min)
- [ ] Copy backend URL

#### 4. Deploy Frontend - Vercel (3 min)
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Import repository
- [ ] Settings:
  - Root Directory: `frontend`
  - Framework: Create React App
- [ ] Add env var:
  - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
- [ ] Deploy (wait 2-3 min)
- [ ] Copy frontend URL

#### 5. Seed Database (1 min)
- [ ] Update local `.env` with production MongoDB URI
- [ ] Run: `cd backend && npm run seed`
- [ ] Verify data in dashboard

### 🎉 Done!

**Your URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: MongoDB Atlas (cloud)

### 📝 Notes

- Render free tier sleeps after 15 min (first request may be slow)
- All services are free for demo purposes
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed help

