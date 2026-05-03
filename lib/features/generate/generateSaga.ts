import { call, put, takeLatest, delay } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  generateRequest,
  generateSuccess,
  generateFailure,
  jobCreated,
  updateJobProgress,
  switchToDemo,
} from './generateSlice';
import {
  createGenerationJob,
  getJobStatus,
  downloadAndExtractZip,
  JobStatusResponse,
} from '@/lib/api/services';

// Demo HTML and CSS for demo mode
const DEMO_HTML = `<div class="hero-section">
  <div class="container">
    <div class="content">
      <h1 class="title">Welcome to Vysio</h1>
      <p class="subtitle">Transform your designs into production-ready code instantly</p>
      <div class="button-group">
        <button class="btn btn-primary">Get Started</button>
        <button class="btn btn-secondary">Learn More</button>
      </div>
    </div>
    <div class="image-placeholder">
      <div class="placeholder-icon">🎨</div>
    </div>
  </div>
</div>`;

const DEMO_CSS = `.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.content {
  color: white;
}

.title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.image-placeholder {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.placeholder-icon {
  font-size: 8rem;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .title {
    font-size: 2.5rem;
  }
}`;

/**
 * Handle demo mode generation
 */
function* handleDemoGenerate(): Generator<any, void, any> {
  try {
    // Simulate processing delay
    yield delay(1500);

    // Return demo code
    yield put(
      generateSuccess({
        htmlCode: DEMO_HTML,
        cssCode: DEMO_CSS,
      })
    );
  } catch (error: any) {
    yield put(generateFailure(error.message || 'Demo generation failed'));
  }
}

/**
 * Handle API mode generation
 */
function* handleApiGenerate(
  file: File,
  openRouterKey?: string,
  userNote?: string
): Generator<any, void, any> {
  try {
    // Step 1: Create generation job
    const createResponse: ReturnType<typeof createGenerationJob> = yield call(
      createGenerationJob,
      {
        file,
        openRouterKey,
        userNote,
        viewportWidth: 1440,
        viewportHeight: 900,
        maxIterations: 1,
      }
    );

    const jobData = yield createResponse;
    
    yield put(
      jobCreated({
        jobId: jobData.job_id,
        status: jobData.status,
      })
    );

    // Step 2: Poll for job status
    let attempts = 0;
    const maxAttempts = 100; // 5 minutes with 3-second intervals
    const pollInterval = 3000;

    while (attempts < maxAttempts) {
      yield delay(pollInterval);

      const statusResponse: JobStatusResponse = yield call(
        getJobStatus,
        jobData.job_id
      );

      const job = statusResponse.job;

      // Update progress in Redux
      yield put(
        updateJobProgress({
          status: job.status,
          progress: job.progress,
          currentIteration: job.current_iteration,
          maxIterations: job.max_iterations,
          latestScore: job.latest_score,
          previewUrl: job.preview_url,
          previewScreenshotUrl: job.preview_screenshot_url,
          downloadUrl: job.download_url,
          errorMessage: job.error_message,
        })
      );

      // Check if job is completed
      if (job.status === 'completed') {
        if (!job.download_url) {
          throw new Error('Job completed but no download URL provided');
        }

        // Step 3: Download and extract ZIP
        const { htmlCode, cssCode } = yield call(
          downloadAndExtractZip,
          job.download_url
        );

        // Step 4: Success
        yield put(
          generateSuccess({
            downloadUrl: job.download_url,
            htmlCode,
            cssCode,
          })
        );

        return;
      }

      // Check if job failed
      if (job.status === 'failed') {
        throw new Error(job.error_message || 'Job failed');
      }

      attempts++;
    }

    throw new Error('Job polling timeout - maximum attempts reached');
  } catch (error: any) {
    // Extract error message from API error format
    let errorMessage = 'Code generation failed';

    if (error?.detail?.error?.message) {
      errorMessage = error.detail.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    yield put(generateFailure(errorMessage));

    // Optionally switch to demo mode on error
    // Uncomment if you want automatic fallback
    // yield put(switchToDemo());
  }
}

/**
 * Main generate handler - routes to demo or API mode
 */
function* handleGenerate(
  action: PayloadAction<{
    file: File;
    mode: 'demo' | 'api';
    openRouterKey?: string;
    userNote?: string;
  }>
): Generator<any, void, any> {
  const { file, mode, openRouterKey, userNote } = action.payload;

  if (mode === 'demo') {
    yield call(handleDemoGenerate);
  } else {
    yield call(handleApiGenerate, file, openRouterKey, userNote);
  }
}

export function* watchGenerate() {
  yield takeLatest(generateRequest.type, handleGenerate);
}

// Made with Bob
