import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemplate.js";

export async function sendEmail(options) {
  // const transporter = nodemailer.createTransport({
  //   service: "outlook",
  //   auth: {
  //     // TODO: replace `user` and `pass` values from <https://forwardemail.net>
  //     user: process.env.OUTLOOK_EMAIL,
  //     pass: process.env.OUTLOOK_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `New Registration" <${process.env.GMAIL_EMAIL}>`, // sender address
    to: process.env.MANAGER_EMAIL, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: emailTemplate({ api: options.api , name:options.name, email:options.email}), // html body
  });

  console.log("Message sent: %s", info.messageId);
}
