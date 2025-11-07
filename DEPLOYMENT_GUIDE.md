# Deployment Guide - Free Hosting
## AquaSure - Deploy to Production for Free

This guide will help you deploy your MERN stack application using free hosting services.

---

## 🎯 Deployment Strategy

**Backend:** Render or Railway (free tier)  
**Frontend:** Vercel (free tier, best for React)  
**Database:** MongoDB Atlas (free tier)

---

## 📋 Prerequisites

1. GitHub account (free)
2. MongoDB Atlas account (free)
3. Render/Railway account (free)
4. Vercel account (free)

---

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google/GitHub or email

### 1.2 Create a Cluster
1. Choose **FREE** tier (M0 Sandbox)
2. Select a cloud provider (AWS recommended)
3. Choose a region closest to you
4. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Set Up Database Access
1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `aquasure` (or keep default)

**Example connection string:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aquasure?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Backend for Deployment

1. **Create a GitHub repository** (if you haven't):
   ```bash
   cd /Users/user1/Documents/tqm
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub and push
   git remote add origin https://github.com/yourusername/aquasure.git
   git push -u origin main
   ```

2. **Update backend/server.js** to handle production:
   ```javascript
   // Already done - server.js is ready
   ```

### 2.2 Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select your repository
6. Configure:
   - **Name:** `aquasure-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** Leave empty (or set to `backend` if needed)

7. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add these:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aquasure?retryWrites=true&w=majority
     PORT=10000
     JWT_SECRET=your-secret-key-change-this
     NODE_ENV=production
     ```
   - Replace with your actual MongoDB connection string

8. Click "Create Web Service"
9. Wait for deployment (5-10 minutes)
10. Copy your backend URL (e.g., `https://aquasure-backend.onrender.com`)

---

## Alternative: Deploy Backend to Railway

### Railway Setup (Alternative to Render)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add service → Select "backend" folder
6. Add environment variables:
   - `MONGO_URI` (your MongoDB connection string)
   - `PORT` (Railway sets this automatically)
   - `JWT_SECRET` (your secret key)
   - `NODE_ENV=production`
7. Deploy automatically happens
8. Get your backend URL from Railway dashboard

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend

1. **Create frontend/.env.production** (optional, can set in Vercel):
   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Update frontend/package.json** (add build script if missing):
   ```json
   "scripts": {
     "start": "react-scripts start",
     "build": "react-scripts build",
     "test": "react-scripts test"
   }
   ```

### 3.2 Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com/api
     ```
   - Replace with your actual backend URL from Render/Railway

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. Your app will be live at `https://your-project.vercel.app`

---

## Step 4: Update CORS Settings

### 4.1 Update Backend CORS

Your backend already has CORS enabled, but you may need to update it:

**backend/server.js** (already configured):
```javascript
app.use(cors()); // This allows all origins - fine for free tier
```

For production, you can restrict to your frontend URL:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

---

## Step 5: Seed Production Database

### 5.1 Option 1: Run Seed Script Locally

1. Update your local `.env` with production MongoDB URI
2. Run:
   ```bash
   cd backend
   npm run seed
   ```

### 5.2 Option 2: Add Seed Endpoint (Temporary)

Add a temporary endpoint in `backend/routes/samples.js`:
```javascript
// TEMPORARY - Remove after seeding
router.post('/seed', async (req, res) => {
  // Run seed script logic here
  // Or call seed function
});
```

Then call it once: `POST https://your-backend.onrender.com/api/samples/seed`

**⚠️ Remove this endpoint after seeding!**

---

## Step 6: Verify Deployment

1. **Test Backend:**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"AquaSure API is running"}`

2. **Test Frontend:**
   - Visit: `https://your-project.vercel.app`
   - Should load the dashboard
   - Check browser console for errors

3. **Test API Connection:**
   - Try submitting a sample
   - Check if it appears in dashboard

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Backend shows "Application Error"
- Check Render/Railway logs
- Verify environment variables are set correctly
- Ensure MongoDB connection string is correct
- Check if MongoDB Atlas IP whitelist includes Render/Railway IPs

**Problem:** Database connection fails
- Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)
- Check database user credentials
- Ensure connection string format is correct

### Frontend Issues

**Problem:** Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check CORS settings in backend
- Look at browser console for errors
- Ensure backend URL doesn't have trailing slash

**Problem:** Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify all dependencies are in `package.json`

---

## 📝 Quick Reference

### Environment Variables Summary

**Backend (Render/Railway):**
```
MONGO_URI=mongodb+srv://...
PORT=10000 (or auto-set)
JWT_SECRET=your-secret-key
NODE_ENV=production
```

**Frontend (Vercel):**
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 🎉 You're Live!

Once deployed, you'll have:
- ✅ Backend API: `https://your-backend.onrender.com`
- ✅ Frontend App: `https://your-project.vercel.app`
- ✅ Database: MongoDB Atlas (free tier)

**Share your deployed app URL for the assignment!**

---

## 💡 Tips

1. **Free Tier Limitations:**
   - Render: Free tier spins down after 15 min inactivity (first request may be slow)
   - Vercel: Free tier is excellent, no major limitations
   - MongoDB Atlas: 512MB storage, sufficient for demo

2. **Keep Services Active:**
   - Render free tier sleeps after inactivity
   - First request after sleep takes ~30 seconds
   - Consider upgrading for production use

3. **Monitor Usage:**
   - Check Render/Railway dashboards for usage
   - MongoDB Atlas shows storage usage
   - All free tiers are generous for demo purposes

---

## 🔗 Useful Links

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Render:** https://render.com
- **Railway:** https://railway.app
- **Vercel:** https://vercel.com

---

**Last Updated:** October 2024

