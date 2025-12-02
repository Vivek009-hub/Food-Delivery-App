import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import genToken from "../utils/token.js";
import {sendOtpMail} from "../utils/mail.js";

export const signUp=async (req, res) => {
    try {
        const {fullName, email, password,mobile,role} = req.body;

        let user = await User.findOne({email});   
        if(user){
            return res.status(400).json({message: "User already exists"});
        } 

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
        if(mobile.length < 10){
            return res.status(400).json({message: "Mobile number must be at least 10 digits"});
        }


        const hashedPassword = await bcrypt.hash(password,12);

        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword,
        })

        const token = await genToken(user._id);
        //  Now we have to pass this token in the cookie
        res.cookie("token",token,{
            secure:true,
            sameSite:"none",
            maxAge: 7*24*60*60*1000, // 7 days
            httpOnly:true,
        })

        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({message: `SignUp Error: ${error}`});
    }
}

export const signIn=async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});   
        if(!user){
            return res.status(400).json({message: "User does not exists"});
        } 

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }


        const token = await genToken(user._id);
        //  Now we have to pass this token in the cookie
        res.cookie("token",token,{
            secure:true,
            sameSite:"none",
            maxAge: 7*24*60*60*1000, // 7 days
            httpOnly:true,
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({message: `SignIn Error: ${error}`});
    }
}

export const signOut=async (req,res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({message: "Signout successful"});
    } catch (error) {
        return res.status(500).json({message: `SignOut Error: ${error}`});
    }
}

export const sendOtp=async(req,res)=>{
    try {
        const {email}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User does not exist"});
        }

        // Generate OTP
        const otp=Math.floor(1000 + Math.random()*9000).toString();
        user.resetOtp=otp;
        user.otpExpires=new Date(Date.now()+5*60*1000); // OTP expires in 10 minutes
        user.isOtpVerified=false;
        await user.save();

        // Send OTP to user's email
        await  sendOtpMail(email,otp);
        return res.status(200).json({message:"OTP sent to your email"});
    } catch (error) {
        return res.status(500).json({message: `Send OTP Error: ${error}`});
        
    }
}

export const verifyOtp=async(req,res)=>{
    try {
        const {email,otp}=req.body;
        const user=await User.findOne({email});
        if(!user || user.resetOtp !== otp || user.otpExpires < new Date()){
            return res.status(400).json({message:"invalid/expires OTP"});
        }
        user.isOtpVerified=true;
        user.resetOtp=undefined;
        user.otpExpires=undefined;
        await user.save();
        return res.status(200).json({message:"OTP verified successfully"});
    } catch (error) {
        return res.status(500).json({message: `Verify OTP Error: ${error}`});
    }
}

export const resetPassword=async(req,res)=>{
    try {
        const{email,newPassword}=req.body;
        const user = await User.findOne({email});
        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"User not found or OTP not verified"});
        }

        const hashedPassword = await bcrypt.hash(newPassword,12);
        user.password=hashedPassword;
        user.isOtpVerified=false;
        await user.save();
        return res.status(200).json({message:"Password reset successful"});
    } catch (error) {
        return res.status(500).json({message: `Reset Password Error: ${error}`});
    }
}

export const googleAuth=async(req,res)=>{
    try {
        const {email,fullName,mobile,role} = req.body;
        let user=await User.findOne({email});
        if(!user){
            user=await User.create({
                fullName,email,mobile,role
            })
        }

        const token = await genToken(user._id);
        //  Now we have to pass this token in the cookie
        res.cookie("token",token,{
            secure:true,
            sameSite:"none",
            maxAge: 7*24*60*60*1000, // 7 days
            httpOnly:true,
        })

         // 🔥 Send response back
        return res.status(200).json({ 
            message: "Google Auth successful", 
            user 
        });

    } catch (error) {
        return res.status(500).json({message: `Google Auth Error: ${error}`});
    }
}
