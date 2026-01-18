import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Lecture Notes - AI-Powered Note Taking'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle gradient accent in corner */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
            marginBottom: '40px',
            boxShadow: '0 20px 60px rgba(13, 148, 136, 0.3)',
          }}
        >
          {/* Pause bars */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '22px',
                height: '54px',
                backgroundColor: 'white',
                borderRadius: '6px',
              }}
            />
            <div
              style={{
                width: '22px',
                height: '54px',
                backgroundColor: 'white',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
            letterSpacing: '-1px',
          }}
        >
          Lecture Notes
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#a8a29e',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              color: '#0d9488',
            }}
          >
            AI-Powered
          </span>
          <span>Note Taking</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
