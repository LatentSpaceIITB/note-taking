import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
        }}
      >
        {/* Pause bars */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '16px',
              backgroundColor: 'white',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: '6px',
              height: '16px',
              backgroundColor: 'white',
              borderRadius: '2px',
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
