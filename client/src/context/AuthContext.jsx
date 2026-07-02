/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/axiosClient";

export const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthContextProvider");
  }

  return context;
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // console.log('authuser:', authUser);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setAuthUser(response.data?.user || null);
      } catch {
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login =(user) => {
    setAuthUser(user);//setting the user in the state when they log in
  };

  const logout = () => {
    setAuthUser(null);//clearing the user from the state when they log out
  };

  const value = useMemo(
    () => ({
      authUser,
      authLoading,
      login,
      logout,
      setAuthUser,
    }),
    [authUser, authLoading]
  );//memoizing the value to prevent unnecessary re-renders bcos the value will only change when authUser changes 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
