# ⚡ OpenTrace QUICKSTART

**Get OpenTrace running in 5 minutes:**

## Step 1: Setup MongoDB (2 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a user (username/password)
4. Click "Connect" → "Drivers" → Copy connection string
5. Replace `<username>:<password>` with your credentials
6. Save this as your `MONGODB_URI`

## Step 2: Setup API Keys (2 min)

- **Anthropic**: https://console.anthropic.com → Create API key → Copy as `ANTHROPIC_API_KEY`
- **Google OAuth** (optional): https://console.cloud.google.com → Create OAuth credentials → Copy ID as `VITE_GOOGLE_CLIENT_ID`

## Step 3: Create .env Files

### server/.env

```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/opentrace?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_123_change_this
CLIENT_URL=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-xxxxx
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

### frontend/.env

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

## Step 4: Install & Run

```bash
cd OpenTrace
npm run install:all
npm run dev
```

## Step 5: Test It

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000/health
- Register → Scan username → See results!

---

## 🎯 What's Included

✅ Full-stack auth (register, login, Google OAuth)  
✅ MongoDB user + scan persistence  
✅ GitHub/Reddit/Gravatar scanning  
✅ Anthropic AI risk analysis  
✅ Cyberpunk dashboard UI  
✅ Protected routes & JWT tokens  
✅ Rate limiting & error handling

---

## 🧪 Quick Test Flow

1. **Register**: Email/password → stored in MongoDB
2. **Login**: Get JWT token → stored in localStorage
3. **Scan**: Enter username → Backend searches GitHub/Reddit/Gravatar → Returns results + AI analysis
4. **History**: Dashboard shows all previous scans from MongoDB
5. **Google**: Optional - Login with Google instead

---

## 📊 What Happens Behind the Scenes

```
Frontend registers
  ↓
Backend hashes password with bcrypt → Stores in MongoDB
  ↓
Issues JWT token
  ↓
Frontend stores token + user in localStorage
  ↓
User clicks "SCAN" with username
  ↓
Backend calls GitHub/Reddit/Gravatar APIs
  ↓
Calculates risk score
  ↓
Sends to Anthropic Claude → Gets AI analysis
  ↓
Stores scan result in MongoDB
  ↓
Returns to frontend
  ↓
Frontend animates results, displays risk meter, AI recommendations
```

---

## 🚀 Ready for Production?

See README.md for deployment to Vercel (frontend) and Render (backend).

---

**That's it! You now have a fully functional AI cybersecurity platform with authentication, database persistence, and real API integrations. 🔐**
