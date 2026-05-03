# Output Component Implementation Guide

## Overview
This document describes the implementation of the output component display functionality that shows uploaded images and generated React components in an iframe preview.

## Architecture

### Data Flow
```
User Upload Image
    ↓
Hero Component (uploadRequest)
    ↓
Upload Saga → Backend API
    ↓
Redux State (uploadSlice)
    ↓
OutputPreview Component (auto-triggers)
    ↓
Generate Saga → Backend API (ZIP file)
    ↓
Extract HTML/CSS from ZIP
    ↓
Redux State (generateSlice)
    ↓
ComponentPreview (iframe rendering)
```

## Components

### 1. ComponentPreview (`components/ui/ComponentPreview.tsx`)
**Purpose:** Renders HTML and CSS code in a sandboxed iframe

**Features:**
- Creates a complete HTML document with CSS styles
- Uses Blob URLs for secure iframe rendering
- Sandboxed iframe with `allow-scripts allow-same-origin`
- Loading and error states
- Automatic cleanup of blob URLs

**Props:**
```typescript
interface ComponentPreviewProps {
  htmlCode: string      // HTML content to render
  cssCode: string       // CSS styles to apply
  className?: string    // Optional wrapper classes
}
```

**Usage:**
```tsx
<ComponentPreview 
  htmlCode={generatedHTML} 
  cssCode={generatedCSS}
  className="h-96"
/>
```

### 2. OutputPreview (`components/sections/OutputPreview.tsx`)
**Purpose:** Main section that displays uploaded image and generated component

**Features:**
- Side-by-side layout (uploaded image | generated output)
- Three view modes: Preview, HTML, CSS
- Auto-triggers code generation after upload
- Comprehensive state management:
  - Initial state (no upload)
  - Loading state (generating)
  - Success state (preview/code display)
  - Error state (with retry button)

**State Management:**
```typescript
const uploadState = useSelector((state: RootState) => state.upload)
const generateState = useSelector((state: RootState) => state.generate)
```

## Redux State Structure

### Upload Slice
```typescript
interface UploadState {
  loading: boolean
  error: string | null
  data: {
    fileId: string    // Backend file identifier
    fileUrl: string   // URL to display uploaded image
  } | null
}
```

### Generate Slice
```typescript
interface GenerateState {
  loading: boolean
  error: string | null
  data: {
    downloadUrl: string  // URL to ZIP file
    htmlCode: string     // Extracted HTML content
    cssCode: string      // Extracted CSS content
  } | null
}
```

## Backend Integration

### API Endpoints

#### 1. Upload Image
```
POST /upload
Body: FormData with image file or URL string
Response: { fileId: string, fileUrl: string }
```

#### 2. Generate Code
```
POST /generate-code
Body: { fileId: string }
Response: { downloadUrl: string }
```

The `downloadUrl` points to a ZIP file containing:
- `index.html` or any `.html` file
- `style.css` or any `.css` file

### ZIP File Structure
```
generated-code.zip
├── index.html
└── style.css
```

## Implementation Details

### 1. ZIP Extraction (generateSaga.ts)
```typescript
async function extractZipContent(zipBlob: Blob) {
  const zip = new JSZip()
  const zipContent = await zip.loadAsync(zipBlob)
  
  // Find HTML file
  const htmlFile = zipContent.file(/\.html$/i)[0]
  const htmlCode = await htmlFile.async('text')
  
  // Find CSS file
  const cssFile = zipContent.file(/\.css$/i)[0]
  const cssCode = await cssFile.async('text')
  
  return { htmlCode, cssCode }
}
```

### 2. Iframe Rendering (ComponentPreview.tsx)
```typescript
const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    /* User's CSS */
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
</body>
</html>
`

