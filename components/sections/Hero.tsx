'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { uploadRequest, uploadSuccess } from '@/lib/features/upload/uploadSlice'
import { generateSuccess } from '@/lib/features/generate/generateSlice'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state: RootState) => state.upload)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleAddImage = () => {
    if (urlInput.trim()) {
      // Demo mode: simulate upload with URL
      const fileUrl = urlInput.trim()
      dispatch(uploadSuccess({
        fileId: 'demo-' + Date.now(),
        fileUrl: fileUrl
      }))
      
      // Immediately show demo component
      setTimeout(() => {
        dispatch(generateSuccess({
          downloadUrl: 'demo-url',
          htmlCode: DEMO_HTML,
          cssCode: DEMO_CSS
        }))
      }, 1500) // Simulate generation delay
      
      setUrlInput('')
    } else {
      // Trigger file input
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Demo mode: create local URL for uploaded file
      const fileUrl = URL.createObjectURL(file)
      
      dispatch(uploadSuccess({
        fileId: 'demo-' + Date.now(),
        fileUrl: fileUrl
      }))
      
      // Immediately show demo component
      setTimeout(() => {
        dispatch(generateSuccess({
          downloadUrl: 'demo-url',
          htmlCode: DEMO_HTML,
          cssCode: DEMO_CSS
        }))
      }, 1500) // Simulate generation delay
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
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#0a0a0a',
                    color: '#ffffff'
                  }}
                >
                  <ImagePlus size={18} />
                  {loading ? 'Uploading...' : 'Add Image'}
                </button>
              }
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </motion.div>
        </div>
      </div>

    </section>
  )
}

// Made with Bob
