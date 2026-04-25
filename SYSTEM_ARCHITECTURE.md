# PetCare System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEB BROWSERS                             │
├────────────────────────────────────────────────────────────────┤
│  http://localhost:3000        │    http://localhost:5174        │
│   (Main Frontend)             │    (Separate Admin Portal)       │
└──────────────┬─────────────────────────────────┬────────────────┘
               │                                 │
        ┌──────▼──────┐              ┌──────────▼────────┐
        │   User App   │              │  Admin Portal     │
        │  (3000)      │              │  (5174)           │
        │              │              │                   │
        │ • Home       │              │ Contains:         │
        │ • Login      │              │ • Auth Context    │
        │ • Dashboard  │              │ • Protected Routes│
        │ • Pets       │              │ • Admin Dashboard │
        │ • Chat       │              │                   │
        │ • SOS        │              │ Integrated with   │
        │ • Payment    │◄─┬──────────►│ main frontend     │
        │ • Adoption   │  │           │                   │
        │ • Community  │  │           │                   │
        │ • Appts      │  │           │                   │
        │              │  │           │                   │
        │ NEW:         │  │           └──────────────────┘
        │ • AdminLogin │  │
        │ • AdminDash  │  │
        └──────────────┘  │
                          │
                    API Calls
                    (JWT Auth)
                          │
                 ┌────────▼────────┐
                 │  Backend Server │
                 │   (5000)        │
                 │                 │
                 │ • Express.js    │
                 │ • MongoDB       │
                 │ • Socket.io     │
                 │ • Stripe        │
                 │                 │
                 │ Routes:         │
                 │ • /auth         │
                 │ • /api/pets     │
                 │ • /api/vets     │
                 │ • /api/shelters │
                 │ • /api/products │
                 │ • /api/payment  │
                 │ • /api/sos      │
                 │ • /socket.io    │
                 │                 │
                 └────────┬────────┘
                          │
               ┌──────────▼───────────┐
               │   MongoDB Database   │
               │   (Atlas Cloud)      │
               │                      │
               │ Collections:         │
               │ • users              │
               │ • pets               │
               │ • appointments       │
               │ • vets               │
               │ • shelters           │
               │ • products           │
               │ • payments           │
               │ • posts              │
               └──────────────────────┘
```

## Authentication Flow

### User Authentication
```
User          Frontend         Backend      Database
 │                │               │            │
 ├─ Login ────────►│               │            │
 │                 ├─ POST /auth –►│            │
 │                 │               ├─ Query ──►│
 │                 │               │◄─ Found ──┤
 │                 │◄─ JWT Token ──┤            │
 │                 │               │            │
 │◄─ Token ────────┤               │            │
 │ stored in       │               │            │
 │ localStorage    │               │            │
```

### Admin Authentication (NEW)
```
Admin          Frontend         Storage
 │                │               │
 ├─ AdminLogin ───►│               │
 │                 │               │
 │   Password      ├─ Check ──────►│
 │   admin@2026    │   Password    │
 │                 │               │
 │                 ◄─ Verified ────┤
 │◄─ Admin Token ──┤               │
 │ localStorage    │               │
 │ adminToken      │               │
```

## Component Hierarchy

```
App
├── AuthProvider (AuthContext)
│   ├── user state
│   ├── admin state
│   └── auth methods
│
└── AppRoutes (BrowserRouter)
    ├── / (Home)
    ├── /login (User Login)
    ├── /register (User Register)
    │
    ├── /admin-login (Admin Login) ✨ NEW
    │
    ├── ProtectedAdminRoute ✨ NEW
    │   └── /admin-dashboard (Admin Dashboard) ✨ NEW
    │       ├── Dashboard Tab
    │       ├── Vet Clinic Tab
    │       ├── Shelter Tab
    │       ├── Inventory Tab
    │       └── Analytics Tab
    │
    ├── /dashboard (User Dashboard)
    ├── /add-pet (Add Pet)
    ├── /appointments (Appointments)
    ├── /adoption (Adoption)
    ├── /lost-found (Lost & Found)
    ├── /community (Community)
    ├── /sos (SOS)
    ├── /chat (Chat)
    └── /payment (Payment)

Navbar (with admin/user indicator) ✨ ENHANCED
```

## Data Flow

### User Registration/Login Flow
```
1. User fills registration form
2. Frontend sends POST /auth/register
3. Backend validates & hashes password
4. Database stores user record
5. JWT token generated
6. Token sent to frontend
7. Token stored in localStorage
8. User redirected to dashboard
9. Auth interceptor adds token to all requests
```

### Admin Login Flow (NEW)
```
1. Admin clicks 🔐 Admin button
2. Redirected to /admin-login
3. Admin enters password: admin@2026
4. Frontend checks password
5. If correct:
   - Generate admin token
   - Store in localStorage
   - Set admin in AuthContext
   - Redirect to /admin-dashboard
