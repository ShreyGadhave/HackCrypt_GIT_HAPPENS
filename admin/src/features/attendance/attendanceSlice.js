import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  records: [],
  students: [],
  filters: {
    class: "Class 10",
    section: "10 A",
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  },
  selectedDate: new Date().toISOString().split("T")[0],
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setAttendanceRecords: (state, action) => {
      state.records = action.payload;
      state.loading = false;
    },
    setStudents: (state, action) => {
      state.students = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    markAttendance: (state, action) => {
      const { studentId, date, status } = action.payload;
      const recordIndex = state.records.findIndex(
        (r) => r.studentId === studentId && r.date === date
      );
      if (recordIndex !== -1) {
        state.records[recordIndex].status = status;
      } else {
        state.records.push({ studentId, date, status });
      }
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
  setAttendanceRecords,
  setStudents,
  setFilters,
  setSelectedDate,
  markAttendance,
  setLoading,
  setError,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
