import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Browse by tag · harshit.cloud';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const PAPER = '#f7f1e6';
const INK = '#1a1a1a';
const RUST = '#b94d2f';
const MUTED = '#6e6259';
const BORDER = 'rgba(26,26,26,0.12)';

async function loadSerif(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(truetype|woff2)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const serifData = await loadSerif();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: PAPER,
          padding: '72px 88px',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: RUST,
            }}
          >
            Index · Subjects
          </div>
          <div style={{ fontSize: 20, color: MUTED, letterSpacing: '0.12em' }}>
            harshit.cloud
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: MUTED,
              marginBottom: '24px',
            }}
          >
            TAGS
          </div>
          <div
            style={{
              fontSize: 132,
              lineHeight: 0.95,
              color: INK,
              fontFamily: serifData ? 'InstrumentSerif' : 'serif',
              letterSpacing: '-0.015em',
            }}
          >
            Browse by tag
          </div>
          <div
            style={{
              fontSize: 30,
              color: MUTED,
              marginTop: '32px',
              maxWidth: '900px',
              lineHeight: 1.35,
              fontFamily: serifData ? 'InstrumentSerif' : 'serif',
              fontStyle: 'italic',
            }}
          >
            Every post and TIL, sorted by subject: infrastructure, security, debugging, the works.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: '20px',
          }}
        >
          <div style={{ fontSize: 22, color: INK, letterSpacing: '0.08em' }}>
            harshit.cloud/tags
          </div>
          <div style={{ fontSize: 22, color: MUTED, letterSpacing: '0.16em' }}>
            BY HARSHIT LUTHRA
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serifData
        ? [{ name: 'InstrumentSerif', data: serifData, style: 'normal', weight: 400 }]
        : undefined,
    }
  );
}
