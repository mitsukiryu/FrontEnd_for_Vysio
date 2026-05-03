'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ComponentPreviewProps {
  htmlCode: string
  cssCode: string
  className?: string
}

export default function ComponentPreview({ htmlCode, cssCode, className = '' }: ComponentPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!htmlCode) {
      setError('No HTML code provided')
      setIsLoading(false)
      return
    }

    try {
      // Combine HTML and CSS into a complete document
      const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* User's CSS */
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
</body>
</html>
      `.trim()

      // Create a blob URL for the iframe
      const blob = new Blob([fullHTML], { type: 'text/html' })
      const blobUrl = URL.createObjectURL(blob)

      if (iframeRef.current) {
        iframeRef.current.src = blobUrl
        
        // Cleanup function to revoke the blob URL
        return () => {
          URL.revokeObjectURL(blobUrl)
        }
      }
    } catch (err) {
      setError('Failed to render component preview')
      setIsLoading(false)
      console.error('ComponentPreview error:', err)
    }
  }, [htmlCode, cssCode])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load preview')
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0a0a0a' }} />
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>
              Rendering preview...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-6">
            <p className="text-red-600 font-medium mb-2">Preview Error</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Iframe Preview */}
      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0 rounded-2xl bg-white"
        title="Component Preview"
        style={{
          minHeight: '400px',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  )
}

// Made with Bob