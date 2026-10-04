export interface OAuthProvider {
  id: "google";
  label: string;
  iconSrc: string;
}

export interface CustomerLogo {
  id: string;
  name: string;
  iconSrc: string;
}

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = [
  {
    id: "google",
    label: "গুগল দিয়ে লগ ইন করুন",
    iconSrc: "/icons/google.svg",
  },
] as const;

export const CUSTOMER_LOGOS: readonly CustomerLogo[] = [
  {
    id: "stripe",
    name: "Stripe",
    iconSrc: "/icons/stripe.svg",
  },
  {
    id: "openai",
    name: "OpenAI",
    iconSrc: "/icons/openai.svg",
  },
  {
    id: "slack",
    name: "Slack",
    iconSrc: "/icons/slack.svg",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    iconSrc: "/icons/anthropic.svg",
  },
  {
    id: "supabase",
    name: "Supabase",
    iconSrc: "/icons/supabase.svg",
  },
] as const;
