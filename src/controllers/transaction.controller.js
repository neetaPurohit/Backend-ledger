const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service")
const accountModel = require("../models/account.model")
const mongoose = require("mongoose")


/**
 * - Create a new transaction
 *
 * THE 10-STEP TRANSFER FLOW:
 *
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
//  * 5. Create transaction (PENDING) //these four are special case either complete four or none(and to do this we use mongodb's startTransaction())
//  * 6. Create DEBIT ledger entry
//  * 7. Create CREDIT ledger entry
//  * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req,res) {
  // * got data from req.body
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  // * 1. validate req.
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey is required",
    });
  }

  // do fromAccount and toAccount exists?
  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  // *2. validate idempotencyKey(to prevent same payment two or more times)
  const isTransactionAlreadyExists = await transactionModel.findOne({
    // check is idempotencykey is same?
    idempotencyKey: idempotencyKey,
  });
  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed.",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(202).json({
        message: "Transaction is still in processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry!",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  //  * 3. Check account status
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction.",
    });
  }

  // 4. Derive sender balance from ledger(from account.model.js line no. 37)
  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  // * 5. Create transaction (PENDING)
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  //  * 6. Create DEBIT ledger entry
  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );
  //  * 7. Create CREDIT ledger entry
  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  //  * 8. Mark transaction COMPLETED
  transaction.status = "COMPLETED";
  await transaction.save({ session });

  //  * 9. Commit MongoDB session
  await session.commitTransaction();
  session.endSession();

  //  * 10. Send email notification
//  we user auth. middleware so we have access of email and name
  await emailService.sendTransactionEmail(
    req.user.email, 
    req.user.name,
    amount,
    toAccount
  )

  return res.status(201).json({
    message:"Transaction completed successfully.",
    transaction:transaction
  })
}


module.exports = {createTransaction}

