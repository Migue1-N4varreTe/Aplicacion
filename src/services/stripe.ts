import { loadStripe, Stripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  console.warn("⚠️ Stripe publishable key not configured");
}

export const getStripe = () => {
  if (!stripePromise) {
    throw new Error(
      "Stripe not initialized. Please configure VITE_STRIPE_PUBLISHABLE_KEY",
    );
  }
  return stripePromise;
};

// Payment service
export class PaymentService {
  private stripe: Promise<Stripe | null>;

  constructor() {
    this.stripe = getStripe();
  }

  async createPaymentIntent(
    amount: number,
    currency: string = "mxn",
    metadata?: Record<string, string>,
  ) {
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string, paymentMethod: any) {
    const stripe = await this.stripe;
    if (!stripe) throw new Error("Stripe not loaded");

    return await stripe.confirmPayment({
      clientSecret,
      payment_method: paymentMethod,
      return_url: `${window.location.origin}/checkout/success`,
    });
  }

  async confirmCardPayment(
    clientSecret: string,
    cardElement: any,
    billingDetails?: any,
  ) {
    const stripe = await this.stripe;
    if (!stripe) throw new Error("Stripe not loaded");

    return await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });
  }

  async createPaymentMethod(type: string, element: any, billingDetails?: any) {
    const stripe = await this.stripe;
    if (!stripe) throw new Error("Stripe not loaded");

    return await stripe.createPaymentMethod({
      type: type as any,
      card: element,
      billing_details: billingDetails,
    });
  }

  createElement(type: string, options?: any) {
    return this.stripe.then((stripe) => {
      if (!stripe) throw new Error("Stripe not loaded");
      const elements = stripe.elements();
      return elements.create(type as any, options);
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
