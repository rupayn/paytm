import { NextFunction, Request, Response } from "express";
import Account from "../../Models/account.models";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export async function setupAndCheckAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { user } = req;
    const { pin } = req.body;

    if (!pin) throw new Error("You must provide a pin");
    if (!process.env.SLT) throw new Error("Internal server error");

    let account = await Account.findOne({ user: user.user._id }).select("+pin");
    if (!account) {
      const hP = await bcrypt.hash(pin.toString(), parseInt(process.env.SLT));
      account = await Account.create({ user: user.user._id, pin: hP });
    }

    let checkPin = await bcrypt.compare(pin.toString(), account.pin);

    if (!checkPin) throw new Error("unAuthorized request, invalid pin");
    account = await account.toObject();
    delete account["pin"];
    res.json({ account });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Internal error occurred";
    res.json({ error: msg });
  }
}

export async function updatePin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req;
  const { nPin } = req.body;
  try {
    const account = await Account.findOne({}).select("+pin");
    if (!account) throw new Error("Account not found");
    if (!process.env.SLT) throw new Error("internal error");
    const hP = await bcrypt.hash(nPin.toString(), parseInt(process.env.SLT));
    const checkPassword = await bcrypt.compare(hP, account.pin);
    if (checkPassword)
      throw new Error("Your new password is Same as your old password");
    account.pin = hP;
    await account.save();
    res.json({ status: "password updated successfully" });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Internal error occurred";
    res.json({ error: msg });
  }
}

export async function transaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session= await mongoose.startSession()
  await session.startTransaction();
  try {
    let { BId, amountb } = req.body;
    amountb = parseInt(amountb);

    if (!BId || !amountb || typeof amountb !== "number" || amountb <= 0) {
      throw new Error("Invalid request parameters");
    }

    const [bUser, rUser] = await Promise.all([
      Account.findOne({ user: BId }),
      Account.findOne({ user: req.user.user._id }),
    ]);

    if (!bUser) throw new Error("Beneficiary is not available");
    if (!rUser) throw new Error("Remitter is not available");
    if (rUser.amount < amountb) throw new Error("Insufficient balance");
    if (BId === req.user.user._id)
      throw new Error("Cannot transfer to the same account");

    await Promise.all([
      Account.updateOne(
        { _id: rUser._id },
        { $inc: { amount: -amountb } },
        { new: true }
      ).session(session),
      Account.updateOne(
        { user: BId },
        { $inc: { amount: amountb } },
        { new: true }
      ).session(session),
      
    ]);
    
    session.commitTransaction()
    res.json({ status: "Transaction successful"});
  } catch (error) {
    await session.abortTransaction()
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
  finally{
    await session.endSession() 
  }
}