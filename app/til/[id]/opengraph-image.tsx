import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/posts';

export const runtime = 'nodejs';
export const alt = 'TIL Post';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPostBySlug(id, 'til');

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            TIL Not Found
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  // Truncate title if too long
  const truncatedTitle = post.title.length > 80 
    ? post.title.substring(0, 77) + '...' 
    : post.title;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
          }}
        />

        {/* Header with author info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ marginRight: '12px' }}>💡</span>
            Harshit Luthra
          </div>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 20px',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            harshit.cloud
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {/* TIL Badge */}
          <div
            style={{
              display: 'flex',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: 20,
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Today I Learned
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {truncatedTitle}
          </div>
        </div>

        {/* Footer with tags and date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '40px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {post.tags.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '16px',
                  fontSize: 16,
                  backdropFilter: 'blur(10px)',
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

