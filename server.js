require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db")

connectDB();
const port = process.env.PORT || 3000;
//  console.log(process.env.MONGODB_URI);
app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
