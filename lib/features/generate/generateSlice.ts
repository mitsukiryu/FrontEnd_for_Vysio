import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GenerateState {
  loading: boolean;
  error: string | null;
  data: {
    downloadUrl: string;
    htmlCode: string;
    cssCode: string;
  } | null;
}

const initialState: GenerateState = {
  loading: false,
  error: null,
  data: null,
};

const generateSlice = createSlice({
  name: 'generate',
  initialState,
  reducers: {
    generateRequest: (state, action: PayloadAction<{ fileId: string }>) => {
      state.loading = true;
      state.error = null;
    },
    generateSuccess: (state, action: PayloadAction<{ downloadUrl: string; htmlCode: string; cssCode: string }>) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    generateFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetGenerate: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
    },
  },
});

export const { generateRequest, generateSuccess, generateFailure, resetGenerate } = generateSlice.actions;
export default generateSlice.reducer;

// Made with Bob
