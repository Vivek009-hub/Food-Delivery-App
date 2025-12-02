import mongoose from "mongoose"

const shopSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,   //used for refercing models to any other model(just to prevent writing agian)
        ref:"User" ,            // here owner schema is refering to user bcoz its obvious owner is also one of our user
        required:true
    },
    city:{
        type:String,
        required:true
    },
     state:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item"
    }]
},{timestamps:true})




const Shop=mongoose.model("Shop",shopSchema)
export default Shop