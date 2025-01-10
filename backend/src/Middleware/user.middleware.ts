import { error } from "console";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Replace `any` with a specific type if you know the structure of the decoded token
  }
}

export const authSignMiddle = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.cookies?.access_token
      ? req.cookies?.access_token
      : req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : undefined;
    if (!user) {
      throw new Error("UnAuthorized request ");
    }
    if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
      res.status(500).json({ status: "Server Error" });
      throw new Error("Internal error");
    }

    const vUser = jwt.verify(user, process.env.JWT_ACCESS_TOKEN_SECRET);
    req.user = vUser;
    next();
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Unknown Error occurred";
    res.status(500).json({
      error: msg,
    });
  }
};
