'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, ImagePlus, Key, ChevronDown } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { uploadSuccess } from '@/lib/features/upload/uploadSlice'
import { generateRequest, setGenerateMode, GenerateMode } from '@/lib/features/generate/generateSlice'
import { RootState } from '@/lib/store'

// Demo HTML and CSS for preview
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
</div>`

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
}`

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [mode, setMode] = useState<GenerateMode>('demo')
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()
  
  const uploadState = useSelector((state: RootState) => state.upload)
  const generateState = useSelector((state: RootState) => state.generate)

  // Get OpenRouter key from env as fallback
  const apiKey = openRouterKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ''

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleModeChange = (newMode: GenerateMode) => {
    setMode(newMode)
    dispatch(setGenerateMode(newMode))
    if (newMode === 'demo') {
      setShowApiKeyInput(false)
    }
  }

  const handleAddImage = () => {
    if (urlInput.trim()) {
      // For URL input, we'll treat it as demo mode for now
      const fileUrl = urlInput.trim()
      dispatch(uploadSuccess({
        fileId: 'url-' + Date.now(),
        fileUrl: fileUrl
      }))
      
      // Create a dummy file for demo mode
      const dummyFile = new File([''], 'url-image.png', { type: 'image/png' })
      
      // Trigger generation in demo mode
      dispatch(generateRequest({
        file: dummyFile,
        mode: 'demo',
      }))
      
      setUrlInput('')
    } else {
      // Trigger file input
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG, JPG, JPEG, or WEBP image')
        return
      }

      // Store file and create preview URL
      setSelectedFile(file)
      const fileUrl = URL.createObjectURL(file)
      
      dispatch(uploadSuccess({
        fileId: mode + '-' + Date.now(),
        fileUrl: fileUrl
      }))
      
      // Trigger generation with selected mode
      dispatch(generateRequest({
        file: file,
        mode: mode,
        openRouterKey: mode === 'api' ? apiKey : undefined,
        userNote: 'Generate source code matching this image.',
      }))
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Content */}
      <div className="relative z-10 container-custom pt-52 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl mb-6 leading-[1.1]"
            style={{
              fontFamily: 'var(--font-instrument)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: '#0a0a0a',
              marginTop: '-1.25rem'
            }}
          >
            Turn images into<br />
            <span style={{ fontStyle: 'italic' }}>production-ready</span> UI
          </motion.h1>

          {/* Context Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl mb-10 max-w-3xl mx-auto"
            style={{
              color: '#334155',
              fontWeight: 400,
              lineHeight: '1.6',
              marginTop: '-1.25rem'
            }}
          >
            From pixels to code — instantly using multi-agent intelligence
          </motion.p>

          {/* Mode Toggle and API Key Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="max-w-3xl mx-auto mb-4 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-gray-200">
              <button
                onClick={() => handleModeChange('demo')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'demo'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Demo Mode
              </button>
              <button
                onClick={() => handleModeChange('api')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === 'api'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                API Mode
              </button>
            </div>

            {/* API Key Toggle (only in API mode) */}
            {mode === 'api' && (
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 transition-all"
              >
                <Key size={16} />
                <span>{showApiKeyInput ? 'Hide' : 'Add'} API Key</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showApiKeyInput ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </motion.div>

          {/* API Key Input (collapsible) */}
          {mode === 'api' && showApiKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-3xl mx-auto mb-4"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenRouter API Key (Optional)
                </label>
                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20 text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {apiKey
                    ? '✓ Using provided or environment API key'
                    : '⚠️ No API key provided. Get one from openrouter.ai/keys'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Input Field */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto"
            style={{ marginTop: '1.25rem' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Input
              placeholder={isMobile ? '' : 'Upload an image or paste a link...'}
              customPlaceholder={
                isMobile ? (
                  <div className="animate-marquee whitespace-nowrap">
                    Upload an image or paste a link...
                  </div>
                ) : undefined
              }
              icon={<Upload size={20} />}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              button={
                <button
                  onClick={handleAddImage}
                  disabled={generateState.loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#0a0a0a',
                    color: '#ffffff'
                  }}
                >
                  <ImagePlus size={18} />
                  {generateState.loading ? 'Processing...' : 'Add Image'}
                </button>
              }
            />
            
            {/* Error Message */}
            {generateState.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm text-center">
                  {generateState.error}
                </p>
                {mode === 'api' && (
                  <button
                    onClick={() => handleModeChange('demo')}
                    className="mt-2 text-xs text-red-700 hover:text-red-900 underline mx-auto block"
                  >
                    Switch to Demo Mode
                  </button>
                )}
              </motion.div>
            )}

            {/* Status Indicator */}
            {generateState.loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-700">
                    {mode === 'demo' ? 'Generating demo...' : `${generateState.status}...`}
                  </span>
                  {mode === 'api' && generateState.progress > 0 && (
                    <span className="text-xs text-blue-600">
                      {generateState.progress}%
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

    </section>
  )
}

// Made with Bob