const blob = new Blob([fullHTML], { type: 'text/html' })
const blobUrl = URL.createObjectURL(blob)
```

### 3. Auto-trigger Generation
```typescript
useEffect(() => {
  if (uploadState.data?.fileId && !generateState.loading && !generateState.data) {
    dispatch(generateRequest({ fileId: uploadState.data.fileId }))
  }
}, [uploadState.data, generateState.loading, generateState.data, dispatch])
```

## User Experience Flow

### 1. Initial State
- User sees empty placeholders
- "Upload an image to see the magic" message
- Upload button in Hero section

### 2. Upload State
- User uploads image via file picker or URL
- Loading indicator shows "Uploading..."
- Image appears in left panel

### 3. Generation State
- Auto-triggers after successful upload
- Loading spinner with "Generating your component..."
- Progress message: "This may take a few moments"

### 4. Success State
- Three tabs: Preview, HTML, CSS
- Default view: Preview (iframe)
- Code tabs show syntax-highlighted code
- Uploaded image visible in left panel

### 5. Error State
- Error message displayed
- Retry button available
- Error details from backend

## Security Considerations

### Iframe Sandbox
```html
<iframe sandbox="allow-scripts allow-same-origin" />
```

**Restrictions:**
- ✅ Allows JavaScript execution
- ✅ Allows same-origin access
- ❌ Blocks form submission
- ❌ Blocks popups
- ❌ Blocks top navigation

### Blob URL Cleanup
```typescript
useEffect(() => {
  const blobUrl = URL.createObjectURL(blob)
  
  return () => {
    URL.revokeObjectURL(blobUrl) // Cleanup on unmount
  }
}, [htmlCode, cssCode])
```

## Styling

### Design System
- **Font:** Instrument Sans (variable font)
- **Colors:**
  - Primary: `#0a0a0a` (black)
  - Secondary: `#64748b` (slate)
  - Background: Glass morphism effect
- **Animations:**
  - Fade in/out transitions
  - Loading spinners
  - Hover effects

### Responsive Design
- Desktop: Side-by-side layout (2 columns)
- Mobile: Stacked layout (1 column)
- Minimum height: 400px for preview

## Error Handling

### Upload Errors
- Network failures
- Invalid file types
- File size limits
- Backend errors

### Generation Errors
- ZIP download failures
- Invalid ZIP format
- Missing HTML/CSS files
- Extraction errors

### Display Errors
- Iframe loading failures
- Blob creation errors
- Rendering issues

## Testing Checklist

- [ ] Upload image via file picker
- [ ] Upload image via URL
- [ ] Verify image displays in left panel
- [ ] Verify auto-generation triggers
- [ ] Check loading states
- [ ] Verify iframe preview renders correctly
- [ ] Test HTML tab display
- [ ] Test CSS tab display
- [ ] Test error handling (network failure)
- [ ] Test retry functionality
- [ ] Verify responsive design
- [ ] Check blob URL cleanup

## Dependencies

```json
{
  "jszip": "^3.10.1",           // ZIP file extraction
  "react-redux": "^9.1.0",      // State management
  "redux-saga": "^1.3.0",       // Side effects
  "lucide-react": "^0.344.0",   // Icons
  "framer-motion": "^11.0.0"    // Animations
}
```

## Future Enhancements

1. **Code Syntax Highlighting**
   - Add `react-syntax-highlighter` for better code display
   - Support multiple themes

2. **Download Functionality**
   - Download ZIP file directly
   - Copy code to clipboard
   - Export as CodeSandbox/StackBlitz

3. **Preview Controls**
   - Responsive preview modes (mobile/tablet/desktop)
   - Zoom controls
   - Fullscreen mode

4. **Real-time Editing**
   - Edit HTML/CSS in-place
   - Live preview updates
   - Save modifications

5. **Multiple File Support**
   - Support JavaScript files
   - Handle multiple HTML pages
   - Asset management (images, fonts)

## Troubleshooting

### Issue: Iframe not rendering
**Solution:** Check browser console for CORS errors. Ensure blob URLs are properly created.

### Issue: ZIP extraction fails
**Solution:** Verify ZIP file structure. Ensure HTML/CSS files exist with correct extensions.

### Issue: Loading state stuck
**Solution:** Check network tab for failed API calls. Verify backend is running and accessible.

### Issue: Image not displaying
**Solution:** Verify `fileUrl` is accessible. Check CORS headers on image server.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Check Redux DevTools for state
4. Review network requests in DevTools

---

**Implementation Date:** 2026-05-03  
**Version:** 1.0.0  
**Author:** Bob (AI Assistant)