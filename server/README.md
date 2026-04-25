# Pet Care Server

Backend API for the Pet Care application built with Node.js, Express, and MongoDB.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - MongoDB URI
   - JWT Secret
   - Cloudinary credentials
   - Other environment variables

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/my-pets` - Get user's pets (protected)
- `GET /api/pets/:id` - Get pet details
- `POST /api/pets` - Add new pet (protected)
- `PUT /api/pets/:id` - Update pet (protected)
- `DELETE /api/pets/:id` - Delete pet (protected)

### Posts (Community)
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id/like` - Like post (protected)
- `POST /api/posts/:id/comment` - Add comment (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/my-appointments` - Get user's appointments (protected)
- `GET /api/appointments/upcoming` - Get upcoming appointments (protected)
- `POST /api/appointments` - Book appointment (protected)
- `PUT /api/appointments/:id` - Update appointment (protected)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (protected)

### Adoption
- `GET /api/adoptions` - Get all adoptable pets
- `GET /api/adoptions/my-adoptions` - Get user's adoptions (protected)
- `GET /api/adoptions/:id` - Get adoption details
- `POST /api/adoptions` - Create adoption listing (protected)
- `PUT /api/adoptions/:id/like` - Like/save adoption (protected)
- `PUT /api/adoptions/:id/adopt` - Adopt pet (protected)

### SOS Alerts
- `GET /api/sos` - Get active SOS alerts
- `GET /api/sos/my-alerts` - Get user's SOS alerts (protected)
- `POST /api/sos` - Send SOS alert (protected)
- `PUT /api/sos/:id/status` - Update SOS status (protected)
- `PUT /api/sos/:id/resolve` - Resolve SOS alert (protected)

## Database Models

### User
- Name, email, password, phone, avatar, bio
- References to pets
- Timestamps

### Pet
- Name, type, breed, age, weight, color
- Microchip ID, date of birth
- Owner reference
- Vaccinations and medical records arrays
- Appointments array

### Appointment
- Pet and owner references
- Date, time, vet name, reason
- Status (pending/confirmed/completed/cancelled)
- Notes

### Post
- Author reference
- Content, image
- Likes and comments
- Category (tip/story/question/photo)

### Medical Record
- Pet reference
- Type, date, description
- Vet information and cost
- Attachments

### Adoption
- Pet reference
- Pet details (name, breed, age, etc.)
- Adopted by reference
- Status (available/pending/adopted)
- Adoption date

### Product
- Category (food/toys/accessories/health/other)
- Description, price, image
- In stock status
- Rating and reviews

## Features

- User authentication with JWT
- Password hashing with bcryptjs
- Role-based authorization
- Appointment reminders (cron jobs)
- Vaccination due date tracking
- Cloudinary image uploads
- Error handling middleware
- CORS support
- Cookie-based token management

## Scheduled Tasks

- **Appointment Reminders**: Daily at 9 AM
- **Vaccination Reminders**: Every Sunday at 10 AM
- **Old SOS Alert Resolution**: Daily at midnight

## Environment Variables

See `.env.example` for all required environment variables.

## License

ISC
