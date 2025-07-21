# 🚀 Render.com Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **MongoDB Atlas**: Active cluster with connection string
3. **Render Account**: Free account at [render.com](https://render.com)

## 🔧 Step-by-Step Deployment

### 1. **Prepare Environment Variables**

#### Backend Environment Variables (Render Dashboard):
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/canga_vardiya
JWT_SECRET=your-super-secret-jwt-key-256-bit-minimum
GEMINI_API_KEY=your-gemini-ai-key-optional
CLIENT_URL=https://canga-frontend.onrender.com
FRONTEND_URL=https://canga-frontend.onrender.com
```

#### Frontend Environment Variables (Render Dashboard):
```env
REACT_APP_API_URL=https://canga-backend.onrender.com
REACT_APP_ENV=production
```

### 2. **Deploy Backend (API Server)**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `canga-backend`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: `Free`

5. **Environment Variables** (in Render dashboard):
   - Add all backend environment variables listed above
   - ⚠️ **Important**: Keep `MONGODB_URI` and `JWT_SECRET` secret!

6. **Deploy Settings**:
   - **Auto-Deploy**: `Yes`
   - **Health Check Path**: `/api/health`

### 3. **Deploy Frontend (React App)**

1. In Render Dashboard: **"New"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `canga-frontend`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

4. **Environment Variables**:
   - `REACT_APP_API_URL`: `https://canga-backend.onrender.com`
   - `REACT_APP_ENV`: `production`

5. **Headers & Redirects** (in Render dashboard):
   ```
   /*    /index.html   200
   ```

### 4. **MongoDB Atlas Setup**

1. **IP Whitelist**: Add `0.0.0.0/0` for Render servers
2. **Database User**: Create user with read/write permissions
3. **Connection String**: Get from Atlas dashboard
4. **Test Connection**: Use MongoDB Compass or shell

### 5. **Final Checks**

#### Backend Health Check:
```bash
curl https://canga-backend.onrender.com/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Canga Vardiya Sistemi API çalışıyor! 🚀",
  "timestamp": "2024-01-XX...",
  "version": "1.0.0"
}
```

#### Frontend Accessibility:
```bash
curl -I https://canga-frontend.onrender.com
```

Expected: `HTTP/1.1 200 OK`

## 🔐 Security Configuration

### Backend CORS Settings
The backend is configured to accept requests from:
- `https://canga-frontend.onrender.com`
- `http://localhost:3000` (development)

### Database Security
- Use strong MongoDB Atlas password
- Enable IP Access List
- Use connection string with SSL

## 📊 Performance Optimization

### Backend
- **Memory**: 512MB (Free tier)
- **CPU**: Shared
- **Auto-sleeping**: After 15 minutes inactivity
- **Cold start**: ~10-15 seconds

### Frontend
- **CDN**: Global edge caching
- **Gzip**: Enabled automatically
- **Asset caching**: 1 year for static files
- **SPA routing**: Configured via redirects

## 🐛 Troubleshooting

### Common Issues

1. **Backend Won't Start**
   - Check environment variables
   - Verify MongoDB connection string
   - Check build logs for missing dependencies

2. **Frontend Can't Connect to Backend**
   - Verify `REACT_APP_API_URL` points to backend URL
   - Check CORS settings in backend
   - Ensure both services are deployed

3. **Database Connection Failed**
   - Check MongoDB Atlas cluster status
   - Verify IP whitelist includes `0.0.0.0/0`
   - Test connection string format

4. **502 Bad Gateway**
   - Backend is probably sleeping (free tier)
   - Wait 10-15 seconds for cold start
   - Check backend health endpoint

### Debug Commands

```bash
# Test backend
curl https://canga-backend.onrender.com/api/health

# Test frontend
curl -I https://canga-frontend.onrender.com

# Check specific API endpoint
curl https://canga-backend.onrender.com/api/employees
```

## 📈 Monitoring

### Render Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response time
- **Deploys**: Deployment history

### Health Monitoring
- Backend: `/api/health` endpoint
- Frontend: `/health` endpoint (nginx)
- Database: MongoDB Atlas monitoring

## 🔄 CI/CD Pipeline

### Auto-Deploy Triggers
- Push to `main` branch
- Manual deploy from Render dashboard
- API-triggered deploys

### Build Process
1. **Backend**: `npm install` → `npm start`
2. **Frontend**: `npm install` → `npm build` → Static hosting

## 💡 Pro Tips

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes
   - 750 hours/month compute time
   - Shared resources

2. **Cold Start Mitigation**:
   - Use external monitoring (UptimeRobot)
   - Implement health check pinging

3. **Database Performance**:
   - Use MongoDB Atlas M0 (free tier)
   - Optimize queries with indexes
   - Implement caching for heavy queries

4. **Cost Optimization**:
   - Start with free tier
   - Upgrade backend to Starter ($7/mo) for always-on
   - Frontend static hosting remains free

---

## 🎯 Expected URLs After Deployment

- **Frontend**: `https://canga-frontend.onrender.com`
- **Backend API**: `https://canga-backend.onrender.com`
- **API Health**: `https://canga-backend.onrender.com/api/health`
- **Admin Login**: Use system password at frontend URL

---

**🚀 Happy Deploying! Your Canga system will be live in ~5-10 minutes.** 