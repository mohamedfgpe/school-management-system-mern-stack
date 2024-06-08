

import mongoose from "mongoose";

export function connection() {
    mongoose
      .connect(process.env.DATABASE)
      .then(() => console.log("db connected"))
      .catch((err) => console.log("db err",err));

}

