import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const result = await cloudinary.uploader.upload(file)
        fs.unlinkSync(file)    // iske baad jaise hi vo file cloudinary pr upload jo jygi orr hme safe url mil jyga to automatically multer se delete ho jygi 

        return result.secure_url  // This will give us that secure url from cloudinary

    } catch (error) {
        fs.unlinkSync(file)
        console.log(error)
    }
}

export default uploadOnCloudinary