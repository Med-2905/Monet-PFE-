import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import authService from "../services/authService";
import {
  clearAuthStorage,
  extractToken,
  extractUser,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../services/authStorage";

const AuthContext = createContext(null);

function getDashboardPath(role) {
  if (role === "admin") return "/admin";
  if (role === " doctor") return "/doctor";
  if (role === "patient") return "/patient";

  return "/";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [tokenState, setTokenState] = useState(getToken);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isAuthenticated = Boolean(tokenState && user);

  const saveAuthSession = useCallback((token, userData) => {
    setToken(token);
    setStoredUser(userData);

    setTokenState(token);
    setUser(userData);
  }, []);

  const clearAuthSession = useCallback(() => {
    clearAuthStorage();
    setTokenState(null);
    setUser(null);
  }, []);

  const me = useCallback(async () => {
    const data = await authService.me();
    const currentUser = extractUser(data) || data?.user || data;

    setStoredUser(currentUser);
    setUser(currentUser);

    return currentUser;
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        await me();
      } catch {
        clearAuthSession();
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [clearAuthSession, me]);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);

      const token = extractToken(data);
      const userData = extractUser(data);

      if (!token) {
        throw new Error("Login response does not contain token.");
      }

      if (!userData) {
        throw new Error("Login response does not contain user.");
      }

      saveAuthSession(token, userData);

      return {
        user: userData,
        redirectTo: getDashboardPath(userData.role),
      };
    },
    [saveAuthSession]
  );

  const register = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const refresh = useCallback(async () => {
    const data = await authService.refresh();

    const newToken = extractToken(data);

    if (!newToken) {
      throw new Error("Refresh response does not contain token.");
    }

    setToken(newToken);
    setTokenState(newToken);

    return newToken;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthSession();
    }
  }, [clearAuthSession]);

  const value = useMemo(
    () => ({
      user,
      token: tokenState,
      isAuthenticated,
      isCheckingAuth,
      login,
      register,
      refresh,
      logout,
      me,
      getDashboardPath,
    }),
    [
      user,
      tokenState,
      isAuthenticated,
      isCheckingAuth,
      login,
      register,
      refresh,
      logout,
      me,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}