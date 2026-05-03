# FE API Integration Guide

This document explains how the frontend should integrate with the Platform BFF backend while cloud provisioning is still being set up.

Current temporary API base URL:

```txt
https://897b-2401-4900-1c84-3204-6511-398-c1a0-b24f.ngrok-free.app
```

Ngrok URLs can change when the tunnel restarts. Replace this value with the latest tunnel URL when needed.

## Important Auth Note

No backend API auth key is currently required.

Do not send these headers:

```ts
Authorization: `Bearer ${API_AUTH_TOKEN}`
"X-API-Key": API_AUTH_TOKEN
```

The frontend can call the backend directly without API auth headers.

Separate from backend API auth, OpenRouter jobs may still require an OpenRouter API key in the form field `user_api_key` because the backend is currently configured with:

```txt
REQUIRE_USER_OPENROUTER_KEY=true
```

That means:

- No backend auth header is needed.
- For `ai_provider=openrouter`, the request must include `user_api_key` unless the backend switches to server-key mode.

## High-Level Flow

1. User uploads an image in the frontend.
2. User clicks Generate.
3. FE calls `POST /jobs` with `multipart/form-data`.
4. BE creates an async job and immediately returns `job_id`.
5. FE stores `job_id`.
6. FE polls `GET /jobs/{job_id}` every 2 to 5 seconds.
7. BE returns job status and progress.
8. When status becomes `completed`, FE uses `preview_url`, `preview_screenshot_url`, and `download_url`.
9. When status becomes `failed`, FE stops polling and shows `error_message`.

Minimum required APIs:

```txt
POST /jobs
GET /jobs/{job_id}
```

Optional APIs:

```txt
GET /health
GET /jobs/{job_id}/preview
GET /jobs/{job_id}/download
GET /jobs/{job_id}/evaluations
```

## API Base URL Setup

```ts
export const API_BASE_URL =
  "https://897b-2401-4900-1c84-3204-6511-398-c1a0-b24f.ngrok-free.app";
```

## 1. Health Check

Use this to verify the backend is reachable.

```http
GET /health
```

Example:

```ts
async function checkBackendHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}
```

Success response:

```json
{
  "status": "ok",
  "service": "platform-bff"
}
```

## 2. Create Generation Job

This is the first required call after the user clicks Generate.

```http
POST /jobs
Content-Type: multipart/form-data
```

Do not manually set `Content-Type` in fetch. The browser sets the correct multipart boundary automatically.

### Request Fields

```ts
type CreateJobForm = {
  image: File;
  viewport_width?: number;
  viewport_height?: number;
  max_iterations?: number;
  mode?: string;
  ai_provider?: "openrouter" | "codex";
  user_api_key?: string;
  model?: string;
  coder_model?: string;
  evaluator_model?: string;
  user_note?: string;
};
```

Field details:

| Field | Required | Default | Notes |
| --- | --- | --- | --- |
| `image` | Yes | None | PNG, JPG/JPEG, or WEBP |
| `viewport_width` | No | `1440` | Target viewport width |
| `viewport_height` | No | `900` | Target viewport height |
| `max_iterations` | No | `3` | Use `1` for faster demo runs |
| `mode` | No | `balanced` | Currently stored as metadata |
| `ai_provider` | No | `openrouter` | Allowed: `openrouter`, `codex` |
| `user_api_key` | Conditional | None | Required for OpenRouter if `REQUIRE_USER_OPENROUTER_KEY=true` |
| `model` | No | Backend default | Shared coder/evaluator model |
| `coder_model` | No | Backend default | Coder model override |
| `evaluator_model` | No | Backend default | Evaluator model override |
| `user_note` | No | None | Optional user instruction |

### Frontend Example

```ts
export async function createGenerationJob(params: {
  file: File;
  openRouterKey?: string;
  userNote?: string;
}) {
  const form = new FormData();

  form.append("image", params.file);
  form.append("viewport_width", "1440");
  form.append("viewport_height", "900");
  form.append("max_iterations", "1");
  form.append("ai_provider", "openrouter");

  if (params.openRouterKey) {
    form.append("user_api_key", params.openRouterKey);
  }

  if (params.userNote) {
    form.append("user_note", params.userNote);
  }

  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
```

### Success Response

HTTP status: `201`

```json
{
  "success": true,
  "job_id": "job_xxx",
  "status": "queued",
  "poll_url": "/jobs/job_xxx"
}
```

Frontend should store `job_id` and start polling `poll_url`.

## 3. Poll Job Status

This is the second required API. Call it repeatedly until the job finishes.

```http
GET /jobs/{job_id}
```

Example:

```ts
export async function getJobStatus(jobId: string) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
```

### Response Type

```ts
type JobStatusResponse = {
  success: true;
  job: {
    job_id: string;
    status:
      | "queued"
      | "picked"
      | "coding"
      | "packaging"
      | "completed"
      | "failed";
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
};
```

### Polling Example

```ts
export function pollGenerationJob(params: {
  jobId: string;
  onUpdate: (job: JobStatusResponse["job"]) => void;
  onComplete: (job: JobStatusResponse["job"]) => void;
  onFail: (job: JobStatusResponse["job"]) => void;
  onError: (error: unknown) => void;
}) {
  const intervalId = window.setInterval(async () => {
    try {
      const data = await getJobStatus(params.jobId);
      const job = data.job;

      params.onUpdate(job);

      if (job.status === "completed") {
        window.clearInterval(intervalId);
        params.onComplete(job);
      }

      if (job.status === "failed") {
        window.clearInterval(intervalId);
        params.onFail(job);
      }
    } catch (error) {
      window.clearInterval(intervalId);
      params.onError(error);
    }
  }, 3000);

  return () => window.clearInterval(intervalId);
}
```

