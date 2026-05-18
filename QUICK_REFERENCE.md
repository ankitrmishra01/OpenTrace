# OpenTrace - Quick Reference Card

## 🚀 30-Second Start

```bash
cd OpenTrace
npm run install:all
# Create .env files (see QUICKSTART.md)
npm run dev
# Visit http://localhost:5173
```

---

## 📂 File Locations

| What                     | Where                          |
| ------------------------ | ------------------------------ |
| Frontend Code            | `frontend/src/App.jsx`         |
| Backend Code             | `server/server.js`             |
| User Schema              | `server/models/User.js`        |
| Scan Schema              | `server/models/ScanResult.js`  |
| Auth API                 | `server/routes/auth.js`        |
| Scan API                 | `server/routes/scan.js`        |
| API Client               | `frontend/src/services/api.js` |
| .env Template (Backend)  | `server/.env.example`          |
| .env Template (Frontend) | `frontend/.env.example`        |

---

## 🔑 Environment Variables

### Server (.env)

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-random-string
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 🔌 API Endpoints Cheat Sheet

| Method | Endpoint       | Auth | Body                           | Returns           |
| ------ | -------------- | ---- | ------------------------------ | ----------------- |
| POST   | /auth/register | ❌   | email, password, name          | token, user       |
| POST   | /auth/login    | ❌   | email, password                | token, user       |
| POST   | /auth/google   | ❌   | googleId, email, name, picture | token, user       |
| GET    | /auth/user     | ✅   | -                              | user              |
| POST   | /scan/start    | ✅   | username                       | scan with results |
| POST   | /scan/analyze  | ✅   | scanId                         | aiAnalysis        |
| GET    | /scan/history  | ✅   | -                              | scans array       |
| GET    | /scan/:scanId  | ✅   | -                              | full scan         |

**Auth Header:** `Authorization: Bearer {JWT_TOKEN}`

---

## 💾 Database Collections

### users

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String (optional),
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### scanresults

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  username: String,
  results: [{
    platform: String,
    id: String,
    found: Boolean,
    avatar: String,
    url: String,
    color: String,
    icon: String
  }],
  riskScore: Number (0-100),
  aiAnalysis: String,
  platformsFound: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Color Palette

| Name     | Hex     | Usage            |
| -------- | ------- | ---------------- |
| Cyan     | #00d4ff | Primary accent   |
| Purple   | #7c3aed | Secondary accent |
| Green    | #00ff88 | Success/Low risk |
| Orange   | #ffaa00 | Warning/Moderate |
| Red      | #ff3366 | Danger/High risk |
| GitHub   | #58a6ff | Platform color   |
| Reddit   | #ff4500 | Platform color   |
| Gravatar | #1e73be | Platform color   |
| Dark     | #020208 | Background       |
| Card     | #0a0a1a | Card background  |

---

## 🧪 Common Test Commands

### Test Backend Health

```bash
curl http://localhost:5000/health
```

### Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test"}'
```

### Test Scan (need valid token)

```bash
curl -X POST http://localhost:5000/api/scan/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"octocat"}'
```

---

## 🛠️ Common Issues & Fixes

| Issue                     | Fix                                     |
| ------------------------- | --------------------------------------- |
| Cannot connect to MongoDB | Check MONGODB_URI, IP whitelist         |
| Port 5000 in use          | `taskkill /PID {pid} /F` or change PORT |
| 401 on API calls          | Check token in localStorage, JWT_SECRET |
| Google OAuth error        | Verify redirect URIs in Google Cloud    |
| Modules not found         | Run `npm install` in backend/frontend   |
| Env vars not loading      | Restart dev server after .env changes   |

---

## 📊 Risk Score Formula

```
Risk = (found/total)*40 + (multiple?20:0) + (3+?30:0) + random(0-10)

0-30   = 🟢 LOW
31-70  = 🟡 MODERATE
71-100 = 🔴 HIGH
```

---

## 🔄 Authentication Flow

### Email/Password

```
Register Form → hash password → store in MongoDB
                      ↓
              issue JWT token
                      ↓
            store in localStorage
                      ↓
         add to Authorization header
                      ↓
            send with each API call
```

### Google OAuth

```
Google Login → verify credential
                      ↓
           extract googleId + user data
                      ↓
        find or create user in MongoDB
                      ↓
         issue JWT token
                      ↓
    redirect to Dashboard
```

---

## 📱 Component Structure

```
App (main)
├── LandingPage
├── AuthPage
│   ├── Register Form
│   ├── Login Form
│   └── Google OAuth Button
├── Dashboard
│   ├── Header
│   ├── Stats Cards
│   ├── New Scan CTA
│   └── History Log
└── ScanPage
    ├── Search Input
    ├── Terminal Log
    ├── Network Graph / Results / AI Analysis
    └── Risk Meter + Metrics
```

---

## 🚢 Deployment Checklist

- [ ] Change JWT_SECRET
- [ ] Update CORS URLs
- [ ] Set HTTPS only
- [ ] Configure MongoDB IP whitelist
- [ ] Test all auth flows
- [ ] Verify API rate limiting
- [ ] Monitor error logs
- [ ] Update Google OAuth redirect URIs
- [ ] Test scan end-to-end
- [ ] Verify AI analysis generates

---

## 📚 File Size Reference

| File           | Size  | Type                  |
| -------------- | ----- | --------------------- |
| App.jsx        | ~40KB | Frontend (all-in-one) |
| server.js      | <1KB  | Entry point           |
| Total Frontend | ~50KB | Minified: ~15KB       |
| Total Backend  | ~30KB | Production ready      |

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens (7-day expiry)
- ✅ Rate limiting on auth (5/15min)
- ✅ CORS configured
- ✅ Protected routes
- ✅ Environment variables
- ✅ MongoDB SSL
- ✅ Input validation

---

## 💡 Quick Tips

1. **Frontend token access:**

   ```javascript
   const token = localStorage.getItem("ot_token");
   const user = JSON.parse(localStorage.getItem("ot_user"));
   ```

2. **Backend protected route:**

   ```javascript
   router.post("/protected", protect, handler);
   ```

3. **Update Google OAuth redirect URIs** after deployment:
   - https://your-app.vercel.app
   - https://your-backend.onrender.com/api/auth/google

4. **MongoDB test query:**

   ```javascript
   // In MongoDB Atlas console
   db.users.find({}); // see all users
   db.scanresults.find({}); // see all scans
   ```

5. **Restart required:**
   - After changing .env files
   - After installing new packages
   - After modifying server.js

---

## 📞 Quick Links

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Anthropic Console: https://console.anthropic.com
- Google Cloud Console: https://console.cloud.google.com
- Render Deployment: https://render.com
- Vercel Deployment: https://vercel.com

---

## 🎯 MVP Features Status

✅ User Authentication (email + Google)  
✅ Password Hashing (bcrypt)  
✅ JWT Tokens  
✅ MongoDB Storage  
✅ GitHub Scanning  
✅ Reddit Scanning  
✅ Gravatar Scanning  
✅ Risk Scoring  
✅ AI Recommendations  
✅ Dashboard  
✅ Scan History  
✅ Cyberpunk UI  
✅ Animations  
✅ Error Handling  
✅ Rate Limiting

---

**🚀 Ready to deploy!**
