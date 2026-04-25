# Provider Dashboard

Professional management dashboard for vets and shelters to manage their own operations.

## Features

- **Dashboard**: Overview of key metrics and recent activity
- **Vet Clinic Management**: Manage clinic information and appointments
- **Shelter Management**: Track animals and occupancy rates
- **Inventory Management**: Track and manage supplies, medicine, and food
- **Analytics**: View comprehensive reports with charts and trends
- **Real-time Updates**: Socket.io integration for live updates
- **Responsive Design**: Fully responsive UI with Tailwind CSS

## Installation

```bash
cd provider-dashboard
npm install
```

## Running the Dashboard

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5175`

## Project Structure

```
provider-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   ├── Header.jsx        # Top header with search and profile
│   │   └── StatCard.jsx      # Reusable stat card component
│   ├── pages/
│   │   ├── Dashboard.jsx     # Main dashboard with stats
│   │   ├── VetClinic.jsx     # Vet clinic management
│   │   ├── Shelter.jsx       # Shelter management
│   │   ├── Inventory.jsx     # Inventory management
│   │   └── Analytics.jsx     # Analytics and reports
│   ├── services/
│   │   └── api.js            # Axios instance with interceptors
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── .env                      # Environment variables
└── index.html                # HTML template
```

## Default Credentials

- **Email**: provider@example.com
- **Password**: password123

*Demo credentials - replace with real authentication in production*

## Environment Variables

Create a `.env` file with:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Build for Production

```bash
npm run build
```

## Technologies Used

- **React 18.2.0**: UI library
- **Vite 5.0.8**: Build tool
- **Tailwind CSS 3.4.1**: Styling
- **Recharts 2.10.3**: Charts and analytics
- **Axios 1.6.2**: HTTP client
- **Socket.io 4.7.2**: Real-time communication
- **React Router 6.21.0**: Navigation

## Features in Detail

### Dashboard
- Overview of key metrics
- Recent activity feed
- Quick access to common tasks

### Vet Clinic
- View and edit clinic information
- Track appointments and doctors
- Manage clinic specialties

### Shelter
- Monitor current animals and capacity
- Track adoption statistics
- Manage volunteer information

### Inventory
- Add and track inventory items
- Categorize supplies by type
- Track last restock dates

### Analytics
- Appointment trends
- Revenue vs expenses
- Pet type distribution
- Monthly performance metrics

## API Integration

The dashboard connects to the backend API at `http://localhost:5000/api`. Token-based authentication is implemented with auto-logout on 401 errors.

## Support

For issues or questions, contact the development team.
