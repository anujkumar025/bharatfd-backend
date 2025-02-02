// import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const JWT_PASSWORD = process.env.JWT_PASSWORD;

if (!JWT_PASSWORD) {
    throw new Error("JWT_PASSWORD is not defined in environment variables.");
}


export const userMiddleware = (req, res, next) => {
    next();
    // const header = req.headers["authorization"];
    // const decoded = jwt.verify(header, JWT_PASSWORD);

    // if(decoded){
    //     console.log(`logger ${decoded}`);
    //     req.userId = decoded.id;
    // }else{
    //     res.status(403).json({
    //         message: "You are not logged in."
    //     })
    // }
}