import { createContext, useContext, useState, useEffect } from 'react';
import { signupUser, signinUser, getMe } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and restore session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('bt_token');
      if (token) {
        try {
          const data = await getMe(token);
          setUser(data.user);
        } catch (err) {
          // Token is invalid/expired — clear it
          localStorage.removeItem('bt_token');
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await signinUser(email, password);
    localStorage.setItem('bt_token', data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (username, email, password) => {
    const data = await signupUser(username, email, password);
    localStorage.setItem('bt_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('bt_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