### Status Meaning

| Status | Meaning | FE behavior |
| --- | --- | --- |
| `queued` | Job accepted and waiting | Show queued/loading |
| `picked` | Worker picked the job | Show starting |
| `coding` | Agent is generating source | Show progress |
| `packaging` | BE is uploading/packaging output | Show finalizing |
| `completed` | Job finished | Stop polling and show result |
| `failed` | Job failed | Stop polling and show error |

### Completed Response Example

```json
{
  "success": true,
  "job": {
    "job_id": "job_xxx",
    "status": "completed",
    "progress": 100,
    "current_iteration": 1,
    "max_iterations": 1,
    "latest_score": 0.91,
    "preview_url": "https://...",
    "preview_screenshot_url": "https://...",
    "download_url": "https://...",
    "error_message": null,
    "created_at": "2026-05-03T00:00:00+00:00",
    "updated_at": "2026-05-03T00:00:00+00:00"
  }
}
```

Use these fields:

```txt
preview_url
preview_screenshot_url
download_url
latest_score
```

## 4. Get Preview URLs

Optional. The main status API already returns preview URLs.

```http
GET /jobs/{job_id}/preview
```

Success response:

```json
{
  "success": true,
  "preview_url": "https://...",
  "preview_screenshot_url": "https://..."
}
```

## 5. Get Download URL

Optional. The main status API already returns the download URL after completion.

```http
GET /jobs/{job_id}/download
```

Success response:

```json
{
  "success": true,
  "download_url": "https://..."
}
```

If the job is not completed yet, this API returns HTTP `409`.

## 6. Get Evaluations

Optional. Use only if the frontend wants to show iteration score history or critique details.

```http
GET /jobs/{job_id}/evaluations
```

Success response:

```json
{
  "success": true,
  "evaluations": [
    {
      "iteration": 1,
      "score": 0.86,
      "summary": "Generated UI is close but spacing differs.",
      "critique": {},
      "preview_screenshot_url": "https://...",
      "created_at": "2026-05-03T00:00:00+00:00"
    }
  ]
}
```

## Recommended FE State Machine

```ts
type GenerationState =
  | { type: "idle" }
  | { type: "upload_selected"; file: File }
  | { type: "creating_job" }
  | { type: "running"; jobId: string; progress: number; status: string }
  | {
      type: "completed";
      jobId: string;
      previewUrl: string | null;
      previewScreenshotUrl: string | null;
      downloadUrl: string | null;
      score: number | null;
    }
  | { type: "failed"; jobId?: string; message: string };
```

## Error Response Shape

All backend API errors use this shape:

```json
{
  "detail": {
    "success": false,
    "error": {
      "code": "INVALID_REQUEST",
      "message": "OpenRouter jobs require user_api_key."
    }
  }
}
```

Common error codes:

| Code | Meaning |
| --- | --- |
| `INVALID_REQUEST` | Invalid form values or missing required OpenRouter key |
| `INVALID_FILE_TYPE` | Uploaded file is not PNG, JPG/JPEG, or WEBP |
| `UPLOAD_TOO_LARGE` | Image exceeds backend upload size limit |
| `JOB_NOT_FOUND` | Unknown `job_id` |
| `JOB_NOT_COMPLETED` | Download requested before completion |
| `INTERNAL_ERROR` | BE failed to create/enqueue/process job |

## Complete FE Flow Example

```ts
async function handleGenerate(file: File, openRouterKey?: string) {
  const created = await createGenerationJob({
    file,
    openRouterKey,
    userNote: "Generate source code matching this image.",
  });

  const stopPolling = pollGenerationJob({
    jobId: created.job_id,
    onUpdate: (job) => {
      console.log("Job update", job.status, job.progress);
    },
    onComplete: (job) => {
      console.log("Preview URL", job.preview_url);
      console.log("Preview screenshot URL", job.preview_screenshot_url);
      console.log("Download URL", job.download_url);
    },
    onFail: (job) => {
      console.error(job.error_message || "Generation failed");
    },
    onError: (error) => {
      console.error("Polling failed", error);
    },
  });

  return stopPolling;
}
```

## CORS Notes

The backend allows configured frontend origins only. If browser requests fail with CORS, add the FE URL to backend env:

```env
FRONTEND_URL=http://localhost:5173
CORS_ALLOW_ORIGINS=["http://localhost:5173","http://localhost:3000","https://your-fe-url.com"]
```

Then restart the backend:

```bash
docker compose up -d --force-recreate api
```

## Ngrok Notes

If the frontend receives an HTML ngrok warning page instead of JSON while using the free ngrok URL, add this request header:

```ts
"ngrok-skip-browser-warning": "true"
```

This is not an auth key.

Example:

```ts
const res = await fetch(`${API_BASE_URL}/health`, {
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});
```

For `POST /jobs`, it is okay to include this header while still leaving `Content-Type` unset:

```ts
const res = await fetch(`${API_BASE_URL}/jobs`, {
  method: "POST",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
  body: form,
});
```

## What BE Does Internally

The frontend calls only the Platform BFF API.

The backend then:

1. Validates the uploaded image.
2. Stores the original image.
3. Creates a job record.
4. Enqueues the job.
5. Worker picks the job.
6. Worker invokes `agentic-ai-cli` internally.
7. Worker uploads final preview/source/ZIP artifacts.
8. Backend status API returns final URLs to the frontend.

The frontend should never call `agentic-ai-cli` directly.
