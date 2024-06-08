import { Schema, model } from "mongoose";

const studentAbsenceSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    reason: {
      type: String,
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

export  const StudentAbsencesModel = model("StudentAbsence", studentAbsenceSchema);