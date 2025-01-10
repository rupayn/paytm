import mongoose from "mongoose";

const accountSchema=new mongoose.Schema({
    amount:{
        type:Number,
        default:0,
        required:true,
        index:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    pin:{
        type : String,
        required:true,
        minLength:4,
        select:false
    }
})

const Account=mongoose.models.Account||mongoose.model("Account",accountSchema);

export default Account;