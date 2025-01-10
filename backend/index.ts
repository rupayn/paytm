import "dotenv/config"
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

import userRouter from "./src/Routes/user.routes.js"
import accountRouter from "./src/Routes/account.routes.js"
import { connectDb } from "./src/Utils/db.js";
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const port = process.env.PORT || 8080;

const url = `${process.env.MONGOOSE_URL}`;
connectDb(url);
app.use("/user",userRouter)
app.use("/account",accountRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
