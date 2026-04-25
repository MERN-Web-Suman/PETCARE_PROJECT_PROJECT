# 💡 Code Examples & Usage Patterns

## Real-Time Features (Socket.io)

### 1. SOS Emergency Alert System

**Backend Setup:**
```javascript
// server/server.js
io.on("connection", (socket) => {
  // SOS Emergency Alert
  socket.on("sos-alert", (data) => {
    // Broadcast to all connected vets
    io.emit("receive-sos", {
      ...data,
      timestamp: new Date(),
      socketId: socket.id
    });
  });
});
```

**Frontend Usage:**
```javascript
// src/pages/SOS.jsx
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const sendSOS = () => {
  socket.emit("sos-alert", {
    location: "Mumbai, India",
    phone: "+91-9876543210",
    message: "Pet Emergency - Please Help!",
    userID: currentUser.id
  });
};

// Listen for confirmation
socket.on("receive-sos", (data) => {
  console.log("Vets notified of emergency:", data);
  showNotification("Emergency alert sent to nearby vets!");
});
```

---

### 2. Real-Time Chat System

**Backend Chat Handler:**
```javascript
// server/server.js
let users = {};

io.on("connection", (socket) => {
  // User joins chat
  socket.on("join-chat", (userId) => {
    users[userId] = socket.id;
    socket.join(`user-${userId}`);
  });

  // Send message to specific user
  socket.on("send-message", ({ to, message, from }) => {
    io.to(`user-${to}`).emit("receive-message", {
      message,
      from,
      timestamp: new Date()
    });
  });

  // User disconnect
  socket.on("disconnect", () => {
    Object.keys(users).forEach(key => {
      if (users[key] === socket.id) delete users[key];
    });
  });
});
```

**Frontend Chat Component:**
```javascript
// src/pages/Chat.jsx
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Chat = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Join chat on component mount
    socket.emit("join-chat", currentUser.id);

    // Listen for incoming messages
    socket.on("receive-message", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.off("receive-message");
  }, []);

  const sendMessage = (messageText) => {
    // Emit to specific vet
    socket.emit("send-message", {
      to: "vet-123",
      message: messageText,
      from: currentUser.id
    });

    // Add to local chat
    setMessages(prev => [...prev, {
      message: messageText,
      own: true,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="chat-container">
      {messages.map((msg, idx) => (
        <message key={idx} data={msg} />
      ))}
      <input onChange={e => setInput(e.target.value)} />
      <button onClick={() => sendMessage(input)}>Send</button>
    </div>
  );
};
```

---

### 3. Appointment Update Notifications

**Backend:**
```javascript
// Broadcast appointment changes to all connected users
io.on("connection", (socket) => {
  socket.on("appointment-update", (data) => {
    io.emit("appointment-changed", {
      appointmentId: data.id,
      newStatus: data.status,
      changedAt: new Date(),
      updatedBy: data.adminId
    });
  });
});
```

**Frontend:**
```javascript
// Monitor for appointment changes
socket.on("appointment-changed", (data) => {
  // Update local state
  setAppointments(prev => 
    prev.map(apt => 
      apt.id === data.appointmentId 
        ? { ...apt, status: data.newStatus }
        : apt
    )
  );

  // Show notification
  showNotification(`Appointment ${data.appointmentId} is now ${data.newStatus}`);
});
```

---

## Payment Processing (Stripe)

### 1. Create Payment Intent

**Backend Controller:**
```javascript
// server/controllers/paymentController.js
export const createPaymentIntent = async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "inr",
      description,
      metadata: { userId }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

### 2. Frontend Payment Component

**Using Stripe Elements:**
```javascript
// src/pages/Payment.jsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create payment intent on backend
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-intent",
        { amount, description: "Pet Service Payment" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Step 2: Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: "Pet Owner" }
        }
      });

      if (result.paymentIntent?.status === "succeeded") {
        alert("✅ Payment successful!");
        // Update booking status
        updateBooking(result.paymentIntent.id);
      }
    } catch (err) {
      alert("❌ Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <CardElement />
      <button disabled={!stripe || loading}>
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

// Wrap app with Stripe provider
export default () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={500} />
  </Elements>
);
```

### 3. Payment History

**Backend:**
```javascript
// server/controllers/paymentController.js
export const getPaymentHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const payments = await stripe.paymentIntents.list({
      limit: 100
    });

    const userPayments = payments.data.filter(
      p => p.metadata?.userId === userId
    );

    res.json({
      total: userPayments.length,
      payments: userPayments.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        currency: p.currency.toUpperCase(),
        status: p.status,
        created: new Date(p.created * 1000),
        description: p.description
      }))
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

**Frontend Listing:**
```javascript
const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/payment/history",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }
    );
    setPayments(data.payments);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {payments.map(p => (
          <tr key={p.id}>
            <td>₹{p.amount}</td>
            <td>{p.status}</td>
            <td>{new Date(p.created).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Admin Authentication Patterns

### 1. Auth Context Setup

**Context Provider:**
```javascript
// admin/src/context/AuthContext.jsx
import { createContext, useState } from "react";
import API from "../services/adminApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { email, password });
      
      // Store token
      localStorage.setItem("token", data.token);
      setAdmin(data.user);
      
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Route

**ProtectedRoute Component:**
```javascript
// admin/src/routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { admin, checkAuth } = useContext(AuthContext);

  if (!checkAuth()) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

### 3. Using Auth in Components

**Example Component:**
```javascript
// admin/src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/adminApi";

const Dashboard = () => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Token automatically added by interceptor
      const { data } = await API.get("/analytics/stats");
      setStats(data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired
        logout();
        navigate("/login");
      }
    }
  };

  return (
    <div>
      <h1>Welcome, {admin?.name}</h1>
      {/* Dashboard content */}
      <button onClick={() => {
        logout();
        navigate("/login");
      }}>
        Logout
      </button>
    </div>
  );
};
```

---

## API Interceptor Pattern

**Request & Response Interceptors:**
```javascript
// admin/src/services/adminApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Request Interceptor - Add token
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle errors
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
```

---

## Data Visualization with Recharts

**Multiple Charts Example:**
```javascript
// admin/src/pages/Analytics.jsx
import {
  BarChart, LineChart, PieChart, Bar, Line, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from "recharts";

const Analytics = () => {
  const usersData = [
    { name: "Jan", users: 300, appointments: 200 },
    { name: "Feb", users: 450, appointments: 280 }
  ];

  return (
    <div className="charts-grid">
      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={usersData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="users" fill="#8884d8" />
          <Bar dataKey="appointments" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* Line Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={usersData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="users" stroke="#FF6B6B" />
          <Line type="monotone" dataKey="appointments" stroke="#4ECDC4" />
        </LineChart>
      </ResponsiveContainer>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[
              { name: "Dogs", value: 65 },
              { name: "Cats", value: 25 },
              { name: "Others", value: 10 }
            ]}
            cx="50%"
            cy="50%"
            outerRadius={80}
          >
            <Cell fill="#FF6B6B" />
            <Cell fill="#4ECDC4" />
            <Cell fill="#FFE66D" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

**Generated:** March 18, 2026  
**Version:** 1.0
