import { Schema, model } from "mongoose";

const gradeSchema= new Schema ({
    level:{
        type: String,
        enum: ["grade one","grade two","grade three","UNKNOWN"],
        default: "UNKNOWN",
        trim:true

    }
},{timestamps:true});


export const  gradeModel =  model("Grade",gradeSchema);