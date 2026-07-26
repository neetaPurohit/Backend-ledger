const express = require("express");
const cookieParser = require("cookie-parser")
const authRouter = require("./routes/auth.routes");
const app = express();

//middlewares
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)


module.exports = app



// this file has two main work.
// 1. create server 2. config server(use of middlewares,apis)