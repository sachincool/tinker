import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';

export const runtime = 'nodejs';
export const alt = 'Blog Post';
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

function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 30) return 132;
  if (len <= 50) return 108;
  if (len <= 75) return 88;
  if (len <= 110) return 72;
  return 60;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug, 'blog');
  const serifData = await loadSerif();

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: PAPER,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: serifData ? 'InstrumentSerif' : 'serif',
          }}
        >
          <div style={{ fontSize: 96, color: INK }}>Post Not Found</div>
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

  const truncatedTitle =
    post.title.length > 140 ? post.title.substring(0, 137) + '...' : post.title;

  const eyebrow = post.tags && post.tags.length > 0 ? post.tags[0].toUpperCase() : 'POST';

  const dateStr = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: PAPER,
          padding: '64px 80px',
          fontFamily: 'monospace',
        }}
      >
        {/* Top rule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: '18px',
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
            {`POST · ${eyebrow}`}
          </div>
          <div style={{ fontSize: 20, color: MUTED, letterSpacing: '0.12em' }}>
            harshit.cloud
          </div>
        </div>

        {/* Title */}
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
              fontSize: titleFontSize(truncatedTitle),
              lineHeight: 1.0,
              color: INK,
              fontFamily: serifData ? 'InstrumentSerif' : 'serif',
              letterSpacing: '-0.015em',
            }}
          >
            {truncatedTitle}
          </div>
        </div>

        {/* Bottom rule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: '18px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: MUTED,
                marginBottom: '6px',
              }}
            >
              {dateStr}
            </div>
            <div style={{ fontSize: 22, color: INK, letterSpacing: '0.08em' }}>
              harshit.cloud
            </div>
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
