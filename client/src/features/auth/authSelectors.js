import { createSelector } from '@reduxjs/toolkit';

export const selectAuthState = (state) => state.auth;

export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectRole = createSelector(
  [selectAuthState],
  (auth) => auth.role
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectIsAdmin = createSelector(
  [selectRole],
  (role) => role === 'admin'
);

export const selectIsTeacher = createSelector(
  [selectRole],
  (role) => role === 'teacher'
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);
