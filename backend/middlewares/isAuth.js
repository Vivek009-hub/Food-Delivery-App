//  we are making this for current user ( cookie header me hmara user hota hai vha se leke aaynge usko hmm)

import jwt, { decode } from "jsonwebtoken"

const isAuth = async (req,res,next)=>{
    try {
     const token = req.cookies.token
     if(!token){
        return res.status(400).json({message:"token not found"})
     }

    //   abb jwt me se apni id find krnge
    const decodeToken = jwt.verify(token,process.env.JWT_SECRET)
    if(!decodeToken){
        return res.status(400).json({message:"token not verify"})
    }
    // console.log(decodeToken)
    req.userId = decodeToken.userId
    next()
    } catch (error) {
        return res.status(500).json({message:"isAuth Error"})
        
    }
}

export default isAuth