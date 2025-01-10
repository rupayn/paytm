import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import userModel from "../../Models/user.models";
import jwt from "jsonwebtoken";

import { confEnv } from "../../Utils/config.env";

export async function signup(req: Request, res: Response) {
  try {
    if (!process.env.SLT) res.status(500).json({ error: "internalError" });
    else {
      const { fristname, username, lastname, password } = req.body;
      const existUser = await userModel.findOne({ username });
      if (existUser) {
        throw new Error("user already exist");
      } else {
        const nPass = await bcrypt.hash(password, parseInt(process.env.SLT));
  
        let user = await userModel.create({
          username,
          fristname,
          lastname,
          password: nPass,
        });
        user = await user.toObject();
        delete user.password;
  
        if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
          throw new Error("internal error");
        }
        
        if (!process.env.JWT_REFRESH_TOKEN_SECRET){
          throw new Error("internal error");
        }
          const refreshToken = jwt.sign(
            { user },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            {
              expiresIn: "5d",
            }
          );
        const accessToken = jwt.sign(
          { user },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1h",
          }
        );
  
        user = await userModel.findByIdAndUpdate(user._id, {
          $set: { refreshtoken: refreshToken },
        });
  
        user = user.toObject();
        res
          .cookie("access_token", accessToken, {
            httpOnly: true,
            secure: true,
          })
          .cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
          })
          .json({ user, accessToken, refreshToken });
      }
    }
  } catch (error) {
    const msg = error instanceof Error? error.message : "Unknown Error";
    res.status(500).json({error:msg});
  }
}
export async function signin(req: Request, res: Response, next: NextFunction) {
  //  let b= req.headers.authorization
  try {
    const { username, password } = req.body;
    let user = await userModel.findOne({ username }).select("+password");
    if (!user) {
      throw new Error("User not found");
    }
    const vP = await bcrypt.compare(password, user.password);
    if (!vP) {
      throw new Error("unauthorized request,invalid password");
    }
    if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
      throw new Error("internal error");
    }
    let tempUser={
      u:user.toObject()
    }
    delete tempUser.u["password"]
    tempUser = tempUser.u;
    const refreshToken = jwt.sign(
      { user:tempUser },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: "5d",
      }
    );
    user.refreshtoken= refreshToken;
    await user.save()
    user = user.toObject();
    delete user["password"];
    delete user["refreshtoken"];

    if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
      res.status(500).json({ status: "internal error" });
      throw new Error("Internal error");
    }
    const accessToken = jwt.sign(
      { user },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ user, accessToken, refreshToken });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown Error";
    res.status(500).json({ error: msg });
  }
}
export async function signout(req: Request, res: Response) {
  try {
    await userModel.findByIdAndUpdate(req.user.user._id, {
      $set: { refreshtoken: "" },
    });
    console.log(req.user.user);
    
    res.clearCookie("access_token").clearCookie("refresh_token").json({status:"Log out successfully"});
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown Error";
    res.status(500).json({ error: msg });
  }
}

export async function refreshTokenLogin(req: Request, res: Response) {
  try {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
      throw new Error("No refresh token provided");
    }
    let inComingRT = jwt.verify(
      refresh_token,
      confEnv.JWT_REFRESH_TOKEN_SECRET
    ) as {
      user: {
        fristname: String;
        username: String;
        lastname: String;
        _id: String;
        __v: Number;
      };
    };
    if (!inComingRT) {
      throw new Error("Invalid refresh token");
    }
    const id = inComingRT.user._id.toString();
    const user = await userModel.findById(id).select("+refreshtoken");
    if (refresh_token !== user.refreshtoken)
      throw new Error("Invalid refresh token");
    if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
      res.status(500).json({ status: "internal error" });
      throw new Error("Internal error");
    }
    const accessToken = jwt.sign(
      { user },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("access_token", accessToken).json({ inComingRT: user });
  }catch(error) {
    const msg = error instanceof Error ? error.message : "Unknown Error";
    res.status(500).json({ error: msg });
  }
}

export async function findUser(req:Request,res:Response,next:NextFunction){
  const inputF=req.query.inputF||"";
  const user =await userModel.find({
    $or: [
      {
        fristname: {
          $regex: inputF,
        },
      },
      {
        username: {
          $regex: inputF,
        },
      },
      {
        lastname: {
          $regex: inputF,
        }
      },
    ],
  });

  if (!user) {
    res.json({status:"user not found"})
    return
  }
  res.json({
    user
  })

}