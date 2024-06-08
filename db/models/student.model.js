import { Schema, model } from "mongoose";

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
  },
  phoneNumber: {
    type: Number,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
});


export const studentModel= model('Student', studentSchema);
