import { API_BASE_URL } from './client';

/**
 * API Response Types based on FE_API_INTEGRATION.md
 */

export type JobStatus = 'queued' | 'picked' | 'coding' | 'packaging' | 'completed' | 'failed';

export interface CreateJobResponse {
  success: true;
  job_id: string;
  status: JobStatus;
  poll_url: string;
}

export interface JobStatusResponse {
  success: true;
  job: {
    job_id: string;
    status: JobStatus;
    progress: number;
    current_iteration: number;
    max_iterations: number;
    latest_score: number | null;
    preview_url: string | null;
    preview_screenshot_url: string | null;
    download_url: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export interface ApiError {
  detail: {
    success: false;
    error: {
      code: string;
      message: string;
    };
  };
}

/**
 * API Service Functions
 */

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!res.ok) {
    throw new Error('Backend health check failed');
  }

  return res.json();
}

/**
 * Create a new generation job
 */
export async function createGenerationJob(params: {
  file: File;
  openRouterKey?: string;
  userNote?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  maxIterations?: number;
}): Promise<CreateJobResponse> {
  const form = new FormData();

  // Required field
  form.append('image', params.file);

  // Optional fields with defaults
  form.append('viewport_width', String(params.viewportWidth || 1440));
  form.append('viewport_height', String(params.viewportHeight || 900));
  form.append('max_iterations', String(params.maxIterations || 1));
  form.append('ai_provider', 'openrouter');

  // OpenRouter API key (required if REQUIRE_USER_OPENROUTER_KEY=true)
  if (params.openRouterKey) {
    form.append('user_api_key', params.openRouterKey);
  }

  // Optional user note
  if (params.userNote) {
    form.append('user_note', params.userNote);
  }

  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      // Don't set Content-Type - browser will set it with boundary
      'ngrok-skip-browser-warning': 'true',
    },
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

/**
 * Download and extract ZIP file content
 */
export async function downloadAndExtractZip(downloadUrl: string): Promise<{
  htmlCode: string;
  cssCode: string;
}> {
  // Import JSZip dynamically
  const JSZip = (await import('jszip')).default;

  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error('Failed to download generated code');
  }

  const zipBlob = await res.blob();
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipBlob);

  let htmlCode = '';
  let cssCode = '';

  // Look for HTML file (index.html or any .html file)
  const htmlFile = zipContent.file(/\.html$/i)[0];
  if (htmlFile) {
    htmlCode = await htmlFile.async('text');
  }

  // Look for CSS file (style.css or any .css file)
  const cssFile = zipContent.file(/\.css$/i)[0];
  if (cssFile) {
    cssCode = await cssFile.async('text');
  }

  if (!htmlCode) {
    throw new Error('No HTML file found in ZIP');
  }

  return { htmlCode, cssCode };
}

/**
 * Poll job status until completion or failure
 */
export async function pollJobUntilComplete(
  jobId: string,
  onProgress: (status: JobStatusResponse['job']) => void,
  intervalMs: number = 3000,
  maxAttempts: number = 100
): Promise<JobStatusResponse['job']> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await getJobStatus(jobId);
    const job = response.job;

    onProgress(job);

    if (job.status === 'completed') {
      return job;
    }

    if (job.status === 'failed') {
      throw new Error(job.error_message || 'Job failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Job polling timeout - maximum attempts reached');
}

// Made with Bob