import dotenv from "dotenv";
import cors from 'cors';
import express from "express";
import { connection } from "./db/connection.js";
import userRoutes from "./src/modules/user/user.routes.js";
import { globalError } from "./src/utils/globalErrorHandle.js";
import { classRouter } from "./src/modules/class/class.routes.js";
import { studentRouter } from "./src/modules/student/student.routes.js";
import { problemRouter } from "./src/modules/problem/problem.routes.js";
import { actionOnProblemRouter } from "./src/modules/actionOnProblem/actionOnProblem.routes.js";
import { specialStudentRouter } from "./src/modules/specialStudent/specialStudent.routes.js";
import { studentAbsenceRouter } from "./src/modules/studentAbsence/studentAbsence.routes.js";
import { gradeRouter } from "./src/modules/grade/grade.routes.js";
const app = express();
app.use(cors());
const port = 3000;
app.use(express.json());

dotenv.config({});

connection();
app.use("/api/v1/actionOnProblem", actionOnProblemRouter);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/student",specialStudentRouter)
app.use("/api/v1/student",studentAbsenceRouter);
app.use("/api/v1/class", classRouter);
app.use("/api/v1/problem", problemRouter);
app.use("/api/v1/grade", gradeRouter);


app.get("/", (req, res) => res.send("Hello World!"));

app.use("*", (req, res, next) => {
  res.json({ err: `invaild url   ${req.originalUrl}` });
  // next(new AppError(`invaild url =>>  ${req.originalUrl}`, 404));
});

// Global error handle

app.use(globalError);

// 100-199
// 200-299
// 300-399
// 400-499
// 500-599

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
