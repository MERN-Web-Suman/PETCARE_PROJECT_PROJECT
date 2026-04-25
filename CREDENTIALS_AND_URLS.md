# 🔐 Credentials & URLs Reference

## 📌 BOOKMARK THIS PAGE

Use this for quick access to all important information.

---

## 🌐 Application URLs

### Main Frontend Application
```
URL: http://localhost:3000
Status: ✅ RUNNING
Purpose: User app + Integrated Admin Portal
```

### Backend API
```
URL: http://localhost:5000
Status: ✅ RUNNING
Purpose: REST API & Socket.io Server
```

### Legacy Admin Dashboard
```
URL: http://localhost:5174
Status: ✅ RUNNING
Purpose: Reference (integrated into main app)
```

### Legacy Provider Dashboard
```
URL: http://localhost:5175
Status: ✅ RUNNING
Purpose: Reference (integrated into main app)
```

---

## 🔑 Admin Credentials

### Admin Portal Login
```
Access: http://localhost:3000/admin-login
Password: admin@2026
Username: N/A (password only)
```

### Quick Access from Home
```
1. Go to: http://localhost:3000
2. Click: 🔐 Admin button (top right)
3. Enter: admin@2026
4. Done!
```

---

## 👤 User Credentials

### User Registration
```
Available: http://localhost:3000/register
Create: New account with any email/password
```

### User Login
```
Available: http://localhost:3000/login
Use: Credentials you created during registration
```

### Demo User (No specific credentials)
```
You can create any test account
Examples:
- Email: test@example.com
- Email: user@test.com
- Any email format works
```

---

## 📍 Key Routes

### User Routes
```
/                    Home page
/login              User login
/register           User registration
/dashboard          User dashboard
/add-pet            Add a new pet
/appointments       Book appointments
/adoption           View adoptions
/community          Community posts
/lost-found         Lost & found posts
/sos                Emergency SOS
/chat               Real-time chat
/payment            Payment page
```

### Admin Routes (NEW)
```
/admin-login        Admin login page
/admin-dashboard    Admin dashboard (protected)
```

---

## 🎯 Admin Dashboard Access

### Method 1: From Home (Recommended)
```
1. Visit http://localhost:3000
2. Look for 🔐 Admin button (yellow, top right)
3. Click it
4. Enter password: admin@2026
5. Access admin dashboard
```

### Method 2: Direct URL
```
1. Go to: http://localhost:3000/admin-login
2. Enter password: admin@2026
3. Click "Login as Admin"
4. Access admin dashboard
```

### Method 3: After User Login
```
1. Login as regular user first
2. Look for 🔐 Admin button (still visible)
3. Click it
4. Enter password: admin@2026
5. Switch to admin mode
6. Use logout to switch back to user
```

---

## 📊 Admin Dashboard Tabs

Once logged in, access these features:

### 1. Dashboard 📊
```
URL: /admin-dashboard (Dashboard tab active)
Shows:
  - Key metrics
  - Appointments
  - Revenue
  - Activity feed
```

### 2. Vet Clinic 🏥
```
Shows:
  - Clinic information
  - Doctor availability
  - Working hours
  - Appointment stats
```

### 3. Shelter 🏠
```
Shows:
  - Current animals
  - Capacity info
  - Adoption stats
  - Occupancy rate
```

### 4. Inventory 📦
```
Shows:
  - Supply tracking
  - Medicine inventory
  - Food stock
  - Categories
```

### 5. Analytics 📈
```
Shows:
  - Monthly summary
  - Performance metrics
  - Revenue analysis
  - Completion rates
```

---

## 🔍 Important Files

### Authentication Related
```
src/context/AuthContext.jsx         Auth state management
src/pages/AdminLogin.jsx            Admin login form
src/routes/ProtectedAdminRoute.jsx  Route protection
```

### Dashboard Related
```
src/pages/AdminDashboard.jsx        Admin dashboard interface
src/pages/Dashboard.jsx             User dashboard
```

### Navigation Related
```
src/components/Navbar.jsx           Navigation bar (with admin button)
src/routes/AppRoutes.jsx            Route definitions
```

---

## 🔒 Security Info

### Admin Password
```
Password: admin@2026
Type: Master password (shared)
Usage: All admins use same password
Note: Can be customized in AdminLogin.jsx
```

### Session Storage
```
User Token:     localStorage['token']
Admin Token:    localStorage['adminToken']
User Data:      localStorage['user']
Admin Data:     localStorage['admin']
```

### Token Format
```
User:  JWT token from backend /auth/login
Admin: Timestamp-based token (admin_token_XXXX)
```

---

## 🧪 Test Scenarios

### Scenario 1: Access Admin
```
1. Open http://localhost:3000
2. Click 🔐 Admin (if not logged in)
3. Password: admin@2026
4. ✅ Should see admin dashboard
```

