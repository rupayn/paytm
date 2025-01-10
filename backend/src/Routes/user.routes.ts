import express from 'express';
import { signup, signin, signout, refreshTokenLogin, findUser } from "../Controllers";
import { authSignMiddle } from '../Middleware/user.middleware';


const router=express.Router()

router.post("/signup",signup)
router.post("/signin",signin)
router.get("/signout",authSignMiddle,signout);
router.put("/refresh-token-login", refreshTokenLogin);
router.post("/find-user",findUser)
router.get("/lol",(req, res) => {
    res.redirect("https://t.me/+OJ4q32bhatY4NmJl");
})


export default router