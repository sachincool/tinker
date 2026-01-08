import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = "Blog - Infra Magician's Digital Garden";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: 80,
              marginBottom: '20px',
            }}
          >
            📝
          </div>

          {/* Main Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Blog
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: '#9ca3af',
              textAlign: 'center',
              marginBottom: '40px',
              maxWidth: '900px',
            }}
          >
            Deep dives into web development, infrastructure chaos, and the art of tinkering with technology
          </div>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['DevOps', 'Infrastructure', 'Cloud', 'Security'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#1f2937',
                  color: '#3b82f6',
                  borderRadius: '8px',
                  fontSize: 24,
                  border: '2px solid #374151',
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: 28,
              color: '#6b7280',
            }}
          >
            tinker.expert/blog
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
