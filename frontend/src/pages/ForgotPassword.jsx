import React from 'react'
import { useState } from 'react';
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '../App'

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [err, setErr] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)


    const handleSendOtp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverURL}/api/auth/send-otp`, { email }, { withCredentials: true });

            console.log(result);
            setErr("");
            setLoading(false)
            setStep(2);
        } catch (error) {
            setErr(error?.response?.data?.message);
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)

        try {
            const result = await axios.post(`${serverURL}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });

            console.log(result);
            setErr("");
            setLoading(false)
            setStep(3);
        } catch (error) {
            setErr(error?.response?.data?.message);
            setLoading(false)

        }
    }


    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        setLoading(true)

        try {

            const result = await axios.post(`${serverURL}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });

            console.log(result);
            setErr("");
            setLoading(false)

            navigate('/signin');
        } catch (error) {
            setErr(error?.response?.data?.message);
            setLoading(false)

        }
    }



    return (
        <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
            <div className="bg-white
       rounded-xl shadow-lg w-full max-w-md p-8">
                <div className='flex items-center gap-4 mb-4'>
                    <IoArrowBackSharp size={30} className='text-[#ff4d2d]' onClick={() => navigate('/signin')} />

                    <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Forgot Password</h1>

                </div>

                {step == 1 &&
                    <div>
                        <div className='mb-6'>
                            <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                            <input type="email" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' placeholder='Enter your Email' style={{

                            }}
                                onChange={(e) => setEmail(e.target.value)}
                                value={email} required

                            />

                        </div>


                        <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} onClick={handleSendOtp} disabled={loading}>

                            {loading ? <ClipLoader size={20} color='white' /> : "Send OTP"}

                        </button>


                        {err &&
                            <p className='text-red-500 text-center  my-[10px]'>*{err}</p>}
                    </div>}



                {step == 2 &&
                    <div>
                        <div className='mb-6'>
                            <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>OTP</label>
                            <input type="email" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' placeholder='Enter OTP' style={{
                            }}
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp} required
                            />

                        </div>


                        <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} onClick={handleVerifyOtp} disabled={loading} >                    {loading ? <ClipLoader size={20} color='white' /> : "Verify OTP"}
                        </button>


                        {err &&
                            <p className='text-red-500 text-center  my-[10px]'>*{err}</p>}
                    </div>}



                {step == 3 &&
                    <div>
                        <div className='mb-6'>
                            <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1'>New Password</label>
                            <input type="email" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' placeholder='Enter New Password' style={{
                            }}
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword} required
                            />

                        </div>

                        <div className='mb-6'>
                            <label htmlFor="ConfirmPassword" className='block text-gray-700 font-medium mb-1'>Confirm Password</label>
                            <input type="email" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' placeholder='Confirm Password' style={{
                            }}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword} required
                            />

                        </div>


                        <button className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} onClick={handleResetPassword}   >

                            {loading ? <ClipLoader size={20} color='white' /> : "Reset Password"}

                        </button>

                        {err &&
                            <p className='text-red-500 text-center  my-[10px]'>*{err}</p>}
                    </div>
                }


            </div>
        </div>
    )
}

export default ForgotPassword
