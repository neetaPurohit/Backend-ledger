const express = require("express");
const cookieParser = require("cookie-parser")

const app = express();

//middlewares
app.use(express.json())
app.use(cookieParser())

// Routes required 
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

// Routes use
app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transaction",transactionRoutes)


module.exports = app



// this file has two main work.
// 1. create server 2. config server(use of middlewares,apis)