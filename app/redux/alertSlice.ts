import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Tipos
export interface Alert {
  id: string;
  category: 'arvore_caida' | 'acidente' | 'poste_sem_luz';
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photo?: string;
  createdAt: string;
  userId: string;
}

interface AlertState {
  alerts: Alert[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

interface CreateAlertData {
  category: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photo?: string;
}

// URL base da API
const API_URL = 'https://api.vozativa.com/alert'; // Substitua pelo URL real da API

// Estado inicial
const initialState: AlertState = {
  alerts: [],
  status: 'idle',
  error: null,
};

// Funções Async Thunk para operações de alertas
export const fetchAlerts = createAsyncThunk(
  'alert/fetchAlerts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Falha ao carregar alertas');
    }
  }
);

export const createAlert = createAsyncThunk(
  'alert/createAlert',
  async (alertData: CreateAlertData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      
      // Configuração para upload de arquivo se houver foto
      const formData = new FormData();
      formData.append('category', alertData.category);
      formData.append('description', alertData.description);
      
      if (alertData.location) {
        formData.append('location', JSON.stringify(alertData.location));
      }
      
      if (alertData.photo) {
        const photoUri = alertData.photo;
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        } as any);
      }
      
      const response = await axios.post(`${API_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${state.auth.token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Falha ao criar alerta');
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alert/deleteAlert',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`
        }
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Falha ao deletar alerta');
    }
  }
);

// Slice do Redux
const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    resetAlertError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Carregar alertas
      .addCase(fetchAlerts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<Alert[]>) => {
        state.status = 'idle';
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Criar alerta
      .addCase(createAlert.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAlert.fulfilled, (state, action: PayloadAction<Alert>) => {
        state.status = 'idle';
        state.alerts.unshift(action.payload);
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Deletar alerta
      .addCase(deleteAlert.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAlert.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'idle';
        state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetAlertError } = alertSlice.actions;
export default alertSlice.reducer;
