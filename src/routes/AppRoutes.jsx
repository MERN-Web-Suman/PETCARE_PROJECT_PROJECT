import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import Dashboard from "../pages/Dashboard";
import AddPet from "../pages/AddPet";
import Appointments from "../pages/Appointments";
import Adoption from "../pages/Adoption";
import LostFound from "../pages/LostFound";
import Community from "../pages/Community";
import SOS from "../pages/SOS";
import Payment from "../pages/Payment";
import PetProfile from "../pages/PetProfile";
import Clinics from "../pages/Clinics";
import ClinicDetails from "../pages/ClinicDetails";
import EditPet from "../pages/EditPet";
import Mart from "../pages/Mart";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/MyOrders";
import Wishlist from "../pages/Wishlist";
import Notices from "../pages/Notices";
import PetAppointments from "../pages/PetAppointments";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ChatAssistant from "../components/ChatAssistant";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add-pet" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
        <Route path="/edit-pet/:id" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
        <Route path="/pet/:id" element={<PetProfile />} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/pet-appointments" element={<ProtectedRoute><PetAppointments /></ProtectedRoute>} />
        <Route path="/adoption" element={<Adoption />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/community" element={<Community />} />
        <Route path="/clinics" element={<Clinics />} />
        <Route path="/clinic/:id" element={<ClinicDetails />} />
        <Route path="/mart" element={<Mart />} />
        <Route path="/mart/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/mart/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      </Routes>
      <ChatAssistant />
    </BrowserRouter>
  );
};

export default AppRoutes;
