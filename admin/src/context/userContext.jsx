import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const navigate = useNavigate();

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/"); // redirect to login
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
