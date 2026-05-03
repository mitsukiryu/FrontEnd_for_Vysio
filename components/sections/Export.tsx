'use client'

import { Download, FileCode, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import ScrollReveal from '@/components/effects/ScrollReveal'
import { useDispatch, useSelector } from 'react-redux'
import { downloadRequest } from '@/lib/features/download/downloadSlice'
import { RootState } from '@/lib/store'

export default function Export() {
  const dispatch = useDispatch()
  const generateState = useSelector((state: RootState) => state.generate)
  const downloadState = useSelector((state: RootState) => state.download)

  const handleExport = () => {
    if (generateState.downloadUrl) {
      dispatch(downloadRequest({ downloadUrl: generateState.downloadUrl }))
    }
  }
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <GlassCard className="text-center">
              <div className="flex justify-center mb-8">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ backgroundColor: '#0a0a0a' }}
                >
                  <Download size={40} style={{ color: '#ffffff' }} />
                </div>
              </div>

              <h2
                className="text-5xl md:text-6xl mb-6"
                style={{
                  fontFamily: 'var(--font-instrument)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: '#0a0a0a'
                }}
              >
                Download Your <span style={{ fontStyle: 'italic' }}>UI Code</span>
              </h2>

              <p
                className="text-lg mb-10 max-w-2xl mx-auto"
                style={{ color: '#475569', lineHeight: '1.7' }}
              >
                Export clean, production-ready code as a ZIP file. Includes HTML, CSS, and all assets.
                Ready to integrate into your project immediately.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <FileCode size={24} style={{ color: '#0a0a0a' }} />
                  </div>
                  <h4
                    className="mb-1"
                    style={{
                      fontFamily: 'var(--font-instrument)',
                      fontWeight: 400,
                      color: '#0a0a0a',
                      fontSize: '1.125rem'
                    }}
                  >
                    Clean Code
                  </h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>Semantic HTML & modern CSS</p>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <Sparkles size={24} style={{ color: '#0a0a0a' }} />
                  </div>
                  <h4
                    className="mb-1"
                    style={{
                      fontFamily: 'var(--font-instrument)',
                      fontWeight: 400,
                      color: '#0a0a0a',
                      fontSize: '1.125rem'
                    }}
                  >
                    Optimized
                  </h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>Performance-focused output</p>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  >
                    <Download size={24} style={{ color: '#0a0a0a' }} />
                  </div>
                  <h4
                    className="mb-1"
                    style={{
                      fontFamily: 'var(--font-instrument)',
                      fontWeight: 400,
                      color: '#0a0a0a',
                      fontSize: '1.125rem'
                    }}
                  >
                    Instant Export
                  </h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>Download as ZIP file</p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleExport}
                disabled={!generateState.downloadUrl || downloadState.loading}
                className="text-lg px-10 py-4 rounded-full inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#0a0a0a',
                  color: '#ffffff',
                  fontWeight: 500
                }}
              >
                <Download size={20} />
                {downloadState.loading ? 'Downloading...' : 'Export as ZIP'}
              </button>
              {downloadState.error && (
                <p className="text-red-500 text-sm mt-4">{downloadState.error}</p>
              )}
              {!generateState.downloadUrl && (
                <p className="text-amber-600 text-sm mt-4">Please upload an image first to generate code</p>
              )}

              <p className="text-sm mt-6" style={{ color: '#64748b' }}>
                No credit card required • Free for early adopters
              </p>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

// Made with Bob
