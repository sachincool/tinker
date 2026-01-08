import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = "About Harshit Luthra - Infrastructure Wizard";
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
          {/* Avatar placeholder */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              marginBottom: '30px',
            }}
          >
            HL
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            Harshit Luthra
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 32,
              color: '#9ca3af',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Infrastructure Wizard & Chaos Engineer
          </div>

          {/* Skills */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['DevOps', 'Kubernetes', 'AWS', 'SRE'].map((skill) => (
              <div
                key={skill}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#1f2937',
                  color: '#a855f7',
                  borderRadius: '8px',
                  fontSize: 24,
                  border: '2px solid #374151',
                }}
              >
                {skill}
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
            tinker.expert/about
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
