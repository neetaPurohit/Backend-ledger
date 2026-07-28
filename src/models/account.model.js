const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model")

const accountSchema = new mongoose.Schema(
  {
    // fields
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", //same name what you gave in user.model.js(userModel)
      required: [true, "Account must be associated with a user."],
      index: true, //for fast searching
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE, FROZEN or CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required for creating an account."],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

// compound index (created on 2 feilds called compound index)
accountSchema.index({ user: 1, status: 1 });


// get user's balance
accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    {$match:{account:this_.id}},
    {
      $group:{
        _id:null,
        totalDebit:{
          $sum:{  
            $cond:[
              {$eq:["$type","DEBIT"]},
              "$amount",
              0
            ]
          }
        },
        totalCredit:{
          $sum:{  
            $cond:[
              {$eq:["$type","CREDIT"]},
              "$amount",
              0
            ]
          }
        }
      }
    },
    {
      $project:{
        _id:0,
        balance:{$subtract:["$totalCredit","$totalDebit"]}
      }
    }
  ]) 
//  if no balance is found
   if(balanceData.length===0){
     return 0
   }

  //  if balance is found then return balance
    return balanceData[0].balance

}

// account is collection's name
const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
