# Demo Mode Guide

## Overview
The application now works in **DEMO MODE** without requiring a backend. When you upload an image, it immediately displays a beautiful demo HTML+CSS component in the preview.

## How It Works

### 1. Upload an Image
You can upload an image in two ways:
- **File Upload**: Click "Add Image" button and select a file from your computer
- **URL Upload**: Paste an image URL and click "Add Image"

### 2. Automatic Demo Display
After uploading:
1. Your uploaded image appears in the **left panel** (Input Design)
2. After 1.5 seconds (simulated generation time), a demo component appears in the **right panel**
3. You can switch between three views:
   - **Preview**: Live iframe rendering of the component
   - **HTML**: View the HTML code
   - **CSS**: View the CSS styles

## Demo Component

The demo component is a beautiful hero section with:
- Gradient purple background
- Responsive layout
- Call-to-action buttons
- Glass morphism effects
- Mobile-friendly design

### Demo HTML
```html
<div class="hero-section">
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
</div>
```

### Demo CSS
- Modern gradient background (purple theme)
- Responsive grid layout
- Hover effects on buttons
- Glass morphism styling
- Mobile breakpoints

## Testing the Demo

### Quick Test Steps
1. Open the app in your browser (http://localhost:3000)
2. Scroll to the Hero section
3. Click "Add Image" or paste an image URL
4. Watch the magic happen! ✨

### Test with Different Images
Try uploading:
- Screenshots of websites
- UI mockups
- Design files
- Any image URL from the web

## Switching to Backend Mode

When your backend is ready, you can easily switch from demo mode to real backend integration:

### Step 1: Update Hero Component
In `components/sections/Hero.tsx`, replace the demo logic with:

```typescript
const handleAddImage = () => {
  if (urlInput.trim()) {
    dispatch(uploadRequest(urlInput.trim()))
    setUrlInput('')
  } else {
    fileInputRef.current?.click()
  }
}

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    dispatch(uploadRequest(file))
  }
}
```

### Step 2: Enable Auto-trigger in OutputPreview
In `components/sections/OutputPreview.tsx`, uncomment the useEffect:

```typescript
useEffect(() => {
  if (uploadState.data?.fileId && !generateState.loading && !generateState.data) {
    dispatch(generateRequest({ fileId: uploadState.data.fileId }))
  }
}, [uploadState.data, generateState.loading, generateState.data, dispatch])
```

### Step 3: Configure API Endpoint
Update `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url
```

## Features in Demo Mode

✅ **Working Features:**
- Image upload (file or URL)
- Image preview display
- Component preview in iframe
- HTML/CSS code display
- Tab switching (Preview/HTML/CSS)
- Loading states
- Responsive design

❌ **Not Working (requires backend):**
- Real AI code generation
- ZIP file download
- Custom component generation based on uploaded image

## Customizing the Demo Component

Want to change the demo component? Edit these constants in `components/sections/Hero.tsx`:

```typescript
const DEMO_HTML = `...your HTML here...`
const DEMO_CSS = `...your CSS here...`
```

You can create multiple demo templates and randomly select one!

## User Experience Flow

```
┌─────────────────────────────────────────┐
│  1. User uploads image                  │
│     (file picker or URL)                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. Image appears in left panel         │
│     "Input Design" section              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  3. Loading state (1.5 seconds)         │
│     "Generating your component..."      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  4. Demo component appears              │
│     - Preview tab (default)             │
│     - HTML tab                          │
│     - CSS tab                           │
└─────────────────────────────────────────┘
```

## Tips for Demo Presentations

1. **Use High-Quality Images**: Upload clear UI screenshots for better visual impact
2. **Show All Tabs**: Demonstrate Preview → HTML → CSS to show the full workflow
3. **Explain the Vision**: Tell viewers this is a demo, and the real version will generate custom code based on their specific image
4. **Highlight Speed**: Point out how fast the "generation" happens (instant in demo mode)

## Troubleshooting

### Image Not Displaying
- Check if the image URL is accessible
- Try uploading a local file instead
- Verify the image format is supported (jpg, png, webp, etc.)

### Preview Not Rendering
- Check browser console for errors
- Try refreshing the page
- Ensure JavaScript is enabled

### Styling Issues
- Clear browser cache
- Check if CSS is loading properly
- Verify no conflicting styles

## Next Steps

Once your backend is ready:
1. Implement the upload API endpoint
2. Implement the generate-code API endpoint
3. Test with real ZIP file responses
4. Switch from demo mode to production mode
5. Deploy! 🚀

---

**Demo Mode Version:** 1.0.0  
**Last Updated:** 2026-05-03  
**Status:** ✅ Fully Functional