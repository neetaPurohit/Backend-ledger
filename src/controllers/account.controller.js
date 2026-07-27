const accountModel = require("../models/account.model")

async function createAccountController(req,res) {
    // 1. find user id
    const user = req.user;

    // 2. create an account using user id
    const account = await accountModel.create({
        user:user._id,
    })

    // 3. send that account in res.
    res.status(201).json({
        account
    })
}

module.exports ={ createAccountController}   