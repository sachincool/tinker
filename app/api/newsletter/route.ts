import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, turnstileToken, website } = body;

    // Honeypot: bots fill hidden fields, humans don't
    if (website) {
      return NextResponse.json(
        { message: 'Successfully subscribed! Check your email to confirm.' },
        { status: 200 }
      );
    }

    // Turnstile verification
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Bot verification required. Please try again.' },
        { status: 400 }
      );
    }

    const turnstileResult = await verifyTurnstileToken(turnstileToken);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error || 'Bot verification failed.' },
        { status: 403 }
      );
    }

    // Email validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      console.error('BUTTONDOWN_API_KEY not configured');
      return NextResponse.json(
        { error: 'Newsletter service not configured.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: ['website'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 400 && errorData.email) {
        return NextResponse.json(
          { error: "You're already subscribed! Check your inbox." },
          { status: 400 }
        );
      }

      console.error('Buttondown API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully subscribed! Check your email to confirm.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
