const mongoose = require("mongoose");
require("dotenv").config();
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongodb comnnected successfully");
  }
  catch (err) {
    console.log("mongodb connection error", err.message);
    process.exit(1);
  }
}
module.exports = connectDb;