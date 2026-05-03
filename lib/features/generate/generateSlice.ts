import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JobStatus } from '@/lib/api/services';

export type GenerateMode = 'demo' | 'api';

export interface GenerateState {
  mode: GenerateMode;
  loading: boolean;
  error: string | null;
  jobId: string | null;
  status: JobStatus | 'idle';
  progress: number;
  currentIteration: number;
  maxIterations: number;
  latestScore: number | null;
  previewUrl: string | null;
  previewScreenshotUrl: string | null;
  downloadUrl: string | null;
  htmlCode: string | null;
  cssCode: string | null;
}

const initialState: GenerateState = {
  mode: 'demo',
  loading: false,
  error: null,
  jobId: null,
  status: 'idle',
  progress: 0,
  currentIteration: 0,
  maxIterations: 1,
  latestScore: null,
  previewUrl: null,
  previewScreenshotUrl: null,
  downloadUrl: null,
  htmlCode: null,
  cssCode: null,
};

const generateSlice = createSlice({
  name: 'generate',
  initialState,
  reducers: {
    // Set generation mode
    setGenerateMode: (state, action: PayloadAction<GenerateMode>) => {
      state.mode = action.payload;
    },
    
    // Start generation (works for both demo and API mode)
    generateRequest: (
      state,
      action: PayloadAction<{
        file: File;
        mode: GenerateMode;
        openRouterKey?: string;
        userNote?: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.mode = action.payload.mode;
      state.status = 'queued';
      state.progress = 0;
    },
    
    // Job created successfully (API mode)
    jobCreated: (
      state,
      action: PayloadAction<{
        jobId: string;
        status: JobStatus;
      }>
    ) => {
      state.jobId = action.payload.jobId;
      state.status = action.payload.status;
    },
    
    // Update job progress (API mode)
    updateJobProgress: (
      state,
      action: PayloadAction<{
        status: JobStatus;
        progress: number;
        currentIteration: number;
        maxIterations: number;
        latestScore: number | null;
        previewUrl: string | null;
        previewScreenshotUrl: string | null;
        downloadUrl: string | null;
        errorMessage: string | null;
      }>
    ) => {
      state.status = action.payload.status;
      state.progress = action.payload.progress;
      state.currentIteration = action.payload.currentIteration;
      state.maxIterations = action.payload.maxIterations;
      state.latestScore = action.payload.latestScore;
      state.previewUrl = action.payload.previewUrl;
      state.previewScreenshotUrl = action.payload.previewScreenshotUrl;
      state.downloadUrl = action.payload.downloadUrl;
      
      if (action.payload.errorMessage) {
        state.error = action.payload.errorMessage;
      }
    },
    
    // Generation completed successfully
    generateSuccess: (
      state,
      action: PayloadAction<{
        downloadUrl?: string;
        htmlCode: string;
        cssCode: string;
      }>
    ) => {
      state.loading = false;
      state.status = 'completed';
      state.progress = 100;
      state.htmlCode = action.payload.htmlCode;
      state.cssCode = action.payload.cssCode;
      if (action.payload.downloadUrl) {
        state.downloadUrl = action.payload.downloadUrl;
      }
      state.error = null;
    },
    
    // Generation failed
    generateFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.status = 'failed';
      state.error = action.payload;
    },
    
    // Switch to demo mode (fallback)
    switchToDemo: (state) => {
      state.mode = 'demo';
      state.error = null;
    },
    
    // Reset generation state
    resetGenerate: (state) => {
      return initialState;
    },
  },
});

export const {
  setGenerateMode,
  generateRequest,
  jobCreated,
  updateJobProgress,
  generateSuccess,
  generateFailure,
  switchToDemo,
  resetGenerate,
} = generateSlice.actions;

export default generateSlice.reducer;

// Made with Bob
