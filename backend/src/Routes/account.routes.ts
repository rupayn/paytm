import express from "express";
import { updatePin, setupAndCheckAccount, transaction } from "../Controllers";
import { authSignMiddle } from "../Middleware/user.middleware";

const router = express.Router();

router.post('/setup-check-balance',authSignMiddle,setupAndCheckAccount)
router.put("/update-pin", authSignMiddle, updatePin);
router.put("/transaction", authSignMiddle, transaction);


export default router
