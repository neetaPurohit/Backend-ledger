const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", //same name what you gave in user.model.js(userModel)
    required:[true,"Account must be associated with a user."],
    index:true, //for fast searching
  },
  status:{
   enum:{
    values:["ACTIVE","FROZEN","CLOSED"],
    message:"Status can be either ACTIVE, FROZEN or CLOSED"
  },
  currency:{
    type:String,
    required:[true,"Currency is required for creating an account."],
    default:"INR"
    }
  }
},{
    timestamps:true
});

// compound index (created on 2 feilds called compound index)
accountSchema.index({user:1,status:1})

// account is collection's name
const accountModel = mongoose.model("account",accountSchema)

module.exports = accountModel;