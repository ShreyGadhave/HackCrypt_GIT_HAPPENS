import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessions: [],
  selectedSession: null,
  loading: false,
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setSessions: (state, action) => {
      state.sessions = action.payload;
      state.loading = false;
    },
    setSelectedSession: (state, action) => {
      state.selectedSession = action.payload;
    },
    addSession: (state, action) => {
      state.sessions.unshift(action.payload);
    },
    updateSession: (state, action) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    },
    deleteSession: (state, action) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setSessions,
  setSelectedSession,
  addSession,
  updateSession,
  deleteSession,
  setLoading,
  setError,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
