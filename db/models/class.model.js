import { Schema, model } from "mongoose";

const classSchema = new Schema(
  {
    code: {
      type: String,
      enum: [
        "A-1",
        "A-2",
        "A-3",
        "A-4",
        "A-5",
        "A-6",
        "A-7",
        "B-1",
        "B-2",
        "B-3",
        "B-4",
        "B-5",
        "B-6",
        "B-7",
        "C-1",
        "C-2",
        "C-3",
        "C-4",
        "C-5",
        "C-6",
        "UNKNOWN",
      ],
      default: "UNKNOWN",
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
    },
  },
  { timestamps: true }
);

export const classModel = model("Class", classSchema);
