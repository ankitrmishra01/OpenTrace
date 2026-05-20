# 🔐 OpenTrace — AI-Powered Cyber Risk Analyzer

> An ethical OSINT platform for digital footprint analysis and cyber risk assessment using Groq AI.

![OpenTrace](https://img.shields.io/badge/OpenTrace-v2.4.1-00d4ff?style=for-the-badge&logo=shield&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-7c3aed?style=for-the-badge)
![Educational](https://img.shields.io/badge/Purpose-Educational-00ff88?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-blue?style=for-the-badge)

---

## 💻 Tech Stack

| Layer          | Technology              | Purpose                                  |
| -------------- | ----------------------- | ---------------------------------------- |
| **Frontend**   | React 18 + Vite         | Modern SPA with fast build times         |
| **UI**         | CSS3 (Cyberpunk theme)  | Neon effects, glitch text, glassmorphism |
| **API Client** | Axios                   | HTTP requests with auto token injection  |
| **Backend**    | Node.js + Express       | Scalable REST API                        |
| **Database**   | MongoDB Atlas           | Cloud document storage                   |
| **Auth**       | JWT + bcrypt            | Secure authentication & password hashing |
| **OAuth**      | Google Sign-In          | Third-party authentication               |
| **AI**         | Groq API (Mixtral 8x7b) | Fast LLM inference for risk analysis     |
| **Deployment** | Vercel + Render         | Production-grade hosting                 |

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier ok)
- Groq API key (free tier available)
- Google OAuth credentials (optional, for Google login)

### 1. Clone & Install

```bash
cd OpenTrace
npm run install:all
```

### 2. Configure Environment

**Backend** — `server/.env`

```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/opentrace?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_xxxxx
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

**Frontend** — `frontend/.env`

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### 3. Run Development

```bash
npm run dev
```

**Frontend**: http://localhost:5173  
**Backend API**: http://localhost:5000  
**Health Check**: http://localhost:5000/health

---

## 🔧 Setup Guide

### MongoDB Atlas Setup (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Add IP to whitelist (0.0.0.0/0 for development)
4. Create database user
5. Copy connection string into `server/.env`

### Groq API Setup (1 minute)

1. Go to https://console.groq.com
2. Create free account and get API key
3. Add to `server/.env` as `GROQ_API_KEY`
4. Free tier includes 30 requests/minute (sufficient for demos)

### Google OAuth Setup (Optional, 5 minutes)

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env` files

---

## 📁 Project Structure

```
opentrace/
├── frontend/                          # React + Vite
│   ├── src/
│   │   ├── App.jsx                   # Main component (40KB - all-in-one)
│   │   ├── main.jsx                  # Entry point with GoogleOAuthProvider
│   │   ├── services/
│   │   │   └── api.js                # Axios API client with interceptors
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                            # Node.js + Express
│   ├── models/
│   │   ├── User.js                   # User schema (JWT + Google OAuth)
│   │   └── ScanResult.js             # Scan data persistence
│   ├── routes/
│   │   ├── auth.js                   # /auth endpoints
│   │   └── scan.js                   # /scan endpoints
│   ├── controllers/
│   │   ├── authController.js         # Auth logic (register/login/google)
│   │   └── scanController.js         # Scan logic (start/analyze/history)
│   ├── services/
│   │   ├── platformService.js        # GitHub, Reddit, Gravatar API calls
│   │   └── anthropicService.js       # Anthropic AI integration
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   └── rateLimit.js              # Rate limiting
│   ├── utils/
│   │   ├── generateToken.js          # JWT token generation
│   │   └── riskScorer.js             # Risk calculation algorithm
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── server.js                     # Express app setup
│   ├── package.json
│   └── .env.example
│
├── package.json                       # Root scripts
└── README.md
```

---

## 🔐 Authentication Flow

### Local Registration/Login

```
User Input → /auth/register or /auth/login
  ↓
Password hashed with bcrypt
  ↓
User stored in MongoDB
  ↓
JWT token generated (7-day expiry)
  ↓
Token stored in localStorage
  ↓
Subsequent requests include: Authorization: Bearer {token}
```

### Google OAuth

```
Google Login Button → GoogleOAuthProvider wrapper
  ↓
Google authentication
  ↓
Credential token → /auth/google endpoint
  ↓
Token decoded, googleId extracted
  ↓
User created or linked in MongoDB
  ↓
JWT token issued
  ↓
Redirected to Dashboard
```

---

## 🔍 API Endpoints

### Authentication

```
POST /api/auth/register
  Body: { email, password, name }
  Returns: { token, user }

POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }

POST /api/auth/google
  Body: { googleId, email, name, picture }
  Returns: { token, user }

GET /api/auth/user (Protected)
  Headers: Authorization: Bearer {token}
  Returns: { user }
```

### Scanning

```
POST /api/scan/start (Protected)
  Body: { username }
  Returns: { scan: { id, username, results, riskScore, platformsFound } }

POST /api/scan/analyze (Protected)
  Body: { scanId }
  Returns: { analysis }

GET /api/scan/history (Protected)
  Returns: { scans: [{id, username, riskScore, platformsFound, date}] }

GET /api/scan/:scanId (Protected)
  Returns: { scan }
```

---

## 🎯 Features Implemented

✅ **User Authentication**

- Email/password registration with bcrypt hashing
- JWT-based login (7-day token expiry)
- Google OAuth integration
- Secure token storage in localStorage

✅ **Platform Scanning**

- GitHub API (real-time user lookup)
- Reddit API (simulated for demo)
- Gravatar MD5 hashing
- Avatar fetching and display

✅ **Risk Analysis**

- Configurable risk scoring algorithm
- Platform-based weighting
- Exposure rate calculation
- Real-time score generation

✅ **AI Recommendations**

- Groq API integration (Lightning-fast LLM inference)
- Dynamic prompt generation based on scan results
- Real-time risk analysis and recommendations
- Markdown-formatted output
- Fallback analysis if API unavailable

✅ **Data Persistence**

- MongoDB storage of users
- Scan history with timestamps
- AI analysis caching
- User dashboard

✅ **UI/UX**

- Cyberpunk design with neon effects
- Glitch text animations
- Matrix rain background
- Glassmorphism cards
- Responsive layout
- Real-time scanning animations

---

## 🧪 Testing End-to-End

### 1. Register New Account

```
Go to http://localhost:5173
Click "ENTER SYSTEM" → "REGISTER"
Fill in name, email, password
Submit → Should redirect to Dashboard
```

### 2. Google Login (if configured)

```
On Auth page, click "SIGN IN WITH GOOGLE"
Complete Google authentication
Should redirect to Dashboard with user profile
```

### 3. Run Username Scan

```
Go to Dashboard → "INITIATE SCAN"
Enter username (e.g., "github-username")
Click "SCAN TARGET"
Wait for GitHub/Reddit/Gravatar checks
View results, risk score, and AI analysis
```

### 4. View Scan History

```
Return to Dashboard
Scroll down to "SCAN HISTORY LOG"
Should show all previous scans with risk scores
```

### 5. Verify Database

```
MongoDB Atlas → Collections
opentrace database should have:
  - users collection (with your account)
  - scanresults collection (with scan history)
```

---

## 🚢 Deployment Guide

### Live Demo

- **Frontend**: https://open-trace-six.vercel.app
- **Status**: ✅ Production Ready

### Frontend Deployment (Vercel)

#### Option 1: Auto-Deploy (Recommended)

1. Push to GitHub
2. Vercel auto-deploys on every push
3. Done! (1-2 min deployment time)

#### Option 2: Manual Deploy

```bash
cd frontend
vercel --prod
```

**Environment Variables in Vercel Dashboard:**

- `VITE_API_URL` = Backend API URL (e.g., https://opentrace-backend.onrender.com/api)
- `VITE_GOOGLE_CLIENT_ID` = Your Google OAuth Client ID

**Authorized Origins in Google Cloud Console:**

- `https://open-trace-six.vercel.app`
- `http://localhost:5173` (for local development)

### Backend Deployment (Render)

1. **Create Render Web Service**:
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repository

2. **Configure Service**:
   - Name: `opentrace-api`
   - Root Directory: `server/`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free or Paid

3. **Add Environment Variables**:

   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_strong_secret_key
   GROQ_API_KEY=gsk_xxxxx
   CLIENT_URL=https://open-trace-six.vercel.app
   GOOGLE_CLIENT_ID=xxxxx
   GOOGLE_CLIENT_SECRET=xxxxx
   ```

4. **Deploy**: Click "Deploy" and wait 2-5 minutes

### Troubleshooting Deployment

**Frontend deployment fails:**

- Check `VITE_API_URL` is reachable
- Verify `.env` variables in Vercel dashboard
- Check build logs: Vercel Dashboard → Deployments

**Backend deployment fails:**

- Ensure `server/` directory has package.json
- Check MONGODB_URI is valid
- Verify all required env vars are set in Render

**Google OAuth not working in production:**

- Ensure `https://open-trace-six.vercel.app` is in Google Console
- Verify `VITE_GOOGLE_CLIENT_ID` matches frontend
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend

---

## ⚠️ Security Notes

- **Never commit `.env` files** — use `.env.example`
- **Change JWT_SECRET in production** — use strong random string
- **Use HTTPS only** in production
- **Set MongoDB IP whitelist** appropriately
- **Rate limiting enabled** on auth endpoints (5 attempts/15min)
- **Passwords hashed** with bcrypt (10 salt rounds)
- **Google OAuth** requires secure callback URLs

---

## 📋 Disclaimer

OpenTrace is for **educational and cybersecurity awareness purposes only**.  
It uses only public APIs and does not engage in illegal surveillance, scraping, or data harvesting.  
Always respect platform Terms of Service and privacy laws.

---

## 🔧 Troubleshooting

### "Cannot find module 'mongoose'"

```bash
cd server && npm install
```

### "MongoDB connection failed"

- Check connection string in `server/.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure database credentials are correct

### "Google OAuth not working"

- Verify `VITE_GOOGLE_CLIENT_ID` matches config
- Check authorized JavaScript origins in Google Cloud Console
- **No trailing slash** in origin URLs: `https://domain.com` not `https://domain.com/`
- Ensure `.env` files are loaded (restart dev server)
- Check browser popup blocker settings (Chrome/Firefox)
- Clear browser cache and cookies before testing

### "Popup blocked by browser"

- This is browser security, not a code issue
- Chrome: Click lock icon → Site settings → Popups → Allow
- Firefox: Preferences → Privacy → Pop-ups → Exceptions
- Clear cache and try again

### "API calls returning 401"

- Check token is stored in localStorage
- Verify JWT_SECRET matches between frontend and backend
- Clear localStorage and re-login

---

## 📄 License

MIT © 2024 OpenTrace

---

## 🤝 Contributing

This is an educational project. Feel free to fork, modify, and enhance for learning purposes.

---

## 📞 Support

For issues, check:

1. Environment variables are correctly set
2. MongoDB Atlas cluster is running
3. Backend is accessible on http://localhost:5000/health
4. Ports 5000 and 5173 are not in use
