import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Create schema and model locally in script
const paymentSchema = new mongoose.Schema({
  userId: String,
  orderId: String,
  paymentId: String,
  amount: Number,
  credits: Number,
  plan: String,
  currency: String,
  status: String
}, {
  timestamps: true
});

const Payment = mongoose.model("Payment", paymentSchema);

async function checkPayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const payments = await Payment.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`--- Total Payments: ${payments.length} (showing last 10) ---`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. ID: ${payment._id}`);
      console.log(`   UserId: ${payment.userId}`);
      console.log(`   OrderId: ${payment.orderId}`);
      console.log(`   PaymentId: ${payment.paymentId}`);
      console.log(`   Amount: ${payment.amount}`);
      console.log(`   Credits: ${payment.credits}`);
      console.log(`   Plan: ${payment.plan}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   CreatedAt: ${payment.createdAt}`);
      console.log("-----------------------------------------");
    });
    mongoose.disconnect();
  } catch (error) {
    console.error("Error checking payments:", error);
  }
}

checkPayments();
