import { Schema, model } from "mongoose";

const specialStudentSchema = new Schema(
  {
    competitionName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    level: {
      type: String,
      enum: [
        "First (1st)",
        "Second (2nd)",
        "Third (3rd)",
        "Fourth (4th)",
        "Fifth (5th)",
        "Sixth (6th)",
        "Seventh (7th)",
        "Eighth (8th)",
        "Ninth (9th)",
        "Tenth (10th)",
        "none"
      ],
      default: "none",
      required:true
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true }
);


export const specialStudentModel=model('SpecialStudent',specialStudentSchema);