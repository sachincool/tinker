"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
      toast.success("Subscribed!", {
        description: data.message,
      });

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";
      setMessage(errorMessage);
      toast.error("Subscription failed", {
        description: errorMessage,
      });
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
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
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
