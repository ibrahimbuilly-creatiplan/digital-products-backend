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
      "http://localhost:3000", // local React app
      "http://localhost:5173", // Vite or alternate local port
      "https://creatiplanstudios-5fe9ti1an-abdulkhadir-ibrahims-projects.vercel.app", // your live Vercel site
    ],
  })
);

app.use(express.json());

// ✅ Health check route (optional but helps Render verify uptime)
app.get("/", (req, res) => {
    res.send("✅ CreatiPlanStudios backend is live!");
});

// ✅ Create a checkout session
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

const port = process.env.PORT || 4242;
app.listen(port, () =>
  console.log(`✅ Backend running on http://localhost:${port}`)
);
