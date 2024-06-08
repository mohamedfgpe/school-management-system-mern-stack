import { Schema, model } from "mongoose";

const problemSchem= new Schema({
    studentId:{
        type:Schema.Types.ObjectId,
        ref:"Student",
        required:true
        
    },
    description:{
        type:String,
    
    },
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    problemType:{
        type: String,  
        required:true
    }

},{timestamps:true})

export const problemModel=model("Problem", problemSchem)