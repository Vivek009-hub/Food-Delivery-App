import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASS, // generated ethereal password
  },
});

export const sendOtpMail =async(to,otp)=>{
    await transporter.sendMail({
        from: `"Foody 👻" <${process.env.EMAIL}>`, // sender address
        to,
        subject: "Reset Password OTP", // Subject line
        html: `<b>Your OTP for password reset is ${otp}. It is valid for 5 minutes</b>`, // html body  
    })
}

export const sendDeliveryOtpMail =async(user,otp)=>{
    await transporter.sendMail({
        from: `"Foody 👻" <${process.env.EMAIL}>`, // sender address
        to:user.email,
        subject: "Delivery OTP", // Subject line
        html: `<b>Your OTP for delivery is ${otp}. It is valid for 5 minutes</b>`, // html body  
    })
}