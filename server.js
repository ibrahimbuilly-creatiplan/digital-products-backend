// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Allow both local and deployed frontend URLs
app.use(
  cors({
    origin: [
      "http://localhost:3000", // React default
      "http://localhost:5173", // Vite or alternate local
      "https://creatiplanstudios-r2hbnt010-abdulkhadir-ibrahims-projects.vercel.app/", // ✅ your current live frontend
    ],
  })
);

app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ CreatiPlanStudios backend is live!");
});

// ✅ Create Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { line_items } = req.body;

    if (!line_items || line_items.length === 0) {
      return res.status(400).json({ error: "No line items provided" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: process.env.SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
});

// ✅ Critical fix: Listen on Render’s provided port & 0.0.0.0 (not localhost)
const port = process.env.PORT || 4242;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Backend running and listening on port ${port}`);
});
