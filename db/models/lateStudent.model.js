import { Schema, model } from "mongoose";

const lateStudentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    reason: {
      type: String,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    isExcused: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const LateStudentModel = model("LateStudent", lateStudentSchema);

export default LateStudentModel;
