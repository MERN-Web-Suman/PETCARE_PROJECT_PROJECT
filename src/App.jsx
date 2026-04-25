import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { LocationProvider } from "./context/LocationContext";
import { ToastProvider } from "./components/Toast";
import { NotificationProvider } from "./context/NotificationContext";

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <LocationProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </LocationProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
