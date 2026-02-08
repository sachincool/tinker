const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstileToken(token: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return { success: false, error: "Bot protection not configured." };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    if (!response.ok) {
      console.error("Turnstile API returned", response.status);
      return { success: false, error: "Bot verification failed." };
    }

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: "Bot verification failed." };
    }

    return { success: true };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return { success: false, error: "Bot verification failed." };
  }
}
