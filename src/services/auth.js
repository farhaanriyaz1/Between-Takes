const API_BASE = import.meta.env.VITE_AUTH_API_BASE || 'http://localhost:3001/api';

export const signupUser = async (username, email, password) => {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }

  return data;
};

export const signinUser = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Signin failed');
  }

  return data;
};

export const getMe = async (token) => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user');
  }

  return data;
};