6. ProtectedAdminRoute validates
7. Admin Dashboard loads
```

### Real-time Updates
```
Frontend ◄──── Socket.io ────► Backend
  │                               │
  ├─► send-message                ├─► receive-message
  ├─► sos-alert                   ├─► receive-sos
  ├─► appointment-update          ├─► notify appointment
  └─► adoption-notification       └─► notify adoption
```

## API Endpoints

### Authentication
```
POST   /api/auth/register    (Create new user)
POST   /api/auth/login       (Login user)
GET    /api/auth/me          (Get current user)
POST   /api/auth/logout      (Logout)
```

### Pets
```
GET    /api/pets             (Get all pets)
POST   /api/pets             (Create pet)
GET    /api/pets/:id         (Get pet)
PUT    /api/pets/:id         (Update pet)
DELETE /api/pets/:id         (Delete pet)
```

### Appointments
```
GET    /api/appointments           (Get all)
POST   /api/appointments           (Create)
GET    /api/appointments/:id       (Get one)
PUT    /api/appointments/:id       (Update)
DELETE /api/appointments/:id       (Cancel)
```

### Vets
```
GET    /api/vets             (Get all vets)
POST   /api/vets             (Create vet)
GET    /api/vets/:id         (Get vet)
```

### Shelters
```
GET    /api/shelters         (Get all)
POST   /api/shelters         (Create)
GET    /api/shelters/:id     (Get one)
```

### Payments (Stripe)
```
POST   /api/payment/create-intent   (Create payment intent)
POST   /api/payment/confirm         (Confirm payment)
GET    /api/payment/history         (Payment history)
POST   /api/payment/refund          (Process refund)
```

### SOS
```
POST   /api/sos/alert          (Send SOS)
GET    /api/sos/history        (Get SOS history)
```

## Database Schema

### User
```
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  phone: String,
  address: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Pet
```
{
  _id: ObjectId,
  name: String,
  type: String,
  breed: String,
  age: Number,
  owner: ObjectId (ref: User),
  medicalHistory: [Object],
  createdAt: Date
}
```

### Appointment
```
{
  _id: ObjectId,
  pet: ObjectId,
  vet: ObjectId,
  date: Date,
  time: String,
  status: String,
  notes: String,
  createdAt: Date
}
```

### Payment
```
{
  _id: ObjectId,
  user: ObjectId,
  amount: Number,
  status: String,
  stripeId: String,
  createdAt: Date
}
```

## Security Features

### Frontend Security
- ✅ Protected routes with ProtectedAdminRoute
- ✅ JWT tokens in localStorage
- ✅ Auto-logout on 401 errors
- ✅ Admin password hashing (should be implemented in backend)
- ✅ CORS enabled

### Backend Security
- ✅ Password hashing with bcryptjs
- ✅ JWT token verification
- ✅ Middleware for authentication
- ✅ Environment variables for secrets
- ✅ Error handling and validation

## Performance Optimizations

1. **Lazy Loading**: Pages loaded on demand
2. **Code Splitting**: Vite handles chunking
3. **Image Optimization**: Tailwind CSS for styling
4. **Database Indexing**: MongoDB indexes on frequently queried fields
5. **Caching**: Token caching in localStorage
6. **API Interceptors**: Single point for auth headers

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│           Production Environment             │
├──────────────────────────────────────────────┤
│                                              │
│  ┌───────────────────────────────────────┐  │
│  │     Vercel/Netlify (Frontend)         │  │
│  │     - Main App (3000)                 │  │
│  │     - Admin Portal (5174) [optional]  │  │
│  └───────────────────────────────────────┘  │
│                    │                        │
│  ┌────────────────▼──────────────────────┐  │
│  │  Railway/Render (Backend)             │  │
│  │  - Express API (5000)                 │  │
│  │  - Socket.io Server                   │  │
│  │  - Stripe Integration                 │  │
│  └───────────────────────────────────────┘  │
│                    │                        │
│  ┌────────────────▼──────────────────────┐  │
│  │  MongoDB Atlas (Database)             │  │
│  │  - Cloud Database                     │  │
│  │  - Automatic Backups                  │  │
│  │  - SSL/TLS Encryption                 │  │
│  └───────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

## Summary

- ✅ **Single Frontend App** with integrated admin
- ✅ **Admin Portal** accessible via /admin-login
- ✅ **Single Admin Password**: admin@2026
- ✅ **Unified Dashboard** for clinic and shelter
- ✅ **Real-time Communication** via Socket.io
- ✅ **Payment Processing** via Stripe
- ✅ **Secure Authentication** with JWT
- ✅ **Protected Routes** for restricted access
