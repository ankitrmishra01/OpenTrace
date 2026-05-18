# 📡 OpenTrace API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require: `Authorization: Bearer {JWT_TOKEN}`

---

## 🔐 Authentication Endpoints

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Google OAuth

```http
POST /auth/google
Content-Type: application/json

{
  "googleId": "1234567890",
  "email": "john@gmail.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@gmail.com",
    "avatar": "https://lh3.googleusercontent.com/..."
  }
}
```

---

### Get Current User (Protected)

```http
GET /auth/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔍 Scan Endpoints

### Start Scan

```http
POST /scan/start
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "username": "octocat"
}
```

**Response (200):**

```json
{
  "success": true,
  "scan": {
    "id": "507f1f77bcf86cd799439012",
    "username": "octocat",
    "results": [
      {
        "platform": "GitHub",
        "id": "github",
        "found": true,
        "avatar": "https://github.com/octocat.png?size=80",
        "url": "https://github.com/octocat",
        "color": "#58a6ff",
        "icon": "⬡"
      },
      {
        "platform": "Reddit",
        "id": "reddit",
        "found": false,
        "avatar": null,
        "url": "https://www.reddit.com/user/octocat",
        "color": "#ff4500",
        "icon": "◈"
      },
      {
        "platform": "Gravatar",
        "id": "gravatar",
        "found": false,
        "avatar": null,
        "url": "https://gravatar.com/octocat",
        "color": "#1e73be",
        "icon": "◎"
      }
    ],
    "riskScore": 45,
    "platformsFound": 1
  }
}
```

---

### Generate AI Analysis

```http
POST /scan/analyze
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "scanId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**

```json
{
  "success": true,
  "analysis": "### EXPOSURE SUMMARY\nThe username 'octocat' has been detected on 1 of 3 scanned platforms...\n\n### TOP 3 RISKS\n- GitHub profile is publicly visible\n- Email may be exposed in commits\n- Username consistency across platforms\n\n### RECOMMENDATIONS\n- Review GitHub profile settings\n- Check commit history for exposed emails\n- Use unique usernames per platform\n\n### VERDICT\nLow risk profile with minimal digital exposure."
}
```

---

### Get Scan History (Protected)

```http
GET /scan/history
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**

```json
{
  "success": true,
  "scans": [
    {
      "id": "507f1f77bcf86cd799439012",
      "username": "octocat",
      "riskScore": 45,
      "platformsFound": 1,
      "date": "2024-01-15T10:30:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "username": "torvalds",
      "riskScore": 72,
      "platformsFound": 2,
      "date": "2024-01-14T15:45:00Z"
    }
  ]
}
```

---

### Get Specific Scan (Protected)

```http
GET /scan/507f1f77bcf86cd799439012
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**

```json
{
  "success": true,
  "scan": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "username": "octocat",
    "results": [...],
    "riskScore": 45,
    "platformsFound": 1,
    "aiAnalysis": "### EXPOSURE SUMMARY\n...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Scan not found"
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔑 Authentication Headers

All protected endpoints require:

```
Authorization: Bearer {JWT_TOKEN}
```

Token is obtained from `/auth/register` or `/auth/login` response.

Token expiry: **7 days**

---

## 📊 Risk Score Calculation

```
Risk Score =
  (Found Platforms / Total Platforms) * 40 +
  (Multiple Platforms Found ? 20 : 0) +
  (3+ Platforms Found ? 30 : 0) +
  Random(0-10)

Range: 0-100

Levels:
  0-30   = LOW (Safe)
  31-70  = MODERATE (Action Recommended)
  71-100 = HIGH (Immediate Action)
```

---

## 🧪 Testing with cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

### Start Scan (Protected)

```bash
curl -X POST http://localhost:5000/api/scan/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"username": "octocat"}'
```

---

## 📚 Response Status Codes

| Code | Meaning           |
| ---- | ----------------- |
| 200  | Success           |
| 201  | Created           |
| 400  | Bad Request       |
| 401  | Unauthorized      |
| 404  | Not Found         |
| 429  | Too Many Requests |
| 500  | Server Error      |

---

## 🔐 Security

- All passwords hashed with bcrypt (10 salt rounds)
- Tokens signed with HS256
- Rate limiting: 5 auth attempts per 15 minutes
- MongoDB connection uses SSL
- CORS enabled for frontend origin only
