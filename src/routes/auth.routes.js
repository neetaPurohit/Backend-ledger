// we'll create all authentication related routes here.
const express  = require('express');
const authController = require("../controllers/auth.controller")

const router = express.Router();


//API:- api/auth/register 
router.post("/register",authController.userRegisterController)

module.exports = router;