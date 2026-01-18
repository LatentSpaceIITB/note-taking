import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
          background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
        }}
      >
        {/* Pause bars */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '8px',
            }}
          />
          <div
            style={{
              width: '32px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '8px',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
