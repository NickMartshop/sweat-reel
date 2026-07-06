// Razorpay Checkout is loaded via <script> tag in the root head.
// KEY_ID only — the Razorpay secret key must NEVER live in frontend code.
export {};

interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill?: { email?: string; name?: string; contact?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void; escape?: boolean };
  handler?: (response: RazorpayHandlerResponse) => void;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (payload: any) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    adsbygoogle?: unknown[];
  }
}
