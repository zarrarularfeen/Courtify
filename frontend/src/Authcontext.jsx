import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  const isOwner = () => user?.userType === 'owner';
  const isPlayer = () => user?.userType === 'player';

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner, isPlayer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);