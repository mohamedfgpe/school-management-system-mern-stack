import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [3, "name is too short"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: [4, "password is too short"],
      maxLength: [100, "password is too long"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      required: true,
    },
    subject :{
      type:String,
      enum :['Technical', 'Culture','Manager'],
      default:'Cultural'
    },
    role:{
      type:String,
      enum:['Admin', 'SoftSkills',"SuperSoftSkills",'Teacher','rootAdmin'],
      default:'Teacher'
    },
    phoneNum:{
      type:Number,
      required:true,
      
    }
    
  },
  {
    timestamps: true,
  }
);

export const userModel = model("User", userSchema);
