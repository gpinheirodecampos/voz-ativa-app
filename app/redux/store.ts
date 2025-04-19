// filepath: c:\tetete\uiuiuiui\voz-ativa-app\app\redux\store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import alertReducer from './alertSlice';

// Create and export the store directly
export const store = configureStore({
  reducer: {
    auth: authReducer,
    alert: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Define types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// This will allow importing the store as a default export
export default store;
