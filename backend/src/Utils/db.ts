import mongoose from "mongoose";

export const connectDb=async(url:string)=>{
    try {
        await mongoose.connect(url);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error connecting DB in UTIls: \n\n",error)
    }
   
}