import React, { createContext, useState, useEffect, useContext } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [locationName, setLocationName] = useState("Fetching location...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`
      );
      const data = await response.json();

      const address = data.address;
      // Broader fallback chain — works well across India and globally
      const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.county ||
        address.village ||
        address.suburb ||
        address.district ||
        "";
      const state = address.state || address.state_district || "";

      setCityName(city);
      setStateName(state);
      setLocationName(city && state ? `${city}, ${state}` : city || state || "Unknown Location");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching location name:", err);
      setLocationName("Location unavailable");
      setError("Failed to fetch location name");
      setLoading(false);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationName("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchLocationName(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationName("Location access denied");
        setCityName("");
        setStateName("");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    getLiveLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ locationName, cityName, stateName, loading, error, refreshLocation: getLiveLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
};
