'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon, Code2, Loader2, AlertCircle, Eye, Download, CheckCircle, Clock } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import ScrollReveal from '@/components/effects/ScrollReveal'
import ComponentPreview from '@/components/ui/ComponentPreview'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { motion } from 'framer-motion'

export default function OutputPreview() {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css'>('preview')
  const dispatch = useDispatch()
  const uploadState = useSelector((state: RootState) => state.upload)
  const generateState = useSelector((state: RootState) => state.generate)

  // Get the actual code from Redux state or use placeholder
  const htmlCode = generateState.htmlCode || `<div class="hero-section">
  <div class="container">
    <h1 class="title">
      Welcome to Our Platform
    </h1>
    <p class="subtitle">
      Build amazing experiences
    </p>
    <button class="cta-button">
      Get Started
    </button>
  </div>
</div>`

  const cssCode = generateState.cssCode || `.hero-section {
  display: flex;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #dbeafe,
    #ffffff
  );
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #0f172a;
  margin-bottom: 1rem;
}

.cta-button {
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 9999px;
  transition: all 0.3s;
}

.cta-button:hover {
  transform: scale(1.05);
}`

  const hasUploadedImage = !!uploadState.data?.fileUrl
  const isGenerating = generateState.loading
  const hasGeneratedCode = !!generateState.htmlCode
  const generationError = generateState.error

  // Get status display info
  const getStatusInfo = () => {
    const status = generateState.status
    const mode = generateState.mode

    if (status === 'idle') return null

    const statusConfig = {
      queued: { label: 'Queued', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      picked: { label: 'Starting', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Loader2 },
      coding: { label: 'Generating Code', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Code2 },
      packaging: { label: 'Finalizing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Download },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    }

    return statusConfig[status] || null
  }

  const statusInfo = getStatusInfo()

  return (
    <section className="section-padding">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2
                className="text-5xl md:text-6xl"
                style={{
                  fontFamily: 'var(--font-instrument)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: '#0a0a0a'
                }}
              >
                Preview & <span style={{ fontStyle: 'italic' }}>Export</span>
              </h2>
              
              {/* Mode Badge */}
              {generateState.mode && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  generateState.mode === 'demo'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {generateState.mode === 'demo' ? '🎨 Demo' : '🚀 API'} Mode
                </span>
              )}
            </div>

            {/* Status Indicator */}
            {statusInfo && generateState.status !== 'idle' && generateState.status !== 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 inline-flex items-center gap-3 px-4 py-3 rounded-lg border ${statusInfo.color}`}
              >
                <statusInfo.icon
                  size={20}
                  className={statusInfo.icon === Loader2 ? 'animate-spin' : ''}
                />
                <div className="text-left">
                  <div className="font-medium text-sm">{statusInfo.label}</div>
                  {generateState.mode === 'api' && (
                    <div className="text-xs opacity-75 mt-1">
                      {generateState.progress > 0 && `${generateState.progress}% • `}
                      Iteration {generateState.currentIteration} of {generateState.maxIterations}
                      {generateState.latestScore && ` • Score: ${(generateState.latestScore * 100).toFixed(0)}%`}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Completion Status */}
            {generateState.status === 'completed' && hasGeneratedCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Generation Complete
                  {generateState.latestScore && ` • Quality: ${(generateState.latestScore * 100).toFixed(0)}%`}
                </span>
              </motion.div>
            )}

            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: '#334155', fontWeight: 400 }}
            >
              See your generated code in real-time with instant preview
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Image Input */}
          <ScrollReveal delay={0.1}>
            <GlassCard className="h-full">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                >
                  <ImageIcon size={20} style={{ color: '#0a0a0a' }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-instrument)',
                      fontWeight: 400,
                      color: '#0a0a0a',
                      fontSize: '1.125rem'
                    }}
                  >
                    Input Design
                  </h3>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    {hasUploadedImage ? 'Your uploaded image' : 'Upload an image to get started'}
                  </p>
                </div>
              </div>
              
              <div
                className="aspect-video rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: hasUploadedImage
                    ? 'transparent'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {hasUploadedImage ? (
                  <img
                    src={uploadState.data!.fileUrl}
                    alt="Uploaded design"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <div
                      className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      <ImageIcon size={40} style={{ color: '#0a0a0a' }} />
                    </div>
                    <p
                      className="font-medium mb-2"
                      style={{ color: '#0a0a0a' }}
                    >
                      Design Preview
                    </p>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      Your UI screenshot appears here
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Right: Code Output & Preview */}
          <ScrollReveal delay={0.2}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    {isGenerating ? (
                      <Loader2 size={20} className="animate-spin" style={{ color: '#0a0a0a' }} />
                    ) : (
                      <Code2 size={20} style={{ color: '#0a0a0a' }} />
                    )}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-instrument)',
                        fontWeight: 400,
                        color: '#0a0a0a',
                        fontSize: '1.125rem'
                      }}
                    >
                      {isGenerating ? 'Generating...' : 'Generated Code'}
                    </h3>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      {isGenerating ? 'AI is working on your design' : 'Production-ready output'}
                    </p>
                  </div>
                </div>

                {/* Toggle Buttons */}
                {hasGeneratedCode && !isGenerating && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: activeTab === 'preview' ? '#0a0a0a' : 'rgba(0, 0, 0, 0.05)',
                        color: activeTab === 'preview' ? '#ffffff' : '#475569'
                      }}
                    >
                      <Eye size={16} className="inline mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => setActiveTab('html')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
                      style={{
                        backgroundColor: activeTab === 'html' ? '#0a0a0a' : 'rgba(0, 0, 0, 0.05)',
                        color: activeTab === 'html' ? '#ffffff' : '#475569'
                      }}
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => setActiveTab('css')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
                      style={{
                        backgroundColor: activeTab === 'css' ? '#0a0a0a' : 'rgba(0, 0, 0, 0.05)',
                        color: activeTab === 'css' ? '#ffffff' : '#475569'
                      }}
                    >
                      CSS
                    </button>
                  </div>
                )}
              </div>

              {/* Content Display */}
              <div className="rounded-2xl overflow-hidden" style={{ minHeight: '400px' }}>
                {/* Loading State */}
                {isGenerating && (
                  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0a0a0a' }} />
                      <p className="font-medium mb-2" style={{ color: '#0a0a0a' }}>
                        Generating your component...
                      </p>
                      <p className="text-sm" style={{ color: '#64748b' }}>
                        This may take a few moments
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {generationError && !isGenerating && (
                  <div className="flex items-center justify-center h-96 bg-red-50">
                    <div className="text-center p-6">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <p className="font-medium mb-2 text-red-600">Generation Failed</p>
                      <p className="text-sm text-red-500 mb-4">{generationError}</p>
                      <p className="text-xs text-gray-600">
                        Please try uploading a new image or switch to Demo Mode
                      </p>
                    </div>
                  </div>
                )}

                {/* Success State - Show Preview or Code */}
                {hasGeneratedCode && !isGenerating && !generationError && (
                  <>
                    {activeTab === 'preview' ? (
                      <ComponentPreview
                        htmlCode={htmlCode}
                        cssCode={cssCode}
                        className="h-96"
                      />
                    ) : (
                      <div
                        className="p-6 overflow-auto max-h-96"
                        style={{ backgroundColor: '#0a0a0a' }}
                      >
                        <pre className="text-sm font-mono leading-relaxed" style={{ color: '#e2e8f0' }}>
                          <code>{activeTab === 'html' ? htmlCode : cssCode}</code>
                        </pre>
                      </div>
                    )}
                  </>
                )}

                {/* Initial State - No upload yet */}
                {!hasUploadedImage && !isGenerating && !generationError && (
                  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center p-8">
                      <Code2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#94a3b8' }} />
                      <p className="font-medium mb-2" style={{ color: '#64748b' }}>
                        Upload an image to see the magic
                      </p>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>
                        Your generated component will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

// Made with Bob
