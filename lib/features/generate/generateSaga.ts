import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import JSZip from 'jszip';
import apiClient from '../../api/client';
import { generateRequest, generateSuccess, generateFailure } from './generateSlice';

/**
 * Extract HTML and CSS content from ZIP file
 */
async function extractZipContent(zipBlob: Blob): Promise<{ htmlCode: string; cssCode: string }> {
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

function* handleGenerate(action: PayloadAction<{ fileId: string }>): Generator<any, void, any> {
  try {
    const { fileId } = action.payload;
    
    // Step 1: Request code generation from backend
    const response = yield call(apiClient.post, '/generate-code', { fileId });
    const downloadUrl = response.data.downloadUrl;

    // Step 2: Download the ZIP file
    const zipResponse = yield call(fetch, downloadUrl);
    if (!zipResponse.ok) {
      throw new Error('Failed to download generated code');
    }
    
    const zipBlob = yield call([zipResponse, 'blob']);
    
    // Step 3: Extract HTML and CSS from ZIP
    const { htmlCode, cssCode } = yield call(extractZipContent, zipBlob);

    // Step 4: Store everything in Redux state
    yield put(generateSuccess({
      downloadUrl,
      htmlCode,
      cssCode,
    }));
  } catch (error: any) {
    yield put(generateFailure(error.response?.data?.message || error.message || 'Code generation failed'));
  }
}

export function* watchGenerate() {
  yield takeLatest(generateRequest.type, handleGenerate);
}

// Made with Bob
