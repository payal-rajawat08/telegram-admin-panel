import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("database connected succesfully");
    }catch(error){
        console.log("connection failed",error);
    }
};
export default connectDB;