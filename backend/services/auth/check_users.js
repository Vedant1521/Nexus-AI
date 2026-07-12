import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const users = await User.find({});
    console.log(`--- Total Users in Auth DB: ${users.length} ---`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Credits: ${user.credits}`);
      console.log(`   TotalCredits: ${user.totalCredits}`);
      console.log(`   FirebaseUID: ${user.firebaseUid}`);
      console.log("-----------------------------------------");
    });
    mongoose.disconnect();
  } catch (error) {
    console.error("Error checking users:", error);
  }
}

checkUsers();
