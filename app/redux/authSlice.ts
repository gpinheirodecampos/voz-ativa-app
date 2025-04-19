import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// URL base da API
const API_URL = 'https://api.vozativa.com/auth'; // Substitua pelo URL real da API

// Estado inicial
const initialState: AuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
};

// Funções Async Thunk para operações de autenticação
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { token, user } = response.data;
      
      // Armazena o token localmente
      await SecureStore.setItemAsync('authToken', token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Falha ao fazer login');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      const { token, user } = response.data;
      
      // Armazena o token localmente
      await SecureStore.setItemAsync('authToken', token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Falha ao criar conta');
    }
  }
);

export const loadUserFromToken = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      // Recupera o token armazenado
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        return { token: null, user: null };
      }
      
      // Faz requisição para obter dados do usuário
      const response = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { token, user: response.data };
    } catch (error) {
      // Em caso de erro, limpa o token
      await SecureStore.deleteItemAsync('authToken');
      return rejectWithValue('Sessão expirada');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await SecureStore.deleteItemAsync('authToken');
    return null;
  }
);

// Slice do Redux
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Registro
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Carregar usuário do token
      .addCase(loadUserFromToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUserFromToken.fulfilled, (state, action: PayloadAction<{ token: string | null; user: User | null }>) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loadUserFromToken.rejected, (state) => {
        state.status = 'idle';
        state.token = null;
        state.user = null;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { resetAuthError } = authSlice.actions;
export default authSlice.reducer;
