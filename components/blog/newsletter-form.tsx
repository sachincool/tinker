"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface NewsletterFormProps {
  variant?: "default" | "compact" | "card";
  title?: string;
  description?: string;
  className?: string;
}

export function NewsletterForm({
  variant = "default",
  title = "Subscribe to my newsletter",
  description = "Get notified about new posts, TILs, and infrastructure chaos. No spam, unsubscribe anytime.",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const uniqueId = useId();

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !turnstileRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
      "error-callback": () => setTurnstileToken(null),
      "expired-callback": () => setTurnstileToken(null),
      size: "invisible",
      theme: "auto",
    });
  }, []);

  useEffect(() => {
    // If Turnstile is already loaded (another instance loaded the script), render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if the script tag already exists (another instance is loading it)
    if (document.querySelector('script[src*="turnstile"]')) {
      const check = setInterval(() => {
        if (window.turnstile) {
          clearInterval(check);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(check);
    }

    // First instance: load the script
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      // Small delay to ensure turnstile is ready
      setTimeout(renderWidget, 100);
    };
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  const honeypotRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    if (!turnstileToken) {
      setStatus("error");
      setMessage("Bot protection not ready. Please wait a moment and try again.");
      toast.error("Not ready", { description: "Bot protection is still loading. Please try again." });
      return;
    }

    setStatus("loading");
    setMessage("");

    const website = honeypotRef.current?.value || undefined;

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken, website }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
      toast.success("Subscribed!", { description: data.message });

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";
      setMessage(errorMessage);
      toast.error("Subscription failed", { description: errorMessage });

      // Reset Turnstile so user can retry
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setTurnstileToken(null);
      }
    }
  };

  const protectionFields = (
    <>
      {/* Honeypot field - invisible to humans */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", tabIndex: -1 } as React.CSSProperties}>
        <label htmlFor={`website-${uniqueId}`}>Website</label>
        <input ref={honeypotRef} type="text" id={`website-${uniqueId}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {/* Turnstile invisible widget */}
      <div ref={turnstileRef} />
    </>
  );

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
        {protectionFields}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="h-9 text-sm"
            required
          />
          <Button
            type="submit"
            size="sm"
            disabled={status === "loading" || status === "success"}
            className="shrink-0"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </div>
        {message && (
          <p className={`text-xs ${status === "error" ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
      </form>
    );
  }

  if (variant === "card") {
    return (
      <div className={`relative overflow-hidden rounded-lg border bg-card p-6 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative flex flex-col md:flex-row gap-6 items-center">
          <div className="shrink-0">
            <Image
              src="/images/newsletter-wizard.png"
              alt="Newsletter Wizard"
              width={140}
              height={140}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              {protectionFields}
              <Input
                type="email"
                placeholder="wizard@infrastructure.magic"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="group"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 py-8 border-t border-b ${className}`}>
      <div className="space-y-2">
        <h3 className="font-semibold text-xl flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
        {protectionFields}
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          className="flex-1"
          required
        />
        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Done!
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-500" : "text-green-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
