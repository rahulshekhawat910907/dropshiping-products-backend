const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{
          type:String,
           required:true
    },
    phone:{
        type:Number,
        trim:true,
        unique:true,
        required:true
    },
    role:{
        type:String,
        enum:["user" , "admin"],
        default : "user"
    }
} , {timestamps:true})

module.exports = mongoose.model("User" , userSchema)