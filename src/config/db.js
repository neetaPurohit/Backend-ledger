const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    //   console.log(process.env.MONGODB_URI);
    console.log("DB connected successfully.");
  } catch (error) {
    console.log("Error connecting to db: ", error);
    process.exit(1); //close the server
  }
}

module.exports = connectDB;
