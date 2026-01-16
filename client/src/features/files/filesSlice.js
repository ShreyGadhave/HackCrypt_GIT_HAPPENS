import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: [],
  selectedFile: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
    },
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
    },
    addFile: (state, action) => {
      state.files.unshift(action.payload);
    },
    deleteFile: (state, action) => {
      state.files = state.files.filter(f => f.id !== action.payload);
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
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
  setFiles,
  setSelectedFile,
  addFile,
  deleteFile,
  setUploadProgress,
  setLoading,
  setError,
} = filesSlice.actions;

export default filesSlice.reducer;
