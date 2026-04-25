import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    setUser(authData.user);
    localStorage.setItem("user", JSON.stringify(authData.user));
    localStorage.setItem("token", authData.token);
  };

  const loginAdmin = (adminData) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("adminToken", adminData.token);
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      admin, 
      setAdmin,
      login,
      loginAdmin,
      logoutAdmin,
      logout,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
