import { Schema, model } from "mongoose";

const actionOnSpecailStudentSchema=new Schema({
    special_student: { type: Schema.Types.ObjectId, ref: 'SpecialStudent' },
    addBy:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    title:{
        type:String,
        enum:["none","super"],
        default:"none"
    },
})

export const actionOnSpecailStudentModel=model('ActionOnSpecailStudent',actionOnSpecailStudentSchema);