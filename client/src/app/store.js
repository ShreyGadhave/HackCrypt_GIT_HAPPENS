import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import sessionsReducer from '../features/sessions/sessionsSlice';
import filesReducer from '../features/files/filesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    sessions: sessionsReducer,
    files: filesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const selectAuth = (state) => state.auth;
export const selectAttendance = (state) => state.attendance;
export const selectSessions = (state) => state.sessions;
export const selectFiles = (state) => state.files;
