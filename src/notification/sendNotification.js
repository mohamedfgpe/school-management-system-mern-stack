import twilio from "twilio";
import  nodemailer  from 'nodemailer';
// Configure nodemailer with your email service provider's details
const transporter = nodemailer.createTransport({
    service: "gmail", // Use the email service you prefer
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });
  
  // High-performance function to send email
  export const sendEmail = async ({ to, subject, text }) => {
    try {
      // Send mail with defined transport object
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: Array.isArray(to) ? to.join(", ") : to, // Handle multiple recipients
        subject,
        text,
      });
  
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  };





// Configure Twilio with your account SID, auth token, and Twilio phone number
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(accountSid, authToken);

// High-performance function to send WhatsApp message
export const sendWhatsAppMessage = async ({ to, text }) => {
  try {
    const message = await twilioClient.messages.create({
      body: text,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`,
    });

    console.log(`WhatsApp message sent successfully. Message SID: ${message.sid}`);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw new Error("Failed to send WhatsApp message");
  }
};