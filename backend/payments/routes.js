import express from "express";
import { stripeService } from "./stripe.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Create payment intent
router.post(
  "/create-intent",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("currency")
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be 3 characters"),
    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, currency, metadata } = req.body;

      const paymentIntent = await stripeService.createPaymentIntent({
        amount,
        currency,
        metadata: {
          ...metadata,
          user_id: req.user?.id,
          ip_address: req.ip,
        },
      });

      res.json(paymentIntent);
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({
        error: "Payment intent creation failed",
        message: error.message,
      });
    }
  },
);

// Confirm payment
router.post("/confirm/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripeService.confirmPayment(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({
      error: "Payment confirmation failed",
      message: error.message,
    });
  }
});

// Create customer
router.post(
  "/customer",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Valid phone number required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name, phone } = req.body;

      const customer = await stripeService.createCustomer({
        email,
        name,
        phone,
      });

      res.json({
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
      });
    } catch (error) {
      console.error("Customer creation error:", error);
      res.status(500).json({
        error: "Customer creation failed",
        message: error.message,
      });
    }
  },
);

// Create refund
router.post(
  "/refund",
  [
    body("paymentIntentId")
      .notEmpty()
      .withMessage("Payment intent ID is required"),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number"),
    body("reason")
      .optional()
      .isIn(["duplicate", "fraudulent", "requested_by_customer"])
      .withMessage("Invalid reason"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentIntentId, amount, reason } = req.body;

      const refund = await stripeService.createRefund(
        paymentIntentId,
        amount,
        reason,
      );

      res.json({
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
      });
    } catch (error) {
      console.error("Refund creation error:", error);
      res.status(500).json({
        error: "Refund creation failed",
        message: error.message,
      });
    }
  },
);

// Stripe webhook endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.get("Stripe-Signature");

      const result = await stripeService.handleWebhook(req.body, signature);

      res.json(result);
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({
        error: "Webhook handling failed",
        message: error.message,
      });
    }
  },
);

// Get payment methods
router.get("/methods", (req, res) => {
  res.json({
    methods: [
      {
        id: "card",
        name: "Tarjeta de crédito/débito",
        type: "card",
        description: "Visa, Mastercard, American Express",
        enabled: true,
      },
      {
        id: "oxxo",
        name: "OXXO",
        type: "voucher",
        description: "Pago en efectivo en tiendas OXXO",
        enabled: true,
        fee: 10,
      },
      {
        id: "spei",
        name: "Transferencia SPEI",
        type: "bank_transfer",
        description: "Transferencia bancaria",
        enabled: true,
      },
    ],
  });
});

export default router;
