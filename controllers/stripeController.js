import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { restaurantName, price, reservationId } = req.body;

    console.log("RESERVATION ID:", reservationId); 

    if (!price) {
      return res.status(400).json({ message: "Price is required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: restaurantName || "Restaurant Booking",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],

      mode: "payment",

  success_url: `http://localhost:5173/success?reservationId=${reservationId}`,
  cancel_url: "http://localhost:5173/cancel",
    });

    res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};