### Scenario 2: Switch Between User & Admin
```
1. Login as user (create account)
2. Click 🔐 Admin button in navbar
3. Enter: admin@2026
4. ✅ Should switch to admin
5. Logout
6. ✅ Should be back to home (not logged in)
```

### Scenario 3: Protected Route Access
```
1. Try accessing http://localhost:3000/admin-dashboard
2. Without logging in as admin
3. ✅ Should redirect to /admin-login
```

### Scenario 4: Feature Usage
```
1. Login as admin
2. Click each tab: Dashboard, Clinic, Shelter, Inventory, Analytics
3. ✅ All should display content
4. ✅ All should be responsive
```

---

## 💾 Database Connection

### MongoDB Connection
```
Provider: MongoDB Atlas (Cloud)
Status: Connected at startup
Collections:
  - users
  - pets
  - appointments
  - vets
  - shelters
  - products
  - payments
  - posts
```

### Connection String
```
Located in: server/.env
Format: mongodb+srv://username:password@host/database
```

---

## 📦 Dependencies

### Core Packages
```
React:              18.2.0
React Router:       6.21.0
Vite:              5.0.8
TailwindCSS:       3.4.1
Axios:             1.6.2
Socket.io:         4.7.2
Socket.io-client:  4.7.2
Stripe:            Latest
```

### Installation
```
Frontend:    npm install (from project root)
Backend:    npm install (from server folder)
Admin:      npm install (from admin folder)
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Admin password wrong
```
Problem:   "Invalid password" message
Solution:  Verify exactly: admin@2026
           Copy/paste password to avoid typos
```

### Issue 2: Route not found
```
Problem:   404 error on /admin-dashboard
Solution:  Hard refresh: Ctrl+Shift+R
           Clear cache: DevTools > Application > Clear All
```

### Issue 3: Admin button not visible
```
Problem:   Can't see 🔐 Admin button
Solution:  Refresh page
           Check if logged in as admin already
           Try incognito window
```

### Issue 4: Can't login as admin
```
Problem:   Keeps redirecting to /admin-login
Solution:  Clear localStorage: localStorage.clear()
           Try different browser
           Check console for errors
```

---

## 📞 Support Links

### Documentation
- **QUICK_START.md** - Quick reference
- **ADMIN_INTEGRATION_GUIDE.md** - Detailed guide
- **SYSTEM_ARCHITECTURE.md** - Technical details
- **INTEGRATION_TESTING.md** - Testing procedures

### Direct Access
```
Documentation: E:\Collage_project\QUICK_START.md
Frontend: http://localhost:3000
Admin: http://localhost:3000/admin-login
Backend: http://localhost:5000
```

---

## 🚀 Quick Commands

### Start All Services
```powershell
# Terminal 1: Backend
cd E:\Collage_project\server
node server.js

# Terminal 2: Frontend
cd E:\Collage_project
npm run dev

# Terminal 3: Admin Dashboard (optional)
cd E:\Collage_project\admin
npm run dev
```

### Stop All Services
```powershell
taskkill /F /IM node.exe
```

### Clear Cache
```powershell
# In browser DevTools:
Press F12
Go to Application tab
Click "Clear Site Data"
Refresh page
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] 🔐 Admin button visible
- [ ] Can click admin button
- [ ] Admin login page loads
- [ ] Password field appears
- [ ] Password accepted: admin@2026
- [ ] Admin dashboard appears
- [ ] Can see all 5 tabs
- [ ] Can logout successfully
- [ ] Back to home page

---

## 📈 Performance Checklist

- [ ] Frontend loads in <3 seconds
- [ ] Admin login responds instantly
- [ ] Dashboard tabs switch quickly
- [ ] No console errors
- [ ] No network errors
- [ ] All API calls successful
- [ ] Socket.io connected
- [ ] No memory leaks in DevTools

---

## 🎓 Quick Reference Table

| Item | Value | Notes |
|------|-------|-------|
| Frontend URL | http://localhost:3000 | Main app |
| Backend URL | http://localhost:5000 | API server |
| Admin Login | /admin-login | Via navbar |
| Admin Password | admin@2026 | No username |
| Admin Dashboard | /admin-dashboard | Protected route |
| User Dashboard | /dashboard | After login |
| Default Port | 3000 | Frontend |

---

## 🎯 Summary

**Everything You Need:**
- ✅ Frontend URL: http://localhost:3000
- ✅ Admin Login: /admin-login
- ✅ Admin Password: admin@2026
- ✅ All routes documented
- ✅ Quick fixes included
- ✅ Status: Fully operational

**Ready to Use!** 🚀

---

**Last Updated:** March 18, 2026
**Status:** All Systems Operational ✅
