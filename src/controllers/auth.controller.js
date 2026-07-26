const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

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

module.exports = { userRegisterController };
