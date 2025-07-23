import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export class StripePaymentService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is required");
    }
  }

  async createPaymentIntent({ amount, currency = "mxn", metadata = {} }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  async createCustomer({ email, name, phone }) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          source: "la-economica-pos",
        },
      });

      return customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  async createRefund(
    paymentIntentId,
    amount = null,
    reason = "requested_by_customer",
  ) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount, // If null, refunds the full amount
        reason,
        metadata: {
          refunded_at: new Date().toISOString(),
        },
      });

      return refund;
    } catch (error) {
      console.error("Error creating refund:", error);
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }

  async handleWebhook(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      console.log("Stripe webhook event:", event.type);

      switch (event.type) {
        case "payment_intent.succeeded":
          return await this.handlePaymentSuccess(event.data.object);
        case "payment_intent.payment_failed":
          return await this.handlePaymentFailure(event.data.object);
        case "customer.created":
          return await this.handleCustomerCreated(event.data.object);
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error("Webhook error:", error);
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    console.log("Payment succeeded:", paymentIntent.id);
    // Here you would update your database, send confirmation emails, etc.
    return { status: "success", paymentIntent };
  }

  async handlePaymentFailure(paymentIntent) {
    console.log("Payment failed:", paymentIntent.id);
    // Here you would handle failed payments, notify users, etc.
    return { status: "failed", paymentIntent };
  }

  async handleCustomerCreated(customer) {
    console.log("Customer created:", customer.id);
    // Here you would save customer info to your database
    return { status: "created", customer };
  }

  // Utility method to format amount for display
  formatAmount(amount, currency = "mxn") {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}

export const stripeService = new StripePaymentService();
export default stripeService;
