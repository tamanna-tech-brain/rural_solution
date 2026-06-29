import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from localStorage on app load
const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) return { user, token, isAuthenticated: true };
  } catch {
    // ignore parse errors
  }
  return { user: null, token: null, isAuthenticated: false };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage(),

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setUser, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;