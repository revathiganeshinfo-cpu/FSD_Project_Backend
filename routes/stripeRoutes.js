import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/checkout", async (req, res) => {
  try {
    const { restaurantName, price } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: restaurantName,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
   success_url: `https://fsd-project-frontend.vercel.app/success?reservationId=${reservationId}`,
      cancel_url: "https://fsd-project-frontend.vercel.app/",
       });

    res.json({ url: session.url });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;