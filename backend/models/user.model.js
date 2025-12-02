import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobile: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'owner', "deliveryBoy"],  // enum is used to restrict the value to a set of predefined values
        required: true
    },
    resetOtp: {
        type: String,

    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date
    },
    socketId:{
        type: String,
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    }

}, { timestamps: true });

// In the form of key-value pair ( it means that the location field will store geographical data in 2dsphere format)
userSchema.index({ location: "2dsphere" });  // used to tell mongoose that location field will store geographical  data



const User = mongoose.model('User', userSchema);
export default User;


