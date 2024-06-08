import { Schema, model } from "mongoose";

const actionOnProblemSchema=new Schema({
    problemId:{
        type:Schema.Types.ObjectId,
        ref:"Problem",  
    },
    action:{
        type:String,
        required:true
    },
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})

export const actionOnProblemModel =model("ActionOnProblem", actionOnProblemSchema) ;