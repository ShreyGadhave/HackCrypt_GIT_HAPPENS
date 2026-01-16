import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null, // 'admin' or 'teacher'
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.error = null;
      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("role", action.payload.role);
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
    },
    restoreSession: (state) => {
      const user = localStorage.getItem("user");
      const role = localStorage.getItem("role");
      if (user && role) {
        state.user = JSON.parse(user);
        state.role = role;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  restoreSession,
} = authSlice.actions;

export default authSlice.reducer;
