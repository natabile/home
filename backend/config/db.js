const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const db = process.env.URL_DB
    await mongoose.connect(db)
    console.log("Database connected");
  }
  catch (err) {
    console.log(err, "Database not connected");
  }
}
module.exports = connectDB