import jwt from "jsonwebtoken";
import { BiEqualizer } from "react-icons/bi";
const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).json({
            message:"Authentication token required"
        });
    }
    const token = authHeader.split(" ")[1];
    if(!token){
        res.status(401).json({
            message:"Invalid authorization header"
        });
    }
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin=decoded;
    next();
} catch (error) {
    return res.status(401).json({
        message: "Invalid or expired token"
    });
}

};
export default authMiddleware;