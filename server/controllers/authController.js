import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const registerAdmin= async (req,res) =>{
    const {email,password}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    const admin = new Admin({
        email,
        password:hashedPassword
    });
    // mongodb mai save kar raha hai 
    await admin.save();
    res.status(201).json({
        message:"adim register successfull"
    });
    };
const loginAdmin = async (req,res) =>{
    const {email,password}=req.body;
    const admin = await Admin.findOne({email});
    if(!admin){
        return res.status(401).json({
            message:"Invalid email or password"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(password,admin.password);
    if(!isPasswordCorrect){
        return res.status(401).json({
            message:"Invalid email or password"
        });
    }
    const token = jwt.sign(
        {id:admin._id},
        process.env.JWT_SECRET,
        {expiresIn: "1d" }
    );
    res.status(200).json({
        message:"Login successfull",
        token
    });
    };
    export { registerAdmin, loginAdmin };
