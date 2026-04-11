🚀 Features
User authentication (if included)
Restaurant management
Reservation system
Stripe payment integration 💳
Payment status update (pending → paid)
RESTful APIs
MongoDB database

🛠️ Tech Stack
Node.js
Express.js
MongoDB + Mongoose
Stripe API
dotenv
cors

💳 Stripe Payment Flow
Frontend sends reservation details
Backend creates Stripe checkout session
User pays via Stripe
Stripe redirects to success URL
Backend updates reservation status

📌 API Endpoints
Stripe
Create Checkout Session
POST /api/stripe/checkout
Reservation
Update Payment Status
PUT /api/reservations/pay/:id

✅ Payment Update Logic
pending → paid after successful payment
paidAmount updated
status updated automatically

🌐 Deployment
Backend: Render 
Frontend: Vercel

🧪 Testing
Use Postman:
Create checkout session
Update payment status
Check reservation data
📸 Example Flow
Select Restaurant → Reserve → Pay via Stripe → Success Page → Status = Paid

