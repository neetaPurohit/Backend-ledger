const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

// check token cookies or headers and if token not found return with message
async function authMiddleware(req,resj,next) {
    // 1. get token from user
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1] 

    // 2. if token is missing
    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing."
        })
    }

    // 3. verify token
     try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        req.user = user;
        return next()    
     } catch (error) {
        return res.status(401).json({
            message:"Unauthorized access, token is Invalid"
        })
     }    
}

module.exports = {authMiddleware}