interface TurnstileInstance {
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      size?: "normal" | "compact" | "invisible";
      theme?: "light" | "dark" | "auto";
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
}

interface Window {
  turnstile?: TurnstileInstance;
}
