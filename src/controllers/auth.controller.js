const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service")

// user register controller
// POST /api/auth/register

async function userRegisterController(req, res) {
  const { email, password, name } = req.body;

  //1. check if user already exists?
  const isExists = await userModel.findOne({
    email: email,
  });

  if (isExists) {
    return res.status(422).json({
      message: "User already exists with email.",
      status: "Failed",
    });
  }

  //2. otherwise create user
  const user = await userModel.create({
    email,
    password,
    name,
  });

  //3. create token
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  // 4. save token into cookie
  res.cookie("token", token);

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

// user login controller
// POST /api/auth/login

async function userLoginController(req,res) {
    // 1. we'll get two things in req.body
    const {email,password} = req.body;

    // 2.find user on basis of email
    // const user = await userModel.findOne({email})
    const user = await userModel.findOne({email}).select("+password")//to access password which we set to false in user.model 

    // 3. if user not found
    if(!user){
        return res.status(401).json({
            message:"Email or password is Invalid!"
        })
    }

    // 4. if user found then compare password
    const isValidPassword = await user.comparePassword(password);

    // 5. if password is incorrect
    if(!isValidPassword){
           return res.status(401).json({
             message: "Email or password is Invalid!",
           });
    }

    // 6. otherwise generate token
     const token = jwt.sign(
       {
         userId: user._id,
       },
       process.env.JWT_SECRET,
       { expiresIn: "3d" },
     );

     // 7. save token into cookie
     res.cookie("token", token);

     res.status(200).json({
       user: {
         _id: user._id,
         email: user.email,
         name: user.name,
       },
       token,
     });

     //7. after sending res. send registrationEmail
     await emailService.sendRegistrationEmail(user.email,user.name);

}
module.exports = { userRegisterController,userLoginController };
