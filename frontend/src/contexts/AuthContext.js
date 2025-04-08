import { useState, createContext, useContext, useEffect } from "react";
import { fetchLogout, fetchMe } from "../api";
import { Flex, Spinner } from "@chakra-ui/react";

const AuthContext = createContext();

// Helper function to handle common authentication errors
export const handleAuthError = (error) => {
  if (!error) return "An unexpected error occurred";
  
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      return error.response.data.message;
    } else if (error.response.status === 401) {
      return "Authentication failed. Please check your credentials.";
    } else if (error.response.status === 404) {
      return "User not found. Please check your email address.";
    } else if (error.response.status === 409) {
      return "Email already exists. Please use a different email address.";
    } else if (error.response.status === 400) {
      return "Invalid input. Please check your information and try again.";
    } else {
      return "Server error. Please try again later.";
    }
  } else if (error.request) {
    return "Network error. Please check your internet connection.";
  } else {
    return "An unexpected error occurred. Please try again later.";
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();

        if (Object.keys(me).length === 0) {
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          setUser(me);
        }

        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    })();
  }, []);

  const login = (data) => {
    try {
      // Log the data to debug
      console.log("Login response data:", data);
      
      // Validate the data structure
      if (!data) {
        console.error("Login data is missing");
        throw new Error("Invalid login response");
      }
      
      // Check for required fields with more flexibility
      // Some APIs might return token instead of accessToken
      const accessToken = data.accessToken || data.token;
      if (!accessToken) {
        console.error("Access token is missing in login response", data);
        throw new Error("Access token is missing");
      }
      
      // Handle different user data structures
      // Some APIs might return user object directly or as a property
      const userData = data.user || data;
      if (!userData) {
        console.error("User data is missing in login response", data);
        throw new Error("User data is missing");
      }
      
      console.log("Setting user data:", userData);
      
      // Set the authentication state
      setLoggedIn(true);
      setUser(userData);

      // Store tokens in localStorage
      localStorage.setItem("access-token", accessToken);
      
      // Handle refresh token if it exists
      const refreshToken = data.refreshToken || data.refresh_token;
      if (refreshToken) {
        localStorage.setItem("refresh-token", refreshToken);
      }
      
      return true;
    } catch (error) {
      console.error("Error in login function:", error);
      return false;
    }
  };

  const logout = async () => {
    setLoggedIn(false);
    setUser(null);

    await fetchLogout();

    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
  };

  const values = {
    loggedIn,
    user,
    login,
    logout,
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" />
      </Flex>
    );
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
